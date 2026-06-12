import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';

type Params = { params: Promise<{ id: string; chatId: string }> };

/** Berichten van één gesprek. */
export async function GET(_req: Request, { params }: Params) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }
    const { id, chatId } = await params;

    const { data: chat } = await supabase
        .from('studio_chats')
        .select('id')
        .eq('id', chatId)
        .eq('project_id', id)
        .eq('user_id', user.id)
        .single();
    if (!chat) {
        return NextResponse.json({ error: 'Chat niet gevonden.' }, { status: 404 });
    }

    const { data: messages } = await supabase
        .from('studio_messages')
        .select('role, content, created_at')
        .eq('chat_id', chatId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

    return NextResponse.json({ messages: messages ?? [] });
}

/** Gesprek verwijderen (berichten cascaden mee). */
export async function DELETE(_req: Request, { params }: Params) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }
    const { id, chatId } = await params;

    const { error } = await supabase
        .from('studio_chats')
        .delete()
        .eq('id', chatId)
        .eq('project_id', id)
        .eq('user_id', user.id);
    if (error) {
        console.error('studio chat DELETE failed', error.message);
        return NextResponse.json({ error: 'Chat verwijderen mislukte.' }, { status: 500 });
    }
    return NextResponse.json({ deleted: true });
}
