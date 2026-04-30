import { NextResponse } from 'next/server'
import { generatePillarPost } from '@/lib/blog-writer'
import { generateBlogImage } from '@/lib/blog-image-generator'
import { createPost, updatePost, getPublishedPosts } from '@/lib/blog-store'

// Pillar-generatie kan langer duren door max_tokens=16000.
export const maxDuration = 300
export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

function checkAuth(req: Request): boolean {
  const auth = req.headers.get('x-admin-token')
  return auth === ADMIN_PASSWORD
}

interface PillarRequestBody {
  title?: unknown
  keywords?: unknown
  spoke_slugs?: unknown
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as PillarRequestBody

    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const keywords = Array.isArray(body.keywords)
      ? body.keywords.filter((k): k is string => typeof k === 'string' && k.trim().length > 0)
      : []
    const spokeSlugs = Array.isArray(body.spoke_slugs)
      ? body.spoke_slugs.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      : []

    if (title.length < 5) {
      return NextResponse.json(
        { error: 'Titel moet minimaal 5 tekens bevatten' },
        { status: 400 },
      )
    }
    if (keywords.length < 1) {
      return NextResponse.json(
        { error: 'Geef minimaal 1 keyword op' },
        { status: 400 },
      )
    }
    if (spokeSlugs.length < 3) {
      return NextResponse.json(
        { error: 'Selecteer minimaal 3 spoke-artikelen' },
        { status: 400 },
      )
    }
    if (spokeSlugs.length > 10) {
      return NextResponse.json(
        { error: 'Selecteer maximaal 10 spoke-artikelen' },
        { status: 400 },
      )
    }

    // Resolveer spoke-slugs tegen alle published posts.
    const allPublished = await getPublishedPosts()
    const bySlug = new Map(allPublished.map((p) => [p.slug, p]))

    const resolvedSpokes = spokeSlugs.map((slug) => bySlug.get(slug))
    const missing = spokeSlugs.filter((slug) => !bySlug.has(slug))
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Spoke-slugs niet gevonden of niet gepubliceerd: ${missing.join(', ')}`,
        },
        { status: 400 },
      )
    }

    // Pillars mogen niet naar andere pillars wijzen.
    const pillarSpokes = resolvedSpokes.filter((p) => p?.article_type === 'pillar')
    if (pillarSpokes.length > 0) {
      return NextResponse.json(
        {
          error: `Spokes mogen geen pillar-gids zijn: ${pillarSpokes.map((p) => p?.slug).join(', ')}`,
        },
        { status: 400 },
      )
    }

    const spokes = resolvedSpokes
      .filter((p): p is NonNullable<typeof p> => p !== undefined)
      .map((p) => ({ slug: p.slug, title: p.title }))

    // Voeg ~10 andere blog-titels toe als optionele extra link-context.
    const extraExistingPosts = allPublished
      .filter((p) => p.article_type === 'blog' && !spokeSlugs.includes(p.slug))
      .slice(0, 10)
      .map((p) => ({ slug: p.slug, title: p.title }))

    // Genereer de pillar.
    const pillar = await generatePillarPost({
      title,
      keywords,
      spokes,
      extraExistingPosts,
    })

    // Spot-check: bevat de content minstens één link per spoke-slug?
    const missingLinks = spokes
      .filter((s) => !new RegExp(`href=["']/blog/${s.slug}["']`).test(pillar.content))
      .map((s) => s.slug)
    if (missingLinks.length > 0) {
      console.warn(
        `[generate-pillar] Pillar "${pillar.slug}" mist verwijzingen naar spokes: ${missingLinks.join(', ')}`,
      )
    }

    // Sla op als draft pillar met de geselecteerde spoke-IDs.
    const spokePostIds = resolvedSpokes
      .filter((p): p is NonNullable<typeof p> => p !== undefined)
      .map((p) => p.id)

    const postId = await createPost({
      slug: pillar.slug,
      title: pillar.title,
      excerpt: pillar.excerpt,
      content: pillar.content,
      seo_title: pillar.seoTitle,
      seo_description: pillar.seoDescription,
      target_keywords: keywords,
      ai_generated: true,
      status: 'draft',
      article_type: 'pillar',
      spoke_post_ids: spokePostIds,
    })

    // Header-image (non-blocking, zelfde patroon als generate/route.ts).
    try {
      const imageUrl = await generateBlogImage({
        title: pillar.title,
        slug: pillar.slug,
        excerpt: pillar.excerpt,
      })
      if (imageUrl) {
        await updatePost(postId, { image: imageUrl })
      }
    } catch (imgErr) {
      console.error('Pillar image generation failed (non-blocking):', imgErr)
    }

    return NextResponse.json({
      success: true,
      post_id: postId,
      slug: pillar.slug,
      title: pillar.title,
      missing_spoke_links: missingLinks,
    })
  } catch (error) {
    console.error('Pillar generate error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}
