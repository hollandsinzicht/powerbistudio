import Script from 'next/script';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const SORO_ID = '00a5a8cb-bae1-4b5c-9e36-53088412e220';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const title = slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
        title: `${title} | Blog | PowerBIStudio`,
        description: `Lees meer over ${title.toLowerCase()} op de Power BI Studio blog.`,
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;

    return (
        <>
            <section className="pt-32 pb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        Terug naar blog
                    </Link>
                </div>
            </section>

            <section className="pb-24">
                <div className="container mx-auto px-6 md:px-12">
                    <div id="soro-blog"></div>
                    <Script
                        id="soro-embed-post"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function(){
                                    var s = document.createElement('script');
                                    s.src = 'https://app.trysoro.com/api/embed/${SORO_ID}?post=${slug}';
                                    document.getElementById('soro-blog').after(s);
                                })();
                            `,
                        }}
                    />
                </div>
            </section>
        </>
    );
}
