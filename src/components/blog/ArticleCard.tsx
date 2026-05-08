import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar } from 'lucide-react';
import type { SoroArticle } from '@/lib/soro';

/**
 * Standaard articlecard. Wanneer de pillar-sectie op /blog deze card gebruikt
 * (kind="pillar") wordt het categorie-rijtje vervangen door één "Complete gids"
 * pill in de amber accent-kleur. De `kind`-prop overschrijft de detectie via
 * `article.articleType` zodat de card in willekeurige context goed te tonen is.
 */
export default function ArticleCard({
    article,
    kind,
}: {
    article: SoroArticle;
    kind?: 'blog' | 'pillar';
}) {
    const effectiveKind = kind ?? article.articleType ?? 'blog';
    const isPillar = effectiveKind === 'pillar';

    return (
        <Link
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
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)] mb-3">
                    <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        <time dateTime={article.isoDate}>{article.date}</time>
                    </span>
                    {isPillar ? (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-white font-bold uppercase tracking-wider">
                            Complete gids
                        </span>
                    ) : (
                        article.categories.map((cat) => (
                            <span
                                key={cat.slug}
                                className="px-2 py-0.5 rounded-full bg-gray-100 border border-[var(--border)] text-[var(--text-secondary)] font-medium"
                            >
                                {cat.name}
                            </span>
                        ))
                    )}
                </div>
                <h2 className="text-lg font-display font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                    {article.title}
                </h2>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed flex-1 line-clamp-3">
                    {article.excerpt}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] mt-4">
                    Lees meer <ArrowRight size={14} />
                </span>
            </div>
        </Link>
    );
}
