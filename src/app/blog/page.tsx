import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar } from 'lucide-react';
import { getSoroArticles } from '@/lib/soro';

export const metadata: Metadata = {
    title: 'Blog | PowerBIStudio',
    description: 'Artikelen en inzichten over Power BI, data-analyse en business intelligence.',
};

export default async function BlogPage() {
    const articles = await getSoroArticles();

    return (
        <>
            <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                            <span className="text-[var(--accent)]">Blog</span>
                        </h1>
                        <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                            Inzichten, tips en best practices over Power BI, data-analyse en business intelligence.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    {articles.length === 0 ? (
                        <p className="text-[var(--text-secondary)] text-center text-lg">
                            Binnenkort verschijnen hier nieuwe artikelen.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {articles.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/blog/${article.slug}`}
                                    className="glass-card rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-all group flex flex-col"
                                >
                                    {article.image && (
                                        <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                                            <Image
                                                src={article.image}
                                                alt={article.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-3">
                                            <Calendar size={14} />
                                            <time dateTime={article.isoDate}>{article.date}</time>
                                        </div>
                                        <h2 className="text-lg font-display font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent)] transition-colors">
                                            {article.title}
                                        </h2>
                                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed flex-1">
                                            {article.excerpt}
                                        </p>
                                        <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] mt-4">
                                            Lees meer <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
