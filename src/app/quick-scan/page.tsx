import Link from 'next/link';
import type { Metadata } from 'next';
import { Shield, Clock, Database, Check } from 'lucide-react';
import { CTA, StatBlok, ProbleemIntro } from '@/components/ui';
import CalEmbed from '@/components/lead/cal-embed';

export const metadata: Metadata = {
  title: 'HR Analytics Quick Scan — €1.950, audit in 1,5 dag | PowerBIStudio',
  description:
    'Een eerlijke audit van je bestaande HR-rapportage in Power BI: RLS, type-2 historiek en AVG-conformiteit. €1.950, 1,5 dag, rapport van 8-12 pagina\'s met concrete actielijst.',
  alternates: { canonical: 'https://www.powerbistudio.nl/quick-scan' },
};

// ───────────────────────────────────────────────────────────────────────────
// Eén probleem, één aanbod, één boek-CTA. Geen pakketvergelijking.
// ───────────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '€1.950', label: 'Vaste prijs' },
  { value: '1,5 dag', label: 'Doorlooptijd' },
  { value: '8-12', label: "Pagina's rapport" },
  { value: '60 min', label: 'Review-sessie' },
];

const PATTERNS = [
  {
    icon: Shield,
    titel: 'Row-level security klopt niet',
    tekst:
      'Manager X ziet data van team Y — of een cijfer is wel zichtbaar in oude rapporten en niet in nieuwe. Een AVG-incident wachtend om te gebeuren.',
  },
  {
    icon: Clock,
    titel: 'Historiek ontbreekt',
    tekst:
      'Het verloop-cijfer over vorig jaar verandert achteraf, omdat afdelingsherindelingen retroactief doorwerken. Niemand vertrouwt de cijfers nog.',
  },
  {
    icon: Database,
    titel: 'Bronnen staan los',
    tekst:
      'AFAS voor personeelsdata, een losse verzuim-tool, Excel voor formatie. Geen geheel beeld, geen één bron van waarheid.',
  },
];

const INHOUD = [
  'Audit van je datamodel, RLS, historiek en AVG-conformiteit',
  'Concrete actielijst met prioritering en effort-inschatting',
  "Bevindingen-rapport van 8-12 pagina's",
  '60-minuten review-sessie om de resultaten door te nemen',
];

export default function QuickScanPage() {
  // NEXT_PUBLIC_ vars zijn server- én client-side beschikbaar; calConfigured()
  // zelf leeft in een 'use client'-module en mag niet vanaf de server worden
  // aangeroepen, dus we doen hier dezelfde check inline.
  const hasCal = (process.env.NEXT_PUBLIC_CAL_LINK?.trim() || '').length > 0;

  // Schema.org JSON-LD: één Service-offer voor de Quick Scan.
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'HR Analytics Quick Scan',
    description:
      "Audit van een bestaand HR-datamodel in Power BI op RLS, type-2 historiek en AVG-conformiteit, inclusief actielijst en rapport van 8-12 pagina's.",
    provider: {
      '@type': 'ProfessionalService',
      name: 'Power BI Studio',
      url: 'https://www.powerbistudio.nl',
    },
    offers: {
      '@type': 'Offer',
      price: '1950',
      priceCurrency: 'EUR',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* ═══ HERO ═══ */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="container mx-auto max-w-4xl px-6 py-20 md:px-12 md:py-28">
          <p className="eyebrow mb-4">HR Analytics Quick Scan</p>
          <h1 className="mb-6">
            Eén eerlijke audit van je HR-rapportage. €1.950, 1,5 dag.
          </h1>
          <p className="lead mb-8">
            Heb je al een Power BI-omgeving voor HR, maar twijfel je of de
            row-level security klopt, of de historie stabiel is, of het AVG-proof
            is? De Quick Scan geeft je binnen 1,5 dag een eerlijk antwoord — met
            een concrete actielijst, geen verkooppraatje.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#boek"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-action-600)] px-6 py-3 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[var(--color-action-700)]"
            >
              Plan de Quick Scan – €1.950
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="border-b border-[var(--border)] bg-[var(--color-neutral-50)] py-12 md:py-16">
        <div className="container mx-auto max-w-5xl px-6 md:px-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((s) => (
              <StatBlok key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HET PROBLEEM ═══ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-4xl px-6 md:px-12">
          <h2 className="mb-6">Waarom een audit?</h2>
          <ProbleemIntro>
            De meeste HR-rapportages in de mid-market lopen vast op dezelfde drie
            patterns. Ze zijn niet zichtbaar in een dashboard dat &quot;werkt&quot; —
            tot een manager data ziet die hij niet mag zien, of een verloop-cijfer
            achteraf verandert. De Quick Scan legt deze risico&apos;s bloot voordat
            ze een incident worden.
          </ProbleemIntro>
          <div className="mt-10 space-y-5">
            {PATTERNS.map(({ icon: Icon, titel, tekst }) => (
              <article
                key={titel}
                className="grid grid-cols-[auto_1fr] gap-5 rounded-lg border border-[var(--border)] bg-white p-6 md:gap-6 md:p-7"
              >
                <Icon
                  className="h-7 w-7 shrink-0 text-[var(--color-accent-700)]"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="mb-2 text-lg">{titel}</h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {tekst}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WAT JE KRIJGT ═══ */}
      <section className="border-y border-[var(--border)] bg-[var(--color-neutral-50)] py-20 md:py-24">
        <div className="container mx-auto max-w-4xl px-6 md:px-12">
          <h2 className="mb-4">Wat je krijgt</h2>
          <p className="lead mb-10">
            Geen open uren-rekening. Een vaste scope, een vaste prijs en een
            tastbaar resultaat dat je direct kunt gebruiken.
          </p>
          <div className="rounded-lg border border-[var(--border)] bg-white p-6 md:p-8">
            <ul className="space-y-3.5">
              {INHOUD.map((punt) => (
                <li key={punt} className="flex items-start gap-3">
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent-700)]"
                    aria-hidden="true"
                  />
                  <span className="leading-relaxed">{punt}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 border-l-2 border-[var(--color-accent-700)] pl-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">
                Wat je terugverdient:{' '}
              </span>
              eén voorkomen ontwerpfout in je dataplatform en de scan heeft
              zichzelf al terugbetaald.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ BOEKEN ═══ */}
      <section id="boek" className="py-20 md:py-24">
        <div className="container mx-auto max-w-4xl px-6 md:px-12">
          <h2 className="mb-4">Plan de Quick Scan</h2>
          <p className="lead mb-10">
            Kies een moment dat jou uitkomt. Geen tussenstap, geen wachten op een
            offerte — we starten met een korte intake en de scan zelf.
          </p>
          {hasCal ? (
            <CalEmbed
              event="quick-scan"
              className="rounded-lg border border-[var(--border)] bg-white"
            />
          ) : (
            <div className="rounded-lg border border-[var(--border)] bg-white p-8 text-center">
              <p className="mb-6 text-[var(--text-secondary)]">
                Laat je gegevens achter via het contactformulier — ik plan de
                Quick Scan dan binnen één werkdag met je in.
              </p>
              <CTA variant="primary" href="/contact?type=quick-scan">
                Vraag de Quick Scan aan – €1.950
              </CTA>
            </div>
          )}
        </div>
      </section>

      {/* ═══ FOOTER-CTA ═══ */}
      <section className="border-t border-[var(--border)] bg-[var(--color-primary-900)] py-20 md:py-24 text-white">
        <div className="container mx-auto max-w-3xl px-6 text-center md:px-12">
          <h2 className="mb-4 text-white">Twijfel je of je model klopt?</h2>
          <p className="mb-8 text-lg leading-relaxed text-white/85">
            Dan is dat precies waarom de Quick Scan bestaat. €1.950, 1,5 dag, een
            eerlijk rapport. Soms is de uitkomst &quot;de fundering is goed, focus
            op deze drie fixes&quot; — ook dat is geld waard.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="#boek"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-action-600)] px-6 py-3 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[var(--color-action-700)]"
            >
              Plan de Quick Scan – €1.950
            </Link>
            <Link
              href="/hr-analytics"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/40 bg-transparent px-5 py-2.5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-white/10"
            >
              Of bekijk alle pakketten
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
