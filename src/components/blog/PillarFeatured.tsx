import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar } from 'lucide-react';
import type { SoroArticle } from '@/lib/soro';

/**
 * Featured-layout voor pillars op /blog.
 *
 * - 1 pillar  → hero op volledige breedte.
 * - 2 pillars → hero + 1 compact-card ernaast (lg).
 * - 3+ pillars → hero + 2 compact-cards gestackt ernaast (lg). Slice naar 3.
 *
 * Onder lg stacken alle kaarten in één kolom; de hero blijft visueel
 * dominant via grotere typografie + meer padding.
 *
 * Heading-blok ("Begin hier" eyebrow + h2 + intro) blijft in page.tsx.
 */
export default function PillarFeatured({ pillars }: { pillars: SoroArticle[] }) {
    if (pillars.length === 0) return null;

    const hero = pillars[0];
    const rest = pillars.slice(1, 3);

    // Bepaal hero col-span op basis van aantal pillars.
    const heroColSpan =
        pillars.length === 1 ? 'lg:col-span-3' : 'lg:col-span-2';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Hero card */}
            <Link
                href={`/blog/${hero.slug}`}
                className={`glass-card rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-all group flex flex-col ${heroColSpan}`}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                    {hero.image && (
                        <div className="relative w-full aspect-[16/9] lg:aspect-auto lg:h-full lg:min-h-[24rem] overflow-hidden bg-gray-100">
                            <Image
                                src={hero.image}
                                alt={hero.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 1024px) 100vw, 66vw"
                                priority
                            />
                        </div>
                    )}
                    <div className="p-6 lg:p-10 flex flex-col flex-1">
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-bold uppercase tracking-[0.1em]">
                                Complete gids
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] mb-3">
                            <Calendar size={14} />
                            <time dateTime={hero.isoDate}>{hero.date}</time>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-4 group-hover:text-[var(--accent)] transition-colors line-clamp-3">
                            {hero.title}
                        </h3>
                        <p className="text-[var(--text-secondary)] text-base leading-relaxed flex-1 line-clamp-3">
                            {hero.excerpt}
                        </p>
                        <span className="inline-flex items-center gap-1 text-base font-semibold text-[var(--accent)] mt-6">
                            Lees de complete gids <ArrowRight size={16} />
                        </span>
                    </div>
                </div>
            </Link>

            {/* Compact cards (max 2) */}
            {rest.length > 0 && (
                <div
                    className={`grid grid-cols-1 ${
                        rest.length === 2 ? 'lg:grid-rows-2' : ''
                    } gap-6 lg:gap-8 lg:col-span-1`}
                >
                    {rest.map((pillar) => (
                        <Link
                            key={pillar.id}
                            href={`/blog/${pillar.slug}`}
                            className="glass-card rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-all group flex flex-col"
                        >
                            {pillar.image && (
                                <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                                    <Image
                                        src={pillar.image}
                                        alt={pillar.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 1024px) 100vw, 33vw"
                                    />
                                </div>
                            )}
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)] mb-3">
                                    <span className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-white font-bold uppercase tracking-wider">
                                        Complete gids
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        <time dateTime={pillar.isoDate}>{pillar.date}</time>
                                    </span>
                                </div>
                                <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                                    {pillar.title}
                                </h3>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed flex-1 line-clamp-2">
                                    {pillar.excerpt}
                                </p>
                                <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] mt-3">
                                    Lees meer <ArrowRight size={14} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
