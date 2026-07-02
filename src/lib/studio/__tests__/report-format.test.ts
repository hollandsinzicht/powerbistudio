import { describe, it, expect } from 'vitest';
import { estimateCostEur } from '../pricing';
import { avgReportToMarkdown, portfolioReportMarkdown } from '../report-format';
import type { AvgPuntResult } from '@/lib/pbi-analysis/avg-check';
import type { CrossModelFinding, PortfolioMap } from '@/lib/pbi-analysis/cross-model';

describe('estimateCostEur', () => {
    it('rekent input- en output-tokens tegen het juiste tarief', () => {
        expect(estimateCostEur(1_000_000, 0)).toBeCloseTo(3 * 0.92, 5);
        expect(estimateCostEur(0, 1_000_000)).toBeCloseTo(15 * 0.92, 5);
        expect(estimateCostEur(0, 0)).toBe(0);
    });
});

describe('avgReportToMarkdown', () => {
    it('zet AVG-JSON om naar leesbare markdown', () => {
        const report: AvgPuntResult[] = [
            { nummer: 1, titel: 'RLS', status: 'voldaan', bevinding: 'Prima.', aanbeveling: 'Behouden.' },
            { nummer: 3, titel: 'Dataminimalisatie', status: 'risico', bevinding: 'BSN aanwezig.', aanbeveling: 'Verwijderen.' },
        ];
        const md = avgReportToMarkdown(report);
        expect(md).toContain('## 1. RLS');
        expect(md).toContain('Voldaan');
        expect(md).toContain('**Aanbeveling:** Verwijderen.');
    });
});

describe('portfolioReportMarkdown', () => {
    it('bouwt een audit-document met narratief, bevindingen en gedeelde entiteiten', () => {
        const findings: CrossModelFinding[] = [
            {
                id: 'measure-definition-drift',
                severity: 'issue',
                title: 'Zelfde measure, verschillende DAX',
                description: 'Omzet verschilt per model.',
                items: ['[Omzet] — 2 definities in A, B'],
            },
        ];
        const map: PortfolioMap = {
            entities: [
                { key: 'klant', names: ['Dim_Klant', 'Klant'], models: ['A', 'B'], modelCount: 2 },
                { key: 'los', names: ['Los'], models: ['A'], modelCount: 1 },
            ],
        };
        const md = portfolioReportMarkdown('HR-landschap', findings, 'Dit landschap draait om HR.', map);
        expect(md).toContain('# Portfolio-audit: HR-landschap');
        expect(md).toContain('Dit landschap draait om HR.');
        expect(md).toContain('Zelfde measure, verschillende DAX');
        expect(md).toContain('[Omzet] — 2 definities in A, B');
        expect(md).toContain('Dim_Klant'); // gedeelde entiteit
        expect(md).not.toContain('**Los**'); // niet-gedeelde entiteit hoort niet in de lijst
    });
});
