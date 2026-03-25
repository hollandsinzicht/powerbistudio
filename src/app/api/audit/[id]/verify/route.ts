import { NextResponse } from 'next/server'
import { getAuditVerification } from '@/lib/audit-store'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const verification = await getAuditVerification(id)

  if (!verification) {
    return NextResponse.json({
      auditId: id,
      exists: false,
      status: 'not_found',
    })
  }

  return NextResponse.json(verification)
}
