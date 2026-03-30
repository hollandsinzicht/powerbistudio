import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar } from 'lucide-react';
import type { SoroArticle } from '@/lib/soro';

export default function ArticleCard({ article }: { article: SoroArticle }) {
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
                <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mb-3">
                    <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        <time dateTime={article.isoDate}>{article.date}</time>
                    </span>
                    {article.category && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-[var(--border)] text-[var(--text-secondary)] font-medium">
                            {article.category.name}
                        </span>
                    )}
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
    );
}
