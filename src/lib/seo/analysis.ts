/**
 * SEO-analyse over de gepubliceerde blog-corpus.
 *
 *  - keywordDensity: per (seed) zoekterm hoe vaak + in welke artikelen
 *  - personaCoverage: voor elke persona cumulatieve dekking
 *  - opportunities: zoektermen waar we nauwelijks over schrijven, gewogen
 *    op priority + persona-importance
 */

import { getAllPosts } from '@/lib/blog-store';
import type { BlogPost } from '@/lib/blog-store';
import {
  KEYWORD_UNIVERSE,
  ALL_PERSONAS,
  type Persona,
  type SeedKeyword,
} from './keyword-universe';

export interface ArticleHit {
  postId: string;
  slug: string;
  title: string;
  status: string;
  /** totaal aantal voorkomens in title+excerpt+content voor dit keyword (of aliases) */
  count: number;
  /** matched termen (term of alias) die we in het artikel vonden */
  matchedTerms: string[];
}

export interface KeywordAnalysis {
  term: string;
  aliases: string[];
  personas: Persona[];
  theme: string;
  priority: 1 | 2 | 3;
  sources: string[];
  /** unieke artikelen die deze term noemen */
  articleCount: number;
  /** totale voorkomens (alle artikelen opgeteld) */
  totalOccurrences: number;
  hits: ArticleHit[];
  /** opportunity = priority * max(0, 3 - articleCount) — hoger = meer winst */
  opportunityScore: number;
}

export interface PersonaCoverage {
  persona: Persona;
  totalKeywords: number;
  coveredKeywords: number; // ≥1 artikel bespreekt de term
  coveragePct: number;
  topGaps: { term: string; priority: number }[];
}

export interface SeoOverview {
  generatedAt: string;
  totalPublished: number;
  keywords: KeywordAnalysis[];
  personaCoverage: PersonaCoverage[];
  summary: {
    totalKeywords: number;
    fullyUncovered: number; // articleCount === 0
    thinlyCovered: number; // articleCount 1-2
    wellCovered: number; // articleCount >= 3
  };
}

// ─── Matching helpers ───────────────────────────────────────────────

function normalize(text: string): string {
  return text.toLowerCase();
}

/**
 * Telt hoe vaak `needle` (als word-boundary-gebonden, case-insensitive)
 * voorkomt in `haystack`. Werkt voor multi-word termen.
 */
function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  const n = needle.toLowerCase().trim();
  const h = haystack.toLowerCase();
  // Escape regex-specials in needle, treat as phrase with word boundaries on edges
  const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Gebruik \b alleen als het woord begint/eindigt met een word-char — anders fallback
  const startBoundary = /\w/.test(n[0]) ? '\\b' : '';
  const endBoundary = /\w/.test(n[n.length - 1]) ? '\\b' : '';
  const re = new RegExp(`${startBoundary}${escaped}${endBoundary}`, 'g');
  const matches = h.match(re);
  return matches ? matches.length : 0;
}

function collectMatchesForKeyword(
  post: BlogPost,
  seed: SeedKeyword,
): { count: number; matchedTerms: string[] } {
  const body = `${post.title}\n${post.excerpt}\n${post.content}`;
  const terms = [seed.term, ...(seed.aliases || [])];
  const matched: string[] = [];
  let total = 0;
  for (const t of terms) {
    const c = countOccurrences(body, t);
    if (c > 0) {
      matched.push(t);
      total += c;
    }
  }
  return { count: total, matchedTerms: matched };
}

// ─── Core analyse ───────────────────────────────────────────────────

export async function computeSeoOverview(): Promise<SeoOverview> {
  const allPosts = await getAllPosts();
  const published = allPosts.filter((p) => p.status === 'published');

  const keywords: KeywordAnalysis[] = KEYWORD_UNIVERSE.map((seed) => {
    const hits: ArticleHit[] = [];
    for (const post of published) {
      const { count, matchedTerms } = collectMatchesForKeyword(post, seed);
      if (count > 0) {
        hits.push({
          postId: post.id,
          slug: post.slug,
          title: post.title,
          status: post.status,
          count,
          matchedTerms,
        });
      }
    }
    // sorteer hits per artikel-count desc
    hits.sort((a, b) => b.count - a.count);
    const articleCount = hits.length;
    const totalOccurrences = hits.reduce((s, h) => s + h.count, 0);
    const gap = Math.max(0, 3 - articleCount);
    const opportunityScore = seed.priority * gap;
    return {
      term: seed.term,
      aliases: seed.aliases || [],
      personas: seed.personas,
      theme: seed.theme,
      priority: seed.priority,
      sources: seed.sources,
      articleCount,
      totalOccurrences,
      hits,
      opportunityScore,
    };
  });

  // Persona coverage
  const personaCoverage: PersonaCoverage[] = ALL_PERSONAS.map((persona) => {
    const relevant = keywords.filter((k) =>
      k.personas.includes(persona as Persona),
    );
    const covered = relevant.filter((k) => k.articleCount > 0);
    const topGaps = relevant
      .filter((k) => k.articleCount === 0)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5)
      .map((k) => ({ term: k.term, priority: k.priority }));

    return {
      persona,
      totalKeywords: relevant.length,
      coveredKeywords: covered.length,
      coveragePct: relevant.length === 0 ? 0 : Math.round((covered.length / relevant.length) * 100),
      topGaps,
    };
  });

  const summary = {
    totalKeywords: keywords.length,
    fullyUncovered: keywords.filter((k) => k.articleCount === 0).length,
    thinlyCovered: keywords.filter((k) => k.articleCount >= 1 && k.articleCount <= 2).length,
    wellCovered: keywords.filter((k) => k.articleCount >= 3).length,
  };

  return {
    generatedAt: new Date().toISOString(),
    totalPublished: published.length,
    keywords: keywords.sort((a, b) => b.opportunityScore - a.opportunityScore),
    personaCoverage,
    summary,
  };
}
