import Anthropic from '@anthropic-ai/sdk';
import { PbiModel, PbiTable } from '@/lib/pbi-parser';

// Cross-model / portfolio-analyse: beoordeelt meerdere semantische modellen
// tegelijk op samenhang, inconsistentie en consolidatiekansen. Bewust
// deterministisch (net als checks.ts) — reproduceerbaar, gratis en testbaar.
// De AI-samenvatting (generatePortfolioNarrative) krijgt deze findings als input.
//
// Dit is de edge t.o.v. de single-model-Studio én t.o.v. een losse chat: die
// zien altijd maar één model tegelijk. Hier vergelijken we het hele landschap.

export type FindingSeverity = 'issue' | 'warning' | 'info';

export interface CrossModelFinding {
    id: string;
    severity: FindingSeverity;
    title: string;
    description: string;
    items: string[];
}

/** Eén model binnen het portfolio, met een leesbare naam voor de bevindingen. */
export interface PortfolioModel {
    name: string;
    model: PbiModel;
}

/** Een entiteit (dimensie/feit) zoals die over de modellen heen voorkomt. */
export interface PortfolioEntity {
    key: string; // genormaliseerde sleutel (prefix/case/spatie-onafhankelijk)
    names: string[]; // werkelijke tabelnamen zoals ze voorkomen
    models: string[]; // modellen waarin de entiteit voorkomt
    modelCount: number;
}

export interface PortfolioMap {
    entities: PortfolioEntity[];
}

export interface CrossModelStats {
    models: number;
    entities: number;
    sharedEntities: number; // in ≥2 modellen
    findings: number;
}

export interface CrossModelResult {
    findings: CrossModelFinding[];
    map: PortfolioMap;
    stats: CrossModelStats;
}

// ── Normalisatie ───────────────────────────────────────────────────────────

const ENTITY_PREFIXES = ['dimension', 'dim', 'factless', 'fact', 'feiten', 'feit', 'fct', 'tbl'];

// Zelfde concept, andere schrijfwijze/conventie → zelfde sleutel.
// 'Dim_Klant', 'dim klant', 'DimKlant' en 'Klant' vallen allemaal op 'klant'.
function entityKey(tableName: string): string {
    let n = tableName.trim().toLowerCase().replace(/[\s_]+/g, '');
    for (const p of ENTITY_PREFIXES) {
        if (n.startsWith(p) && n.length > p.length) {
            n = n.slice(p.length);
            break;
        }
    }
    return n;
}

// Verwijder strings en comments uit DAX zodat vergelijkingen niet triggeren op
// format-strings of uitgecommentarieerde code (spiegelt checks.ts).
function stripDaxNoise(expr: string): string {
    return expr
        .replace(/"[^"]*"/g, '""')
        .replace(/\/\/[^\n]*/g, '')
        .replace(/--[^\n]*/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');
}

function daxKey(expr: string): string {
    return stripDaxNoise(expr).replace(/\s+/g, '').toLowerCase();
}

function measureNameKey(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function relSignature(r: {
    fromCardinality: string;
    toCardinality: string;
    crossFilteringBehavior: string;
    isActive: boolean;
}): string {
    const card = `${r.fromCardinality}→${r.toCardinality}`;
    const dir = r.crossFilteringBehavior === 'bothDirections' ? ' bidirectioneel' : '';
    const active = r.isActive ? '' : ' inactief';
    return `${card}${dir}${active}`;
}

// ── Occurrences: entiteit → waar komt hij voor ──────────────────────────────

interface Occurrence {
    model: string;
    table: PbiTable;
}

function buildOccurrences(models: PortfolioModel[]): Map<string, Occurrence[]> {
    const occ = new Map<string, Occurrence[]>();
    for (const { name, model } of models) {
        for (const t of model.tables) {
            if (t.columns.length === 0 && t.measures.length === 0) continue;
            const key = entityKey(t.name);
            if (!key) continue;
            const list = occ.get(key) ?? [];
            list.push({ model: name, table: t });
            occ.set(key, list);
        }
    }
    return occ;
}

function distinctModels(list: Occurrence[]): string[] {
    return [...new Set(list.map((o) => o.model))];
}

function distinctNames(list: Occurrence[]): string[] {
    return [...new Set(list.map((o) => o.table.name))];
}

// ── Hoofd-analyse ────────────────────────────────────────────────────────────

export function crossModelChecks(models: PortfolioModel[]): CrossModelResult {
    const occ = buildOccurrences(models);
    const totalModels = models.length;

    // Portfolio-map (voor de UI): entiteit → in welke modellen, gesorteerd op
    // spreiding (meest gedeelde bovenaan).
    const entities: PortfolioEntity[] = [...occ.entries()]
        .map(([key, list]) => {
            const ms = distinctModels(list);
            return { key, names: distinctNames(list), models: ms, modelCount: ms.length };
        })
        .sort((a, b) => b.modelCount - a.modelCount || (a.key < b.key ? -1 : 1));

    const sharedEntities = entities.filter((e) => e.modelCount >= 2);
    const findings: CrossModelFinding[] = [];

    // ── 1. Naamdrift: zelfde concept, verschillende namen ────────────────
    const drift = entities.filter((e) => e.modelCount >= 2 && e.names.length >= 2);
    if (drift.length) {
        findings.push({
            id: 'entity-naming-drift',
            severity: 'warning',
            title: 'Zelfde concept, verschillende tabelnamen',
            description:
                'Deze entiteiten komen in meerdere modellen voor onder verschillende namen. ' +
                'Eén conventie maakt het landschap begrijpelijk en voorkomt dat dezelfde dimensie ' +
                'per rapport anders heet.',
            items: drift.map(
                (e) => `${e.names.map((n) => `'${n}'`).join(' / ')} — in ${e.models.join(', ')}`
            ),
        });
    }

    // ── 2. Gedeelde dimensie, afwijkende structuur ───────────────────────
    const divergent: string[] = [];
    for (const [key, list] of occ) {
        const ms = distinctModels(list);
        if (ms.length < 2) continue;

        // Per model de kolomnamen (unie over tabellen met deze sleutel).
        const colsByModel = new Map<string, Set<string>>();
        for (const { model, table } of list) {
            const set = colsByModel.get(model) ?? new Set<string>();
            for (const c of table.columns) set.add(c.name.trim().toLowerCase());
            colsByModel.set(model, set);
        }
        // Kolommen die niet in álle modellen voorkomen.
        const presence = new Map<string, number>();
        for (const set of colsByModel.values()) {
            for (const c of set) presence.set(c, (presence.get(c) ?? 0) + 1);
        }
        const inconsistent = [...presence.entries()]
            .filter(([, n]) => n < colsByModel.size)
            .map(([c]) => c);
        if (inconsistent.length) {
            const display = distinctNames(list)[0];
            const shown = inconsistent.slice(0, 6).join(', ');
            const more = inconsistent.length > 6 ? ` (+${inconsistent.length - 6})` : '';
            divergent.push(
                `'${display}' (${ms.length} modellen): kolommen niet overal gelijk — ${shown}${more}`
            );
        }
    }
    if (divergent.length) {
        findings.push({
            id: 'shared-dimension-divergence',
            severity: 'warning',
            title: 'Gedeelde dimensie met afwijkende structuur',
            description:
                'Deze dimensies bestaan in meerdere modellen maar met verschillende kolommen. ' +
                'Dat is dé aanleiding om ze samen te voegen tot één gedeeld (certified) dataset, ' +
                'zodat definities niet uit elkaar lopen.',
            items: divergent,
        });
    }

    // ── 3a. Measure-drift: zelfde naam, andere DAX ───────────────────────
    interface MOcc {
        model: string;
        table: string;
        name: string;
        expr: string;
    }
    const measures: MOcc[] = [];
    for (const { name: modelName, model } of models) {
        for (const t of model.tables) {
            for (const m of t.measures) {
                measures.push({ model: modelName, table: t.name, name: m.name, expr: m.expression });
            }
        }
    }

    const byName = new Map<string, MOcc[]>();
    for (const m of measures) {
        const k = measureNameKey(m.name);
        const list = byName.get(k) ?? [];
        list.push(m);
        byName.set(k, list);
    }
    const nameDrift: string[] = [];
    for (const list of byName.values()) {
        const models_ = new Set(list.map((m) => m.model));
        const daxes = new Set(list.map((m) => daxKey(m.expr)));
        if (models_.size >= 2 && daxes.size >= 2) {
            nameDrift.push(
                `[${list[0].name}] — ${daxes.size} verschillende definities in ${[...models_].join(', ')}`
            );
        }
    }
    if (nameDrift.length) {
        findings.push({
            id: 'measure-definition-drift',
            severity: 'issue',
            title: 'Zelfde measure, verschillende DAX',
            description:
                'Een measure met dezelfde naam heeft in verschillende modellen een andere definitie. ' +
                'Dat betekent dat hetzelfde begrip (bijv. omzet) per rapport iets anders berekent — ' +
                'de gevaarlijkste vorm van inconsistentie voor gebruikers.',
            items: nameDrift,
        });
    }

    // ── 3b. Dubbele logica: andere naam, identieke DAX ───────────────────
    const byDax = new Map<string, MOcc[]>();
    for (const m of measures) {
        const k = daxKey(m.expr);
        if (!k) continue;
        const list = byDax.get(k) ?? [];
        list.push(m);
        byDax.set(k, list);
    }
    const duplicateLogic: string[] = [];
    for (const list of byDax.values()) {
        const models_ = new Set(list.map((m) => m.model));
        const names = new Set(list.map((m) => measureNameKey(m.name)));
        if (models_.size >= 2 && names.size >= 2) {
            const shown = [...new Set(list.map((m) => `'${m.model}'[${m.name}]`))];
            duplicateLogic.push(shown.join(' = '));
        }
    }
    if (duplicateLogic.length) {
        findings.push({
            id: 'duplicate-measure-logic',
            severity: 'info',
            title: 'Identieke DAX onder verschillende namen',
            description:
                'Dezelfde berekening komt in meerdere modellen voor onder andere namen. ' +
                'Standaardiseer op één naam zodat gebruikers dezelfde metriek herkennen.',
            items: duplicateLogic,
        });
    }

    // ── 4. Conflicterende relatie-cardinaliteit ──────────────────────────
    interface ROcc {
        model: string;
        signature: string;
        display: string;
    }
    const byPair = new Map<string, ROcc[]>();
    for (const { name: modelName, model } of models) {
        for (const r of model.relationships) {
            const pair = `${entityKey(r.fromTable)}|${entityKey(r.toTable)}`;
            const list = byPair.get(pair) ?? [];
            list.push({
                model: modelName,
                signature: relSignature(r),
                display: `${entityKey(r.fromTable)} → ${entityKey(r.toTable)}`,
            });
            byPair.set(pair, list);
        }
    }
    const relConflicts: string[] = [];
    for (const list of byPair.values()) {
        const models_ = new Set(list.map((r) => r.model));
        const sigs = new Set(list.map((r) => r.signature));
        if (models_.size >= 2 && sigs.size >= 2) {
            const detail = [...new Set(list.map((r) => `${r.signature} (${r.model})`))];
            relConflicts.push(`${list[0].display}: ${detail.join(' vs ')}`);
        }
    }
    if (relConflicts.length) {
        findings.push({
            id: 'relationship-cardinality-conflict',
            severity: 'issue',
            title: 'Zelfde relatie, ander filtergedrag',
            description:
                'Hetzelfde tabelpaar is in verschillende modellen anders gerelateerd (cardinaliteit, ' +
                'richting of actief/inactief). Dat geeft afwijkende resultaten tussen rapporten die ' +
                'op dezelfde data lijken te staan.',
            items: relConflicts,
        });
    }

    // ── 5. Consolidatiekansen ────────────────────────────────────────────
    const consolidationThreshold = totalModels <= 2 ? 2 : 3;
    const consolidation = entities.filter((e) => e.modelCount >= consolidationThreshold);
    if (consolidation.length) {
        findings.push({
            id: 'consolidation-candidates',
            severity: 'info',
            title: 'Kandidaten voor een gedeeld dataset',
            description:
                'Deze entiteiten worden in veel modellen los onderhouden. Eén gedeeld semantisch ' +
                'model (shared dataset) scheelt onderhoud en houdt definities gelijk.',
            items: consolidation.map(
                (e) =>
                    `'${e.names[0]}' — in ${e.modelCount}/${totalModels} modellen` +
                    (e.names.length > 1 ? ` (${e.names.map((n) => `'${n}'`).join(', ')})` : '')
            ),
        });
    }

    const order: Record<FindingSeverity, number> = { issue: 0, warning: 1, info: 2 };
    findings.sort((a, b) => order[a.severity] - order[b.severity]);

    return {
        findings,
        map: { entities },
        stats: {
            models: totalModels,
            entities: entities.length,
            sharedEntities: sharedEntities.length,
            findings: findings.length,
        },
    };
}

// ── AI-samenvatting op estate-niveau ─────────────────────────────────────────

const PORTFOLIO_SYSTEM = `Je bent een senior Power BI-consultant en data-architect die een LANDSCHAP van meerdere semantische modellen (rapporten) van één organisatie beoordeelt.
Je krijgt een overzicht van de modellen, welke entiteiten (dimensies/feiten) gedeeld worden, en de uitkomst van geautomatiseerde cross-model-checks.

Schrijf een beknopte beoordeling in het Nederlands (markdown, max ~400 woorden) met exact deze secties:

## Wat dit landschap doet
Eén alinea: het vermoedelijke domein en hoe de modellen zich tot elkaar verhouden (overlappen ze, of dekken ze losse gebieden?).

## Grootste inconsistenties
Genummerde lijst: de risicovolste verschillen tussen modellen (afwijkende measures, gedrifte dimensies, conflicterende relaties). Gebruik exacte namen.

## Top consolidatiekansen
Genummerde lijst: welke dimensies/measures samengevoegd kunnen worden tot een gedeeld dataset, en wat dat oplevert.

## Governance quick-wins
Genummerde lijst met direct uitvoerbare stappen (naamconventie, één bron voor een measure, enz.).

Regels: gebruik 'Model'[object]-notatie waar dat helpt, verzin niets dat niet in het overzicht staat, en wees eerlijk als het landschap juist consistent is.`;

export interface PortfolioNarrativeResult {
    narrative: string;
    inputTokens: number;
    outputTokens: number;
}

// Deterministische portfolio-context voor de LLM (byte-stabiel houden i.v.m.
// prompt caching bij herhaalde runs).
export function buildPortfolioContext(
    models: PortfolioModel[],
    map: PortfolioMap,
    findings: CrossModelFinding[]
): string {
    const out: string[] = [`# Portfolio: ${models.length} modellen`, ''];

    out.push('## Modellen');
    for (const { name, model } of models) {
        const cols = model.tables.reduce((n, t) => n + t.columns.length, 0);
        const meas = model.tables.reduce((n, t) => n + t.measures.length, 0);
        out.push(
            `- ${name}: ${model.tables.length} tabellen, ${cols} kolommen, ${meas} measures, ${model.relationships.length} relaties`
        );
    }
    out.push('');

    const shared = map.entities.filter((e) => e.modelCount >= 2);
    if (shared.length) {
        out.push('## Gedeelde entiteiten (in ≥2 modellen)');
        for (const e of shared.slice(0, 40)) {
            out.push(
                `- ${e.names.map((n) => `'${n}'`).join(' / ')} — in ${e.models.join(', ')}`
            );
        }
        out.push('');
    }

    out.push('## Cross-model bevindingen');
    if (findings.length) {
        for (const f of findings) {
            out.push(`### [${f.severity}] ${f.title}`);
            for (const item of f.items.slice(0, 20)) out.push(`- ${item}`);
            out.push('');
        }
    } else {
        out.push('- Geen cross-model bevindingen: de modellen zijn onderling consistent.');
        out.push('');
    }

    return out.join('\n');
}

export async function generatePortfolioNarrative(
    context: string
): Promise<PortfolioNarrativeResult> {
    if (!process.env.ANTHROPIC_API_KEY) {
        return {
            narrative:
                '*AI-samenvatting niet beschikbaar (geen API key geconfigureerd). De cross-model-checks hierboven zijn wel volledig.*',
            inputTokens: 0,
            outputTokens: 0,
        };
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: PORTFOLIO_SYSTEM,
        messages: [{ role: 'user', content: context }],
    });

    const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('');

    return {
        narrative: text,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
    };
}
