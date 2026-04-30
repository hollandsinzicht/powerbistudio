import ArticleCard from '@/components/blog/ArticleCard';
import type { SoroArticle } from '@/lib/soro';

/**
 * "Verder lezen"-sectie onder een pillar-content. Toont primair de gekoppelde
 * spokes; vult op tot maximaal 6 met andere artikelen uit dezelfde categorieën
 * (zonder duplicaten en zonder de pillar zelf).
 */
export default function PillarRelated({
    spokes,
    fallbackPool,
    pillarId,
}: {
    spokes: SoroArticle[];
    /** Pool om uit aan te vullen tot 6 (alle blog-artikelen, niet-pillars). */
    fallbackPool: SoroArticle[];
    pillarId: string;
}) {
    const TARGET = 6;
    const seen = new Set<string>([pillarId, ...spokes.map((s) => s.id)]);

    const fillers = fallbackPool.filter((a) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
    });

    const items = [...spokes, ...fillers].slice(0, TARGET);
    if (items.length === 0) return null;

    return (
        <section className="mt-20">
            <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-2">
                    Verder lezen
                </h2>
                <p className="text-[var(--text-secondary)]">
                    Diepgaande artikelen die op de deelthema&apos;s uit deze gids ingaan.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        </section>
    );
}
