// ============================================================================
// Campagne-orkestrator
// ----------------------------------------------------------------------------
// Knoopt de bestaande, losse marketing-stappen aan elkaar tot één flow:
//   idee → blogconcept → LinkedIn-variant per doelgroep → nurture-voorstel.
// Modus: "genereer-alles-dan-review". Elke stap is afgeschermd met try/catch;
// een mislukte stap degradeert naar { output: null, error } en stopt de flow
// NIET (zelfde non-blocking patroon als de bestaande image-generatie).
//
// HARDE GRENS (= de merkbelofte): deze orkestrator raakt UITSLUITEND
// marketing-content aan — blog_posts, linkedin_posts (geheugen) en het
// nurture-*voorstel*. Hij leest GEEN klant-HR-data, GEEN studio_*-modellen en
// GEEN lead-PII, en hij VERSTUURT niets. Het daadwerkelijk versturen van
// nurture-mails blijft in de bestaande cron (/api/cron/nurture) met eigen
// opt-in-logica. Voeg hier nooit reads van klantdata toe.
// ============================================================================

import { generateBlogIdeas, generateBlogPost } from './blog-writer'
import { generateBlogImage } from './blog-image-generator'
import {
  createPost,
  updatePost,
  getPublishedPosts,
  getPostById,
  getIdeaById,
  updateIdeaStatus,
} from './blog-store'
import { isValidArchetype, type BlogArchetype } from './blog-archetypes'
import { generateLinkedInPost } from './linkedin-writer'
import { savePost, getRecentPosts } from './linkedin-posts-store'
import { getBrand, type BrandId } from './brands'
import { getBrandAnswers } from './brand-profile-store'
import { buildBrandContext } from './brand-context'
import { NURTURE_SEQUENCES } from './nurture-sequences'
import { type Audience } from './audiences'
import type {
  CampaignStages,
  IdeaStageOutput,
  BlogStageOutput,
  LinkedInVariant,
  NurtureStageOutput,
  StageState,
} from './campaign-store'

export interface RunCampaignInput {
  brand?: string
  /** Vrije seed-keywords; gebruikt als er geen ideaId is. */
  seed?: string
  /** Bestaand blog-idee als startpunt; wint van `seed`. */
  ideaId?: string
  /** Welke doelgroepen krijgen een LinkedIn-variant (al opgehaald uit de DB). */
  audiences: Audience[]
}

export interface RunCampaignResult {
  brand: BrandId
  seed: string | null
  stages: CampaignStages
  blogPostId: string | null
}

// ---------------------------------------------------------------------------
// Stap 1 — Idee
// ---------------------------------------------------------------------------
export async function buildIdeaStage(input: {
  seed?: string
  ideaId?: string
}): Promise<StageState<IdeaStageOutput>> {
  try {
    if (input.ideaId) {
      const idea = await getIdeaById(input.ideaId)
      if (!idea) return { output: null, approved: false, error: 'Idee niet gevonden' }
      return {
        output: {
          title: idea.title,
          keywords: idea.keywords,
          rationale: idea.rationale || '',
          targetAudience: idea.target_audience || '',
          archetype: isValidArchetype(idea.archetype) ? idea.archetype : 'technical-deep-dive',
        },
        approved: false,
      }
    }

    const existing = await getPublishedPosts()
    const ideas = await generateBlogIdeas(
      existing.map((p) => p.title),
      input.seed?.trim() || undefined
    )
    const first = ideas[0]
    if (!first) return { output: null, approved: false, error: 'Kon geen idee genereren' }

    return {
      output: {
        title: first.title,
        keywords: first.keywords,
        rationale: first.rationale,
        targetAudience: first.target_audience,
        archetype: isValidArchetype(first.archetype) ? first.archetype : 'technical-deep-dive',
      },
      approved: false,
    }
  } catch (err) {
    return {
      output: null,
      approved: false,
      error: err instanceof Error ? err.message : 'Idee-stap mislukt',
    }
  }
}

// ---------------------------------------------------------------------------
// Stap 2 — Blog (slaat op als DRAFT; image is non-blocking)
// ---------------------------------------------------------------------------
export async function buildBlogStage(
  idea: IdeaStageOutput,
  ideaId?: string
): Promise<StageState<BlogStageOutput> & { content?: string }> {
  try {
    const existing = await getPublishedPosts()
    const archetype: BlogArchetype = isValidArchetype(idea.archetype)
      ? idea.archetype
      : 'technical-deep-dive'

    const post = await generateBlogPost({
      title: idea.title,
      keywords: idea.keywords,
      archetype,
      targetAudience: idea.targetAudience || undefined,
      existingPostSlugs: existing.map((p) => ({ slug: p.slug, title: p.title })),
    })

    const postId = await createPost({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      seo_title: post.seoTitle,
      seo_description: post.seoDescription,
      target_keywords: idea.keywords,
      ai_generated: true,
      status: 'draft',
      archetype: post.archetype,
    })

    // Header-image: non-blocking, exact zoals action==='write' in de bestaande route.
    let image: string | null = null
    try {
      const imageUrl = await generateBlogImage({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
      })
      if (imageUrl) {
        await updatePost(postId, { image: imageUrl })
        image = imageUrl
      }
    } catch (imgErr) {
      console.error('Campagne: image-generatie mislukt (non-blocking):', imgErr)
    }

    if (ideaId) {
      try {
        await updateIdeaStatus(ideaId, 'written', postId)
      } catch (e) {
        console.error('Campagne: idea-status bijwerken mislukt (non-blocking):', e)
      }
    }

    return {
      output: { postId, slug: post.slug, title: post.title, excerpt: post.excerpt, image },
      approved: false,
      content: post.content,
    }
  } catch (err) {
    return {
      output: null,
      approved: false,
      error: err instanceof Error ? err.message : 'Blog-stap mislukt',
    }
  }
}

// ---------------------------------------------------------------------------
// Stap 3 — LinkedIn-variant per doelgroep (+ schrijft naar het post-geheugen)
// ---------------------------------------------------------------------------
export async function buildLinkedInVariant(params: {
  brandId: BrandId
  audience: Audience
  post: { title: string; excerpt: string; content: string; slug: string }
}): Promise<LinkedInVariant> {
  const { audience } = params
  const style = audience.style

  try {
    const brand = getBrand(params.brandId)
    const brandContext = buildBrandContext(await getBrandAnswers(brand.id), brand)
    // getRecentPosts vult de generator als anti-herhaling-context (best effort).
    await getRecentPosts(brand.id, 8).catch(() => [])

    const result = await generateLinkedInPost({
      title: params.post.title,
      excerpt: params.post.excerpt,
      content: params.post.content,
      slug: params.post.slug,
      style,
      brandContext,
      audience,
    })

    // Bewaar in het post-geheugen zodat toekomstige generaties niet herhalen.
    // Categorie/funnel-waarden moeten binnen de CHECK-constraints van
    // linkedin_posts vallen (zie migration 006).
    try {
      await savePost({
        brand: brand.id,
        postText: result.postText,
        hashtags: result.hashtags,
        funnelStage: 'tofu',
        category: '3-hr-problemen',
        style,
        topic: params.post.title,
        interview: [],
      })
    } catch (saveErr) {
      console.error('Campagne: LinkedIn-post opslaan in geheugen mislukt (non-blocking):', saveErr)
    }

    return {
      audienceKey: audience.key,
      audienceLabel: audience.label,
      postText: result.postText,
      hashtags: result.hashtags,
      approved: false,
    }
  } catch (err) {
    return {
      audienceKey: audience.key,
      audienceLabel: audience.label,
      postText: '',
      hashtags: [],
      approved: false,
      error: err instanceof Error ? err.message : 'LinkedIn-variant mislukt',
    }
  }
}

/** Regenereer één LinkedIn-variant op basis van de al opgeslagen blog-draft. */
export async function regenerateLinkedInVariant(params: {
  brandId: BrandId
  audience: Audience
  blogPostId: string
}): Promise<LinkedInVariant> {
  const post = await getPostById(params.blogPostId)
  if (!post) {
    return {
      audienceKey: params.audience.key,
      audienceLabel: params.audience.label,
      postText: '',
      hashtags: [],
      approved: false,
      error: 'Blogconcept niet gevonden',
    }
  }
  return buildLinkedInVariant({
    brandId: params.brandId,
    audience: params.audience,
    post: { title: post.title, excerpt: post.excerpt, content: post.content, slug: post.slug },
  })
}

// ---------------------------------------------------------------------------
// Stap 4 — Nurture-VOORSTEL (deterministisch; verstuurt niets)
// ---------------------------------------------------------------------------
export function buildNurtureStage(idea: IdeaStageOutput | null): StageState<NurtureStageOutput> {
  // Sinds de HR-rebrand is er één sequence ('hr'). We stellen die voor en
  // motiveren waarom; daadwerkelijk versturen blijft buiten deze flow.
  const hr = NURTURE_SEQUENCES['hr']
  if (!hr || hr.length === 0) {
    return { output: null, approved: false, error: 'Geen nurture-sequence beschikbaar' }
  }

  const topic = idea?.title ? `"${idea.title}"` : 'dit onderwerp'
  return {
    output: {
      vertical: 'hr',
      emailCount: hr.length,
      rationale: `Voorstel: koppel leads die via ${topic} binnenkomen aan de HR-nurturereeks (${hr.length} mails over 18 dagen: AVG-checklist → RLS → historiek → GGD-case → soft CTA). Versturen gebeurt pas na expliciete lead-opt-in via de bestaande cron.`,
    },
    approved: false,
  }
}

// ---------------------------------------------------------------------------
// Volledige run: alle stappen achter elkaar tot concept.
// ---------------------------------------------------------------------------
export async function runCampaign(input: RunCampaignInput): Promise<RunCampaignResult> {
  const brand = getBrand(input.brand)
  const audiences = input.audiences

  const ideaStage = await buildIdeaStage({ seed: input.seed, ideaId: input.ideaId })

  let blogStage: StageState<BlogStageOutput> = {
    output: null,
    approved: false,
    error: 'Blog niet gegenereerd (geen geldig idee)',
  }
  let blogContent: string | undefined

  if (ideaStage.output) {
    const built = await buildBlogStage(ideaStage.output, input.ideaId)
    blogContent = built.content
    blogStage = { output: built.output, approved: built.approved, error: built.error }
  }

  const linkedin: LinkedInVariant[] = []
  if (blogStage.output && blogContent) {
    const post = {
      title: blogStage.output.title,
      excerpt: blogStage.output.excerpt,
      content: blogContent,
      slug: blogStage.output.slug,
    }
    // Sequentieel: voorkomt parallelle race op het post-geheugen + rate limits.
    for (const audience of audiences) {
      linkedin.push(await buildLinkedInVariant({ brandId: brand.id, audience, post }))
    }
  }

  const nurture = buildNurtureStage(ideaStage.output)

  return {
    brand: brand.id,
    seed: input.seed?.trim() || null,
    stages: { idea: ideaStage, blog: blogStage, linkedin, nurture },
    blogPostId: blogStage.output?.postId ?? null,
  }
}
