import Anthropic from '@anthropic-ai/sdk';
import { Finding } from './checks';

const NARRATIVE_SYSTEM = `Je bent een senior Power BI-consultant die een semantisch model beoordeelt voor een collega-developer.
Je krijgt het volledige modelschema (tabellen, kolommen, measures met DAX, relaties) plus de uitkomst van geautomatiseerde checks.

Schrijf een beknopte beoordeling in het Nederlands (markdown, max ~400 woorden) met exact deze secties:

## Wat dit model doet
Eén alinea: het vermoedelijke doel/domein van dit model, afgeleid uit tabel- en measure-namen.

## Architectuur
Eén alinea: volgt het model een sterschema? Benoem feiten- en dimensietabellen. Wees concreet over wat goed zit.

## Top 3 risico's
Genummerde lijst, gebruik exacte tabel-/measure-namen. Baseer je op de checks én je eigen lezing van de DAX.

## Top 3 quick wins
Genummerde lijst met direct uitvoerbare verbeteringen, inclusief concreet DAX-voorbeeld waar dat helpt.

Regels: gebruik 'Tabel'[Kolom]-notatie, DAX in \`\`\`dax-blokken, verzin niets dat niet in het schema staat, en wees eerlijk als het model er goed uitziet.`;

export interface NarrativeResult {
    narrative: string;
    inputTokens: number;
    outputTokens: number;
}

// Eén LLM-call bij het aanmaken van een project. Bewust non-streaming:
// dit draait server-side in de upload-pipeline.
export async function generateNarrative(
    schemaMarkdown: string,
    findings: Finding[]
): Promise<NarrativeResult> {
    if (!process.env.ANTHROPIC_API_KEY) {
        return {
            narrative:
                '*AI-samenvatting niet beschikbaar (geen API key geconfigureerd). De geautomatiseerde checks hierboven zijn wel volledig.*',
            inputTokens: 0,
            outputTokens: 0,
        };
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const findingsText = findings.length
        ? findings
              .map((f) => `- [${f.severity}] ${f.title}: ${f.items.join('; ')}`)
              .join('\n')
        : '- Geen bevindingen uit de geautomatiseerde checks.';

    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: NARRATIVE_SYSTEM,
        messages: [
            {
                role: 'user',
                content: `${schemaMarkdown}\n\n---\n\nUitkomst geautomatiseerde checks:\n${findingsText}`,
            },
        ],
    });

    const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('');

    return {
        narrative: text,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
    };
}
