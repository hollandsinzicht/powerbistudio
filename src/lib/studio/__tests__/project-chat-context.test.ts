import { describe, it, expect } from 'vitest';
import { buildProjectChatContext } from '../schema-context';
import { MAX_SCHEMA_CONTEXT_BYTES } from '../limits';

describe('buildProjectChatContext', () => {
    it('combineert modellen met een kop per model, in volgorde', () => {
        const { markdown, truncated } = buildProjectChatContext([
            { name: 'Verkoop', schemaMarkdown: 'tabel A' },
            { name: 'Marketing', schemaMarkdown: 'tabel B' },
        ]);
        expect(truncated).toBe(false);
        expect(markdown).toContain('# Model: Verkoop');
        expect(markdown).toContain('# Model: Marketing');
        expect(markdown.indexOf('Verkoop')).toBeLessThan(markdown.indexOf('Marketing'));
        expect(markdown).toContain('tabel A');
    });

    it('kapt af en blijft binnen het bytebudget bij grote modellen', () => {
        const big = 'x'.repeat(300 * 1024);
        const { markdown, truncated } = buildProjectChatContext([
            { name: 'A', schemaMarkdown: big },
            { name: 'B', schemaMarkdown: big },
        ]);
        expect(truncated).toBe(true);
        // Ruime marge boven het budget door koppen/separators, maar niet ~600KB.
        expect(Buffer.byteLength(markdown, 'utf-8')).toBeLessThanOrEqual(MAX_SCHEMA_CONTEXT_BYTES + 200);
        expect(markdown).toContain('# Model: A');
        expect(markdown).toContain('# Model: B');
        expect(markdown).toContain('… (ingekort)');
    });
});
