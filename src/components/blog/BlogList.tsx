'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ArticleCard from './ArticleCard';
import { CATEGORIES, type SoroArticle } from '@/lib/soro';

const PAGE_SIZE = 9;

const VALID_SLUGS = new Set(CATEGORIES.map((c) => c.slug));

function normalizeCategory(value: string | null | undefined): string | null {
    if (!value) return null;
    return VALID_SLUGS.has(value) ? value : null;
}

/**
 * Client-side artikellijst met inline categorie-filter en "Laad meer".
 *
 * - Selected category wordt afgeleid uit ?categorie=<slug> (single source of truth).
 * - visibleCount staat lokaal en reset automatisch zodra de category verandert
 *   via het React-pattern "Storing information from previous renders".
 *
 * `initialCategory` (van de server) wordt enkel gebruikt om de eerste render
 * te seeden indien `useSearchParams` op de client leeg blijkt (CSR-bailout).
 */
export default function BlogList({
    articles,
    initialCategory,
}: {
    articles: SoroArticle[];
    initialCategory?: string | null;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const fromUrl = normalizeCategory(searchParams.get('categorie'));
    const selectedCategory = fromUrl ?? normalizeCategory(initialCategory);

    const [prevCategory, setPrevCategory] = useState<string | null>(selectedCategory);
    const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

    // React-pattern: reset state wanneer afgeleide waarde verandert, zonder useEffect.
    if (prevCategory !== selectedCategory) {
        setPrevCategory(selectedCategory);
        setVisibleCount(PAGE_SIZE);
    }

    const filtered = useMemo(() => {
        if (!selectedCategory) return articles;
        return articles.filter((a) =>
            (a.categories ?? []).some((c) => c.slug === selectedCategory),
        );
    }, [articles, selectedCategory]);

    const visible = filtered.slice(0, visibleCount);
    const canLoadMore = visibleCount < filtered.length;

    const handleSelect = useCallback(
        (slug: string | null) => {
            // Behoud andere querystring-parameters; vervang/verwijder enkel `categorie`.
            const params = new URLSearchParams(searchParams.toString());
            if (slug) {
                params.set('categorie', slug);
            } else {
                params.delete('categorie');
            }
            const qs = params.toString();
            router.replace(qs ? `/blog?${qs}` : '/blog', { scroll: false });
        },
        [router, searchParams],
    );

    const handleLoadMore = useCallback(() => {
        setVisibleCount((v) => v + PAGE_SIZE);
    }, []);

    const pillBase =
        'px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2';
    const pillActive = 'bg-[var(--primary)] text-white border border-transparent';
    const pillInactive =
        'border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--primary)]';

    return (
        <>
            {/* Filter-bar */}
            <div
                role="group"
                aria-label="Filter op categorie"
                className="flex flex-wrap gap-3 mb-12 max-w-6xl mx-auto"
            >
                <button
                    type="button"
                    aria-pressed={selectedCategory === null}
                    onClick={() => handleSelect(null)}
                    className={`${pillBase} ${selectedCategory === null ? pillActive : pillInactive}`}
                >
                    Alles
                </button>
                {CATEGORIES.map((cat) => {
                    const active = selectedCategory === cat.slug;
                    return (
                        <button
                            key={cat.slug}
                            type="button"
                            aria-pressed={active}
                            onClick={() => handleSelect(cat.slug)}
                            className={`${pillBase} ${active ? pillActive : pillInactive}`}
                        >
                            {cat.name}
                        </button>
                    );
                })}
            </div>

            {/* Grid + empty state */}
            {filtered.length === 0 ? (
                <div className="max-w-2xl mx-auto text-center py-12">
                    <p className="text-[var(--text-secondary)] text-lg mb-4">
                        Geen artikelen gevonden in deze categorie.
                    </p>
                    <button
                        type="button"
                        onClick={() => handleSelect(null)}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--primary)] transition-colors"
                    >
                        Toon alle artikelen
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {visible.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>

                    {canLoadMore && (
                        <div className="flex justify-center mt-12">
                            <button
                                type="button"
                                onClick={handleLoadMore}
                                className="glass-card px-8 py-3 rounded-full text-sm font-medium border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                            >
                                Laad meer artikelen
                                <span className="ml-2 text-[var(--text-secondary)]">
                                    ({filtered.length - visibleCount} resterend)
                                </span>
                            </button>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
