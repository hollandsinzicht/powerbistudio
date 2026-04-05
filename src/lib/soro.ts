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
    {
        slug: 'power-bi',
        name: 'Power BI',
        description: 'Artikelen over Power BI dashboards, performance, rapportages en de overstap van Excel.',
    },
    {
        slug: 'dax-datamodellering',
        name: 'DAX & Datamodellering',
        description: 'Alles over DAX formules, datamodellen en het bouwen van een solide analytische basis.',
    },
    {
        slug: 'data-platform',
        name: 'Data Platform',
        description: 'Artikelen over Azure, Microsoft Fabric, ETL, SQL en cloud data-architectuur.',
    },
    {
        slug: 'strategie',
        name: 'Strategie',
        description: 'Inzichten over data-strategie, besluitvorming en de juiste aanpak voor jouw organisatie.',
    },
    {
        slug: 'fabric-migratie',
        name: 'Fabric & migratie',
        description: 'Alles over de overgang van Power BI Premium naar Microsoft Fabric: licenties, planning en architectuur.',
    },
    {
        slug: 'governance-avg',
        name: 'Governance & AVG',
        description: 'Data governance, AVG-compliance, Row-Level Security en privacy by design in Power BI.',
    },
    {
        slug: 'embedded-analytics',
        name: 'Embedded analytics',
        description: 'Power BI Embedded voor ISVs en SaaS-bedrijven: architectuur, multi-tenant en white-label.',
    },
    {
        slug: 'procesverbetering-bi',
        name: 'Procesverbetering & BI',
        description: 'Lean Six Sigma meets Power BI: hoe je dashboards inzet als middel voor procesverbetering.',
    },
];

// Keywords per category for automatic matching (matched against title + slug + excerpt)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'power-bi': [
        'power bi', 'powerbi', 'dashboard', 'rapport', 'rapportage', 'rapportages',
        'visualisatie', 'visual', 'excel', 'workspace', 'service', 'gateway',
        'embedded', 'paginated', 'row-level security', 'rls', 'pbi',
    ],
    'dax-datamodellering': [
        'dax', 'datamodel', 'data model', 'datamodellering', 'modellering',
        'formule', 'formules', 'measure', 'measures', 'calculated column',
        'star schema', 'dimensie', 'feitentabel', 'relatie', 'relaties',
        'cardinality', 'many-to-many', 'filter context',
    ],
    'data-platform': [
        'azure', 'fabric', 'etl', 'elt', 'sql', 'python', 'pipeline', 'pipelines',
        'datawarehouse', 'data warehouse', 'lakehouse', 'data lake', 'synapse',
        'databricks', 'dataflow', 'dataflows', 'cloud', 'api', 'automatiseren',
        'automatisering', 'integratie', 'brondata', 'bron',
    ],
    'strategie': [
        'strategie', 'overstappen', 'besluit', 'besluitvorming',
        'roadmap', 'organisatie', 'advies', 'wanneer', 'kiezen', 'keuze',
        'volwassenheid', 'maturity', 'adoptie', 'implementatie',
        'kosten', 'roi', 'business case', 'aanpak', 'waar let je op',
    ],
    'fabric-migratie': [
        'fabric', 'migratie', 'migreren', 'premium', 'f-sku', 'onelake', 'capacity',
        'capaciteit', 'p-sku', 'a-sku', 'overstap', 'licentie', 'licenties',
    ],
    'governance-avg': [
        'governance', 'avg', 'privacy', 'gdpr', 'rls', 'row-level', 'beveiliging',
        'audit trail', 'compliance', 'dataclassificatie', 'toegangsbeheer',
    ],
    'embedded-analytics': [
        'embedded', 'embed', 'isv', 'multi-tenant', 'white-label', 'white label',
        'sku', 'portaal', 'portal', 'saas', 'klantportaal',
    ],
    'procesverbetering-bi': [
        'proces', 'lean', 'six sigma', 'dmaic', 'kpi', 'dso', 'bottleneck',
        'cyclustijd', 'waste', 'efficiëntie', 'procesverbetering', 'operationeel',
    ],
};

// --- Articles ---

export interface SoroArticle {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    isoDate: string;
    image: string | null;
    category: Category | null;
}

export async function getArticles(): Promise<SoroArticle[]> {
    try {
        const res = await fetch(EMBED_URL, { next: { revalidate: 3600 } });
        const script = await res.text();
        const match = script.match(/SORO_ARTICLES\s*=\s*(\[[\s\S]*?\]);/);
        if (!match) return [];

        const raw = JSON.parse(match[1]);
        return raw.map((a: Record<string, unknown>) => ({
            ...a,
            category: getCategoryForArticle(
                a.title as string,
                a.slug as string,
                a.excerpt as string,
            ),
        }));
    } catch {
        return [];
    }
}

export async function getArticlesByCategory(categorySlug: string): Promise<SoroArticle[]> {
    const articles = await getArticles();
    return articles.filter((a) => a.category?.slug === categorySlug);
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

function getCategoryForArticle(title: string, slug: string, excerpt: string): Category | null {
    const text = `${title} ${slug.replace(/-/g, ' ')} ${excerpt}`.toLowerCase();

    let bestMatch: string | null = null;
    let bestScore = 0;

    for (const [catSlug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        const score = keywords.reduce((count, kw) => count + (text.includes(kw) ? 1 : 0), 0);
        if (score > bestScore) {
            bestScore = score;
            bestMatch = catSlug;
        }
    }

    if (!bestMatch || bestScore === 0) return null;
    return CATEGORIES.find((c) => c.slug === bestMatch) ?? null;
}
