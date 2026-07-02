import { describe, expect, it } from 'vitest';
import { crossModelChecks, PortfolioModel } from '../cross-model';
import { PbiModel, PbiColumn, PbiMeasure, PbiTable, PbiRelationship } from '@/lib/pbi-parser';

// ── Fabriekjes voor beknopte modellen ────────────────────────────────────────
const col = (name: string): PbiColumn => ({ name, dataType: 'string', isHidden: false });
const meas = (name: string, expression: string): PbiMeasure => ({
    name,
    expression,
    displayFolder: '',
    formatString: '',
});
const table = (name: string, columns: string[], measures: PbiMeasure[] = []): PbiTable => ({
    name,
    isHidden: false,
    columns: columns.map(col),
    measures,
});
const rel = (
    fromTable: string,
    toTable: string,
    opts: Partial<PbiRelationship> = {}
): PbiRelationship => ({
    fromTable,
    fromColumn: 'KlantID',
    toTable,
    toColumn: 'KlantID',
    isActive: true,
    crossFilteringBehavior: 'oneDirection',
    fromCardinality: 'many',
    toCardinality: 'one',
    ...opts,
});

const modelA: PbiModel = {
    name: 'Verkoop',
    source: 'bim',
    tables: [
        table('Dim_Klant', ['KlantID', 'Naam']),
        table('Feit_Verkoop', ['KlantID', 'Bedrag'], [meas('Omzet', 'SUM(Feit_Verkoop[Bedrag])')]),
    ],
    relationships: [rel('Feit_Verkoop', 'Dim_Klant')],
};

const modelB: PbiModel = {
    name: 'Marketing',
    source: 'bim',
    tables: [
        // 'Klant' i.p.v. 'Dim_Klant' → naamdrift; Email → structuurverschil
        table('Klant', ['KlantID', 'Naam', 'Email']),
        table('Feit_Campagne', ['KlantID', 'Kosten'], [
            meas('Omzet', 'CALCULATE(SUM(Feit_Campagne[Kosten]))'), // zelfde naam, andere DAX
        ]),
    ],
    relationships: [rel('Feit_Campagne', 'Klant')],
};

const modelC: PbiModel = {
    name: 'Finance',
    source: 'bim',
    tables: [
        table('Dim_Klant', ['KlantID', 'Naam']),
        table('Feit_Verkoop', ['KlantID', 'Bedrag'], [
            meas('Revenue', 'SUM(Feit_Verkoop[Bedrag])'), // zelfde DAX als modelA.Omzet, andere naam
        ]),
    ],
    // zelfde paar als modelA, maar bidirectioneel → cardinaliteitsconflict
    relationships: [rel('Feit_Verkoop', 'Dim_Klant', { crossFilteringBehavior: 'bothDirections' })],
};

const portfolio: PortfolioModel[] = [
    { name: 'Verkoop', model: modelA },
    { name: 'Marketing', model: modelB },
    { name: 'Finance', model: modelC },
];

describe('crossModelChecks', () => {
    const { findings, map, stats } = crossModelChecks(portfolio);
    const ids = new Set(findings.map((f) => f.id));

    it('herkent naamdrift van dezelfde entiteit', () => {
        expect(ids.has('entity-naming-drift')).toBe(true);
        const f = findings.find((f) => f.id === 'entity-naming-drift')!;
        expect(f.items.join(' ')).toContain("'Dim_Klant'");
        expect(f.items.join(' ')).toContain("'Klant'");
    });

    it('herkent gedeelde dimensie met afwijkende structuur', () => {
        expect(ids.has('shared-dimension-divergence')).toBe(true);
        const f = findings.find((f) => f.id === 'shared-dimension-divergence')!;
        expect(f.items.join(' ').toLowerCase()).toContain('email');
    });

    it('herkent measure-drift (zelfde naam, andere DAX) als issue', () => {
        expect(ids.has('measure-definition-drift')).toBe(true);
        const f = findings.find((f) => f.id === 'measure-definition-drift')!;
        expect(f.severity).toBe('issue');
        expect(f.items.join(' ')).toContain('[Omzet]');
    });

    it('herkent identieke DAX onder verschillende namen', () => {
        expect(ids.has('duplicate-measure-logic')).toBe(true);
        const f = findings.find((f) => f.id === 'duplicate-measure-logic')!;
        expect(f.items.join(' ')).toContain('Revenue');
        expect(f.items.join(' ')).toContain('Omzet');
    });

    it('herkent conflicterende relatie-cardinaliteit', () => {
        expect(ids.has('relationship-cardinality-conflict')).toBe(true);
        const f = findings.find((f) => f.id === 'relationship-cardinality-conflict')!;
        expect(f.items.join(' ')).toContain('bidirectioneel');
    });

    it('herkent consolidatiekandidaten (entiteit in ≥3 modellen)', () => {
        expect(ids.has('consolidation-candidates')).toBe(true);
        const f = findings.find((f) => f.id === 'consolidation-candidates')!;
        expect(f.items.join(' ')).toContain('3/3');
    });

    it('sorteert findings op ernst (issue eerst)', () => {
        const order = { issue: 0, warning: 1, info: 2 } as const;
        const seq = findings.map((f) => order[f.severity]);
        expect(seq).toEqual([...seq].sort((a, b) => a - b));
    });

    it('bouwt een portfolio-map met de meest gedeelde entiteit bovenaan', () => {
        expect(map.entities[0].key).toBe('klant');
        expect(map.entities[0].modelCount).toBe(3);
        expect(stats.models).toBe(3);
        expect(stats.sharedEntities).toBeGreaterThanOrEqual(2);
    });

    it('geeft geen findings bij één identiek model-paar zonder verschillen', () => {
        const clean = crossModelChecks([
            { name: 'X', model: modelA },
            { name: 'Y', model: modelA },
        ]);
        // Zelfde model twee keer: geen drift/divergentie/conflict.
        expect(clean.findings.some((f) => f.severity === 'issue')).toBe(false);
    });
});
