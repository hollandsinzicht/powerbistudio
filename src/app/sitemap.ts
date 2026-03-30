import type { MetadataRoute } from 'next';
import { getArticles, CATEGORIES, BASE_URL } from '@/lib/soro';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '/blog' ? 'daily' : 'monthly',
        priority: route === '' ? 1 : route === '/blog' ? 0.9 : 0.8,
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
        priority: 0.7,
    }));

    return [...staticRoutes, ...categoryRoutes, ...blogRoutes];
}
