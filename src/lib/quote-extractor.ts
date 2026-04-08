import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export interface Quote {
  text: string // volledige quote (max ~120 tekens)
  emphasis: string // 1-3 woorden die vetgedrukt moeten worden (moeten letterlijk in text voorkomen)
}

export async function extractQuotes(blog: {
  title: string
  excerpt: string
  content: string
}): Promise<Quote[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockQuotes()
  }

  // Strip HTML uit content voor schone context
  const cleanContent = blog.content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4500)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    temperature: 0.8,
    system: `Je selecteert quotes uit een blogartikel die op LinkedIn als losstaande beeld-quotes werken. Elk wordt een shareable image.

REGELS VOOR DE QUOTES:
- Maximaal 120 tekens per quote (anders past het niet op de image)
- Moet als standalone statement werken — de lezer snapt het ook zonder de rest van het artikel
- Punchy, prikkelend, iets wat iemand wil quoten of delen
- Concrete observaties of standpunten, GEEN vage algemeenheden ("data is belangrijk")
- Houd de toon van het artikel aan, maar herschrijf licht als dat helpt voor de beknoptheid
- 4 verschillende quotes — elk een ander aspect van het artikel
- Mag een herformulering zijn van wat in het artikel staat, zolang het de kern-inzicht bewaart

EMPHASIS (voor vetgedrukte woorden):
- Per quote: kies 1-3 woorden die vetgedrukt worden voor visuele nadruk
- Deze woorden MOETEN letterlijk en aaneengesloten in de quote-tekst voorkomen (dus niet "anticiperen ... problemen", maar bv. "anticiperen op problemen")
- Kies de meest krachtige of betekenisvolle woorden
- Hoofdletter/kleine letter in emphasis moet exact overeenkomen met de quote

HOOFDLETTERS — strikt:
- Alleen aan het begin van een zin
- Eigennamen en merken (Power BI, DAX, Microsoft Fabric, Copilot)
- GEEN Title Case, GEEN hoofdletters midden in een zin

VERMIJD:
- AI-clichés ("ontdek", "duik in", "alles wat je moet weten")
- Sales-taal
- Overdreven emoties
- Vraagzinnen

OUTPUT — alleen valide JSON, geen markdown fences, geen uitleg. Exact 4 quotes:
[
  {
    "text": "De beste beslissers anticiperen op problemen, ze lossen ze niet alleen op.",
    "emphasis": "anticiperen"
  },
  {
    "text": "...",
    "emphasis": "..."
  },
  {
    "text": "...",
    "emphasis": "..."
  },
  {
    "text": "...",
    "emphasis": "..."
  }
]`,
    messages: [
      {
        role: 'user',
        content: `Blogartikel:

Titel: ${blog.title}
Samenvatting: ${blog.excerpt}

Inhoud (eerste 4500 tekens):
${cleanContent}

Selecteer nu 4 verschillende sterke quotes. Output alleen de JSON array.`,
      },
    ],
  })

  const text = response.content[0]
  if (text.type !== 'text') return getMockQuotes()

  try {
    const cleaned = text.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned) as Quote[]

    // Valideer: max 4, moeten text hebben, emphasis moet in text voorkomen (anders weglaten)
    const validated = parsed
      .slice(0, 4)
      .filter((q) => q && typeof q.text === 'string' && q.text.trim().length > 0)
      .map((q) => {
        const text = q.text.trim()
        const emphasis = (q.emphasis || '').trim()
        // Als emphasis niet in text voorkomt, emphasis weglaten
        if (emphasis && !text.toLowerCase().includes(emphasis.toLowerCase())) {
          return { text, emphasis: '' }
        }
        return { text, emphasis }
      })

    // Vul aan met mocks als er minder dan 4 bruikbare quotes zijn
    while (validated.length < 4) {
      validated.push(getMockQuotes()[validated.length])
    }

    return validated
  } catch {
    console.error('Failed to parse quotes response:', text.text)
    return getMockQuotes()
  }
}

function getMockQuotes(): Quote[] {
  return [
    {
      text: 'De beste beslissers anticiperen op problemen, ze lossen ze niet alleen op.',
      emphasis: 'anticiperen',
    },
    {
      text: 'Een goed datamodel is de basis van elke snelle rapportage.',
      emphasis: 'datamodel',
    },
    {
      text: 'Performance problemen beginnen bijna altijd in het model, niet in de visuals.',
      emphasis: 'in het model',
    },
    {
      text: 'De juiste vraag stellen is belangrijker dan het perfecte dashboard bouwen.',
      emphasis: 'juiste vraag',
    },
  ]
}
