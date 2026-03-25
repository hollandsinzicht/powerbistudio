import { supabase } from './supabase'
import type { AuditPlan, AuditStatus, AuditStep, AuditVerification } from './types/audit'

export async function createAudit(params: {
  id: string
  email: string
  fileName: string
  plan: AuditPlan
  stripeSessionId?: string
}) {
  const { error } = await supabase.from('audits').insert({
    id: params.id,
    email: params.email,
    file_name: params.fileName,
    plan: params.plan,
    stripe_session_id: params.stripeSessionId || null,
    status: 'pending',
  })
  if (error) throw new Error(`Failed to create audit: ${error.message}`)
}

export async function updateAuditStatus(auditId: string, status: string) {
  const { error } = await supabase
    .from('audits')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', auditId)
  if (error) throw new Error(`Failed to update audit status: ${error.message}`)
}

export async function updateAuditStep(
  auditId: string,
  stepKey: string,
  extra?: { hash?: string; metadata?: Record<string, unknown> }
) {
  const { error } = await supabase.from('audit_steps').insert({
    audit_id: auditId,
    step_key: stepKey,
    hash: extra?.hash || null,
    metadata: extra?.metadata || null,
  })
  if (error) throw new Error(`Failed to insert audit step: ${error.message}`)
}

export async function updateAuditDestructionProof(
  auditId: string,
  field: 'original' | 'metadata',
  hash: string
) {
  const update =
    field === 'original'
      ? { original_destroyed_at: new Date().toISOString(), original_hash: hash }
      : { metadata_destroyed_at: new Date().toISOString(), metadata_hash: hash }

  const { error } = await supabase
    .from('audits')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', auditId)
  if (error) throw new Error(`Failed to update destruction proof: ${error.message}`)
}

export async function updateAuditReport(
  auditId: string,
  reportPath: string,
  verificationCode: string,
  expiresAt: Date
) {
  const { error } = await supabase
    .from('audits')
    .update({
      report_path: reportPath,
      verification_code: verificationCode,
      report_expires_at: expiresAt.toISOString(),
      status: 'complete',
      updated_at: new Date().toISOString(),
    })
    .eq('id', auditId)
  if (error) throw new Error(`Failed to update audit report: ${error.message}`)
}

export async function getAuditStatus(auditId: string): Promise<AuditStatus | null> {
  const { data: audit, error: auditError } = await supabase
    .from('audits')
    .select('*')
    .eq('id', auditId)
    .single()

  if (auditError || !audit) return null

  const { data: stepRows } = await supabase
    .from('audit_steps')
    .select('*')
    .eq('audit_id', auditId)
    .order('timestamp', { ascending: true })

  const steps: AuditStep[] = (stepRows || []).map((row) => ({
    key: row.step_key,
    label: '',
    timestamp: row.timestamp,
    hash: row.hash || undefined,
    metadata: row.metadata || undefined,
  }))

  return {
    auditId: audit.id,
    fileName: audit.file_name,
    status: audit.status,
    steps,
    verificationCode: audit.verification_code || undefined,
    pdfUrl: audit.report_path || undefined,
    expiresAt: audit.report_expires_at ? new Date(audit.report_expires_at).getTime() : undefined,
  }
}

export async function getAuditVerification(auditId: string): Promise<AuditVerification | null> {
  const { data: audit, error } = await supabase
    .from('audits')
    .select('id, original_destroyed_at, original_hash, metadata_destroyed_at, metadata_hash, report_expires_at, status')
    .eq('id', auditId)
    .single()

  if (error || !audit) return null

  return {
    auditId: audit.id,
    exists: true,
    originalDestroyedAt: audit.original_destroyed_at || undefined,
    originalHash: audit.original_hash || undefined,
    metadataDestroyedAt: audit.metadata_destroyed_at || undefined,
    metadataHash: audit.metadata_hash || undefined,
    reportExpiredAt: audit.report_expires_at || undefined,
    status: audit.status === 'complete' ? 'complete_and_cleaned' : audit.status,
  }
}

export async function getAuditByIdAndEmail(auditId: string, email: string) {
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', auditId)
    .eq('email', email)
    .single()

  if (error || !data) return null
  return data
}

export async function getAuditById(auditId: string) {
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', auditId)
    .single()

  if (error || !data) return null
  return data
}

export async function markAuditExpired(auditId: string) {
  const { error } = await supabase
    .from('audits')
    .update({ status: 'expired', report_path: null, updated_at: new Date().toISOString() })
    .eq('id', auditId)
  if (error) throw new Error(`Failed to mark audit expired: ${error.message}`)
}
