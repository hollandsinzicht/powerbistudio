import { NextResponse } from 'next/server'
import {
  generatePostFromInterview,
  defaultStyleForCategory,
  type FunnelStage,
  type PostCategory,
  type LinkedInStyle,
  type InterviewTurn,
} from '@/lib/linkedin-writer'
import { getBrandAnswers } from '@/lib/brand-profile-store'
import { buildBrandContext } from '@/lib/brand-context'
import { ensureSeedPosts, getRecentPosts, savePost } from '@/lib/linkedin-posts-store'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

function checkAuth(req: Request): boolean {
  return req.headers.get('x-admin-token') === ADMIN_PASSWORD
}

const VALID_FUNNELS: FunnelStage[] = ['tofu', 'mofu', 'bofu']
const VALID_CATEGORIES: PostCategory[] = [
  '3-hr-problemen',
  'klantcase',
  'mythe-provocatie',
  'persoonlijk-visie',
]
const VALID_STYLES: LinkedInStyle[] = ['educatief', 'scherp', 'provocatief', 'storytelling']

interface PostFromInterviewBody {
  funnelStage?: FunnelStage
  category?: PostCategory
  topic?: string
  style?: LinkedInStyle
  interview?: InterviewTurn[]
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as PostFromInterviewBody
    const { funnelStage, category, topic } = body
    const interview = Array.isArray(body.interview) ? body.interview : []

    if (!funnelStage || !VALID_FUNNELS.includes(funnelStage)) {
      return NextResponse.json(
        { error: `funnelStage is verplicht en moet één van: ${VALID_FUNNELS.join(', ')}` },
        { status: 400 }
      )
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `category is verplicht en moet één van: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      )
    }
    if (!topic?.trim()) {
      return NextResponse.json({ error: 'onderwerp is verplicht' }, { status: 400 })
    }

    // Stijl: expliciet meegegeven (indien geldig) óf de default voor de categorie.
    const style =
      body.style && VALID_STYLES.includes(body.style)
        ? body.style
        : defaultStyleForCategory(category)

    // Postgeheugen: zorg dat de seeds er staan, lees daarna de recente posts als
    // anti-herhaling-context voor de funnel/categorie-doorloop.
    await ensureSeedPosts()
    const recent = await getRecentPosts(8)
    const recentPosts = recent.map((p) => ({
      category: p.category,
      funnel_stage: p.funnel_stage,
      post_text: p.post_text,
    }))

    // Injecteer het door JW opgebouwde merkprofiel; leeg → FALLBACK_PERSONA.
    const brandContext = buildBrandContext(await getBrandAnswers())

    const result = await generatePostFromInterview({
      funnelStage,
      category,
      topic: topic.trim(),
      style,
      interview,
      brandContext,
      recentPosts,
    })

    // Bewaar de nieuwe post in het geheugen, zodat de volgende generatie erop voortbouwt.
    await savePost({
      postText: result.postText,
      hashtags: result.hashtags,
      funnelStage,
      category,
      style,
      topic: topic.trim(),
      interview,
    })

    return NextResponse.json({
      success: true,
      postText: result.postText,
      hashtags: result.hashtags,
      usage: result.usage,
    })
  } catch (error) {
    console.error('Post from interview error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
