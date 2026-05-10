import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { StatBlok, CTA } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Jan Willem den Hollander — HR analytics-specialist | PowerBIStudio',
  description:
    '15 jaar Power BI-ervaring, Lean Six Sigma Black Belt, gespecialiseerd in HR analytics voor mid-market. GGDGHOR, Lyreco, Vattenfall.',
  alternates: { canonical: 'https://www.powerbistudio.nl/over' },
};

const BASE_URL = 'https://www.powerbistudio.nl';

const personLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${BASE_URL}/over#jan-willem`,
  name: 'Jan Willem den Hollander',
  jobTitle: 'HR analytics-specialist',
  description:
    '15 jaar Power BI-ervaring. Lean Six Sigma Black Belt. Solo-specialist in HR analytics voor mid-market werkgevers met AFAS, Visma of Nmbrs.',
  url: `${BASE_URL}/over`,
  image: `${BASE_URL}/team/jan-willem.jpg`,
  worksFor: { '@id': `${BASE_URL}/#organization` },
  knowsAbout: [
    'Power BI',
    'DAX',
    'Microsoft Fabric',
    'Lean Six Sigma',
    'HR analytics',
    'AVG / GDPR',
    'Row-level security',
    'AFAS',
    'Visma',
    'Nmbrs',
  ],
  sameAs: ['https://www.linkedin.com/in/jan-willem-den-hollander/'],
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Over', item: `${BASE_URL}/over` },
  ],
};

const SKILLS = [
  'Power BI',
  'DAX',
  'SQL',
  'Python',
  'Azure Data Factory',
  'Microsoft Fabric',
  'Datamodellering',
  'Type-2 historiek',
  'AVG / GDPR',
  'Row-level security',
  'Lean Six Sigma Black Belt',
  'AFAS',
  'Visma',
  'Nmbrs',
  'Power BI Embedded',
  'Deployment Pipelines',
  'TMDL / versiecontrole',
];

export default function OverPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ═══ HERO ═══ */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
            {/* Foto + beschikbaarheidsbadge */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative w-64 overflow-hidden rounded-lg border border-[var(--border)] md:w-80">
                <Image
                  src="/team/jan-willem.jpg"
                  alt="Jan Willem den Hollander, HR analytics-specialist"
                  width={400}
                  height={500}
                  priority
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-success)]" />
                Beschikbaar voor HR-trajecten Q2-Q3 2026
              </span>
            </div>

            {/* Tekst */}
            <div>
              <p className="eyebrow mb-4">Over mij</p>
              <h1 className="mb-6">
                HR analytics-specialist met 15 jaar Power BI-ervaring.
              </h1>
              <p className="lead">
                Mijn naam is Jan Willem den Hollander. Power BI Studio is mijn
                specialistenpraktijk. Sinds 2026 richt ik me uitsluitend op HR
                analytics in mid-market organisaties met AFAS, Visma of Nmbrs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="border-b border-[var(--border)] bg-[var(--color-neutral-50)] py-12">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatBlok value="15 jaar" label="Power BI-ervaring" />
            <StatBlok value="25+" label="GGD-regio's bediend (multi-tenant RLS)" />
            <StatBlok value="3" label="HR-systemen als specialisme (AFAS, Visma, Nmbrs)" />
            <StatBlok value="1" label="Specialist — geen team" />
          </div>
        </div>
      </section>

      {/* ═══ HET VERHAAL ═══ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="mb-8">Het verhaal van de studio</h2>
              <div className="space-y-6 text-base leading-relaxed text-[var(--text-secondary)]">
                <p>
                  Ik werk al 15 jaar in business intelligence. Power BI, DAX, SQL,
                  Python, Azure, Fabric. Ik heb gewerkt voor GGDGHOR, Lyreco,
                  Vattenfall, Renewi en Technische Unie — meestal aan complexe
                  data-uitdagingen waar privacy, historiek en multi-tenant toegang
                  allemaal samenkwamen.
                </p>
                <p>
                  Een paar jaar geleden zag ik dat HR-rapportage in Power BI bij
                  vrijwel elke organisatie stuk loopt op dezelfde drie punten:
                  row-level security die niet klopt, historiek die ontbreekt, en
                  AVG-conformiteit die er pas achteraf bij komt. Niet omdat de
                  bouwers slecht werk leveren — maar omdat HR-data anders is dan
                  finance- of operations-data, en die nuance ontbreekt in de meeste
                  BI-trajecten.
                </p>
                <p>
                  Daarom ben ik me gaan specialiseren. Power BI Studio levert nu
                  één ding: HR analytics-trajecten voor werkgevers van 250-2.000
                  FTE met AFAS, Visma of Nmbrs. Quick Scan om te onderzoeken,
                  Foundation om te implementeren, DashPortal HR voor de hosting.
                  Vaste prijzen. Bewezen methodiek. Geen interim of urenwerk
                  daarbuiten — die discipline is wat het verhaal werkbaar maakt.
                </p>
                <p>
                  Ik ben Lean Six Sigma Black Belt. Dat betekent dat ik
                  HR-rapportage niet als doel zie, maar als middel: kortere
                  verzuim-detectie, betere onboarding-cijfers, eerlijker
                  beoordelingen. Dashboards die het gedrag in een proces
                  veranderen, niet beschrijven.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <CTA variant="navigation" href="/methodiek">
                  Lees over mijn methodiek
                </CTA>
                <CTA variant="navigation" href="/hr-analytics">
                  Bekijk de pakketten
                </CTA>
              </div>
            </div>

            {/* Sidebar — technische stack + beschikbaarheid */}
            <aside className="space-y-6">
              <div className="rounded-lg border border-[var(--border)] bg-white p-6">
                <h3 className="mb-4 text-base">Technische stack</h3>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-[var(--border)] bg-[var(--color-neutral-50)] px-2.5 py-1 text-xs text-[var(--text-secondary)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border)] border-l-[3px] border-l-[var(--color-accent-700)] bg-white p-6">
                <h3 className="mb-3 text-base">Beschikbaar voor</h3>
                <ul className="space-y-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  <li>HR Analytics Quick Scans (€1.950)</li>
                  <li>Foundation-trajecten (vaste prijs)</li>
                  <li>DashPortal HR Hosting (vanaf €1.250/mnd)</li>
                </ul>
                <p className="mt-4 border-t border-[var(--border)] pt-4 text-xs text-[var(--text-secondary)]">
                  Geen losse interim-uren of generiek Power BI-werk.
                </p>
              </div>

              <Link
                href="https://www.linkedin.com/in/jan-willem-den-hollander/"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-[var(--border)] bg-white p-4 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--color-primary-700)]"
              >
                LinkedIn-profiel →
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="border-t border-[var(--border)] bg-[var(--color-neutral-50)] py-20 md:py-24">
        <div className="container mx-auto max-w-2xl px-6 text-center md:px-12">
          <h2 className="mb-4">Laten we kennismaken</h2>
          <p className="lead mx-auto mb-8">
            Een verkennend gesprek van 30 minuten. Je krijgt mij persoonlijk aan de
            lijn — geen account-manager, geen developer-vervanging halverwege.
            Binnen één werkdag een reactie.
          </p>
          <CTA variant="soft" />
        </div>
      </section>
    </>
  );
}
