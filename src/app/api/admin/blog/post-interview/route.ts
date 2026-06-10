import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  summarizeUsage,
  type FunnelStage,
  type InterviewTurn,
} from '@/lib/linkedin-writer'
import { getBrand, getBrandCategory, type BrandConfig } from '@/lib/brands'
import { getBrandAnswers } from '@/lib/brand-profile-store'
import { buildBrandContext } from '@/lib/brand-context'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD /* fail-closed: geen 'admin'-fallback */

function checkAuth(req: Request): boolean {
  return req.headers.get('x-admin-token') === ADMIN_PASSWORD
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Maximaal aantal vragen in één gesprek. Opening (2-3) + vervolgvragen samen.
const MAX_QUESTIONS = 4

interface InterviewBody {
  brand?: string
  funnelStage?: FunnelStage
  categoryId?: string
  topic?: string
  answers?: InterviewTurn[]
  // Draft-modus: gegeven de gestelde vragen concept-antwoorden uit het
  // merkprofiel voorstellen, zodat JW alleen nog hoeft te redigeren.
  draftAnswers?: boolean
  questions?: string[]
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as InterviewBody
    const { funnelStage, categoryId, topic } = body
    const answers = Array.isArray(body.answers) ? body.answers : []

    if (!funnelStage || !categoryId || !topic?.trim()) {
      return NextResponse.json(
        { error: 'funnelStage, categoryId en topic zijn verplicht' },
        { status: 400 }
      )
    }

    // Brand bepalen (valt terug op power-bi-studio) en categorie valideren tegen
    // de brand-registry i.p.v. een vaste union.
    const brand = getBrand(body.brand)
    const category = getBrandCategory(brand, categoryId)
    if (!category) {
      return NextResponse.json(
        { error: `categoryId '${categoryId}' bestaat niet voor ${brand.label}` },
        { status: 400 }
      )
    }

    // ===== DRAFT-MODUS: concept-antwoorden uit het merkprofiel =====
    // Neemt de wizard veel uit handen: gegeven de gestelde vragen stelt de route
    // concept-antwoorden voor, geput uit JW's merkprofiel voor deze brand.
    if (body.draftAnswers) {
      const questions = Array.isArray(body.questions)
        ? body.questions.filter((q): q is string => typeof q === 'string' && q.trim() !== '')
        : []
      if (questions.length === 0) {
        return NextResponse.json(
          { error: 'questions zijn verplicht in draftAnswers-modus' },
          { status: 400 }
        )
      }
      return draftAnswersForQuestions(brand, category.promptLabel, funnelStage, topic.trim(), questions)
    }

    // Cap bereikt → geen vragen meer, gesprek is klaar.
    if (answers.length >= MAX_QUESTIONS) {
      return NextResponse.json({ questions: [], done: true })
    }

    const isOpening = answers.length === 0

    // Geen API-key → mock-vragen, zodat de UI-flow ook lokaal werkt.
    if (!process.env.ANTHROPIC_API_KEY) {
      const questions = isOpening
        ? [
            `[Mock] Wat is de kern van wat je over "${topic.trim()}" wilt zeggen?`,
            '[Mock] Welk concreet voorbeeld of moment maakt dit tastbaar?',
            '[Mock] Wat moet de lezer onthouden of anders gaan doen?',
          ]
        : ['[Mock] Kun je dat laatste antwoord nog iets concreter maken?']
      return NextResponse.json({ questions, done: false })
    }

    const systemPrompt = `Je bent een lichte, scherpe interviewer die Jan Willem den Hollander helpt om de inhoud voor één LinkedIn-post boven tafel te krijgen.

ACHTERGROND OVER JAN WILLEM:
${brand.fallbackPersona}

DOEL VAN HET GESPREK:
- Funnel-fase: ${brand.funnelLabel[funnelStage]}
- Categorie: ${category.promptLabel}
- Onderwerp: ${topic.trim()}

INTEGRITEIT — ABSOLUUT:
- Verzin GEEN cijfers, klantnamen, resultaten of personen. Je stelt alleen vragen, je beantwoordt ze niet.

VRAAGSTELLING:
- Vragen zijn kort, concreet en open. Geen jargon, geen meerkeuze.
- Gericht op het ophalen van JW's eigen ervaring, mening en voorbeelden — bruikbaar voor deze funnel-fase en categorie.
- ${isOpening ? 'Stel 2 tot 3 openingsvragen die samen de post kunnen voeden.' : 'Stel precies ÉÉN vervolgvraag die voortbouwt op het laatste antwoord en een gat opvult.'}

OUTPUT — alleen valide JSON, geen markdown, geen uitleg:
{ "questions": ["vraag 1"${isOpening ? ', "vraag 2"' : ''}] }`

    const answeredBlock = answers
      .map((turn, i) => `V${i + 1}: ${turn.vraag}\nA${i + 1}: ${turn.antwoord}`)
      .join('\n\n')

    const userMessage = isOpening
      ? `Start het gesprek over "${topic.trim()}". Geef 2-3 openingsvragen.`
      : `Tot nu toe besproken:\n\n${answeredBlock}\n\nGeef precies één goede vervolgvraag.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const usage = summarizeUsage(response, 'post-interview-vragen')

    const text = response.content[0]
    let questions: string[] = []
    if (text.type === 'text') {
      try {
        const cleaned = text.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleaned) as { questions?: unknown }
        if (Array.isArray(parsed.questions)) {
          questions = parsed.questions.filter((q): q is string => typeof q === 'string' && q.trim() !== '')
        }
      } catch {
        console.error('Failed to parse post-interview questions:', text.text)
      }
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'Kon geen vragen genereren, probeer opnieuw' },
        { status: 502 }
      )
    }

    // Volgende ronde zou de cap overschrijden → markeer als laatste vragen.
    const done = answers.length + questions.length >= MAX_QUESTIONS

    return NextResponse.json({ questions, done, usage })
  } catch (error) {
    console.error('Post interview error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

/**
 * Stelt concept-antwoorden voor op de gestelde interviewvragen, geput uit JW's
 * merkprofiel voor deze brand. Antwoorden zijn een startpunt om te redigeren —
 * geen verzonnen cijfers/klanten. Zonder API-key valt het terug op mock-tekst.
 */
async function draftAnswersForQuestions(
  brand: BrandConfig,
  categoryLabel: string,
  funnelStage: FunnelStage,
  topic: string,
  questions: string[]
) {
  // Geen API-key → lege concepten, zodat de UI-flow lokaal blijft werken.
  if (!process.env.ANTHROPIC_API_KEY) {
    const drafts = questions.map(
      (q) => `[Mock] Concept-antwoord op "${q}" — vul aan vanuit je eigen ervaring.`
    )
    return NextResponse.json({ drafts })
  }

  const brandContext = buildBrandContext(await getBrandAnswers(brand.id), brand)
  const persona = brandContext.persona?.trim() || brand.fallbackPersona

  const profileBlocks = [
    brandContext.boodschap && `KERNBOODSCHAP:\n${brandContext.boodschap}`,
    brandContext.doelgroep && `DOELGROEP:\n${brandContext.doelgroep}`,
    brandContext.schrijfstijl && `SCHRIJFSTIJL:\n${brandContext.schrijfstijl}`,
    brandContext.kaders && `KADERS:\n${brandContext.kaders}`,
    brandContext.assets && `ASSETS:\n${brandContext.assets}`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const systemPrompt = `Je helpt Jan Willem den Hollander door, namens hem, concept-antwoorden voor te stellen op interviewvragen voor één LinkedIn-post. JW redigeert ze daarna zelf.

ACHTERGROND OVER JAN WILLEM (${brand.label}):
${persona}
${profileBlocks ? `\nMERKPROFIEL:\n${profileBlocks}` : ''}

DOEL VAN DE POST:
- Funnel-fase: ${brand.funnelLabel[funnelStage]}
- Categorie: ${categoryLabel}
- Onderwerp: ${topic}

INTEGRITEIT — ABSOLUUT:
- Verzin GEEN cijfers, klantnamen, resultaten of personen. Gebruik uitsluitend wat uit het merkprofiel volgt of algemeen waar is.
- Onzeker? Schrijf een kort, algemeen concept dat JW makkelijk kan aanvullen — laat geen placeholders als [X] staan.

STIJL:
- Concept-antwoorden in JW's eerste persoon ("ik"), kort en concreet, 1-3 zinnen per vraag.

OUTPUT — alleen valide JSON, één antwoord per vraag in dezelfde volgorde, geen markdown, geen uitleg:
{ "drafts": ["concept-antwoord op vraag 1", "..."] }`

  const questionBlock = questions.map((q, i) => `${i + 1}. ${q}`).join('\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    temperature: 0.7,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Stel concept-antwoorden voor op deze vragen:\n\n${questionBlock}`,
      },
    ],
  })

  const usage = summarizeUsage(response, 'post-interview-draftantwoorden')

  const text = response.content[0]
  let drafts: string[] = []
  if (text.type === 'text') {
    try {
      const cleaned = text.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(cleaned) as { drafts?: unknown }
      if (Array.isArray(parsed.drafts)) {
        drafts = parsed.drafts.map((d) => (typeof d === 'string' ? d : ''))
      }
    } catch {
      console.error('Failed to parse draft answers:', text.text)
    }
  }

  if (drafts.length === 0) {
    return NextResponse.json(
      { error: 'Kon geen concept-antwoorden genereren, probeer opnieuw' },
      { status: 502 }
    )
  }

  return NextResponse.json({ drafts, usage })
}
