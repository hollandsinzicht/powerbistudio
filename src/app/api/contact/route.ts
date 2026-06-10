import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emails';
import { escapeHtml, checkRateLimit } from '@/lib/security';

const CONTACT_TO = process.env.CONTACT_TO_EMAIL || 'info@powerbistudio.nl';

const TYPE_LABELS: Record<string, string> = {
    'quick-scan': 'HR Analytics Quick Scan',
    foundation: 'HR Analytics Foundation',
    hosting: 'DashPortal HR (hosting)',
    verkennend: 'Verkennend gesprek',
    anders: 'Iets anders',
};

export async function POST(req: Request) {
    try {
        // Throttle: max 5 inzendingen per IP per minuut (best-effort).
        const limit = checkRateLimit(req, 'contact', 5, 60_000);
        if (!limit.ok) {
            return NextResponse.json(
                { error: 'Te veel verzoeken. Probeer het zo opnieuw.' },
                { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
            );
        }

        const { name, email, company, type, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Naam, e-mail en bericht zijn verplicht.' },
                { status: 400 }
            );
        }

        const typeLabel = type ? TYPE_LABELS[type] || type : null;
        // Onderwerp wordt als platte tekst verstuurd; naam/bedrijf hoeven niet
        // ge-escaped (geen HTML-context), maar we houden ze wel beknopt.
        const subject = `Nieuw contactformulier: ${name}${company ? ` (${company})` : ''}${typeLabel ? ` — ${typeLabel}` : ''}`;

        // Alle gebruikersinvoer HTML-escapen vóór interpolatie in de mail —
        // anders kan een bezoeker HTML/script in de mailbox injecteren.
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeCompany = escapeHtml(company);
        const safeTypeLabel = escapeHtml(typeLabel);
        const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

        const html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
                <h2 style="color: #1E3A5F;">Nieuw bericht via PowerBIStudio.nl</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr><td style="padding: 6px 0; color: #6B7280; width: 120px;">Naam:</td><td style="padding: 6px 0;"><strong>${safeName}</strong></td></tr>
                    <tr><td style="padding: 6px 0; color: #6B7280;">E-mail:</td><td style="padding: 6px 0;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
                    ${company ? `<tr><td style="padding: 6px 0; color: #6B7280;">Organisatie:</td><td style="padding: 6px 0;">${safeCompany}</td></tr>` : ''}
                    ${typeLabel ? `<tr><td style="padding: 6px 0; color: #6B7280;">Onderwerp:</td><td style="padding: 6px 0;">${safeTypeLabel}</td></tr>` : ''}
                </table>
                <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
                <p style="white-space: pre-wrap;">${safeMessage}</p>
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
