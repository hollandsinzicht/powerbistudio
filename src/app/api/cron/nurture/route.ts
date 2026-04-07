import { NextResponse } from 'next/server';
import { getLeadsForNurture, getNextNurtureEmail, logNurtureEmail, markNurtureCompleted } from '@/lib/lead-store';
import { sendNurtureEmail } from '@/lib/emails';
import { NURTURE_SEQUENCES } from '@/lib/nurture-sequences';
import { createHmac } from 'crypto';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const CRON_SECRET = process.env.CRON_SECRET;
const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || 'default-secret';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://powerbistudio.nl';

function generateUnsubscribeUrl(email: string): string {
  const token = createHmac('sha256', UNSUBSCRIBE_SECRET).update(email).digest('hex');
  return `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

function isAuthorizedCron(req: Request): boolean {
  if (req.headers.get('x-vercel-cron')) return true;
  const authHeader = req.headers.get('authorization');
  if (CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) return true;
  if (!CRON_SECRET) return true;
  return false;
}

export async function GET(req: Request) {
  const hasVercelHeader = !!req.headers.get('x-vercel-cron');
  const hasAuthHeader = !!req.headers.get('authorization');
  console.log(`[NURTURE CRON] Triggered — vercel-cron:${hasVercelHeader} auth:${hasAuthHeader}`);

  if (!isAuthorizedCron(req)) {
    console.warn('[NURTURE CRON] Unauthorized — check CRON_SECRET env var');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const leads = await getLeadsForNurture();
    let sent = 0;
    let errors = 0;

    for (const lead of leads) {
      const nextSequenceNumber = lead.sent_count;
      const sequence = NURTURE_SEQUENCES[lead.vertical];

      if (!sequence) continue;

      // Check if sequence is complete
      if (nextSequenceNumber >= sequence.length) {
        await markNurtureCompleted(lead.lead_id);
        continue;
      }

      const emailDef = sequence[nextSequenceNumber];
      if (!emailDef) continue;

      // Check if enough days have passed
      const startedAt = new Date(lead.nurture_started_at);
      const sendAfter = new Date(startedAt.getTime() + emailDef.delayDays * 24 * 60 * 60 * 1000);
      const now = new Date();

      if (now < sendAfter) continue;

      // Get the nurture email record from DB
      const nurtureEmail = await getNextNurtureEmail(lead.vertical, nextSequenceNumber);
      if (!nurtureEmail) continue;

      try {
        const unsubscribeUrl = generateUnsubscribeUrl(lead.email);

        await sendNurtureEmail({
          email: lead.email,
          subject: emailDef.subject,
          bodyHtml: emailDef.bodyHtml,
          unsubscribeUrl,
        });

        await logNurtureEmail(lead.lead_id, nurtureEmail.id, 'sent');
        sent++;

        // Check if this was the last email
        if (nextSequenceNumber === sequence.length - 1) {
          await markNurtureCompleted(lead.lead_id);
        }
      } catch (err) {
        console.error(`Failed to send nurture email to ${lead.email}:`, err);
        await logNurtureEmail(lead.lead_id, nurtureEmail.id, 'failed', String(err));
        errors++;
      }
    }

    return NextResponse.json({
      processed: leads.length,
      sent,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Nurture cron error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
