// ============================================================================
// Campagne-orkestrator
// ----------------------------------------------------------------------------
// Knoopt de bestaande, losse marketing-stappen aan elkaar tot één flow:
//   idee → blogconcept → LinkedIn-reeks (opbouw richting de blog).
// Modus: "genereer-alles-dan-review". Elke stap is afgeschermd met try/catch;
// een mislukte stap degradeert naar { output: null, error } en stopt de flow
// NIET (zelfde non-blocking patroon als de bestaande image-generatie).
//
// Lead-nurture is BEWUST geen stap: die loopt site-breed als één staande reeks
// (/api/cron/nurture) voor alle HR-leads, los van campagnes.
//
// HARDE GRENS (= de merkbelofte): deze orkestrator raakt UITSLUITEND
// marketing-content aan — blog_posts en linkedin_posts (geheugen). Hij leest
// GEEN klant-HR-data, GEEN studio_*-modellen en GEEN lead-PII, en hij VERSTUURT
// niets. Voeg hier nooit reads van klantdata toe.
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
import { type Audience } from './audiences'
import type {
  CampaignStages,
  IdeaStageOutput,
  BlogStageOutput,
  LinkedInSeriesPost,
  SeriesRole,
  StageState,
} from './campaign-store'

/**
 * De vaste opbouw van de LinkedIn-reeks richting de blog. Vier posts, gespreid
 * gepland: de eerste drie bouwen op zonder link/pitch, de laatste is de CTA.
 */
export const SERIES_STEPS: { rol: SeriesRole; omschrijving: string; plaatsLink: boolean }[] = [
  {
    rol: 'haak',
    omschrijving:
      'Open met het probleem of de herkenning. Geen oplossing, geen link — benoem alleen de pijn zodat de lezer denkt "dit speelt bij ons".',
    plaatsLink: false,
  },
  {
    rol: 'inzicht',
    omschrijving:
      'Geef één concrete takeaway uit het artikel die de lezer morgen kan toepassen. Leerzaam, niet verkopend.',
    plaatsLink: false,
  },
  {
    rol: 'bewijs',
    omschrijving:
      'Illustreer met een patroon of voorbeeld (geen verzonnen cijfers of klantnamen) waarom de aanpak werkt.',
    plaatsLink: false,
  },
  {
    rol: 'cta',
    omschrijving:
      'Vat de rode draad samen en verwijs naar het volledige artikel en/of de gratis Readiness Scan.',
    plaatsLink: true,
  },
]

/** Voorgestelde plaatsingsdatum: start over 2 dagen, daarna +3 dagen per post, 09:00. */
function suggestDate(index: number): string {
  const d = new Date()
  d.setDate(d.getDate() + 2 + index * 3)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}

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
// Stap 3 — LinkedIn-reeks: één post per opbouw-stap (+ schrijft naar geheugen)
// ---------------------------------------------------------------------------
export async function buildSeriesPost(params: {
  brandId: BrandId
  index: number
  step: (typeof SERIES_STEPS)[number]
  audience: Audience
  post: { title: string; excerpt: string; content: string; slug: string }
}): Promise<LinkedInSeriesPost> {
  const { step, audience, index } = params
  const base = {
    index,
    rol: step.rol,
    audienceKey: audience.key,
    audienceLabel: audience.label,
    plannenOp: suggestDate(index),
  }

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
      style: audience.style,
      brandContext,
      audience,
      seriesStep: { rol: step.rol, omschrijving: step.omschrijving, plaatsLink: step.plaatsLink },
    })

    // Bewaar in het post-geheugen zodat toekomstige generaties niet herhalen.
    // Categorie/funnel-waarden moeten binnen de CHECK-constraints van
    // linkedin_posts vallen (zie migration 006).
    try {
      await savePost({
        brand: brand.id,
        postText: result.postText,
        hashtags: result.hashtags,
        funnelStage: step.plaatsLink ? 'bofu' : 'tofu',
        category: '3-hr-problemen',
        style: audience.style,
        topic: params.post.title,
        interview: [],
      })
    } catch (saveErr) {
      console.error('Campagne: LinkedIn-post opslaan in geheugen mislukt (non-blocking):', saveErr)
    }

    return { ...base, postText: result.postText, hashtags: result.hashtags, approved: false }
  } catch (err) {
    return {
      ...base,
      postText: '',
      hashtags: [],
      approved: false,
      error: err instanceof Error ? err.message : 'LinkedIn-post mislukt',
    }
  }
}

/** Regenereer één post uit de reeks (op stap-index) op basis van de blog-draft. */
export async function regenerateSeriesPost(params: {
  brandId: BrandId
  index: number
  audience: Audience
  blogPostId: string
}): Promise<LinkedInSeriesPost> {
  const step = SERIES_STEPS[params.index]
  const fallback: LinkedInSeriesPost = {
    index: params.index,
    rol: step?.rol ?? 'haak',
    audienceKey: params.audience.key,
    audienceLabel: params.audience.label,
    postText: '',
    hashtags: [],
    plannenOp: suggestDate(params.index),
    approved: false,
  }
  if (!step) return { ...fallback, error: 'Onbekende reeks-stap' }

  const post = await getPostById(params.blogPostId)
  if (!post) return { ...fallback, error: 'Blogconcept niet gevonden' }

  return buildSeriesPost({
    brandId: params.brandId,
    index: params.index,
    step,
    audience: params.audience,
    post: { title: post.title, excerpt: post.excerpt, content: post.content, slug: post.slug },
  })
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

  const linkedin: LinkedInSeriesPost[] = []
  if (blogStage.output && blogContent && audiences.length > 0) {
    const post = {
      title: blogStage.output.title,
      excerpt: blogStage.output.excerpt,
      content: blogContent,
      slug: blogStage.output.slug,
    }
    // Eén reeks met opbouw; de gekozen doelgroepen rouleren over de stappen.
    // Sequentieel: voorkomt parallelle race op het post-geheugen + rate limits.
    for (let i = 0; i < SERIES_STEPS.length; i++) {
      const audience = audiences[i % audiences.length]
      linkedin.push(await buildSeriesPost({ brandId: brand.id, index: i, step: SERIES_STEPS[i], audience, post }))
    }
  }

  return {
    brand: brand.id,
    seed: input.seed?.trim() || null,
    stages: { idea: ideaStage, blog: blogStage, linkedin },
    blogPostId: blogStage.output?.postId ?? null,
  }
}
