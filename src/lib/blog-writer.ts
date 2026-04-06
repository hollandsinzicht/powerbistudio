import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

const SITE_CONTEXT = `
PowerBIStudio.nl is de website van Jan Willem den Hollander — Power BI architect, Lean Six Sigma Black Belt, met 15 jaar ervaring.

Diensten: Power BI voor SaaS/ISV, Publieke sector BI, Fabric migratie, Copilot readiness, Procesverbetering.
Producten: DashPortal (white-label Power BI portaal), Report Auditor (AI-audit €49), DAX Formula Assistant (gratis).
Doelgroepen: ISV/SaaS CTOs, CFO/COO/operations, publieke sector (gemeenten, GGDs), Power BI consultants.
Cases: GGDGHOR (25 GGD-regio's + RIVM), Lyreco (finance dashboards Benelux), Technische Unie (groothandel), Vattenfall (energie).

Bestaande blogcategorieën: Power BI, DAX & Datamodellering, Data Platform, Strategie, Fabric & migratie, Governance & AVG, Embedded analytics, Procesverbetering & BI.
`.trim()

// ===== BLOG IDEAS =====

export interface BlogIdeaResult {
  title: string
  keywords: string[]
  rationale: string
  target_audience: string
}

export async function generateBlogIdeas(
  existingTitles: string[],
  seedKeywords?: string
): Promise<BlogIdeaResult[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockIdeas()
  }

  const trimmedSeed = seedKeywords?.trim() || ''
  const hasSeed = trimmedSeed.length > 0

  // Random seed voor variatie (zelfde keyword → andere suggesties bij volgende call)
  const variationSeed = Math.random().toString(36).slice(2, 10)

  // Bouw user message
  // Als er seed keywords zijn: maak die DOMINANT en eis dat ALLE 5 suggesties erover gaan
  let userContent: string

  if (hasSeed) {
    userContent = `BELANGRIJKSTE INSTRUCTIE: Ik wil 5 blogideeën die SPECIFIEK gaan over deze keywords/thema's:

"${trimmedSeed}"

ALLE 5 voorgestelde blogonderwerpen MOETEN direct over deze keywords gaan. Geen algemene Power BI onderwerpen — alleen onderwerpen die deze specifieke keywords behandelen, uitleggen, of er omheen draaien.

Variatie binnen het thema:
- Verschillende invalshoeken (technisch, strategisch, praktisch, vergelijkend, hoe-werkt-het)
- Verschillende formats (gids, vergelijking, case study, tutorial, FAQ)
- Verschillende doelgroepen waar van toepassing

Voorbeeld: als de keywords "fabric kosten" zijn, dan zou je suggesties kunnen geven zoals:
- "Wat kost Microsoft Fabric écht? Een kostenoverzicht voor 2026"
- "Fabric F2 vs F64: welke capaciteit past bij jouw budget"
- "Van Power BI Premium naar Fabric: de kostenimpact in 5 scenario's"
- "Hoe je Fabric capacity kosten verlaagt zonder performance te verliezen"
- "Fabric pricing voor mid-market: het volledige plaatje"

Context over de site (alleen voor stijl en doelgroep — NIET om af te wijken van de keywords):
${SITE_CONTEXT}

Bestaande artikelen die je niet mag dupliceren:
${existingTitles.map((t) => `- ${t}`).join('\n')}

Geef NU 5 blogonderwerpen die ALLEMAAL over "${trimmedSeed}" gaan. Variatie-seed: ${variationSeed}

Antwoord als JSON array (geen markdown, geen uitleg, alleen JSON):
[{
  "title": "Artikel titel (Nederlands, max 70 tekens, MOET de keywords reflecteren)",
  "keywords": ["specifieke keyword 1", "specifieke keyword 2", "specifieke keyword 3"],
  "rationale": "Waarom dit onderwerp aansluit op de gevraagde keywords en welk zoekverkeer het aantrekt",
  "target_audience": "De primaire doelgroep"
}]`
  } else {
    userContent = `Stel 5 nieuwe blogonderwerpen voor die zoekverkeer aantrekken voor PowerBIStudio.nl.

Context:
${SITE_CONTEXT}

Bestaande artikelen (voorkom overlap):
${existingTitles.map((t) => `- ${t}`).join('\n')}

Variatie-seed: ${variationSeed}

Antwoord als JSON array (geen markdown, geen uitleg, alleen JSON):
[{
  "title": "Artikel titel (Nederlands, max 70 tekens)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "rationale": "Waarom dit onderwerp relevant is en welk zoekverkeer het aantrekt",
  "target_audience": "De primaire doelgroep"
}]`
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    temperature: 1,
    system: `Je bent een SEO content strategist voor PowerBIStudio.nl. Je belangrijkste taak: blogonderwerpen voorstellen die EXACT aansluiten op de instructies van de gebruiker.

CRITICAL: Als de gebruiker specifieke keywords of thema's opgeeft, MOETEN ALLE voorgestelde onderwerpen daarover gaan. Wijk NOOIT af van de opgegeven keywords. Geen algemene Power BI suggesties als de gebruiker iets specifieks vraagt.

Antwoord ALTIJD in valid JSON. Geen markdown fences, geen uitleg buiten de JSON.`,
    messages: [{ role: 'user', content: userContent }],
  })

  const text = response.content[0]
  if (text.type !== 'text') return getMockIdeas()

  try {
    const cleaned = text.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    console.error('Failed to parse blog ideas response:', text.text)
    return getMockIdeas()
  }
}

// ===== BLOG POST GENERATION =====

export interface GeneratedPost {
  title: string
  slug: string
  excerpt: string
  content: string
  seoTitle: string
  seoDescription: string
}

export async function generateBlogPost(params: {
  title: string
  keywords: string[]
  targetAudience?: string
  existingPostSlugs?: { slug: string; title: string }[]
}): Promise<GeneratedPost> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockPost(params.title)
  }

  // Bouw interne link-context op
  const internalLinksContext = params.existingPostSlugs?.length
    ? `\n\nBeschikbare interne links naar andere blogartikelen (gebruik er minstens 2-3 waar relevant):
${params.existingPostSlugs.map((p) => `- <a href="/blog/${p.slug}">${p.title}</a>`).join('\n')}

Beschikbare pagina-links:
- <a href="/tools/report-auditor">Power BI Report Auditor</a> (AI-audit van datamodellen)
- <a href="/tools/dax-assistant">DAX Formula Assistant</a> (DAX in gewone taal)
- <a href="/tools/readiness-scan">Power BI Readiness Scan</a> (volwassenheidscheck)
- <a href="/tools/bi-kosten-calculator">BI-Kosten Calculator</a> (bereken kosten slechte data)
- <a href="/fabric-migratie">Fabric migratie</a> (Fabric QuickScan)
- <a href="/procesverbetering">Procesverbetering</a> (Lean Six Sigma + BI)
- <a href="/saas">Power BI voor SaaS</a> (embedded analytics)
- <a href="/publieke-sector">Publieke sector BI</a> (gemeenten, GGD's)
- <a href="/dashportal">DashPortal</a> (white-label Power BI portaal)
- <a href="/copilot-readiness">Copilot readiness</a> (semantic model audit)`
    : ''

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: `Je schrijft uitgebreide, informatieve bloggidsen voor PowerBIStudio.nl — de website van Jan Willem den Hollander, Power BI architect.

TOON & STIJL:
- Schrijf als een kennisautoriteit, niet als verkoper. De lezer komt voor informatie, niet voor een pitch.
- Informatief en uitgebreid: geef de lezer echt iets om van te leren. Denk aan een gids die iemand bookmarkt.
- Derde persoon of "je/jij" vorm — NIET overdreven in de ik-vorm. Eerste persoon alleen bij concrete eigen ervaringen ("Bij het GGDGHOR-project bleek dat...").
- Professioneel maar menselijk, geen corporate-speak, geen buzzwords zonder uitleg.
- Leg vakjargon uit bij eerste gebruik.
- GEEN sales-taal, GEEN CTA's in de tekst, GEEN "neem contact op", GEEN "wij bieden". De lezer beslist zelf.

STRUCTUUR:
- Begin met een korte inleiding die de lezer direct vertelt wat ze gaan leren (2-3 zinnen).
- Gebruik duidelijke H2-koppen voor hoofdsecties (minimaal 4-5 secties).
- Gebruik H3-koppen voor subsecties waar nodig.
- Gebruik paragrafen van 3-5 zinnen. Niet langer.
- Gebruik opsommingslijsten voor stappen, kenmerken of vergelijkingen.
- Gebruik <strong> voor belangrijke begrippen bij eerste introductie.
- Voeg waar relevant een concreet voorbeeld, scenario of vergelijking toe.
- Sluit af met een "Samenvatting" of "Conclusie" sectie (H2) met de belangrijkste takeaways.

LENGTE:
- Minimaal 1500 woorden, liefst 2000-2500. Dit zijn uitgebreide gidsen, geen korte blogjes.

INTERNE LINKS:
- Plaats 2-4 relevante interne links in de tekst als gewone <a href="...">anchor tekst</a> tags.
- Links moeten natuurlijk in de context passen — niet geforceerd.
- Link naar relevante andere blogartikelen EN naar relevante pagina's/tools.

GEEN:
- Geen H1 tag (die wordt apart gerenderd)
- Geen <html>, <body>, <head> tags
- Geen "Lees meer op..." of "Bekijk onze dienst..." CTA's in de tekst
- Geen overdreven opsommingen van eigen producten
- Geen "wij" of "ons team" taal

Output formaat: valid JSON (geen markdown fences):
{
  "title": "De definitieve titel",
  "slug": "url-vriendelijke-slug",
  "excerpt": "Samenvatting in 1-2 zinnen (max 160 tekens)",
  "content": "<h2>...</h2><p>...</p>...",
  "seoTitle": "SEO titel (max 60 tekens) | PowerBIStudio.nl",
  "seoDescription": "Meta description (max 155 tekens)"
}

De content moet valide HTML zijn met <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <a> tags.`,
    messages: [{
      role: 'user',
      content: `Schrijf een uitgebreide informatieve gids over: "${params.title}"

Keywords om te verwerken: ${params.keywords.join(', ')}
${params.targetAudience ? `Primaire doelgroep: ${params.targetAudience}` : ''}
${internalLinksContext}

Context over de site: ${SITE_CONTEXT}`,
    }],
  })

  const text = response.content[0]
  if (text.type !== 'text') return getMockPost(params.title)

  try {
    const cleaned = text.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    console.error('Failed to parse blog post response:', text.text)
    return getMockPost(params.title)
  }
}

// ===== INTERNE LINKS UPDATEN IN BESTAANDE POSTS =====

export async function suggestInternalLinks(params: {
  postTitle: string
  postContent: string
  newPostSlug: string
  newPostTitle: string
}): Promise<{ elementToFind: string; replacement: string }[]> {
  if (!process.env.ANTHROPIC_API_KEY) return []

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: `Je zoekt in een bestaand blogartikel naar woorden of korte woordgroepen die je kunt omzetten naar een link. Je taak is UITSLUITEND om een <a> tag om BESTAANDE woorden te plaatsen.

STRIKTE REGELS:
1. Je mag GEEN tekst toevoegen, verwijderen of herschrijven. Alleen een <a> tag om bestaande woorden plaatsen.
2. De "elementToFind" moet een EXACT stuk tekst zijn dat letterlijk in de content voorkomt.
3. De "replacement" is EXACT dezelfde tekst, maar met een <a href="..."> tag om het relevante woord of de relevante woordgroep.
4. Maximaal 2 suggesties per artikel.
5. Als er geen woord of term in het artikel staat dat direct gerelateerd is aan het nieuwe artikel, return een lege array [].
6. Link NIET als het woord al in een <a> tag staat.
7. De omringende zin mag NIET veranderen — alleen de anchor tag wordt toegevoegd.

GOED voorbeeld:
elementToFind: "Een goed datamodel is de basis van elke rapportage"
replacement: "Een goed <a href=\\"/blog/datamodel-ontwerpen\\">datamodel</a> is de basis van elke rapportage"

FOUT voorbeeld (voegt tekst toe — VERBODEN):
elementToFind: "Een goed datamodel is de basis"
replacement: "Een goed datamodel is de basis. Lees meer over datamodellen in onze gids."

Antwoord als JSON array. Geen uitleg, alleen JSON:
[{ "elementToFind": "...", "replacement": "..." }]`,
    messages: [{
      role: 'user',
      content: `Bestaand artikel: "${params.postTitle}"

Content:
${params.postContent.slice(0, 4000)}

Nieuw artikel om naar te linken:
- Titel: "${params.newPostTitle}"
- URL: /blog/${params.newPostSlug}

Zoek woorden in het bestaande artikel die je kunt linken naar dit nieuwe artikel.`,
    }],
  })

  const text = response.content[0]
  if (text.type !== 'text') return []

  try {
    const cleaned = text.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    const suggestions = JSON.parse(cleaned) as { elementToFind: string; replacement: string }[]

    // Validatie: controleer dat de replacement geen tekst toevoegt, alleen een <a> tag
    return suggestions.filter((s) => {
      const findClean = s.elementToFind.replace(/<[^>]*>/g, '').trim()
      const replaceClean = s.replacement.replace(/<[^>]*>/g, '').trim()
      // De tekst zonder HTML tags moet identiek zijn
      return findClean === replaceClean
    })
  } catch {
    return []
  }
}

// ===== MOCKS =====

function getMockIdeas(): BlogIdeaResult[] {
  return [
    { title: 'Fabric migratie: de 5 grootste fouten die organisaties maken', keywords: ['fabric', 'migratie', 'fouten'], rationale: 'Hoog zoekvolume, directe link naar Fabric QuickScan dienst', target_audience: 'Data team lead' },
    { title: 'DAX performance: waarom je CALCULATE verkeerd gebruikt', keywords: ['dax', 'performance', 'calculate'], rationale: 'Technisch artikel dat DAX Assistant en Report Auditor promoot', target_audience: 'Power BI consultant' },
    { title: 'Power BI governance voor gemeenten: een praktische gids', keywords: ['governance', 'gemeente', 'power bi'], rationale: 'Publieke sector keyword, linkt naar BI-checklist lead magnet', target_audience: 'gemeente/GGD' },
  ]
}

function getMockPost(title: string): GeneratedPost {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return {
    title,
    slug,
    excerpt: `Dit is een concept-artikel over ${title}. Bewerk de content in de admin.`,
    content: `<h2>Over dit onderwerp</h2><p>Dit is een automatisch gegenereerd concept. Bewerk het in de admin voordat je publiceert.</p>`,
    seoTitle: `${title} | PowerBIStudio.nl`,
    seoDescription: `Lees meer over ${title} op PowerBIStudio.nl.`,
  }
}
