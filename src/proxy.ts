import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import {
  ADMIN_SESSION_COOKIE,
  deriveSessionToken,
  tokensEqual,
} from '@/lib/admin-session';

/**
 * Request-proxy (Next 16, voorheen middleware.ts). Drie taken:
 *
 * 1. Admin-gate — elke /admin-request wordt server-side gecontroleerd op de
 *    httpOnly sessie-cookie die /api/admin/login zet. Vóór deze proxy was de
 *    admin-UI alleen client-side "beveiligd" via een localStorage-check die
 *    elk wachtwoord ≥ 4 tekens accepteerde.
 *    /admin/login blijft cookie-loos bereikbaar (anders kan niemand inloggen).
 *
 * 2. Studio-gate — /studio gebruikt Supabase Auth (magic link). De proxy
 *    ververst hier de sessie-cookies (vereist voor @supabase/ssr) en stuurt
 *    niet-ingelogde bezoekers van beschermde studio-pagina's naar de login.
 *    De landing (/studio), login en auth-callback blijven publiek.
 *
 * 3. Legacy blog-URL's — /blog?post=slug → /blog/slug (301), overgenomen uit
 *    de oude middleware.ts.
 */

const STUDIO_PUBLIC = ['/studio', '/studio/login'];

async function studioGate(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    // Auth niet geconfigureerd → alles behalve de landing dichtzetten.
    if (STUDIO_PUBLIC.includes(request.nextUrl.pathname)) return response;
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/studio/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Belangrijk: getUser() ververst zonodig de sessie via de setAll hierboven.
  const { data } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic =
    STUDIO_PUBLIC.includes(pathname) || pathname.startsWith('/studio/auth');

  if (!data.user && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/studio/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }
  return response;
}

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

  // ── Studio-gate (Supabase Auth) ───────────────────────────────────────
  if (pathname.startsWith('/studio')) {
    return studioGate(request);
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
  matcher: ['/admin/:path*', '/studio/:path*', '/blog'],
};
