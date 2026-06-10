/**
 * Audit + reparatie van corrupte links in blog-content.
 *
 * Gevonden via site-crawl (juni 2026): een eerdere auto-linkificatie heeft
 * trefwoorden BINNEN href-attributen van bestaande links nogmaals gelinkt,
 * waardoor geneste ankers ontstonden:
 *
 *   <a href="/blog/lean-six-sigma-data-analyse-5x-<a href="/blog/...">sneller</a>-inzichten">
 *
 * Dit script herstelt drie problemen:
 *   1. Geneste ankers in hrefs — geïnjecteerde link verwijderen, originele
 *      slug herstellen (iteratief, want soms 2-3 niveaus diep)
 *   2. Dubbel-gewikkelde ankers <a..><a..>tekst</a></a> — buitenste behouden
 *   3. Interne blog-links zonder /blog/-prefix, bekende typo's, en links
 *      naar niet-bestaande slugs (die worden ontlinkt: tekst blijft staan)
 *
 * Gebruik:
 *   npx tsx scripts/audit-blog-links.ts          → dry-run, toont alle wijzigingen
 *   npx tsx scripts/audit-blog-links.ts --fix    → past toe, mét backup-JSON
 *
 * Backup: scripts/backup-blog-content-<timestamp>.json (volledige content
 * van elk gewijzigd artikel — terugzetten kan met een update per id).
 */

import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten in .env.local staan');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const FIX = process.argv.includes('--fix');

/** Bekende slug-correcties die niet automatisch af te leiden zijn. */
const MANUAL_REWRITES: Record<string, string> = {
  '/blog/waarom-worden-dashboards-niet-gebruiid': '/blog/waarom-worden-dashboards-niet-gebruikt',
  '/blog/bi-kosten-calculator': '/tools/bi-kosten-calculator',
};

/**
 * Reparatie-pijplijn: twee transformaties om-en-om tot een vast punt.
 * De corruptie komt in combinaties voor (ankers genest IN hrefs die zelf
 * weer gewikkelde ankers bevatten, tot 5 niveaus diep), dus één pass van
 * elk is niet genoeg — innermost-first itereren wel.
 *
 *   A. unnest  — anker dat IN een href-attribuut is geïnjecteerd weghalen,
 *                de ankertekst terug in de slug zetten:
 *                href="/blog/x-<a href="...">woord</a>-y" → href="/blog/x-woord-y"
 *   B. collapse — direct gewikkelde ankers <a A><a B>tekst</a></a> →
 *                buitenste (originele) anker behouden: <a A>tekst</a>
 */
function repairAnchors(content: string): string {
  let prev = '';
  let cur = content;
  let guard = 0;
  while (cur !== prev && guard < 50) {
    prev = cur;
    guard++;
    // A: innermost anker (schone href, schone label) binnen een open href
    cur = cur.replace(
      /(href="[^"<]*)<a href="[^"<]*"[^>]*>([^<]*)<\/a>/g,
      (_m, before: string, label: string) => `${before}${label}`
    );
    // B: innermost dubbel-wrap — buitenste href wint
    cur = cur.replace(
      /(<a href="[^"<]*"[^>]*>)\s*<a href="[^"<]*"[^>]*>([^<]*)<\/a>\s*<\/a>/g,
      (_m, outer: string, label: string) => `${outer}${label}</a>`
    );
  }
  return cur;
}

/** Stap 3: herschrijf/valideer interne links tegen de echte slug-set. */
function fixInternalLinks(
  content: string,
  validSlugs: Set<string>,
  report: string[]
): string {
  return content.replace(
    /<a href="(\/[^"]*|https:\/\/www\.powerbistudio\.nl\/[^"]*)"([^>]*)>([^<]*)<\/a>/g,
    (full, href: string, attrs: string, label: string) => {
      // Defensief: hrefs die nog corrupt zijn (bevatten '<') NIET aanraken —
      // de eindcheck laat het script dan falen zodat niets half wordt gefixt.
      if (href.includes('<')) return full;
      const path = href.replace('https://www.powerbistudio.nl', '');

      if (MANUAL_REWRITES[path]) {
        report.push(`  herschreven: ${path} -> ${MANUAL_REWRITES[path]}`);
        return `<a href="${MANUAL_REWRITES[path]}"${attrs}>${label}</a>`;
      }

      // Root-level link die eigenlijk een blogpost is → /blog/-prefix
      const bare = path.replace(/^\//, '');
      if (!path.startsWith('/blog/') && validSlugs.has(bare)) {
        report.push(`  prefix toegevoegd: ${path} -> /blog/${bare}`);
        return `<a href="/blog/${bare}"${attrs}>${label}</a>`;
      }

      // Blog-link naar een slug die niet (meer) bestaat → ontlinken
      if (path.startsWith('/blog/')) {
        const slug = path.slice('/blog/'.length).split('/')[0];
        if (slug && !validSlugs.has(slug)) {
          report.push(`  ontlinkt (slug bestaat niet): ${path} ["${label}"]`);
          return label;
        }
      }
      return full;
    }
  );
}

async function main() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, content')
    .eq('status', 'published');
  if (error) throw error;

  const validSlugs = new Set(data!.map((p) => p.slug));
  const changed: { id: string; slug: string; content: string; newContent: string }[] = [];

  for (const post of data!) {
    const report: string[] = [];
    let next = repairAnchors(post.content);
    if (next !== post.content) report.push('  geneste/gewikkelde ankers hersteld');
    next = fixInternalLinks(next, validSlugs, report);

    if (next !== post.content) {
      changed.push({ id: post.id, slug: post.slug, content: post.content, newContent: next });
      console.log(`--- ${post.slug}`);
      report.forEach((r) => console.log(r));
    }
  }

  // Veiligheidscheck: na reparatie mag NERGENS meer een genest patroon zitten
  const stillBroken = changed.filter((c) => /href="[^"]*<a href=/.test(c.newContent));
  if (stillBroken.length) {
    console.error('\n!! Nog corrupt na reparatie (NIET toepassen):');
    stillBroken.forEach((c) => console.error('  ', c.slug));
    process.exit(1);
  }

  console.log(`\nPublished posts: ${data!.length} | te wijzigen: ${changed.length}`);

  if (!FIX) {
    console.log('Dry-run. Run met --fix om toe te passen (schrijft eerst een backup).');
    return;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `scripts/backup-blog-content-${stamp}.json`;
  writeFileSync(
    backupPath,
    JSON.stringify(changed.map(({ id, slug, content }) => ({ id, slug, content })), null, 2)
  );
  console.log(`Backup: ${backupPath}`);

  for (const c of changed) {
    const { error: upErr } = await supabase
      .from('blog_posts')
      .update({ content: c.newContent })
      .eq('id', c.id);
    if (upErr) {
      console.error(`FOUT bij ${c.slug}:`, upErr.message);
      process.exit(1);
    }
    console.log(`bijgewerkt: ${c.slug}`);
  }
  console.log(`\nKlaar — ${changed.length} artikelen hersteld.`);
  console.log('Let op: de pagina-cache ververst binnen 1 uur (unstable_cache TTL).');
}

main();
