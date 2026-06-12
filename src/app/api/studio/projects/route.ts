import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/security';
import { parseModel, modelStats, PbiParseError } from '@/lib/pbi-parser';
import { runChecks } from '@/lib/pbi-analysis/checks';
import { generateNarrative } from '@/lib/pbi-analysis/narrative';
import { buildSchemaContext } from '@/lib/studio/schema-context';
import { MAX_PROJECTS, STORAGE_BUCKET, fileExtension } from '@/lib/studio/limits';

// De parse zelf duurt milliseconden; de narrative-call aan Claude domineert.
export const maxDuration = 300;

const SOURCE_FORMATS: Record<string, string> = {
    '.pbit': 'pbit',
    '.bim': 'bim',
    '.json': 'bim',
    '.tmdl': 'tmdl',
    '.zip': 'zip',
};

/** Projectenlijst van de ingelogde gebruiker. */
export async function GET() {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('studio_projects')
        .select('id, name, source_filename, source_format, stats, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('studio projects GET failed', error.message);
        return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 });
    }
    return NextResponse.json({ projects: data, maxProjects: MAX_PROJECTS });
}

/**
 * Maakt een project van een zojuist geüpload bestand:
 * download uit de bucket → parse → checks → AI-samenvatting → opslaan.
 * Bij een parse-fout wordt het storage-object direct weer verwijderd.
 */
export async function POST(req: Request) {
    const limit = checkRateLimit(req, 'studio-projects', 5, 60_000);
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

    const { projectId, path, filename, name } = await req.json().catch(() => ({}));
    if (
        typeof projectId !== 'string' ||
        typeof path !== 'string' ||
        typeof filename !== 'string'
    ) {
        return NextResponse.json(
            { error: 'projectId, path en filename zijn verplicht.' },
            { status: 400 }
        );
    }
    // Het pad moet binnen de eigen map van de gebruiker liggen.
    if (!path.startsWith(`${user.id}/${projectId}/`) || path.includes('..')) {
        return NextResponse.json({ error: 'Ongeldig pad.' }, { status: 400 });
    }

    const { count } = await supabase
        .from('studio_projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
    if ((count ?? 0) >= MAX_PROJECTS) {
        await supabase.storage.from(STORAGE_BUCKET).remove([path]);
        return NextResponse.json(
            { error: `Beta-limiet bereikt: maximaal ${MAX_PROJECTS} projecten.` },
            { status: 403 }
        );
    }

    const { data: blob, error: downloadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(path);
    if (downloadError || !blob) {
        console.error('studio projects POST: download failed', downloadError?.message);
        return NextResponse.json(
            { error: 'Bestand niet gevonden. Probeer opnieuw te uploaden.' },
            { status: 404 }
        );
    }

    let model;
    try {
        model = await parseModel(filename, new Uint8Array(await blob.arrayBuffer()));
    } catch (e) {
        await supabase.storage.from(STORAGE_BUCKET).remove([path]);
        if (e instanceof PbiParseError) {
            return NextResponse.json({ error: e.message }, { status: 400 });
        }
        console.error('studio projects POST: parse failed');
        return NextResponse.json(
            { error: 'Het bestand kon niet gelezen worden.' },
            { status: 400 }
        );
    }

    const stats = modelStats(model);
    const findings = runChecks(model);
    const { markdown } = buildSchemaContext(model);

    let narrative = '';
    let inputTokens = 0;
    let outputTokens = 0;
    try {
        const result = await generateNarrative(markdown, findings);
        narrative = result.narrative;
        inputTokens = result.inputTokens;
        outputTokens = result.outputTokens;
    } catch (e) {
        // Zonder samenvatting is het project nog steeds bruikbaar.
        console.error('studio projects POST: narrative failed', e instanceof Error ? e.message : e);
        narrative = '*De AI-samenvatting kon niet gegenereerd worden. De checks hierboven zijn wel volledig.*';
    }

    const { error: insertError } = await supabase.from('studio_projects').insert({
        id: projectId,
        user_id: user.id,
        name: typeof name === 'string' && name.trim() ? name.trim().slice(0, 120) : model.name,
        source_filename: filename,
        source_format: SOURCE_FORMATS[fileExtension(filename)] ?? 'bim',
        file_path: path,
        schema_json: model,
        schema_markdown: markdown,
        stats,
        analysis_findings: findings,
        analysis_narrative: narrative,
    });
    if (insertError) {
        console.error('studio projects POST: insert failed', insertError.message);
        await supabase.storage.from(STORAGE_BUCKET).remove([path]);
        return NextResponse.json({ error: 'Opslaan mislukte.' }, { status: 500 });
    }

    await supabase.from('studio_usage').insert({
        user_id: user.id,
        kind: 'analysis',
        project_id: projectId,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
    });

    return NextResponse.json({ id: projectId, stats, findings: findings.length });
}
