import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/security';

// Magic link server-side aanvragen. Bewust níet via de browser-client: die
// gebruikt de PKCE-flow, waardoor het token in de mail (pkce_-prefix) alleen
// inwisselbaar is in de browser die hem aanvroeg. De standaard flow van
// supabase-js geeft een token_hash die in élke browser werkt — de
// e-mailtemplate linkt daarmee direct naar /studio/auth/callback.
export async function POST(req: NextRequest) {
    const limit = checkRateLimit(req, 'studio-login', 4, 60_000);
    if (!limit.ok) {
        return NextResponse.json(
            { error: 'Te veel inlogpogingen. Probeer het zo opnieuw.' },
            { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
        );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
        return NextResponse.json(
            { error: 'Inloggen is tijdelijk niet beschikbaar.' },
            { status: 503 }
        );
    }

    const { email } = await req.json().catch(() => ({}));
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 400 });
    }

    const supabase = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
            emailRedirectTo: `${req.nextUrl.origin}/studio/auth/callback`,
        },
    });
    if (error) {
        console.error('studio login: signInWithOtp failed', error.message);
        return NextResponse.json(
            { error: 'Inloglink versturen mislukte. Probeer het zo opnieuw.' },
            { status: 500 }
        );
    }
    return NextResponse.json({ sent: true });
}
