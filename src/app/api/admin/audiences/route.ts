import { NextResponse } from 'next/server'
import {
  ensureSeedAudiences,
  listAudiences,
  createAudience,
  updateAudience,
  deleteAudience,
  getAudienceByKey,
} from '@/lib/audience-store'
import { isValidStyle, slugifyAudienceKey } from '@/lib/audiences'

export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD /* fail-closed: geen 'admin'-fallback */

function checkAuth(req: Request): boolean {
  return req.headers.get('x-admin-token') === ADMIN_PASSWORD
}

// Lijst alle doelgroepen (seed bij eerste keer).
export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureSeedAudiences()
    const audiences = await listAudiences()
    return NextResponse.json({ audiences })
  } catch (error) {
    console.error('Audiences list error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action } = body as { action?: string }

    if (action === 'create') {
      const { label, beschrijving, guide, style, sortOrder } = body as {
        label?: string
        beschrijving?: string
        guide?: string
        style?: string
        sortOrder?: number
      }
      if (!label?.trim() || !guide?.trim()) {
        return NextResponse.json({ error: 'Label en invalshoek-gids zijn verplicht' }, { status: 400 })
      }
      const safeStyle = isValidStyle(style) ? style : 'educatief'

      // Genereer een unieke key uit het label; los botsingen op met een suffix.
      const base = slugifyAudienceKey(label) || 'doelgroep'
      let key = base
      let n = 2
      while (await getAudienceByKey(key)) {
        key = `${base}-${n++}`
      }

      const id = await createAudience({
        key,
        label: label.trim(),
        beschrijving: beschrijving?.trim() || '',
        guide: guide.trim(),
        style: safeStyle,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      })
      return NextResponse.json({ success: true, id, key })
    }

    if (action === 'update') {
      const { id, label, beschrijving, guide, style, sortOrder } = body as {
        id?: string
        label?: string
        beschrijving?: string
        guide?: string
        style?: string
        sortOrder?: number
      }
      if (!id) return NextResponse.json({ error: 'id is verplicht' }, { status: 400 })
      if (style !== undefined && !isValidStyle(style)) {
        return NextResponse.json({ error: 'Ongeldige stijl' }, { status: 400 })
      }
      await updateAudience(id, {
        ...(label !== undefined ? { label: label.trim() } : {}),
        ...(beschrijving !== undefined ? { beschrijving: beschrijving.trim() } : {}),
        ...(guide !== undefined ? { guide: guide.trim() } : {}),
        ...(style !== undefined ? { style } : {}),
        ...(sortOrder !== undefined ? { sortOrder } : {}),
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'delete') {
      const { id } = body as { id?: string }
      if (!id) return NextResponse.json({ error: 'id is verplicht' }, { status: 400 })
      await deleteAudience(id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 })
  } catch (error) {
    console.error('Audiences route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
