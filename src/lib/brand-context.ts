import type { BrandAnswers } from './brand-profile-store'
import {
  kennispuntById,
  kennispuntIdsByRole,
  type BrandPromptRole,
} from './brand-profile-schema'

// Assembleert de losse kennispunt-antwoorden tot tekstblokken per promptrol.
// Als JW het persona-blok (nog) niet heeft ingevuld, valt de generator terug
// op FALLBACK_PERSONA: feitelijke, vaststaande positionering — GEEN verzonnen
// cijfers, klanten of personen.

export interface BrandContext {
  persona: string
  boodschap: string
  doelgroep: string
  schrijfstijl: string
  kaders: string
  assets: string
  isEmpty: boolean
}

// Feitelijke HR-analytics positionering (afgeleid van acquisitie-data.ts).
// Vervangt de oude, stale SITE_CONTEXT ("Power BI architect met 15 jaar...").
export const FALLBACK_PERSONA = `
Jan Willem den Hollander is de oprichter van Power BI Studio en gespecialiseerd in HR-analytics voor de Nederlandse mid-market (organisaties van circa 250 tot 2.000 medewerkers, vaak met AFAS, Visma of Nmbrs als salarissysteem).

Hij helpt HR-afdelingen om van losse bronnen en handmatig Excel-werk naar één betrouwbaar datamodel te gaan: verzuim, verloop, formatie en bezetting op basis van data waarop je echt kunt sturen — inclusief historie (langzaam veranderende dimensies), row-level security en AVG-bewuste inrichting.

De instap is een Quick Scan: een kortlopend, vastgeprijsd traject waarin de HR-datasituatie in kaart wordt gebracht en de eerste betrouwbare inzichten worden opgeleverd.

Toon: nuchter, technisch onderbouwd, recht door zee. Geen hype, geen loze beloftes.
`.trim()

function joinAnswers(answers: BrandAnswers, role: BrandPromptRole): string {
  const ids = kennispuntIdsByRole(role)
  const blocks: string[] = []
  for (const id of ids) {
    const value = answers[id]?.trim()
    if (!value) continue
    const kp = kennispuntById(id)
    const label = kp ? kp.title : id
    blocks.push(`${label}: ${value}`)
  }
  return blocks.join('\n')
}

export function buildBrandContext(answers: BrandAnswers): BrandContext {
  const persona = joinAnswers(answers, 'persona')
  const boodschap = joinAnswers(answers, 'boodschap')
  const doelgroep = joinAnswers(answers, 'doelgroep')
  const schrijfstijl = joinAnswers(answers, 'schrijfstijl')
  const kaders = joinAnswers(answers, 'kaders')
  const assets = joinAnswers(answers, 'assets')

  const isEmpty =
    !persona &&
    !boodschap &&
    !doelgroep &&
    !schrijfstijl &&
    !kaders &&
    !assets

  return {
    persona: persona || FALLBACK_PERSONA,
    boodschap,
    doelgroep,
    schrijfstijl,
    kaders,
    assets,
    isEmpty,
  }
}
