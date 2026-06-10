import { NextResponse, type NextRequest } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  deriveSessionToken,
  tokensEqual,
} from '@/lib/admin-session';

/**
 * Request-proxy (Next 16, voorheen middleware.ts). Twee taken:
 *
 * 1. Admin-gate — elke /admin-request wordt server-side gecontroleerd op de
 *    httpOnly sessie-cookie die /api/admin/login zet. Vóór deze proxy was de
 *    admin-UI alleen client-side "beveiligd" via een localStorage-check die
 *    elk wachtwoord ≥ 4 tekens accepteerde.
 *    /admin/login blijft cookie-loos bereikbaar (anders kan niemand inloggen).
 *
 * 2. Legacy blog-URL's — /blog?post=slug → /blog/slug (301), overgenomen uit
 *    de oude middleware.ts.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Legacy blog-redirect ──────────────────────────────────────────────
  if (pathname === '/blog') {
    const post = request.nextUrl.searchParams.get('post');
    if (post) {
      const url = request.nextUrl.clone();
      url.pathname = `/blog/${post}`;
      url.searchParams.delete('post');
      return NextResponse.redirect(url, 301);
    }
    return NextResponse.next();
  }

  // ── Admin-gate ────────────────────────────────────────────────────────
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const expected = await deriveSessionToken();
  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (expected && cookie && tokensEqual(cookie, expected)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  loginUrl.search = '';
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/blog'],
};
