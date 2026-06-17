import { supabase } from './supabase'
import { DEFAULT_AUDIENCES, type Audience } from './audiences'
import type { LinkedInStyle } from './linkedin-writer'

// Persistentie van de doelgroepen (Campagne-flow). Mirror van
// linkedin-posts-store.ts / blog-store.ts: dunne CRUD bovenop Supabase.
// De `audiences`-tabel is leidend; DEFAULT_AUDIENCES is alleen de startset die
// ensureSeedAudiences() één keer idempotent inschiet.

export interface AudienceRecord extends Audience {
  id: string
  sortOrder: number
}

interface AudienceRow {
  id: string
  key: string
  label: string
  beschrijving: string | null
  guide: string
  style: string
  sort_order: number | null
}

function rowToRecord(row: AudienceRow): AudienceRecord {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    beschrijving: row.beschrijving ?? '',
    guide: row.guide,
    style: row.style as LinkedInStyle,
    sortOrder: row.sort_order ?? 0,
  }
}

/**
 * Zorgt dat de startdoelgroepen één keer in de tabel staan. Idempotent: upsert
 * op `key` met ignoreDuplicates, dus herhaald aanroepen voegt niets dubbel toe
 * en overschrijft geen door JW aangepaste teksten.
 */
export async function ensureSeedAudiences(): Promise<void> {
  const rows = DEFAULT_AUDIENCES.map((a, i) => ({
    key: a.key,
    label: a.label,
    beschrijving: a.beschrijving,
    guide: a.guide,
    style: a.style,
    sort_order: i,
  }))

  const { error } = await supabase
    .from('audiences')
    .upsert(rows, { onConflict: 'key', ignoreDuplicates: true })

  if (error) throw new Error(`Failed to ensure seed audiences: ${error.message}`)
}

export async function listAudiences(): Promise<AudienceRecord[]> {
  const { data, error } = await supabase
    .from('audiences')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Failed to list audiences: ${error.message}`)
  return (data || []).map((r) => rowToRecord(r as AudienceRow))
}

export async function getAudienceByKey(key: string): Promise<AudienceRecord | null> {
  const { data, error } = await supabase
    .from('audiences')
    .select('*')
    .eq('key', key)
    .maybeSingle()

  if (error) throw new Error(`Failed to get audience: ${error.message}`)
  return data ? rowToRecord(data as AudienceRow) : null
}

export async function createAudience(input: {
  key: string
  label: string
  beschrijving?: string
  guide: string
  style: LinkedInStyle
  sortOrder?: number
}): Promise<string> {
  const { data, error } = await supabase
    .from('audiences')
    .insert({
      key: input.key,
      label: input.label,
      beschrijving: input.beschrijving ?? '',
      guide: input.guide,
      style: input.style,
      sort_order: input.sortOrder ?? 0,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create audience: ${error.message}`)
  return data.id
}

export async function updateAudience(
  id: string,
  patch: Partial<{
    label: string
    beschrijving: string
    guide: string
    style: LinkedInStyle
    sortOrder: number
  }>
): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.label !== undefined) row.label = patch.label
  if (patch.beschrijving !== undefined) row.beschrijving = patch.beschrijving
  if (patch.guide !== undefined) row.guide = patch.guide
  if (patch.style !== undefined) row.style = patch.style
  if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder

  const { error } = await supabase.from('audiences').update(row).eq('id', id)
  if (error) throw new Error(`Failed to update audience: ${error.message}`)
}

export async function deleteAudience(id: string): Promise<void> {
  const { error } = await supabase.from('audiences').delete().eq('id', id)
  if (error) throw new Error(`Failed to delete audience: ${error.message}`)
}
