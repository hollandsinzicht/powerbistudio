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

// Gecombineerde LLM-context voor een projectchat: de (getagde) modellen achter
// elkaar met een `# Model: {naam}`-kop, begrensd op MAX_SCHEMA_CONTEXT_BYTES.
// Bij overschrijding krijgt elk model een gelijk bytebudget. Deterministisch
// (byte-stabiel bij dezelfde selectie) i.v.m. prompt caching.
export function buildProjectChatContext(
    models: { name: string; schemaMarkdown: string }[]
): SchemaContext {
    const section = (name: string, body: string) => `# Model: ${name}\n\n${body}`;
    const full = models.map((m) => section(m.name, m.schemaMarkdown)).join('\n\n---\n\n');
    if (Buffer.byteLength(full, 'utf-8') <= MAX_SCHEMA_CONTEXT_BYTES) {
        return { markdown: full, truncated: false };
    }

    const budget = Math.floor(MAX_SCHEMA_CONTEXT_BYTES / Math.max(1, models.length));
    const parts = models.map((m) => {
        const head = `# Model: ${m.name}\n\n`;
        const room = Math.max(0, budget - Buffer.byteLength(head, 'utf-8'));
        const body =
            Buffer.byteLength(m.schemaMarkdown, 'utf-8') <= room
                ? m.schemaMarkdown
                : `${m.schemaMarkdown.slice(0, room)}\n… (ingekort)`;
        return head + body;
    });
    return { markdown: parts.join('\n\n---\n\n'), truncated: true };
}
