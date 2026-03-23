import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getSoroArticleBySlug, getSoroArticleContent, BASE_URL } from '@/lib/soro';
import type { Metadata } from 'next';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const article = await getSoroArticleBySlug(slug);

    if (!article) return { title: 'Artikel niet gevonden | PowerBIStudio' };

    const url = `${BASE_URL}/blog/${slug}`;
    const image = article.image || `${BASE_URL}/og-default.png`;

    return {
        title: `${article.title} | Blog | PowerBIStudio`,
        description: article.excerpt,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: article.title,
            description: article.excerpt,
            url,
            siteName: 'Power BI Studio',
            type: 'article',
            publishedTime: article.isoDate,
            locale: 'nl_NL',
            images: [{ url: image, width: 1200, height: 630, alt: article.title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.excerpt,
            images: [image],
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const article = await getSoroArticleBySlug(slug);

    if (!article) notFound();

    const content = await getSoroArticleContent(article.id);

    const jsonLd = {
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
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <article className="pt-32 pb-24">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-3xl mx-auto">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors text-sm font-medium mb-8"
                        >
                            <ArrowLeft size={16} />
                            Terug naar blog
                        </Link>

                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
                            <Calendar size={16} />
                            <time dateTime={article.isoDate}>{article.date}</time>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] mb-8">
                            {article.title}
                        </h1>

                        {article.image && (
                            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-10 border border-[var(--border)]">
                                <Image
                                    src={article.image}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 768px"
                                />
                            </div>
                        )}

                        {content ? (
                            <div
                                className="prose prose-lg max-w-none
                                    prose-headings:font-display prose-headings:text-[var(--text-primary)]
                                    prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed
                                    prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline
                                    prose-strong:text-[var(--text-primary)]
                                    prose-ul:text-[var(--text-secondary)] prose-ol:text-[var(--text-secondary)]
                                    prose-li:text-[var(--text-secondary)]
                                    prose-blockquote:border-[var(--accent)] prose-blockquote:text-[var(--text-secondary)]
                                    prose-img:rounded-xl"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        ) : (
                            <p className="text-[var(--text-secondary)]">
                                Dit artikel kon niet geladen worden. Probeer het later opnieuw.
                            </p>
                        )}
                    </div>
                </div>
            </article>
        </>
    );
}
