/**
 * Blog data layer — oorspronkelijk Soro CMS, nu Supabase-backed.
 *
 * Alle exports blijven identiek zodat blog-pagina's, ArticleCard,
 * BlogCTA en sitemap NIET aangepast hoeven te worden.
 */

import {
    getPublishedPosts,
    getPublishedPostsByType,
    getPostBySlug as getStorePostBySlug,
    getPostsByIds,
} from './blog-store'
import type { BlogPost } from './blog-store'
import type { ArticleType } from './blog-archetypes'

export const BASE_URL = 'https://www.powerbistudio.nl';

// --- Categories ---

export interface Category {
    slug: string;
    name: string;
    description: string;
}

export const CATEGORIES: Category[] = [
    { slug: 'power-bi', name: 'Power BI', description: 'Power BI voor HR-rapportage: dashboards, performance en de overstap van Excel naar betrouwbare HR-analytics.' },
    { slug: 'dax-datamodellering', name: 'DAX & Datamodellering', description: 'DAX-formules en datamodellen voor HR-data: medewerker- en verzuim-modellen, sterschema voor HR, peildatum-logica.' },
    { slug: 'data-platform', name: 'Data Platform', description: 'Azure, Microsoft Fabric, ETL en cloud-architectuur — toegepast op HR-data uit AFAS, Visma en Nmbrs.' },
    { slug: 'strategie', name: 'Strategie', description: 'Data-strategie voor HR-teams in mid-market werkgevers (250-2.000 FTE): aanpak, volwassenheid en besluitvorming.' },
    { slug: 'fabric-migratie', name: 'Fabric & migratie', description: 'Wanneer en hoe HR-organisaties van Power BI Premium naar Microsoft Fabric migreren: licenties, planning, architectuur.' },
    { slug: 'governance-avg', name: 'Governance & AVG', description: 'AVG, RLS en governance — specifiek voor HR-data (medewerkers, salaris, verzuim). DPO-cockpit, bewaartermijnen, hiërarchische toegang.' },
    { slug: 'embedded-analytics', name: 'Embedded analytics', description: 'Legacy categorie: Power BI Embedded voor SaaS-bedrijven. Niet langer kernpropositie van Power BI Studio.' },
    { slug: 'procesverbetering-bi', name: 'Procesverbetering & BI', description: 'Lean Six Sigma en DMAIC toegepast op HR-processen: verzuim-meldcyclus, time-to-hire, formatie-realisatie via Power BI.' },
];

// --- Weighted keyword scoring ---

interface WeightedKeyword {
    term: string;
    weight: number;
}

const CATEGORY_KEYWORDS: Record<string, WeightedKeyword[]> = {
    'power-bi': [
        { term: 'power bi', weight: 3 }, { term: 'powerbi', weight: 3 }, { term: 'pbi', weight: 3 },
        { term: 'paginated', weight: 2 }, { term: 'gateway', weight: 2 },
        { term: 'dashboard', weight: 1 }, { term: 'rapport', weight: 1 }, { term: 'rapportage', weight: 1 },
        { term: 'rapportages', weight: 1 }, { term: 'visualisatie', weight: 1 }, { term: 'visual', weight: 1 },
        { term: 'excel', weight: 1 }, { term: 'workspace', weight: 1 }, { term: 'service', weight: 1 },
        // HR-relevantie: gangbare HR-rapportages versterken
        // de Power BI-categorie als ze in een artikel staan.
        { term: 'hr-dashboard', weight: 2 }, { term: 'verzuimdashboard', weight: 2 },
        { term: 'formatie-dashboard', weight: 2 }, { term: 'hr-rapportage', weight: 2 },
    ],
    'dax-datamodellering': [
        { term: 'dax', weight: 3 }, { term: 'datamodel', weight: 3 }, { term: 'datamodellering', weight: 3 },
        { term: 'data model', weight: 3 }, { term: 'calculated column', weight: 3 },
        { term: 'star schema', weight: 3 }, { term: 'feitentabel', weight: 3 },
        { term: 'cardinality', weight: 3 }, { term: 'many-to-many', weight: 3 }, { term: 'filter context', weight: 3 },
        { term: 'modellering', weight: 2 }, { term: 'formule', weight: 2 }, { term: 'formules', weight: 2 },
        { term: 'measure', weight: 2 }, { term: 'measures', weight: 2 }, { term: 'dimensie', weight: 2 },
        { term: 'relatie', weight: 1 }, { term: 'relaties', weight: 1 },
        // HR-relevantie: HR-modelleerpatronen
        { term: 'type-2 historiek', weight: 3 }, { term: 'scd2', weight: 3 },
        { term: 'peildatum', weight: 3 }, { term: 'medewerker-dimensie', weight: 3 },
        { term: 'medewerkertabel', weight: 2 },
    ],
    'data-platform': [
        { term: 'etl', weight: 3 }, { term: 'elt', weight: 3 }, { term: 'datawarehouse', weight: 3 },
        { term: 'data warehouse', weight: 3 }, { term: 'lakehouse', weight: 3 }, { term: 'data lake', weight: 3 },
        { term: 'synapse', weight: 3 }, { term: 'databricks', weight: 3 },
        { term: 'azure', weight: 2 }, { term: 'sql', weight: 2 }, { term: 'python', weight: 2 },
        { term: 'pipeline', weight: 2 }, { term: 'pipelines', weight: 2 }, { term: 'dataflow', weight: 2 },
        { term: 'dataflows', weight: 2 }, { term: 'brondata', weight: 2 },
        { term: 'cloud', weight: 1 }, { term: 'api', weight: 1 }, { term: 'automatiseren', weight: 1 },
        { term: 'automatisering', weight: 1 }, { term: 'integratie', weight: 1 }, { term: 'bron', weight: 1 },
        // HR-relevantie: HR-bronsystemen
        { term: 'afas', weight: 3 }, { term: 'visma', weight: 3 }, { term: 'nmbrs', weight: 3 },
        { term: 'profit', weight: 2 }, { term: 'youserve', weight: 2 },
    ],
    'strategie': [
        { term: 'strategie', weight: 3 }, { term: 'roadmap', weight: 3 },
        { term: 'volwassenheid', weight: 3 }, { term: 'maturity', weight: 3 }, { term: 'business case', weight: 3 },
        { term: 'overstappen', weight: 2 }, { term: 'besluit', weight: 2 }, { term: 'besluitvorming', weight: 2 },
        { term: 'adoptie', weight: 2 }, { term: 'roi', weight: 2 }, { term: 'waar let je op', weight: 2 },
        { term: 'organisatie', weight: 1 }, { term: 'advies', weight: 1 }, { term: 'kiezen', weight: 1 },
        { term: 'keuze', weight: 1 }, { term: 'implementatie', weight: 1 }, { term: 'kosten', weight: 1 },
        { term: 'aanpak', weight: 1 },
        // HR-relevantie: HR-strategie context
        { term: 'hr-analytics', weight: 3 }, { term: 'people analytics', weight: 3 },
        { term: 'hr-strategie', weight: 3 }, { term: 'mid-market', weight: 2 },
    ],
    'fabric-migratie': [
        { term: 'fabric', weight: 3 }, { term: 'migratie', weight: 3 }, { term: 'migreren', weight: 3 },
        { term: 'f-sku', weight: 3 }, { term: 'onelake', weight: 3 }, { term: 'p-sku', weight: 3 },
        { term: 'a-sku', weight: 3 },
        { term: 'premium', weight: 2 }, { term: 'capacity', weight: 2 }, { term: 'capaciteit', weight: 2 },
        { term: 'overstap', weight: 2 }, { term: 'licentie', weight: 2 }, { term: 'licenties', weight: 2 },
    ],
    'governance-avg': [
        { term: 'governance', weight: 3 }, { term: 'avg', weight: 3 }, { term: 'privacy', weight: 3 },
        { term: 'gdpr', weight: 3 }, { term: 'audit trail', weight: 3 }, { term: 'compliance', weight: 3 },
        { term: 'dataclassificatie', weight: 3 }, { term: 'toegangsbeheer', weight: 3 },
        { term: 'rls', weight: 2 }, { term: 'row-level', weight: 2 }, { term: 'beveiliging', weight: 2 },
        // HR-relevantie: HR is de zwaarste AVG-use-case
        { term: 'dpo', weight: 3 }, { term: 'functionaris gegevensbescherming', weight: 3 },
        { term: 'verwerkingsregister', weight: 3 }, { term: 'bewaartermijn', weight: 3 },
        { term: 'medewerkersgegevens', weight: 3 }, { term: 'personeelsgegevens', weight: 3 },
        { term: 'salaris', weight: 2 }, { term: 'organisatie-hi\u00ebrarchie', weight: 3 },
        { term: 'hi\u00ebrarchische rls', weight: 3 }, { term: 'manager-rol', weight: 2 },
    ],
    'embedded-analytics': [
        { term: 'embed', weight: 3 }, { term: 'isv', weight: 3 }, { term: 'multi-tenant', weight: 3 },
        { term: 'white-label', weight: 3 }, { term: 'white label', weight: 3 }, { term: 'klantportaal', weight: 3 },
        { term: 'embedded', weight: 2 }, { term: 'portaal', weight: 2 }, { term: 'portal', weight: 2 },
        { term: 'saas', weight: 2 },
    ],
    'procesverbetering-bi': [
        { term: 'lean', weight: 3 }, { term: 'six sigma', weight: 3 }, { term: 'dmaic', weight: 3 },
        { term: 'dso', weight: 3 }, { term: 'bottleneck', weight: 3 }, { term: 'cyclustijd', weight: 3 },
        { term: 'procesverbetering', weight: 3 },
        { term: 'kpi', weight: 2 }, { term: 'waste', weight: 2 }, { term: 'operationeel', weight: 2 },
        { term: 'proces', weight: 1 }, { term: 'efficiëntie', weight: 1 },
        // HR-relevantie: HR-processen die met DMAIC verbeterd kunnen worden
        { term: 'verzuim', weight: 3 }, { term: 'verzuimpercentage', weight: 3 },
        { term: 'instroom', weight: 3 }, { term: 'uitstroom', weight: 3 },
        { term: 'doorstroom', weight: 3 }, { term: 'time-to-hire', weight: 3 },
        { term: 'formatie', weight: 3 }, { term: 'formatie-realisatie', weight: 3 },
        { term: 'onboarding', weight: 2 }, { term: 'recruitment', weight: 2 },
        { term: 'verzuim-meldcyclus', weight: 3 },
    ],
};

const CATEGORY_THRESHOLD = 3;

// --- Articles interface (backward compatible) ---

export interface SoroArticle {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    isoDate: string;
    /** ISO timestamp van laatste wijziging — voor Article Rich Results (dateModified) */
    isoModified: string;
    image: string | null;
    categories: Category[];
    /** @deprecated Gebruik `categories` — backward-compat alias voor `categories[0]` */
    category: Category | null;
    /** Content-type: 'blog' (regulier) of 'pillar' (hub-and-spoke gids). */
    articleType: ArticleType;
    /** UUIDs van spoke-posts; alleen ≠ [] wanneer articleType === 'pillar'. */
    spokePostIds: string[];
}

// --- Helper: BlogPost → SoroArticle ---

function toSoroArticle(post: BlogPost): SoroArticle {
    const categories = getCategoriesForArticle(post.title, post.slug, post.excerpt);
    const publishedDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at);
    const modifiedDate = post.updated_at ? new Date(post.updated_at) : publishedDate;

    return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        date: publishedDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }),
        isoDate: publishedDate.toISOString(),
        isoModified: modifiedDate.toISOString(),
        image: post.image,
        categories,
        category: categories[0] ?? null,
        articleType: post.article_type ?? 'blog',
        spokePostIds: post.spoke_post_ids ?? [],
    };
}

// --- Public API (zelfde exports als voorheen) ---

export async function getArticles(): Promise<SoroArticle[]> {
    try {
        const posts = await getPublishedPosts();
        return posts.map(toSoroArticle);
    } catch {
        return [];
    }
}

/**
 * Alleen reguliere blog-artikelen (article_type='blog'). Pillars worden
 * uitgesloten zodat ze in een aparte sectie op /blog gerenderd kunnen worden.
 */
export async function getBlogArticles(): Promise<SoroArticle[]> {
    try {
        const posts = await getPublishedPostsByType('blog');
        return posts.map(toSoroArticle);
    } catch {
        return [];
    }
}

/**
 * Alleen pillar-gidsen (article_type='pillar'). Voor de "Complete gidsen"
 * sectie op /blog en voor admin-checks.
 */
export async function getPillars(): Promise<SoroArticle[]> {
    try {
        const posts = await getPublishedPostsByType('pillar');
        return posts.map(toSoroArticle);
    } catch {
        return [];
    }
}

/**
 * Resolveer de spokes van een pillar in de oorspronkelijke volgorde van
 * spokePostIds. Posts die niet meer published zijn worden weggefilterd.
 */
export async function getSpokes(article: SoroArticle): Promise<SoroArticle[]> {
    if (article.articleType !== 'pillar' || article.spokePostIds.length === 0) {
        return [];
    }
    try {
        const posts = await getPostsByIds(article.spokePostIds);
        return posts.map(toSoroArticle);
    } catch {
        return [];
    }
}

export async function getArticlesByCategory(categorySlug: string): Promise<SoroArticle[]> {
    const articles = await getArticles();
    return articles.filter((a) => a.categories.some((c) => c.slug === categorySlug));
}

export async function getArticleBySlug(slug: string): Promise<SoroArticle | null> {
    try {
        const post = await getStorePostBySlug(slug);
        if (!post) return null;
        return toSoroArticle(post);
    } catch {
        return null;
    }
}

export async function getArticleContent(id: string): Promise<string | null> {
    try {
        // Content is al opgeslagen in blog_posts — we hoeven geen aparte fetch te doen
        const { data, error } = await (await import('./supabase')).supabase
            .from('blog_posts')
            .select('content')
            .eq('id', id)
            .eq('status', 'published')
            .maybeSingle();

        if (error || !data) return null;
        return data.content;
    } catch {
        return null;
    }
}

export function getCategoryBySlug(slug: string): Category | null {
    return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

// --- Category scoring (exported for reuse in blog-writer) ---

export function getCategoriesForArticle(title: string, slug: string, excerpt: string): Category[] {
    const text = `${title} ${slug.replace(/-/g, ' ')} ${excerpt}`.toLowerCase();

    const scored: { slug: string; score: number }[] = [];

    for (const [catSlug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        const score = keywords.reduce(
            (total, kw) => total + (text.includes(kw.term) ? kw.weight : 0),
            0,
        );
        if (score >= CATEGORY_THRESHOLD) {
            scored.push({ slug: catSlug, score });
        }
    }

    scored.sort((a, b) => b.score - a.score);

    return scored
        .map((s) => CATEGORIES.find((c) => c.slug === s.slug))
        .filter((c): c is Category => c !== undefined);
}
