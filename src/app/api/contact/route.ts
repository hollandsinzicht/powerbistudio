import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { name, email, company, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Naam, e-mail en bericht zijn verplicht.' },
                { status: 400 }
            );
        }

        // Send email via Resend (or fallback to logging)
        if (process.env.RESEND_API_KEY) {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'PowerBIStudio <noreply@powerbistudio.nl>',
                    to: ['info@powerbistudio.nl'],
                    reply_to: email,
                    subject: `Nieuw contactformulier: ${name}${company ? ` (${company})` : ''}`,
                    html: `
                        <h2>Nieuw bericht via PowerBIStudio.nl</h2>
                        <p><strong>Naam:</strong> ${name}</p>
                        <p><strong>E-mail:</strong> ${email}</p>
                        ${company ? `<p><strong>Organisatie:</strong> ${company}</p>` : ''}
                        <hr />
                        <p>${message.replace(/\n/g, '<br />')}</p>
                    `,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('Resend error:', errorData);
                return NextResponse.json(
                    { error: 'Er ging iets mis bij het versturen.' },
                    { status: 500 }
                );
            }
        } else {
            // Fallback: log to console (useful for dev / when Resend isn't configured yet)
            console.log('=== CONTACT FORM SUBMISSION ===');
            console.log(`Name: ${name}`);
            console.log(`Email: ${email}`);
            console.log(`Company: ${company || 'N/A'}`);
            console.log(`Message: ${message}`);
            console.log('================================');
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
