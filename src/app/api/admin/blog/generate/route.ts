import { NextResponse } from 'next/server'
import { generateBlogIdeas, generateBlogPost } from '@/lib/blog-writer'
import { createIdea, getIdeaById, updateIdeaStatus, createPost, getPublishedPosts } from '@/lib/blog-store'

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

    if (action === 'ideas') {
      // Haal bestaande titels op om overlap te voorkomen
      const existingPosts = await getPublishedPosts()
      const existingTitles = existingPosts.map((p) => p.title)

      const ideas = await generateBlogIdeas(existingTitles)

      // Sla op in database
      const savedIds: string[] = []
      for (const idea of ideas) {
        const id = await createIdea({
          title: idea.title,
          keywords: idea.keywords,
          rationale: idea.rationale,
          target_audience: idea.target_audience,
        })
        savedIds.push(id)
      }

      return NextResponse.json({ success: true, ideas, savedIds })
    }

    if (action === 'write') {
      const { ideaId, title, keywords, targetAudience } = body

      let writeTitle = title
      let writeKeywords = keywords || []
      let writeAudience = targetAudience

      // Als er een ideaId is, haal de idea op
      if (ideaId) {
        const idea = await getIdeaById(ideaId)
        if (!idea) return NextResponse.json({ error: 'Idea niet gevonden' }, { status: 404 })
        writeTitle = idea.title
        writeKeywords = idea.keywords
        writeAudience = idea.target_audience || undefined
      }

      if (!writeTitle) {
        return NextResponse.json({ error: 'Titel is verplicht' }, { status: 400 })
      }

      // Genereer artikel
      const post = await generateBlogPost({
        title: writeTitle,
        keywords: writeKeywords,
        targetAudience: writeAudience,
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
      })

      // Update idea status als die er was
      if (ideaId) {
        await updateIdeaStatus(ideaId, 'written', postId)
      }

      return NextResponse.json({ success: true, post, postId })
    }

    return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 })
  } catch (error) {
    console.error('Blog generate error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}
