import type { NextConfig } from "next";

// Bouw dynamisch de Supabase remote pattern op basis van env var
function getSupabaseHostname(): string {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return 'afocirmbqdxnkyescnev.supabase.co'; // fallback
    try {
        return new URL(url).hostname;
    } catch {
        return 'afocirmbqdxnkyescnev.supabase.co';
    }
}

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            // Originele Supabase project (hardcoded fallback)
            {
                protocol: 'https',
                hostname: 'afocirmbqdxnkyescnev.supabase.co',
            },
            // Dynamische Supabase hostname uit env var
            {
                protocol: 'https',
                hostname: getSupabaseHostname(),
            },
            // Alle Supabase subdomeinen — vangnet voor iedere project
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
            // OpenAI image generation URLs (fallback voor directe DALL-E URLs)
            {
                protocol: 'https',
                hostname: 'oaidalleapiprodscus.blob.core.windows.net',
            },
        ],
    },
    async redirects() {
        return [
            // Legacy /kennisbank → /blog
            { source: '/kennisbank', destination: '/blog', permanent: true },
            { source: '/kennisbank/:slug', destination: '/blog', permanent: true },

            // HR-rebrand 2026: oude proposities → nieuwe HR-pagina's
            // 301-redirects, behalve /resources (302 omdat AVG-checklist nog niet
            // de definitieve content bevat).

            // SaaS / ISV-propositie → HR Analytics
            { source: '/saas', destination: '/hr-analytics', permanent: true },
            { source: '/saas/:path*', destination: '/hr-analytics', permanent: true },

            // Publieke sector-propositie → GGDGHOR case (behoudt het bewijs)
            { source: '/publieke-sector', destination: '/cases/ggdghor', permanent: true },
            { source: '/publieke-sector/:path*', destination: '/cases/ggdghor', permanent: true },

            // Fabric migratie → blog (eventueel content komt daar terug)
            { source: '/fabric-migratie', destination: '/blog', permanent: true },
            { source: '/fabric-migratie/:path*', destination: '/blog', permanent: true },

            // Copilot readiness → HR Analytics
            { source: '/copilot-readiness', destination: '/hr-analytics', permanent: true },
            { source: '/copilot-readiness/:path*', destination: '/hr-analytics', permanent: true },

            // Procesverbetering → Methodiek (hernoemd)
            { source: '/procesverbetering', destination: '/methodiek', permanent: true },
            { source: '/procesverbetering/:path*', destination: '/methodiek', permanent: true },

            // Tools/Report Auditor → HR Analytics (paid product uitgefaseerd)
            { source: '/tools/report-auditor', destination: '/hr-analytics', permanent: true },
            { source: '/tools/report-auditor/:path*', destination: '/hr-analytics', permanent: true },

            // Resources → AVG-checklist HR (302 omdat lead-magnet content nog niet
            // definitief is — wijzigen naar 301 wanneer AVG-checklist live is)
            { source: '/resources', destination: '/avg-checklist-hr', permanent: false },
            { source: '/resources/:path*', destination: '/avg-checklist-hr', permanent: false },
        ];
    },
};

export default nextConfig;
