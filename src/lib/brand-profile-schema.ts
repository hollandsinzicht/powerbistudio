// Statische definitie van het merkprofiel: categorieën, subcategorieën en kennispunten.
// Dit zijn de "vragen" die JW invult in de admin. Puur statisch — de antwoorden
// worden los opgeslagen (brand-profile-store.ts) en geassembleerd (brand-context.ts).

// Bepaalt waar het antwoord van een kennispunt in de LinkedIn-prompt belandt.
export type BrandPromptRole =
  | 'persona'
  | 'boodschap'
  | 'doelgroep'
  | 'schrijfstijl'
  | 'kaders'
  | 'assets'

export type BrandCategoryId =
  | 'context'
  | 'boodschap'
  | 'schrijfstijl'
  | 'assets'
  | 'kaders'

export interface BrandKennispunt {
  id: string
  title: string
  // De leidende vraag die JW in de UI ziet boven de textarea.
  question: string
  // Korte instructie voor de AI-interviewer om een conceptantwoord op te stellen.
  interviewPrompt: string
  // Bepaalt in welk promptblok het antwoord wordt gevoegd.
  role: BrandPromptRole
  placeholder?: string
}

export interface BrandSubcategory {
  id: string
  title: string
  kennispunten: BrandKennispunt[]
}

export interface BrandCategory {
  id: BrandCategoryId
  title: string
  subcategories: BrandSubcategory[]
}

export const BRAND_SCHEMA: BrandCategory[] = [
  {
    id: 'context',
    title: 'Context',
    subcategories: [
      {
        id: 'persoonlijk',
        title: 'Persoonlijk',
        kennispunten: [
          {
            id: 'kern-identiteit',
            title: 'Kernidentiteit',
            question: 'Wie ben je en hoe wil je overkomen op LinkedIn?',
            interviewPrompt:
              'Schrijf een kort, eerlijk profiel van Jan Willem den Hollander: wie hij is als professional en hoe hij wil overkomen op LinkedIn (toon, houding). Geen verzonnen feiten — alleen wat uit de bekende context blijkt.',
            role: 'persona',
            placeholder: 'Bijv. nuchter, technisch sterk, recht door zee...',
          },
          {
            id: 'oorsprong-drijfveer',
            title: 'Oorsprong & drijfveer',
            question: 'Waarom doe je dit werk? Wat dreef je hiernaartoe?',
            interviewPrompt:
              'Stel een conceptantwoord op over de drijfveer van JW: waarom hij met HR-analytics bezig is en wat hem motiveert. Houd het persoonlijk en concreet, geen marketingtaal.',
            role: 'persona',
            placeholder: 'Bijv. frustratie over HR-beslissingen op onderbuik...',
          },
          {
            id: 'kernwaarden',
            title: 'Kernwaarden',
            question: 'Welke waarden staan centraal in je werk?',
            interviewPrompt:
              'Formuleer 3-5 kernwaarden die JW in zijn werk hanteert (bijv. integriteit met data, geen onderbuik, transparantie). Kort en concreet.',
            role: 'persona',
            placeholder: 'Bijv. integriteit, eenvoud, eerlijke cijfers...',
          },
          {
            id: 'karaktereigenschappen',
            title: 'Karaktereigenschappen',
            question: 'Welke eigenschappen typeren jou en je stijl?',
            interviewPrompt:
              'Beschrijf de karaktereigenschappen die JW typeren en die doorklinken in zijn posts (bijv. droog, direct, geduldig uitleggend). Geen clichés.',
            role: 'persona',
            placeholder: 'Bijv. droog, direct, analytisch...',
          },
        ],
      },
      {
        id: 'zakelijk',
        title: 'Zakelijk',
        kennispunten: [
          {
            id: 'huidige-rol',
            title: 'Huidige rol',
            question: 'Wat is je rol en wat doe je concreet voor klanten?',
            interviewPrompt:
              'Beschrijf de huidige rol van JW en wat hij concreet voor klanten doet binnen HR-analytics. Feitelijk, geen opgeblazen claims.',
            role: 'persona',
            placeholder: 'Bijv. HR-analytics specialist, bouwt dashboards op AFAS...',
          },
          {
            id: 'bedrijf',
            title: 'Bedrijf',
            question: 'Wat is Power BI Studio en wat biedt het aan?',
            interviewPrompt:
              'Vat samen wat Power BI Studio is en wat het aanbiedt (incl. Quick Scan als instap). Gebruik alleen feitelijke, bekende informatie.',
            role: 'persona',
            placeholder: 'Bijv. Power BI Studio, HR-analytics voor mid-market...',
          },
          {
            id: 'branche',
            title: 'Branche & specialisme',
            question: 'In welke niche zit je en waarom die keuze?',
            interviewPrompt:
              'Beschrijf de niche (HR-analytics voor NL mid-market, 250-2.000 FTE op AFAS/Visma/Nmbrs) en waarom JW deze focus koos.',
            role: 'persona',
            placeholder: 'Bijv. exclusief HR-analytics, NL mid-market...',
          },
          {
            id: 'businessmodel',
            title: 'Businessmodel',
            question: 'Hoe verdien je geld? Wat is het aanbod en de prijsstructuur?',
            interviewPrompt:
              'Beschrijf het businessmodel: Quick Scan (vaste prijs), vervolgtrajecten. Alleen feitelijke prijzen/structuur die bekend zijn.',
            role: 'persona',
            placeholder: 'Bijv. Quick Scan €1.950 als wedge, daarna projecten...',
          },
          {
            id: 'ervaring',
            title: 'Ervaring & bewijs',
            question: 'Welke ervaring en achtergrond geven je geloofwaardigheid?',
            interviewPrompt:
              'Vat de relevante ervaring en achtergrond van JW samen die geloofwaardigheid geven. GEEN verzonnen klantnamen of cijfers — alleen wat publiek/feitelijk vaststaat.',
            role: 'persona',
            placeholder: 'Bijv. jaren Power BI, Lean Six Sigma...',
          },
          {
            id: 'marktfocus',
            title: 'Marktfocus',
            question: 'Op welke markt/regio en bedrijfsgrootte richt je je?',
            interviewPrompt:
              'Beschrijf de marktfocus (regio, bedrijfsgrootte, type organisatie) van JW. Feitelijk.',
            role: 'persona',
            placeholder: 'Bijv. Nederland, 250-2.000 FTE, HR-afdelingen...',
          },
        ],
      },
      {
        id: 'doelgroep',
        title: 'Doelgroep',
        kennispunten: [
          {
            id: 'ideale-lezer',
            title: 'Ideale lezer',
            question: 'Voor wie schrijf je? Wie moet zich aangesproken voelen?',
            interviewPrompt:
              'Beschrijf de ideale lezer van JW zijn posts (rol, type organisatie). Concreet, één duidelijk persoon voor ogen.',
            role: 'doelgroep',
            placeholder: 'Bijv. HR-directeur of HR-manager in mid-market...',
          },
          {
            id: 'functie-senioriteit',
            title: 'Functie & senioriteit',
            question: 'Welke functies en niveaus wil je bereiken?',
            interviewPrompt:
              'Benoem de functies en senioriteitsniveaus die JW wil bereiken (bijv. HR-directeur, manager HR-operations, CHRO).',
            role: 'doelgroep',
            placeholder: 'Bijv. HR-directeur, HRBP, manager P&O...',
          },
          {
            id: 'dagelijkse-frustratie',
            title: 'Dagelijkse frustratie',
            question: 'Waar lopen ze dagelijks tegenaan?',
            interviewPrompt:
              'Beschrijf de dagelijkse frustraties van de doelgroep rond HR-data (Excel-gepriegel, geen historie, losse bronnen). Herkenbaar en concreet.',
            role: 'doelgroep',
            placeholder: 'Bijv. uren Excel-werk, cijfers die niet kloppen...',
          },
          {
            id: 'diepste-angst',
            title: 'Diepste angst',
            question: 'Wat is hun grootste zorg of angst (zakelijk)?',
            interviewPrompt:
              'Benoem de diepere zakelijke angst van de doelgroep (bijv. verkeerde beslissing op slechte data, niet in control zijn, AVG-risico).',
            role: 'doelgroep',
            placeholder: 'Bijv. beslissen op onderbuik, AVG-boete...',
          },
          {
            id: 'gewenste-uitkomst',
            title: 'Gewenste uitkomst',
            question: 'Wat willen ze het liefst bereiken?',
            interviewPrompt:
              'Beschrijf de gewenste uitkomst van de doelgroep (bijv. in control, beslissingen onderbouwen, tijd besparen). Concreet.',
            role: 'doelgroep',
            placeholder: 'Bijv. één bron van waarheid, grip op verzuim...',
          },
        ],
      },
    ],
  },
  {
    id: 'boodschap',
    title: 'Boodschap',
    subcategories: [
      {
        id: 'kern',
        title: 'Kern',
        kennispunten: [
          {
            id: 'kernboodschap',
            title: 'Kernboodschap',
            question: 'Wat is de ene boodschap die je steeds wilt overbrengen?',
            interviewPrompt:
              'Formuleer de kernboodschap die in elke post moet doorklinken (bijv. "HR-beslissingen horen op betrouwbare data te rusten, niet op onderbuik"). Eén kernzin + korte toelichting.',
            role: 'boodschap',
            placeholder: 'Bijv. HR verdient dezelfde datakwaliteit als Finance...',
          },
          {
            id: 'unieke-invalshoek',
            title: 'Unieke invalshoek',
            question: 'Wat is jouw eigen, afwijkende kijk op het vak?',
            interviewPrompt:
              'Beschrijf de unieke invalshoek van JW die hem onderscheidt van andere BI/HR-consultants. Wat ziet hij dat anderen missen?',
            role: 'boodschap',
            placeholder: 'Bijv. focus op datamodel i.p.v. mooie dashboards...',
          },
          {
            id: 'terugkerende-themas',
            title: 'Terugkerende thema\u2019s',
            question: 'Welke onderwerpen komen steeds terug in je posts?',
            interviewPrompt:
              'Benoem 4-6 terugkerende thema\u2019s waar JW over schrijft (bijv. datamodellering, verzuimanalyse, AVG/RLS, AFAS-koppelingen).',
            role: 'boodschap',
            placeholder: 'Bijv. verzuim, verloop, datakwaliteit, governance...',
          },
          {
            id: 'vijandbeeld',
            title: 'Vijandbeeld',
            question: 'Wat wijs je af in de markt? Waar erger je je aan?',
            interviewPrompt:
              'Beschrijf wat JW afwijst in de markt (het "vijandbeeld"): aanpakken, aannames of clichés waar hij zich tegen afzet. Scherp maar niet persoonlijk.',
            role: 'boodschap',
            placeholder: 'Bijv. dashboards zonder fundament, dure tooling-hype...',
          },
        ],
      },
    ],
  },
  {
    id: 'schrijfstijl',
    title: 'Schrijfstijl',
    subcategories: [
      {
        id: 'stijl',
        title: 'Stijl',
        kennispunten: [
          {
            id: 'toon',
            title: 'Toon',
            question: 'Welke toon hanteer je? Formeel, droog, scherp?',
            interviewPrompt:
              'Beschrijf de gewenste toon van JW zijn posts (bijv. nuchter, droog, direct, met af en toe humor). Concreet, geen vage bijvoeglijke naamwoorden.',
            role: 'schrijfstijl',
            placeholder: 'Bijv. nuchter en direct, droge humor...',
          },
          {
            id: 'zinsbouw-ritme',
            title: 'Zinsbouw & ritme',
            question: 'Hoe bouw je zinnen op? Kort, lang, afgewisseld?',
            interviewPrompt:
              'Beschrijf de gewenste zinsbouw en het ritme (bijv. korte zinnen afgewisseld met langere, soms één woord voor nadruk).',
            role: 'schrijfstijl',
            placeholder: 'Bijv. korte zinnen, soms één woord, geen jargon...',
          },
          {
            id: 'voorbeeldzinnen',
            title: 'Voorbeeldzinnen',
            question: 'Plak hier zinnen of stukjes die precies jouw stem zijn.',
            interviewPrompt:
              'Geef 3-5 voorbeeldzinnen in JW zijn authentieke stem die als stijlreferentie dienen. Als er nog geen zijn, stel concepten voor op basis van de bekende toon.',
            role: 'schrijfstijl',
            placeholder: 'Plak echte zinnen die klinken als jij...',
          },
          {
            id: 'vermijden',
            title: 'Vermijden',
            question: 'Welke woorden, clichés of AI-taal wil je nooit zien?',
            interviewPrompt:
              'Maak een lijst van woorden, clichés en AI-taal die JW absoluut wil vermijden (bijv. "duik in", "ontdek hoe", overdreven enthousiasme).',
            role: 'schrijfstijl',
            placeholder: 'Bijv. "duik in", "ontdek hoe", "next level"...',
          },
        ],
      },
    ],
  },
  {
    id: 'assets',
    title: 'Assets',
    subcategories: [
      {
        id: 'middelen',
        title: 'Middelen',
        kennispunten: [
          {
            id: 'cta-links',
            title: 'CTA & links',
            question: 'Welke links/call-to-actions gebruik je (Quick Scan, etc.)?',
            interviewPrompt:
              'Verzamel de call-to-actions en links die JW in posts kan gebruiken (bijv. Quick Scan-boekingslink, verkennend gesprek). Geef ze als bruikbare regels.',
            role: 'assets',
            placeholder:
              'Bijv. Quick Scan boeken: https://cal.com/powerbistudio/quick-scan',
          },
          {
            id: 'bewijs-cases',
            title: 'Bewijs & cases',
            question: 'Welke (publieke) voorbeelden of cases mag je noemen?',
            interviewPrompt:
              'Verzamel publiek noembare bewijzen of cases. BELANGRIJK: alleen wat echt publiek/feitelijk is — geen verzonnen klantnamen of resultaten.',
            role: 'assets',
            placeholder: 'Alleen publiek noembare voorbeelden...',
          },
          {
            id: 'cijfers-feiten',
            title: 'Cijfers & feiten',
            question: 'Welke harde cijfers/feiten mag je gebruiken?',
            interviewPrompt:
              'Verzamel harde cijfers en feiten die JW mag gebruiken in posts. Alleen geverifieerde, ware getallen — niets verzinnen.',
            role: 'assets',
            placeholder: 'Alleen geverifieerde cijfers...',
          },
        ],
      },
    ],
  },
  {
    id: 'kaders',
    title: 'Kaders',
    subcategories: [
      {
        id: 'grenzen',
        title: 'Grenzen',
        kennispunten: [
          {
            id: 'verboden',
            title: 'Verboden',
            question: 'Welke claims of cijfers mogen NOOIT genoemd worden?',
            interviewPrompt:
              'Maak een lijst van claims, cijfers of beweringen die NOOIT in een post mogen staan (bijv. niet-bestaande klantresultaten, onbewezen percentages).',
            role: 'kaders',
            placeholder: 'Bijv. geen verzonnen ROI, geen niet-bestaande klanten...',
          },
          {
            id: 'compliance',
            title: 'Compliance',
            question: 'Welke regels gelden rond privacy, klantnamen, AVG?',
            interviewPrompt:
              'Beschrijf de compliance-kaders: geen klantnamen tenzij publiek, AVG-bewust, geen herleidbare data. Concreet als regels.',
            role: 'kaders',
            placeholder: 'Bijv. geen klantnamen tenzij publiek, AVG-proof...',
          },
        ],
      },
    ],
  },
]

// --- Helpers ---

export function allKennispunten(): BrandKennispunt[] {
  return BRAND_SCHEMA.flatMap((cat) =>
    cat.subcategories.flatMap((sub) => sub.kennispunten)
  )
}

export function kennispuntById(id: string): BrandKennispunt | undefined {
  return allKennispunten().find((k) => k.id === id)
}

export function kennispuntIdsByRole(role: BrandPromptRole): string[] {
  return allKennispunten()
    .filter((k) => k.role === role)
    .map((k) => k.id)
}
