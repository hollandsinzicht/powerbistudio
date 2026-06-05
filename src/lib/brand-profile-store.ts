import { supabase } from './supabase'

// Key/value persistentie van de merkprofiel-antwoorden.
// Eén rij per kennispunt (key = kennispunt-id) i.p.v. één jsonb-blob:
// atomaire saves, geen race-conditions, makkelijk uitbreidbaar.

export type BrandAnswers = Record<string, string>

/** Leest alle ingevulde kennispunt-antwoorden en mapt ze naar { key: value }. */
export async function getBrandAnswers(): Promise<BrandAnswers> {
  const { data, error } = await supabase
    .from('brand_profile')
    .select('key, value')

  if (error) throw new Error(`Failed to get brand answers: ${error.message}`)

  const answers: BrandAnswers = {}
  for (const row of data || []) {
    if (row.key) answers[row.key as string] = (row.value as string) ?? ''
  }
  return answers
}

/** Slaat één kennispunt-antwoord op (insert of update). */
export async function upsertBrandAnswer(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('brand_profile')
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )

  if (error) throw new Error(`Failed to save brand answer: ${error.message}`)
}
