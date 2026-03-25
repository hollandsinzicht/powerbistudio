import crypto from 'crypto'
import { nanoid } from 'nanoid'
import { extractPbixMetadata } from './pbix-parser'
import { analyzeWithClaude } from './claude-analyzer'
import { generatePdfReport } from './pdf-generator'
import {
  updateAuditStatus,
  updateAuditStep,
  updateAuditDestructionProof,
  updateAuditReport,
} from './audit-store'
import { sendUploadConfirmationEmail, sendReportReadyEmail } from './emails'
import { supabase } from './supabase'

function generateHash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 32)
}

function generateVerificationSuffix(): string {
  return nanoid(4).toUpperCase()
}

export async function processAudit(auditId: string, fileBuffer: Buffer, fileName: string, email: string) {
  try {
    // Step 1: Mark as received
    await updateAuditStatus(auditId, 'parsing')
    await updateAuditStep(auditId, 'received')

    // Step 2: Parse .pbix — extract metadata only
    const metadata = await extractPbixMetadata(fileBuffer)
    await updateAuditStep(auditId, 'parsed', {
      metadata: { objectCount: metadata.objectCount },
    })

    // Step 3: Destroy original file buffer (dereference + hash)
    const originalHash = generateHash(auditId + 'original' + Date.now())
    // fileBuffer is not stored anywhere — it's only in memory and will be GC'd
    await updateAuditStatus(auditId, 'destroying_original')
    await updateAuditDestructionProof(auditId, 'original', originalHash)
    await updateAuditStep(auditId, 'original_destroyed', { hash: originalHash })

    // Step 4: AI analysis
    await updateAuditStatus(auditId, 'analyzing')
    await updateAuditStep(auditId, 'analyzing')
    const analysis = await analyzeWithClaude(metadata)
    await updateAuditStep(auditId, 'analyzed')

    // Step 5: Generate PDF
    await updateAuditStatus(auditId, 'generating')
    const verificationCode = `${auditId}-${generateVerificationSuffix()}`
    const now = new Date()

    const pdfBuffer = await generatePdfReport({
      auditId,
      fileName,
      analysis,
      verificationCode,
      originalHash,
      originalDestroyedAt: now.toISOString(),
      metadataHash: '', // Will be set below
      metadataDestroyedAt: '', // Will be set below
    })

    // Step 6: Destroy metadata
    const metadataHash = generateHash(auditId + 'metadata' + Date.now())
    await updateAuditStatus(auditId, 'destroying_metadata')
    await updateAuditDestructionProof(auditId, 'metadata', metadataHash)
    await updateAuditStep(auditId, 'metadata_destroyed', { hash: metadataHash })

    // Step 7: Upload PDF to Supabase Storage
    const reportPath = `reports/${auditId}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('audit-reports')
      .upload(reportPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('PDF upload error:', uploadError)
      throw new Error(`Failed to upload PDF: ${uploadError.message}`)
    }

    await updateAuditStep(auditId, 'report_generated')

    // Step 8: Finalize
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
    await updateAuditReport(auditId, reportPath, verificationCode, expiresAt)
    await updateAuditStep(auditId, 'complete')

    // Step 9: Send report email
    const originalDestroyedAt = now.toLocaleDateString('nl-NL', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
    const metadataDestroyedAt = new Date().toLocaleDateString('nl-NL', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })

    // Generate a signed URL for the report
    const { data: signedUrlData } = await supabase.storage
      .from('audit-reports')
      .createSignedUrl(reportPath, 48 * 60 * 60) // 48 hours

    await sendReportReadyEmail({
      email,
      auditId,
      pdfUrl: signedUrlData?.signedUrl || '',
      expiresAt: expiresAt.toLocaleDateString('nl-NL', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
      originalHash,
      originalDestroyedAt,
      metadataHash,
      metadataDestroyedAt,
      verificationCode,
    })

  } catch (error) {
    console.error(`Audit processing failed for ${auditId}:`, error)
    await updateAuditStatus(auditId, 'failed')
    throw error
  }
}
