import { PbiModel, PbiRelationship } from './types';

// Compacte markdown-weergave van het model — dit is óók de LLM-context voor de
// chat. Byte-stabiel houden: dezelfde input moet exact dezelfde string geven,
// anders mist prompt caching.

function cardinalityArrow(rel: PbiRelationship): string {
    const direction = rel.crossFilteringBehavior === 'bothDirections' ? '↔' : '→';
    return `*${direction}1`;
}

export function toMarkdown(model: PbiModel): string {
    const nCols = model.tables.reduce((n, t) => n + t.columns.length, 0);
    const nMeas = model.tables.reduce((n, t) => n + t.measures.length, 0);
    const out: string[] = [
        `# Datamodel: ${model.name}`,
        '',
        `Bron: ${model.source} · ${model.tables.length} tabellen · ` +
        `${nCols} kolommen · ${nMeas} measures · ${model.relationships.length} relaties`,
        '',
    ];

    const sorted = [...model.tables].sort((a, b) => {
        const an = a.name.toLowerCase();
        const bn = b.name.toLowerCase();
        return an < bn ? -1 : an > bn ? 1 : 0;
    });

    for (const t of sorted) {
        const hidden = t.isHidden ? ' *(verborgen)*' : '';
        out.push(`## Tabel: ${t.name}${hidden}`);
        out.push('');
        if (t.columns.length) {
            out.push('| Kolom | Datatype | |');
            out.push('|---|---|---|');
            for (const c of t.columns) {
                const flag = c.isHidden ? 'verborgen' : '';
                out.push(`| ${c.name} | ${c.dataType} | ${flag} |`);
            }
            out.push('');
        }
        if (t.measures.length) {
            out.push('### Measures');
            out.push('');
            for (const m of t.measures) {
                const meta: string[] = [];
                if (m.displayFolder) meta.push(`map: ${m.displayFolder}`);
                if (m.formatString) meta.push(`format: ${m.formatString}`);
                const suffix = meta.length ? ` (${meta.join(', ')})` : '';
                out.push(`**[${m.name}]**${suffix}`);
                out.push('');
                out.push('```dax');
                out.push(m.expression);
                out.push('```');
                out.push('');
            }
        }
    }

    if (model.relationships.length) {
        out.push('## Relaties');
        out.push('');
        for (const r of model.relationships) {
            const inactive = !r.isActive ? ' **(INACTIEF)**' : '';
            const both = r.crossFilteringBehavior === 'bothDirections' ? ' (bidirectioneel)' : '';
            out.push(
                `- '${r.fromTable}'[${r.fromColumn}] ${cardinalityArrow(r)} ` +
                `'${r.toTable}'[${r.toColumn}]${inactive}${both}`
            );
        }
        out.push('');
    }

    return out.join('\n');
}
