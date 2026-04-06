import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emails';

const CONTACT_TO = process.env.CONTACT_TO_EMAIL || 'info@powerbistudio.nl';

const TYPE_LABELS: Record<string, string> = {
    interim: 'Interim opdracht',
    saas: 'Architectuurreview (ISV/SaaS)',
    fabric: 'Fabric migratie / QuickScan',
    copilot: 'Copilot Readiness Audit',
    'publieke-sector': 'Power BI voor zorg & overheid',
    dashportal: 'DashPortal',
    anders: 'Iets anders',
};

export async function POST(req: Request) {
    try {
        const { name, email, company, type, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Naam, e-mail en bericht zijn verplicht.' },
                { status: 400 }
            );
        }

        const typeLabel = type ? TYPE_LABELS[type] || type : null;
        const subject = `Nieuw contactformulier: ${name}${company ? ` (${company})` : ''}${typeLabel ? ` — ${typeLabel}` : ''}`;

        const html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
                <h2 style="color: #1E3A5F;">Nieuw bericht via PowerBIStudio.nl</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr><td style="padding: 6px 0; color: #6B7280; width: 120px;">Naam:</td><td style="padding: 6px 0;"><strong>${name}</strong></td></tr>
                    <tr><td style="padding: 6px 0; color: #6B7280;">E-mail:</td><td style="padding: 6px 0;"><a href="mailto:${email}">${email}</a></td></tr>
                    ${company ? `<tr><td style="padding: 6px 0; color: #6B7280;">Organisatie:</td><td style="padding: 6px 0;">${company}</td></tr>` : ''}
                    ${typeLabel ? `<tr><td style="padding: 6px 0; color: #6B7280;">Onderwerp:</td><td style="padding: 6px 0;">${typeLabel}</td></tr>` : ''}
                </table>
                <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
                <p style="white-space: pre-wrap;">${message.replace(/\n/g, '<br />')}</p>
            </div>
        `;

        try {
            await sendEmail(CONTACT_TO, subject, html, { replyTo: email });
        } catch (err) {
            console.error('Brevo send error:', err);
            return NextResponse.json(
                { error: 'Er ging iets mis bij het versturen.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Er ging iets mis bij het versturen.' },
            { status: 500 }
        );
    }
}
