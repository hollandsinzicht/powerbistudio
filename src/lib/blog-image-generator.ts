import OpenAI from 'openai'
import { getCategoriesForArticle } from './soro'
import { supabase } from './supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
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
 * Bouw een DALL-E 3 prompt voor een Soro-style illustratie.
 * Consistente stijl: friendly cartoon, warm colors, BI/data thema,
 * Nederlandse elementen waar passend.
 */
function buildImagePrompt(title: string, slug: string, excerpt: string): string {
  const categories = getCategoriesForArticle(title, slug, excerpt)
  const colorHint = categories[0] ? CATEGORY_COLOR_HINTS[categories[0].slug] || DEFAULT_COLORS : DEFAULT_COLORS

  return `A friendly modern flat vector illustration for a Dutch business intelligence blog header. The scene depicts the concept of "${title}".

Style requirements:
- Soft cartoon illustration style with rounded shapes and friendly characters
- Color palette: ${colorHint}, with a soft cream/off-white background
- Include a laptop or large screen showing a clean dashboard with charts, graphs, and data visualizations (bar charts, line graphs, pie charts in matching colors)
- Include 1-2 friendly cartoon professional people interacting with the technology — diverse, modern business casual attire
- Optional Dutch elements in the background: a small windmill, traditional Dutch row houses, or tulip silhouettes — subtle, not overwhelming
- Optional: a small friendly AI robot or chat bubble character to suggest AI-powered analytics
- Soft drop shadows, gentle gradients, modern flat design with rounded corners
- Professional but warm, inviting and approachable feeling
- NO text, NO letters, NO words in the image — only visual elements
- Centered composition with breathing room around the main subjects
- High quality clean vector art style similar to corporate illustrations from Stripe, Notion, Figma, or Slack marketing pages
- Wide landscape composition optimized for blog header / OG image use`
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
    const prompt = buildImagePrompt(params.title, params.slug, params.excerpt)

    // DALL-E 3 generatie
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
