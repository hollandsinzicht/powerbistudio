import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { allKennispunten, kennispuntById } from '@/lib/brand-profile-schema'
import { getBrandAnswers } from '@/lib/brand-profile-store'
import { FALLBACK_PERSONA } from '@/lib/brand-context'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD /* fail-closed: geen 'admin'-fallback */

function checkAuth(req: Request): boolean {
  return req.headers.get('x-admin-token') === ADMIN_PASSWORD
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Verzamelt de reeds ingevulde kennispunten als achtergrondcontext voor de
// interviewer, zodat het conceptantwoord aansluit op wat JW al heeft vastgelegd.
function buildFilledContext(answers: Record<string, string>, skipId: string): string {
  const lines: string[] = []
  for (const kp of allKennispunten()) {
    if (kp.id === skipId) continue
    const value = answers[kp.id]?.trim()
    if (!value) continue
    lines.push(`${kp.title}: ${value}`)
  }
  return lines.join('\n')
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { kennispuntId } = body as { kennispuntId?: string }

    const kennispunt = kennispuntId ? kennispuntById(kennispuntId) : undefined
    if (!kennispunt) {
      return NextResponse.json(
        { error: 'Onbekend of ontbrekend kennispunt (kennispuntId)' },
        { status: 400 }
      )
    }

    // Geen API-key → mock-draft, zodat de UI-flow ook lokaal werkt.
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        draft: `[Mock conceptantwoord — ANTHROPIC_API_KEY niet ingesteld]\n\n${kennispunt.question}`,
      })
    }

    const answers = await getBrandAnswers()
    const filledContext = buildFilledContext(answers, kennispunt.id)

    const systemPrompt = `Je bent een lichte interviewer die Jan Willem den Hollander helpt zijn merkprofiel op te bouwen.

ACHTERGROND OVER JAN WILLEM:
${FALLBACK_PERSONA}

INTEGRITEIT — ABSOLUUT:
- Verzin GEEN cijfers, klantnamen, resultaten of personen.
- Gebruik alleen wat uit de achtergrond en de reeds ingevulde context blijkt. Twijfel je? Houd het algemeen.
- Dit is een CONCEPT dat JW zelf bewerkt. Schrijf in de ik-vorm, in zijn nuchtere toon.
- Geef alleen de concepttekst terug, geen uitleg, geen kop, geen aanhalingstekens eromheen.`

    const userMessage = `Kennispunt: ${kennispunt.title}
Leidende vraag: ${kennispunt.question}

Opdracht: ${kennispunt.interviewPrompt}
${filledContext ? `\nReeds ingevuld door JW (sluit hierop aan, herhaal niet letterlijk):\n${filledContext}\n` : ''}
Schrijf nu een kort conceptantwoord (2-5 zinnen) dat JW kan bewerken.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      temperature: 0.8,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = response.content[0]
    const draft = text.type === 'text' ? text.text.trim() : ''

    return NextResponse.json({ draft })
  } catch (error) {
    console.error('Brand interview error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
