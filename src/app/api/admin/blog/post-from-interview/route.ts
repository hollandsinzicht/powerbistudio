import { NextResponse } from 'next/server'
import {
  generatePostFromInterview,
  defaultStyleForCategory,
  type FunnelStage,
  type LinkedInStyle,
  type InterviewTurn,
} from '@/lib/linkedin-writer'
import { getBrand, getBrandCategory } from '@/lib/brands'
import { getBrandAnswers } from '@/lib/brand-profile-store'
import { buildBrandContext } from '@/lib/brand-context'
import { ensureSeedPosts, getRecentPosts, savePost } from '@/lib/linkedin-posts-store'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

function checkAuth(req: Request): boolean {
  return req.headers.get('x-admin-token') === ADMIN_PASSWORD
}

const VALID_FUNNELS: FunnelStage[] = ['tofu', 'mofu', 'bofu']
const VALID_STYLES: LinkedInStyle[] = ['educatief', 'scherp', 'provocatief', 'storytelling']

interface PostFromInterviewBody {
  brand?: string
  funnelStage?: FunnelStage
  categoryId?: string
  topic?: string
  style?: LinkedInStyle
  interview?: InterviewTurn[]
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as PostFromInterviewBody
    const { funnelStage, categoryId, topic } = body
    const interview = Array.isArray(body.interview) ? body.interview : []

    if (!funnelStage || !VALID_FUNNELS.includes(funnelStage)) {
      return NextResponse.json(
        { error: `funnelStage is verplicht en moet één van: ${VALID_FUNNELS.join(', ')}` },
        { status: 400 }
      )
    }

    // Brand bepalen (valt terug op power-bi-studio) en categorie valideren tegen
    // de brand-registry i.p.v. een vaste union.
    const brand = getBrand(body.brand)
    const category = categoryId ? getBrandCategory(brand, categoryId) : undefined
    if (!category) {
      return NextResponse.json(
        {
          error: `categoryId is verplicht en moet één van: ${brand.categories
            .map((c) => c.id)
            .join(', ')}`,
        },
        { status: 400 }
      )
    }
    if (!topic?.trim()) {
      return NextResponse.json({ error: 'onderwerp is verplicht' }, { status: 400 })
    }

    // Stijl: expliciet meegegeven (indien geldig) óf de default voor de categorie.
    const style =
      body.style && VALID_STYLES.includes(body.style)
        ? body.style
        : defaultStyleForCategory(brand, category.id)

    // Postgeheugen: zorg dat de seeds er staan, lees daarna de recente posts als
    // anti-herhaling-context voor de funnel/categorie-doorloop (per brand).
    await ensureSeedPosts()
    const recent = await getRecentPosts(brand.id, 8)
    const recentPosts = recent.map((p) => ({
      category: p.category,
      funnel_stage: p.funnel_stage,
      post_text: p.post_text,
    }))

    // Injecteer het door JW opgebouwde merkprofiel; leeg → brand.fallbackPersona.
    const brandContext = buildBrandContext(await getBrandAnswers(brand.id), brand)

    const result = await generatePostFromInterview({
      brand,
      funnelStage,
      categoryId: category.id,
      topic: topic.trim(),
      style,
      interview,
      brandContext,
      recentPosts,
    })

    // Bewaar de nieuwe post in het geheugen, zodat de volgende generatie erop voortbouwt.
    await savePost({
      brand: brand.id,
      postText: result.postText,
      hashtags: result.hashtags,
      funnelStage,
      category: category.id,
      style,
      topic: topic.trim(),
      interview,
    })

    return NextResponse.json({
      success: true,
      postText: result.postText,
      hashtags: result.hashtags,
      usage: result.usage,
    })
  } catch (error) {
    console.error('Post from interview error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
