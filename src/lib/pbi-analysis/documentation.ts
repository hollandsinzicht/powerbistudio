import Anthropic from '@anthropic-ai/sdk';

// Modeldocumentatie-generator (delivery-versnelling, laag 2). Zet het ingelezen
// modelschema om in een leesbaar NL-opleverdocument. Mirror van narrative.ts:
// één non-streaming call, key-fallback, token-usage terug.

const DOC_SYSTEM = `Je bent een senior Power BI-consultant die opleverdocumentatie schrijft voor een semantisch model.
Je krijgt het volledige modelschema (tabellen, kolommen, measures met DAX, relaties).

Schrijf een helder Nederlands opleverdocument (markdown) met exact deze secties:

## Overzicht
Eén alinea: wat dit model doet, afgeleid uit tabel- en measure-namen, plus de schaal (aantal tabellen/measures/relaties).

## Tabellen
Per relevante tabel één regel: de rol (feit/dimensie/kalender/brug/parameter) en waar de tabel over gaat. Sla puur technische of verborgen hulptabellen samengevat af ("daarnaast N verborgen hulptabellen").

## Measures
Groepeer de measures logisch (bijv. per displayFolder of thema). Leg per measure in één zin uit wat hij berekent — in begrijpelijke taal, niet de DAX herhalen. Noem de exacte measure-naam.

## Relaties & sterschema
Beschrijf het relatiemodel: is het een sterschema? Benoem inactieve relaties, bidirectionele filters en many-to-many als die er zijn, met de exacte tabellen.

## Aandachtspunten
Korte lijst van wat een ontwikkelaar moet weten bij onderhoud (bijv. measures die USERELATIONSHIP nodig hebben, ontbrekende formatstrings, lange measures zonder VAR).

Regels: gebruik 'Tabel'[Kolom]- en [Measure]-notatie, verzin niets dat niet in het schema staat, en wees beknopt maar volledig. Dit is een deliverable die JW aan een klant of in een repo kan opleveren.`;

export interface DocResult {
    markdown: string;
    inputTokens: number;
    outputTokens: number;
}

export async function generateModelDocumentation(schemaMarkdown: string): Promise<DocResult> {
    if (!process.env.ANTHROPIC_API_KEY) {
        return {
            markdown:
                '*Modeldocumentatie niet beschikbaar (geen API key geconfigureerd).*',
            inputTokens: 0,
            outputTokens: 0,
        };
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        system: DOC_SYSTEM,
        messages: [{ role: 'user', content: schemaMarkdown }],
    });

    const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('');

    return {
        markdown: text,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
    };
}
