import Anthropic from '@anthropic-ai/sdk'
import { type BrandContext } from './brand-context'
import {
  BRANDS,
  DEFAULT_BRAND_ID,
  getBrandCategory,
  type BrandConfig,
} from './brands'

// Default-persona voor paden zonder expliciete brand (bv. blogposts): die zijn
// altijd Power BI Studio. Brand-bewuste paden zetten de persona via brandContext.
const FALLBACK_PERSONA = BRANDS[DEFAULT_BRAND_ID].fallbackPersona

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export type LinkedInStyle = 'educatief' | 'scherp' | 'provocatief' | 'storytelling'

export type FunnelStage = 'tofu' | 'mofu' | 'bofu'

// Categorie-id (vrije string). Welke ids geldig zijn, hangt af van de gekozen
// brand en wordt gevalideerd via BrandConfig.categories (zie brands.ts).
export type PostCategory = string

export interface InterviewTurn {
  vraag: string
  antwoord: string
}

export interface RecentPostSummary {
  category: string | null
  funnel_stage: string | null
  post_text: string
}

export interface PostFromInterviewInput {
  brand: BrandConfig
  funnelStage: FunnelStage
  categoryId: string
  topic: string
  style?: LinkedInStyle
  interview: InterviewTurn[]
  brandContext: BrandContext
  recentPosts: RecentPostSummary[]
}

// Funnel-gidsen en categorie-gidsen + standaardstijlen zijn verhuisd naar
// brands.ts (per brand). Lees ze via BrandConfig.funnelGuide en
// BrandConfig.categories (zie brands.ts).

/** Standaardstijl voor een categorie binnen een brand; valt terug op 'educatief'. */
export function defaultStyleForCategory(
  brand: BrandConfig,
  categoryId: string
): LinkedInStyle {
  return getBrandCategory(brand, categoryId)?.defaultStyle ?? 'educatief'
}

export interface LinkedInPostInput {
  title: string
  excerpt: string
  content: string
  slug: string
  style: LinkedInStyle
  extraContext?: string
  /** Door JW opgebouwd merkprofiel. Ontbreekt → FALLBACK_PERSONA wordt gebruikt. */
  brandContext?: BrandContext
}

export interface FreeLinkedInPostInput {
  topic: string
  angle?: string
  style: LinkedInStyle
  brandContext: BrandContext
}

export interface UsageInfo {
  inputTokens: number
  outputTokens: number
  costUsd: number
  costEur: number
}

export interface GeneratedLinkedInPost {
  postText: string
  hashtags: string[]
  /** Echte token-usage uit de Anthropic-response. Ontbreekt op het mock-pad. */
  usage?: UsageInfo
}

// Prijzen Claude Sonnet 4 (per 1M tokens). USD→EUR is een benadering.
const PRICE_INPUT_PER_MTOK_USD = 3
const PRICE_OUTPUT_PER_MTOK_USD = 15
const USD_TO_EUR = 0.92

/**
 * Leest de werkelijke token-usage uit de response, berekent de kosten en logt
 * één regel serverside. Geeft undefined op het mock-pad (geen usage beschikbaar).
 */
export function summarizeUsage(response: Anthropic.Message, label: string): UsageInfo | undefined {
  const inputTokens = response.usage?.input_tokens
  const outputTokens = response.usage?.output_tokens
  if (typeof inputTokens !== 'number' || typeof outputTokens !== 'number') {
    return undefined
  }

  const costUsd =
    (inputTokens / 1_000_000) * PRICE_INPUT_PER_MTOK_USD +
    (outputTokens / 1_000_000) * PRICE_OUTPUT_PER_MTOK_USD
  const costEur = costUsd * USD_TO_EUR

  console.log(
    `[linkedin-usage] ${label} · ${inputTokens} in / ${outputTokens} out · ≈ €${costEur.toFixed(4)}`
  )

  return { inputTokens, outputTokens, costUsd, costEur }
}

const STYLE_GUIDE: Record<LinkedInStyle, string> = {
  educatief: `STIJL: educatief.
Doel: de lezer iets concreets leren dat ze morgen kunnen toepassen.
- Begin met een observation of inzicht uit het artikel ("Wat ik vaak zie bij organisaties die...", "Het verschil tussen X en Y is dat...")
- Geef 3-4 takeaways in korte alinea's of streepjes (-)
- Eindig met "Voor wie dieper wil graven, ik schreef een uitgebreidere uitleg op de site."
- Toon: rustig, autoriteit, niet belerend`,

  scherp: `STIJL: scherp en direct.
Doel: een duidelijke mening neerzetten zonder omhaal.
- Korte zinnen. Soms één woord.
- Begin met een statement waar je achter staat ("De meeste BI-projecten falen niet aan de techniek." / "Stop met X. Begin met Y.")
- Geen "misschien", "wellicht", "het zou kunnen". Wel: directheid.
- Onderbouw met 2-3 concrete observaties
- Eindig kort, met de link naar het volledige verhaal`,

  provocatief: `STIJL: provocatief (maar onderbouwd).
Doel: een contrarian standpunt dat conventionele wijsheid uitdaagt.
- Open met een statement die tegen de stroom in gaat ("Iedereen praat over X. Maar X is niet waar het om gaat." / "Onpopulaire mening:")
- Onderbouw met 2-3 concrete redenen waarom de mainstream-aanpak tekortschiet
- Wees scherp, niet onaardig. Geen aanvallen op personen of bedrijven
- Eindig met een uitnodiging om de volledige redenering te lezen`,

  storytelling: `STIJL: storytelling.
Doel: trek de lezer een mini-verhaal in en eindig met de les.
- Begin met een concrete situatie of moment ("Vorige week zat ik bij een klant die...", "Een paar jaar geleden maakte ik een fout die me veel heeft geleerd:")
- Bouw spanning op met 2-3 korte alinea's
- Wees concreet: namen van rollen, getallen, situaties (geen exacte klantnamen tenzij publiek)
- Eindig met de les of het inzicht — niet met een moraal-uitleg, maar met een observatie
- Verwijs naar het artikel als de "lange versie" of "het hele verhaal"`,
}

// Generieke schrijfregels die voor elke post gelden (los van persoon/stijl).
const BASE_RULES = `ALGEMENE REGELS — STRIKT NALEVEN:
- Schrijf in de ik-vorm of je-vorm. Persoonlijk, niet corporate.
- LEES JE TEKST HARDOP. Klinkt het als hoe Jan Willem met een collega praat? Zo niet → herschrijven.
- VERMIJD AI-TAAL ABSOLUUT:
  - GEEN "in deze post bespreek ik"
  - GEEN "ontdek hoe", "duik in", "alles wat je moet weten"
  - GEEN "een unieke gids", "een complete handleiding"
  - GEEN "leer hoe je", "in dit artikel"
  - GEEN clichés zoals "in een wereld waar...", "het kantelpunt", "the next level"
  - GEEN overdreven enthousiasme, geen "geweldig", "fantastisch", "super interessant"
- Geen excessieve emojis. Maximum 1-2 op natuurlijke plekken — of liever helemaal geen.
- Korte zinnen wisselen af met langere. Geen monotone ritme.
- Witregels tussen alinea's voor leesbaarheid (LinkedIn-stijl).
- Eerste 2-3 zinnen MOETEN een sterke hook zijn — die zijn zichtbaar voor de "...meer" knop.
- Lengte: 800-1300 tekens postText (zonder hashtags). Niet langer dan 1500.

HOOFDLETTERS — STRIKT:
- Hoofdletters ALLEEN bij:
  1. Het begin van een zin
  2. Eigennamen van personen (Jan Willem den Hollander)
  3. Productnamen en merken (Power BI, Microsoft Fabric, DAX, Excel, Azure, Copilot, DashPortal)
  4. Plaats- en organisatienamen
- GEEN hoofdletters bij algemene begrippen midden in een zin:
  - FOUT: "Een goed Datamodel is de basis"
  - GOED: "Een goed datamodel is de basis"
  - FOUT: "Tijdens de Fabric Migratie"
  - GOED: "Tijdens de Fabric-migratie"
- GEEN Title Case in welk onderdeel dan ook
- Samengesteld met merknaam: koppelteken (Power BI-rapport, Fabric-migratie, DAX-formule)`

const OUTPUT_RULES = `OUTPUT — alleen valide JSON, geen markdown fences, geen uitleg eromheen:
{
  "postText": "De volledige LinkedIn post inclusief witregels",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
}

De hashtags:
- 3 tot 4 stuks
- Direct relevant voor het onderwerp
- Mix van breed (#PowerBI, #DataAnalytics) en specifiek (#HRAnalytics, #Verzuim)
- Zonder spaties, CamelCase indien meerdere woorden (bv. #PowerBI niet #powerbi)
- NIET in postText opnemen`

const INTEGRITY_RULE = `INTEGRITEIT — ABSOLUUT:
- Verzin GEEN cijfers, klantnamen, resultaten of personen.
- Gebruik alleen feiten uit de meegegeven context. Twijfel je? Laat het weg.`

/**
 * Bouwt het systeem-prompt op uit het merkprofiel. JW's eigen ingevulde
 * stijl/kaders/boodschap winnen van de generieke defaults; ontbreken ze, dan
 * vallen we terug op de STYLE_GUIDE + FALLBACK_PERSONA.
 */
function buildSystemPrompt(opts: {
  brandContext?: BrandContext
  style: LinkedInStyle
  structuur: string
  /** Extra sturing (bv. funnel- en categorie-richtlijnen), na de STYLE_GUIDE. */
  extraGuides?: string[]
}): string {
  const { brandContext, style, structuur, extraGuides } = opts
  const persona = brandContext?.persona?.trim() || FALLBACK_PERSONA

  const sections: string[] = [
    `Je schrijft LinkedIn posts in het Nederlands voor Jan Willem den Hollander.`,
    `WIE IS JAN WILLEM (persona):\n${persona}`,
  ]

  if (brandContext?.doelgroep?.trim()) {
    sections.push(`DOELGROEP — voor wie schrijf je:\n${brandContext.doelgroep.trim()}`)
  }

  if (brandContext?.boodschap?.trim()) {
    sections.push(`KERNBOODSCHAP — moet doorklinken:\n${brandContext.boodschap.trim()}`)
  }

  sections.push(STYLE_GUIDE[style])

  if (extraGuides) {
    for (const guide of extraGuides) {
      if (guide?.trim()) sections.push(guide.trim())
    }
  }

  if (brandContext?.schrijfstijl?.trim()) {
    sections.push(
      `SCHRIJFSTIJL VAN JAN WILLEM (dit wint van de generieke stijlregels hierboven):\n${brandContext.schrijfstijl.trim()}`
    )
  }

  sections.push(BASE_RULES)

  if (brandContext?.kaders?.trim()) {
    sections.push(`KADERS — STRIKT NALEVEN:\n${brandContext.kaders.trim()}`)
  }

  sections.push(INTEGRITY_RULE)
  sections.push(`STRUCTUUR:\n${structuur}`)
  sections.push(OUTPUT_RULES)

  return sections.join('\n\n')
}

export async function generateLinkedInPost(input: LinkedInPostInput): Promise<GeneratedLinkedInPost> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockPost(input.title, input.excerpt, input.slug)
  }

  const blogUrl = `https://www.powerbistudio.nl/blog/${input.slug}`

  // Strip HTML uit content voor schone context, max 2000 chars
  const cleanContent = input.content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000)

  const structuur = `- Hook (eerste 2-3 zinnen)
- Body (2-4 korte alinea's)
- Lege regel
- Link naar het artikel: "${blogUrl}"`

  const systemPrompt = buildSystemPrompt({
    brandContext: input.brandContext,
    style: input.style,
    structuur,
  })

  const userMessage = `Blogartikel:

Titel: ${input.title}

Samenvatting: ${input.excerpt}

URL: ${blogUrl}

Inhoud (eerste 2000 tekens):
${cleanContent}

${input.extraContext ? `\nEXTRA CONTEXT van Jan Willem (verwerk dit in de post — dit is zijn persoonlijke invalshoek):\n${input.extraContext}\n` : ''}

Schrijf nu een LinkedIn post in de gevraagde stijl. Output alleen de JSON.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    temperature: 0.9,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const usage = summarizeUsage(response, 'blog-post')
  return { ...parseResponse(response, () => getMockPost(input.title, input.excerpt, input.slug)), usage }
}

/**
 * Vrije-post generator: schrijft een LinkedIn post vanuit het merkprofiel op
 * basis van een onderwerp + invalshoek, zonder dat er een blogartikel nodig is.
 */
export async function generateFreeLinkedInPost(
  input: FreeLinkedInPostInput
): Promise<GeneratedLinkedInPost> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockFreePost(input.topic)
  }

  const ctaBlock = input.brandContext.assets?.trim()
    ? `- Sluit eventueel af met een passende call-to-action uit deze assets (alleen als het natuurlijk past):\n${input.brandContext.assets.trim()}`
    : `- Geen verzonnen links of CTA's toevoegen.`

  const structuur = `- Hook (eerste 2-3 zinnen)
- Body (2-4 korte alinea's)
- Lege regel
${ctaBlock}
- GEEN verwijzing naar een blogartikel of artikel-URL (deze post staat los van een blog).`

  const systemPrompt = buildSystemPrompt({
    brandContext: input.brandContext,
    style: input.style,
    structuur,
  })

  const userMessage = `Schrijf een vrije LinkedIn post (niet gebaseerd op een blogartikel).

Onderwerp: ${input.topic}
${input.angle ? `\nInvalshoek: ${input.angle}` : ''}

Schrijf de post in de gevraagde stijl, vanuit het merkprofiel. Output alleen de JSON.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    temperature: 0.9,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const usage = summarizeUsage(response, 'free-post')
  return { ...parseResponse(response, () => getMockFreePost(input.topic)), usage }
}

/** Vat de recente posts samen als anti-herhaling-context voor de prompt. */
function summarizeRecentPosts(recentPosts: RecentPostSummary[]): string {
  if (recentPosts.length === 0) return ''

  const lines = recentPosts.map((p, i) => {
    const label = [p.funnel_stage, p.category].filter(Boolean).join('/') || 'onbekend'
    const snippet = p.post_text.replace(/\s+/g, ' ').trim().slice(0, 200)
    return `${i + 1}. [${label}] ${snippet}…`
  })

  return `RECENTE POSTS (sluit hierop aan, herhaal niet letterlijk — kies een verse invalshoek):
${lines.join('\n')}`
}

/**
 * Genereert een LinkedIn post uit een kort adaptief vraaggesprek. Stuurt op
 * funnel-fase + categorie en krijgt de recente posts mee zodat de reeks logisch
 * doorloopt en zichzelf niet herhaalt.
 */
export async function generatePostFromInterview(
  input: PostFromInterviewInput
): Promise<GeneratedLinkedInPost> {
  const category = getBrandCategory(input.brand, input.categoryId)
  const style = input.style ?? category?.defaultStyle ?? 'educatief'

  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockFreePost(input.topic)
  }

  const ctaBlock = input.brandContext.assets?.trim()
    ? `- Sluit eventueel af met een passende call-to-action uit deze assets (alleen als het natuurlijk past):\n${input.brandContext.assets.trim()}`
    : `- Geen verzonnen links of CTA's toevoegen.`

  const structuur = `- Hook (eerste 2-3 zinnen)
- Body (2-4 korte alinea's), gevoed door het vraaggesprek hieronder
- Lege regel
${ctaBlock}
- GEEN verwijzing naar een blogartikel of artikel-URL (deze post staat los van een blog).`

  const systemPrompt = buildSystemPrompt({
    brandContext: input.brandContext,
    style,
    structuur,
    extraGuides: [input.brand.funnelGuide[input.funnelStage], category?.guide ?? ''],
  })

  const interviewBlock = input.interview
    .map((turn, i) => `V${i + 1}: ${turn.vraag}\nA${i + 1}: ${turn.antwoord}`)
    .join('\n\n')

  const recentBlock = summarizeRecentPosts(input.recentPosts)

  const userMessage = `Schrijf een vrije LinkedIn post op basis van een kort vraaggesprek.

Onderwerp: ${input.topic}

VRAAGGESPREK (de antwoorden van Jan Willem — dit is de inhoudelijke bron, verwerk het in zijn woorden):
${interviewBlock}
${recentBlock ? `\n${recentBlock}\n` : ''}
Schrijf de post in de gevraagde stijl, vanuit het merkprofiel, passend bij de funnel-fase en categorie. Output alleen de JSON.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    temperature: 0.9,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const usage = summarizeUsage(response, 'post-interview')
  return { ...parseResponse(response, () => getMockFreePost(input.topic)), usage }
}

function parseResponse(
  response: Anthropic.Message,
  fallback: () => GeneratedLinkedInPost
): GeneratedLinkedInPost {
  const text = response.content[0]
  if (text.type !== 'text') return fallback()

  try {
    const cleaned = text.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned) as GeneratedLinkedInPost
    return {
      postText: parsed.postText || '',
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    }
  } catch {
    console.error('Failed to parse LinkedIn post response:', text.text)
    return fallback()
  }
}

function getMockPost(title: string, excerpt: string, slug: string): GeneratedLinkedInPost {
  return {
    postText: `[Mock LinkedIn post — ANTHROPIC_API_KEY niet ingesteld]\n\nNieuw artikel: ${title}\n\n${excerpt}\n\nhttps://www.powerbistudio.nl/blog/${slug}`,
    hashtags: ['#PowerBI', '#DataAnalytics', '#HRAnalytics'],
  }
}

function getMockFreePost(topic: string): GeneratedLinkedInPost {
  return {
    postText: `[Mock LinkedIn post — ANTHROPIC_API_KEY niet ingesteld]\n\nOnderwerp: ${topic}\n\nHier zou een vrije LinkedIn post staan, geschreven vanuit het merkprofiel.`,
    hashtags: ['#PowerBI', '#DataAnalytics', '#HRAnalytics'],
  }
}
