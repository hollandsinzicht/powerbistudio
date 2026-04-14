import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getScheduledPostsDue, publishPost, getPostById } from '@/lib/blog-store'

// Vercel serverless max
export const maxDuration = 60
// Zorg dat deze route niet gecached wordt
export const dynamic = 'force-dynamic'

const CRON_SECRET = process.env.CRON_SECRET

/**
 * Bepaalt of een request van Vercel cron komt.
 * Ondersteunt zowel de CRON_SECRET bearer flow als de x-vercel-cron header.
 */
function isAuthorizedCron(req: Request): boolean {
  // 1) Vercel Cron header — aanwezig bij elke cron invocation
  const vercelCronHeader = req.headers.get('x-vercel-cron')
  if (vercelCronHeader) return true

  // 2) Bearer token flow (handmatige triggers of oudere Vercel setup)
  const authHeader = req.headers.get('authorization')
  if (CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) return true

  // 3) Als er geen CRON_SECRET is ingesteld, accepteer alle calls (dev)
  if (!CRON_SECRET) return true

  return false
}

export async function GET(req: Request) {
  // Debug log — zodat we in Vercel runtime logs kunnen zien of de cron überhaupt getriggerd wordt
  const hasVercelHeader = !!req.headers.get('x-vercel-cron')
  const hasAuthHeader = !!req.headers.get('authorization')
  console.log(`[PUBLISH CRON] Triggered — vercel-cron:${hasVercelHeader} auth:${hasAuthHeader}`)

  if (!isAuthorizedCron(req)) {
    console.warn('[PUBLISH CRON] Unauthorized — check CRON_SECRET env var en/of Vercel cron registratie')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const duePosts = await getScheduledPostsDue()
    console.log(`[PUBLISH CRON] ${duePosts.length} posts due for publishing`)
    let published = 0

    for (const post of duePosts) {
      try {
        await publishPost(post.id)
        published++
        console.log(`[PUBLISH CRON] Published: ${post.title}`)

        // Invalideer Next.js cache zodat /blog en de slug-pagina meteen bijwerken
        const freshPost = await getPostById(post.id)
        revalidatePath('/blog')
        revalidatePath('/sitemap.xml')
        if (freshPost?.slug) revalidatePath(`/blog/${freshPost.slug}`)
        ;['power-bi', 'dax-datamodellering', 'data-platform', 'strategie', 'fabric-migratie', 'governance-avg', 'embedded-analytics', 'procesverbetering-bi'].forEach((cat) => {
          revalidatePath(`/blog/categorie/${cat}`)
        })
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
    console.error('[PUBLISH CRON] Fatal error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
