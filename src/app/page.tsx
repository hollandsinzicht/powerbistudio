import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Shield,
  Clock,
  Database,
  ArrowRight,
  ShieldCheck,
  Layers,
  Server,
  TrendingUp,
} from 'lucide-react';
import { CTA, MethodieDiagram } from '@/components/ui';

export const metadata: Metadata = {
  title: 'HR analytics in Power BI — vaste prijzen, AVG-proof | PowerBIStudio',
  description:
    'HR analytics-specialist voor mid-market werkgevers met AFAS, Visma of Nmbrs. Quick Scan €1.950, Foundation €34.500 vast. AVG-by-design. 15 jaar Power BI ervaring.',
  openGraph: {
    title: 'HR analytics in Power BI — door één specialist',
    description:
      'Vaste prijzen voor HR-trajecten in Power BI. AVG-proof, historisch correct, met DashPortal HR Hosting voor doorlopende ondersteuning.',
  },
  alternates: { canonical: 'https://www.powerbistudio.nl/' },
};

// ───────────────────────────────────────────────────────────────────────────
// Klant-logo's — rustig, grijswaarden. Vattenfall en Renewi blijven; iO weg.
// ───────────────────────────────────────────────────────────────────────────
const KLANTEN = ['GGDGHOR', 'Lyreco', 'Vattenfall', 'Renewi', 'Technische Unie'];

// ───────────────────────────────────────────────────────────────────────────
// Drie problemen die elke HR-rapportage in Power BI tegenkomt
// ───────────────────────────────────────────────────────────────────────────
const PROBLEMEN = [
  {
    icon: Shield,
    titel: 'Row-level security klopt niet',
    tekst:
      'Manager X ziet data van team Y. Of erger: wel zichtbaar in oude rapporten, niet in nieuwe. Een AVG-incident wachtend om te gebeuren.',
  },
  {
    icon: Clock,
    titel: 'Historiek ontbreekt',
    tekst:
      'Verloop-cijfer over 2024 verandert achteraf, omdat afdelingsherindelingen retroactief worden toegepast. Niemand vertrouwt de cijfers nog.',
  },
  {
    icon: Database,
    titel: 'Bronnen staan los',
    tekst:
      'AFAS voor personeelsdata, losse verzuim-tool, Excel voor formatie. Geen geheel beeld, geen één bron van waarheid.',
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Pakketten — vaste prijzen, voorspelbare uitkomsten
// ───────────────────────────────────────────────────────────────────────────
const PAKKETTEN = [
  {
    naam: 'HR Analytics Quick Scan',
    prijs: '€1.950 vast',
    doorlooptijd: '1,5 dag',
    voor: 'Audit van bestaand model',
  },
  {
    naam: 'HR Analytics Foundation',
    prijs: '€34.500 vast',
    doorlooptijd: '6-8 weken',
    voor: 'Volledige implementatie',
  },
  {
    naam: 'Foundation Plus',
    prijs: '€58.500 vast',
    doorlooptijd: '8-10 weken',
    voor: 'Multi-bron, meer dashboards',
  },
  {
    naam: 'DashPortal HR Hosting',
    prijs: 'vanaf €1.250/mnd',
    doorlooptijd: 'doorlopend',
    voor: 'Recurring hosting + support',
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Vier onderscheidende punten — 2x2 grid, geen cards
// ───────────────────────────────────────────────────────────────────────────
const ONDERSCHEIDEND = [
  {
    icon: ShieldCheck,
    titel: 'AVG-by-design',
    tekst:
      'RLS, historiek en privacy zijn fundament, geen feature die er achteraf bij komt.',
  },
  {
    icon: Layers,
    titel: 'Bron-zilver-goud-methodiek',
    tekst:
      'Gestructureerd pad in plaats van ad-hoc bouwwerk. Mijn zwaartepunt zit in Zilver, Goud en Semantisch — historiek, sterschema, DAX en RLS — waar het verschil tussen werkbaar en strategisch wordt gemaakt.',
  },
  {
    icon: Server,
    titel: 'DashPortal HR Hosting',
    tekst:
      'Geen overdracht, maar doorlopend beheer. Het werkt elke maand omdat ik het draai.',
  },
  {
    icon: TrendingUp,
    titel: 'Lean Six Sigma Black Belt',
    tekst:
      'HR-processen worden geoptimaliseerd, niet alleen gerapporteerd.',
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Drie cases voor homepage-preview (Vattenfall blijft op /cases bestaan,
// niet hier — homepage focust op de drie meest relevante demo's)
// ───────────────────────────────────────────────────────────────────────────
const CASES = [
  {
    client: 'GGDGHOR',
    label: 'Zorg & overheid',
    description: 'Één bron van waarheid voor 25 GGD-regio\'s en het RIVM.',
    highlight: 'Multi-tenant RLS bewezen op nationaal niveau',
    href: '/cases/ggdghor',
  },
  {
    client: 'Lyreco',
    label: 'Finance & operations',
    description: 'Real-time finance dashboards voor Benelux management.',
    highlight: 'Wekelijkse rapportagecyclus geautomatiseerd',
    href: '/cases/lyreco',
  },
  {
    client: 'Technische Unie',
    label: 'Groothandel',
    description:
      'Afdelingsoverstijgend inzicht over sales, finance en voorraad.',
    highlight: 'Handmatig rapportagewerk geëlimineerd',
    href: '/cases/technische-unie',
  },
];

export default function HomePage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 gap-10 py-20 md:grid-cols-5 md:gap-12 md:py-28">
            {/* Tekst — 60% op desktop */}
            <div className="md:col-span-3 max-w-xl">
              <p className="eyebrow mb-4">HR Analytics Specialist</p>
              <h1 className="mb-6">
                HR analytics in Power BI — door één specialist, niet door een team.
              </h1>
              <p className="lead mb-6">
                Voor mid-market werkgevers met AFAS, Visma of Nmbrs. Vaste prijzen,
                bewezen methodiek, doorlopende hosting via DashPortal HR. AVG-proof
                en historisch correct vanaf dag één.
              </p>
              <p className="text-sm text-[var(--text-secondary)] mb-8">
                Jan Willem den Hollander · 15 jaar Power BI · Lean Six Sigma Black Belt
              </p>
              <div className="flex flex-wrap gap-3">
                <CTA variant="primary">Plan een Quick Scan – €1.950</CTA>
                <CTA variant="lead-magnet" />
              </div>
            </div>

            {/* Foto — 40% op desktop, hidden op mobile */}
            <div className="hidden md:col-span-2 md:flex md:flex-col md:items-end">
              <div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-[var(--border)]">
                <Image
                  src="/team/jan-willem.jpg"
                  alt="Jan Willem den Hollander, HR analytics-specialist"
                  width={480}
                  height={600}
                  priority
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-success)]" />
                Beschikbaar voor HR-trajecten Q2-Q3 2026
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LOGOBALK ═══ */}
      <section className="border-b border-[var(--border)] py-10 bg-[var(--color-neutral-50)]">
        <div className="container mx-auto px-6 md:px-12">
          <p className="eyebrow mb-6 text-center text-[var(--text-secondary)]">
            Vertrouwd door organisaties met gevoelige data
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3">
            {KLANTEN.map((name) => (
              <span
                key={name}
                className="text-sm font-medium tracking-wide text-[var(--text-secondary)] opacity-70 hover:opacity-100 transition-opacity"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DRIE PROBLEMEN ═══ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-5xl px-6 md:px-12">
          <div className="mb-12 max-w-3xl">
            <h2 className="mb-4">De drie problemen die HR-rapportage stuk maken</h2>
            <p className="lead">
              Negen van de tien HR-modellen die ik in audits zie, lopen tegen dezelfde
              drie problemen aan. Niet omdat de bouwers slecht werk leveren — maar omdat
              HR-data anders is dan finance- of operations-data.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {PROBLEMEN.map(({ icon: Icon, titel, tekst }) => (
              <article
                key={titel}
                className="rounded-lg border border-[var(--border)] border-l-[3px] border-l-[var(--color-accent-700)] bg-white p-6 transition-shadow hover:shadow-md"
              >
                <Icon
                  className="mb-4 h-6 w-6 text-[var(--color-accent-700)]"
                  aria-hidden="true"
                />
                <h3 className="mb-3 text-lg">{titel}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {tekst}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ METHODIEK-VISUAL ═══ */}
      <section className="border-y border-[var(--border)] bg-[var(--color-neutral-50)] py-20 md:py-24">
        <div className="container mx-auto max-w-4xl px-6 md:px-12">
          <div className="mb-10 max-w-3xl">
            <h2 className="mb-4">Mijn aanpak — bron, zilver, goud, semantisch</h2>
            <p className="lead">
              Vier lagen, elk met één taak. Het verschil tussen een HR-model dat 5 jaar
              meegaat en eentje die binnen 12 maanden vervangen moet worden.
            </p>
          </div>
          <MethodieDiagram variant="full" />
          <div className="mt-8 text-center">
            <CTA variant="navigation" href="/methodiek">
              Lees meer over de methodiek
            </CTA>
          </div>
        </div>
      </section>

      {/* ═══ PAKKETTEN-TABEL ═══ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-5xl px-6 md:px-12">
          <div className="mb-10 max-w-3xl">
            <h2 className="mb-4">Vaste prijzen, voorspelbare uitkomsten</h2>
            <p className="lead">
              Geen urenbanken, geen verrassingen. Drie scope-niveaus en doorlopende
              hosting via DashPortal HR.
            </p>
          </div>

          {/* Tabel op desktop, kaartjes op mobile */}
          <div className="hidden overflow-hidden rounded-lg border border-[var(--border)] bg-white md:block">
            <table className="w-full text-left">
              <thead className="border-b border-[var(--border)] bg-[var(--color-neutral-50)]">
                <tr>
                  <th className="p-4 text-sm font-semibold">Pakket</th>
                  <th className="p-4 text-sm font-semibold">Prijs</th>
                  <th className="p-4 text-sm font-semibold">Doorlooptijd</th>
                  <th className="p-4 text-sm font-semibold">Voor</th>
                </tr>
              </thead>
              <tbody>
                {PAKKETTEN.map((p, idx) => (
                  <tr
                    key={p.naam}
                    className={
                      idx === PAKKETTEN.length - 1
                        ? 'bg-[var(--color-accent-100)]/40'
                        : 'border-b border-[var(--border)]'
                    }
                  >
                    <td className="p-4 font-display font-semibold">{p.naam}</td>
                    <td className="p-4 text-[var(--text-primary)]">{p.prijs}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {p.doorlooptijd}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {p.voor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: kaartjes */}
          <div className="space-y-3 md:hidden">
            {PAKKETTEN.map((p) => (
              <div
                key={p.naam}
                className="rounded-lg border border-[var(--border)] bg-white p-5"
              >
                <h3 className="mb-1 text-base">{p.naam}</h3>
                <p className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
                  {p.prijs}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {p.doorlooptijd} · {p.voor}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <CTA variant="navigation" href="/hr-analytics">
              Bekijk alle pakketten in detail
            </CTA>
          </div>
        </div>
      </section>

      {/* ═══ VIER ONDERSCHEIDENDE PUNTEN ═══ */}
      <section className="border-y border-[var(--border)] bg-[var(--color-neutral-50)] py-20 md:py-24">
        <div className="container mx-auto max-w-5xl px-6 md:px-12">
          <div className="mb-12 max-w-3xl">
            <h2 className="mb-4">Vier dingen die andere Power BI-consultants niet doen</h2>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
            {ONDERSCHEIDEND.map(({ icon: Icon, titel, tekst }) => (
              <div key={titel} className="flex gap-4">
                <Icon
                  className="h-6 w-6 shrink-0 text-[var(--color-accent-700)]"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="mb-2 text-base font-semibold">{titel}</h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {tekst}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CASES ═══ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-5xl px-6 md:px-12">
          <div className="mb-12 max-w-3xl">
            <h2 className="mb-4">Bewezen in de praktijk</h2>
            <p className="lead">
              Mijn cases zijn niet allemaal HR — ze tonen wel de aanpak die HR-trajecten
              succesvol maken: gevoelige data, multi-tenant RLS, complexe organisaties.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {CASES.map((c) => (
              <Link
                key={c.client}
                href={c.href}
                className="group rounded-lg border border-[var(--border)] bg-white p-6 transition-shadow hover:shadow-md"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  {c.label}
                </p>
                <h3 className="mt-2 mb-2 text-lg">{c.client}</h3>
                <p className="mb-3 text-sm text-[var(--text-secondary)]">
                  {c.description}
                </p>
                <p className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
                  {c.highlight}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary-700)] underline underline-offset-4 transition-colors group-hover:text-[var(--color-primary-900)]">
                  Lees de volledige case
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <CTA variant="navigation" href="/cases">
              Bekijk alle cases
            </CTA>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER-CTA ═══ */}
      <section className="border-t border-[var(--border)] bg-[var(--color-primary-900)] py-20 md:py-24 text-white">
        <div className="container mx-auto max-w-3xl px-6 text-center md:px-12">
          <h2 className="mb-4 text-white">
            Klaar om je HR-rapportage op orde te krijgen?
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-white/85">
            Begin met een Quick Scan. €1.950, 1,5 dag, concrete punten waar je morgen mee
            kunt werken.
          </p>
          <CTA variant="primary">Plan een Quick Scan – €1.950</CTA>
        </div>
      </section>
    </>
  );
}
