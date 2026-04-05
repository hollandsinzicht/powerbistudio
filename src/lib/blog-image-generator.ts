import { getCategoriesForArticle } from './soro'
import { supabase } from './supabase'

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
  return lines.slice(0, 4)
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function generateSvg(title: string, bgColor: string, categoryLabel: string): string {
  const lines = wrapTitle(title, 35)
  const lineHeight = 52
  const startY = 280 - ((lines.length - 1) * lineHeight) / 2

  const titleLines = lines
    .map((line, i) =>
      `<text x="80" y="${startY + i * lineHeight}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="42" font-weight="700" fill="white">${escapeXml(line)}</text>`
    )
    .join('\n    ')

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${bgColor}" />
  <rect x="80" y="105" width="40" height="3" fill="white" opacity="0.4" rx="1.5" />
  <text x="80" y="90" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="white" opacity="0.6" letter-spacing="3">${escapeXml(categoryLabel.toUpperCase())}</text>
  ${titleLines}
  <rect x="0" y="560" width="1200" height="70" fill="rgba(0,0,0,0.15)" />
  <text x="80" y="602" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="white" opacity="0.9">PowerBIStudio.nl</text>
  <text x="1120" y="602" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="white" opacity="0.5" text-anchor="end">Jan Willem den Hollander</text>
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
    const svgBuffer = new TextEncoder().encode(svg)

    const fileName = `blog/${params.slug}-${Date.now()}.svg`

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(fileName, svgBuffer, {
        contentType: 'image/svg+xml',
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
