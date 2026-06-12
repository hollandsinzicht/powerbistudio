import { describe, expect, it } from 'vitest';
import { runChecks } from '../checks';
import { PbiModel } from '@/lib/pbi-parser';

const model: PbiModel = {
    name: 'test',
    source: 'bim',
    tables: [
        {
            name: 'Feit_Verkoop',
            isHidden: false,
            columns: [
                { name: 'KlantID', dataType: 'int64', isHidden: true },
                { name: 'Bedrag', dataType: 'decimal', isHidden: false },
                { name: 'Notitie', dataType: 'string', isHidden: false }, // nergens gebruikt
            ],
            measures: [
                {
                    name: 'Omzet',
                    expression: 'SUM(Feit_Verkoop[Bedrag])',
                    displayFolder: '',
                    formatString: '#,0',
                },
                {
                    name: 'Marge %',
                    expression: '[Omzet] / [Kosten] // kale deling',
                    displayFolder: '',
                    formatString: '',
                },
                {
                    name: 'Omzet kopie',
                    expression: 'SUM( Feit_Verkoop[Bedrag] )',
                    displayFolder: '',
                    formatString: '',
                },
            ],
        },
        {
            name: 'Dim Klant',
            isHidden: false,
            columns: [{ name: 'KlantID', dataType: 'int64', isHidden: false }],
            measures: [],
        },
        {
            name: 'Losse Tabel',
            isHidden: false,
            columns: [{ name: 'Waarde', dataType: 'string', isHidden: false }],
            measures: [],
        },
    ],
    relationships: [
        {
            fromTable: 'Feit_Verkoop',
            fromColumn: 'KlantID',
            toTable: 'Dim Klant',
            toColumn: 'KlantID',
            isActive: false,
            crossFilteringBehavior: 'bothDirections',
            fromCardinality: 'many',
            toCardinality: 'many',
        },
    ],
};

describe('runChecks', () => {
    const findings = runChecks(model);
    const byId = Object.fromEntries(findings.map((f) => [f.id, f]));

    it('vindt inactieve, bidirectionele en many-to-many-relaties', () => {
        expect(byId['inactive-relationships'].items).toHaveLength(1);
        expect(byId['bidirectional-filters'].items).toHaveLength(1);
        expect(byId['many-to-many'].items).toHaveLength(1);
    });

    it('vindt losgekoppelde tabellen', () => {
        expect(byId['disconnected-tables'].items).toEqual(["'Losse Tabel'"]);
    });

    it('markeert ongebruikte kolommen als heuristiek', () => {
        expect(byId['unused-columns'].items).toEqual([
            "'Feit_Verkoop'[Notitie]",
            "'Losse Tabel'[Waarde]",
        ]);
        expect(byId['unused-columns'].description).toContain('Heuristiek');
    });

    it('vindt kale delingen maar geen DIVIDE() of comment-slashes', () => {
        expect(byId['division-without-divide'].items).toEqual(["'Feit_Verkoop'[Marge %]"]);
    });

    it('vindt measures zonder format string', () => {
        expect(byId['measures-without-format'].items).toContain("'Feit_Verkoop'[Marge %]");
    });

    it('vindt duplicaat-measures ondanks whitespace-verschil', () => {
        expect(byId['duplicate-measures'].items[0]).toContain("'Feit_Verkoop'[Omzet]");
        expect(byId['duplicate-measures'].items[0]).toContain("'Feit_Verkoop'[Omzet kopie]");
    });

    it('vindt gemengde naamgeving (spaties én underscores)', () => {
        expect(byId['naming-consistency']).toBeDefined();
    });

    it('sorteert op severity (issues eerst)', () => {
        const severities = findings.map((f) => f.severity);
        const order = { issue: 0, warning: 1, info: 2 } as const;
        const sorted = [...severities].sort((a, b) => order[a] - order[b]);
        expect(severities).toEqual(sorted);
    });
});
