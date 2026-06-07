import type { LinkedInStyle, FunnelStage } from './linkedin-writer'

// Centrale brand-registry. De LinkedIn-generator is van oorsprong hardgecodeerd
// op Power BI Studio (HR-analytics). Alle bedrijfsspecifieke prompt-onderdelen
// — funnel-gidsen, categorie-gidsen, labels en de fallback-persona — leven nu
// hier, geparametriseerd per brand, zodat we naast Power BI Studio ook
// Performance by Design (coaching + data, persoonlijk, secundair) kunnen voeden.

export type BrandId = 'power-bi-studio' | 'performance-by-design'

export interface BrandCategoryDef {
  /** Stabiele id, gebruikt in DB-opslag en API-bodies. */
  id: string
  /** Korte weergavelabel voor de wizard-knoppen. */
  label: string
  /** Beschrijvend label voor de interview-/generatieprompt. */
  promptLabel: string
  /** Inhoudelijke invalshoek voor de generator (na de STYLE_GUIDE). */
  guide: string
  /** Stijl die standaard bij deze categorie past. */
  defaultStyle: LinkedInStyle
}

export interface BrandConfig {
  id: BrandId
  /** Weergavenaam voor de bedrijfskeuze in de wizard. */
  label: string
  website: string
  /** Vaststaande positionering; gebruikt als het persona-blok leeg is. */
  fallbackPersona: string
  /** Wat elke funnel-fase met de lezer moet doen (toon + call-to-action). */
  funnelGuide: Record<FunnelStage, string>
  /** Beschrijvend funnel-label voor de prompt. */
  funnelLabel: Record<FunnelStage, string>
  categories: BrandCategoryDef[]
}

// ---------------------------------------------------------------------------
// Power BI Studio — 1-op-1 verplaatst vanuit linkedin-writer.ts /
// brand-context.ts / post-interview route. GEEN gedragswijziging.
// ---------------------------------------------------------------------------

const POWER_BI_STUDIO_PERSONA = `
Jan Willem den Hollander is de oprichter van Power BI Studio en gespecialiseerd in HR-analytics voor de Nederlandse mid-market (organisaties van circa 250 tot 2.000 medewerkers, vaak met AFAS, Visma of Nmbrs als salarissysteem).

Hij helpt HR-afdelingen om van losse bronnen en handmatig Excel-werk naar één betrouwbaar datamodel te gaan: verzuim, verloop, formatie en bezetting op basis van data waarop je echt kunt sturen — inclusief historie (langzaam veranderende dimensies), row-level security en AVG-bewuste inrichting.

De instap is een Quick Scan: een kortlopend, vastgeprijsd traject waarin de HR-datasituatie in kaart wordt gebracht en de eerste betrouwbare inzichten worden opgeleverd.

Toon: nuchter, technisch onderbouwd, recht door zee. Geen hype, geen loze beloftes.
`.trim()

const POWER_BI_STUDIO_FUNNEL_GUIDE: Record<FunnelStage, string> = {
  tofu: `FUNNEL: TOFU (top of funnel) — herkenning.
- Doel: de lezer zijn eigen probleem laten herkennen, zonder te verkopen.
- Breed insteken op een pijn of misverstand rond HR-data. Geen aanbod, geen Quick Scan.
- Call-to-action hooguit zacht: een vraag of een prikkel tot nadenken.`,

  mofu: `FUNNEL: MOFU (middle of funnel) — verdieping.
- Doel: laten zien hoe het beter kan; vertrouwen en autoriteit opbouwen.
- Concreter: een aanpak, een keuze, een mini-case of een principe dat werkt.
- Call-to-action: uitnodiging tot gesprek of meedenken, nog niet hard verkopen.`,

  bofu: `FUNNEL: BOFU (bottom of funnel) — concreet aanbod.
- Doel: de lezer die het probleem herkent een duidelijke volgende stap geven.
- Mag de Quick Scan noemen als logische wedge (1,5 dag, vaste prijs, geen verplichting).
- Call-to-action: concreet maar nuchter. Een DM-uitnodiging of "stuur me een bericht".`,
}

const POWER_BI_STUDIO_FUNNEL_LABEL: Record<FunnelStage, string> = {
  tofu: 'TOFU (herkenning, geen aanbod)',
  mofu: 'MOFU (verdieping, vertrouwen opbouwen)',
  bofu: 'BOFU (concreet aanbod, Quick Scan-wedge)',
}

const POWER_BI_STUDIO_CATEGORIES: BrandCategoryDef[] = [
  {
    id: '3-hr-problemen',
    label: '3 HR-data-problemen',
    promptLabel: '3 HR-data-problemen (losse bronnen / geen historie / rechten-AVG)',
    defaultStyle: 'educatief',
    guide: `CATEGORIE: 3 HR-data-problemen.
- Rode draad: losse bronnen, geen historie (SCD2), rechten niet dichtgetimmerd (RLS/AVG).
- Pak één of meer van deze problemen beet en maak ze concreet en herkenbaar.`,
  },
  {
    id: 'klantcase',
    label: 'Klantcase / verhaal',
    promptLabel: 'klantcase of verhaal',
    defaultStyle: 'storytelling',
    guide: `CATEGORIE: klantcase / verhaal.
- Vertel een concreet (anoniem) project: de situatie, de fout of het knelpunt, de aanpak, de les.
- Gebruik alleen echte details uit de context. Verzin geen klantnamen of cijfers.`,
  },
  {
    id: 'mythe-provocatie',
    label: 'Mythe / provocatie',
    promptLabel: 'mythe of provocatie',
    defaultStyle: 'provocatief',
    guide: `CATEGORIE: mythe / provocatie.
- Daag een gangbare aanname uit ("iedereen begint bij de dashboards — precies verkeerd om").
- Scherp en onderbouwd, niet hatelijk. Geen aanvallen op personen of bedrijven.`,
  },
  {
    id: 'persoonlijk-visie',
    label: 'Persoonlijk / visie',
    promptLabel: 'persoonlijk of visie',
    defaultStyle: 'scherp',
    guide: `CATEGORIE: persoonlijk / visie.
- JW's eigen kijk: waarom hij dit werk doet, wat hij telkens terugziet, waar hij in gelooft.
- Persoonlijk en stellig, maar zonder borstklopperij. Een mening, geen verkooppraatje.`,
  },
]

// ---------------------------------------------------------------------------
// Performance by Design — secundair bedrijf: coaching gecombineerd met data,
// persoonlijk. Lichtere funnel (vooral TOFU/MOFU; BOFU zonder Quick Scan-wedge).
// ---------------------------------------------------------------------------

const PERFORMANCE_BY_DESIGN_PERSONA = `
Jan Willem den Hollander runt naast Power BI Studio ook Performance by Design (www.performancebydesign.nl), een secundair bedrijf waarin hij coaching combineert met data.

Hier gaat het niet over HR-datamodellen of Quick Scans, maar over de mens achter de cijfers: hoe data inzicht geeft in gedrag, gewoontes en prestaties — en hoe coaching mensen helpt daar daadwerkelijk iets mee te doen. Dit is een groot en persoonlijk deel van zijn leven.

Toon: persoonlijk, reflectief en open. Hij deelt eigen ervaringen, twijfels en inzichten. Geen verkooppraat, geen harde funnel. Af en toe een persoonlijk verhaal of een informatieve post die kennis deelt.
`.trim()

const PERFORMANCE_BY_DESIGN_FUNNEL_GUIDE: Record<FunnelStage, string> = {
  tofu: `FUNNEL: TOFU (top of funnel) — herkenning, persoonlijk.
- Doel: een gevoel of inzicht delen dat de lezer in zichzelf herkent. Niets verkopen.
- Insteek vanuit eigen ervaring rond coaching, gedrag, prestaties of de data daarachter.
- Call-to-action hooguit zacht: een open vraag of een gedachte om mee te nemen.`,

  mofu: `FUNNEL: MOFU (middle of funnel) — verdieping.
- Doel: laten zien hoe coaching en data samen tot beweging leiden; vertrouwen opbouwen.
- Concreter: een principe, een aanpak of een klein voorbeeld dat werkt.
- Call-to-action: uitnodiging om mee te denken of te reageren, nog geen aanbod.`,

  bofu: `FUNNEL: BOFU (bottom of funnel) — zachte uitnodiging.
- Doel: de lezer die zich herkent een laagdrempelige volgende stap bieden.
- GEEN hard aanbod en GEEN Quick Scan — dit is het persoonlijke, secundaire bedrijf.
- Call-to-action: nuchter en uitnodigend, bv. "stuur me een bericht als dit resoneert".`,
}

const PERFORMANCE_BY_DESIGN_FUNNEL_LABEL: Record<FunnelStage, string> = {
  tofu: 'TOFU (herkenning, persoonlijk)',
  mofu: 'MOFU (verdieping, vertrouwen opbouwen)',
  bofu: 'BOFU (zachte uitnodiging, geen hard aanbod)',
}

const PERFORMANCE_BY_DESIGN_CATEGORIES: BrandCategoryDef[] = [
  {
    id: 'persoonlijk-verhaal',
    label: 'Persoonlijk verhaal',
    promptLabel: 'persoonlijk verhaal (coaching + eigen leven)',
    defaultStyle: 'storytelling',
    guide: `CATEGORIE: persoonlijk verhaal.
- Vertel een concreet moment of ervaring uit JW's eigen leven of coachingpraktijk.
- Maak het kwetsbaar en echt: de situatie, wat het deed, wat hij eruit leerde.
- Verzin geen cliënten, namen of resultaten. Alleen eigen, echte ervaring.`,
  },
  {
    id: 'coaching-inzicht',
    label: 'Coaching-inzicht',
    promptLabel: 'coaching-inzicht (coaching gecombineerd met data)',
    defaultStyle: 'educatief',
    guide: `CATEGORIE: coaching-inzicht.
- Deel een inzicht waarin coaching en data samenkomen: wat cijfers laten zien én wat je ermee doet.
- Geef de lezer iets concreets om over na te denken of toe te passen.
- Toon: rustig en behulpzaam, vanuit ervaring, niet belerend.`,
  },
  {
    id: 'data-reflectie',
    label: 'Data-reflectie',
    promptLabel: 'data-reflectie (wat data over mensen en gedrag laat zien)',
    defaultStyle: 'scherp',
    guide: `CATEGORIE: data-reflectie.
- Een scherpe observatie over wat data onthult over mensen, gedrag of prestaties.
- Kort en stellig, maar reflectief — niet provocerend om het provoceren.
- Onderbouw met een concrete observatie, geen verzonnen cijfers.`,
  },
  {
    id: 'informatief',
    label: 'Informatief',
    promptLabel: 'informatief (kennis delen, geen aanbod)',
    defaultStyle: 'educatief',
    guide: `CATEGORIE: informatief.
- Deel kennis rond coaching, gedrag, prestaties of de data daarachter. Puur waarde, geen aanbod.
- Maak het praktisch: 3-4 concrete punten of inzichten die de lezer kan gebruiken.
- Toon: helder en toegankelijk, zonder jargon.`,
  },
]

// ---------------------------------------------------------------------------
// Registry + helpers
// ---------------------------------------------------------------------------

export const BRANDS: Record<BrandId, BrandConfig> = {
  'power-bi-studio': {
    id: 'power-bi-studio',
    label: 'Power BI Studio',
    website: 'www.powerbistudio.nl',
    fallbackPersona: POWER_BI_STUDIO_PERSONA,
    funnelGuide: POWER_BI_STUDIO_FUNNEL_GUIDE,
    funnelLabel: POWER_BI_STUDIO_FUNNEL_LABEL,
    categories: POWER_BI_STUDIO_CATEGORIES,
  },
  'performance-by-design': {
    id: 'performance-by-design',
    label: 'Performance by Design',
    website: 'www.performancebydesign.nl',
    fallbackPersona: PERFORMANCE_BY_DESIGN_PERSONA,
    funnelGuide: PERFORMANCE_BY_DESIGN_FUNNEL_GUIDE,
    funnelLabel: PERFORMANCE_BY_DESIGN_FUNNEL_LABEL,
    categories: PERFORMANCE_BY_DESIGN_CATEGORIES,
  },
}

export const DEFAULT_BRAND_ID: BrandId = 'power-bi-studio'

export function isValidBrand(id: unknown): id is BrandId {
  return typeof id === 'string' && id in BRANDS
}

/** Haalt een brand-config op; valt terug op Power BI Studio bij een onbekende id. */
export function getBrand(id: unknown): BrandConfig {
  return isValidBrand(id) ? BRANDS[id] : BRANDS[DEFAULT_BRAND_ID]
}

/** Zoekt een categorie binnen een brand op id; undefined als die niet bestaat. */
export function getBrandCategory(
  brand: BrandConfig,
  categoryId: string
): BrandCategoryDef | undefined {
  return brand.categories.find((c) => c.id === categoryId)
}
