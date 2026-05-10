'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';
import AgentSignature from '@/components/team/AgentSignature';

type Question = {
  id: number;
  vraag: string;
  opties: { value: number; label: string }[];
};

const VRAGEN: Question[] = [
  {
    id: 1,
    vraag: 'Hoe is row-level security in jullie HR Power BI ingericht?',
    opties: [
      { value: 1, label: 'Geen RLS — iedereen ziet alle data' },
      { value: 2, label: 'Handmatige user-mapping per dataset, maandelijks bijwerken' },
      { value: 3, label: 'RLS-rollen, maar niet automatisch gekoppeld aan organisatiehiërarchie' },
      { value: 4, label: 'Automatisch RLS op organisatiehiërarchie, met audit-trail' },
    ],
  },
  {
    id: 2,
    vraag: 'Klopt jullie verloop-cijfer over 2 jaar terug nog steeds?',
    opties: [
      { value: 1, label: 'Geen idee — niemand kijkt achteruit' },
      { value: 2, label: 'Nee, retroactieve afdelingsherindelingen veranderen historische cijfers' },
      { value: 3, label: 'Soms wel, soms niet — afhankelijk van welke dimensie' },
      { value: 4, label: 'Ja, type-2 historiek voor alle HR-dimensies' },
    ],
  },
  {
    id: 3,
    vraag: 'Weet jullie DPO welke gevoelige velden in het HR-model zitten?',
    opties: [
      { value: 1, label: 'Wij hebben geen DPO of die kijkt niet naar Power BI' },
      { value: 2, label: 'Ja, maar via een spreadsheet die niet altijd up-to-date is' },
      { value: 3, label: 'Wel weten welke velden er zijn, niet welke RLS daarop staat' },
      { value: 4, label: 'AVG-cockpit met live overzicht van velden, RLS en bewaartermijn' },
    ],
  },
  {
    id: 4,
    vraag: 'Wordt afdelingshistoriek correct meegenomen in retroactieve rapporten?',
    opties: [
      { value: 1, label: 'Wij hebben geen retroactieve rapporten' },
      { value: 2, label: 'Nee — historie wordt overschreven bij wijzigingen' },
      { value: 3, label: 'Deels — voor sommige dimensies wel, andere niet' },
      { value: 4, label: 'Ja — alle dimensies hebben geldig-van/tot dates' },
    ],
  },
  {
    id: 5,
    vraag: 'Uit welke bron komt jullie HR-data?',
    opties: [
      { value: 1, label: 'Excel-exports die handmatig worden samengevoegd' },
      { value: 2, label: 'Eén HR-systeem (AFAS/Visma/Nmbrs), maar verzuim/formatie zit elders' },
      { value: 3, label: 'Meerdere bronnen, half-geautomatiseerd verbonden' },
      { value: 4, label: 'Geconsolideerd in één bron-zilver-goud architectuur' },
    ],
  },
  {
    id: 6,
    vraag: 'Wie kan een nieuwe manager toegang geven tot zijn Power BI dashboards?',
    opties: [
      { value: 1, label: 'Niemand precies — IT, HR en BI gooien het over de schutting' },
      { value: 2, label: 'IT-afdeling, maar het duurt 1-2 weken' },
      { value: 3, label: 'HR via een ticket-systeem, binnen 1-3 dagen' },
      { value: 4, label: 'Automatisch op basis van organisatiehiërarchie in HR-systeem' },
    ],
  },
  {
    id: 7,
    vraag: 'Zijn maandelijkse HR-rapportages consistent zonder Excel-correctie?',
    opties: [
      { value: 1, label: 'Nee — er is altijd een controleurs-Excel achter de schermen' },
      { value: 2, label: 'Soms wel, soms niet — afhankelijk van welk rapport' },
      { value: 3, label: 'Meestal wel, alleen bij reorganisaties handmatig werk' },
      { value: 4, label: 'Ja, één bron van waarheid — geen Excel-correcties' },
    ],
  },
  {
    id: 8,
    vraag: 'Hoe up-to-date is jullie HR-rapportage per gisterochtend gezien?',
    opties: [
      { value: 1, label: 'Een paar weken oud, maandelijkse exports' },
      { value: 2, label: 'Wekelijks ververst' },
      { value: 3, label: 'Dagelijks ververst, maar niemand monitort' },
      { value: 4, label: 'Dagelijks of vaker, met monitoring op refresh-fouten' },
    ],
  },
  {
    id: 9,
    vraag: 'Heeft elk dashboard een gedocumenteerde eigenaar die cijfers kan uitleggen?',
    opties: [
      { value: 1, label: 'Nee — als iemand vraagt is er paniek' },
      { value: 2, label: 'Eigenaar is bekend, maar niet gedocumenteerd' },
      { value: 3, label: 'Wel gedocumenteerd, maar definities staan los van het rapport' },
      { value: 4, label: 'Eigenaar én definities zijn ingebouwd in het Power BI model' },
    ],
  },
  {
    id: 10,
    vraag: 'Wat gebeurt er als de dataset-refresh faalt op zaterdagochtend?',
    opties: [
      { value: 1, label: 'We weten dat pas maandag, als een manager een vreemd cijfer ziet' },
      { value: 2, label: 'Iemand checkt op maandag of het goed staat' },
      { value: 3, label: 'Automatische e-mail bij faalde refresh, fix gebeurt maandag' },
      { value: 4, label: 'Alerting + automatische retry, fix binnen 4 uur ook in weekend' },
    ],
  },
];

interface ScanResult {
  score: number;
  niveau: 'Risico' | 'Achterstand' | 'Onderweg' | 'Volwassen';
  kleur: string;
  samenvatting: string;
  prioriteiten: string[];
}

function bepaalResultaat(score: number): ScanResult {
  // Score range: 10-40
  if (score <= 16) {
    return {
      score,
      niveau: 'Risico',
      kleur: 'var(--color-error)',
      samenvatting:
        'Jullie HR-rapportage zit op AVG-risiconiveau. Meerdere fundamentele patterns ontbreken — RLS, historiek, datakwaliteit. Een Quick Scan levert binnen 1,5 dag een prioriteitenlijst op.',
      prioriteiten: [
        'Eerste prioriteit: row-level security op organisatiehiërarchie',
        'Tweede prioriteit: type-2 historiek voor verloop-rapportage',
        'Derde prioriteit: AVG-cockpit voor DPO-zichtbaarheid',
      ],
    };
  }
  if (score <= 25) {
    return {
      score,
      niveau: 'Achterstand',
      kleur: 'var(--color-warning)',
      samenvatting:
        'Jullie HR-rapportage werkt, maar mist structurele fundamenten. Een Quick Scan kan helpen om te bepalen of een Foundation-traject de juiste investering is, of dat losse fixes voldoende zijn.',
      prioriteiten: [
        'Audit van bestaand RLS-mechanisme',
        'Inventarisatie waar historiek correct is en waar niet',
        'Documentatie van data-eigenaarschap per dashboard',
      ],
    };
  }
  if (score <= 33) {
    return {
      score,
      niveau: 'Onderweg',
      kleur: 'var(--color-accent-700)',
      samenvatting:
        'Jullie hebben een goede basis. De architectuur klopt, maar er zijn specifieke patterns die nog beter kunnen — vaak in de monitoring- of governance-laag. Een Quick Scan kan de specifieke verbetering identificeren.',
      prioriteiten: [
        'Verfijn monitoring op refresh-fouten en schema-drift',
        'Documentatie van measure-definities in het Power BI model',
        'Periodieke AVG-controle op nieuwe gevoelige velden',
      ],
    };
  }
  return {
    score,
    niveau: 'Volwassen',
    kleur: 'var(--color-accent-700)',
    samenvatting:
      'Jullie HR-rapportage is volwassen. Quick Scan is waarschijnlijk niet nodig — maar als jullie willen schalen naar 100+ managers of multi-bron willen integreren, is een Foundation Plus-traject mogelijk relevant.',
    prioriteiten: [
      'Overweeg DashPortal HR Hosting voor schaal-ondersteuning',
      'Periodieke kwartaal-review op model-performance',
      'Documenteer governance-patterns voor toekomstige overdracht',
    ],
  };
}

export default function ReadinessScanPage() {
  const [stap, setStap] = useState(0);
  const [antwoorden, setAntwoorden] = useState<Record<number, number>>({});
  const [klaar, setKlaar] = useState(false);

  const huidigeVraag = VRAGEN[stap];
  const gegevenAntwoord = antwoorden[huidigeVraag?.id];

  const handleSelect = (value: number) => {
    setAntwoorden({ ...antwoorden, [huidigeVraag.id]: value });
  };

  const handleVolgende = () => {
    if (stap < VRAGEN.length - 1) {
      setStap(stap + 1);
    } else {
      setKlaar(true);
    }
  };

  const handleVorige = () => {
    if (stap > 0) setStap(stap - 1);
  };

  const handleReset = () => {
    setStap(0);
    setAntwoorden({});
    setKlaar(false);
  };

  const score = Object.values(antwoorden).reduce((sum, v) => sum + v, 0);
  const totaalScore = Math.max(score, 10);
  const resultaat = klaar ? bepaalResultaat(totaalScore) : null;

  return (
    <>
      <section className="border-b border-[var(--border)] bg-white">
        <div className="container mx-auto max-w-3xl px-6 py-16 md:px-12 md:py-20">
          <p className="eyebrow mb-4">HR Analytics Readiness Scan</p>
          <h1 className="mb-4">Hoe volwassen is jullie HR-rapportage in Power BI?</h1>
          <p className="lead">
            Tien vragen over RLS, historiek, AVG, datakwaliteit en monitoring.
            Resultaat: persoonlijke beoordeling van jullie HR-rapportage in
            Power BI, plus drie concrete prioriteiten.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-2xl px-6 md:px-12">
          {!klaar && huidigeVraag && (
            <div className="rounded-lg border border-[var(--border)] bg-white p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--text-secondary)]">
                  Vraag {stap + 1} van {VRAGEN.length}
                </p>
                <div className="h-1 w-32 overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
                  <div
                    className="h-full bg-[var(--color-accent-700)] transition-all"
                    style={{ width: `${((stap + 1) / VRAGEN.length) * 100}%` }}
                  />
                </div>
              </div>

              <h2 className="mb-6 text-xl">{huidigeVraag.vraag}</h2>

              <div className="space-y-3">
                {huidigeVraag.opties.map((optie) => {
                  const geselecteerd = gegevenAntwoord === optie.value;
                  return (
                    <button
                      key={optie.value}
                      onClick={() => handleSelect(optie.value)}
                      className={`flex w-full items-start gap-3 rounded-md border p-3 text-left text-sm transition-colors ${
                        geselecteerd
                          ? 'border-[var(--color-accent-700)] bg-[var(--color-accent-100)]/50'
                          : 'border-[var(--border)] hover:border-[var(--color-accent-700)]/40 hover:bg-[var(--color-neutral-50)]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          geselecteerd
                            ? 'border-[var(--color-accent-700)] bg-[var(--color-accent-700)]'
                            : 'border-[var(--color-neutral-200)]'
                        }`}
                      >
                        {geselecteerd && (
                          <CheckCircle2 className="h-3 w-3 text-white" aria-hidden="true" />
                        )}
                      </span>
                      <span>{optie.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={handleVorige}
                  disabled={stap === 0}
                  className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" /> Vorige
                </button>
                <button
                  onClick={handleVolgende}
                  disabled={!gegevenAntwoord}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-action-600)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-action-700)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {stap === VRAGEN.length - 1 ? 'Toon resultaat' : 'Volgende'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {klaar && resultaat && (
            <div className="rounded-lg border border-[var(--border)] bg-white p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <ShieldCheck
                  className="h-8 w-8"
                  style={{ color: resultaat.kleur }}
                  aria-hidden="true"
                />
                <div>
                  <p className="eyebrow" style={{ color: resultaat.kleur }}>
                    Niveau: {resultaat.niveau}
                  </p>
                  <p className="text-2xl font-display font-semibold">
                    Score {totaalScore} van 40
                  </p>
                </div>
              </div>

              <p className="mb-6 leading-relaxed">{resultaat.samenvatting}</p>

              <h3 className="mb-3 text-base">Drie prioriteiten</h3>
              <ul className="mb-8 space-y-2">
                {resultaat.prioriteiten.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent-700)]"
                      aria-hidden="true"
                    />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact?type=quick-scan"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-action-600)] px-6 py-3 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[var(--color-action-700)]"
                >
                  Plan een Quick Scan – €1.950
                </Link>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-5 py-2.5 text-[0.9375rem] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--color-primary-700)] hover:text-[var(--color-primary-900)]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Opnieuw scannen
                </button>
              </div>

              <div className="mt-8 border-t border-[var(--border)] pt-6">
                <AgentSignature agentId="nova" />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
