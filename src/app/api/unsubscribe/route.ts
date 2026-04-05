import { NextResponse } from 'next/server';
import { unsubscribeLead } from '@/lib/lead-store';
import { createHmac } from 'crypto';

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || 'default-secret';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  if (!email || !token) {
    return new NextResponse(renderPage('Ongeldige link', 'Deze uitschrijflink is ongeldig.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Validate HMAC token
  const expectedToken = createHmac('sha256', UNSUBSCRIBE_SECRET).update(email).digest('hex');
  if (token !== expectedToken) {
    return new NextResponse(renderPage('Ongeldige link', 'Deze uitschrijflink is ongeldig of verlopen.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  try {
    await unsubscribeLead(email);
    return new NextResponse(
      renderPage(
        'Uitgeschreven',
        `Je bent uitgeschreven van de e-maillijst van PowerBIStudio.nl. Je ontvangt geen verdere e-mails meer.`
      ),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new NextResponse(renderPage('Er ging iets mis', 'Probeer het later opnieuw.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

function renderPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — PowerBIStudio.nl</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 100px auto; padding: 0 20px; color: #111827; text-align: center; }
    h1 { color: #1E3A5F; font-size: 24px; }
    p { color: #6B7280; line-height: 1.6; }
    a { color: #1E3A5F; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>${message}</p>
  <p style="margin-top: 40px;"><a href="https://www.powerbistudio.nl">← Terug naar PowerBIStudio.nl</a></p>
</body>
</html>`;
}
