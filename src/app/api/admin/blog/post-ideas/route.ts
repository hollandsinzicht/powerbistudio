import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { summarizeUsage, type FunnelStage } from '@/lib/linkedin-writer'
import { getBrand, type BrandConfig } from '@/lib/brands'
import { getBrandAnswers } from '@/lib/brand-profile-store'
import { buildBrandContext } from '@/lib/brand-context'
import { ensureSeedPosts, getRecentPosts } from '@/lib/linkedin-posts-store'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD /* fail-closed: geen 'admin'-fallback */

function checkAuth(req: Request): boolean {
  return req.headers.get('x-admin-token') === ADMIN_PASSWORD
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

const VALID_FUNNELS: FunnelStage[] = ['tofu', 'mofu', 'bofu']

interface PostIdeasBody {
  brand?: string
  // Optioneel: beperk de ideeën tot één funnel-fase of categorie. Leeg = vrij.
  funnelStage?: FunnelStage
  categoryId?: string
}

export interface PostIdea {
  topic: string
  hook: string
  categoryId: string
  funnelStage: FunnelStage
  rationale: string
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as PostIdeasBody
    const brand = getBrand(body.brand)

    // Optionele filters valideren tegen de gekozen brand.
    const funnelFilter =
      body.funnelStage && VALID_FUNNELS.includes(body.funnelStage) ? body.funnelStage : undefined
    const categoryFilter = body.categoryId
      ? brand.categories.find((c) => c.id === body.categoryId)
      : undefined

    // Postgeheugen voeden zodat ideeën niet in herhaling vallen met wat er al staat.
    await ensureSeedPosts()
    const recent = await getRecentPosts(brand.id, 8)

    // Geen API-key → mock-ideeën, zodat de wizard-flow lokaal blijft werken.
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ ideas: mockIdeas(brand, funnelFilter, categoryFilter?.id) })
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

    const categoryList = brand.categories
      .map((c) => `- ${c.id}: ${c.promptLabel}`)
      .join('\n')

    const funnelList = (Object.keys(brand.funnelLabel) as FunnelStage[])
      .map((f) => `- ${f}: ${brand.funnelLabel[f]}`)
      .join('\n')

    const recentBlock =
      recent.length === 0
        ? '(nog geen eerdere posts)'
        : recent
            .map((p, i) => {
              const label = [p.funnel_stage, p.category].filter(Boolean).join('/') || 'onbekend'
              const snippet = p.post_text.replace(/\s+/g, ' ').trim().slice(0, 200)
              return `${i + 1}. [${label}] ${snippet}…`
            })
            .join('\n')

    const constraints = [
      funnelFilter
        ? `BEPERKING: kies voor elk idee funnelStage="${funnelFilter}".`
        : 'Varieer de funnelStage (tofu/mofu/bofu) over de ideeën heen.',
      categoryFilter
        ? `BEPERKING: kies voor elk idee categoryId="${categoryFilter.id}".`
        : 'Varieer de categoryId over de ideeën heen.',
    ].join('\n')

    const systemPrompt = `Je helpt Jan Willem den Hollander om concrete LinkedIn-post-ideeën te bedenken voor ${brand.label} (${brand.website}). JW kiest er daarna één om uit te werken.

ACHTERGROND OVER JAN WILLEM (${brand.label}):
${persona}
${profileBlocks ? `\nMERKPROFIEL:\n${profileBlocks}` : ''}

BESCHIKBARE FUNNEL-FASES:
${funnelList}

BESCHIKBARE CATEGORIEËN (gebruik exact deze id's):
${categoryList}

${constraints}

RECENTE POSTS (kom met VERSE invalshoeken, herhaal deze onderwerpen niet):
${recentBlock}

INTEGRITEIT — ABSOLUUT:
- Verzin GEEN cijfers, klantnamen, resultaten of personen. Ideeën zijn invalshoeken, geen feitenclaims.
- Blijf binnen de positionering van ${brand.label}; meng de twee bedrijven niet.

OPDRACHT:
- Bedenk 4 tot 5 concrete, onderling verschillende post-ideeën die passen bij deze brand.
- Elk idee heeft: een kort onderwerp (topic), een pakkende openingszin (hook), een categoryId uit de lijst, een funnelStage, en een korte rationale (waarom dit idee werkt voor JW nu).

OUTPUT — alleen valide JSON, geen markdown, geen uitleg:
{ "ideas": [ { "topic": "...", "hook": "...", "categoryId": "...", "funnelStage": "tofu", "rationale": "..." } ] }`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      temperature: 0.9,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: 'Geef 4-5 post-ideeën als JSON.',
        },
      ],
    })

    const usage = summarizeUsage(response, 'post-ideeën')

    const text = response.content[0]
    let ideas: PostIdea[] = []
    if (text.type === 'text') {
      try {
        const cleaned = text.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleaned) as { ideas?: unknown }
        if (Array.isArray(parsed.ideas)) {
          ideas = parsed.ideas
            .map((raw) => normalizeIdea(raw, brand, funnelFilter, categoryFilter?.id))
            .filter((idea): idea is PostIdea => idea !== null)
        }
      } catch {
        console.error('Failed to parse post ideas:', text.text)
      }
    }

    if (ideas.length === 0) {
      return NextResponse.json(
        { error: 'Kon geen ideeën genereren, probeer opnieuw' },
        { status: 502 }
      )
    }

    return NextResponse.json({ ideas, usage })
  } catch (error) {
    console.error('Post ideas error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

/**
 * Valideert en normaliseert één door het model voorgesteld idee: categoryId moet
 * bij de brand horen (anders eerste categorie), funnelStage moet geldig zijn.
 * Honoreert de optionele filters. Geeft null terug bij onbruikbare velden.
 */
function normalizeIdea(
  raw: unknown,
  brand: BrandConfig,
  funnelFilter: FunnelStage | undefined,
  categoryFilter: string | undefined
): PostIdea | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>

  const topic = typeof r.topic === 'string' ? r.topic.trim() : ''
  const hook = typeof r.hook === 'string' ? r.hook.trim() : ''
  const rationale = typeof r.rationale === 'string' ? r.rationale.trim() : ''
  if (!topic || !hook) return null

  const rawCategory = typeof r.categoryId === 'string' ? r.categoryId : ''
  const categoryId =
    categoryFilter ||
    (brand.categories.some((c) => c.id === rawCategory) ? rawCategory : brand.categories[0].id)

  const rawFunnel = r.funnelStage
  const funnelStage: FunnelStage =
    funnelFilter ||
    (VALID_FUNNELS.includes(rawFunnel as FunnelStage) ? (rawFunnel as FunnelStage) : 'tofu')

  return { topic, hook, categoryId, funnelStage, rationale }
}

/** Mock-ideeën zonder API-key, zodat de wizard lokaal volledig te testen is. */
function mockIdeas(
  brand: BrandConfig,
  funnelFilter: FunnelStage | undefined,
  categoryFilter: string | undefined
): PostIdea[] {
  const categories = categoryFilter
    ? brand.categories.filter((c) => c.id === categoryFilter)
    : brand.categories
  const funnels: FunnelStage[] = funnelFilter ? [funnelFilter] : ['tofu', 'mofu', 'bofu']

  return categories.slice(0, 4).map((c, i) => ({
    topic: `[Mock] ${c.label}-idee voor ${brand.label}`,
    hook: `[Mock] Een pakkende opening rond ${c.promptLabel}.`,
    categoryId: c.id,
    funnelStage: funnels[i % funnels.length],
    rationale: `[Mock] Past bij ${brand.label} en sluit aan op de categorie ${c.label}.`,
  }))
}
