import {
    hasAutoDatePrefix,
    newModel,
    newTable,
    PbiColumn,
    PbiMeasure,
    PbiModel,
    PbiRelationship,
    PbiTable,
} from './types';

// Pragmatische, regelgebaseerde TMDL-parser — geen volledige spec. Partities,
// hiërarchieën, calculation groups en annotations worden bewust genegeerd.

const TMDL_SKIP_PROPS = [
    'formatString:', 'displayFolder:', 'lineageTag:', 'annotation',
    'dataType:', 'isHidden', 'summarizeBy:', 'sourceColumn:', 'dataCategory:',
    'formatStringDefinition', 'changedProperty', 'extendedProperty',
];

function startsWithAny(s: string, prefixes: string[]): boolean {
    return prefixes.some((p) => s.startsWith(p));
}

function stripQuotes(name: string): string {
    name = name.trim();
    if (name.length >= 2 && name[0] === name[name.length - 1] && (name[0] === "'" || name[0] === '"')) {
        return name.slice(1, -1);
    }
    return name;
}

// 'Tabel.Kolom' of "'Tabel met punt.en'.Kolom" → [tabel, kolom]
function splitTableColumn(ref: string): [string, string] {
    ref = ref.trim();
    if (ref.startsWith("'")) {
        const end = ref.indexOf("'", 1);
        if (end !== -1) {
            return [ref.slice(1, end), ref.slice(end + 1).replace(/^\.+/, '').trim()];
        }
    }
    const idx = ref.lastIndexOf('.');
    if (idx === -1) return [ref, ''];
    return [ref.slice(0, idx).trim(), ref.slice(idx + 1).trim()];
}

function expandTabs(line: string, tabSize = 4): string {
    let out = '';
    for (const ch of line) {
        if (ch === '\t') out += ' '.repeat(tabSize - (out.length % tabSize));
        else out += ch;
    }
    return out;
}

function indentOf(line: string): number {
    const stripped = line.replace(/^[\t ]+/, '').replace(/\t/g, '    ');
    return line.length - stripped.length;
}

interface MeasureInProgress extends PbiMeasure {
    exprLines: string[];
}

export function parseTmdlText(text: string, model: PbiModel): void {
    const lines = text.split(/\r?\n/);
    let table: PbiTable | null = null;
    let column: PbiColumn | null = null;
    let measure: MeasureInProgress | null = null;
    let relationship: PbiRelationship | null = null;
    let measureIndent = 0;
    let collectingExpr = false;

    const flushMeasure = () => {
        if (measure !== null && table !== null) {
            const extra = measure.exprLines;
            const nonblank = extra.filter((l) => l.trim());
            let expression = measure.expression;
            if (nonblank.length) {
                const base = Math.min(...nonblank.map((l) => l.length - l.trimStart().length));
                const dedented = extra.map((l) => l.slice(base).replace(/\s+$/, ''));
                expression = (expression ? expression + '\n' : '') + dedented.join('\n');
            }
            expression = expression.replace(/^\n+|\n+$/g, '').replace(/\s+$/, '');
            table.measures.push({
                name: measure.name,
                expression,
                displayFolder: measure.displayFolder,
                formatString: measure.formatString,
            });
        }
        measure = null;
        collectingExpr = false;
    };

    for (const raw of lines) {
        const line = raw.replace(/\s+$/, '');
        if (!line.trim()) {
            if (collectingExpr && measure) measure.exprLines.push('');
            continue;
        }
        const stripped = line.trim();
        const ind = indentOf(raw);

        // multiline measure-expressie: diepere indent en geen bekende property
        if (collectingExpr && measure) {
            if (ind > measureIndent && !startsWithAny(stripped, TMDL_SKIP_PROPS)) {
                measure.exprLines.push(expandTabs(raw).replace(/\s+$/, ''));
                continue;
            }
            collectingExpr = false; // property of nieuw object → expressie klaar
        }

        let m = stripped.match(/^table\s+(.+)$/);
        if (m && ind === 0) {
            flushMeasure();
            const tname = stripQuotes(m[1]);
            if (hasAutoDatePrefix(tname)) {
                table = null;
                continue;
            }
            table = newTable(tname);
            model.tables.push(table);
            column = null;
            relationship = null;
            continue;
        }

        m = stripped.match(/^relationship\s+(.+)$/);
        if (m && ind === 0) {
            flushMeasure();
            relationship = {
                fromTable: '', fromColumn: '', toTable: '', toColumn: '',
                isActive: true, crossFilteringBehavior: 'oneDirection',
                fromCardinality: 'many', toCardinality: 'one',
            };
            model.relationships.push(relationship);
            table = null;
            column = null;
            continue;
        }

        if (relationship !== null) {
            m = stripped.match(/^fromColumn:\s*(.+)$/);
            if (m) {
                [relationship.fromTable, relationship.fromColumn] = splitTableColumn(m[1]);
                continue;
            }
            m = stripped.match(/^toColumn:\s*(.+)$/);
            if (m) {
                [relationship.toTable, relationship.toColumn] = splitTableColumn(m[1]);
                continue;
            }
            if (/^isActive:\s*false/.test(stripped)) {
                relationship.isActive = false;
                continue;
            }
            m = stripped.match(/^crossFilteringBehavior:\s*(\S+)/);
            if (m) {
                relationship.crossFilteringBehavior = m[1];
                continue;
            }
            m = stripped.match(/^fromCardinality:\s*(\S+)/);
            if (m) {
                relationship.fromCardinality = m[1];
                continue;
            }
            m = stripped.match(/^toCardinality:\s*(\S+)/);
            if (m) {
                relationship.toCardinality = m[1];
                continue;
            }
        }

        if (table === null) continue;

        m = stripped.match(/^measure\s+('[^']+'|"[^"]+"|[^=]+?)\s*=\s*(.*)$/);
        if (m) {
            flushMeasure();
            measure = {
                name: stripQuotes(m[1]),
                expression: m[2].trim(),
                displayFolder: '',
                formatString: '',
                exprLines: [],
            };
            measureIndent = ind;
            collectingExpr = true; // vervolgregels met diepere indent horen erbij
            column = null;
            continue;
        }

        m = stripped.match(/^column\s+(.+?)(?:\s*=\s*(.*))?$/);
        if (m) {
            flushMeasure();
            column = { name: stripQuotes(m[1]), dataType: '', isHidden: false };
            table.columns.push(column);
            continue;
        }

        if (measure !== null) {
            m = stripped.match(/^formatString:\s*(.+)$/);
            if (m) {
                (measure as MeasureInProgress).formatString = stripQuotes(m[1]);
                continue;
            }
            m = stripped.match(/^displayFolder:\s*(.+)$/);
            if (m) {
                (measure as MeasureInProgress).displayFolder = stripQuotes(m[1]);
                continue;
            }
        }

        if (column !== null) {
            m = stripped.match(/^dataType:\s*(\S+)/);
            if (m) {
                column.dataType = m[1];
                continue;
            }
            if (/^isHidden\b/.test(stripped)) {
                column.isHidden = true;
                continue;
            }
        }

        if (/^isHidden\b/.test(stripped) && column === null && measure === null) {
            table.isHidden = true;
        }
    }

    flushMeasure();
}

// files: [bestandsnaam, tekstinhoud][] — volgorde van relaties/model-files maakt niet uit
export function parseTmdlFiles(files: [string, string][], name: string): PbiModel {
    const model = newModel(name, 'tmdl');
    const sorted = [...files].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    for (const [, text] of sorted) {
        parseTmdlText(text, model);
    }
    return model;
}
