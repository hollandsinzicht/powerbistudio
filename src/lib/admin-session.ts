/**
 * Admin-sessie helpers — gedeeld tussen de login-API (Node) en proxy.ts (Edge).
 *
 * Het sessie-token is een SHA-256-afleiding van ADMIN_PASSWORD, zodat het
 * wachtwoord zelf nooit in de cookie staat. Gebruikt Web Crypto (crypto.subtle)
 * omdat de proxy op de Edge-runtime draait waar node:crypto niet beschikbaar is.
 *
 * Fail-closed: zonder ADMIN_PASSWORD-env levert deriveSessionToken() null op,
 * waardoor login altijd weigert en de proxy altijd doorstuurt naar /admin/login.
 */

export const ADMIN_SESSION_COOKIE = 'pbi_admin_session';

/** Versie-prefix in de afleiding: bump om alle bestaande sessies te ongeldig te maken. */
const DERIVATION_PREFIX = 'pbi-admin-v1';

export async function deriveSessionToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;

  const data = new TextEncoder().encode(`${DERIVATION_PREFIX}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Constant-time vergelijking — voorkomt timing-zijkanalen op het token. */
export function tokensEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
