import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Calendar, LayoutDashboard, Wrench } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getArticleContent, BASE_URL } from '@/lib/soro';
import type { Metadata } from 'next';

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

    const content = await getArticleContent(article.id);

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
                            Terug naar alle artikelen
                        </Link>

                        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] mb-4">
                            <span className="flex items-center gap-1">
                                <Calendar size={16} />
                                <time dateTime={article.isoDate}>{article.date}</time>
                            </span>
                            {article.category && (
                                <Link
                                    href={`/blog/categorie/${article.category.slug}`}
                                    className="px-2.5 py-0.5 rounded-full bg-gray-100 border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--primary)] transition-colors"
                                >
                                    {article.category.name}
                                </Link>
                            )}
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

                <div className="container mx-auto px-6 md:px-12 mt-16 pt-16 border-t border-[var(--border)]">
                    <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link
                            href="/dashportal"
                            className="glass-card rounded-2xl p-6 border border-[var(--border)] hover:border-[var(--accent)] transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-[var(--border)] group-hover:border-[var(--accent)] transition-colors">
                                    <LayoutDashboard size={20} className="text-[var(--accent)]" />
                                </div>
                                <h3 className="font-display font-bold text-[var(--text-primary)]">DashPortal</h3>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] mb-4">
                                Deel Power BI rapporten via een professioneel, branded portaal met je eigen logo, kleuren en domein.
                            </p>
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)]">
                                Ontdek DashPortal <ArrowRight size={14} />
                            </span>
                        </Link>

                        <Link
                            href="/tools"
                            className="glass-card rounded-2xl p-6 border border-[var(--border)] hover:border-[var(--accent)] transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-[var(--border)] group-hover:border-[var(--accent)] transition-colors">
                                    <Wrench size={20} className="text-[var(--accent)]" />
                                </div>
                                <h3 className="font-display font-bold text-[var(--text-primary)]">Gratis Tools</h3>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] mb-4">
                                Probeer de Power BI Readiness Scan of de AI-powered DAX Assistant om jouw data-omgeving te verbeteren.
                            </p>
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)]">
                                Bekijk tools <ArrowRight size={14} />
                            </span>
                        </Link>
                    </div>
                </div>
            </article>
        </>
    );
}
