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

export async function generateBlogIdeas(existingTitles: string[]): Promise<BlogIdeaResult[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockIdeas()
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: `Je bent een SEO content strategist voor PowerBIStudio.nl. Je taak is om blogonderwerpen voor te stellen die:
1. Relevant zijn voor de doelgroepen van de site
2. Zoekverkeer aantrekken (denk aan long-tail keywords in het Nederlands)
3. Niet overlappen met bestaande artikelen
4. Leiden naar een van de diensten of producten van de site
5. Passen bij de expertise van Jan Willem (Power BI, Lean Six Sigma, Fabric, embedded analytics)

Antwoord ALTIJD in valid JSON. Geen markdown, geen uitleg buiten de JSON.`,
    messages: [{
      role: 'user',
      content: `${SITE_CONTEXT}

Bestaande artikelen (voorkom overlap):
${existingTitles.map((t) => `- ${t}`).join('\n')}

Stel 5 nieuwe blogonderwerpen voor. Antwoord als JSON array:
[{
  "title": "Artikel titel (Nederlands, max 70 tekens)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "rationale": "Waarom dit onderwerp relevant is en welk zoekverkeer het aantrekt",
  "target_audience": "De primaire doelgroep (bijv. 'CFO/COO', 'ISV CTO', 'Power BI consultant', 'gemeente/GGD')"
}]`,
    }],
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
}): Promise<GeneratedPost> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockPost(params.title)
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: `Je bent Jan Willem den Hollander, Power BI architect en Lean Six Sigma Black Belt met 15 jaar ervaring. Schrijf een professioneel blogartikel in het Nederlands voor PowerBIStudio.nl.

Schrijfstijl:
- Professioneel maar toegankelijk, geen jargon zonder uitleg
- Concreet en praktisch, geen vage beloftes
- Gebruik H2 en H3 headings, paragrafen, en opsommingslijsten
- Eerste persoon waar gepast ("In mijn ervaring bij GGDGHOR...")
- Sluit af met een praktische conclusie
- Lengte: 800-1200 woorden

Output formaat: valid JSON (geen markdown fences):
{
  "title": "De definitieve titel",
  "slug": "url-vriendelijke-slug",
  "excerpt": "Samenvatting in 1-2 zinnen (max 160 tekens)",
  "content": "<h2>...</h2><p>...</p>...",
  "seoTitle": "SEO titel (max 60 tekens) | PowerBIStudio.nl",
  "seoDescription": "Meta description (max 155 tekens)"
}

De content moet valide HTML zijn met <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> tags. Geen <h1> (die wordt apart gerenderd). Geen <html>, <body> of <head> tags.`,
    messages: [{
      role: 'user',
      content: `Schrijf een blogartikel over: "${params.title}"

Keywords om te verwerken: ${params.keywords.join(', ')}
${params.targetAudience ? `Doelgroep: ${params.targetAudience}` : ''}

${SITE_CONTEXT}`,
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
