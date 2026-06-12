import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Magic-link landing: wisselt de code (PKCE) of token_hash (OTP) in voor een
// sessie en zet de auth-cookies op de redirect-response.
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    const redirect = NextResponse.redirect(new URL('/studio', request.url));
    const failed = NextResponse.redirect(
        new URL('/studio/login?error=link', request.url)
    );

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return failed;

    const supabase = createServerClient(url, key, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                for (const { name, value, options } of cookiesToSet) {
                    redirect.cookies.set(name, value, options);
                }
            },
        },
    });

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        return error ? failed : redirect;
    }
    if (tokenHash && type === 'magiclink') {
        const { error } = await supabase.auth.verifyOtp({
            type: 'magiclink',
            token_hash: tokenHash,
        });
        return error ? failed : redirect;
    }
    return failed;
}
