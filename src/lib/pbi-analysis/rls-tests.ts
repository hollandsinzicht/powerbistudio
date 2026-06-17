import Anthropic from '@anthropic-ai/sdk';

// RLS-testcases-generator (delivery-versnelling, laag 2). De parser leest géén
// RLS-rollen of hun DAX-filters uit (die zitten meestal pas in de Service). Wat
// het schema wél prijsgeeft: het hiërarchische-RLS-PATROON — een Manager-pad
// (PATH/PATHCONTAINS), USERPRINCIPALNAME-gebruik, een organisatie-hiërarchie.
// We genereren daarom een TESTMATRIX op basis van dat gedetecteerde patroon:
// concrete "rol X moet rij Y wél/niet zien"-scenario's die JW handmatig of in
// CI tegen het gepubliceerde model draait. Eerlijk over de grens: dit toetst
// niet de echte RLS-rollen, het stelt voor wat getest moet worden.

const RLS_SYSTEM = `Je bent een Power BI-specialist die RLS-testcases voorstelt voor een HR-model.
Je krijgt het modelschema (tabellen, kolommen, measures, relaties). LET OP: RLS-rollen en hun DAX-filters staan NIET in dit schema — die zitten in de Power BI Service. Je leidt het beoogde RLS-patroon af uit het schema en stelt voor wat getest moet worden.

Schrijf een Nederlands testdocument (markdown) met deze secties:

## Gedetecteerd RLS-patroon
Wat het schema suggereert over RLS: is er een hiërarchisch patroon (kolommen als Manager_UPN/Manager_Pad, PATH/PATHCONTAINS in measures, USERPRINCIPALNAME)? Een organisatie-hiërarchie? Zeg expliciet of je een patroon ziet of niet, met exacte tabel-/kolomnamen.

## Testmatrix
Een markdown-tabel met concrete testscenario's. Kolommen: | Rol/gebruiker | Verwacht zichtbaar | Verwacht NIET zichtbaar | Hoe te testen |. Dek minimaal: een teammanager (eigen team wel, ander team niet), een hogere manager (eigen tak wel, zustertak niet), een gebruiker zonder rol (niets of alles — afhankelijk van ontwerp), en de eigen-rij-zichtbaarheid.

## Aandachtspunten
Wat dit NIET test (de echte rol-DAX, want niet in het schema), en waar het misgaat in de praktijk (RLS op e-mail i.p.v. hiërarchie, ontbrekende historiek waardoor oude toegang blijft hangen).

Regels: gebruik exacte 'Tabel'[Kolom]-notatie, verzin geen kolommen die er niet zijn, en wees eerlijk als het schema geen RLS-patroon prijsgeeft (stel dan voor welke kolommen nodig zouden zijn).`;

export interface RlsTestsResult {
    markdown: string;
    inputTokens: number;
    outputTokens: number;
}

export async function generateRlsTests(schemaMarkdown: string): Promise<RlsTestsResult> {
    if (!process.env.ANTHROPIC_API_KEY) {
        return {
            markdown: '*RLS-testcases niet beschikbaar (geen API key geconfigureerd).*',
            inputTokens: 0,
            outputTokens: 0,
        };
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        system: RLS_SYSTEM,
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
