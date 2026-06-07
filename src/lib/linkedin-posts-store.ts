import { supabase } from './supabase'
import { SEED_POSTS } from './linkedin-posts-seed'
import { DEFAULT_BRAND_ID, type BrandId } from './brands'

// Persistentie van het postgeheugen. De generator leest de recente posts om de
// funnel (TOFU/MOFU/BOFU) en categorieën logisch te laten doorlopen en herhaling
// te voorkomen. Mirror van blog-store.ts / brand-profile-store.ts.

export interface InterviewTurn {
  vraag: string
  antwoord: string
}

export interface LinkedInPostRecord {
  id: string
  created_at: string
  brand: string
  post_text: string
  hashtags: string[]
  funnel_stage: string | null
  category: string | null
  style: string | null
  topic: string | null
  interview: InterviewTurn[]
  source: string
  seed_key: string | null
}

export interface SavePostInput {
  brand: BrandId
  postText: string
  hashtags: string[]
  funnelStage: string
  category: string
  style: string
  topic: string
  interview: InterviewTurn[]
}

/**
 * Leest de meest recente posts (seeds + gegenereerd) voor de geheugen-context,
 * gefilterd op brand zodat anti-herhaling per bedrijf werkt.
 */
export async function getRecentPosts(
  brand: BrandId = DEFAULT_BRAND_ID,
  limit = 8
): Promise<LinkedInPostRecord[]> {
  const { data, error } = await supabase
    .from('linkedin_posts')
    .select('*')
    .eq('brand', brand)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to get recent posts: ${error.message}`)
  return (data || []) as LinkedInPostRecord[]
}

/** Slaat een nieuw gegenereerde post op als onderdeel van het geheugen. */
export async function savePost(input: SavePostInput): Promise<void> {
  const { error } = await supabase.from('linkedin_posts').insert({
    brand: input.brand,
    post_text: input.postText,
    hashtags: input.hashtags,
    funnel_stage: input.funnelStage,
    category: input.category,
    style: input.style,
    topic: input.topic,
    interview: input.interview,
    source: 'generated',
  })

  if (error) throw new Error(`Failed to save post: ${error.message}`)
}

/**
 * Zorgt dat de 6 startposts één keer in het geheugen staan. Idempotent: upsert
 * op seed_key met ignoreDuplicates, dus herhaald aanroepen voegt niets dubbel toe.
 */
export async function ensureSeedPosts(): Promise<void> {
  const rows = SEED_POSTS.map((p) => ({
    brand: p.brand,
    post_text: p.postText,
    hashtags: p.hashtags,
    funnel_stage: p.funnelStage,
    category: p.category,
    style: p.style,
    topic: p.topic,
    interview: [],
    source: 'seed',
    seed_key: p.seedKey,
  }))

  const { error } = await supabase
    .from('linkedin_posts')
    .upsert(rows, { onConflict: 'seed_key', ignoreDuplicates: true })

  if (error) throw new Error(`Failed to ensure seed posts: ${error.message}`)
}
