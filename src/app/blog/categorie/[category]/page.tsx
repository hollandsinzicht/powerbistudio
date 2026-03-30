import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticlesByCategory, getCategoryBySlug, CATEGORIES, BASE_URL } from '@/lib/soro';
import ArticleCard from '@/components/blog/ArticleCard';
import type { Metadata } from 'next';

type Props = {
    params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
    return CATEGORIES.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params;
    const cat = getCategoryBySlug(category);

    if (!cat) {
        return { title: 'Categorie niet gevonden | PowerBIStudio' };
    }

    const url = `${BASE_URL}/blog/categorie/${cat.slug}`;

    return {
        title: `${cat.name} | Blog | PowerBIStudio`,
        description: cat.description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: `${cat.name} — Blog | Power BI Studio`,
            description: cat.description,
            url,
            siteName: 'Power BI Studio',
            type: 'website',
            locale: 'nl_NL',
        },
    };
}

export default async function CategoryPage({ params }: Props) {
    const { category } = await params;
    const cat = getCategoryBySlug(category);

    if (!cat) notFound();

    const articles = await getArticlesByCategory(category);

    return (
        <>
            <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                            <span className="text-[var(--accent)]">{cat.name}</span>
                        </h1>
                        <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                            {cat.description}
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="flex flex-wrap gap-3 mb-12 max-w-6xl mx-auto">
                        <Link
                            href="/blog"
                            className="px-4 py-2 rounded-full text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--primary)] transition-colors"
                        >
                            Alles
                        </Link>
                        {CATEGORIES.map((c) => (
                            <Link
                                key={c.slug}
                                href={`/blog/categorie/${c.slug}`}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    c.slug === category
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--primary)]'
                                }`}
                            >
                                {c.name}
                            </Link>
                        ))}
                    </div>

                    {articles.length === 0 ? (
                        <p className="text-[var(--text-secondary)] text-center text-lg">
                            Nog geen artikelen in deze categorie.
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
