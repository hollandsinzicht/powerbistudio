import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/security';
import { avgReportToMarkdown, portfolioReportMarkdown } from '@/lib/studio/report-format';
import { renderMarkdownPdf } from '@/lib/studio/markdown-pdf';

// PDF-rendering (fontkit) heeft de Node-runtime nodig, geen edge.
export const runtime = 'nodejs';
export const maxDuration = 60;

type Format = 'md' | 'pdf';
type ProjectKind = 'doc' | 'rls' | 'avg';

const PROJECT_TITLES: Record<ProjectKind, string> = {
    doc: 'Modeldocumentatie',
    rls: 'RLS-testcases',
    avg: 'AVG-check tegen het model',
};

function slug(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'export';
}

async function resolveContent(
    userId: string,
    source: string,
    id: string,
    kind: string
): Promise<{ title: string; markdown: string } | { error: string; status: number }> {
    if (source === 'project') {
        if (!['doc', 'rls', 'avg'].includes(kind)) return { error: 'Onbekend type.', status: 400 };
        const { data: project } = await supabase
            .from('studio_projects')
            .select('name, doc_markdown, rls_markdown, avg_report')
            .eq('id', id)
            .eq('user_id', userId)
            .single();
        if (!project) return { error: 'Project niet gevonden.', status: 404 };

        let markdown: string | null = null;
        if (kind === 'doc') markdown = project.doc_markdown;
        else if (kind === 'rls') markdown = project.rls_markdown;
        else if (kind === 'avg') markdown = project.avg_report ? avgReportToMarkdown(project.avg_report) : null;

        if (!markdown) return { error: 'Dit onderdeel is nog niet gegenereerd.', status: 400 };
        return { title: `${PROJECT_TITLES[kind as ProjectKind]} — ${project.name}`, markdown };
    }

    if (source === 'portfolio') {
        const { data: pf } = await supabase
            .from('studio_portfolios')
            .select('name, analysis_findings, analysis_narrative, map_json, analyzed_at, doc_markdown, avg_report, rls_markdown')
            .eq('id', id)
            .eq('user_id', userId)
            .single();
        if (!pf) return { error: 'Project niet gevonden.', status: 404 };

        // Projectbrede opleveringen (doc/rls/avg) uit de portfolio-kolommen.
        if (kind === 'doc' || kind === 'rls' || kind === 'avg') {
            let markdown: string | null = null;
            if (kind === 'doc') markdown = pf.doc_markdown;
            else if (kind === 'rls') markdown = pf.rls_markdown;
            else markdown = pf.avg_report ? avgReportToMarkdown(pf.avg_report) : null;
            if (!markdown) return { error: 'Dit onderdeel is nog niet gegenereerd.', status: 400 };
            const label = kind === 'doc' ? 'Projectdocumentatie' : kind === 'rls' ? 'RLS-testcases' : 'AVG-check';
            return { title: `${label} — ${pf.name}`, markdown };
        }

        // Anders: de cross-model-audit.
        if (!pf.analyzed_at) return { error: 'Draai eerst de analyse.', status: 400 };
        const markdown = portfolioReportMarkdown(
            pf.name,
            pf.analysis_findings ?? [],
            pf.analysis_narrative,
            pf.map_json
        );
        return { title: `Portfolio-audit — ${pf.name}`, markdown };
    }

    return { error: 'Onbekende bron.', status: 400 };
}

export async function POST(req: Request) {
    const limit = checkRateLimit(req, 'studio-export', 20, 60_000);
    if (!limit.ok) {
        return NextResponse.json(
            { error: 'Te veel verzoeken. Probeer het zo opnieuw.' },
            { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
        );
    }

    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

    const { source, id, kind, format } = await req.json().catch(() => ({}));
    if (typeof source !== 'string' || typeof id !== 'string' || typeof kind !== 'string') {
        return NextResponse.json({ error: 'source, id en kind zijn verplicht.' }, { status: 400 });
    }
    const fmt: Format = format === 'pdf' ? 'pdf' : 'md';

    const resolved = await resolveContent(user.id, source, id, kind);
    if ('error' in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: resolved.status });
    }

    const filenameBase = `${slug(resolved.title)}`;

    if (fmt === 'md') {
        return new NextResponse(resolved.markdown, {
            headers: {
                'Content-Type': 'text/markdown; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filenameBase}.md"`,
            },
        });
    }

    try {
        const pdf = await renderMarkdownPdf(resolved.title, resolved.markdown);
        return new NextResponse(new Uint8Array(pdf), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filenameBase}.pdf"`,
            },
        });
    } catch (e) {
        console.error('studio export: pdf render failed', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'PDF genereren mislukte.' }, { status: 500 });
    }
}
