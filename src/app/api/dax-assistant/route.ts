import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const systemPrompt = `Je bent een DAX-expert voor Microsoft Power BI. 
Je helpt gebruikers op twee manieren:
1. Als ze beschrijven wat ze willen berekenen, genereer je de correcte DAX-formule
2. Als ze een bestaande DAX-formule aanleveren, leg je die uit in begrijpelijk Nederlands

Regels:
- Geef altijd een werkende DAX-formule, nooit pseudocode
- Gebruik CALCULATE, FILTER, ALL, RELATED en andere standaard DAX-functies correct
- Voeg altijd een beknopte uitleg toe (max 3 zinnen) na de formule
- Als context ontbreekt, maak dan een redelijke aanname en benoem die
- Antwoord altijd in het Nederlands
- Format je antwoord met markdown (gebruik code blocks voor de DAX in 'dax' formaat)`;

export async function POST(req: Request) {
    try {
        const { message, context, mode } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        if (!process.env.ANTHROPIC_API_KEY) {
            // Falback mode if no API key is set for development
            return NextResponse.json({
                result: `*Let op: Geen Anthropic API key geconfigureerd.* \n\nDit is een demo response voor: \`${message}\`\n\n\`\`\`dax\nMock_Measure = \nCALCULATE (\n    [Total Sales],\n    'Date'[Year] = YEAR(TODAY())\n)\n\`\`\`\n\nDit berekent de sales voor het huidige jaar.`
            });
        }

        const modeText = mode === 'generate' ? 'Genereer DAX voor:' : 'Leg deze DAX formule uit:';
        const contextText = context && context !== 'Geen context' ? `\n\nContext voor dit model/bedrijf: ${context}` : '';

        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: `${modeText}\n${message}${contextText}`
                }
            ],
        });

        // Handle extraction safely, dealing with TextBlock type narrowing
        let resultText = '';
        const firstContentField = response.content[0];
        if (firstContentField?.type === 'text') {
            resultText = firstContentField.text;
        }

        return NextResponse.json({ result: resultText });

    } catch (error) {
        console.error('Anthropic API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
        return NextResponse.json({
            result: `**Er ging iets mis bij het verwerken van je vraag.**\n\nFoutmelding: ${errorMessage}\n\nProbeer het opnieuw of neem contact op via info@powerbistudio.nl.`
        });
    }
}
