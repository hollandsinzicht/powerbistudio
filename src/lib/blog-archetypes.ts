import { cases } from './cases-data'
import type { CaseStudy } from './types/sectors'

// ===== ARTICLE TYPES =====

/**
 * Het inhoudelijke content-type van een blog_post:
 * - 'blog': een regulier artikel dat een archetype volgt.
 * - 'pillar': een hub-and-spoke gids die naar 3-10 spoke-artikelen linkt.
 * Stored as TEXT zonder CHECK in de DB, gevalideerd in TS.
 */
export type ArticleType = 'blog' | 'pillar'

export const ALL_ARTICLE_TYPES: ArticleType[] = ['blog', 'pillar']

export function isValidArticleType(value: unknown): value is ArticleType {
  return value === 'blog' || value === 'pillar'
}

// ===== ARCHETYPES =====

export type BlogArchetype =
  | 'technical-deep-dive'
  | 'decision-framework'
  | 'anti-pattern-essay'
  | 'comparison'
  | 'case-driven'
  | 'tutorial'
  | 'faq'

export const ALL_ARCHETYPES: BlogArchetype[] = [
  'technical-deep-dive',
  'decision-framework',
  'anti-pattern-essay',
  'comparison',
  'case-driven',
  'tutorial',
  'faq',
]

export const ARCHETYPE_LABELS: Record<BlogArchetype, string> = {
  'technical-deep-dive': 'Technische deep-dive',
  'decision-framework': 'Beslisraamwerk',
  'anti-pattern-essay': 'Anti-pattern essay',
  comparison: 'Vergelijking',
  'case-driven': 'Case-driven verhaal',
  tutorial: 'Tutorial / how-to',
  faq: 'FAQ / definitive guide',
}

export const ARCHETYPE_DESCRIPTIONS: Record<BlogArchetype, string> = {
  'technical-deep-dive': 'DAX, datamodellering, performance, M-language. Code-zwaar, geen klantnamen.',
  'decision-framework': '"Wanneer X vs Y", capacity-keuzes. Criteria-tabel, beslisregels.',
  'anti-pattern-essay': '"Stop met X", "5 fouten in Y". Stelling-gedreven, root-cause.',
  comparison: '"X vs Y" feature-vergelijking. Side-by-side, prijs/performance-deltas.',
  'case-driven': 'Project-narratief met één rijk uitgewerkte case. Cijfers en lessen.',
  tutorial: '"Hoe doe je X". Genummerde stappen, code-blokken, voorwaarden.',
  faq: '"Alles over X". H2 = vraag, paragraaf = antwoord.',
}

export function isValidArchetype(value: unknown): value is BlogArchetype {
  return typeof value === 'string' && (ALL_ARCHETYPES as string[]).includes(value)
}

// ===== ARCHETYPE-SPECIFIEKE PROMPT-REGELS =====

interface ArchetypeRule {
  introStyle: string
  sectionPattern: string
  depthSignals: string
  avoid: string
  closingStyle: string
}

export const ARCHETYPE_RULES: Record<BlogArchetype, ArchetypeRule> = {
  'technical-deep-dive': {
    introStyle:
      'Open met een korte definitie of een precieze afbakening van het concept, direct gekoppeld aan een HR-context (verzuim, formatie, instroom/uitstroom, organisatie-hiërarchie, of AFAS/Visma/Nmbrs-data). Geen anekdote, geen "in dit artikel". Direct de techniek in.',
    sectionPattern:
      'H2-structuur: 1) Wat is het concept en waar valt het stuk te gaan, 2) Hoe werkt het onder de motorkap, 3) Een werkend voorbeeld met code op een HR-dataset, 4) Edge cases en valkuilen, 5) Performance- of governance-implicaties (inclusief AVG waar relevant).',
    depthSignals:
      'Diepte komt uit echte DAX-, M- of SQL-snippets in <pre><code>...</code></pre> blokken die een HR-dataset bewerken (medewerker-, verzuim-, formatie- of organisatietabel; kolomnamen als Medewerker_ID, FTE, Verzuim_uren, Manager_ID). Version-specifiek gedrag (Power BI Desktop versies, Fabric F-skus, Tabular Editor 2 vs 3), concrete performance-cijfers (rijen/seconde, MB-deltas, scan-percentages), en de fouten die een junior maakt versus wat een senior doet.',
    avoid:
      'Geen klantnamen of cases. Geen marketinglaag. Geen voorbeeld-datasets uit andere domeinen (verkoop, voorraad, finance-zonder-HR). Geen "het hangt ervan af" zonder daarna de regel te geven. Geen vage zinnen als "performance kan een uitdaging zijn".',
    closingStyle:
      'Sluit af met een H2 "Wanneer dit fout gaat" of "Vuistregels" — concrete heuristieken die de lezer morgen op zijn HR-model kan toepassen. Geen "samenvatting".',
  },
  'decision-framework': {
    introStyle:
      'Open met de keuze zelf en waarom hij lastig is voor een HR-organisatie in het mid-market segment (250-2.000 FTE met AFAS, Visma of Nmbrs). Eén of twee zinnen die de echte trade-off benoemen.',
    sectionPattern:
      'H2-structuur: 1) De vraag achter de vraag (wat probeer je echt op te lossen in HR-rapportage), 2) De criteria die er toe doen (3-5 stuks, ieder een H3), 3) Optie A: hoe scoort deze op elk criterium, 4) Optie B: idem, 5) Beslistabel of beslisregels in een lijst, 6) Edge cases waarin geen van beide werkt.',
    depthSignals:
      'Diepte komt uit een expliciete criteria-lijst, een vergelijkingstabel met <table>, prijs- en licensing-feiten, en concrete drempelwaarden in HR-grootheden ("kies A als je meer dan 500 medewerkers in AFAS hebt", "kies B als je meer dan 50 managers met RLS bedient", "minder dan 10 FTE in HR-team = scenario X").',
    avoid:
      'Geen klantnamen of cases. Geen "beide hebben hun voordelen". Geen criteria die niemand in een HR-team gaat meten. Geen voorbeelden uit niet-HR-domeinen (verkoop, voorraad).',
    closingStyle:
      'Sluit af met een H2 "Beslisregels in 3 zinnen" — drie korte regels van het type "Als X, dan A. Als Y, dan B. Anders, herzie je vraag." Geen samenvatting.',
  },
  'anti-pattern-essay': {
    introStyle:
      'Open met een stelling of contrarian observatie over HR-rapportage. Eén directe zin, geen voorwoord. Voorbeeld-toon: "De meeste verzuimdashboards laten zien wat al gebeurd is, en daarom verandert er nooit iets."',
    sectionPattern:
      'H2-structuur: 1) Het patroon (concreet beschreven, met een HR-rapportage-voorbeeld), 2) Waarom mensen dit doen (de reden klopt vaak gedeeltelijk), 3) Wat er mis gaat (concrete impact op verzuim-, instroom- of formatiecijfers), 4) De grondoorzaak (DMAIC: probleem → meting → analyse → verbeteren), 5) Wat dan wel werkt.',
    depthSignals:
      'Diepte komt uit concrete HR-rapportage-anti-patterns (in code, pseudocode of beschreven dashboards): "verzuim per maand zonder peildatum", "RLS op e-mailadres in plaats van hiërarchie", "FTE samengevat zonder type-2 historiek". Root-cause-analyse vanuit Lean Six Sigma denken, en meetbare impact (factor 5 trager, 3x zoveel onderhoud, 30% verschil in verzuimcijfer tussen rapportages).',
    avoid:
      'Geen klantnamen of cases. Geen anti-patterns uit niet-HR-domeinen. Geen genuanceerd "soms is het toch handig". Geen "best practices" als woord — vervang door "wat wel werkt".',
    closingStyle:
      'Sluit af met een H2 "De korte versie" — drie tot vijf bullets, scherp geformuleerd. Geen "conclusie".',
  },
  comparison: {
    introStyle:
      'Open met de context waarin deze vergelijking ertoe doet voor een HR-organisatie. Wie kiest hier eigenlijk tussen, en wanneer? Eén alinea waarin de mid-market HR-context (250-2.000 FTE, AFAS/Visma/Nmbrs) expliciet wordt genoemd.',
    sectionPattern:
      'H2-structuur: 1) Optie A: wat is het, voor welke HR-organisatie, kernfeiten, 2) Optie B: idem, 3) Side-by-side vergelijking (gebruik een <table> met kolommen voor A en B en rijen voor: doelgroep, prijs, schaalbaarheid, governance, AVG-conformiteit, leercurve, ecosysteem of vergelijkbare assen), 4) Wanneer A wint (HR-scenario), 5) Wanneer B wint (HR-scenario), 6) Wanneer geen van beide past.',
    depthSignals:
      'Diepte komt uit harde feiten in de tabel (prijs per maand, max dataset-grootte, ondersteunde refresh-frequenties), een eerlijk oordeel over waar elk product struikelt, en een HR-scenario per kant ("Wanneer A wint = HR-team van 50-100 in AFAS met één locatie", "Wanneer B wint = HR-team met 5 bronnen, eigen DPO en matrix-organisatie").',
    avoid:
      'Geen klantnamen of cases. Geen "het hangt af van je situatie" zonder de HR-criteria te benoemen. Geen vergelijking waarin één partij zonder reden wint op alles. Geen scenario\'s uit niet-HR-domeinen.',
    closingStyle:
      'Sluit af met een H2 "Welke past bij jou" — drie HR-lezerprofielen met de aanbevolen keuze. Geen samenvatting.',
  },
  'case-driven': {
    introStyle:
      'Open met de situatie en de constraint. Plaats de lezer middenin het probleem voor de oplossing in beeld komt. Twee tot drie zinnen. Maak waar mogelijk de HR-relevantie expliciet, ook als de case zelf niet 100% HR is — bijvoorbeeld via de transferbare les (multi-tenant RLS, type-2 historiek, DMAIC op rapportagecyclus).',
    sectionPattern:
      'H2-structuur: 1) Het startpunt (wat was er, wat werkte niet), 2) De kernuitdaging (waarom was dit moeilijk), 3) De beslissing en het waarom, 4) Wat we expliciet niet deden en waarom (anti-keuze), 5) Het resultaat met concrete cijfers, 6) Lessen voor HR-organisaties met vergelijkbare situaties.',
    depthSignals:
      'Diepte komt uit de echte case-context: concrete cijfers, technische beslissingen, de anti-keuze (whatWeDidNot), en de lessen. Gebruik de naam van de organisatie alleen waar het iets toevoegt; verzin geen citaten of details die niet in de context staan. Vertaal lessen actief naar HR-context in de afsluiting.',
    avoid:
      'Geen abstracte principes zonder de case ze te laten dragen. Geen verzonnen quotes. Geen losse name-drops zonder concreet feit erbij.',
    closingStyle:
      'Sluit af met een H2 "Lessen die buiten deze case gelden" — drie tot vijf lessen die generaliseerbaar zijn, expliciet vertaald naar HR-organisaties (250-2.000 FTE, AFAS/Visma/Nmbrs). Geen samenvatting.',
  },
  tutorial: {
    introStyle:
      'Open met het einddoel en de voorwaarden. "Aan het einde van dit artikel heb je X." Einddoel MOET een werkend HR-dashboardelement zijn (een verzuim-measure, een hiërarchische RLS-rol, een formatie-versus-realisatie tabel, een AVG-conforme medewerker-dimensie met SCD2). Geen filosofie, direct ter zake.',
    sectionPattern:
      'H2-structuur: voorwaarden (inclusief een voorbeeld-HR-dataset of kolomnamen), dan stap 1, stap 2, stap 3, ... in genummerde of expliciet "Stap N: ..." H2-koppen. Sluit af met een sectie "Veelgemaakte fouten" voor de afronding.',
    depthSignals:
      'Diepte komt uit concrete stappen die iemand letterlijk kan volgen op een HR-model: kliklocaties ("klik op Modeling > New measure"), DAX of M code in <pre><code>...</code></pre> die HR-kolommen gebruikt (Medewerker_ID, Manager_ID, FTE, Verzuim_uren, Org_Eenheid), screenshot-placeholders (<em>Screenshot: ...</em>), en wat je zou moeten zien als de stap geslaagd is.',
    avoid:
      'Geen klantnamen of cases. Geen theoretische uitweidingen tijdens een stap — verplaats die naar een aparte H3 of laat ze weg. Geen "we" of "wij". Geen tutorials op niet-HR-datasets (geen verkoop, geen voorraad).',
    closingStyle:
      'Sluit af met een H2 "Veelgemaakte fouten" en daarna een korte H2 "Volgende stap" met één concrete vervolgactie voor het HR-model. Geen samenvatting.',
  },
  faq: {
    introStyle:
      'Open met één alinea: voor welke HR-rol dit artikel is (HR-directeur, HR-controller, DPO of BI-lead bij HR-team) en welke vragen erin beantwoord worden. Geen narratieve aanloop.',
    sectionPattern:
      'Elke H2 is een concrete vraag, geformuleerd zoals een HR-directeur of HR-controller hem in Google zou typen ("Kan AFAS-data realtime in Power BI?", "Hoe regel ik RLS voor managers in een matrix-organisatie?"). De alinea eronder is het directe antwoord (3-6 zinnen). Geen tussenkopjes nodig binnen het antwoord, tenzij het antwoord echt deelvragen heeft (dan H3 per deel).',
    depthSignals:
      'Diepte komt uit de selectie van de juiste vragen (vragen die HR-directeuren en HR-controllers écht stellen, niet wat een Power BI-developer zoekt) en uit antwoorden die direct beginnen met de kern, niet met "Goede vraag, ...". Verwijs waar relevant naar AFAS, Visma, Nmbrs, AVG of mid-market context (250-2.000 FTE).',
    avoid:
      'Geen klantnamen of cases. Geen narratieve overgangen tussen vragen. Geen vraag die alleen bestaat om een antwoord te kunnen geven dat je toch al wilde geven. Geen developer-vragen of generieke Power BI-vragen zonder HR-relevantie.',
    closingStyle:
      'Sluit af met een H2 "Vraag niet beantwoord?" met één korte alinea over waar de lezer dieper kan duiken (linken naar relevante andere blogartikelen of tools). Geen samenvatting.',
  },
}

/**
 * Bouw het archetype-specifieke promptblok dat in het systeemprompt geïnjecteerd wordt.
 */
export function buildArchetypePrompt(archetype: BlogArchetype): string {
  const rule = ARCHETYPE_RULES[archetype]
  return `ARCHETYPE: ${ARCHETYPE_LABELS[archetype]}
Dit artikel volgt expliciet dit archetype. Wijk niet af van de structuur hieronder.

INLEIDING-STIJL:
${rule.introStyle}

SECTIE-PATROON:
${rule.sectionPattern}

DIEPTE-SIGNALEN (waar dit artikel zijn gewicht uit haalt):
${rule.depthSignals}

VERMIJDEN:
${rule.avoid}

AFSLUITING-STIJL (vervangt de generieke "Samenvatting"):
${rule.closingStyle}`
}

// ===== CASE-MATCHING (alleen voor archetype 'case-driven') =====

/**
 * Match een blog-onderwerp aan de meest relevante case.
 * Geeft null terug als er geen sterke match is.
 */
export function pickRelevantCase(title: string, keywords: string[]): CaseStudy | null {
  const haystack = `${title} ${keywords.join(' ')}`.toLowerCase()

  // Score elke case op keyword-overlap
  const scores: { caseStudy: CaseStudy; score: number }[] = cases.map((c) => {
    let score = 0
    const matchers = getCaseMatchers(c.slug)
    for (const m of matchers) {
      if (haystack.includes(m.term)) score += m.weight
    }
    return { caseStudy: c, score }
  })

  scores.sort((a, b) => b.score - a.score)
  const winner = scores[0]

  // Drempel: als de hoogste score < 2, is er geen duidelijke match
  if (!winner || winner.score < 2) return null
  return winner.caseStudy
}

interface Matcher {
  term: string
  weight: number
}

function getCaseMatchers(slug: string): Matcher[] {
  switch (slug) {
    case 'ggdghor':
      return [
        { term: 'ggd', weight: 5 },
        { term: 'rivm', weight: 5 },
        { term: 'publieke sector', weight: 4 },
        { term: 'gemeente', weight: 3 },
        { term: 'overheid', weight: 3 },
        { term: 'zorg', weight: 3 },
        { term: 'multi-regio', weight: 3 },
        { term: 'rls', weight: 2 },
        { term: 'row-level security', weight: 3 },
        { term: 'governance', weight: 2 },
        { term: 'deployment pipeline', weight: 2 },
        // HR-relevantie: multi-tenant RLS is structureel dezelfde
        // oplossing als hiërarchische HR-RLS (manager-rollen,
        // organisatie-eenheden, locatie-scheiding).
        { term: 'organisatie-hiërarchie', weight: 3 },
        { term: 'organisatiehi\u00ebrarchie', weight: 3 },
        { term: 'hi\u00ebrarchische rls', weight: 4 },
        { term: 'manager-rol', weight: 3 },
        { term: 'manager rollen', weight: 3 },
        { term: 'avg', weight: 3 },
        { term: 'dpo', weight: 3 },
        { term: 'gevoelige data', weight: 3 },
        { term: 'multi-tenant', weight: 3 },
      ]
    case 'lyreco':
      return [
        { term: 'lyreco', weight: 5 },
        { term: 'finance', weight: 4 },
        { term: 'cfo', weight: 3 },
        { term: 'rapportagecyclus', weight: 3 },
        { term: 'smt', weight: 2 },
        { term: 'management team', weight: 2 },
        { term: 'interim', weight: 3 },
        { term: 'data team', weight: 3 },
        { term: 'dmaic', weight: 3 },
        { term: 'lean six sigma', weight: 3 },
        { term: 'procesverbetering', weight: 3 },
        // HR-relevantie: DMAIC op rapportagecyclus is direct
        // transfereerbaar naar HR-processen (time-to-hire,
        // verzuim-meldcyclus, formatie-realisatie).
        { term: 'time-to-hire', weight: 4 },
        { term: 'instroomproces', weight: 4 },
        { term: 'verzuim-meldcyclus', weight: 4 },
        { term: 'doorlooptijd', weight: 3 },
        { term: 'cyclus', weight: 2 },
        { term: 'hr-team', weight: 3 },
      ]
    case 'technische-unie':
      return [
        { term: 'technische unie', weight: 5 },
        { term: 'groothandel', weight: 4 },
        { term: 'voorraad', weight: 3 },
        { term: 'sales', weight: 2 },
        { term: 'silo', weight: 3 },
        { term: 'afdeling', weight: 2 },
        { term: 'integratie', weight: 2 },
        { term: 'multi-app', weight: 3 },
        { term: 'gedeelde dataset', weight: 3 },
        { term: 'semantisch model', weight: 2 },
        // HR-relevantie: silo-doorbreking en multi-bron-integratie
        // is dezelfde architectuur als HR + verzuim + recruitment +
        // formatie samenvoegen in één semantisch model.
        { term: 'multi-bron', weight: 4 },
        { term: 'meerdere bronnen', weight: 3 },
        { term: 'afas', weight: 3 },
        { term: 'visma', weight: 3 },
        { term: 'nmbrs', weight: 3 },
        { term: 'recruitment', weight: 3 },
        { term: 'verzuimsysteem', weight: 3 },
      ]
    case 'vattenfall':
      return [
        { term: 'vattenfall', weight: 5 },
        { term: 'energie', weight: 3 },
        { term: 'azure', weight: 3 },
        { term: 'internationaal', weight: 3 },
        { term: 'enterprise', weight: 2 },
        { term: 'cloud-integratie', weight: 2 },
        { term: 'standaardisatie', weight: 2 },
        // HR-relevantie: standaardisatie en cloud-integratie
        // zijn dezelfde patronen voor multinationale HR-organisaties
        // met meerdere landen-payroll en gedeelde governance.
        { term: 'multinational', weight: 3 },
        { term: 'meerdere landen', weight: 3 },
        { term: 'globale hr', weight: 4 },
        { term: 'concern', weight: 2 },
      ]
    default:
      return []
  }
}

/**
 * Bouw een rijk context-blok van een case voor in het user-message van het systeemprompt.
 */
export function formatCaseContext(c: CaseStudy): string {
  return `RELEVANTE CASE OM IN HET ARTIKEL TE VERWERKEN:

Klant: ${c.client}
Sector: ${c.sectorLabel || c.sector}

Uitgangssituatie / kernuitdaging:
${c.challenge}

Aanpak (concrete stappen):
${c.approach.map((a) => `- ${a}`).join('\n')}

${c.whatWeDidNot ? `Wat we expliciet NIET deden (en waarom dat belangrijk is):\n${c.whatWeDidNot}\n\n` : ''}Resultaat:
${c.result}

Kerncijfers / bewijs:
${c.stats.map((s) => `- ${s.value}: ${s.label}`).join('\n')}

Lessen die generaliseerbaar zijn:
${c.lessons.map((l) => `- ${l}`).join('\n')}

INSTRUCTIES VOOR HET GEBRUIK VAN DEZE CASE:
- Gebruik de naam ${c.client} alleen waar het iets toevoegt (1-3 keer in het artikel is ruim voldoende).
- Gebruik concrete cijfers, beslissingen en de anti-keuze (wat we niet deden) — niet alleen de naam.
- Verzin geen quotes, geen extra teamleden, geen niet-genoemde details. Blijf bij wat hierboven staat.
- De "Lessen" sectie van het artikel moet deze lessen generaliseren naar lezers die niet in deze sector werken.`
}
