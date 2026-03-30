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
];

// Article slug → category slug mapping
const ARTICLE_CATEGORIES: Record<string, string> = {
    'power-bi-performance-verbeteren': 'power-bi',
    'power-bi-dashboard-laten-maken': 'power-bi',
    'wanneer-overstappen-van-excel-naar-power-bi': 'power-bi',
    'dax-formules-laten-schrijven': 'dax-datamodellering',
    'hoe-maak-je-een-goed-datamodel': 'dax-datamodellering',
    'azure-data-platform-opzetten-zonder-ruis': 'data-platform',
    'microsoft-fabric-implementatie': 'data-platform',
    'etl-proces-automatiseren-met-python': 'data-platform',
    'sql-voor-power-bi-rapportages': 'data-platform',
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
            category: getCategoryForArticle(a.slug as string),
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

function getCategoryForArticle(articleSlug: string): Category | null {
    const catSlug = ARTICLE_CATEGORIES[articleSlug];
    if (!catSlug) return null;
    return CATEGORIES.find((c) => c.slug === catSlug) ?? null;
}
