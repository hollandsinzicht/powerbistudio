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
            {
                source: '/kennisbank',
                destination: '/blog',
                permanent: true,
            },
            {
                source: '/kennisbank/:slug',
                destination: '/blog',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
