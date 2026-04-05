import { NextResponse } from 'next/server'
import { getAllPosts, getPostById, createPost, updatePost, publishPost, archivePost, schedulePost, getPublishedPosts } from '@/lib/blog-store'
import { getIdeas, updateIdeaStatus } from '@/lib/blog-store'
import { suggestInternalLinks } from '@/lib/blog-writer'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

function checkAuth(req: Request): boolean {
  const auth = req.headers.get('x-admin-token')
  return auth === ADMIN_PASSWORD
}

// GET — lijst van alle posts + ideas
export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const posts = await getAllPosts()
    const ideas = await getIdeas()
    return NextResponse.json({ posts, ideas })
  } catch (error) {
    console.error('Admin blog GET error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}

// POST — nieuwe post aanmaken
export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { slug, title, excerpt, content, image, status, target_keywords, seo_title, seo_description } = body

    if (!slug || !title || !excerpt || !content) {
      return NextResponse.json({ error: 'slug, title, excerpt en content zijn verplicht' }, { status: 400 })
    }

    const postId = await createPost({
      slug,
      title,
      excerpt,
      content,
      image,
      status: status || 'draft',
      target_keywords: target_keywords || [],
      seo_title,
      seo_description,
    })

    return NextResponse.json({ success: true, postId })
  } catch (error) {
    console.error('Admin blog POST error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}

// PUT — post bijwerken / publiceren / archiveren
export async function PUT(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, action: putAction, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'id is verplicht' }, { status: 400 })
    }

    if (putAction === 'publish') {
      await publishPost(id)

      // Automatisch interne links updaten in bestaande posts (non-blocking)
      const newPost = await getPostById(id)
      if (newPost) {
        const existingPosts = await getPublishedPosts()
        let linkedCount = 0
        for (const ep of existingPosts) {
          if (ep.id === id) continue
          try {
            const suggestions = await suggestInternalLinks({
              postTitle: ep.title, postContent: ep.content,
              newPostSlug: newPost.slug, newPostTitle: newPost.title,
            })
            if (suggestions.length > 0) {
              let updated = ep.content
              for (const s of suggestions) {
                if (updated.includes(s.elementToFind)) {
                  updated = updated.replace(s.elementToFind, s.replacement)
                }
              }
              if (updated !== ep.content) {
                await updatePost(ep.id, { content: updated })
                linkedCount++
              }
            }
          } catch { /* non-blocking */ }
        }
        console.log(`[PUBLISH] Interne links bijgewerkt in ${linkedCount} bestaande artikelen`)
      }

      return NextResponse.json({ success: true, action: 'published' })
    }

    if (putAction === 'archive') {
      await archivePost(id)
      return NextResponse.json({ success: true, action: 'archived' })
    }

    if (putAction === 'approve_idea') {
      await updateIdeaStatus(id, 'approved')
      return NextResponse.json({ success: true, action: 'idea_approved' })
    }

    if (putAction === 'reject_idea') {
      await updateIdeaStatus(id, 'rejected')
      return NextResponse.json({ success: true, action: 'idea_rejected' })
    }

    if (putAction === 'schedule') {
      const { scheduled_for } = body
      if (!scheduled_for) {
        return NextResponse.json({ error: 'scheduled_for is verplicht' }, { status: 400 })
      }
      await schedulePost(id, scheduled_for)
      return NextResponse.json({ success: true, action: 'scheduled' })
    }

    // Gewone update
    await updatePost(id, updates)
    return NextResponse.json({ success: true, action: 'updated' })
  } catch (error) {
    console.error('Admin blog PUT error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}
