import type { BrandAnswers } from './brand-profile-store'
import {
  kennispuntById,
  kennispuntIdsByRole,
  type BrandPromptRole,
} from './brand-profile-schema'
import { getBrand, type BrandConfig } from './brands'

// Assembleert de losse kennispunt-antwoorden tot tekstblokken per promptrol.
// Als JW het persona-blok (nog) niet heeft ingevuld, valt de generator terug
// op brand.fallbackPersona: feitelijke, vaststaande positionering per bedrijf
// — GEEN verzonnen cijfers, klanten of personen (zie brands.ts).

export interface BrandContext {
  persona: string
  boodschap: string
  doelgroep: string
  schrijfstijl: string
  kaders: string
  assets: string
  isEmpty: boolean
}

// Backwards-compatibele export: paden zonder expliciete brand (bv. blogposts)
// zijn altijd Power BI Studio en lezen de persona uit de brand-registry.
export const FALLBACK_PERSONA = getBrand('power-bi-studio').fallbackPersona

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

export function buildBrandContext(
  answers: BrandAnswers,
  brand: BrandConfig = getBrand('power-bi-studio')
): BrandContext {
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
    persona: persona || brand.fallbackPersona,
    boodschap,
    doelgroep,
    schrijfstijl,
    kaders,
    assets,
    isEmpty,
  }
}
