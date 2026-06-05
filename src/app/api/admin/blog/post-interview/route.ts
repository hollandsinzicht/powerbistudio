import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  summarizeUsage,
  type FunnelStage,
  type PostCategory,
  type InterviewTurn,
} from '@/lib/linkedin-writer'
import { FALLBACK_PERSONA } from '@/lib/brand-context'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

function checkAuth(req: Request): boolean {
  return req.headers.get('x-admin-token') === ADMIN_PASSWORD
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Maximaal aantal vragen in één gesprek. Opening (2-3) + vervolgvragen samen.
const MAX_QUESTIONS = 4

const FUNNEL_LABEL: Record<FunnelStage, string> = {
  tofu: 'TOFU (herkenning, geen aanbod)',
  mofu: 'MOFU (verdieping, vertrouwen opbouwen)',
  bofu: 'BOFU (concreet aanbod, Quick Scan-wedge)',
}

const CATEGORY_LABEL: Record<PostCategory, string> = {
  '3-hr-problemen': '3 HR-data-problemen (losse bronnen / geen historie / rechten-AVG)',
  klantcase: 'klantcase of verhaal',
  'mythe-provocatie': 'mythe of provocatie',
  'persoonlijk-visie': 'persoonlijk of visie',
}

interface InterviewBody {
  funnelStage?: FunnelStage
  category?: PostCategory
  topic?: string
  answers?: InterviewTurn[]
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as InterviewBody
    const { funnelStage, category, topic } = body
    const answers = Array.isArray(body.answers) ? body.answers : []

    if (!funnelStage || !category || !topic?.trim()) {
      return NextResponse.json(
        { error: 'funnelStage, category en topic zijn verplicht' },
        { status: 400 }
      )
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
${FALLBACK_PERSONA}

DOEL VAN HET GESPREK:
- Funnel-fase: ${FUNNEL_LABEL[funnelStage]}
- Categorie: ${CATEGORY_LABEL[category]}
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
