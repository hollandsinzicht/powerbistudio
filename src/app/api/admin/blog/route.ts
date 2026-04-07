import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAllPosts, getPostById, createPost, updatePost, publishPost, archivePost, schedulePost, getPublishedPosts, getNextAvailableScheduleDate, swapScheduleDates } from '@/lib/blog-store'
import { getIdeas, updateIdeaStatus, getIdeaById, deleteIdea, deleteAllIdeas } from '@/lib/blog-store'
import { suggestInternalLinks, generateBlogPost } from '@/lib/blog-writer'
import { generateBlogImage } from '@/lib/blog-image-generator'

function revalidateBlog(slug?: string) {
  revalidatePath('/blog')
  revalidatePath('/sitemap.xml')
  if (slug) revalidatePath(`/blog/${slug}`)
  // Ook alle categoriepagina's
  ;['power-bi', 'dax-datamodellering', 'data-platform', 'strategie', 'fabric-migratie', 'governance-avg', 'embedded-analytics', 'procesverbetering-bi'].forEach((cat) => {
    revalidatePath(`/blog/categorie/${cat}`)
  })
}

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

    // Bulk acties (geen id nodig)
    if (putAction === 'clear_all_ideas') {
      const count = await deleteAllIdeas()
      return NextResponse.json({ success: true, action: 'all_ideas_cleared', count })
    }

    if (!id) {
      return NextResponse.json({ error: 'id is verplicht' }, { status: 400 })
    }

    if (putAction === 'delete_idea') {
      await deleteIdea(id)
      return NextResponse.json({ success: true, action: 'idea_deleted' })
    }

    if (putAction === 'publish') {
      await publishPost(id)
      const publishedPost = await getPostById(id)
      revalidateBlog(publishedPost?.slug)

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
      revalidateBlog()
      return NextResponse.json({ success: true, action: 'archived' })
    }

    if (putAction === 'approve_idea') {
      // Volledige flow: schrijf artikel + image + auto-schedule
      const idea = await getIdeaById(id)
      if (!idea) {
        return NextResponse.json({ error: 'Idea niet gevonden' }, { status: 404 })
      }

      // Markeer als approved
      await updateIdeaStatus(id, 'approved')

      // Schrijf artikel
      const existingPosts = await getPublishedPosts()
      const existingPostSlugs = existingPosts.map((p) => ({ slug: p.slug, title: p.title }))

      const post = await generateBlogPost({
        title: idea.title,
        keywords: idea.keywords,
        targetAudience: idea.target_audience || undefined,
        existingPostSlugs,
      })

      // Bepaal volgende vrije datum
      const scheduledFor = await getNextAvailableScheduleDate()

      // Sla op als scheduled (niet als draft)
      const postId = await createPost({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        seo_title: post.seoTitle,
        seo_description: post.seoDescription,
        target_keywords: idea.keywords,
        ai_generated: true,
        status: 'draft', // Eerst draft, dan schedulen
      })

      // Schedule op de berekende datum
      await schedulePost(postId, scheduledFor)

      // Genereer image (non-blocking)
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

      // Update idea → written
      await updateIdeaStatus(id, 'written', postId)

      revalidateBlog(post.slug)

      return NextResponse.json({
        success: true,
        action: 'idea_approved_and_scheduled',
        postId,
        scheduledFor,
      })
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

    if (putAction === 'swap_dates') {
      const { other_id } = body
      if (!other_id) {
        return NextResponse.json({ error: 'other_id is verplicht' }, { status: 400 })
      }
      await swapScheduleDates(id, other_id)
      return NextResponse.json({ success: true, action: 'dates_swapped' })
    }

    if (putAction === 'regenerate_image') {
      const post = await getPostById(id)
      if (!post) {
        return NextResponse.json({ error: 'Post niet gevonden' }, { status: 404 })
      }

      const imageUrl = await generateBlogImage({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
      })

      if (!imageUrl) {
        return NextResponse.json({ error: 'Image generatie mislukt — check OPENAI_API_KEY' }, { status: 500 })
      }

      await updatePost(id, { image: imageUrl })
      revalidateBlog(post.slug)
      return NextResponse.json({ success: true, action: 'image_regenerated', imageUrl })
    }

    // Gewone update
    await updatePost(id, updates)
    const updatedPost = await getPostById(id)
    revalidateBlog(updatedPost?.slug)
    return NextResponse.json({ success: true, action: 'updated' })
  } catch (error) {
    console.error('Admin blog PUT error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}
