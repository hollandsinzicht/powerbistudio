import { supabase } from './supabase'
import { DEFAULT_BRAND_ID, type BrandId } from './brands'

// Key/value persistentie van de merkprofiel-antwoorden.
// Eén rij per kennispunt (key = kennispunt-id) i.p.v. één jsonb-blob:
// atomaire saves, geen race-conditions, makkelijk uitbreidbaar.
//
// Brand-scheiding via key-prefixing op dezelfde tabel (geen DB-migratie nodig):
// Power BI Studio = geen prefix (backwards compatible met bestaande rijen),
// overige brands = "<brandId>:" als prefix. Zo blijven de antwoorden per
// bedrijf gescheiden zonder extra kolom.

export type BrandAnswers = Record<string, string>

/** Prefix voor de gegeven brand. Default-brand = leeg (geen prefix). */
function brandPrefix(brand: BrandId): string {
  return brand === DEFAULT_BRAND_ID ? '' : `${brand}:`
}

/**
 * Leest de ingevulde kennispunt-antwoorden voor één brand en strip't de prefix,
 * zodat de keys weer pure kennispunt-id's zijn. De default-brand krijgt alle
 * rijen zónder ":"-prefix; andere brands alleen hun eigen geprefixte rijen.
 */
export async function getBrandAnswers(
  brand: BrandId = DEFAULT_BRAND_ID
): Promise<BrandAnswers> {
  const { data, error } = await supabase
    .from('brand_profile')
    .select('key, value')

  if (error) throw new Error(`Failed to get brand answers: ${error.message}`)

  const prefix = brandPrefix(brand)
  const answers: BrandAnswers = {}
  for (const row of data || []) {
    const key = row.key as string | undefined
    if (!key) continue

    if (prefix) {
      // Geprefixte brand: alleen eigen rijen, prefix eraf.
      if (key.startsWith(prefix)) {
        answers[key.slice(prefix.length)] = (row.value as string) ?? ''
      }
    } else {
      // Default-brand: alle rijen die niet bij een andere brand horen.
      if (!key.includes(':')) {
        answers[key] = (row.value as string) ?? ''
      }
    }
  }
  return answers
}

/** Slaat één kennispunt-antwoord op (insert of update) voor één brand. */
export async function upsertBrandAnswer(
  brand: BrandId,
  key: string,
  value: string
): Promise<void> {
  const storedKey = `${brandPrefix(brand)}${key}`
  const { error } = await supabase
    .from('brand_profile')
    .upsert(
      { key: storedKey, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )

  if (error) throw new Error(`Failed to save brand answer: ${error.message}`)
}
