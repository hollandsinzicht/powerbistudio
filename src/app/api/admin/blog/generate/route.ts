import { NextResponse } from 'next/server'
import { generateBlogIdeas, generateBlogPost, suggestInternalLinks } from '@/lib/blog-writer'
import { generateBlogImage } from '@/lib/blog-image-generator'
import { createIdea, getIdeaById, updateIdeaStatus, createPost, updatePost, getPublishedPosts, getPostById } from '@/lib/blog-store'
import { isValidArchetype, type BlogArchetype } from '@/lib/blog-archetypes'

// AI-acties (write, update-links, ideas) kunnen lang duren.
// update-links doet een Claude-call per bestaand artikel — bij 25+ artikelen
// tikt dat tegen de default Vercel-timeout aan.
export const maxDuration = 300
export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

function checkAuth(req: Request): boolean {
  const auth = req.headers.get('x-admin-token')
  return auth === ADMIN_PASSWORD
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action } = body

    if (action === 'add-idea') {
      const { title, keywords, rationale, target_audience, archetype } = body
      if (!title) {
        return NextResponse.json({ error: 'title is verplicht' }, { status: 400 })
      }
      const id = await createIdea({
        title,
        keywords: Array.isArray(keywords) ? keywords : [],
        rationale: rationale || undefined,
        target_audience: target_audience || undefined,
        archetype: isValidArchetype(archetype) ? archetype : null,
      })
      return NextResponse.json({ success: true, id })
    }

    if (action === 'ideas') {
      const { seedKeywords } = body
      const existingPosts = await getPublishedPosts()
      const existingTitles = existingPosts.map((p) => p.title)

      const ideas = await generateBlogIdeas(existingTitles, seedKeywords || undefined)

      const savedIds: string[] = []
      for (const idea of ideas) {
        const id = await createIdea({
          title: idea.title,
          keywords: idea.keywords,
          rationale: idea.rationale,
          target_audience: idea.target_audience,
          archetype: idea.archetype,
        })
        savedIds.push(id)
      }

      return NextResponse.json({ success: true, ideas, savedIds })
    }

    if (action === 'write') {
      const { ideaId, title, keywords, targetAudience, archetype: bodyArchetype } = body

      let writeTitle = title
      let writeKeywords = keywords || []
      let writeAudience = targetAudience
      let writeArchetype: BlogArchetype = isValidArchetype(bodyArchetype)
        ? bodyArchetype
        : 'technical-deep-dive'

      if (ideaId) {
        const idea = await getIdeaById(ideaId)
        if (!idea) return NextResponse.json({ error: 'Idea niet gevonden' }, { status: 404 })
        writeTitle = idea.title
        writeKeywords = idea.keywords
        writeAudience = idea.target_audience || undefined
        // Body archetype overrides idea archetype if explicitly provided
        if (isValidArchetype(bodyArchetype)) {
          writeArchetype = bodyArchetype
        } else if (isValidArchetype(idea.archetype)) {
          writeArchetype = idea.archetype
        }
      }

      if (!writeTitle) {
        return NextResponse.json({ error: 'Titel is verplicht' }, { status: 400 })
      }

      // Haal bestaande posts op voor interne links
      const existingPosts = await getPublishedPosts()
      const existingPostSlugs = existingPosts.map((p) => ({ slug: p.slug, title: p.title }))

      // Genereer artikel met interne links
      const post = await generateBlogPost({
        title: writeTitle,
        keywords: writeKeywords,
        archetype: writeArchetype,
        targetAudience: writeAudience,
        existingPostSlugs,
      })

      // Sla op als draft
      const postId = await createPost({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        seo_title: post.seoTitle,
        seo_description: post.seoDescription,
        target_keywords: writeKeywords,
        ai_generated: true,
        status: 'draft',
        archetype: post.archetype,
      })

      // Genereer header image
      try {
        const imageUrl = await generateBlogImage({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
        })
        if (imageUrl) {
          await updatePost(postId, { image: imageUrl })
        }
      } catch (imgErr) {
        console.error('Image generation failed (non-blocking):', imgErr)
      }

      if (ideaId) {
        await updateIdeaStatus(ideaId, 'written', postId)
      }

      return NextResponse.json({ success: true, post, postId })
    }

    // Actie: update interne links in bestaande posts na publicatie van een nieuw artikel
    if (action === 'update-links') {
      const { postId } = body
      if (!postId) return NextResponse.json({ error: 'postId is verplicht' }, { status: 400 })

      const newPost = await getPostById(postId)
      if (!newPost) return NextResponse.json({ error: 'Post niet gevonden' }, { status: 404 })

      const existingPosts = await getPublishedPosts()
      let updatedCount = 0

      for (const existingPost of existingPosts) {
        if (existingPost.id === postId) continue // skip zichzelf

        try {
          const suggestions = await suggestInternalLinks({
            postTitle: existingPost.title,
            postContent: existingPost.content,
            newPostSlug: newPost.slug,
            newPostTitle: newPost.title,
          })

          if (suggestions.length > 0) {
            let updatedContent = existingPost.content
            for (const s of suggestions) {
              if (updatedContent.includes(s.elementToFind)) {
                updatedContent = updatedContent.replace(s.elementToFind, s.replacement)
              }
            }
            if (updatedContent !== existingPost.content) {
              await updatePost(existingPost.id, { content: updatedContent })
              updatedCount++
            }
          }
        } catch (err) {
          console.error(`Failed to update links in "${existingPost.title}":`, err)
        }
      }

      return NextResponse.json({ success: true, updatedCount })
    }

    return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 })
  } catch (error) {
    console.error('Blog generate error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}
