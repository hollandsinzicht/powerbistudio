'use client';

import { createBrowserClient } from '@supabase/ssr';

// Browser-client met de publieke anon key — RLS bepaalt wat de gebruiker mag.
// (De service-role client in lib/supabase.ts blijft uitsluitend server-side.)
export function supabaseBrowser() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
        throw new Error(
            'Supabase Auth is niet geconfigureerd. Stel NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in.'
        );
    }
    return createBrowserClient(url, key);
}
