import { NextResponse } from 'next/server'
import { getScheduledPostsDue, publishPost } from '@/lib/blog-store'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const duePosts = await getScheduledPostsDue()
    let published = 0

    for (const post of duePosts) {
      try {
        await publishPost(post.id)
        published++
        console.log(`[PUBLISH CRON] Published: ${post.title}`)
      } catch (err) {
        console.error(`[PUBLISH CRON] Failed to publish ${post.id}:`, err)
      }
    }

    return NextResponse.json({
      checked: duePosts.length,
      published,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Publish cron error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
