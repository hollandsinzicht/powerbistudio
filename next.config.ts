import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'afocirmbqdxnkyescnev.supabase.co',
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
