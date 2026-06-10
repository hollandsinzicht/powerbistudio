import { NextResponse } from 'next/server'
import { generateFreeLinkedInPost, type LinkedInStyle } from '@/lib/linkedin-writer'
import { getBrandAnswers } from '@/lib/brand-profile-store'
import { buildBrandContext } from '@/lib/brand-context'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD /* fail-closed: geen 'admin'-fallback */

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
    const { topic, angle, style } = body as {
      topic?: string
      angle?: string
      style?: LinkedInStyle
    }

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: 'onderwerp is verplicht' }, { status: 400 })
    }

    if (!style || !VALID_STYLES.includes(style)) {
      return NextResponse.json(
        { error: `style is verplicht en moet één van: ${VALID_STYLES.join(', ')}` },
        { status: 400 }
      )
    }

    // Injecteer het door JW opgebouwde merkprofiel; leeg → FALLBACK_PERSONA.
    const brandContext = buildBrandContext(await getBrandAnswers())

    const result = await generateFreeLinkedInPost({
      topic: topic.trim(),
      angle: angle?.trim() || undefined,
      style,
      brandContext,
    })

    return NextResponse.json({
      success: true,
      postText: result.postText,
      hashtags: result.hashtags,
      usage: result.usage,
    })
  } catch (error) {
    console.error('Free LinkedIn post error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
