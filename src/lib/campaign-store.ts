import { supabase } from './supabase'
import type { BlogArchetype } from './blog-archetypes'

// Persistentie van de Campagne-flow. Mirror van blog-store.ts /
// linkedin-posts-store.ts: dunne CRUD-laag bovenop Supabase, de orkestrator en
// de API-route bevatten de logica.
//
// Een campagne bewaart per stap de output + goedkeurstatus in één jsonb-kolom
// (`stages`), zodat JW in de modus "genereer-alles-dan-review" per stap kan
// bijwerken, opnieuw genereren en goedkeuren.

export type CampaignStatus = 'draft' | 'approved' | 'scheduled'

/** Generieke stap-wrapper: output + of JW 'm heeft goedgekeurd + evt. foutnotitie. */
export interface StageState<T> {
  output: T | null
  approved: boolean
  /** True zodra JW de output handmatig heeft aangepast (audit-spoor). */
  edited?: boolean
  /** Gevuld als de generatie van deze stap faalde; flow stopt niet. */
  error?: string
}

export interface IdeaStageOutput {
  title: string
  keywords: string[]
  rationale: string
  targetAudience: string
  archetype: BlogArchetype
}

export interface BlogStageOutput {
  postId: string
  slug: string
  title: string
  excerpt: string
  image: string | null
}

/** De rol van een post binnen de reeks-opbouw richting de blog. */
export type SeriesRole = 'haak' | 'inzicht' | 'bewijs' | 'cta'

/**
 * Eén post in de LinkedIn-reeks. De reeks bouwt op richting de blog (haak →
 * inzicht → bewijs → cta) en is gespreid in te plannen. Posten zelf gebeurt
 * handmatig (kopiëren) — LinkedIn's API staat auto-posten op een persoonlijk
 * profiel niet toe; dit is plannen + kopiëren.
 */
export interface LinkedInSeriesPost {
  /** Volgorde in de reeks (0-based). */
  index: number
  rol: SeriesRole
  /** Verwijst naar audiences.key (doelgroep kan in de admin gewijzigd worden). */
  audienceKey: string
  audienceLabel: string
  postText: string
  hashtags: string[]
  /** Voorgestelde plaatsingsdatum (ISO), gespreid over de campagneperiode. */
  plannenOp: string
  approved: boolean
  edited?: boolean
  error?: string
}

export interface CampaignStages {
  idea: StageState<IdeaStageOutput>
  blog: StageState<BlogStageOutput>
  /** Eén reeks van opbouwende posts (haak → inzicht → bewijs → cta). */
  linkedin: LinkedInSeriesPost[]
}

export interface Campaign {
  id: string
  created_at: string
  updated_at: string
  brand: string
  status: CampaignStatus
  seed: string | null
  stages: CampaignStages
  blog_post_id: string | null
}

function emptyStages(): CampaignStages {
  return {
    idea: { output: null, approved: false },
    blog: { output: null, approved: false },
    linkedin: [],
  }
}

export async function createCampaign(input: {
  brand: string
  seed?: string | null
  stages?: CampaignStages
  blogPostId?: string | null
}): Promise<string> {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      brand: input.brand,
      seed: input.seed ?? null,
      stages: input.stages ?? emptyStages(),
      blog_post_id: input.blogPostId ?? null,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create campaign: ${error.message}`)
  return data.id
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Failed to get campaign: ${error.message}`)
  return (data as Campaign) ?? null
}

export async function listCampaigns(limit = 20): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to list campaigns: ${error.message}`)
  return (data || []) as Campaign[]
}

export async function updateCampaign(
  id: string,
  updates: Partial<Pick<Campaign, 'status' | 'stages' | 'blog_post_id' | 'seed'>>
): Promise<void> {
  const { error } = await supabase
    .from('campaigns')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(`Failed to update campaign: ${error.message}`)
}

/**
 * Vervang de volledige stages-blob. De orkestrator/route bouwt de nieuwe blob op
 * (lees campagne → muteer in geheugen → schrijf terug); we doen geen partial
 * jsonb-merge zodat de vorm voorspelbaar blijft.
 */
export async function updateStages(id: string, stages: CampaignStages): Promise<void> {
  await updateCampaign(id, { stages })
}
