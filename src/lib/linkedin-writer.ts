import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export type LinkedInStyle = 'educatief' | 'scherp' | 'provocatief' | 'storytelling'

export interface LinkedInPostInput {
  title: string
  excerpt: string
  content: string
  slug: string
  style: LinkedInStyle
  extraContext?: string
}

export interface GeneratedLinkedInPost {
  postText: string
  hashtags: string[]
}

const SITE_CONTEXT = `
Jan Willem den Hollander is Power BI architect met 15 jaar ervaring, Lean Six Sigma Black Belt. Hij werkt(e) voor o.a. GGDGHOR, Lyreco, Technische Unie en Vattenfall. Hij schrijft op PowerBIStudio.nl over Power BI, DAX, Microsoft Fabric, datamodellering, governance en BI strategie.
`.trim()

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

export async function generateLinkedInPost(input: LinkedInPostInput): Promise<GeneratedLinkedInPost> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockPost(input)
  }

  const blogUrl = `https://www.powerbistudio.nl/blog/${input.slug}`

  // Strip HTML uit content voor schone context, max 2000 chars
  const cleanContent = input.content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000)

  const systemPrompt = `Je schrijft LinkedIn posts in het Nederlands voor Jan Willem den Hollander, op basis van een blogartikel dat hij heeft gepubliceerd.

ALGEMENE REGELS — STRIKT NALEVEN:
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
- Samengesteld met merknaam: koppelteken (Power BI-rapport, Fabric-migratie, DAX-formule)

STRUCTUUR:
- Hook (eerste 2-3 zinnen)
- Body (2-4 korte alinea's)
- Lege regel
- Link naar het artikel: "${blogUrl}"
- (de hashtags worden los teruggegeven, NIET in postText opnemen)

CONTEXT OVER DE PERSOON:
${SITE_CONTEXT}

${STYLE_GUIDE[input.style]}

OUTPUT — alleen valide JSON, geen markdown fences, geen uitleg eromheen:
{
  "postText": "De volledige LinkedIn post inclusief witregels, eindigend met een lege regel + de link naar het artikel",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
}

De hashtags:
- 3 tot 4 stuks
- Direct relevant voor het blogonderwerp
- Mix van breed (#PowerBI, #DataAnalytics) en specifiek (#FabricMigration, #DAX)
- Zonder spaties, CamelCase indien meerdere woorden (bv. #PowerBI niet #powerbi)`

  const userMessage = `Blogartikel:

Titel: ${input.title}

Samenvatting: ${input.excerpt}

URL: ${blogUrl}

Inhoud (eerste 2000 tekens):
${cleanContent}

${input.extraContext ? `\nEXTRA CONTEXT van Jan Willem (verwerk dit in de post — dit is zijn persoonlijke invalshoek):\n${input.extraContext}\n` : ''}

Schrijf nu een LinkedIn post in de gevraagde stijl. Output alleen de JSON.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    temperature: 0.9,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = response.content[0]
  if (text.type !== 'text') return getMockPost(input)

  try {
    const cleaned = text.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned) as GeneratedLinkedInPost
    return {
      postText: parsed.postText || '',
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    }
  } catch {
    console.error('Failed to parse LinkedIn post response:', text.text)
    return getMockPost(input)
  }
}

function getMockPost(input: LinkedInPostInput): GeneratedLinkedInPost {
  return {
    postText: `[Mock LinkedIn post — ANTHROPIC_API_KEY niet ingesteld]\n\nNieuw artikel: ${input.title}\n\n${input.excerpt}\n\nhttps://www.powerbistudio.nl/blog/${input.slug}`,
    hashtags: ['#PowerBI', '#DataAnalytics', '#BI'],
  }
}
