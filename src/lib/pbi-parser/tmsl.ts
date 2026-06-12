import { hasAutoDatePrefix, newModel, newTable, PbiModel } from './types';

type Json = Record<string, unknown>;

function joinExpr(expr: unknown): string {
    if (Array.isArray(expr)) return expr.join('\n');
    return typeof expr === 'string' ? expr : '';
}

function str(v: unknown, fallback = ''): string {
    return typeof v === 'string' ? v : fallback;
}

// Gedeelde kern voor .pbit (DataModelSchema) en model.bim: beide zijn TMSL-JSON.
export function parseTmsl(doc: Json, name: string, source: string): PbiModel {
    const modelJson = (doc.model as Json | undefined) ?? doc;
    const model = newModel(str(doc.name) || name, source);

    for (const t of (modelJson.tables as Json[] | undefined) ?? []) {
        const tname = str(t.name);
        if (hasAutoDatePrefix(tname) || t.showAsVariationsOnly) continue;
        const table = newTable(tname);
        table.isHidden = Boolean(t.isHidden);
        for (const c of (t.columns as Json[] | undefined) ?? []) {
            if (c.type === 'rowNumber' || str(c.name).startsWith('RowNumber-')) continue;
            table.columns.push({
                name: str(c.name),
                dataType: str(c.dataType),
                isHidden: Boolean(c.isHidden),
            });
        }
        for (const m of (t.measures as Json[] | undefined) ?? []) {
            table.measures.push({
                name: str(m.name),
                expression: joinExpr(m.expression),
                displayFolder: str(m.displayFolder),
                formatString: str(m.formatString),
            });
        }
        model.tables.push(table);
    }

    const validTables = new Set(model.tables.map((t) => t.name));
    for (const r of (modelJson.relationships as Json[] | undefined) ?? []) {
        // relaties naar auto date/time-tabellen overslaan
        if (!validTables.has(str(r.fromTable)) || !validTables.has(str(r.toTable))) continue;
        model.relationships.push({
            fromTable: str(r.fromTable),
            fromColumn: str(r.fromColumn),
            toTable: str(r.toTable),
            toColumn: str(r.toColumn),
            isActive: r.isActive !== false,
            crossFilteringBehavior: str(r.crossFilteringBehavior, 'oneDirection'),
            fromCardinality: str(r.fromCardinality, 'many'),
            toCardinality: str(r.toCardinality, 'one'),
        });
    }
    return model;
}
