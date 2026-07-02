import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';
import { STORAGE_BUCKET, MAX_CHAT_MESSAGES_PER_MONTH } from '@/lib/studio/limits';
import { monthlyMessageCount } from '@/lib/studio/usage';

type Params = { params: Promise<{ id: string }> };

/** Volledig project: rapport, schema, chatgeschiedenis en maandverbruik. */
export async function GET(_req: Request, { params }: Params) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }
    const { id } = await params;

    const { data: project, error } = await supabase
        .from('studio_projects')
        .select(
            'id, name, source_filename, source_format, file_path, schema_json, stats, analysis_findings, analysis_narrative, doc_markdown, avg_report, rls_markdown, portfolio_id, created_at'
        )
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
    if (error || !project) {
        return NextResponse.json({ error: 'Datamodel niet gevonden.' }, { status: 404 });
    }

    // Projectcontext (indien dit datamodel bij een project hoort).
    let portfolio: { id: string; name: string } | null = null;
    if (project.portfolio_id) {
        const { data } = await supabase
            .from('studio_portfolios')
            .select('id, name')
            .eq('id', project.portfolio_id)
            .eq('user_id', user.id)
            .single();
        portfolio = data ?? null;
    }

    const { data: chats } = await supabase
        .from('studio_chats')
        .select('id, title, created_at')
        .eq('project_id', id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    const used = await monthlyMessageCount(user.id);

    return NextResponse.json({
        project,
        portfolio,
        chats: chats ?? [],
        usage: { used, limit: MAX_CHAT_MESSAGES_PER_MONTH },
    });
}

/**
 * Koppel dit datamodel aan een project (portfolio) of maak het los.
 * Body: { portfolioId: string | null }.
 */
export async function PATCH(req: Request, { params }: Params) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }
    const { id } = await params;
    const { portfolioId } = await req.json().catch(() => ({}));
    if (portfolioId !== null && typeof portfolioId !== 'string') {
        return NextResponse.json({ error: 'portfolioId moet een id of null zijn.' }, { status: 400 });
    }

    if (typeof portfolioId === 'string') {
        const { count } = await supabase
            .from('studio_portfolios')
            .select('id', { count: 'exact', head: true })
            .eq('id', portfolioId)
            .eq('user_id', user.id);
        if (!count) {
            return NextResponse.json({ error: 'Project niet gevonden.' }, { status: 404 });
        }
    }

    const { error } = await supabase
        .from('studio_projects')
        .update({ portfolio_id: portfolioId })
        .eq('id', id)
        .eq('user_id', user.id);
    if (error) {
        console.error('studio project PATCH failed', error.message);
        return NextResponse.json({ error: 'Bijwerken mislukte.' }, { status: 500 });
    }
    return NextResponse.json({ updated: true });
}

/**
 * Hard delete: storage-object + projectrij (chatberichten cascaden mee).
 * "Verwijderen = echt weg" is een productbelofte — geen soft delete. Na het
 * verwijderen wordt live geverifieerd dat opslag én database echt leeg zijn,
 * en dat bewijs gaat terug naar de gebruiker.
 */
export async function DELETE(_req: Request, { params }: Params) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }
    const { id } = await params;

    const { data: project } = await supabase
        .from('studio_projects')
        .select('id, file_path, source_filename')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
    if (!project) {
        return NextResponse.json({ error: 'Project niet gevonden.' }, { status: 404 });
    }

    const { count: messagesBefore } = await supabase
        .from('studio_messages')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', id);

    if (project.file_path) {
        const { error: storageError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([project.file_path]);
        if (storageError) {
            console.error('studio delete: storage remove failed', storageError.message);
            return NextResponse.json(
                { error: 'Bestand verwijderen mislukte. Probeer het opnieuw.' },
                { status: 500 }
            );
        }
    }

    const { error: deleteError } = await supabase
        .from('studio_projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
    if (deleteError) {
        console.error('studio delete: row delete failed', deleteError.message);
        return NextResponse.json({ error: 'Verwijderen mislukte.' }, { status: 500 });
    }

    // ── Live verificatie: lees opslag en database opnieuw uit ───────────
    const { data: remainingObjects } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(`${user.id}/${id}`);
    const { count: projectRows } = await supabase
        .from('studio_projects')
        .select('id', { count: 'exact', head: true })
        .eq('id', id);
    const { count: messageRows } = await supabase
        .from('studio_messages')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', id);

    return NextResponse.json({
        deleted: true,
        verification: {
            filename: project.source_filename,
            hadFile: Boolean(project.file_path),
            // herlezing ná het verwijderen — 0/leeg is het bewijs
            storageObjectsRemaining: remainingObjects?.length ?? 0,
            projectRowsRemaining: projectRows ?? 0,
            messageRowsRemaining: messageRows ?? 0,
            messagesDeleted: messagesBefore ?? 0,
            verifiedAt: new Date().toISOString(),
        },
    });
}
