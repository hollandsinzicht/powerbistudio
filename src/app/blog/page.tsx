import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getBlogArticles, getPillars, CATEGORIES } from '@/lib/soro';
import ArticleCard from '@/components/blog/ArticleCard';
import PillarSectionEyebrow from '@/components/blog/PillarSectionEyebrow';
import BlogList from '@/components/blog/BlogList';

export const metadata: Metadata = {
    title: 'Blog \u2014 HR Analytics, Power BI, AVG-compliance | PowerBIStudio',
    description:
        'Artikelen over HR analytics in Power BI, AVG-compliance, datamodellering en de bron-zilver-goud-methodiek.',
};

type SearchParams = Promise<{ categorie?: string | string[] }>;

export default async function BlogPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const sp = await searchParams;
    const raw = Array.isArray(sp.categorie) ? sp.categorie[0] : sp.categorie;
    const initialCategory =
        raw && CATEGORIES.some((c) => c.slug === raw) ? raw : null;

    const [pillars, blogArticles] = await Promise.all([
        getPillars(),
        getBlogArticles(),
    ]);
    const hasPillars = pillars.length > 0;

    return (
        <>
            <section className="border-b border-[var(--border)] bg-white">
                <div className="container mx-auto max-w-4xl px-6 py-20 md:px-12 md:py-24">
                    <p className="eyebrow mb-4">Blog</p>
                    <h1 className="mb-4">Artikelen over HR analytics in Power BI.</h1>
                    <p className="lead">
                        Inzichten over AVG-compliance, type-2 historiek, RLS op
                        organisatiehiërarchie, bron-zilver-goud-architectuur en
                        andere patterns die HR-rapportage in Power BI succesvol
                        maken. Geen marketing-praatjes — concrete patterns uit de
                        praktijk.
                    </p>
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

                    {blogArticles.length === 0 ? (
                        <p className="text-[var(--text-secondary)] text-center text-lg">
                            Binnenkort verschijnen hier nieuwe artikelen.
                        </p>
                    ) : (
                        <Suspense fallback={null}>
                            <BlogList
                                articles={blogArticles}
                                initialCategory={initialCategory}
                            />
                        </Suspense>
                    )}
                </div>
            </section>
        </>
    );
}
