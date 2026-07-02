import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';
import { MAX_CHATS_PER_PROJECT } from '@/lib/studio/limits';

type Params = { params: Promise<{ id: string }> };

async function ownsPortfolio(userId: string, portfolioId: string): Promise<boolean> {
    const { count } = await supabase
        .from('studio_portfolios')
        .select('id', { count: 'exact', head: true })
        .eq('id', portfolioId)
        .eq('user_id', userId);
    return (count ?? 0) > 0;
}

/** Nieuw gesprek binnen een project (portfolio). */
export async function POST(_req: Request, { params }: Params) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }
    const { id } = await params;
    if (!(await ownsPortfolio(user.id, id))) {
        return NextResponse.json({ error: 'Project niet gevonden.' }, { status: 404 });
    }

    const { count } = await supabase
        .from('studio_chats')
        .select('id', { count: 'exact', head: true })
        .eq('portfolio_id', id);
    if ((count ?? 0) >= MAX_CHATS_PER_PROJECT) {
        return NextResponse.json(
            { error: `Maximaal ${MAX_CHATS_PER_PROJECT} chats per project. Verwijder eerst een oude chat.` },
            { status: 403 }
        );
    }

    const { data, error } = await supabase
        .from('studio_chats')
        .insert({ portfolio_id: id, user_id: user.id })
        .select('id, title, created_at')
        .single();
    if (error || !data) {
        console.error('studio portfolio chats POST failed', error?.message);
        return NextResponse.json({ error: 'Chat aanmaken mislukte.' }, { status: 500 });
    }
    return NextResponse.json({ chat: data });
}
