import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';
import { MAX_CHAT_MESSAGES_PER_MONTH } from '@/lib/studio/limits';
import { monthlyMessageCount } from '@/lib/studio/usage';

type Params = { params: Promise<{ id: string }> };

/** Volledig portfolio: metadata, gekoppelde modellen en de laatste analyse. */
export async function GET(_req: Request, { params }: Params) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }
    const { id } = await params;

    const { data: portfolio, error } = await supabase
        .from('studio_portfolios')
        .select('id, name, analysis_findings, analysis_narrative, map_json, stats, analyzed_at, created_at')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
    if (error || !portfolio) {
        return NextResponse.json({ error: 'Portfolio niet gevonden.' }, { status: 404 });
    }

    const { data: members } = await supabase
        .from('studio_projects')
        .select('id, name, source_filename, source_format, stats, created_at')
        .eq('portfolio_id', id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    const { data: chats } = await supabase
        .from('studio_chats')
        .select('id, title, created_at')
        .eq('portfolio_id', id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    const usedMessages = await monthlyMessageCount(user.id);

    return NextResponse.json({
        portfolio,
        members: members ?? [],
        chats: chats ?? [],
        usage: { used: usedMessages, limit: MAX_CHAT_MESSAGES_PER_MONTH },
    });
}

/**
 * Verwijdert het portfolio. De gekoppelde projecten blijven bestaan: de FK
 * (on delete set null) maakt hun portfolio_id automatisch leeg.
 */
export async function DELETE(_req: Request, { params }: Params) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }
    const { id } = await params;

    const { data: portfolio } = await supabase
        .from('studio_portfolios')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
    if (!portfolio) {
        return NextResponse.json({ error: 'Portfolio niet gevonden.' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
        .from('studio_portfolios')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
    if (deleteError) {
        console.error('studio portfolio delete failed', deleteError.message);
        return NextResponse.json({ error: 'Verwijderen mislukte.' }, { status: 500 });
    }

    return NextResponse.json({ deleted: true });
}
