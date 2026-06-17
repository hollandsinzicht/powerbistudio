import { NextResponse } from 'next/server'
import {
  runCampaign,
  buildIdeaStage,
  buildBlogStage,
  regenerateSeriesPost,
} from '@/lib/campaign-orchestrator'
import {
  createCampaign,
  getCampaign,
  listCampaigns,
  updateCampaign,
  type Campaign,
  type CampaignStages,
} from '@/lib/campaign-store'
import { schedulePost, getNextAvailableScheduleDate } from '@/lib/blog-store'
import { ensureSeedAudiences, listAudiences, getAudienceByKey } from '@/lib/audience-store'
import { getBrand } from '@/lib/brands'

// De idee→blog→LinkedIn-keten doet meerdere Claude-calls achter elkaar; ruim
// boven de default Vercel-timeout. Zelfde maxDuration als de bestaande
// blog-generate-route.
export const maxDuration = 300
export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD /* fail-closed: geen 'admin'-fallback */

function checkAuth(req: Request): boolean {
  return req.headers.get('x-admin-token') === ADMIN_PASSWORD
}

type StageKey = 'idea' | 'blog' | 'linkedin'

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action } = body as { action?: string }

    // --- RUN: genereer-alles-dan-review ------------------------------------
    if (action === 'run') {
      const { brand, seed, ideaId, audiences } = body as {
        brand?: string
        seed?: string
        ideaId?: string
        audiences?: unknown
      }
      const requestedKeys = Array.isArray(audiences)
        ? audiences.filter((k): k is string => typeof k === 'string')
        : []
      if (requestedKeys.length === 0) {
        return NextResponse.json({ error: 'Kies minstens één doelgroep' }, { status: 400 })
      }

      // Resolve de gekozen keys naar volledige doelgroep-records uit de DB.
      await ensureSeedAudiences()
      const all = await listAudiences()
      const resolved = requestedKeys
        .map((k) => all.find((a) => a.key === k))
        .filter((a): a is NonNullable<typeof a> => a != null)
      if (resolved.length === 0) {
        return NextResponse.json({ error: 'Geen geldige doelgroepen gekozen' }, { status: 400 })
      }

      const result = await runCampaign({ brand, seed, ideaId, audiences: resolved })
      const id = await createCampaign({
        brand: result.brand,
        seed: result.seed,
        stages: result.stages,
        blogPostId: result.blogPostId,
      })
      const campaign = await getCampaign(id)
      return NextResponse.json({ success: true, campaign })
    }

    // Vanaf hier: een bestaande campagne muteren.
    const { campaignId } = body as { campaignId?: string }
    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is verplicht' }, { status: 400 })
    }
    const campaign = await getCampaign(campaignId)
    if (!campaign) {
      return NextResponse.json({ error: 'Campagne niet gevonden' }, { status: 404 })
    }
    const stages: CampaignStages = campaign.stages

    // --- REGENERATE één stap ----------------------------------------------
    if (action === 'regenerate-stage') {
      const { stage, index } = body as { stage?: StageKey; index?: number }

      if (stage === 'idea') {
        stages.idea = await buildIdeaStage({ seed: campaign.seed ?? undefined })
      } else if (stage === 'blog') {
        if (!stages.idea.output) {
          return NextResponse.json({ error: 'Geen idee om blog uit te schrijven' }, { status: 400 })
        }
        const built = await buildBlogStage(stages.idea.output)
        stages.blog = { output: built.output, approved: built.approved, error: built.error }
        if (built.output) await updateCampaign(campaignId, { blog_post_id: built.output.postId })
      } else if (stage === 'linkedin') {
        if (typeof index !== 'number') {
          return NextResponse.json({ error: 'index verplicht' }, { status: 400 })
        }
        if (!campaign.blog_post_id) {
          return NextResponse.json({ error: 'Nog geen blogconcept' }, { status: 400 })
        }
        const existing = stages.linkedin.find((p) => p.index === index)
        if (!existing) return NextResponse.json({ error: 'Post niet gevonden' }, { status: 404 })
        // Behoud de doelgroep van de bestaande post; verstuur 'm opnieuw.
        const audience = await getAudienceByKey(existing.audienceKey)
        if (!audience) {
          return NextResponse.json({ error: 'Doelgroep niet gevonden' }, { status: 404 })
        }
        const post = await regenerateSeriesPost({
          brandId: getBrand(campaign.brand).id,
          index,
          audience,
          blogPostId: campaign.blog_post_id,
        })
        // Behoud de eerder voorgestelde plaatsingsdatum.
        post.plannenOp = existing.plannenOp
        const i = stages.linkedin.findIndex((p) => p.index === index)
        if (i >= 0) stages.linkedin[i] = post
        else stages.linkedin.push(post)
      } else {
        return NextResponse.json({ error: 'Onbekende stap' }, { status: 400 })
      }

      await updateCampaign(campaignId, { stages })
      return NextResponse.json({ success: true, campaign: await getCampaign(campaignId) })
    }

    // --- APPROVE / un-approve een stap ------------------------------------
    if (action === 'approve-stage') {
      const { stage, index, approved } = body as {
        stage?: StageKey
        index?: number
        approved?: boolean
      }
      const value = approved !== false // default true

      if (stage === 'linkedin') {
        const post = stages.linkedin.find((p) => p.index === index)
        if (!post) return NextResponse.json({ error: 'Post niet gevonden' }, { status: 404 })
        post.approved = value
      } else if (stage === 'idea' || stage === 'blog') {
        stages[stage].approved = value
      } else {
        return NextResponse.json({ error: 'Onbekende stap' }, { status: 400 })
      }

      await updateCampaign(campaignId, { stages })
      return NextResponse.json({ success: true, campaign: await getCampaign(campaignId) })
    }

    // --- EDIT een stap (handmatige aanpassing) ----------------------------
    if (action === 'edit-stage') {
      const { stage, index, patch } = body as {
        stage?: StageKey
        index?: number
        patch?: Record<string, unknown>
      }
      if (!patch || typeof patch !== 'object') {
        return NextResponse.json({ error: 'patch is verplicht' }, { status: 400 })
      }

      if (stage === 'linkedin') {
        const post = stages.linkedin.find((p) => p.index === index)
        if (!post) return NextResponse.json({ error: 'Post niet gevonden' }, { status: 404 })
        if (typeof patch.postText === 'string') post.postText = patch.postText
        if (Array.isArray(patch.hashtags)) post.hashtags = patch.hashtags as string[]
        if (typeof patch.plannenOp === 'string') post.plannenOp = patch.plannenOp
        post.edited = true
      } else if (stage === 'idea' || stage === 'blog') {
        const s = stages[stage]
        if (s.output) {
          s.output = { ...s.output, ...patch } as typeof s.output
          s.edited = true
        }
      } else {
        return NextResponse.json({ error: 'Onbekende stap' }, { status: 400 })
      }

      await updateCampaign(campaignId, { stages })
      return NextResponse.json({ success: true, campaign: await getCampaign(campaignId) })
    }

    // --- SET-INGEPLAND: persoonlijk vinkje ("posts ingepland/geplaatst") ---
    if (action === 'set-ingepland') {
      const { ingepland } = body as { ingepland?: boolean }
      await updateCampaign(campaignId, { ingepland: ingepland === true })
      return NextResponse.json({ success: true, campaign: await getCampaign(campaignId) })
    }

    // --- PUBLISH: blogconcept inplannen -----------------------------------
    if (action === 'publish') {
      if (!stages.blog.approved || !campaign.blog_post_id) {
        return NextResponse.json(
          { error: 'Keur eerst het blogconcept goed voordat je inplant' },
          { status: 400 }
        )
      }
      const scheduledFor = await getNextAvailableScheduleDate()
      await schedulePost(campaign.blog_post_id, scheduledFor)
      await updateCampaign(campaignId, { status: 'scheduled' })
      return NextResponse.json({
        success: true,
        scheduledFor,
        campaign: await getCampaign(campaignId),
      })
    }

    return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 })
  } catch (error) {
    console.error('Campaign route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

// Lijst recente campagnes (voor de tab bij laden).
export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const campaigns: Campaign[] = await listCampaigns(20)
    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Campaign list error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
