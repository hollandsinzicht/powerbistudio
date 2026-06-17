import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/security';
import { generateModelDocumentation } from '@/lib/pbi-analysis/documentation';
import { generateAvgReport } from '@/lib/pbi-analysis/avg-check';
import { generateRlsTests } from '@/lib/pbi-analysis/rls-tests';

// Lui genereren van de drie opleveringen (modeldoc, AVG-check, RLS-tests) per
// project. Elke generatie is één LLM-call op het al-ingelezen schema; het
// resultaat wordt in de bijbehorende kolom op studio_projects bewaard zodat een
// pageload niet opnieuw genereert.
export const maxDuration = 300;

type Params = { params: Promise<{ id: string }> };
type Kind = 'doc' | 'avg' | 'rls';
const VALID_KINDS: Kind[] = ['doc', 'avg', 'rls'];

export async function POST(req: Request, { params }: Params) {
    const limit = checkRateLimit(req, 'studio-deliverable', 5, 60_000);
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
    const { id } = await params;

    const { kind } = await req.json().catch(() => ({}));
    if (!VALID_KINDS.includes(kind)) {
        return NextResponse.json(
            { error: `kind moet één van: ${VALID_KINDS.join(', ')}` },
            { status: 400 }
        );
    }
    if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json(
            { error: 'De generator is tijdelijk niet beschikbaar.' },
            { status: 503 }
        );
    }

    const { data: project } = await supabase
        .from('studio_projects')
        .select('id, schema_markdown')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
    if (!project) {
        return NextResponse.json({ error: 'Project niet gevonden.' }, { status: 404 });
    }

    try {
        let column: 'doc_markdown' | 'avg_report' | 'rls_markdown';
        let value: unknown;
        let inputTokens = 0;
        let outputTokens = 0;

        if (kind === 'doc') {
            const r = await generateModelDocumentation(project.schema_markdown);
            column = 'doc_markdown';
            value = r.markdown;
            inputTokens = r.inputTokens;
            outputTokens = r.outputTokens;
        } else if (kind === 'avg') {
            const r = await generateAvgReport(project.schema_markdown);
            column = 'avg_report';
            value = r.report;
            inputTokens = r.inputTokens;
            outputTokens = r.outputTokens;
        } else {
            const r = await generateRlsTests(project.schema_markdown);
            column = 'rls_markdown';
            value = r.markdown;
            inputTokens = r.inputTokens;
            outputTokens = r.outputTokens;
        }

        const { error: updateError } = await supabase
            .from('studio_projects')
            .update({ [column]: value })
            .eq('id', id)
            .eq('user_id', user.id);
        if (updateError) {
            console.error('studio deliverable: persist failed', updateError.message);
            return NextResponse.json({ error: 'Opslaan mislukte.' }, { status: 500 });
        }

        await supabase.from('studio_usage').insert({
            user_id: user.id,
            kind: 'deliverable',
            project_id: id,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
        });

        return NextResponse.json({ success: true, kind, value });
    } catch (e) {
        console.error('studio deliverable: generation failed', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Genereren mislukte.' }, { status: 500 });
    }
}
