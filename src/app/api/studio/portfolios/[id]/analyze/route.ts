import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/security';
import { PbiModel } from '@/lib/pbi-parser';
import {
    crossModelChecks,
    buildPortfolioContext,
    generatePortfolioNarrative,
    PortfolioModel,
} from '@/lib/pbi-analysis/cross-model';
import { MIN_PORTFOLIO_MODELS } from '@/lib/studio/limits';

// De cross-model-checks zijn milliseconden; de narrative-call aan Claude domineert.
export const maxDuration = 300;

type Params = { params: Promise<{ id: string }> };

/**
 * Draait de cross-model-analyse over de gekoppelde modellen en bewaart het
 * resultaat op de portfolio-rij. Modellen worden uit schema_json gelezen —
 * geen herparse nodig.
 */
export async function POST(req: Request, { params }: Params) {
    const limit = checkRateLimit(req, 'studio-portfolio-analyze', 5, 60_000);
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

    const { data: portfolio } = await supabase
        .from('studio_portfolios')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
    if (!portfolio) {
        return NextResponse.json({ error: 'Portfolio niet gevonden.' }, { status: 404 });
    }

    const { data: members, error: membersError } = await supabase
        .from('studio_projects')
        .select('name, source_filename, schema_json')
        .eq('portfolio_id', id)
        .eq('user_id', user.id);
    if (membersError) {
        console.error('studio portfolio analyze: members query failed', membersError.message);
        return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 });
    }
    if ((members?.length ?? 0) < MIN_PORTFOLIO_MODELS) {
        return NextResponse.json(
            { error: `Een portfolio heeft minimaal ${MIN_PORTFOLIO_MODELS} modellen nodig.` },
            { status: 400 }
        );
    }

    const portfolioModels: PortfolioModel[] = (members ?? []).map((m) => ({
        name: m.name || m.source_filename,
        model: m.schema_json as PbiModel,
    }));

    const result = crossModelChecks(portfolioModels);
    const context = buildPortfolioContext(portfolioModels, result.map, result.findings);

    let narrative = '';
    let inputTokens = 0;
    let outputTokens = 0;
    try {
        const nr = await generatePortfolioNarrative(context);
        narrative = nr.narrative;
        inputTokens = nr.inputTokens;
        outputTokens = nr.outputTokens;
    } catch (e) {
        console.error('studio portfolio analyze: narrative failed', e instanceof Error ? e.message : e);
        narrative = '*De AI-samenvatting kon niet gegenereerd worden. De cross-model-checks hieronder zijn wel volledig.*';
    }

    const { error: updateError } = await supabase
        .from('studio_portfolios')
        .update({
            analysis_findings: result.findings,
            analysis_narrative: narrative,
            map_json: result.map,
            stats: result.stats,
            analyzed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);
    if (updateError) {
        console.error('studio portfolio analyze: update failed', updateError.message);
        return NextResponse.json({ error: 'Opslaan van de analyse mislukte.' }, { status: 500 });
    }

    await supabase.from('studio_usage').insert({
        user_id: user.id,
        kind: 'portfolio',
        project_id: id,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
    });

    return NextResponse.json({ stats: result.stats, findings: result.findings.length });
}
