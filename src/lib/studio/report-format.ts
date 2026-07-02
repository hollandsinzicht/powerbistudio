import type { AvgPuntResult } from '@/lib/pbi-analysis/avg-check';
import type { CrossModelFinding, PortfolioMap } from '@/lib/pbi-analysis/cross-model';

// Zet gegenereerde artefacten om naar één markdown-document. Modeldoc en
// RLS-tests zijn al markdown; de AVG-check (JSON) en de portfolio-audit worden
// hier opgemaakt. Deze markdown is de bron voor zowel de .md- als de .pdf-export.

const SEVERITY_LABEL: Record<string, string> = {
    issue: 'Probleem',
    warning: 'Waarschuwing',
    info: 'Info',
};

const AVG_STATUS_LABEL: Record<string, string> = {
    voldaan: 'Voldaan',
    risico: 'Risico',
    'niet-detecteerbaar': 'Handmatig beoordelen',
};

export function avgReportToMarkdown(report: AvgPuntResult[]): string {
    const out: string[] = ['# AVG-check tegen het model', ''];
    for (const p of report) {
        out.push(`## ${p.nummer}. ${p.titel}`);
        out.push(`**Status:** ${AVG_STATUS_LABEL[p.status] ?? p.status}`);
        if (p.bevinding) out.push('', p.bevinding);
        if (p.aanbeveling) out.push('', `**Aanbeveling:** ${p.aanbeveling}`);
        out.push('');
    }
    return out.join('\n');
}

export function portfolioReportMarkdown(
    name: string,
    findings: CrossModelFinding[],
    narrative: string | null,
    map: PortfolioMap | null
): string {
    const out: string[] = [`# Portfolio-audit: ${name}`, ''];

    if (narrative) {
        out.push(narrative.trim(), '');
    }

    out.push('## Cross-model bevindingen', '');
    if (findings.length) {
        for (const f of findings) {
            out.push(`### [${SEVERITY_LABEL[f.severity] ?? f.severity}] ${f.title}`);
            if (f.description) out.push('', f.description);
            out.push('');
            for (const item of f.items) out.push(`- ${item}`);
            out.push('');
        }
    } else {
        out.push('Geen cross-model bevindingen — de modellen zijn onderling consistent.', '');
    }

    const shared = map?.entities.filter((e) => e.modelCount >= 2) ?? [];
    if (shared.length) {
        out.push('## Gedeelde entiteiten', '');
        for (const e of shared) {
            out.push(`- **${e.names[0]}** — in ${e.models.join(', ')}`);
        }
        out.push('');
    }

    return out.join('\n');
}
