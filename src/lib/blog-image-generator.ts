import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { getCategoriesForArticle } from './soro'
import { supabase } from './supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Categorie → kleur hint voor de illustratie
const CATEGORY_COLOR_HINTS: Record<string, string> = {
  'power-bi': 'navy blue and warm gold accents',
  'dax-datamodellering': 'navy blue and warm gold accents',
  'data-platform': 'warm orange and coral tones with cream background',
  'fabric-migratie': 'warm orange and coral tones with cream background',
  'governance-avg': 'deep teal and forest green tones',
  'embedded-analytics': 'deep purple and lavender tones',
  'procesverbetering-bi': 'warm gold and bronze tones',
  'strategie': 'navy blue and warm gold accents',
}

const DEFAULT_COLORS = 'navy blue and warm gold accents'

/**
 * Stap 1: Vraag Claude om een specifieke visuele scene-beschrijving
 * te bedenken op basis van de blogcontent (titel + excerpt).
 * Geen generieke "windmill + laptop + cartoon people" meer.
 */
async function generateSceneDescription(title: string, excerpt: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    // Fallback: simpele scene afgeleid van titel
    return `A visual concept representing: ${title}`
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: `Je bent een art director voor blog header illustraties. Op basis van een blog titel en samenvatting bedenk je EEN specifieke, concrete visuele scene die het kernconcept van het artikel weergeeft.

REGELS:
- Beschrijf 1 specifieke scene in 2-4 zinnen, in het Engels
- Gebruik concrete visuele metaforen die bij het ONDERWERP passen — niet generiek
- Mention specific objects, charts, data visualizations, abstract shapes that represent the topic
- GEEN generieke elementen zoals: windmolens, mensen aan een laptop, kantoren, AI robots, tulpen
- WEL: schematische visualisaties van het concept (bv. voor "Fabric migratie": koppelingen tussen oude en nieuwe systemen; voor "DAX optimalisatie": een snelheidsmeter of vergelijking van DAX queries; voor "RLS": gescheiden data-lagen met sloten)
- Geen tekst in de scene
- Eén centraal visueel idee, geen overvolle scene
- Antwoord ALLEEN met de scene-beschrijving, geen uitleg eromheen`,
      messages: [{
        role: 'user',
        content: `Blog titel: "${title}"

Blog samenvatting: "${excerpt}"

Beschrijf de visuele scene voor de header illustratie.`,
      }],
    })

    const text = response.content[0]
    if (text.type === 'text') {
      return text.text.trim()
    }
    return `A visual concept representing: ${title}`
  } catch (err) {
    console.error('Scene description generation failed, using fallback:', err)
    return `A visual concept representing: ${title}`
  }
}

/**
 * Stap 2: Bouw de DALL-E prompt met de specifieke scene + consistente stijl.
 */
function buildImagePrompt(sceneDescription: string, colorHint: string): string {
  return `${sceneDescription}

Visual style requirements (apply consistently):
- Modern flat vector illustration in soft cartoon style
- Color palette: ${colorHint}, on a soft cream/off-white background
- Rounded shapes, gentle gradients, soft drop shadows
- Clean lines, professional but warm and approachable
- Similar to illustrations from Stripe, Notion, Figma, or Slack marketing pages
- NO text, NO letters, NO words in the image
- NO real people faces — only abstract figures or none at all
- NO windmills, NO tulips, NO traditional Dutch elements
- Centered composition with breathing room
- Wide landscape format optimized for blog header / OG image
- High quality vector art style`
}

export async function generateBlogImage(params: {
  title: string
  slug: string
  excerpt: string
}): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY niet ingesteld — image generation overgeslagen')
    return null
  }

  try {
    // Stap 1: Claude bedenkt een specifieke scene voor dit artikel
    const sceneDescription = await generateSceneDescription(params.title, params.excerpt)
    console.log(`[BLOG IMAGE] Scene voor "${params.title}":`, sceneDescription)

    // Stap 2: Bouw DALL-E prompt met scene + stijl
    const categories = getCategoriesForArticle(params.title, params.slug, params.excerpt)
    const colorHint = categories[0] ? CATEGORY_COLOR_HINTS[categories[0].slug] || DEFAULT_COLORS : DEFAULT_COLORS
    const prompt = buildImagePrompt(sceneDescription, colorHint)

    // Stap 3: DALL-E 3 genereert de afbeelding
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: '1792x1024', // Landscape, dichtst bij OG image ratio
      quality: 'standard',
      n: 1,
      response_format: 'b64_json',
    })

    const imageData = response.data?.[0]?.b64_json
    if (!imageData) {
      console.error('DALL-E gaf geen image data terug')
      return null
    }

    // Base64 → Buffer voor upload
    const imageBuffer = Buffer.from(imageData, 'base64')

    const fileName = `blog/${params.slug}-${Date.now()}.png`

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000',
        upsert: true,
      })

    if (uploadError) {
      console.error('Failed to upload blog image:', uploadError.message)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  } catch (error) {
    console.error('Failed to generate blog image:', error)
    return null
  }
}
