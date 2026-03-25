import { NextResponse } from 'next/server'
import { getAuditById } from '@/lib/audit-store'
import { supabase } from '@/lib/supabase'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  const audit = await getAuditById(id)

  if (!audit) {
    return NextResponse.json({ error: 'Audit niet gevonden.' }, { status: 404 })
  }

  // Check TTL
  if (audit.report_expires_at && new Date(audit.report_expires_at) < new Date()) {
    return NextResponse.json({ error: 'Rapport is verlopen en verwijderd.' }, { status: 410 })
  }

  // Verify access via verification code or token
  if (token !== audit.verification_code) {
    return NextResponse.json({ error: 'Ongeldige toegangscode.' }, { status: 403 })
  }

  if (!audit.report_path) {
    return NextResponse.json({ error: 'Rapport is nog niet beschikbaar.' }, { status: 404 })
  }

  // Generate signed download URL
  const { data, error } = await supabase.storage
    .from('audit-reports')
    .createSignedUrl(audit.report_path, 3600) // 1 hour validity

  if (error || !data) {
    return NextResponse.json({ error: 'Kan rapport niet ophalen.' }, { status: 500 })
  }

  // Redirect to signed URL
  return NextResponse.redirect(data.signedUrl)
}
