import { NextResponse } from 'next/server'
import { getAuditStatus } from '@/lib/audit-store'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const status = await getAuditStatus(id)

  if (!status) {
    return NextResponse.json({ error: 'Audit niet gevonden.' }, { status: 404 })
  }

  return NextResponse.json(status)
}
