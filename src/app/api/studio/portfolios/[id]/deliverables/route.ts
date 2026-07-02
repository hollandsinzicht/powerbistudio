import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/security';
import { buildProjectChatContext, buildSchemaContext } from '@/lib/studio/schema-context';
import { generateProjectDocumentation, generateProjectRls } from '@/lib/pbi-analysis/project-deliverables';
import { generateAvgReport } from '@/lib/pbi-analysis/avg-check';
import { PbiModel } from '@/lib/pbi-parser';
import { MIN_PORTFOLIO_MODELS } from '@/lib/studio/limits';

// Opleveringen op projectniveau: één gebundeld document over álle modellen.
export const maxDuration = 300;

type Params = { params: Promise<{ id: string }> };
type Kind = 'doc' | 'avg' | 'rls';
const VALID_KINDS: Kind[] = ['doc', 'avg', 'rls'];

export async function POST(req: Request, { params }: Params) {
    const limit = checkRateLimit(req, 'studio-portfolio-deliverable', 5, 60_000);
    if (!limit.ok) {
        return NextResponse.json(
            { error: 'Te veel verzoeken. Probeer het zo opnieuw.' },
            { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
        );
    }

    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    const { id } = await params;

    const { kind } = await req.json().catch(() => ({}));
    if (!VALID_KINDS.includes(kind)) {
        return NextResponse.json({ error: `kind moet één van: ${VALID_KINDS.join(', ')}` }, { status: 400 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json({ error: 'De generator is tijdelijk niet beschikbaar.' }, { status: 503 });
    }

    const { data: portfolio } = await supabase
        .from('studio_portfolios')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
    if (!portfolio) {
        return NextResponse.json({ error: 'Project niet gevonden.' }, { status: 404 });
    }

    const { data: members } = await supabase
        .from('studio_projects')
        .select('name, schema_json')
        .eq('portfolio_id', id)
        .eq('user_id', user.id);
    if ((members?.length ?? 0) < MIN_PORTFOLIO_MODELS) {
        return NextResponse.json(
            { error: `Een projectoplevering heeft minimaal ${MIN_PORTFOLIO_MODELS} modellen nodig.` },
            { status: 400 }
        );
    }

    const context = buildProjectChatContext(
        (members ?? []).map((m) => ({
            name: m.name,
            schemaMarkdown: buildSchemaContext(m.schema_json as PbiModel).markdown,
        }))
    ).markdown;

    try {
        let column: 'doc_markdown' | 'avg_report' | 'rls_markdown';
        let value: unknown;
        let inputTokens = 0;
        let outputTokens = 0;

        if (kind === 'doc') {
            const r = await generateProjectDocumentation(context);
            column = 'doc_markdown';
            value = r.markdown;
            inputTokens = r.inputTokens;
            outputTokens = r.outputTokens;
        } else if (kind === 'avg') {
            const r = await generateAvgReport(context);
            column = 'avg_report';
            value = r.report;
            inputTokens = r.inputTokens;
            outputTokens = r.outputTokens;
        } else {
            const r = await generateProjectRls(context);
            column = 'rls_markdown';
            value = r.markdown;
            inputTokens = r.inputTokens;
            outputTokens = r.outputTokens;
        }

        const { error: updateError } = await supabase
            .from('studio_portfolios')
            .update({ [column]: value })
            .eq('id', id)
            .eq('user_id', user.id);
        if (updateError) {
            console.error('studio portfolio deliverable: persist failed', updateError.message);
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
        console.error('studio portfolio deliverable: generation failed', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Genereren mislukte.' }, { status: 500 });
    }
}
