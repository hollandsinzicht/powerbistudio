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
            // ====================================================================
            // WordPress-migratie: oude URL's die nog rankten (GSC, jun 2026).
            // ELKE oude URL 301't naar de DICHTSTBIJZIJNDE inhoudelijke pagina —
            // NOOIT naar /blog-index (dat ziet Google als soft-404 → ranking weg).
            // Volgorde telt: specifieke paden vóór catch-alls (eerste match wint).
            // VUL AAN met de overige oude URL's uit je volledige GSC-pagina-export.
            // ====================================================================

            // --- Oude /kennisbank/* how-to's → dichtstbijzijnde blog-artikel ---
            // (stonden op pos 4–8 vóór de migratie — hoogste prioriteit)
            {
                source: '/kennisbank/power-bi-user-management',
                destination: '/blog/row-level-security-power-bi-complete-implementatiegids',
                permanent: true,
            },
            {
                source: '/kennisbank/publiceren-van-je-power-bi-rapport',
                destination: '/blog/power-bi-deployment-pipelines-dev-test-prod',
                permanent: true,
            },
            {
                // NB: wijst naar de DAX-pillar (niet naar dax-calculate-volledig,
                // want die gaat op in de pillar bij de cluster-consolidatie).
                source: '/kennisbank/virtual-tables-in-power-bi',
                destination: '/blog/complete-dax-gids-power-bi-calculate-calculation-groups',
                permanent: true,
            },
            {
                source: '/kennisbank/basis-visualisatie-maken-in-power-bi',
                destination: '/blog/datamodellering-power-bi-complete-gids-schaalbare-semantische-modellen',
                permanent: true,
            },

            // --- Oude root-level commerciële pagina's (404'en nu) → HR-propositie ---
            {
                // pos 3.7 — sterkste verloren pagina; consultant-intent
                source: '/power-bi/power-bi-consultant-voor-mkb-wanneer-inhuren-en-wat-te-verwachten',
                destination: '/hr-analytics',
                permanent: true,
            },
            {
                source: '/power-bi-voor-mkb-de-complete-gids-naar-datagedreven-beslissingen',
                destination: '/hr-analytics',
                permanent: true,
            },
            {
                // geen Qlik-content (meer); dichtstbijzijnde vergelijking = Excel-overstap
                source: '/power-bi-vs-qlik-de-complete-vergelijking-voor-mkb-bedrijven',
                destination: '/blog/power-bi-versus-excel-wanneer-overstappen',
                permanent: true,
            },
            {
                source: '/oplossingen/kpi-dashboard',
                destination: '/hr-analytics',
                permanent: true,
            },
            { source: '/privacy-en-terms', destination: '/privacy', permanent: true },

            // --- Oude quickscan-funnel → nieuwe readiness-scan ---
            { source: '/business-intelligence-quickscan', destination: '/tools/readiness-scan', permanent: true },
            { source: '/business-intelligence-quickscan/:path*', destination: '/tools/readiness-scan', permanent: true },

            // --- Catch-alls voor oude prefixen (onbekende long-tail pagina's) ---
            // Specifieke mappings hierboven winnen; dit vangt de rest topisch op.
            { source: '/power-bi/:path*', destination: '/hr-analytics', permanent: true },
            { source: '/oplossingen/:path*', destination: '/hr-analytics', permanent: true },

            // Legacy /kennisbank → /blog (alleen nog vangnet voor onbekende slugs;
            // bekende rankende pagina's zijn hierboven al specifiek gemapt)
            { source: '/kennisbank', destination: '/blog', permanent: true },
            { source: '/kennisbank/:slug', destination: '/blog', permanent: true },

            // ====================================================================
            // Cluster-consolidatie jun 2026: kannibaliserende dubbels gaan op in
            // de pillar met de meeste autoriteit. Deploy DEZE redirects vóór je
            // scripts/consolidate-blog-clusters.ts --commit draait (geen 404-gat).
            // ====================================================================
            {
                source: '/blog/dax-calculate-volledig-uitgelegd-power-bi-measure',
                destination: '/blog/complete-dax-gids-power-bi-calculate-calculation-groups',
                permanent: true,
            },
            {
                source: '/blog/dax-variables-var-return-performance-optimalisatie',
                destination: '/blog/dax-performance-optimalisatie-technieken-snellere-modellen',
                permanent: true,
            },
            {
                source: '/blog/hoe-maak-je-een-goed-datamodel',
                destination: '/blog/datamodellering-power-bi-complete-gids-schaalbare-semantische-modellen',
                permanent: true,
            },
            {
                source: '/blog/power-bi-audit-6-signalen-tijd-review',
                destination: '/blog/power-bi-rapport-audit-checklist-15-fouten',
                permanent: true,
            },
            {
                source: '/blog/bestaand-model-copilot-ready-migratiehandleiding',
                destination: '/blog/semantic-model-copilot-ready-problemen-oplossen',
                permanent: true,
            },
            {
                source: '/blog/wanneer-overstappen-van-excel-naar-power-bi',
                destination: '/blog/power-bi-versus-excel-wanneer-overstappen',
                permanent: true,
            },

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
