import { NextResponse } from 'next/server';
import { createLead, getLeadByEmail } from '@/lib/lead-store';
import { sendLeadConfirmationEmail, sendCalculatorResultEmail, upsertBrevoContact } from '@/lib/emails';
import type { LeadVertical, LeadSource } from '@/lib/lead-store';

const VALID_VERTICALS: LeadVertical[] = ['beslissers', 'publieke-sector', 'isv', 'vakgenoot'];
const VALID_SOURCES: LeadSource[] = ['calculator', 'checklist', 'architectuurgids', 'dax-fouten', 'contact'];

const RESOURCE_TITLES: Record<string, string> = {
  checklist: 'Publieke Sector BI-Checklist',
  architectuurgids: 'ISV Architectuurgids — 5 beslissingen vóór dag 1',
  'dax-fouten': '10 meest voorkomende DAX-fouten in productie-modellen',
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, company, vertical, source, downloadUrl, metadata } = body;

    // Validate
    if (!email || !vertical || !source) {
      return NextResponse.json({ error: 'Email, vertical en source zijn verplicht.' }, { status: 400 });
    }
    if (!VALID_VERTICALS.includes(vertical)) {
      return NextResponse.json({ error: 'Ongeldige vertical.' }, { status: 400 });
    }
    if (!VALID_SOURCES.includes(source)) {
      return NextResponse.json({ error: 'Ongeldige source.' }, { status: 400 });
    }

    // Sync naar Brevo contacten (non-blocking, parallel met de rest)
    // Dit zorgt dat het contact in Brevo verschijnt en in de juiste lijst komt
    const brevoSyncPromise = upsertBrevoContact({
      email,
      name,
      company,
      vertical,
      source,
      metadata,
    });

    // Dedup — if lead exists, don't create a new one
    const existing = await getLeadByEmail(email);
    if (existing) {
      // Still send the confirmation email for the download
      if (source !== 'calculator' && downloadUrl) {
        await sendLeadConfirmationEmail({
          email,
          name,
          downloadUrl,
          resourceTitle: RESOURCE_TITLES[source] || source,
        });
      }
      await brevoSyncPromise;
      return NextResponse.json({ success: true, leadId: existing.id, existing: true });
    }

    // Create lead
    const leadId = await createLead({
      email,
      name,
      company,
      vertical,
      source,
      metadata: metadata || {},
    });

    // Send appropriate confirmation email
    if (source === 'calculator' && metadata?.monthlyCost) {
      await sendCalculatorResultEmail({
        email,
        name,
        monthlyCost: metadata.monthlyCost as number,
        recommendation: metadata.recommendation as string || 'Neem contact op voor een procesverbeterings-intake.',
      });
    } else {
      await sendLeadConfirmationEmail({
        email,
        name,
        downloadUrl,
        resourceTitle: RESOURCE_TITLES[source] || source,
      });
    }

    // Wacht op de Brevo sync (was parallel gestart, dus minimal latency)
    await brevoSyncPromise;

    return NextResponse.json({ success: true, leadId });
  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 });
  }
}
