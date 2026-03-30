import type { Metadata } from 'next';
import Link from 'next/link';
import { getArticles, CATEGORIES } from '@/lib/soro';
import ArticleCard from '@/components/blog/ArticleCard';

export const metadata: Metadata = {
    title: 'Blog | PowerBIStudio',
    description: 'Artikelen en inzichten over Power BI, data-analyse en business intelligence.',
};

export default async function BlogPage() {
    const articles = await getArticles();

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

                    {articles.length === 0 ? (
                        <p className="text-[var(--text-secondary)] text-center text-lg">
                            Binnenkort verschijnen hier nieuwe artikelen.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {articles.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
