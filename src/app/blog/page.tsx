import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
    title: 'Blog | PowerBIStudio',
    description: 'Artikelen en inzichten over Power BI, data-analyse en business intelligence.',
};

const SORO_ID = '00a5a8cb-bae1-4b5c-9e36-53088412e220';

export default function BlogPage() {
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
                    <div id="soro-blog"></div>
                    <Script
                        id="soro-url-rewrite"
                        strategy="beforeInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function(){
                                    function rewriteUrl(url) {
                                        try {
                                            var u = new URL(url, window.location.origin);
                                            var post = u.searchParams.get('post');
                                            if (post && u.pathname === '/blog') {
                                                u.pathname = '/blog/' + post;
                                                u.searchParams.delete('post');
                                                return u.toString();
                                            }
                                        } catch(e) {}
                                        return url;
                                    }

                                    var origPushState = history.pushState.bind(history);
                                    var origReplaceState = history.replaceState.bind(history);

                                    history.pushState = function(state, title, url) {
                                        if (url) url = rewriteUrl(url);
                                        return origPushState(state, title, url);
                                    };

                                    history.replaceState = function(state, title, url) {
                                        if (url) url = rewriteUrl(url);
                                        return origReplaceState(state, title, url);
                                    };
                                })();
                            `,
                        }}
                    />
                    <Script
                        id="soro-embed"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function(){
                                    var s = document.createElement('script');
                                    s.src = 'https://app.trysoro.com/api/embed/${SORO_ID}';
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
