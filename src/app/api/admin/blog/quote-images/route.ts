import { NextResponse } from 'next/server'
import { getPostById } from '@/lib/blog-store'
import { extractQuotes } from '@/lib/quote-extractor'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

function checkAuth(req: Request): boolean {
  return req.headers.get('x-admin-token') === ADMIN_PASSWORD
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { postId } = body as { postId?: string }

    if (!postId) {
      return NextResponse.json({ error: 'postId is verplicht' }, { status: 400 })
    }

    const post = await getPostById(postId)
    if (!post) {
      return NextResponse.json({ error: 'Post niet gevonden' }, { status: 404 })
    }

    const quotes = await extractQuotes({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
    })

    // Bouw voor elke quote een URL naar de OG quote render endpoint.
    // Relative URL — werkt same-origin in admin.
    const images = quotes.map((q, i) => {
      const params = new URLSearchParams({ text: q.text, emphasis: q.emphasis })
      return {
        index: i + 1,
        text: q.text,
        emphasis: q.emphasis,
        url: `/api/og/quote?${params.toString()}`,
      }
    })

    return NextResponse.json({
      success: true,
      slug: post.slug,
      title: post.title,
      images,
    })
  } catch (error) {
    console.error('Quote images error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
