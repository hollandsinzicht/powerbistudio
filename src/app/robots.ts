import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            // Standaard zoekmachines
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin', '/api/admin', '/api/cron'],
            },
            // AI crawlers expliciet toestaan voor content indexering
            {
                userAgent: ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'ClaudeBot', 'Claude-User', 'anthropic-ai', 'Google-Extended', 'Applebot-Extended'],
                allow: '/',
                disallow: ['/admin', '/api/admin', '/api/cron'],
            },
        ],
        sitemap: 'https://www.powerbistudio.nl/sitemap.xml',
        host: 'https://www.powerbistudio.nl',
    };
}
