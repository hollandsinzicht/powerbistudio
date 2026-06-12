import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';

// Server-side Supabase-client gebonden aan de sessie-cookies van de request.
// Voor identiteit altijd getUser() gebruiken (valideert de JWT bij Supabase);
// getSession() leest alleen de cookie en is daarmee niet te vertrouwen.
export async function supabaseServer() {
    const cookieStore = await cookies();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
        throw new Error(
            'Supabase Auth is niet geconfigureerd. Stel NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in.'
        );
    }
    return createServerClient(url, key, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                // In server components is schrijven niet toegestaan; de proxy
                // ververst de sessie, dus stilzwijgend negeren is hier veilig.
                try {
                    for (const { name, value, options } of cookiesToSet) {
                        cookieStore.set(name, value, options);
                    }
                } catch {
                    /* readonly context */
                }
            },
        },
    });
}

/** Ingelogde gebruiker van deze request, of null. */
export async function getUser(): Promise<User | null> {
    try {
        const supabase = await supabaseServer();
        const { data, error } = await supabase.auth.getUser();
        if (error) return null;
        return data.user;
    } catch {
        return null;
    }
}
