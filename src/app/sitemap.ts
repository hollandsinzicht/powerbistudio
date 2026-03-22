import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.powerbistudio.nl';

    const routes = [
        '',
        '/over',
        '/dashportal',
        '/tools',
        '/tools/dax-assistant',
        '/tools/readiness-scan',
        '/cases',
        '/blog',
        '/contact',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '/blog' ? 'daily' : 'monthly',
        priority: route === '' ? 1 : route === '/blog' ? 0.9 : 0.8,
    }));
}
