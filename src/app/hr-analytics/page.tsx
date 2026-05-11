import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Shield,
  Clock,
  Database,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';
import { CTA, MethodieDiagram } from '@/components/ui';

export const metadata: Metadata = {
  title: 'HR Analytics in Power BI — methodiek, pakketten, prijzen | PowerBIStudio',
  description:
    'Bewezen aanpak voor HR-rapportage in Power BI: AVG-by-design, type-2 historiek, RLS op organisatiehiërarchie. Vaste prijzen, doorlopende hosting via DashPortal HR.',
  alternates: { canonical: 'https://www.powerbistudio.nl/hr-analytics' },
};

// ───────────────────────────────────────────────────────────────────────────
// Drie problemen — uitgebreidere uitleg dan op homepage
// ───────────────────────────────────────────────────────────────────────────
const PROBLEMEN = [
  {
    icon: Shield,
    titel: 'Row-level security klopt niet',
    samenvatting:
      'Manager X ziet data van team Y. Of erger: wel zichtbaar in oude rapporten, niet in nieuwe. Een AVG-incident wachtend om te gebeuren.',
    detail:
      'Multi-level managers, dotted-line-rapportage, project-organisaties — typische HR-realiteit waar standaard RLS-templates op stuk lopen. Ik bouw RLS op de organisatiehiërarchie zelf, niet op losse user-mappings, en valideer met audit-trails.',
  },
  {
    icon: Clock,
    titel: 'Historiek ontbreekt',
    samenvatting:
      'Verloop-cijfer over 2024 verandert achteraf, omdat afdelingsherindelingen retroactief worden toegepast. Niemand vertrouwt de cijfers nog.',
    detail:
      'HR-rapportage zonder type-2 historiek is een tijdbom. Verzuim per afdeling, instroom per kostenplaats, formatie-realisatie — allemaal afhankelijk van wie wanneer waar werkte. Ik bouw type-2 dimensie-historiek in de zilver-laag vanaf dag één, zodat alle cijfers retroactief stabiel blijven.',
  },
  {
    icon: Database,
    titel: 'Bronnen staan los',
    samenvatting:
      'AFAS voor personeelsdata, losse verzuim-tool, Excel voor formatie. Geen geheel beeld, geen één bron van waarheid.',
    detail:
      'Multi-bron HR is de norm, niet de uitzondering. Foundation Plus combineert AFAS/Visma/Nmbrs met verzuim-systemen, recruitment-trackers en formatie-Excels in één semantisch model — met conflict-resolutie als bron-data tegenstrijdig is.',
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Voor wie / niet voor wie
// ───────────────────────────────────────────────────────────────────────────
const VOOR_WIE = [
  'Werkgevers met 250-2.000 FTE in Nederland',
  'AFAS, Visma of Nmbrs als HR-systeem',
  'HR-controller of HR-directeur die de regie wil terugnemen',
  'DPO of CFO die AVG-zorgen heeft over bestaand model',
  'Organisaties die hun HR-rapportage willen schalen naar 50+ managers',
];

const NIET_VOOR_WIE = [
  'Werkgevers <100 FTE — overkill, beter af met standaard AFAS-rapporten',
  'Organisaties die generieke Power BI-modellering zoeken — daarvoor zijn andere consultants',
  'SAP SuccessFactors of Workday-implementaties — buiten mijn specialisme',
  'Trajecten korter dan 6 weken op losse-uren basis — alleen vaste pakketten',
];

// ───────────────────────────────────────────────────────────────────────────
// Pakketten met volledige details
// ───────────────────────────────────────────────────────────────────────────
const PAKKETTEN = [
  {
    naam: 'HR Analytics Quick Scan',
    prijs: '€1.950',
    doorlooptijd: '1,5 dag',
    voorWie: 'Bestaand HR-model dat audit nodig heeft',
    inhoud: [
      'Audit van datamodel, RLS, historiek, AVG-conformiteit',
      'Concrete actielijst met prioritering en effort-inschatting',
      'Bevindingen-rapport van 8-12 paginas',
      '60-min review-sessie om resultaten door te nemen',
    ],
    accent: false,
    type: 'fixed' as const,
  },
  {
    naam: 'HR Analytics Foundation',
    prijs: '€34.500',
    doorlooptijd: '6-8 weken',
    voorWie: 'Volledige implementatie van bron tot dashboard',
    inhoud: [
      'Bron-zilver-goud-semantisch model in Power BI',
      'RLS op organisatiehiërarchie, getoetst met audit-cases',
      'Type-2 historiek voor alle HR-dimensies',
      '3 standaard-dashboards: verzuim, instroom/uitstroom, formatie',
      'AVG-cockpit voor DPO inzicht',
      'Documentatie + handover sessie',
    ],
    accent: true,
    type: 'fixed' as const,
  },
  {
    naam: 'HR Analytics Foundation Plus',
    prijs: '€58.500',
    doorlooptijd: '8-10 weken',
    voorWie: 'Multi-bron, maatwerk-dashboards, complexere organisatie',
    inhoud: [
      'Alles uit Foundation',
      'Multi-bron integratie (AFAS + verzuim + recruitment + formatie)',
      'Tot 6 maatwerk-dashboards op KPIs van jouw keuze',
      'Custom RLS-scenarios (matrix-organisatie, project-managers, etc.)',
      'Train-de-trainer sessie voor HR-team',
    ],
    accent: false,
    type: 'fixed' as const,
  },
  {
    naam: 'DashPortal HR Hosting',
    prijs: 'vanaf €1.250/mnd',
    doorlooptijd: 'doorlopend',
    voorWie: 'Recurring hosting + support na een Foundation-traject',
    inhoud: [
      'AVG-proof hosting, geen Microsoft-licenties per gebruiker',
      'Branded portaal voor 50+ managers',
      'Maandelijkse data-hygiene monitoring',
      'Eerste-lijn support op rapportage-vragen',
      'Kwartaal-review op model-performance en KPIs',
    ],
    accent: false,
    type: 'recurring' as const,
  },
];

// ───────────────────────────────────────────────────────────────────────────
// FAQ — 8 vragen die mid-market HR-leads typisch stellen
// ───────────────────────────────────────────────────────────────────────────
const FAQ = [
  {
    vraag: 'Werken jullie alleen met AFAS, Visma en Nmbrs?',
    antwoord:
      'Ja. Ik specialiseer in deze drie omdat ze samen ~80% van de Nederlandse mid-market dekken. Voor SAP SuccessFactors of Workday-implementaties verwijs ik je door naar specialisten met meer ervaring in die ecosystemen.',
  },
  {
    vraag: 'Wat als ons HR-systeem niet in jullie lijst staat?',
    antwoord:
      'Vraag het in een Quick Scan. Heeft je systeem een API of fatsoenlijke export, dan is integratie meestal mogelijk — maar geen garantie. Eerlijk antwoord op dag één is beter dan teleurstelling halverwege het traject.',
  },
  {
    vraag: 'Waarom vaste prijzen i.p.v. urenwerk?',
    antwoord:
      'Voorspelbaarheid voor jou, focus voor mij. Vaste prijs dwingt scope-helderheid bij de start. Het maakt ook duidelijk wanneer iets buiten scope valt — dat krijgt dan een eigen vast aanbod, niet een open uren-rekening.',
  },
  {
    vraag: 'Zijn jullie ISO 27001-gecertificeerd?',
    antwoord:
      'Nog niet. ISO-traject staat op de roadmap voor 2026. Voor nu: ik werk solo, alle data blijft in jullie eigen Microsoft-tenant, en ik teken een bewerkersovereenkomst en NDA bij elke opdracht. DashPortal HR draait op AVG-conforme EU-infrastructuur.',
  },
  {
    vraag: 'Wat als we al een Power BI-omgeving hebben?',
    antwoord:
      'Dan is een Quick Scan de logische start. €1.950, 1,5 dag, je krijgt een eerlijke audit met concrete actielijst. Geen verkooppraatje — soms is de uitkomst "de fundering is goed, focus op deze 3 specifieke fixes". Dan zegt de scan zichzelf op.',
  },
  {
    vraag: 'Hoe gaat een Foundation-traject in de praktijk?',
    antwoord:
      'Week 1: kickoff + datamodel-ontwerp. Week 2-3: bron-zilver-goud-laag bouwen, gevalideerd door HR-stakeholders. Week 4-5: semantisch model + RLS + dashboards. Week 6: AVG-cockpit + handover. Vaste reviews op vrijdagen, geen verrassingen.',
  },
  {
    vraag: 'Werkt DashPortal HR ook zonder een Foundation-traject?',
    antwoord:
      'Technisch ja, praktisch zelden. DashPortal HR is gebouwd om Foundation-modellen te hosten. Standalone hosting is mogelijk vanaf Professional-tier (€1.950/mnd) als je bestaande model voldoet aan de architectuur-eisen. Quick Scan filtert dat eerst.',
  },
  {
    vraag: 'Wie is mijn aanspreekpunt tijdens het traject?',
    antwoord:
      'Ik. Power BI Studio is geen team — Jan Willem den Hollander doet de architectuur, het bouwen, de validatie en de handover. Geen account-manager, geen developer-vervanging halverwege. Eén lijn, één gezicht, vijftien jaar ervaring.',
  },
];

export default function HRAnalyticsPage() {
  // Schema.org JSON-LD: FAQPage + Services per pakket
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((q) => ({
      '@type': 'Question',
      name: q.vraag,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.antwoord,
      },
    })),
  };

  const servicesSchema = {
    '@context': 'https://schema.org',
    '@graph': PAKKETTEN.filter((p) => p.type === 'fixed').map((p) => ({
      '@type': 'Service',
      name: p.naam,
      provider: {
        '@type': 'ProfessionalService',
        name: 'Power BI Studio',
        url: 'https://www.powerbistudio.nl',
      },
      offers: {
        '@type': 'Offer',
        price: p.prijs.replace(/[^\d]/g, ''),
        priceCurrency: 'EUR',
      },
      description: p.voorWie,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />

      {/* ═══ HERO ═══ */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="container mx-auto max-w-4xl px-6 py-20 md:px-12 md:py-28">
          <p className="eyebrow mb-4">HR Analytics-traject</p>
          <h1 className="mb-6">
            HR analytics in Power BI — bewezen methodiek, vaste prijzen.
          </h1>
          <p className="lead mb-8">
            Voor mid-market werkgevers met AFAS, Visma of Nmbrs. Drie pakketten,
            één doel: HR-rapportage die AVG-proof is, historisch klopt, en die je
            niet over twee jaar opnieuw hoeft te bouwen.
          </p>
          <div className="flex flex-wrap gap-3">
            <CTA variant="primary">Plan een Quick Scan – €1.950</CTA>
            <CTA variant="lead-magnet" />
          </div>
        </div>
      </section>

      {/* ═══ VOOR WIE / NIET VOOR WIE ═══ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-5xl px-6 md:px-12">
          <h2 className="mb-12">Voor wie ik werk — en voor wie niet</h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] border-l-[3px] border-l-[var(--color-accent-700)] bg-white p-6">
              <h3 className="mb-5 text-lg">Past goed bij mij</h3>
              <ul className="space-y-3">
                {VOOR_WIE.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      className="mt-1 h-4 w-4 shrink-0 text-[var(--color-accent-700)]"
                      aria-hidden="true"
                    />
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-white p-6">
              <h3 className="mb-5 text-lg text-[var(--text-secondary)]">
                Past minder
              </h3>
              <ul className="space-y-3">
                {NIET_VOOR_WIE.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <X
                      className="mt-1 h-4 w-4 shrink-0 text-[var(--text-secondary)]"
                      aria-hidden="true"
                    />
                    <span className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DRIE PROBLEMEN UITGEBREID ═══ */}
      <section className="border-y border-[var(--border)] bg-[var(--color-neutral-50)] py-20 md:py-24">
        <div className="container mx-auto max-w-5xl px-6 md:px-12">
          <div className="mb-12 max-w-3xl">
            <h2 className="mb-4">De drie patterns die elke HR-rapportage stuk maken</h2>
            <p className="lead">
              Hetzelfde probleem in verschillende vormen. Het verschil tussen een
              audit die rust geeft en een audit die paniek brengt.
            </p>
          </div>
          <div className="space-y-6">
            {PROBLEMEN.map(({ icon: Icon, titel, samenvatting, detail }) => (
              <article
                key={titel}
                className="grid grid-cols-1 gap-5 rounded-lg border border-[var(--border)] bg-white p-6 md:grid-cols-[auto_1fr] md:gap-8 md:p-8"
              >
                <Icon
                  className="h-8 w-8 shrink-0 text-[var(--color-accent-700)]"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="mb-2 text-xl">{titel}</h3>
                  <p className="mb-4 text-base text-[var(--text-secondary)]">
                    {samenvatting}
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                    {detail}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ METHODIEK ═══ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-4xl px-6 md:px-12">
          <div className="mb-10 max-w-3xl">
            <h2 className="mb-4">De methodiek — bron, zilver, goud, semantisch</h2>
            <p className="lead">
              Vier lagen, één doel: een HR-model dat 5 jaar meegaat. Niet ad-hoc,
              maar gestructureerd, met elke laag een duidelijke taak.
            </p>
          </div>
          <MethodieDiagram variant="full" />
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-[var(--text-secondary)]">
            Ik werk over alle vier de lagen, maar mijn diepste expertise ligt in
            Zilver, Goud en Semantisch: cleaning + type-2 historiek, sterschema,
            DAX, RLS en KPI-bibliotheek. Bij organisaties met een bestaand
            dataplatform stap ik daar in; bij Foundation-trajecten bouw ik de
            volledige keten.
          </p>
          <div className="mt-8 text-center">
            <CTA variant="navigation" href="/methodiek">
              Volledige uitleg over de methodiek
            </CTA>
          </div>
        </div>
      </section>

      {/* ═══ PAKKETTEN MET DETAILS ═══ */}
      <section className="border-y border-[var(--border)] bg-[var(--color-neutral-50)] py-20 md:py-24">
        <div className="container mx-auto max-w-6xl px-6 md:px-12">
          <div className="mb-12 max-w-3xl">
            <h2 className="mb-4">Drie pakketten + doorlopende hosting</h2>
            <p className="lead">
              Vaste prijs, vaste scope, vaste doorlooptijd. Geen meeruren-discussies.
              Wat erin zit is wat je krijgt — en wat eruit blijft krijgt een eigen,
              losse offerte.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {PAKKETTEN.map((p) => (
              <article
                key={p.naam}
                className={`flex flex-col rounded-lg border bg-white p-6 md:p-8 ${
                  p.accent
                    ? 'border-[var(--color-accent-700)] shadow-[0_4px_20px_-4px_rgba(14,124,102,0.15)]'
                    : 'border-[var(--border)]'
                }`}
              >
                {p.accent && (
                  <p className="eyebrow mb-3">Meest gekozen</p>
                )}
                <h3 className="mb-2 text-xl">{p.naam}</h3>
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="font-display text-2xl font-semibold">
                    {p.prijs}
                  </span>
                  {p.type === 'fixed' && (
                    <span className="text-sm text-[var(--text-secondary)]">vast</span>
                  )}
                </div>
                <p className="mb-5 text-sm text-[var(--text-secondary)]">
                  {p.doorlooptijd} · {p.voorWie}
                </p>
                <ul className="mb-6 space-y-2.5 flex-1">
                  {p.inhoud.map((punt) => (
                    <li key={punt} className="flex items-start gap-2.5">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent-700)]"
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-relaxed">{punt}</span>
                    </li>
                  ))}
                </ul>
                <CTA variant={p.accent ? 'primary' : 'soft'}>
                  {p.accent ? 'Plan een Quick Scan – €1.950' : 'Plan een verkennend gesprek'}
                </CTA>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-3xl px-6 md:px-12">
          <h2 className="mb-12">Veelgestelde vragen</h2>
          <div className="space-y-3">
            {FAQ.map((q) => (
              <details
                key={q.vraag}
                className="group rounded-lg border border-[var(--border)] bg-white p-5 transition-colors hover:border-[var(--color-accent-700)]/40"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-display font-semibold">
                  <span>{q.vraag}</span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-[var(--color-accent-700)] transition-transform group-open:rotate-90"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {q.antwoord}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER-CTA ═══ */}
      <section className="border-t border-[var(--border)] bg-[var(--color-primary-900)] py-20 md:py-24 text-white">
        <div className="container mx-auto max-w-3xl px-6 text-center md:px-12">
          <h2 className="mb-4 text-white">
            Begin met een Quick Scan
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-white/85">
            €1.950, 1,5 dag, een audit-rapport van 8-12 paginas met concrete
            actiepunten. Geen verkooppraatje, wel een eerlijke beoordeling.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <CTA variant="primary">Plan een Quick Scan – €1.950</CTA>
            <Link
              href="/contact?type=verkennend"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/40 bg-transparent px-5 py-2.5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-white/10"
            >
              Of plan een verkennend gesprek
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
