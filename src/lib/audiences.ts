import type { LinkedInStyle } from './linkedin-writer'

// Doelgroep-dimensie voor de Campagne-flow. Waar de bestaande LinkedIn-generator
// varieert op STIJL, variëren we hier op DOELGROEP: dezelfde blog wordt vertaald
// naar de rol, pijn en toon van een specifieke lezer. De `guide` landt als extra
// sturing in de prompt via buildSystemPrompt({ extraGuides }); de `style` bepaalt
// de standaardtoon van die variant.
//
// Doelgroepen zijn beheerbaar vanuit de Campagne-tab en worden opgeslagen in de
// `audiences`-tabel (zie audience-store.ts). De array hieronder is uitsluitend de
// STARTSET die één keer wordt geseed; daarna is de database leidend.

export interface Audience {
  /** Stabiele slug; referentie vanuit campaigns.stages. */
  key: string
  label: string
  beschrijving: string
  /** Invalshoek-gids die als extraGuide in de prompt landt. */
  guide: string
  /** Standaardtoon voor de LinkedIn-variant van deze doelgroep. */
  style: LinkedInStyle
}

export const DEFAULT_AUDIENCES: Audience[] = [
  {
    key: 'hr-directeur',
    label: 'HR-directeur',
    beschrijving: 'Strategie & risico — bestuurlijke besluitvorming, AVG, verzuimtrends.',
    style: 'storytelling',
    guide: `DOELGROEP — schrijf voor een HR-directeur / HR-manager:
- Rol: stuurt op mensen en beleid, niet op techniek. Leest geen DAX.
- Pijn: betrouwbare trends voor besluitvorming, AVG-verantwoordelijkheid, grip op verzuim en formatie.
- Toon: strategisch en bestuurlijk. Vertaal techniek naar consequenties (risico, betrouwbaarheid, beslissingen).
- Vermijd: jargon zonder uitleg, code, implementatiedetails. Geen "RLS-rollen", wél "wie ziet welke data".`,
  },
  {
    key: 'controller',
    label: 'Controller / finance',
    beschrijving: 'Kosten & betrouwbaarheid — single source of truth, historiek, cijfers die kloppen.',
    style: 'scherp',
    guide: `DOELGROEP — schrijf voor een controller / finance-professional:
- Rol: bewaakt cijfers, kosten en consistentie. Wil dat een getal van vorig jaar nog hetzelfde getal is.
- Pijn: losse bronnen die niet aansluiten, retroactief veranderende cijfers (ontbrekende historiek/SCD2), kosten van handmatig werk.
- Toon: nuchter, kwantitatief, gericht op betrouwbaarheid en efficiëntie.
- Vermijd: hype en techniek-om-de-techniek. Leg de link naar "klopt het cijfer en wat kost het".`,
  },
  {
    key: 'it-bi-manager',
    label: 'IT / BI-manager',
    beschrijving: 'Techniek & governance — datamodel, RLS, Fabric, beheersbaarheid.',
    style: 'educatief',
    guide: `DOELGROEP — schrijf voor een IT- of BI-manager:
- Rol: verantwoordelijk voor architectuur, governance en beheersbaarheid van het platform.
- Pijn: wildgroei aan rapporten, RLS goed dichttimmeren, een onderhoudbaar semantisch model, Fabric-keuzes.
- Toon: technisch geloofwaardig maar op managementniveau — patronen en trade-offs, niet stap-voor-stap-tutorial.
- Mag: vaktermen (RLS, semantisch model, SCD2, Fabric) gebruiken, mits in de context van beheersbaarheid.`,
  },
]

export const VALID_STYLES: LinkedInStyle[] = ['educatief', 'scherp', 'provocatief', 'storytelling']

export function isValidStyle(s: unknown): s is LinkedInStyle {
  return typeof s === 'string' && (VALID_STYLES as string[]).includes(s)
}

/** Normaliseert een vrije tekst naar een veilige slug voor een nieuwe doelgroep-key. */
export function slugifyAudienceKey(input: string): string {
  // NFD splitst diacritische tekens af; de [^a-z0-9]-replace verwijdert die
  // combining marks vervolgens samen met alle andere niet-alfanumerieke tekens.
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
