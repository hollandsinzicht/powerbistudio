import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/security';
import {
    MAX_PORTFOLIOS,
    MIN_PORTFOLIO_MODELS,
    MAX_PORTFOLIO_MODELS,
} from '@/lib/studio/limits';

/** Portfoliolijst van de ingelogde gebruiker, met aantal gekoppelde modellen. */
export async function GET() {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }

    const { data: portfolios, error } = await supabase
        .from('studio_portfolios')
        .select('id, name, stats, analyzed_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('studio portfolios GET failed', error.message);
        return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 });
    }

    // Aantal modellen per portfolio (één query, tellen in JS).
    const { data: members } = await supabase
        .from('studio_projects')
        .select('portfolio_id')
        .eq('user_id', user.id)
        .not('portfolio_id', 'is', null);
    const counts = new Map<string, number>();
    for (const m of members ?? []) {
        if (m.portfolio_id) counts.set(m.portfolio_id, (counts.get(m.portfolio_id) ?? 0) + 1);
    }

    return NextResponse.json({
        portfolios: (portfolios ?? []).map((p) => ({ ...p, modelCount: counts.get(p.id) ?? 0 })),
        maxPortfolios: MAX_PORTFOLIOS,
    });
}

/**
 * Maakt een portfolio van bestaande projecten van de gebruiker.
 * Body: { name, projectIds: string[] }. De projecten worden aan het portfolio
 * gekoppeld (portfolio_id); een project hoort bij max één portfolio.
 */
export async function POST(req: Request) {
    const limit = checkRateLimit(req, 'studio-portfolios', 5, 60_000);
    if (!limit.ok) {
        return NextResponse.json(
            { error: 'Te veel verzoeken. Probeer het zo opnieuw.' },
            { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
        );
    }

    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }

    const { name, projectIds } = await req.json().catch(() => ({}));
    if (!Array.isArray(projectIds) || projectIds.some((id) => typeof id !== 'string')) {
        return NextResponse.json({ error: 'projectIds is verplicht.' }, { status: 400 });
    }
    const ids = [...new Set(projectIds as string[])];
    if (ids.length < MIN_PORTFOLIO_MODELS) {
        return NextResponse.json(
            { error: `Een portfolio heeft minimaal ${MIN_PORTFOLIO_MODELS} modellen nodig.` },
            { status: 400 }
        );
    }
    if (ids.length > MAX_PORTFOLIO_MODELS) {
        return NextResponse.json(
            { error: `Maximaal ${MAX_PORTFOLIO_MODELS} modellen per portfolio.` },
            { status: 400 }
        );
    }

    // Portfolio-limiet (beta-kostenrem).
    const { count } = await supabase
        .from('studio_portfolios')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
    if ((count ?? 0) >= MAX_PORTFOLIOS) {
        return NextResponse.json(
            { error: `Beta-limiet bereikt: maximaal ${MAX_PORTFOLIOS} portfolios.` },
            { status: 403 }
        );
    }

    // Alle opgegeven projecten moeten van de gebruiker zijn.
    const { data: owned } = await supabase
        .from('studio_projects')
        .select('id')
        .eq('user_id', user.id)
        .in('id', ids);
    if ((owned?.length ?? 0) !== ids.length) {
        return NextResponse.json(
            { error: 'Een of meer modellen bestaan niet of zijn niet van jou.' },
            { status: 400 }
        );
    }

    const { data: portfolio, error: insertError } = await supabase
        .from('studio_portfolios')
        .insert({
            user_id: user.id,
            name: typeof name === 'string' && name.trim() ? name.trim().slice(0, 120) : 'Portfolio',
        })
        .select('id')
        .single();
    if (insertError || !portfolio) {
        console.error('studio portfolios POST: insert failed', insertError?.message);
        return NextResponse.json({ error: 'Aanmaken mislukte.' }, { status: 500 });
    }

    const { error: linkError } = await supabase
        .from('studio_projects')
        .update({ portfolio_id: portfolio.id })
        .eq('user_id', user.id)
        .in('id', ids);
    if (linkError) {
        console.error('studio portfolios POST: link failed', linkError.message);
        await supabase.from('studio_portfolios').delete().eq('id', portfolio.id);
        return NextResponse.json({ error: 'Koppelen van modellen mislukte.' }, { status: 500 });
    }

    return NextResponse.json({ id: portfolio.id });
}
