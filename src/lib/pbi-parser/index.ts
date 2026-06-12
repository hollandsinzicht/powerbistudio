import JSZip from 'jszip';
import { decodeBytes } from './decode';
import { parseTmsl } from './tmsl';
import { parseTmdlFiles } from './tmdl';
import { PbiModel } from './types';

export type { PbiModel, PbiTable, PbiColumn, PbiMeasure, PbiRelationship, PbiModelStats } from './types';
export { modelStats } from './types';
export { toMarkdown } from './markdown';

export const PBIX_HELP =
    'Een .pbix kan niet direct gelezen worden (het datamodel is propriëtair gecomprimeerd). ' +
    'Exporteer in Power BI Desktop via: Bestand > Exporteren > Power BI-sjabloon (.pbit) ' +
    'en upload dat bestand.';

export type PbiParseErrorCode =
    | 'pbix-not-supported'
    | 'invalid-zip'
    | 'no-model-in-zip'
    | 'invalid-json'
    | 'empty-model'
    | 'unknown-type';

export class PbiParseError extends Error {
    constructor(public code: PbiParseErrorCode, message: string) {
        super(message);
        this.name = 'PbiParseError';
    }
}

export const ALLOWED_EXTENSIONS = ['.pbit', '.bim', '.json', '.tmdl', '.zip'];

function fileStem(filename: string): string {
    const base = filename.split('/').pop() ?? filename;
    const idx = base.lastIndexOf('.');
    return idx > 0 ? base.slice(0, idx) : base;
}

function fileExt(filename: string): string {
    const base = filename.split('/').pop() ?? filename;
    const idx = base.lastIndexOf('.');
    return idx >= 0 ? base.slice(idx).toLowerCase() : '';
}

function parseJson(text: string, filename: string): Record<string, unknown> {
    try {
        return JSON.parse(text);
    } catch (e) {
        throw new PbiParseError(
            'invalid-json',
            `Kon JSON niet parsen uit ${filename}: ${e instanceof Error ? e.message : e}`
        );
    }
}

export async function parseModel(filename: string, buffer: Uint8Array): Promise<PbiModel> {
    const ext = fileExt(filename);
    const stem = fileStem(filename);
    let model: PbiModel;

    if (ext === '.pbix') {
        throw new PbiParseError('pbix-not-supported', PBIX_HELP);
    } else if (ext === '.pbit' || ext === '.zip') {
        let zip: JSZip;
        try {
            zip = await JSZip.loadAsync(buffer);
        } catch {
            throw new PbiParseError(
                'invalid-zip',
                `${filename} is geen geldig zip/pbit-bestand. ${PBIX_HELP}`
            );
        }
        const schemaEntry = zip.file('DataModelSchema');
        if (schemaEntry) {
            const text = decodeBytes(await schemaEntry.async('uint8array'));
            model = parseTmsl(parseJson(text, filename), stem, 'pbit');
        } else {
            const tmdlEntries = Object.values(zip.files).filter(
                (f) => !f.dir && f.name.toLowerCase().endsWith('.tmdl')
            );
            if (!tmdlEntries.length) {
                throw new PbiParseError(
                    'no-model-in-zip',
                    `Geen DataModelSchema of .tmdl-bestanden gevonden in ${filename}. ` +
                    `Is dit een hernoemde .pbix? ${PBIX_HELP}`
                );
            }
            const files: [string, string][] = [];
            for (const entry of tmdlEntries) {
                files.push([entry.name, decodeBytes(await entry.async('uint8array'))]);
            }
            model = parseTmdlFiles(files, stem);
        }
    } else if (ext === '.bim' || ext === '.json') {
        model = parseTmsl(parseJson(decodeBytes(buffer), filename), stem, 'bim');
    } else if (ext === '.tmdl') {
        model = parseTmdlFiles([[filename, decodeBytes(buffer)]], stem);
    } else {
        throw new PbiParseError(
            'unknown-type',
            `Onbekend bestandstype: ${filename} (ondersteund: .pbit, .bim, .json, .tmdl, .zip)`
        );
    }

    if (!model.tables.length) {
        throw new PbiParseError(
            'empty-model',
            `Geen tabellen gevonden in ${filename} — is dit wel een datamodel?`
        );
    }
    return model;
}
