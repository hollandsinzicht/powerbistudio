import { supabase } from './supabase'

export type LeadVertical = 'beslissers' | 'publieke-sector' | 'isv' | 'vakgenoot'
export type LeadSource = 'calculator' | 'checklist' | 'architectuurgids' | 'dax-fouten' | 'contact'

export async function createLead(params: {
  email: string
  name?: string
  company?: string
  vertical: LeadVertical
  source: LeadSource
  metadata?: Record<string, unknown>
}): Promise<string> {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      email: params.email,
      name: params.name || null,
      company: params.company || null,
      vertical: params.vertical,
      source: params.source,
      metadata: params.metadata || {},
      nurture_started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create lead: ${error.message}`)
  return data.id
}

export async function getLeadByEmail(email: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`Failed to get lead: ${error.message}`)
  return data
}

export async function getLeadsForNurture(): Promise<Array<{
  lead_id: string
  email: string
  vertical: LeadVertical
  nurture_started_at: string
  sent_count: number
}>> {
  // Get leads that have started nurture but haven't completed or unsubscribed
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, email, vertical, nurture_started_at')
    .not('nurture_started_at', 'is', null)
    .is('nurture_completed_at', null)
    .is('unsubscribed_at', null)

  if (error) throw new Error(`Failed to get leads for nurture: ${error.message}`)
  if (!leads || leads.length === 0) return []

  // For each lead, count how many nurture emails have been sent
  const result = []
  for (const lead of leads) {
    const { count, error: countError } = await supabase
      .from('nurture_log')
      .select('*', { count: 'exact', head: true })
      .eq('lead_id', lead.id)
      .eq('status', 'sent')

    if (countError) continue

    result.push({
      lead_id: lead.id,
      email: lead.email,
      vertical: lead.vertical as LeadVertical,
      nurture_started_at: lead.nurture_started_at,
      sent_count: count || 0,
    })
  }

  return result
}

export async function getNextNurtureEmail(vertical: LeadVertical, sequenceNumber: number) {
  const { data, error } = await supabase
    .from('nurture_emails')
    .select('*')
    .eq('vertical', vertical)
    .eq('sequence_number', sequenceNumber)
    .maybeSingle()

  if (error) throw new Error(`Failed to get nurture email: ${error.message}`)
  return data
}

export async function logNurtureEmail(
  leadId: string,
  nurtureEmailId: string,
  status: 'sent' | 'failed' = 'sent',
  errorMessage?: string
) {
  const { error } = await supabase.from('nurture_log').insert({
    lead_id: leadId,
    nurture_email_id: nurtureEmailId,
    status,
    error_message: errorMessage || null,
  })

  // Ignore unique constraint violations (idempotent)
  if (error && !error.message.includes('unique')) {
    throw new Error(`Failed to log nurture email: ${error.message}`)
  }
}

export async function markNurtureCompleted(leadId: string) {
  const { error } = await supabase
    .from('leads')
    .update({ nurture_completed_at: new Date().toISOString() })
    .eq('id', leadId)
  if (error) throw new Error(`Failed to mark nurture completed: ${error.message}`)
}

export async function unsubscribeLead(email: string) {
  const { error } = await supabase
    .from('leads')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('email', email)
    .is('unsubscribed_at', null)
  if (error) throw new Error(`Failed to unsubscribe lead: ${error.message}`)
}
