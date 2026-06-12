// Integratietest: volledige analyse-pipeline (parse → checks → schema-context
// → echte Claude-call) op de verzuim-fixture. Kost API-tokens, dus alleen
// expliciet draaien met: RUN_INTEGRATION=1 npx vitest run
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';
import { parseModel, modelStats } from '@/lib/pbi-parser';
import { runChecks } from '../checks';
import { generateNarrative } from '../narrative';
import { buildSchemaContext } from '@/lib/studio/schema-context';

config({ path: join(__dirname, '..', '..', '..', '..', '.env.local') });

describe.skipIf(!process.env.RUN_INTEGRATION)('analyse-pipeline integratie', () => {
    it('parse → checks → narrative op verzuim.pbit', { timeout: 120_000 }, async () => {
        const buffer = readFileSync(
            join(__dirname, '..', '..', 'pbi-parser', '__tests__', 'fixtures', 'verzuim.pbit')
        );
        const model = await parseModel('verzuim.pbit', buffer);
        const stats = modelStats(model);
        expect(stats.tables).toBe(2);
        expect(stats.measures).toBe(2);

        const findings = runChecks(model);
        const { markdown, truncated } = buildSchemaContext(model);
        expect(truncated).toBe(false);
        expect(markdown).toContain('# Datamodel:');

        const result = await generateNarrative(markdown, findings);
        console.log('--- NARRATIVE ---\n' + result.narrative);
        console.log(`tokens: in=${result.inputTokens} out=${result.outputTokens}`);
        expect(result.narrative).toContain('## Wat dit model doet');
        expect(result.narrative).toContain('## Top 3');
        expect(result.outputTokens).toBeGreaterThan(50);
    });
});
