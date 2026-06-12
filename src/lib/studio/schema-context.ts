import { PbiModel, toMarkdown } from '@/lib/pbi-parser';
import { MAX_SCHEMA_CONTEXT_BYTES } from './limits';

export interface SchemaContext {
    markdown: string;
    truncated: boolean;
}

// LLM-context voor een model. Deterministisch (zelfde input → zelfde bytes),
// anders mist prompt caching. Bij zeer grote modellen eerst measure-DAX
// inkorten tot de eerste regel — namen en structuur blijven volledig.
export function buildSchemaContext(model: PbiModel): SchemaContext {
    const full = toMarkdown(model);
    if (Buffer.byteLength(full, 'utf-8') <= MAX_SCHEMA_CONTEXT_BYTES) {
        return { markdown: full, truncated: false };
    }

    const compactModel: PbiModel = {
        ...model,
        tables: model.tables.map((t) => ({
            ...t,
            measures: t.measures.map((m) => {
                const firstLine = m.expression.split('\n')[0];
                const shortened =
                    m.expression.includes('\n') || firstLine.length > 200
                        ? `${firstLine.slice(0, 200)} … (ingekort)`
                        : m.expression;
                return { ...m, expression: shortened };
            }),
        })),
    };
    return { markdown: toMarkdown(compactModel), truncated: true };
}
