import type { MetadataRoute } from 'next';

const SORO_EMBED_URL = 'https://app.trysoro.com/api/embed/00a5a8cb-bae1-4b5c-9e36-53088412e220';

async function getSoroPosts(): Promise<{ slug: string; date: string }[]> {
    try {
        const res = await fetch(SORO_EMBED_URL, { next: { revalidate: 3600 } });
        const script = await res.text();

        const match = script.match(/SORO_ARTICLES\s*=\s*(\[[\s\S]*?\]);/);
        if (!match) return [];

        const articles = JSON.parse(match[1]);
        return articles.map((a: { slug: string; published_at?: string; created_at?: string }) => ({
            slug: a.slug,
            date: a.published_at || a.created_at || new Date().toISOString(),
        }));
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.powerbistudio.nl';

    const staticRoutes: MetadataRoute.Sitemap = [
        '',
        '/over',
        '/dashportal',
        '/tools',
        '/tools/dax-assistant',
        '/tools/readiness-scan',
        '/cases',
        '/blog',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '/blog' ? 'daily' : 'monthly',
        priority: route === '' ? 1 : route === '/blog' ? 0.9 : 0.8,
    }));

    const posts = await getSoroPosts();
    const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${baseUrl}/blog?post=${encodeURIComponent(post.slug)}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    return [...staticRoutes, ...blogRoutes];
}
