import type { MetadataRoute } from 'next';
import { getArticles, CATEGORIES, BASE_URL } from '@/lib/soro';
import { getAllCaseSlugs } from '@/lib/cases-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const articles = await getArticles();

    // Nieuwste artikel-wijziging = realistische "site is bijgewerkt"-datum.
    // GEEN `new Date()` gebruiken: dat zet elke crawl "vandaag gewijzigd",
    // een vals versheidssignaal dat Google leert te negeren.
    const newestModified = articles.reduce<Date>((newest, a) => {
        const d = new Date(a.isoModified);
        return d > newest ? d : newest;
    }, new Date(0));

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
        '/privacy',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        // /blog en home bewegen mee met de nieuwste content; overige routes
        // krijgen geen lastModified (afwezig is beter dan onjuist).
        ...(route === '' || route === '/blog' ? { lastModified: newestModified } : {}),
        changeFrequency: route === '/blog' ? 'daily' : 'monthly',
        priority: route === '' ? 1 : route === '/blog' ? 0.9 : 0.8,
    }));

    const caseRoutes: MetadataRoute.Sitemap = getAllCaseSlugs().map((slug) => ({
        url: `${BASE_URL}/cases/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    // Categorie-lastModified = nieuwste artikel binnen die categorie.
    const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => {
        const inCat = articles.filter((a) => a.categories.some((c) => c.slug === cat.slug));
        const catModified = inCat.reduce<Date | null>((newest, a) => {
            const d = new Date(a.isoModified);
            return !newest || d > newest ? d : newest;
        }, null);
        return {
            url: `${BASE_URL}/blog/categorie/${cat.slug}`,
            ...(catModified ? { lastModified: catModified } : {}),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        };
    });

    const blogRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
        url: `${BASE_URL}/blog/${article.slug}`,
        lastModified: new Date(article.isoDate),
        changeFrequency: 'monthly',
        // Pillars zijn autoriteits-stukken die hoger in sitemap-prioriteit komen.
        priority: article.articleType === 'pillar' ? 0.9 : 0.7,
    }));

    return [...staticRoutes, ...caseRoutes, ...categoryRoutes, ...blogRoutes];
}
