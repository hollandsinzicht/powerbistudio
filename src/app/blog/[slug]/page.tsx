import Script from 'next/script';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSoroArticleBySlug, SORO_ID, BASE_URL } from '@/lib/soro';
import type { Metadata } from 'next';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const article = await getSoroArticleBySlug(slug);

    const fallbackTitle = slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const title = article?.title || fallbackTitle;
    const description = article?.excerpt || `Lees meer over ${fallbackTitle.toLowerCase()} op de Power BI Studio blog.`;
    const url = `${BASE_URL}/blog/${slug}`;
    const image = article?.image || `${BASE_URL}/og-default.png`;

    return {
        title: `${title} | Blog | PowerBIStudio`,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            url,
            siteName: 'Power BI Studio',
            type: 'article',
            publishedTime: article?.isoDate,
            locale: 'nl_NL',
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const article = await getSoroArticleBySlug(slug);

    const jsonLd = article
        ? {
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: article.title,
              description: article.excerpt,
              image: article.image,
              datePublished: article.isoDate,
              url: `${BASE_URL}/blog/${slug}`,
              author: {
                  '@type': 'Organization',
                  name: 'Power BI Studio',
                  url: BASE_URL,
              },
              publisher: {
                  '@type': 'Organization',
                  name: 'Power BI Studio',
                  url: BASE_URL,
              },
          }
        : null;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}

            <section className="pt-32 pb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        Terug naar blog
                    </Link>
                </div>
            </section>

            <section className="pb-24">
                <div className="container mx-auto px-6 md:px-12">
                    <div id="soro-blog"></div>
                    <Script
                        id="soro-embed-post"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function(){
                                    var s = document.createElement('script');
                                    s.src = 'https://app.trysoro.com/api/embed/${SORO_ID}?post=${slug}';
                                    document.getElementById('soro-blog').after(s);
                                })();
                            `,
                        }}
                    />
                </div>
            </section>
        </>
    );
}
