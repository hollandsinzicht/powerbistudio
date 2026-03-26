import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { createAudit } from '@/lib/audit-store'
import { validatePbixFile } from '@/lib/pbix-parser'
import { sendUploadConfirmationEmail } from '@/lib/emails'
import { supabase } from '@/lib/supabase'
import type { AuditPlan } from '@/lib/types/audit'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const email = formData.get('email') as string | null
    const plan = (formData.get('plan') as AuditPlan) || 'single'

    // Validation
    if (!file) {
      return NextResponse.json({ error: 'Geen bestand ontvangen.' }, { status: 400 })
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Geldig e-mailadres is verplicht.' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Bestand is te groot (max 100MB).' }, { status: 400 })
    }
    if (!file.name.toLowerCase().endsWith('.pbix')) {
      return NextResponse.json({ error: 'Alleen .pbix bestanden zijn toegestaan.' }, { status: 400 })
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    // Validate it's actually a valid .pbix (ZIP with expected contents)
    const validationError = await validatePbixFile(fileBuffer)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // Generate audit ID
    const year = new Date().getFullYear()
    const randomPart = nanoid(4).replace(/[^a-zA-Z0-9]/g, '').substring(0, 4)
    const auditId = `AU-${year}-${randomPart}`

    // Store .pbix temporarily in Supabase Storage (encrypted at rest)
    // Will be deleted after processing
    const uploadPath = `uploads/${auditId}.pbix`
    const { error: storageError } = await supabase.storage
      .from('audit-reports')
      .upload(uploadPath, fileBuffer, {
        contentType: 'application/octet-stream',
        upsert: true,
      })

    if (storageError) {
      console.error('Storage upload error:', storageError)
      return NextResponse.json({ error: 'Bestand kon niet worden opgeslagen.' }, { status: 500 })
    }

    // Create audit record — status: pending_payment
    await createAudit({
      id: auditId,
      email,
      fileName: file.name,
      plan,
    })

    // Mark as pending_payment (Stripe must confirm before processing starts)
    await supabase
      .from('audits')
      .update({ status: 'pending_payment' })
      .eq('id', auditId)

    // Send confirmation email (non-blocking)
    sendUploadConfirmationEmail({
      email,
      auditId,
      fileName: file.name,
    }).catch((err) => console.error('Confirmation email failed:', err))

    return NextResponse.json({
      auditId,
      statusUrl: `/tools/report-auditor/status/${auditId}`,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Upload error:', msg, error)
    return NextResponse.json(
      { error: `Upload fout: ${msg}` },
      { status: 500 }
    )
  }
}
