import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getPostById, updatePost } from '@/lib/blog-store'
import { supabase } from '@/lib/supabase'

// Multipart-uploads zijn klein; geen 5min nodig zoals bij AI-routes.
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const BUCKET = 'blog-images'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

function checkAuth(req: Request): boolean {
  const auth = req.headers.get('x-admin-token')
  return auth === ADMIN_PASSWORD
}

// Zelfde set paden als in src/app/api/admin/blog/route.ts:13
function revalidateBlog(slug?: string) {
  revalidatePath('/blog')
  revalidatePath('/sitemap.xml')
  if (slug) revalidatePath(`/blog/${slug}`)
  ;[
    'power-bi',
    'dax-datamodellering',
    'data-platform',
    'strategie',
    'fabric-migratie',
    'governance-avg',
    'embedded-analytics',
    'procesverbetering-bi',
  ].forEach((cat) => {
    revalidatePath(`/blog/categorie/${cat}`)
  })
}

/**
 * Detecteert of een gegeven public-image-URL afkomstig is uit onze eigen
 * Supabase-bucket. Returnt het storage-pad (zonder bucketnaam) of null.
 *
 * Public Supabase URL: {NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
 */
function extractBucketPath(url: string, bucket: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!projectUrl) return null
  let projectHost: string
  try {
    projectHost = new URL(projectUrl).host
  } catch {
    return null
  }
  if (parsed.host !== projectHost) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = parsed.pathname.indexOf(marker)
  if (idx === -1) return null
  const tail = parsed.pathname.slice(idx + marker.length)
  if (!tail) return null
  try {
    return decodeURIComponent(tail)
  } catch {
    return tail
  }
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const form = await req.formData()
    const id = form.get('id')
    const file = form.get('file')

    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'Post id is verplicht.' }, { status: 400 })
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Geen bestand ontvangen.' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Bestand is te groot (max 10MB).' }, { status: 400 })
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: 'Alleen JPG, PNG of WEBP zijn toegestaan.' },
        { status: 400 },
      )
    }

    const post = await getPostById(id)
    if (!post) {
      return NextResponse.json({ error: 'Post niet gevonden.' }, { status: 404 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = EXT_BY_MIME[file.type]
    const fileName = `manual/${post.id}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload-image storage error:', uploadError.message)
      return NextResponse.json(
        { error: 'Bestand kon niet worden opgeslagen.' },
        { status: 500 },
      )
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
    const publicUrl = publicData.publicUrl

    const oldImage = post.image
    await updatePost(id, { image: publicUrl })

    // Best-effort cleanup van de oude file. Falen is geen request-error.
    if (oldImage) {
      const oldPath = extractBucketPath(oldImage, BUCKET)
      if (oldPath && oldPath !== fileName) {
        try {
          const { error: removeError } = await supabase.storage
            .from(BUCKET)
            .remove([oldPath])
          if (removeError) {
            console.error('Upload-image old-file cleanup error:', removeError.message)
          }
        } catch (err) {
          console.error('Upload-image old-file cleanup threw:', err)
        }
      }
    }

    revalidateBlog(post.slug)

    return NextResponse.json({ success: true, imageUrl: publicUrl })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Upload-image error:', msg, error)
    return NextResponse.json({ error: `Upload fout: ${msg}` }, { status: 500 })
  }
}
