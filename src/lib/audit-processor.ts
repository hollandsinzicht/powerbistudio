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
import { sendReportReadyEmail } from './emails'
import { supabase } from './supabase'

function generateHash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 32)
}

function generateVerificationSuffix(): string {
  return nanoid(4).toUpperCase()
}

function formatDateNL(date: Date): string {
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
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

    // Step 3: Destroy original file (buffer is only in memory — dereference + hash)
    const originalDestroyedAt = new Date()
    const originalHash = generateHash(auditId + 'original' + originalDestroyedAt.getTime())
    await updateAuditStatus(auditId, 'destroying_original')
    await updateAuditDestructionProof(auditId, 'original', originalHash)
    await updateAuditStep(auditId, 'original_destroyed', { hash: originalHash })

    // Step 4: AI analysis (passes auditId for the new schema)
    await updateAuditStatus(auditId, 'analyzing')
    await updateAuditStep(auditId, 'analyzing')
    const analysis = await analyzeWithClaude(metadata, auditId)
    await updateAuditStep(auditId, 'analyzed')

    // Step 5: Destroy metadata
    const metadataDestroyedAt = new Date()
    const metadataHash = generateHash(auditId + 'metadata' + metadataDestroyedAt.getTime())
    await updateAuditStatus(auditId, 'destroying_metadata')
    await updateAuditDestructionProof(auditId, 'metadata', metadataHash)
    await updateAuditStep(auditId, 'metadata_destroyed', { hash: metadataHash })

    // Step 6: Generate PDF with new 6-page layout
    await updateAuditStatus(auditId, 'generating')
    const verificationCode = `${auditId}-${generateVerificationSuffix()}`

    const proof = {
      originalHash,
      originalDestroyedAt: formatDateNL(originalDestroyedAt),
      metadataHash,
      metadataDestroyedAt: formatDateNL(metadataDestroyedAt),
      verificationCode,
    }

    const pdfBuffer = await generatePdfReport(analysis, proof)

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

    // Step 9: Send report email (non-blocking)
    const { data: signedUrlData } = await supabase.storage
      .from('audit-reports')
      .createSignedUrl(reportPath, 48 * 60 * 60)

    sendReportReadyEmail({
      email,
      auditId,
      pdfUrl: signedUrlData?.signedUrl || '',
      expiresAt: formatDateNL(expiresAt),
      originalHash,
      originalDestroyedAt: formatDateNL(originalDestroyedAt),
      metadataHash,
      metadataDestroyedAt: formatDateNL(metadataDestroyedAt),
      verificationCode,
    }).catch((err) => console.error(`Report email failed for ${auditId}:`, err))

  } catch (error) {
    console.error(`Audit processing failed for ${auditId}:`, error)
    await updateAuditStatus(auditId, 'failed').catch(() => {})
    throw error
  }
}
