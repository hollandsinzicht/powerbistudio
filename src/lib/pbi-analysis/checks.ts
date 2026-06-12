import { PbiModel } from '@/lib/pbi-parser';

// Deterministische best-practice-checks over het genormaliseerde model.
// Bewust géén LLM: reproduceerbaar, gratis en testbaar. De AI-samenvatting
// (narrative.ts) krijgt deze findings als input.

export type FindingSeverity = 'issue' | 'warning' | 'info';

export interface Finding {
    id: string;
    severity: FindingSeverity;
    title: string;
    description: string;
    items: string[];
}

function rel(fromTable: string, fromColumn: string, toTable: string, toColumn: string): string {
    return `'${fromTable}'[${fromColumn}] → '${toTable}'[${toColumn}]`;
}

// Verwijder strings en comments uit DAX zodat checks niet triggeren op
// format-strings of uitgecommentarieerde code.
function stripDaxNoise(expr: string): string {
    return expr
        .replace(/"[^"]*"/g, '""')
        .replace(/\/\/[^\n]*/g, '')
        .replace(/--[^\n]*/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');
}

export function runChecks(model: PbiModel): Finding[] {
    const findings: Finding[] = [];
    const allMeasures = model.tables.flatMap((t) =>
        t.measures.map((m) => ({ table: t.name, ...m }))
    );
    const allDax = allMeasures.map((m) => m.expression).join('\n');

    // ── Inactieve relaties ───────────────────────────────────────────────
    const inactive = model.relationships.filter((r) => !r.isActive);
    if (inactive.length) {
        findings.push({
            id: 'inactive-relationships',
            severity: 'warning',
            title: 'Inactieve relaties',
            description:
                'Deze relaties zijn alleen bruikbaar via USERELATIONSHIP() in een measure. ' +
                'Controleer of ze bewust inactief zijn (bijv. een tweede datumrelatie) of opgeruimd kunnen worden.',
            items: inactive.map((r) => rel(r.fromTable, r.fromColumn, r.toTable, r.toColumn)),
        });
    }

    // ── Bidirectionele filters ───────────────────────────────────────────
    const bidi = model.relationships.filter(
        (r) => r.crossFilteringBehavior === 'bothDirections'
    );
    if (bidi.length) {
        findings.push({
            id: 'bidirectional-filters',
            severity: 'issue',
            title: 'Bidirectionele kruisfilters',
            description:
                'Bidirectionele filters maken filtergedrag onvoorspelbaar en kunnen ambigue filterpaden ' +
                'veroorzaken. Overweeg enkelrichting + CROSSFILTER() waar tweerichting echt nodig is.',
            items: bidi.map((r) => rel(r.fromTable, r.fromColumn, r.toTable, r.toColumn)),
        });
    }

    // ── Many-to-many ─────────────────────────────────────────────────────
    const m2m = model.relationships.filter(
        (r) => r.fromCardinality === 'many' && r.toCardinality === 'many'
    );
    if (m2m.length) {
        findings.push({
            id: 'many-to-many',
            severity: 'issue',
            title: 'Many-to-many-relaties',
            description:
                'Many-to-many-relaties zijn traag en foutgevoelig. Een brugtabel met unieke sleutels ' +
                'is vrijwel altijd robuuster.',
            items: m2m.map((r) => rel(r.fromTable, r.fromColumn, r.toTable, r.toColumn)),
        });
    }

    // ── Losgekoppelde tabellen ───────────────────────────────────────────
    const related = new Set(
        model.relationships.flatMap((r) => [r.fromTable, r.toTable])
    );
    const disconnected = model.tables.filter(
        (t) => !related.has(t.name) && !t.isHidden && t.columns.length > 0 && model.tables.length > 1
    );
    if (disconnected.length) {
        findings.push({
            id: 'disconnected-tables',
            severity: 'warning',
            title: 'Tabellen zonder relaties',
            description:
                'Deze zichtbare tabellen hebben geen enkele relatie. Parametertabellen zijn prima los, ' +
                'maar vergeten dimensies filteren niets.',
            items: disconnected.map((t) => `'${t.name}'`),
        });
    }

    // ── Ongebruikte kolommen (heuristiek) ────────────────────────────────
    const relColumns = new Set(
        model.relationships.flatMap((r) => [
            `${r.fromTable}|${r.fromColumn}`,
            `${r.toTable}|${r.toColumn}`,
        ])
    );
    const unused: string[] = [];
    for (const t of model.tables) {
        for (const c of t.columns) {
            if (relColumns.has(`${t.name}|${c.name}`)) continue;
            const qualified = [
                `'${t.name}'[${c.name}]`,
                `${t.name}[${c.name}]`,
            ];
            if (qualified.some((q) => allDax.includes(q))) continue;
            unused.push(`'${t.name}'[${c.name}]`);
        }
    }
    if (unused.length) {
        findings.push({
            id: 'unused-columns',
            severity: 'info',
            title: `Mogelijk ongebruikte kolommen (${unused.length})`,
            description:
                'Heuristiek: deze kolommen komen niet voor in relaties of measure-DAX. Gebruik in ' +
                'rapportvisuals, RLS of berekende kolommen is hier níet zichtbaar — controleer vóór je iets verwijdert. ' +
                'Ongebruikte kolommen kosten geheugen en vertragen het model.',
            items: unused,
        });
    }

    // ── Measure-kwaliteit ────────────────────────────────────────────────
    const noFormat = allMeasures.filter((m) => !m.formatString);
    if (noFormat.length) {
        findings.push({
            id: 'measures-without-format',
            severity: 'info',
            title: `Measures zonder format string (${noFormat.length})`,
            description:
                'Zonder format string bepaalt elke visual zelf de weergave — dat geeft inconsistente rapporten.',
            items: noFormat.map((m) => `'${m.table}'[${m.name}]`),
        });
    }

    const rawDivision = allMeasures.filter((m) => {
        const clean = stripDaxNoise(m.expression);
        return /\//.test(clean) && !/DIVIDE\s*\(/i.test(clean);
    });
    if (rawDivision.length) {
        findings.push({
            id: 'division-without-divide',
            severity: 'warning',
            title: 'Deling met / in plaats van DIVIDE()',
            description:
                'Een kale deling geeft een fout bij delen door nul; DIVIDE() vangt dat af met een alternatief resultaat.',
            items: rawDivision.map((m) => `'${m.table}'[${m.name}]`),
        });
    }

    const longWithoutVars = allMeasures.filter(
        (m) => m.expression.length > 300 && !/\bVAR\b/i.test(m.expression)
    );
    if (longWithoutVars.length) {
        findings.push({
            id: 'long-measures-without-vars',
            severity: 'info',
            title: 'Lange measures zonder variabelen',
            description:
                'Measures van deze omvang worden leesbaarder en vaak sneller met VAR/RETURN ' +
                '(herhaalde expressies worden dan één keer geëvalueerd).',
            items: longWithoutVars.map((m) => `'${m.table}'[${m.name}]`),
        });
    }

    const byExpression = new Map<string, string[]>();
    for (const m of allMeasures) {
        const key = m.expression.replace(/\s+/g, '').toLowerCase();
        if (!key) continue;
        const list = byExpression.get(key) ?? [];
        list.push(`'${m.table}'[${m.name}]`);
        byExpression.set(key, list);
    }
    const duplicates = [...byExpression.values()].filter((l) => l.length > 1);
    if (duplicates.length) {
        findings.push({
            id: 'duplicate-measures',
            severity: 'warning',
            title: 'Measures met identieke expressie',
            description:
                'Dubbele logica veroudert ongelijk bij wijzigingen. Houd één measure aan of verwijs ernaar.',
            items: duplicates.map((l) => l.join(' = ')),
        });
    }

    // ── Modelhygiëne: naamgeving ─────────────────────────────────────────
    const tableNames = model.tables.map((t) => t.name);
    const hasSpaces = tableNames.some((n) => n.includes(' '));
    const hasUnderscores = tableNames.some((n) => n.includes('_'));
    if (hasSpaces && hasUnderscores) {
        findings.push({
            id: 'naming-consistency',
            severity: 'info',
            title: 'Gemengde naamgeving van tabellen',
            description:
                'Er worden zowel spaties als underscores gebruikt in tabelnamen. Eén conventie leest prettiger en voorkomt verwarring in DAX.',
            items: [
                `Met spaties: ${tableNames.filter((n) => n.includes(' ')).map((n) => `'${n}'`).join(', ')}`,
                `Met underscores: ${tableNames.filter((n) => n.includes('_')).map((n) => `'${n}'`).join(', ')}`,
            ],
        });
    }

    const order: Record<FindingSeverity, number> = { issue: 0, warning: 1, info: 2 };
    return findings.sort((a, b) => order[a.severity] - order[b.severity]);
}
