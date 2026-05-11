import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, FileDown, Lock, ArrowRight } from 'lucide-react';
import LeadCaptureForm from '@/components/lead/LeadCaptureForm';
import { CTA } from '@/components/ui';

export const metadata: Metadata = {
  title: 'AVG-checklist HR Power BI — 12 controlepunten | PowerBIStudio',
  description:
    'Twaalf concrete AVG-controlepunten voor je HR-rapportage in Power BI. RLS, historiek, dataminimalisatie, bewaartermijnen — wat in 9 van de 10 audits opduikt.',
  alternates: { canonical: 'https://www.powerbistudio.nl/avg-checklist-hr' },
  openGraph: {
    title: 'AVG-checklist HR Power BI — 12 controlepunten',
    description:
      'Twaalf concrete AVG-controlepunten voor je HR-rapportage in Power BI.',
    type: 'article',
    url: 'https://www.powerbistudio.nl/avg-checklist-hr',
  },
};

type ChecklistPunt = {
  nummer: number;
  titel: string;
  vraag: string;
  uitleg: string;
};

const PUNTEN: ChecklistPunt[] = [
  {
    nummer: 1,
    titel: 'Hiërarchische RLS op organisatie-eenheid',
    vraag: 'Zien managers alleen hun eigen team — automatisch, zonder maandelijks bijhouden?',
    uitleg:
      'RLS op e-mailadres of handmatige user-mapping breekt zodra iemand van team wisselt. Verbind RLS aan de actuele organisatie-hiërarchie uit AFAS/Visma/Nmbrs, met type-2 historiek voor retroactieve correctheid.',
  },
  {
    nummer: 2,
    titel: 'Type-2 historiek op medewerker-dimensie',
    vraag: 'Klopt jullie verloop-cijfer van twee jaar terug nog steeds als er reorganisaties zijn geweest?',
    uitleg:
      'Zonder SCD2 verandert je historisch verzuim- en formatiecijfer elke keer dat een medewerker van team wisselt of een afdeling wordt opgeknipt. Type-2 historiek (peildatum-logica) houdt de waarheid van toen vast.',
  },
  {
    nummer: 3,
    titel: 'Dataminimalisatie — alleen velden die rapporten nodig hebben',
    vraag: 'Zit BSN, geboortedatum of paspoortnummer in het Power BI-model terwijl geen enkel rapport dat gebruikt?',
    uitleg:
      'AVG eist dat je niet méér verwerkt dan nodig. Een audit van de medewerker-tabel: welke velden zijn écht in gebruik? De rest hoort niet in de semantische laag, alleen in de bron.',
  },
  {
    nummer: 4,
    titel: 'Doelbinding per dataset',
    vraag: 'Is per Power BI-dataset vastgelegd wat het doel van de verwerking is?',
    uitleg:
      'Een dataset voor verzuim-analyse heeft een ander doel dan een dataset voor formatie-rapportage. Het verwerkingsregister moet per dataset het doel, de grondslag en de ontvangers benoemen — niet één algemene "HR-rapportage" entry.',
  },
  {
    nummer: 5,
    titel: 'Bewaartermijnen automatisch toegepast',
    vraag: 'Verdwijnen uitgestroomde medewerkers automatisch uit het model na de wettelijke bewaartermijn?',
    uitleg:
      'Salarisadministratie 7 jaar, sollicitatiegegevens 4 weken, exit-data 2 jaar — verschillende termijnen per veld. Power BI moet die termijnen kennen en filteren, niet de HR-medewerker die handmatig moet opschonen.',
  },
  {
    nummer: 6,
    titel: 'Verwerkingsregister gekoppeld aan het model',
    vraag: 'Weet de DPO welke velden, welke RLS-rollen en welke ontvangers er aan welke Power BI-dataset hangen?',
    uitleg:
      'Een verwerkingsregister in een Word-document is na drie wijzigingen verouderd. Maak een AVG-cockpit die uit Power BI metadata leest: welke velden bestaan, welke RLS, wie heeft toegang. Live, niet een snapshot.',
  },
  {
    nummer: 7,
    titel: 'Toegangsbeheer in Power BI Service',
    vraag: 'Krijgt elke nieuwe HR-medewerker automatisch de juiste workspace-toegang, en wordt die ook ingetrokken bij uitstroom?',
    uitleg:
      'AVG-toegangsbeheer is meer dan RLS in het model. Workspace-rollen (Viewer, Member, Contributor, Admin) bepalen wie wat kan zien én wijzigen. Koppel dat aan een Azure AD-groep die meegaat met in- en uitstroom, niet aan individuele accounts.',
  },
  {
    nummer: 8,
    titel: 'Export-beperking voor gevoelige rapporten',
    vraag: 'Kan iedereen die het verzuim-dashboard ziet, dat zonder restricties naar Excel exporteren?',
    uitleg:
      'Een Excel-export verlaat de governance-grenzen van Power BI. Voor gevoelige HR-rapporten: zet export uit (sensitivity labels of workspace-policy), of beperk tot geaggregeerde data. Audit-trail van wie wat heeft geëxporteerd hoort thuis in tenant-instellingen.',
  },
  {
    nummer: 9,
    titel: 'Auditeerbare data-lineage',
    vraag: 'Kun je voor één veld in een HR-rapport terugherleiden uit welk AFAS/Visma/Nmbrs-veld het komt en welke transformaties het heeft ondergaan?',
    uitleg:
      'Bij een AVG-vraag ("welke gegevens van mij zitten waar?") moet je antwoord kunnen geven. Data-lineage via Power BI (lineage view) of expliciet gedocumenteerd in de zilver- en goud-laag — niet alleen in iemands hoofd.',
  },
  {
    nummer: 10,
    titel: 'Refresh-monitoring met stale-data-melding',
    vraag: 'Krijgen rapport-gebruikers een waarschuwing als het verzuim-cijfer 5 dagen oud is?',
    uitleg:
      'Beslissen op verouderde data is een AVG-risico (onjuiste verwerking) én een operationeel risico. Refresh-monitoring met automatische alerts naar de eigenaar als datasets niet ververst zijn. DashPortal HR biedt dit standaard.',
  },
  {
    nummer: 11,
    titel: 'Test-omgeving zonder productiedata',
    vraag: 'Bouwen ontwikkelaars en testers met echte medewerker-data of met geanonimiseerde testdata?',
    uitleg:
      'Productiedata in een dev-workspace is een datalek-in-wachtende-staat. Bouw een geanonimiseerd testset (zelfde structuur, fictieve namen en cijfers) voor alle non-productie omgevingen. DEV en TEST workspaces krijgen die testset, PROD krijgt de echte bron.',
  },
  {
    nummer: 12,
    titel: 'Incident-protocol voor datalekken',
    vraag: 'Weet je binnen 72 uur welke medewerkers wél en welke niet getroffen zijn als een rapport per ongeluk verkeerd gedeeld wordt?',
    uitleg:
      'AVG eist meldplicht binnen 72 uur bij datalek. Dat kan alleen als je een audit-trail hebt van toegangen en exports, gekoppeld aan een protocol dat DPO, IT en HR samen activeert. Documenteer dit voordat het nodig is — niet erna.',
  },
];

export default function AVGChecklistHRPage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="container mx-auto max-w-4xl px-6 py-20 md:px-12 md:py-28">
          <p className="eyebrow mb-4">AVG-checklist HR</p>
          <h1 className="mb-6">
            Twaalf controlepunten voor je HR Power BI-model.
          </h1>
          <p className="lead">
            Wat in negen van de tien HR Power BI-audits naar boven komt — bewerkt
            tot een checklist die je nu kunt aflopen. Geen AVG-theorie, wel
            concrete punten die je in je eigen model kunt controleren.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--color-accent-700)]" />
              12 controlepunten
            </span>
            <span className="hidden md:inline">·</span>
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-[var(--color-accent-700)]" />
              Voor DPO, HR-controller, BI-lead
            </span>
            <span className="hidden md:inline">·</span>
            <span className="inline-flex items-center gap-2">
              <FileDown className="h-4 w-4 text-[var(--color-accent-700)]" />
              PDF onderaan om te delen
            </span>
          </div>
        </div>
      </section>

      {/* ═══ VOOR WIE ═══ */}
      <section className="border-b border-[var(--border)] bg-[var(--color-neutral-50)] py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-6 md:px-12">
          <h2 className="mb-6">Voor wie deze checklist is.</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <h3 className="mb-2 text-base">DPO / Functionaris Gegevensbescherming</h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                Wat moet je weten over het HR-model voordat je het verwerkingsregister
                tekent? Deze checklist geeft de kritieke vragen die je moet stellen
                aan IT en HR.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-base">HR-controller</h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                Verantwoordelijk voor de juistheid van verzuim-, instroom- en
                formatiecijfers. Deze checklist toont waar je rapportage stilletjes
                onjuist wordt door slechte modellering.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-base">BI-lead in een HR-team</h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                Je bouwt of beheert het Power BI-HR-model. Deze checklist is je
                eigen audit voor de volgende DPIA of externe controle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DE 12 PUNTEN ═══ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-6 md:px-12">
          <h2 className="mb-2">De checklist.</h2>
          <p className="mb-12 text-[var(--text-secondary)]">
            Per punt: de vraag die je stelt, en wat er typisch fout gaat als het
            antwoord &ldquo;nee&rdquo; is.
          </p>
          <ol className="space-y-10">
            {PUNTEN.map((punt) => (
              <li key={punt.nummer} className="flex gap-5">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-accent-100)] text-sm font-semibold text-[var(--color-accent-700)]"
                  aria-hidden="true"
                >
                  {punt.nummer}
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg">{punt.titel}</h3>
                  <p className="mb-3 text-[0.9375rem] font-medium text-[var(--text-primary)]">
                    {punt.vraag}
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {punt.uitleg}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══ PDF-DOWNLOAD ═══ */}
      <section
        id="download"
        className="border-y border-[var(--border)] bg-[var(--color-neutral-50)] py-16 md:py-20"
      >
        <div className="container mx-auto max-w-2xl px-6 md:px-12">
          <div className="rounded-lg border border-[var(--border)] bg-white p-6 md:p-8">
            <div className="mb-5 flex items-start gap-4">
              <FileDown
                className="h-8 w-8 flex-shrink-0 text-[var(--color-accent-700)]"
                aria-hidden="true"
              />
              <div>
                <h2 className="mb-1 text-xl">Wil je deze checklist als PDF?</h2>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  Handig om te delen met je DPO, leidinggevende of externe
                  auditor. Eén pagina overzicht, twee pagina&apos;s toelichting.
                </p>
              </div>
            </div>
            <LeadCaptureForm
              vertical="hr"
              source="avg-checklist-hr"
              title="Download de AVG-checklist HR"
              description="Laat je e-mailadres achter — je krijgt direct een downloadlink."
              buttonText="Stuur me de PDF"
              fields={['name', 'email', 'company']}
              downloadUrl="/downloads/avg-checklist-hr.pdf"
            />
          </div>
        </div>
      </section>

      {/* ═══ VERVOLGSTAPPEN ═══ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-6 md:px-12">
          <h2 className="mb-6">Wat je hierna kunt doen.</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <article className="rounded-lg border border-[var(--border)] bg-white p-6">
              <h3 className="mb-2 text-base">Doe de Readiness Scan</h3>
              <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                Tien vragen over je huidige HR-rapportage. Snelle inschatting van
                volwassenheid en prioriteiten.
              </p>
              <Link
                href="/tools/readiness-scan"
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary-700)] underline underline-offset-4 transition-colors hover:text-[var(--color-primary-900)]"
              >
                Start de scan
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </article>
            <article className="rounded-lg border border-[var(--border)] bg-white p-6">
              <h3 className="mb-2 text-base">Lees de methodiek</h3>
              <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                Hoe een AVG-proof HR-model van bron tot semantisch laag wordt
                opgebouwd. Vier lagen, zonder shortcuts.
              </p>
              <Link
                href="/methodiek"
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary-700)] underline underline-offset-4 transition-colors hover:text-[var(--color-primary-900)]"
              >
                Bekijk de methodiek
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </article>
            <article className="rounded-lg border border-[var(--border)] bg-white p-6">
              <h3 className="mb-2 text-base">Plan een Quick Scan</h3>
              <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                Anderhalve dag waarin ik je HR-model audit op deze 12 punten —
                met concrete actielijst. €1.950 vast.
              </p>
              <Link
                href="/contact?type=quick-scan"
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary-700)] underline underline-offset-4 transition-colors hover:text-[var(--color-primary-900)]"
              >
                Plan een Quick Scan
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER-CTA ═══ */}
      <section className="border-t border-[var(--border)] bg-white py-16 md:py-20">
        <div className="container mx-auto max-w-2xl px-6 text-center md:px-12">
          <h2 className="mb-4">Hulp nodig bij één van de twaalf?</h2>
          <p className="lead mx-auto mb-8">
            De checklist is zelfdiagnose. Een Quick Scan is hetzelfde maar
            grondiger — ik loop het model met je door en geef per punt een
            concrete actie.
          </p>
          <CTA variant="primary">Plan een Quick Scan – €1.950</CTA>
        </div>
      </section>
    </>
  );
}
