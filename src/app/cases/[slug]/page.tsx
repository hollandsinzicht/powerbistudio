import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getCaseBySlug, getAllCaseSlugs } from '@/lib/cases-data';
import { StatBlok, SectorBadge } from '@/components/ui';

export async function generateStaticParams() {
  return getAllCaseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const kase = getCaseBySlug(slug);
  if (!kase) return {};
  return {
    title: kase.seoTitle,
    description: kase.seoDescription,
    alternates: { canonical: `https://www.powerbistudio.nl/cases/${slug}` },
  };
}

export default async function CaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kase = getCaseBySlug(slug);
  if (!kase) notFound();

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,58,95,0.06),transparent_50%)] pointer-events-none" />
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Terug naar Cases
          </Link>
          <SectorBadge sector={kase.sector} label={kase.sectorLabel} />
          <h1 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4 max-w-3xl">
            {kase.heroTitle}
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
            {kase.heroSubtitle}
          </p>
        </div>
      </section>

      {/* StatBlokken */}
      <section className="py-12 border-b border-[var(--border)] bg-gray-50">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {kase.stats.map((stat) => (
              <StatBlok key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* Uitdaging */}
      <section className="py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">De uitdaging</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
            {kase.challenge}
          </p>
        </div>
      </section>

      {/* Aanpak */}
      <section className="py-20 bg-gray-50 border-y border-[var(--border)]">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">De aanpak</h2>
          <ul className="space-y-4">
            {kase.approach.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center font-mono mt-0.5">
                  {i + 1}
                </span>
                <span className="text-[var(--text-secondary)] leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Wat we bewust niet deden */}
      {kase.whatWeDidNot && (
        <section className="py-20">
          <div className="container mx-auto px-6 md:px-12 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">Wat we bewust niet deden</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
              {kase.whatWeDidNot}
            </p>
          </div>
        </section>
      )}

      {/* Resultaat */}
      <section className={`py-20 ${kase.whatWeDidNot ? 'bg-gray-50 border-y border-[var(--border)]' : ''}`}>
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">Het resultaat</h2>
          <p className="text-lg leading-relaxed text-[var(--text-primary)] font-medium mb-2">
            {kase.resultHighlight}
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {kase.result}
          </p>
        </div>
      </section>

      {/* Lessen */}
      <section className="py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">
            Lessen voor vergelijkbare organisaties
          </h2>
          <ul className="space-y-4">
            {kase.lessons.map((lesson, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                <span className="text-[var(--text-secondary)] leading-relaxed">{lesson}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-50 border-t border-[var(--border)]">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-2xl">
          <p className="text-xl md:text-2xl font-display font-bold mb-6 text-[var(--text-primary)]">
            {kase.ctaText}
          </p>
          <Link
            href={kase.ctaHref}
            className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3"
          >
            Bespreek jouw situatie <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
