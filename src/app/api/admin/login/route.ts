import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, deriveSessionToken } from '@/lib/admin-session';
import { checkRateLimit } from '@/lib/security';

/**
 * Admin login/logout.
 *
 * POST {password} → valideert tegen ADMIN_PASSWORD en zet een httpOnly
 * sessie-cookie. De cookie bevat een SHA-256-afleiding, nooit het wachtwoord.
 * proxy.ts controleert deze cookie op elke /admin-request.
 *
 * DELETE → wist de cookie (uitloggen).
 */

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 dagen

export async function POST(req: Request) {
  // Strakke limiet: 5 pogingen per IP per minuut tegen brute force.
  const limit = checkRateLimit(req, 'admin-login', 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Te veel inlogpogingen. Probeer het zo opnieuw.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  const expected = process.env.ADMIN_PASSWORD;
  const sessionToken = await deriveSessionToken();
  if (!expected || !sessionToken) {
    // Fail-closed: zonder geconfigureerd wachtwoord kan niemand inloggen.
    return NextResponse.json(
      { error: 'Admin-login is niet geconfigureerd.' },
      { status: 503 }
    );
  }

  let password: unknown;
  try {
    ({ password } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Ongeldig verzoek.' }, { status: 400 });
  }

  if (typeof password !== 'string' || password !== expected) {
    return NextResponse.json({ error: 'Ongeldig wachtwoord.' }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
