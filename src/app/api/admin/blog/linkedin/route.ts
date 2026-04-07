import { NextResponse } from 'next/server'
import { getPostById } from '@/lib/blog-store'
import { generateLinkedInPost, type LinkedInStyle } from '@/lib/linkedin-writer'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

function checkAuth(req: Request): boolean {
  return req.headers.get('x-admin-token') === ADMIN_PASSWORD
}

const VALID_STYLES: LinkedInStyle[] = ['educatief', 'scherp', 'provocatief', 'storytelling']

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { postId, style, extraContext } = body as {
      postId?: string
      style?: LinkedInStyle
      extraContext?: string
    }

    if (!postId) {
      return NextResponse.json({ error: 'postId is verplicht' }, { status: 400 })
    }

    if (!style || !VALID_STYLES.includes(style)) {
      return NextResponse.json(
        { error: `style is verplicht en moet één van: ${VALID_STYLES.join(', ')}` },
        { status: 400 }
      )
    }

    const post = await getPostById(postId)
    if (!post) {
      return NextResponse.json({ error: 'Post niet gevonden' }, { status: 404 })
    }

    const result = await generateLinkedInPost({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      slug: post.slug,
      style,
      extraContext: extraContext?.trim() || undefined,
    })

    return NextResponse.json({
      success: true,
      postText: result.postText,
      hashtags: result.hashtags,
    })
  } catch (error) {
    console.error('LinkedIn generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
