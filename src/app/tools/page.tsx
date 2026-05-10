import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ClipboardCheck,
  Calculator,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { CTA } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Tools voor HR Analytics | PowerBIStudio',
  description:
    'Gratis tools om je HR-data en je Power BI-rapportage te beoordelen. HR Readiness Scan, HR Kosten Calculator, AVG-checklist HR.',
  alternates: { canonical: 'https://www.powerbistudio.nl/tools' },
};

const TOOLS = [
  {
    icon: ClipboardCheck,
    titel: 'HR Analytics Readiness Scan',
    samenvatting:
      '10 vragen specifiek over HR-rapportage in Power BI. RLS, historiek, AVG, multi-bron — beantwoord ja/nee/deels en krijg een persoonlijke beoordeling.',
    cta: 'Start de scan',
    href: '/tools/readiness-scan',
    badge: 'Gratis',
  },
  {
    icon: Calculator,
    titel: 'HR Rapportage-kosten Calculator',
    samenvatting:
      'Hoeveel kosten je HR-medewerkers en controllers nu aan handmatige verloop-, verzuim- en formatie-rapportages? Bereken de maand- en jaarkosten van handwerk.',
    cta: 'Open de calculator',
    href: '/tools/bi-kosten-calculator',
    badge: 'Gratis',
  },
  {
    icon: ShieldCheck,
    titel: 'AVG-checklist HR Power BI',
    samenvatting:
      '12 punten die je nu kunt controleren in je HR-rapportage. De typische AVG-leaks die in 9 van de 10 audits opduiken.',
    cta: 'Download de checklist',
    href: '/avg-checklist-hr',
    badge: 'Gratis · PDF',
  },
];

export default function ToolsPage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="container mx-auto max-w-4xl px-6 py-20 md:px-12 md:py-28">
          <p className="eyebrow mb-4">Tools</p>
          <h1 className="mb-6">Tools voor HR Analytics.</h1>
          <p className="lead">
            Gratis tools om je HR-data en je Power BI-rapportage te beoordelen.
            Geen account, geen verkooppraatje — wel een eerlijke uitkomst.
          </p>
        </div>
      </section>

      {/* ═══ TOOLS GRID ═══ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-5xl px-6 md:px-12">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {TOOLS.map(({ icon: Icon, titel, samenvatting, cta, href, badge }) => (
              <article
                key={titel}
                className="flex flex-col rounded-lg border border-[var(--border)] border-l-[3px] border-l-[var(--color-accent-700)] bg-white p-6"
              >
                <div className="mb-4 flex items-start justify-between">
                  <Icon
                    className="h-7 w-7 text-[var(--color-accent-700)]"
                    aria-hidden="true"
                  />
                  <span className="rounded-full bg-[var(--color-accent-100)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent-700)]">
                    {badge}
                  </span>
                </div>
                <h3 className="mb-3 text-lg">{titel}</h3>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {samenvatting}
                </p>
                <Link
                  href={href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary-700)] underline underline-offset-4 transition-colors hover:text-[var(--color-primary-900)]"
                >
                  {cta}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER-CTA ═══ */}
      <section className="border-t border-[var(--border)] bg-[var(--color-neutral-50)] py-20 md:py-24">
        <div className="container mx-auto max-w-2xl px-6 text-center md:px-12">
          <h2 className="mb-4">Bevindingen die je verder helpen?</h2>
          <p className="lead mx-auto mb-8">
            De tools geven je een eerste beeld. Een Quick Scan (€1.950) gaat dieper
            — concrete aanpak voor jouw model, niet alleen algemene patterns.
          </p>
          <CTA variant="primary">Plan een Quick Scan – €1.950</CTA>
        </div>
      </section>
    </>
  );
}
