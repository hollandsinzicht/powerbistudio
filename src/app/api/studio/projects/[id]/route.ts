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
            'id, name, source_filename, source_format, file_path, schema_json, stats, analysis_findings, analysis_narrative, created_at'
        )
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
    if (error || !project) {
        return NextResponse.json({ error: 'Project niet gevonden.' }, { status: 404 });
    }

    const { data: messages } = await supabase
        .from('studio_messages')
        .select('role, content, created_at')
        .eq('project_id', id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

    const used = await monthlyMessageCount(user.id);

    return NextResponse.json({
        project,
        messages: messages ?? [],
        usage: { used, limit: MAX_CHAT_MESSAGES_PER_MONTH },
    });
}

/**
 * Hard delete: storage-object + projectrij (chatberichten cascaden mee).
 * "Verwijderen = echt weg" is een productbelofte — geen soft delete.
 */
export async function DELETE(_req: Request, { params }: Params) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }
    const { id } = await params;

    const { data: project } = await supabase
        .from('studio_projects')
        .select('id, file_path')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
    if (!project) {
        return NextResponse.json({ error: 'Project niet gevonden.' }, { status: 404 });
    }

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

    return NextResponse.json({ deleted: true });
}
