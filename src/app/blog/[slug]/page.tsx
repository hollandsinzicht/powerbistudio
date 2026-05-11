import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import {
    getArticleBySlug,
    getArticleContent,
    getSpokes,
    getBlogArticles,
    BASE_URL,
} from '@/lib/soro';
import type { Metadata } from 'next';
import AuthorIntro from '@/components/blog/AuthorIntro';
import BlogCTA from '@/components/blog/BlogCTA';
import PillarBadge from '@/components/blog/PillarBadge';
import PillarTOC from '@/components/blog/PillarTOC';
import PillarRelated from '@/components/blog/PillarRelated';
import InlineCTA from '@/components/blog/InlineCTA';
import StickyCTA from '@/components/blog/StickyCTA';
import { extractToc, injectHeadingIds } from '@/lib/pillar-toc';
import { readingTime } from '@/lib/reading-time';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
        return { title: 'Artikel niet gevonden | PowerBIStudio' };
    }

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
    const article = await getArticleBySlug(slug);

    if (!article) notFound();

    const rawContent = await getArticleContent(article.id);
    const isPillar = article.articleType === 'pillar';
    const minutes = readingTime(rawContent);

    // Voor pillars: TOC opbouwen en heading-IDs in de HTML injecteren.
    const toc = isPillar && rawContent ? extractToc(rawContent) : [];
    const content = isPillar && rawContent ? injectHeadingIds(rawContent, toc) : rawContent;

    // Voor pillars: spokes ophalen + fallback-pool voor "Verder lezen".
    const [spokes, fallbackPool] = isPillar
        ? await Promise.all([getSpokes(article), getBlogArticles()])
        : [[], []];

    const canonicalUrl = `${BASE_URL}/blog/${slug}`;
    const articleImage = article.image || `${BASE_URL}/og-default.png`;

    const blogPostingLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl,
        },
        headline: article.title,
        description: article.excerpt,
        ...(isPillar ? { articleSection: 'Guide' } : {}),
        image: {
            '@type': 'ImageObject',
            url: articleImage,
            width: 1200,
            height: 630,
        },
        datePublished: article.isoDate,
        dateModified: article.isoModified,
        url: canonicalUrl,
        inLanguage: 'nl-NL',
        author: {
            '@type': 'Person',
            name: 'Jan Willem den Hollander',
            url: `${BASE_URL}/over`,
            jobTitle: 'Power BI architect, LSS Black Belt',
        },
        publisher: {
            '@type': 'Organization',
            '@id': `${BASE_URL}/#organization`,
            name: 'Power BI Studio',
            url: BASE_URL,
            logo: {
                '@type': 'ImageObject',
                url: `${BASE_URL}/logo.png`,
                width: 600,
                height: 150,
            },
        },
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
            { '@type': 'ListItem', position: 3, name: article.title, item: canonicalUrl },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />

            <article className="pt-32 pb-24">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-3xl mx-auto">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors text-sm font-medium mb-8"
                        >
                            <ArrowLeft size={16} />
                            Terug naar alle artikelen
                        </Link>

                        {isPillar && (
                            <div className="mb-4">
                                <PillarBadge />
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
                            <span className="flex items-center gap-1">
                                <Calendar size={16} />
                                <time dateTime={article.isoDate}>{article.date}</time>
                            </span>
                            <span className="flex items-center gap-1" aria-label="Geschatte leestijd">
                                <Clock size={16} aria-hidden="true" />
                                {minutes} min leestijd
                            </span>
                            {article.categories.map((cat) => (
                                <Link
                                    key={cat.slug}
                                    href={`/blog/categorie/${cat.slug}`}
                                    className="px-2.5 py-0.5 rounded-full bg-gray-100 border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--primary)] transition-colors"
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] mb-8">
                            {article.title}
                        </h1>

                        {/* Auteur-intro */}
                        <AuthorIntro />

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

                        {/* TOC alleen voor pillars, na de hero-image */}
                        {isPillar && toc.length > 0 && <PillarTOC entries={toc} />}

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

                        {/* Inline-CTA na de content — Quick Scan-conversie */}
                        <InlineCTA />

                        {/* Pillar: spokes + fallback als "Verder lezen" */}
                        {isPillar && (
                            <PillarRelated
                                spokes={spokes}
                                fallbackPool={fallbackPool}
                                pillarId={article.id}
                            />
                        )}

                        {/* Dynamische CTA op basis van content-analyse */}
                        <BlogCTA
                            categories={article.categories}
                            title={article.title}
                            excerpt={article.excerpt}
                            content={content}
                        />
                    </div>
                </div>
            </article>

            {/* Sticky scroll-CTA — verschijnt vanaf 25% scroll-diepte */}
            <StickyCTA />
        </>
    );
}
