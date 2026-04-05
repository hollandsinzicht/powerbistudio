/**
 * Eenmalig migratie-script: haalt alle artikelen uit Soro CMS
 * en importeert ze in de Supabase blog_posts tabel.
 *
 * Gebruik: npx tsx scripts/import-soro.ts
 *
 * Vereist: NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'

const SORO_ID = '00a5a8cb-bae1-4b5c-9e36-53088412e220';
const EMBED_URL = `https://app.trysoro.com/api/embed/${SORO_ID}`;
const ARTICLE_URL = `https://app.trysoro.com/api/embed/${SORO_ID}/article`;

// Laad env vars
const dotenv = await import('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten in .env.local staan');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface SoroRawArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  isoDate: string;
  image: string | null;
}

async function fetchSoroArticles(): Promise<SoroRawArticle[]> {
  console.log('📡 Ophalen van artikelen uit Soro...');
  const res = await fetch(EMBED_URL);
  const script = await res.text();
  const match = script.match(/SORO_ARTICLES\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) {
    console.error('❌ Kon SORO_ARTICLES niet vinden in response');
    return [];
  }
  return JSON.parse(match[1]);
}

async function fetchArticleContent(id: string): Promise<string | null> {
  try {
    const res = await fetch(`${ARTICLE_URL}/${id}`);
    const data = await res.json();
    return data.content ?? null;
  } catch {
    return null;
  }
}

async function main() {
  const articles = await fetchSoroArticles();
  console.log(`📄 ${articles.length} artikelen gevonden`);

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const article of articles) {
    // Check of al bestaat
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', article.slug)
      .maybeSingle();

    if (existing) {
      console.log(`⏩ Overgeslagen (bestaat al): ${article.title}`);
      skipped++;
      continue;
    }

    // Haal content op
    console.log(`📥 Content ophalen: ${article.title}...`);
    const content = await fetchArticleContent(article.id);

    if (!content) {
      console.error(`❌ Geen content voor: ${article.title}`);
      failed++;
      continue;
    }

    // Insert in Supabase
    const { error } = await supabase.from('blog_posts').insert({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      content: content,
      image: article.image,
      status: 'published',
      published_at: article.isoDate || new Date().toISOString(),
      ai_generated: false,
      target_keywords: [],
    });

    if (error) {
      console.error(`❌ Fout bij import van "${article.title}": ${error.message}`);
      failed++;
    } else {
      console.log(`✅ Geïmporteerd: ${article.title}`);
      imported++;
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log('\n📊 Resultaat:');
  console.log(`   ✅ Geïmporteerd: ${imported}`);
  console.log(`   ⏩ Overgeslagen: ${skipped}`);
  console.log(`   ❌ Gefaald: ${failed}`);
  console.log(`   📄 Totaal: ${articles.length}`);
}

main().catch(console.error);
