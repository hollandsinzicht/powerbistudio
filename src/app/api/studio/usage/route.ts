import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { usageSummary } from '@/lib/studio/usage';

/** Verbruiksoverzicht van de ingelogde gebruiker (tokens + kostenraming). */
export async function GET() {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }
    const summary = await usageSummary(user.id);
    return NextResponse.json(summary);
}
