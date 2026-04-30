import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlogArticles, getPillars, CATEGORIES } from '@/lib/soro';
import ArticleCard from '@/components/blog/ArticleCard';
import PillarSectionEyebrow from '@/components/blog/PillarSectionEyebrow';

export const metadata: Metadata = {
    title: 'Blog | PowerBIStudio',
    description: 'Artikelen en inzichten over Power BI, data-analyse en business intelligence.',
};

export default async function BlogPage() {
    const [pillars, blogArticles] = await Promise.all([getPillars(), getBlogArticles()]);
    const hasPillars = pillars.length > 0;

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

            {hasPillars && (
                <nav
                    aria-label="Sectie-navigatie"
                    className="sticky top-0 z-30 bg-[var(--background)]/85 backdrop-blur border-b border-[var(--border)]"
                >
                    <div className="container mx-auto px-6 md:px-12">
                        <div className="flex flex-wrap items-center gap-2 py-3 text-sm">
                            <a
                                href="#gidsen"
                                className="px-3 py-1.5 rounded-full font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-gray-100 transition-colors"
                            >
                                Complete gidsen
                            </a>
                            <a
                                href="#alle-artikelen"
                                className="px-3 py-1.5 rounded-full font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-gray-100 transition-colors"
                            >
                                Alle artikelen
                            </a>
                        </div>
                    </div>
                </nav>
            )}

            {hasPillars && (
                <section
                    id="gidsen"
                    className="py-20 bg-gradient-to-b from-[var(--surface)] to-[var(--background)] border-b border-[var(--border)]"
                >
                    <div className="container mx-auto px-6 md:px-12">
                        <div className="max-w-3xl mb-12">
                            <PillarSectionEyebrow />
                            <h2 className="mt-4 text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]">
                                Complete gidsen
                            </h2>
                            <p className="mt-3 text-lg text-[var(--text-secondary)] leading-relaxed">
                                Uitputtende gidsen die één breed onderwerp van A tot Z behandelen — met directe doorklikken naar de diepgaande deel-artikelen.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {pillars.map((pillar) => (
                                <ArticleCard key={pillar.id} article={pillar} kind="pillar" />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section id="alle-artikelen" className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    {hasPillars && (
                        <div className="max-w-3xl mb-10">
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]">
                                Alle artikelen
                            </h2>
                            <p className="mt-3 text-lg text-[var(--text-secondary)] leading-relaxed">
                                Korte deep-dives op specifieke onderwerpen.
                            </p>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3 mb-12 max-w-6xl mx-auto">
                        <span className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--primary)] text-white">
                            Alles
                        </span>
                        {CATEGORIES.map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/blog/categorie/${cat.slug}`}
                                className="px-4 py-2 rounded-full text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--primary)] transition-colors"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>

                    {blogArticles.length === 0 ? (
                        <p className="text-[var(--text-secondary)] text-center text-lg">
                            Binnenkort verschijnen hier nieuwe artikelen.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {blogArticles.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
