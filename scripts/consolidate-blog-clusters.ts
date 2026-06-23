/**
 * Consolidatie van kannibaliserende blog-clusters (SEO-fix, juni 2026).
 *
 * Achtergrond: ~67 AI-blogs in een smalle niche concurreren onderling om
 * dezelfde zoektermen. Per cluster houden we de pagina met de meeste
 * autoriteit (GSC-impressies/positie) en voegen de dubbele post daarin op.
 *
 * Wat dit script doet, per merge:
 *   1. Hangt de content van de OPGAANDE post onder die van de KEEPER, in een
 *      duidelijk gemarkeerd blok dat jij daarna handmatig ontdubbelt + van
 *      HR-context voorziet (verzuim / medewerker-dimensie / peildatum).
 *   2. Bumpt de keeper z'n updated_at (verse dateModified voor Google).
 *   3. Zet de opgaande post op status='archived' (uit de index).
 *
 * Het script raakt GEEN redirects aan — de 301's staan in next.config.ts
 * (review-baar in de diff). VOLGORDE bij uitrol:
 *   1) Deploy eerst de next.config.ts-redirects (opgaande slug → keeper).
 *      Dan redirecten de oude URL's al naar een relevante pagina (geen 404).
 *   2) Draai daarna dit script om de keeper te verrijken + de post te archiveren.
 *
 * Gebruik:
 *   npx tsx scripts/consolidate-blog-clusters.ts            → DRY-RUN (toont plan, schrijft niets)
 *   npx tsx scripts/consolidate-blog-clusters.ts --commit   → voert uit, mét backup-JSON
 *
 * Vereist: NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY in .env.local
 * Idempotent: een reeds-samengevoegde post wordt overgeslagen (marker-check).
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten in .env.local staan')
  process.exit(1)
}
const supabase = createClient(supabaseUrl, supabaseKey)

const COMMIT = process.argv.includes('--commit')

// ---------------------------------------------------------------------------
// De merges. Keeper = behouden (meeste autoriteit); absorb = gaat erin op.
// Differentiëren/spoke-acties (Fabric ROI, sterrenmodel, copilot-uitgelegd)
// staan hier BEWUST NIET in — die blijven aparte URL's.
// ---------------------------------------------------------------------------
interface Merge {
  cluster: string
  keeper: string
  absorb: string
  /** Redactie-hint die in het merge-blok terechtkomt. */
  hrHint: string
}

const MERGES: Merge[] = [
  {
    cluster: 'DAX-fundament',
    keeper: 'complete-dax-gids-power-bi-calculate-calculation-groups',
    absorb: 'dax-calculate-volledig-uitgelegd-power-bi-measure',
    hrHint: 'CALCULATE-voorbeeld op een verzuim-measure met peildatum-filter',
  },
  {
    cluster: 'DAX-performance',
    keeper: 'dax-performance-optimalisatie-technieken-snellere-modellen',
    absorb: 'dax-variables-var-return-performance-optimalisatie',
    hrHint: 'VAR-refactor op een medewerker-/FTE-measure',
  },
  {
    cluster: 'Datamodel',
    keeper: 'datamodellering-power-bi-complete-gids-schaalbare-semantische-modellen',
    absorb: 'hoe-maak-je-een-goed-datamodel',
    hrHint: 'sterschema voor een HR-model (medewerker-dimensie + verzuim-feit)',
  },
  {
    cluster: 'Audit',
    keeper: 'power-bi-rapport-audit-checklist-15-fouten',
    absorb: 'power-bi-audit-6-signalen-tijd-review',
    hrHint: 'maak de "wanneer heb je een audit nodig"-signalen concreet op een HR-dashboard',
  },
  {
    cluster: 'Copilot-ready',
    keeper: 'semantic-model-copilot-ready-problemen-oplossen',
    absorb: 'bestaand-model-copilot-ready-migratiehandleiding',
    hrHint: 'Copilot-ready maken van een HR-semantic-model',
  },
  {
    cluster: 'Excel-overstap',
    keeper: 'power-bi-versus-excel-wanneer-overstappen',
    absorb: 'wanneer-overstappen-van-excel-naar-power-bi',
    hrHint: '"van Excel-verzuimlijst naar Power BI" als rode draad',
  },
]

interface PostRow {
  id: string
  slug: string
  title: string
  status: string
  content: string
  updated_at: string
}

function mergeMarker(absorbSlug: string): string {
  return `<!-- SAMENGEVOEGD-UIT:${absorbSlug} -->`
}

async function fetchBySlug(slug: string): Promise<PostRow | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, status, content, updated_at')
    .eq('slug', slug)
    .maybeSingle()
  if (error) {
    console.error(`   ⚠️  DB-fout bij ${slug}: ${error.message}`)
    return null
  }
  return data as PostRow | null
}

async function main() {
  console.log(`\n=== Blog-cluster-consolidatie — ${COMMIT ? '🔴 COMMIT (schrijft!)' : '🟢 DRY-RUN'} ===\n`)

  const backup: PostRow[] = []
  const plan: { cluster: string; action: string }[] = []

  for (const m of MERGES) {
    console.log(`▸ ${m.cluster}`)
    const keeper = await fetchBySlug(m.keeper)
    const absorb = await fetchBySlug(m.absorb)

    if (!keeper) {
      console.log(`   ⛔ keeper niet gevonden (${m.keeper}) — cluster overgeslagen\n`)
      plan.push({ cluster: m.cluster, action: 'OVERGESLAGEN: keeper ontbreekt' })
      continue
    }
    if (!absorb) {
      console.log(`   ⛔ op te gane post niet gevonden (${m.absorb}) — cluster overgeslagen\n`)
      plan.push({ cluster: m.cluster, action: 'OVERGESLAGEN: absorb ontbreekt' })
      continue
    }

    const marker = mergeMarker(m.absorb)
    const alreadyMerged = keeper.content.includes(marker)
    const alreadyArchived = absorb.status === 'archived'

    if (alreadyMerged && alreadyArchived) {
      console.log(`   ✓ al geconsolideerd — overgeslagen\n`)
      plan.push({ cluster: m.cluster, action: 'al gedaan' })
      continue
    }

    console.log(`   keeper : ${keeper.slug} (${keeper.status})`)
    console.log(`   absorb : ${absorb.slug} (${absorb.status}) → in keeper + archiveren`)
    console.log(`   HR-hint: ${m.hrHint}`)

    // Backup van beide rijen vóór wijziging.
    backup.push(keeper, absorb)

    const mergedBlock =
      `\n\n${marker}\n` +
      `<!-- ▼ REDIGEER: ontdubbel deze sectie t.o.v. het artikel hierboven en geef HR-context: ${m.hrHint}. Verwijder deze comments als klaar. ▼ -->\n` +
      `<h2>Samengevoegd: ${absorb.title}</h2>\n` +
      absorb.content +
      `\n<!-- ▲ EINDE samengevoegd uit /blog/${m.absorb} ▲ -->\n`

    if (!COMMIT) {
      console.log(`   (dry-run) zou keeper-content met ~${absorb.content.length} tekens uitbreiden en absorb archiveren\n`)
      plan.push({ cluster: m.cluster, action: `${m.absorb} → ${m.keeper}` })
      continue
    }

    // 1) Keeper verrijken (tenzij al gemerged) + updated_at bumpen.
    if (!alreadyMerged) {
      const { error: upErr } = await supabase
        .from('blog_posts')
        .update({ content: keeper.content + mergedBlock, updated_at: new Date().toISOString() })
        .eq('id', keeper.id)
      if (upErr) {
        console.log(`   ❌ keeper-update mislukt: ${upErr.message} — absorb NIET gearchiveerd\n`)
        plan.push({ cluster: m.cluster, action: `FOUT keeper-update: ${upErr.message}` })
        continue
      }
    }

    // 2) Absorb archiveren.
    if (!alreadyArchived) {
      const { error: arErr } = await supabase
        .from('blog_posts')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', absorb.id)
      if (arErr) {
        console.log(`   ❌ archiveren mislukt: ${arErr.message}\n`)
        plan.push({ cluster: m.cluster, action: `FOUT archiveren: ${arErr.message}` })
        continue
      }
    }

    console.log(`   ✅ samengevoegd + gearchiveerd\n`)
    plan.push({ cluster: m.cluster, action: `${m.absorb} → ${m.keeper} ✅` })
  }

  if (COMMIT && backup.length > 0) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const file = join('scripts', `backup-consolidate-${stamp}.json`)
    writeFileSync(file, JSON.stringify(backup, null, 2))
    console.log(`💾 Backup van ${backup.length} rijen weggeschreven: ${file}`)
  }

  console.log('\n=== Samenvatting ===')
  for (const p of plan) console.log(`  • ${p.cluster.padEnd(16)} ${p.action}`)
  console.log(
    COMMIT
      ? '\n✅ Klaar. Controleer de keepers in je admin: ontdubbel de samengevoegde blokken + voeg HR-context toe.'
      : '\nℹ️  Dit was een dry-run. Draai met --commit om uit te voeren (na het deployen van de next.config.ts-redirects).',
  )
}

main().catch((e) => {
  console.error('Fataal:', e)
  process.exit(1)
})
