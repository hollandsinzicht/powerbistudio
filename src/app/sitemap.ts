import type { MetadataRoute } from 'next';
import { getArticles, CATEGORIES, BASE_URL } from '@/lib/soro';
import { getAllCaseSlugs } from '@/lib/cases-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        '',
        '/hr-analytics',
        '/methodiek',
        '/dashportal',
        '/over',
        '/cases',
        '/blog',
        '/contact',
        '/tools',
        '/tools/readiness-scan',
        '/tools/bi-kosten-calculator',
        '/tools/dax-assistant',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '/blog' ? 'daily' : 'monthly',
        priority: route === '' ? 1 : route === '/blog' ? 0.9 : 0.8,
    }));

    const caseRoutes: MetadataRoute.Sitemap = getAllCaseSlugs().map((slug) => ({
        url: `${BASE_URL}/cases/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
        url: `${BASE_URL}/blog/categorie/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const articles = await getArticles();
    const blogRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
        url: `${BASE_URL}/blog/${article.slug}`,
        lastModified: new Date(article.isoDate),
        changeFrequency: 'monthly',
        // Pillars zijn autoriteits-stukken die hoger in sitemap-prioriteit komen.
        priority: article.articleType === 'pillar' ? 0.9 : 0.7,
    }));

    return [...staticRoutes, ...caseRoutes, ...categoryRoutes, ...blogRoutes];
}
