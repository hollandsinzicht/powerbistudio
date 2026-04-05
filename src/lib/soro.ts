export const SORO_ID = '00a5a8cb-bae1-4b5c-9e36-53088412e220';
export const BASE_URL = 'https://www.powerbistudio.nl';

const EMBED_URL = `https://app.trysoro.com/api/embed/${SORO_ID}`;
const ARTICLE_URL = `https://app.trysoro.com/api/embed/${SORO_ID}/article`;

// --- Categories ---

export interface Category {
    slug: string;
    name: string;
    description: string;
}

export const CATEGORIES: Category[] = [
    { slug: 'power-bi', name: 'Power BI', description: 'Artikelen over Power BI dashboards, performance, rapportages en de overstap van Excel.' },
    { slug: 'dax-datamodellering', name: 'DAX & Datamodellering', description: 'Alles over DAX formules, datamodellen en het bouwen van een solide analytische basis.' },
    { slug: 'data-platform', name: 'Data Platform', description: 'Artikelen over Azure, Microsoft Fabric, ETL, SQL en cloud data-architectuur.' },
    { slug: 'strategie', name: 'Strategie', description: 'Inzichten over data-strategie, besluitvorming en de juiste aanpak voor jouw organisatie.' },
    { slug: 'fabric-migratie', name: 'Fabric & migratie', description: 'Alles over de overgang van Power BI Premium naar Microsoft Fabric: licenties, planning en architectuur.' },
    { slug: 'governance-avg', name: 'Governance & AVG', description: 'Data governance, AVG-compliance, Row-Level Security en privacy by design in Power BI.' },
    { slug: 'embedded-analytics', name: 'Embedded analytics', description: 'Power BI Embedded voor ISVs en SaaS-bedrijven: architectuur, multi-tenant en white-label.' },
    { slug: 'procesverbetering-bi', name: 'Procesverbetering & BI', description: 'Lean Six Sigma meets Power BI: hoe je dashboards inzet als middel voor procesverbetering.' },
];

// --- Weighted keyword scoring ---
// weight 3 = highly specific (definitief voor deze categorie)
// weight 2 = moderately specific (sterk suggestief maar kan elders voorkomen)
// weight 1 = generic (verschijnt in bijna elk BI-artikel)

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
    ],
    'dax-datamodellering': [
        { term: 'dax', weight: 3 }, { term: 'datamodel', weight: 3 }, { term: 'datamodellering', weight: 3 },
        { term: 'data model', weight: 3 }, { term: 'calculated column', weight: 3 },
        { term: 'star schema', weight: 3 }, { term: 'feitentabel', weight: 3 },
        { term: 'cardinality', weight: 3 }, { term: 'many-to-many', weight: 3 }, { term: 'filter context', weight: 3 },
        { term: 'modellering', weight: 2 }, { term: 'formule', weight: 2 }, { term: 'formules', weight: 2 },
        { term: 'measure', weight: 2 }, { term: 'measures', weight: 2 }, { term: 'dimensie', weight: 2 },
        { term: 'relatie', weight: 1 }, { term: 'relaties', weight: 1 },
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
    ],
    'strategie': [
        { term: 'strategie', weight: 3 }, { term: 'roadmap', weight: 3 },
        { term: 'volwassenheid', weight: 3 }, { term: 'maturity', weight: 3 }, { term: 'business case', weight: 3 },
        { term: 'overstappen', weight: 2 }, { term: 'besluit', weight: 2 }, { term: 'besluitvorming', weight: 2 },
        { term: 'adoptie', weight: 2 }, { term: 'roi', weight: 2 }, { term: 'waar let je op', weight: 2 },
        { term: 'organisatie', weight: 1 }, { term: 'advies', weight: 1 }, { term: 'kiezen', weight: 1 },
        { term: 'keuze', weight: 1 }, { term: 'implementatie', weight: 1 }, { term: 'kosten', weight: 1 },
        { term: 'aanpak', weight: 1 },
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
    ],
};

const CATEGORY_THRESHOLD = 3;

// --- Articles ---

export interface SoroArticle {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    isoDate: string;
    image: string | null;
    categories: Category[];
    /** @deprecated Gebruik `categories` — dit is backward-compat alias voor `categories[0]` */
    category: Category | null;
}

export async function getArticles(): Promise<SoroArticle[]> {
    try {
        const res = await fetch(EMBED_URL, { next: { revalidate: 3600 } });
        const script = await res.text();
        const match = script.match(/SORO_ARTICLES\s*=\s*(\[[\s\S]*?\]);/);
        if (!match) return [];

        const raw = JSON.parse(match[1]);
        return raw.map((a: Record<string, unknown>) => {
            const categories = getCategoriesForArticle(
                a.title as string,
                a.slug as string,
                a.excerpt as string,
            );
            return {
                ...a,
                categories,
                category: categories[0] ?? null,
            };
        });
    } catch {
        return [];
    }
}

export async function getArticlesByCategory(categorySlug: string): Promise<SoroArticle[]> {
    const articles = await getArticles();
    return articles.filter((a) => a.categories.some((c) => c.slug === categorySlug));
}

export async function getArticleBySlug(slug: string): Promise<SoroArticle | null> {
    const articles = await getArticles();
    return articles.find((a) => a.slug === slug) ?? null;
}

export async function getArticleContent(id: string): Promise<string | null> {
    try {
        const res = await fetch(`${ARTICLE_URL}/${id}`, { next: { revalidate: 3600 } });
        const data = await res.json();
        return data.content ?? null;
    } catch {
        return null;
    }
}

export function getCategoryBySlug(slug: string): Category | null {
    return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

function getCategoriesForArticle(title: string, slug: string, excerpt: string): Category[] {
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
