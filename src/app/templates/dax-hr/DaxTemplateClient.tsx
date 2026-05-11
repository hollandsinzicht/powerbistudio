'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Code2, ArrowRight, Lock } from 'lucide-react';

interface Template {
  id: string;
  titel: string;
  context: string;
  toepassing: string;
  voorwaarden: string[];
  dax: string;
  uitleg: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'rls-hierarchie',
    titel: 'Hiërarchische RLS-rol (managers zien hun eigen organisatie-tak)',
    context:
      'Manager A ziet alleen team A. Senior manager X ziet alle teams onder X. De RLS volgt de actuele organisatie-hiërarchie uit AFAS, Visma of Nmbrs — niet een handmatige user-mapping.',
    toepassing:
      'Plaats deze filter op de medewerker-tabel als RLS-rol "ManagerRol". Gebruikt PATH-functies in DAX om de organisatie-hiërarchie te traversen.',
    voorwaarden: [
      'Medewerker-tabel heeft kolom Manager_UPN met de e-mail van de directe manager.',
      'Berekende kolom Manager_Pad = PATH ( Medewerker[UPN], Medewerker[Manager_UPN] ).',
      'Logged-in gebruiker is herkenbaar via USERPRINCIPALNAME ( ).',
    ],
    dax: `// RLS-rol: ManagerRol
// Plaats deze filter op de medewerker-tabel.
// Werkt voor elke nesting-diepte van de organisatie-hi\u00ebrarchie.

VAR HuidigeUser = USERPRINCIPALNAME ()
RETURN
    PATHCONTAINS ( Medewerker[Manager_Pad], HuidigeUser )
        || Medewerker[UPN] = HuidigeUser`,
    uitleg:
      'PATHCONTAINS controleert of de huidige gebruiker ergens in het manager-pad van een medewerker voorkomt. De OR met UPN zorgt dat iedereen ook altijd zijn eigen rij ziet. Bij in- of uitstroom of een team-wissel hoef je niets te doen: de Manager_Pad-kolom wordt bij elke refresh herberekend uit AFAS/Visma/Nmbrs.',
  },
  {
    id: 'verzuim-peildatum',
    titel: 'Verzuimpercentage met peildatum (historisch correct)',
    context:
      'Het verzuimpercentage van vorig jaar moet vandaag dezelfde waarde geven als vorig jaar — ongeacht reorganisaties of medewerker-mutaties. Dat kan alleen met type-2 historiek (SCD2) op de medewerker-dimensie.',
    toepassing:
      'Een measure die het verzuim-FTE deelt door het beschikbare-FTE op de peildatum die de gebruiker selecteert (slicer op Kalender-tabel).',
    voorwaarden: [
      'Feittabel Verzuim met datum-kolom en uren-kolom.',
      'Medewerker-dimensie met SCD2: kolommen GeldigVan, GeldigTot, FTE.',
      'Kalender-tabel verbonden aan Verzuim op datum (gewone 1-op-veel relatie).',
    ],
    dax: `// Measure: Verzuimpercentage[peildatum]
// Historisch correct: gebruikt SCD2-versies van de medewerker
// die geldig waren op de geselecteerde peildatum.

VAR Peildatum = MAX ( Kalender[Datum] )
VAR ActieveMedewerkers =
    CALCULATETABLE (
        Medewerker,
        Medewerker[GeldigVan] <= Peildatum,
        Medewerker[GeldigTot] >= Peildatum
    )
VAR BeschikbaarFTE =
    CALCULATE (
        SUMX ( ActieveMedewerkers, Medewerker[FTE] )
    )
VAR VerzuimFTE =
    DIVIDE ( SUM ( Verzuim[Uren] ), 8 * 5 )   // 8u/dag, 5 dagen/week
RETURN
    DIVIDE ( VerzuimFTE, BeschikbaarFTE )`,
    uitleg:
      'De measure pakt de actieve medewerker-versies op de peildatum (SCD2) en sommeert hun FTE. Het verzuim wordt in FTE-equivalent omgezet en gedeeld. Reorganisatie achteraf? Geen effect — de oude GeldigVan/Tot-rijen blijven staan, dus oude rapportages blijven kloppen.',
  },
  {
    id: 'formatie-realisatie',
    titel: 'Formatie-realisatie per organisatie-eenheid',
    context:
      'HR-controllers willen weten: hoeveel FTE staat er op de formatie, en hoeveel is er werkelijk bezet — per afdeling, per peildatum. Het verschil is openstaande vacatures of overcapaciteit.',
    toepassing:
      'Twee measures (Formatie en Bezetting) plus een derde voor de gap. Werkt op één organisatie-eenheid in een slicer, of geaggregeerd over de hele organisatie.',
    voorwaarden: [
      'Tabel Formatie met kolommen Org_Eenheid, GeldigVan, GeldigTot, GeplandFTE.',
      'Medewerker-dimensie met SCD2 (zie vorige template).',
      'Kalender-tabel verbonden aan beide via de peildatum-logica.',
    ],
    dax: `// Drie measures voor formatie versus realisatie
// op een gekozen peildatum.

Formatie FTE :=
VAR Peildatum = MAX ( Kalender[Datum] )
RETURN
    CALCULATE (
        SUM ( Formatie[GeplandFTE] ),
        Formatie[GeldigVan] <= Peildatum,
        Formatie[GeldigTot] >= Peildatum
    )

Bezetting FTE :=
VAR Peildatum = MAX ( Kalender[Datum] )
RETURN
    CALCULATE (
        SUM ( Medewerker[FTE] ),
        Medewerker[GeldigVan] <= Peildatum,
        Medewerker[GeldigTot] >= Peildatum
    )

Realisatie % :=
DIVIDE ( [Bezetting FTE], [Formatie FTE] )`,
    uitleg:
      'Beide measures gebruiken dezelfde peildatum-logica zodat ze altijd kloppen ten opzichte van elkaar. Realisatie boven 100% wijst op overcapaciteit (vaak inhuur), onder 100% op openstaande vacatures. Drilldown per Org_Eenheid laat zien waar het schuurt.',
  },
];

export default function DaxTemplateClient() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Stille fallback — sommige browsers blokkeren clipboard in iframes
    }
  };

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="container mx-auto max-w-4xl px-6 py-20 md:px-12 md:py-28">
          <p className="eyebrow mb-4">DAX-templates HR</p>
          <h1 className="mb-6">Drie measures die in elk HR-model thuishoren.</h1>
          <p className="lead">
            Een aanvulling op de AVG-checklist HR. Drie DAX-measures die de
            twaalf controlepunten in de praktijk brengen: hiërarchische RLS,
            verzuim met peildatum, en formatie-realisatie. Direct te kopiëren
            naar je eigen model.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[var(--color-accent-700)]" />
              Drie measures
            </span>
            <span className="hidden md:inline">·</span>
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-[var(--color-accent-700)]" />
              Exclusief voor checklist-downloaders
            </span>
          </div>
        </div>
      </section>

      {/* ═══ TEMPLATES ═══ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-6 md:px-12">
          <div className="space-y-14">
            {TEMPLATES.map((tpl, index) => (
              <article
                key={tpl.id}
                className="rounded-lg border border-[var(--border)] bg-white p-6 md:p-8"
              >
                <div className="mb-5 flex items-baseline gap-3">
                  <span className="text-sm font-semibold text-[var(--color-accent-700)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="!mt-0 !mb-0">{tpl.titel}</h2>
                </div>

                <p className="mb-4 leading-relaxed text-[var(--text-primary)]">
                  {tpl.context}
                </p>

                <h3 className="mb-2 text-base">Waar gebruik je dit voor</h3>
                <p className="mb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {tpl.toepassing}
                </p>

                <h3 className="mb-2 text-base">Voorwaarden in je model</h3>
                <ul className="mb-6 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {tpl.voorwaarden.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>

                <div className="relative mb-5">
                  <button
                    type="button"
                    onClick={() => handleCopy(tpl.id, tpl.dax)}
                    className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
                    aria-label="Kopieer DAX naar klembord"
                  >
                    {copied === tpl.id ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Gekopieerd
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Kopieer
                      </>
                    )}
                  </button>
                  <pre className="overflow-x-auto rounded-md bg-[#0F1C2E] p-5 pr-24 text-[0.8125rem] leading-relaxed text-[#E2E8F0]">
                    <code>{tpl.dax}</code>
                  </pre>
                </div>

                <h3 className="mb-2 text-base">Hoe het werkt</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {tpl.uitleg}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER-CTA ═══ */}
      <section className="border-t border-[var(--border)] bg-[var(--color-neutral-50)] py-16 md:py-20">
        <div className="container mx-auto max-w-2xl px-6 md:px-12 text-center">
          <h2 className="mb-4">Wil je dit voor je hele HR-model?</h2>
          <p className="lead mx-auto mb-8">
            Deze drie measures zijn de basis. In een HR Analytics Quick Scan
            (€1.950) audit ik je volledige model en lever ik een werkende set
            measures op maat — afgestemd op je AFAS-, Visma- of Nmbrs-data.
          </p>
          <Link
            href="/contact?type=quick-scan"
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-action-600)] px-6 py-3 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[var(--color-action-700)]"
          >
            Plan een Quick Scan – €1.950
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-8 text-xs text-[var(--text-secondary)]">
            Deze pagina is een aanvulling op de AVG-checklist HR. Niet via het
            menu vindbaar — je ziet hem omdat je de checklist hebt opgevraagd.
          </p>
        </div>
      </section>
    </>
  );
}
