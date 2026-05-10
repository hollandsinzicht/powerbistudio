import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Server,
  Lock,
  Database,
  Users,
  Shield,
  Activity,
  Check,
  ArrowRight,
} from 'lucide-react';
import { CTA } from '@/components/ui';

export const metadata: Metadata = {
  title: 'DashPortal HR — doorlopende hosting voor HR-dashboards | PowerBIStudio',
  description:
    'AVG-proof Power BI hosting voor HR-afdelingen. Branded portaal, RLS automatisch, geen Microsoft-licenties per gebruiker. Vanaf €1.250/mnd.',
  alternates: { canonical: 'https://www.powerbistudio.nl/dashportal' },
};

// ───────────────────────────────────────────────────────────────────────────
// HR-situaties die DashPortal HR oplost
// ───────────────────────────────────────────────────────────────────────────
const PIJN_PUNTEN = [
  {
    icon: Users,
    titel: '50+ managers Microsoft-licenties geven',
    tekst:
      'Power BI Pro per gebruiker à €10/mnd loopt snel op. Voor 80 managers is dat €800/mnd — alleen om dashboards te zien.',
  },
  {
    icon: Lock,
    titel: 'RLS per manager configureren is foutgevoelig',
    tekst:
      'Elke maand reorganisaties, nieuwe managers, vertrekkende collega\'s. Handmatige RLS-mapping is een AVG-incident wachtend om te gebeuren.',
  },
  {
    icon: Server,
    titel: 'app.powerbi.com voelt niet als "van ons"',
    tekst:
      'Generieke Microsoft-omgeving zonder huisstijl, zonder organisatie-context. Managers loggen in op een vreemde plek.',
  },
  {
    icon: Shield,
    titel: 'DPO heeft geen overzicht',
    tekst:
      'Welke manager ziet welke gevoelige velden? Wie heeft toegang tot salarisdata? Audit-trails ontbreken vaak in standaard Power BI.',
  },
  {
    icon: Activity,
    titel: 'Niemand monitort of de data klopt',
    tekst:
      'Refresh gefaald? Bron-systeem changeerde een veld? Manager merkt het pas als zijn rapport raar oogt. Soms weken later.',
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Drie kernfunctionaliteiten
// ───────────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Server,
    titel: 'Branded Report Portal',
    tekst:
      'Eigen domein (analytics.jouwbedrijf.nl), eigen logo, eigen huisstijl. Managers loggen in via SSO en zien direct hun dashboards in een omgeving die voelt als deel van jullie HR-systeem — niet als een Microsoft-tool.',
    bullets: [
      'Custom domein + branding',
      'SSO via Microsoft Entra ID',
      'Mobile-friendly viewer',
      'Geen Power BI Pro per gebruiker',
    ],
  },
  {
    icon: Database,
    titel: 'Metadata Management',
    tekst:
      'Centrale registratie van wie welke gevoelige velden ziet, op welk niveau RLS toepast, en welke datatypes onder welke bewaartermijn vallen. AVG-cockpit ingebouwd, klaar voor DPO-audits.',
    bullets: [
      'AVG-cockpit per dataset',
      'RLS-overzicht per manager',
      'Audit-trail van toegang',
      'Bewaartermijn-monitoring',
    ],
  },
  {
    icon: Activity,
    titel: 'Data Hygiene Monitoring',
    tekst:
      'Automatische detectie van refresh-fouten, schema-wijzigingen in bronnen en abnormale waarde-patronen. Je weet vóór de manager dat er iets mis is — en ik los het op zonder dat jij iets hoeft te doen.',
    bullets: [
      'Refresh-monitoring',
      'Schema-driftdetectie',
      'Anomaly-alerting op KPIs',
      'Maandelijks gezondheids-rapport',
    ],
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Pricing tiers
// ───────────────────────────────────────────────────────────────────────────
const TIERS = [
  {
    naam: 'Essential',
    prijs: '€1.250',
    eenheid: '/mnd',
    voor: 'Tot 25 managers, 1 workspace',
    inhoud: [
      'Hosting + 1 workspace',
      'Tot 25 actieve managers',
      'Standaard branding',
      'Maandelijks gezondheids-rapport',
      'E-mail support binnen 1 werkdag',
    ],
    accent: false,
  },
  {
    naam: 'Professional',
    prijs: '€1.950',
    eenheid: '/mnd',
    voor: 'Tot 100 managers + kwartaal-review',
    inhoud: [
      'Alles uit Essential',
      'Tot 100 actieve managers',
      'Volledige custom branding',
      'Kwartaal model-review',
      'Snelle support binnen 4 werkuren',
      'Aanvullende workspace mogelijk',
    ],
    accent: true,
  },
  {
    naam: 'Enterprise',
    prijs: 'vanaf €3.500',
    eenheid: '/mnd',
    voor: 'Onbeperkt + dedicated capacity + SLA',
    inhoud: [
      'Alles uit Professional',
      'Onbeperkt aantal managers',
      'Dedicated capacity (geen contention)',
      'SLA-contract op uptime',
      'Jaarlijkse AVG-controle',
      'Direct contact met Jan Willem',
    ],
    accent: false,
  },
];

export default function DashPortalPage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="container mx-auto max-w-4xl px-6 py-20 md:px-12 md:py-28">
          <p className="eyebrow mb-4">DashPortal HR Hosting</p>
          <h1 className="mb-6">
            Doorlopende hosting voor je HR-dashboards.
          </h1>
          <p className="lead mb-8">
            AVG-proof, branded, met row-level security die werkt. Geen Microsoft-licenties
            per gebruiker. Voor HR-afdelingen die hun dashboards willen delen met 50+
            managers — zonder elke maand zelf te hoeven monitoren.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact?type=hosting"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-action-600)] px-6 py-3 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[var(--color-action-700)]"
            >
              Bespreek of DashPortal HR bij je past
            </Link>
            <CTA variant="navigation" href="#prijzen">
              Bekijk de tiers
            </CTA>
          </div>
        </div>
      </section>

      {/* ═══ HR-PIJNPUNTEN ═══ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-5xl px-6 md:px-12">
          <div className="mb-12 max-w-3xl">
            <h2 className="mb-4">De situatie waar DashPortal HR voor gemaakt is</h2>
            <p className="lead">
              Vijf problemen die elke HR-afdeling ervaart bij het schalen van Power BI
              naar 50+ managers. DashPortal HR lost ze structureel op.
            </p>
          </div>
          <div className="space-y-4">
            {PIJN_PUNTEN.map(({ icon: Icon, titel, tekst }) => (
              <article
                key={titel}
                className="grid grid-cols-1 gap-4 rounded-lg border border-[var(--border)] bg-white p-5 md:grid-cols-[auto_1fr] md:gap-6 md:p-6"
              >
                <Icon
                  className="h-6 w-6 shrink-0 text-[var(--color-accent-700)]"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="mb-1 text-base">{titel}</h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {tekst}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DRIE FEATURES ═══ */}
      <section className="border-y border-[var(--border)] bg-[var(--color-neutral-50)] py-20 md:py-24">
        <div className="container mx-auto max-w-6xl px-6 md:px-12">
          <div className="mb-12 max-w-3xl">
            <h2 className="mb-4">Wat DashPortal HR doet</h2>
            <p className="lead">
              Drie kernfunctionaliteiten — branded portaal, metadata-management, en
              monitoring. Samen zorgen ze dat HR-rapportage in productie blijft draaien
              zonder dat jij elke maand iets hoeft te doen.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, titel, tekst, bullets }) => (
              <article
                key={titel}
                className="flex flex-col rounded-lg border border-[var(--border)] border-l-[3px] border-l-[var(--color-accent-700)] bg-white p-6"
              >
                <Icon
                  className="mb-4 h-7 w-7 text-[var(--color-accent-700)]"
                  aria-hidden="true"
                />
                <h3 className="mb-3 text-lg">{titel}</h3>
                <p className="mb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {tekst}
                </p>
                <ul className="space-y-2">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent-700)]"
                        aria-hidden="true"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING TIERS ═══ */}
      <section id="prijzen" className="py-20 md:py-24 scroll-mt-24">
        <div className="container mx-auto max-w-6xl px-6 md:px-12">
          <div className="mb-12 max-w-3xl">
            <h2 className="mb-4">Drie tiers, vaste maandprijzen</h2>
            <p className="lead">
              Geen verrassingen, geen per-gebruiker-licenties. Wat je betaalt is wat je
              krijgt — inclusief support en maandelijks gezondheids-rapport.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {TIERS.map((t) => (
              <article
                key={t.naam}
                className={`flex flex-col rounded-lg border bg-white p-6 md:p-8 ${
                  t.accent
                    ? 'border-[var(--color-accent-700)] shadow-[0_4px_20px_-4px_rgba(14,124,102,0.15)]'
                    : 'border-[var(--border)]'
                }`}
              >
                {t.accent && (
                  <p className="eyebrow mb-3">Meest gekozen</p>
                )}
                <h3 className="mb-2 text-xl">{t.naam}</h3>
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-semibold">
                    {t.prijs}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {t.eenheid}
                  </span>
                </div>
                <p className="mb-5 text-sm text-[var(--text-secondary)]">{t.voor}</p>
                <ul className="mb-6 flex-1 space-y-2.5">
                  {t.inhoud.map((punt) => (
                    <li key={punt} className="flex items-start gap-2.5">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent-700)]"
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-relaxed">{punt}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact?type=hosting"
                  className={`inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-[0.9375rem] font-semibold transition-colors ${
                    t.accent
                      ? 'bg-[var(--color-action-600)] text-white hover:bg-[var(--color-action-700)]'
                      : 'border border-[var(--color-primary-900)] text-[var(--color-primary-900)] hover:bg-[var(--color-primary-900)] hover:text-white'
                  }`}
                >
                  Bespreek deze tier
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            Inclusief eenmalige implementatie tussen €2.500 en €7.500, afhankelijk van
            scope. Quick Scan doet de inschatting.
          </p>
        </div>
      </section>

      {/* ═══ HOE SAMENWERKT MET FOUNDATION ═══ */}
      <section className="border-y border-[var(--border)] bg-[var(--color-neutral-50)] py-20 md:py-24">
        <div className="container mx-auto max-w-3xl px-6 md:px-12">
          <p className="eyebrow mb-4">In combinatie met Foundation</p>
          <h2 className="mb-4">Hoe DashPortal HR een Foundation-traject voortzet</h2>
          <div className="space-y-4 text-base leading-relaxed text-[var(--text-secondary)]">
            <p>
              Een Foundation-traject (€34.500 vast, 6-8 weken) levert een werkend
              HR-model op. DashPortal HR Essential (€1.250/mnd) is wat dat model in
              productie laat blijven werken — branded, gemonitord, met AVG-cockpit voor
              je DPO.
            </p>
            <p>
              Ongeveer 80% van de Foundation-klanten kiest voor doorlopende hosting via
              DashPortal HR. Niet omdat het verplicht is, maar omdat de overdracht naar
              een interne IT-afdeling vaak betekent dat de monitoring de eerste maanden
              niet goed werkt — en dat de DPO-rapportage in een lade verdwijnt.
            </p>
            <p>
              <strong className="font-semibold text-[var(--text-primary)]">
                DashPortal HR is geen verplicht vervolg op Foundation.
              </strong>{' '}
              Het is een keuze: zelf monitoren, of doorlopend door mij laten draaien.
              Geen tussenvorm, geen partial-handover.
            </p>
          </div>
          <div className="mt-8">
            <CTA variant="navigation" href="/hr-analytics">
              Lees over een Foundation-traject
            </CTA>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER-CTA ═══ */}
      <section className="border-t border-[var(--border)] bg-[var(--color-primary-900)] py-20 md:py-24 text-white">
        <div className="container mx-auto max-w-3xl px-6 text-center md:px-12">
          <h2 className="mb-4 text-white">
            Past DashPortal HR bij jullie HR-rapportage?
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-white/85">
            Een gesprek van 30 minuten is meestal genoeg om dat in te schatten. Heb je
            al een Power BI-omgeving? Dan kunnen we tegelijk een Quick Scan plannen.
          </p>
          <Link
            href="/contact?type=hosting"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-action-600)] px-6 py-3 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[var(--color-action-700)]"
          >
            Bespreek of DashPortal HR bij je past
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
