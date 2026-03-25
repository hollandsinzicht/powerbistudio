import Anthropic from '@anthropic-ai/sdk'
import type { PbixMetadata, AuditAnalysis } from './types/audit'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

const systemPrompt = `Je bent een senior Power BI consultant met 15 jaar ervaring.
Je analyseert de structuur van een Power BI datamodel en geeft een professioneel audit rapport.
Je spreekt in het Nederlands. Je bent direct en concreet — geen marketing-taal.
Geef alleen JSON terug, geen uitleg buiten de JSON.`

export async function analyzeWithClaude(metadata: PbixMetadata): Promise<AuditAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockAnalysis()
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Analyseer dit Power BI datamodel en geef een JSON audit rapport.

METADATA:
${JSON.stringify(metadata, null, 2)}

Geef terug als JSON met deze structuur:
{
  "scores": {
    "datamodel": { "score": 1-10, "toelichting": "string" },
    "dax_kwaliteit": { "score": 1-10, "toelichting": "string" },
    "performance_risico": { "score": 1-10, "toelichting": "string" },
    "naamgeving": { "score": 1-10, "toelichting": "string" },
    "onderhoudbaarheid": { "score": 1-10, "toelichting": "string" }
  },
  "bevindingen": [
    {
      "categorie": "datamodel|dax|performance|naamgeving|governance",
      "ernst": "kritisch|belangrijk|aanbeveling",
      "titel": "string (max 60 tekens)",
      "probleem": "string (max 200 tekens)",
      "risico": "string (max 200 tekens)",
      "oplossing": "string (max 200 tekens)"
    }
  ],
  "prioriteiten": [
    {
      "rang": 1-5,
      "actie": "string (max 100 tekens)",
      "impact": "hoog|gemiddeld|laag",
      "effort": "hoog|gemiddeld|laag"
    }
  ],
  "samenvatting": "string (2-3 zinnen, professionele overall beoordeling)"
}`,
      },
    ],
  })

  const firstBlock = response.content[0]
  if (firstBlock?.type !== 'text') {
    throw new Error('Unexpected response from Claude API')
  }

  // Extract JSON from potential markdown code blocks
  let jsonText = firstBlock.text.trim()
  const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1].trim()
  }

  return JSON.parse(jsonText) as AuditAnalysis
}

function getMockAnalysis(): AuditAnalysis {
  return {
    scores: {
      datamodel: { score: 7, toelichting: 'Het datamodel is redelijk opgebouwd met een duidelijke sterstructuur, maar er zijn verbeterpunten in de normalisatie.' },
      dax_kwaliteit: { score: 6, toelichting: 'DAX measures zijn functioneel maar kunnen efficienter. Enkele measures bevatten onnodige complexiteit.' },
      performance_risico: { score: 5, toelichting: 'Er zijn potentiele performance-risicos door brede tabellen en ontbrekende aggregaties.' },
      naamgeving: { score: 4, toelichting: 'Naamgeving is inconsistent. Mix van Nederlands en Engels, en afkortingen zonder documentatie.' },
      onderhoudbaarheid: { score: 6, toelichting: 'Model is redelijk onderhoudbaar maar mist beschrijvingen bij measures en calculatiegroepen.' },
    },
    bevindingen: [
      {
        categorie: 'naamgeving',
        ernst: 'belangrijk',
        titel: 'Inconsistente naamgeving tabellen',
        probleem: 'Tabellen gebruiken een mix van Nederlands en Engels, en sommige hebben afkortingen.',
        risico: 'Nieuwe teamleden begrijpen het model moeilijker, wat leidt tot fouten.',
        oplossing: 'Kies een consistente taal (bij voorkeur Engels) en documenteer afkortingen.',
      },
      {
        categorie: 'performance',
        ernst: 'kritisch',
        titel: 'Brede feitentabel zonder partitionering',
        probleem: 'De hoofdtabel bevat meer dan 30 kolommen waarvan veel niet gebruikt worden in visuals.',
        risico: 'Langzame rapportage en hoog geheugengebruik in de Power BI service.',
        oplossing: 'Verwijder ongebruikte kolommen en overweeg verticale partitionering.',
      },
      {
        categorie: 'dax',
        ernst: 'aanbeveling',
        titel: 'Herhaalde CALCULATE patronen',
        probleem: 'Meerdere measures herhalen dezelfde filterlogica in plaats van hergebruik.',
        risico: 'Onderhoudslast stijgt en kans op inconsistentie tussen measures.',
        oplossing: 'Maak basis-measures aan en bouw daarop voort met CALCULATE variaties.',
      },
    ],
    prioriteiten: [
      { rang: 1, actie: 'Verwijder ongebruikte kolommen uit de feitentabel', impact: 'hoog', effort: 'laag' },
      { rang: 2, actie: 'Standaardiseer naamgeving naar Engels', impact: 'gemiddeld', effort: 'gemiddeld' },
      { rang: 3, actie: 'Refactor herhaalde DAX-patronen naar basis-measures', impact: 'gemiddeld', effort: 'gemiddeld' },
      { rang: 4, actie: 'Voeg beschrijvingen toe aan alle measures', impact: 'laag', effort: 'laag' },
      { rang: 5, actie: 'Implementeer calculatiegroepen voor tijdintelligentie', impact: 'hoog', effort: 'hoog' },
    ],
    samenvatting: 'Het datamodel is functioneel maar heeft verbeterpunten op het gebied van performance en naamgeving. De belangrijkste actie is het opschonen van de feitentabel — dit levert direct merkbare verbetering op.',
  }
}
