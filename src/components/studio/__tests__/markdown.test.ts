import { describe, expect, it } from 'vitest';
import { renderStudioMarkdown } from '../markdown';

describe('renderStudioMarkdown', () => {
    it('rendert markdown-tabellen als echte tabellen', () => {
        const html = renderStudioMarkdown(
            '| Measure | Definitie |\n|---|---|\n| [Verzuimuren] | SUM(Feit_Verzuim[Uren]) |\n| [Totaal Verzuimuren] | SUM( Feit_Verzuim[Uren] ) |'
        );
        expect(html).toContain('<table');
        expect(html).toContain('<th');
        expect((html.match(/<tr>/g) ?? []).length).toBe(3); // 1 header + 2 body
        expect(html).toContain('[Verzuimuren]');
        expect(html).not.toContain('|'); // geen rauwe pipes meer
    });

    it('rendert --- als scheidingslijn en koppen als koppen', () => {
        const html = renderStudioMarkdown('## Voor welk gebruik?\n\n---\n\nTekst');
        expect(html).toContain('<hr');
        expect(html).toContain('<h4');
        expect(html).toContain('Voor welk gebruik?');
    });

    it('groepeert lijstregels in één lijst', () => {
        const html = renderStudioMarkdown('- punt een\n- punt twee\n\n1. eerste\n2. tweede');
        expect((html.match(/<ul/g) ?? []).length).toBe(1);
        expect((html.match(/<ol/g) ?? []).length).toBe(1);
        expect((html.match(/<li>/g) ?? []).length).toBe(4);
    });

    it('houdt dax-codeblokken intact, ook tijdens streaming (onafgesloten)', () => {
        const af = renderStudioMarkdown('```dax\nVerzuim % = DIVIDE([a], [b])\n```');
        expect(af).toContain('<pre><code>Verzuim % = DIVIDE([a], [b])</code></pre>');
        const streaming = renderStudioMarkdown('```dax\nVerzuim % = DIV');
        expect(streaming).toContain('<pre><code>Verzuim % = DIV</code></pre>');
    });

    it('escapet HTML vóór alle opmaak (prompt-injection)', () => {
        const html = renderStudioMarkdown('Hoi <script>alert(1)</script> | **vet** |');
        expect(html).not.toContain('<script>');
        expect(html).toContain('&lt;script&gt;');
    });

    it('maakt alinea-scheiding op lege regels', () => {
        const html = renderStudioMarkdown('Eerste alinea.\n\nTweede alinea.');
        expect((html.match(/<p /g) ?? []).length).toBe(2);
    });
});
