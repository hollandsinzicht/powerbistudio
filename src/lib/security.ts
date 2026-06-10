/**
 * Beveiligingshelpers voor publieke API-routes.
 *
 *   • escapeHtml   — voorkomt HTML/script-injectie wanneer gebruikersinvoer
 *                    in een (e-mail-)HTML-string wordt geïnterpoleerd.
 *   • rateLimit    — eenvoudige in-memory IP-throttle als eerste verdediging
 *                    tegen spam en API-misbruik.
 *
 * LET OP bij rateLimit: de teller leeft in het geheugen van één serverless
 * instance. Op Vercel kunnen meerdere instances tegelijk draaien, dus dit is
 * best-effort — het dempt bursts vanaf één instance maar is geen harde
 * gedistribueerde limiet. Voor dat laatste is Upstash/Vercel KV nodig.
 */

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape de vijf HTML-gevoelige tekens. */
export function escapeHtml(input: unknown): string {
  return String(input ?? '').replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

// ---------------------------------------------------------------------------
// Rate limiting (in-memory sliding window)
// ---------------------------------------------------------------------------

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Haal het beste-gok client-IP uit de standaard proxy-headers. */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconden tot de limiet reset (handig voor de Retry-After-header). */
  retryAfter: number;
}

/**
 * Sta `limit` verzoeken toe per `windowMs` per sleutel (meestal IP+route).
 * Geeft { ok: false } zodra de limiet binnen het venster is bereikt.
 */
export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true, retryAfter: 0 };
}

// Voorkom onbegrensde geheugengroei: ruim verlopen buckets periodiek op.
// (Alleen relevant op een langlevende instance; serverless cold starts
// beginnen met een lege Map.)
let lastSweep = Date.now();
function sweep(now: number): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, b] of buckets) {
    if (now >= b.resetAt) buckets.delete(k);
  }
}

/** rateLimit + automatische opschoning in één aanroep. */
export function checkRateLimit(
  req: Request,
  routeKey: string,
  limit = 5,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  sweep(now);
  return rateLimit(`${getClientIp(req)}:${routeKey}`, limit, windowMs);
}
