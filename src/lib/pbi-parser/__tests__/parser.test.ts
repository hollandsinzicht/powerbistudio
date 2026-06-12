import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import JSZip from 'jszip';
import { parseModel, PbiParseError, toMarkdown, PbiModel } from '../index';
import { parseTmdlFiles } from '../tmdl';

const FIXTURES = join(__dirname, 'fixtures');

// De verwachte output is gegenereerd met de originele Python-parser
// (parse_pbi_model.py --json); de Python-output kent geen kardinaliteit,
// dus die strippen we vóór de vergelijking.
function withoutCardinality(model: PbiModel) {
    return {
        ...model,
        relationships: model.relationships.map(
            ({ fromCardinality: _f, toCardinality: _t, ...rest }) => rest
        ),
    };
}

function expectedJson(name: string) {
    return JSON.parse(readFileSync(join(FIXTURES, name), 'utf-8'));
}

function expectedMd(name: string) {
    return readFileSync(join(FIXTURES, name), 'utf-8');
}

describe('parseModel', () => {
    it('parst een .pbit (UTF-16LE DataModelSchema) identiek aan de Python-parser', async () => {
        const buffer = readFileSync(join(FIXTURES, 'verzuim.pbit'));
        const model = await parseModel('verzuim.pbit', buffer);
        expect(withoutCardinality(model)).toEqual(expectedJson('expected-pbit.json'));
        expect(toMarkdown(model)).toBe(expectedMd('expected-pbit.md'));
    });

    it('parst een model.bim (TMSL) identiek aan de Python-parser', async () => {
        const buffer = readFileSync(join(FIXTURES, 'bim', 'model.bim'));
        const model = await parseModel('model.bim', buffer);
        expect(withoutCardinality(model)).toEqual(expectedJson('expected-bim.json'));
        expect(toMarkdown(model)).toBe(expectedMd('expected-bim.md'));
    });

    it('parst TMDL-bestanden identiek aan de Python-parser', () => {
        const dir = join(FIXTURES, 'tmdl', 'definition');
        const files: [string, string][] = [];
        const walk = (d: string) => {
            for (const entry of readdirSync(d, { withFileTypes: true })) {
                const p = join(d, entry.name);
                if (entry.isDirectory()) walk(p);
                else if (entry.name.endsWith('.tmdl')) files.push([entry.name, readFileSync(p, 'utf-8')]);
            }
        };
        walk(dir);
        const model = parseTmdlFiles(files, 'tmdl');
        expect(withoutCardinality(model)).toEqual(expectedJson('expected-tmdl.json'));
        expect(toMarkdown(model)).toBe(expectedMd('expected-tmdl.md'));
    });

    it('parst een zip met .tmdl-bestanden', async () => {
        const dir = join(FIXTURES, 'tmdl', 'definition');
        const zip = new JSZip();
        zip.file('definition/relationships.tmdl', readFileSync(join(dir, 'relationships.tmdl')));
        zip.file('definition/tables/Dim Medewerker.tmdl', readFileSync(join(dir, 'tables', 'Dim Medewerker.tmdl')));
        zip.file('definition/tables/Feit_Verzuim.tmdl', readFileSync(join(dir, 'tables', 'Feit_Verzuim.tmdl')));
        const buffer = await zip.generateAsync({ type: 'uint8array' });
        const model = await parseModel('project.zip', buffer);
        expect(model.tables.map((t) => t.name).sort()).toEqual(['Dim Medewerker', 'Feit_Verzuim']);
        expect(model.relationships).toHaveLength(2);
    });

    it('weigert een .pbix met de export-instructie', async () => {
        await expect(parseModel('rapport.pbix', new Uint8Array())).rejects.toMatchObject({
            code: 'pbix-not-supported',
            message: expect.stringContaining('Power BI-sjabloon'),
        });
    });

    it('herkent een hernoemde .pbix (zip zonder datamodel)', async () => {
        const zip = new JSZip();
        zip.file('Report/Layout', 'niet relevant');
        const buffer = await zip.generateAsync({ type: 'uint8array' });
        await expect(parseModel('hernoemd.pbit', buffer)).rejects.toMatchObject({
            code: 'no-model-in-zip',
            message: expect.stringContaining('hernoemde .pbix'),
        });
    });

    it('weigert ongeldig zip-bestand', async () => {
        await expect(
            parseModel('kapot.pbit', new TextEncoder().encode('geen zip'))
        ).rejects.toMatchObject({ code: 'invalid-zip' });
    });

    it('weigert een leeg model', async () => {
        const buffer = new TextEncoder().encode(JSON.stringify({ model: { tables: [] } }));
        await expect(parseModel('leeg.bim', buffer)).rejects.toMatchObject({ code: 'empty-model' });
    });

    it('weigert onbekende bestandstypen', async () => {
        await expect(parseModel('data.csv', new Uint8Array())).rejects.toBeInstanceOf(PbiParseError);
    });
});
