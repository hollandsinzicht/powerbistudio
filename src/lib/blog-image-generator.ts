import { Resvg } from '@resvg/resvg-js'
import { getCategoriesForArticle } from './soro'
import { supabase } from './supabase'

// Categorie → achtergrondkleur mapping
const CATEGORY_COLOR_MAP: Record<string, string> = {
  'power-bi': '#1E3A5F',
  'dax-datamodellering': '#1E3A5F',
  'data-platform': '#D85A30',
  'fabric-migratie': '#D85A30',
  'governance-avg': '#534AB7',
  'embedded-analytics': '#534AB7',
  'procesverbetering-bi': '#B8963E',
  'strategie': '#1E3A5F',
}

const DEFAULT_COLOR = '#1E3A5F'

function getColorForArticle(title: string, slug: string, excerpt: string): string {
  const categories = getCategoriesForArticle(title, slug, excerpt)
  if (categories.length === 0) return DEFAULT_COLOR
  return CATEGORY_COLOR_MAP[categories[0].slug] || DEFAULT_COLOR
}

function wrapTitle(title: string, maxCharsPerLine: number): string[] {
  const words = title.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if (currentLine.length + word.length + 1 > maxCharsPerLine && currentLine.length > 0) {
      lines.push(currentLine.trim())
      currentLine = word
    } else {
      currentLine += (currentLine ? ' ' : '') + word
    }
  }
  if (currentLine) lines.push(currentLine.trim())

  return lines.slice(0, 4) // max 4 regels
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function generateSvg(title: string, bgColor: string, categoryLabel: string): string {
  const lines = wrapTitle(title, 35)
  const lineHeight = 52
  const startY = 260 - ((lines.length - 1) * lineHeight) / 2

  const titleLines = lines
    .map((line, i) => `<text x="80" y="${startY + i * lineHeight}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="40" font-weight="700" fill="white">${escapeXml(line)}</text>`)
    .join('\n    ')

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${bgColor}" />

  <!-- Subtle pattern overlay -->
  <rect width="1200" height="630" fill="url(#grain)" opacity="0.05" />
  <defs>
    <pattern id="grain" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="1" height="1" fill="white" opacity="0.3" />
    </pattern>
  </defs>

  <!-- Category label -->
  <text x="80" y="120" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="14" font-weight="600" fill="white" opacity="0.7" letter-spacing="3">${escapeXml(categoryLabel.toUpperCase())}</text>

  <!-- Title -->
  ${titleLines}

  <!-- Bottom bar -->
  <rect x="0" y="560" width="1200" height="70" fill="rgba(0,0,0,0.2)" />
  <text x="80" y="602" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="16" font-weight="500" fill="white" opacity="0.8">PowerBIStudio.nl</text>
  <text x="1120" y="602" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="14" fill="white" opacity="0.5" text-anchor="end">Jan Willem den Hollander</text>
</svg>`
}

export async function generateBlogImage(params: {
  title: string
  slug: string
  excerpt: string
}): Promise<string | null> {
  try {
    const bgColor = getColorForArticle(params.title, params.slug, params.excerpt)
    const categories = getCategoriesForArticle(params.title, params.slug, params.excerpt)
    const categoryLabel = categories[0]?.name || 'Power BI Studio'

    const svg = generateSvg(params.title, bgColor, categoryLabel)

    // SVG → PNG via resvg
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
    })
    const pngData = resvg.render()
    const pngBuffer = pngData.asPng()

    // Upload naar Supabase Storage
    const fileName = `blog/${params.slug}-${Date.now()}.png`

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(fileName, pngBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000',
        upsert: true,
      })

    if (uploadError) {
      console.error('Failed to upload blog image:', uploadError.message)
      return null
    }

    // Haal publieke URL op
    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  } catch (error) {
    console.error('Failed to generate blog image:', error)
    return null
  }
}
