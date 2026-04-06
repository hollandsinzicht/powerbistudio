import { ImageResponse } from 'next/og'
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

export async function generateBlogImage(params: {
  title: string
  slug: string
  excerpt: string
}): Promise<string | null> {
  try {
    const bgColor = getColorForArticle(params.title, params.slug, params.excerpt)
    const categories = getCategoriesForArticle(params.title, params.slug, params.excerpt)
    const categoryLabel = categories[0]?.name || 'Power BI Studio'

    // Genereer PNG via next/og (Vercel's ImageResponse)
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            backgroundColor: bgColor,
            padding: '80px',
            position: 'relative',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Top: category label */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.65)',
                letterSpacing: 4,
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              {categoryLabel}
            </div>
            <div
              style={{
                width: 50,
                height: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                borderRadius: 2,
              }}
            />
          </div>

          {/* Middle: title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.15,
              maxWidth: '90%',
              display: 'flex',
            }}
          >
            {params.title}
          </div>

          {/* Bottom: branding */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              paddingTop: 24,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: 'white',
              }}
            >
              PowerBIStudio.nl
            </div>
            <div
              style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              Jan Willem den Hollander
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )

    // Convert ImageResponse to ArrayBuffer voor upload
    const pngBuffer = await imageResponse.arrayBuffer()

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

    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  } catch (error) {
    console.error('Failed to generate blog image:', error)
    return null
  }
}
