import type { Metadata } from 'next';
import {
  Search,
  BarChart3,
  Microscope,
  Wrench,
  ShieldCheck,
  Users,
  Building2,
  Lock,
  TrendingUp,
} from 'lucide-react';
import { CTA, MethodieDiagram } from '@/components/ui';

export const metadata: Metadata = {
  title:
    'Bron-zilver-goud-semantisch + DMAIC — methodiek HR Analytics | PowerBIStudio',
  description:
    'Hoe ik HR-rapportage in Power BI bouw die 5 jaar meegaat. Vier lagen architectuur, Lean Six Sigma toegepast op HR-vraagstukken zoals verzuim, verloop en onboarding.',
  alternates: { canonical: 'https://www.powerbistudio.nl/methodiek' },
};

// ───────────────────────────────────────────────────────────────────────────
// Vier lagen — uitgebreide uitleg
// ───────────────────────────────────────────────────────────────────────────
const LAGEN = [
  {
    naam: 'Bron',
    rol: 'Ruwe data uit AFAS, Visma, Nmbrs',
    werking:
      'Een directe lees-laag op de bronnen. Geen transformaties, geen joins, geen aggregaties — alleen kopiëren naar een controleerbare omgeving. Bron-tabellen worden incrementeel ververst, met audit-stempels per record.',
    waarom:
      'Bron-data raken nooit verloren. Als de zilver- of goud-laag een bug bevat, kun je altijd terug naar de oorspronkelijke waardes. Geen reverse-engineering nodig.',
  },
  {
    naam: 'Zilver',
    rol: 'Opgeschoonde, geharmoniseerde tabellen mét type-2 historiek',
    werking:
      'Datatypes worden geforceerd, NULL-waardes opgeschoond, duplicaten verwijderd en bron-velden krijgen een interne nomenclatuur die over AFAS, Visma en Nmbrs heen consistent is. Hier wordt ook de type-2 historiek (SCD2) opgebouwd: elke wijziging op medewerker, afdeling, functie of kostenplaats krijgt een nieuwe versie met GeldigVan/GeldigTot — zodat de waarheid van toen vastligt.',
    waarom:
      'Datatypes en naming verschillen vaak tussen AFAS-versies of bij migratie van Visma naar Nmbrs — Zilver isoleert die complexiteit. En historiek hoort thuis op het niveau waar dimensies ontstaan, niet pas in het rapportage-model: zo kan elke laag erbovenop er eenduidig uit putten zonder SCD2-logica opnieuw uit te vinden.',
  },
  {
    naam: 'Goud',
    rol: 'HR-feiten en -dimensies in sterschema',
    werking:
      'Sterschema met dimensies (medewerker, afdeling, functie, kostenplaats) en feiten (in-dienst, verzuim-uren, formatie-realisatie). Goud gebruikt de type-2 versies uit Zilver en koppelt feiten via peildatum-logica aan de juiste dimensie-versie — maar bouwt zelf geen SCD2 meer op.',
    waarom:
      'Een sterschema is geoptimaliseerd voor analyse, niet voor cleaning of historiek-opbouw. Door SCD2 onderop in Zilver te beleggen blijft elke laag enkelvoudig in taak — en kunnen ook andere consumenten (datalake, exports, andere rapportagetools) profiteren van dezelfde historiek-bron.',
  },
  {
    naam: 'Semantisch model',
    rol: 'Power BI-model met DAX, RLS, KPI-bibliotheek',
    werking:
      'Het model dat eindgebruikers zien. DAX-measures voor verzuim%, instroom, uitstroom, FTE-realisatie. RLS op organisatiehiërarchie. Documentatie per measure, naming consistent met HR-vakvocabulaire.',
    waarom:
      'Dit is wat een manager opent. Hier moeten 50+ KPIs werken zonder uitleg, en moet RLS automatisch correct zijn. Het is de zichtbare laag — maar zonder de drie eronder is het een leeg omhulsel.',
  },
];

// ───────────────────────────────────────────────────────────────────────────
// DMAIC toegepast op HR
// ───────────────────────────────────────────────────────────────────────────
const DMAIC = [
  {
    icon: Search,
    fase: 'Define',
    omschrijving:
      'Wat is het HR-probleem? Niet "we hebben geen verzuim-dashboard" maar "onze verzuim-detectie loopt 3 weken achter en escaleert pas bij langdurig verzuim."',
  },
  {
    icon: BarChart3,
    fase: 'Measure',
    omschrijving:
      'Power BI als meetinstrument. Waar in het HR-proces verlies je tijd of vertrouwen: sourcing, screening, onboarding, exit-interviews? Cijfers eerst, theorie later.',
  },
  {
    icon: Microscope,
    fase: 'Analyze',
    omschrijving:
      'Datamodel als analyseplatform. DAX-measures die rootcause blootleggen — is verloop geconcentreerd bij specifieke managers? In eerste 6 maanden? Bij bepaalde functies of contracttypen?',
  },
  {
    icon: Wrench,
    fase: 'Improve',
    omschrijving:
      'Dashboards die gedrag veranderen, niet beschrijven. Real-time onboarding-status zodat HR-business-partner kan ingrijpen vóór de 90-dagen-grens. Verzuim-alerts bij patronen, niet bij optellingen.',
  },
  {
    icon: ShieldCheck,
    fase: 'Control',
    omschrijving:
      'Monitoring die borgt dat verbetering standhoudt. Deployment pipelines, data-eigenaarschap per HR-domein, alerting bij abnormale patronen. DashPortal HR Hosting is de control-laag in productie.',
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Doelrollen
// ───────────────────────────────────────────────────────────────────────────
const ROLLEN = [
  {
    icon: Users,
    titel: 'HR-directeur',
    relevantie:
      'Strategische rapportage die per kwartaal klopt en die je zonder voorbehoud aan de RvB kunt presenteren. Geen Excel-correcties achteraf.',
  },
  {
    icon: BarChart3,
    titel: 'HR-controller',
    relevantie:
      'Operationele KPIs (verzuim, instroom, formatie-realisatie) die maandelijks zonder handmatig werk klaarstaan. Tijd terug om te analyseren in plaats van te rapporteren.',
  },
  {
    icon: Lock,
    titel: 'DPO / Data Protection Officer',
    relevantie:
      'AVG-cockpit met overzicht van wie welke gevoelige velden ziet, op welk niveau RLS toepast, en welke datatypes onder welke bewaartermijn vallen.',
  },
  {
    icon: Building2,
    titel: 'CFO met HR-portefeuille',
    relevantie:
      'Verbinding tussen HR-cijfers en financiële realisatie. Personeelskosten per kostenplaats die dagelijks klopt met de boekhouding, niet alleen aan einde-maand.',
  },
];

export default function MethodiekPage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="container mx-auto max-w-4xl px-6 py-20 md:px-12 md:py-28">
          <p className="eyebrow mb-4">De methodiek</p>
          <h1 className="mb-6">
            Bron-zilver-goud-semantisch — toegepast op HR analytics.
          </h1>
          <p className="lead">
            Vier lagen, één doel: een HR-model dat 5 jaar meegaat. Plus een Lean Six
            Sigma-lens (DMAIC) die rapportage verbindt aan procesverbetering — niet
            tot een dashboard, maar tot een ander beoordelings-, onboarding- of
            verzuim-proces.
          </p>
        </div>
      </section>

      {/* ═══ DE VIER LAGEN — VISUEEL ═══ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-4xl px-6 md:px-12">
          <div className="mb-10 max-w-3xl">
            <h2 className="mb-4">De vier lagen op één blik</h2>
            <p className="lead">
              Elk uitgebreid hieronder. Eerst het overzicht — om te zien hoe data
              van onder naar boven stroomt.
            </p>
          </div>
          <MethodieDiagram variant="full" />
        </div>
      </section>

      {/* ═══ DE VIER LAGEN — UITGEBREID ═══ */}
      <section className="border-y border-[var(--border)] bg-[var(--color-neutral-50)] py-20 md:py-24">
        <div className="container mx-auto max-w-4xl px-6 md:px-12">
          <h2 className="mb-12">Per laag uitgelegd</h2>
          <div className="space-y-8">
            {LAGEN.map((laag, idx) => (
              <article
                key={laag.naam}
                className="rounded-lg border border-[var(--border)] bg-white p-6 md:p-8"
              >
                <div className="mb-4 flex items-baseline gap-4">
                  <span className="font-display text-3xl font-semibold text-[var(--color-accent-700)]">
                    0{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-xl">{laag.naam}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {laag.rol}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Hoe het werkt
                    </p>
                    <p className="text-sm leading-relaxed">{laag.werking}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Waarom deze laag
                    </p>
                    <p className="text-sm leading-relaxed">{laag.waarom}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WAAR IK DE DIEPSTE EXPERTISE INBRENG ═══ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-3xl px-6 md:px-12">
          <p className="eyebrow mb-4">Mijn focus binnen de vier lagen</p>
          <h2 className="mb-6">Waar ik de diepste expertise inbreng</h2>
          <p className="lead mb-6">
            Alle vier de lagen horen bij het traject — en bij Foundation bouw ik ze
            ook alle vier. Maar mijn zwaartepunt ligt bij Zilver, Goud en
            Semantisch: cleaning + type-2 historiek, sterschema, DAX-measures,
            row-level security en de KPI-bibliotheek waar managers daadwerkelijk
            op sturen.
          </p>
          <p className="mb-4 text-base leading-relaxed text-[var(--text-secondary)]">
            Bron is meestal werk dat zich leent voor standaardisatie: interne IT
            ontsluit AFAS, Visma of Nmbrs, of een bestaande ETL-tool levert de
            ruwe tabellen aan. De vertaalslag daarná — van bron-data naar een
            model dat een HR-directeur vertrouwt, dat een DPO kan auditen en dat
            50+ managers zonder uitleg gebruiken — speelt zich af in Zilver, Goud
            en Semantisch. Daar zit vijftien jaar Power BI-ervaring, en daar maak
            ik het verschil.
          </p>
          <p className="text-base leading-relaxed text-[var(--text-secondary)]">
            Concreet: bij een Foundation-traject neem ik de hele keten voor mijn
            rekening, inclusief Bron. Bij organisaties met een bestaand
            datawarehouse of dataplatform stap ik vaak in vanaf Zilver of Goud en
            bouw verder op wat er al staat. Beide werken — als de architectuur
            klopt.
          </p>
        </div>
      </section>

      {/* ═══ DMAIC ═══ */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-3xl px-6 md:px-12">
          <div className="mb-12">
            <p className="eyebrow mb-4">Lean Six Sigma op HR</p>
            <h2 className="mb-4">DMAIC toegepast op HR-vraagstukken</h2>
            <p className="lead">
              Architectuur is de helft. De andere helft is dat een HR-rapportage een
              proces verbetert — verzuim-detectie, onboarding-cycle, formatie-realisatie.
              DMAIC is de structurele aanpak daarvoor.
            </p>
          </div>
          <ol className="space-y-8">
            {DMAIC.map(({ icon: Icon, fase, omschrijving }) => (
              <li key={fase} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-100)]">
                  <Icon
                    className="h-5 w-5 text-[var(--color-accent-700)]"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-lg">{fase}</h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {omschrijving}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══ DOELROLLEN ═══ */}
      <section className="border-y border-[var(--border)] bg-[var(--color-neutral-50)] py-20 md:py-24">
        <div className="container mx-auto max-w-5xl px-6 md:px-12">
          <div className="mb-12 max-w-3xl">
            <h2 className="mb-4">Voor welke rollen relevant</h2>
            <p className="lead">
              Een HR-model raakt vier rollen. Elke rol heeft een ander resultaat
              nodig, maar de onderliggende architectuur is dezelfde.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {ROLLEN.map(({ icon: Icon, titel, relevantie }) => (
              <article
                key={titel}
                className="rounded-lg border border-[var(--border)] border-l-[3px] border-l-[var(--color-accent-700)] bg-white p-6"
              >
                <div className="mb-3 flex items-center gap-3">
                  <Icon
                    className="h-6 w-6 text-[var(--color-accent-700)]"
                    aria-hidden="true"
                  />
                  <h3 className="text-lg">{titel}</h3>
                </div>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {relevantie}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER-CTA ═══ */}
      <section className="border-t border-[var(--border)] bg-[var(--color-primary-900)] py-20 md:py-24 text-white">
        <div className="container mx-auto max-w-3xl px-6 text-center md:px-12">
          <TrendingUp
            className="mx-auto mb-6 h-10 w-10 text-[var(--color-accent-600)]"
            aria-hidden="true"
          />
          <h2 className="mb-4 text-white">
            Begin bij de fundering
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-white/85">
            Een Quick Scan toetst je bestaande HR-model tegen deze vier lagen en
            DMAIC-fases. €1.950, 1,5 dag, een eerlijk rapport.
          </p>
          <CTA variant="primary">Plan een Quick Scan – €1.950</CTA>
        </div>
      </section>
    </>
  );
}
