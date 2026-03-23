export const SORO_ID = '00a5a8cb-bae1-4b5c-9e36-53088412e220';
export const SORO_EMBED_URL = `https://app.trysoro.com/api/embed/${SORO_ID}`;
export const BASE_URL = 'https://www.powerbistudio.nl';

export interface SoroArticle {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    isoDate: string;
    image: string | null;
}

export async function getSoroArticles(): Promise<SoroArticle[]> {
    try {
        const res = await fetch(SORO_EMBED_URL, { next: { revalidate: 3600 } });
        const script = await res.text();

        const match = script.match(/SORO_ARTICLES\s*=\s*(\[[\s\S]*?\]);/);
        if (!match) return [];

        return JSON.parse(match[1]);
    } catch {
        return [];
    }
}

export async function getSoroArticleBySlug(slug: string): Promise<SoroArticle | null> {
    const articles = await getSoroArticles();
    return articles.find((a) => a.slug === slug) || null;
}
