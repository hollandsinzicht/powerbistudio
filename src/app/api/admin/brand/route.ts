import { NextResponse } from 'next/server'
import { BRAND_SCHEMA, kennispuntById } from '@/lib/brand-profile-schema'
import { getBrandAnswers, upsertBrandAnswer } from '@/lib/brand-profile-store'
import { getBrand } from '@/lib/brands'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD /* fail-closed: geen 'admin'-fallback */

function checkAuth(req: Request): boolean {
  return req.headers.get('x-admin-token') === ADMIN_PASSWORD
}

// Telt per categorie + totaal het percentage ingevulde kennispunten.
function computeProgress(answers: Record<string, string>) {
  const isFilled = (id: string) => Boolean(answers[id]?.trim())

  const perCategory: Record<string, { filled: number; total: number; pct: number }> = {}
  let totalFilled = 0
  let totalCount = 0

  for (const cat of BRAND_SCHEMA) {
    const ids = cat.subcategories.flatMap((sub) => sub.kennispunten.map((k) => k.id))
    const filled = ids.filter(isFilled).length
    perCategory[cat.id] = {
      filled,
      total: ids.length,
      pct: ids.length === 0 ? 0 : Math.round((filled / ids.length) * 100),
    }
    totalFilled += filled
    totalCount += ids.length
  }

  return {
    perCategory,
    total: {
      filled: totalFilled,
      total: totalCount,
      pct: totalCount === 0 ? 0 : Math.round((totalFilled / totalCount) * 100),
    },
  }
}

export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const brand = getBrand(new URL(req.url).searchParams.get('brand') || undefined).id
    const answers = await getBrandAnswers(brand)
    const progress = computeProgress(answers)

    return NextResponse.json({
      schema: BRAND_SCHEMA,
      answers,
      progress,
    })
  } catch (error) {
    console.error('Brand profile GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Er ging iets mis' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { key, value, brand: brandInput } = body as {
      key?: string
      value?: string
      brand?: string
    }

    if (!key || !kennispuntById(key)) {
      return NextResponse.json(
        { error: 'Onbekend of ontbrekend kennispunt (key)' },
        { status: 400 }
      )
    }

    const brand = getBrand(brandInput).id
    await upsertBrandAnswer(brand, key, typeof value === 'string' ? value : '')

    // Geef bijgewerkte voortgang terug zodat de UI direct kan updaten.
    const answers = await getBrandAnswers(brand)
    const progress = computeProgress(answers)

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    console.error('Brand profile PUT error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
