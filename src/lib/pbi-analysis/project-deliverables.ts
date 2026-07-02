import Anthropic from '@anthropic-ai/sdk';

// Opleveringen op PROJECTniveau: één gebundeld document over meerdere modellen.
// De aanroeper levert een gecombineerde context aan (buildProjectChatContext):
// elk model onder een "# Model: {naam}"-kop. Spiegelt documentation.ts/rls-tests.ts
// maar met projectgerichte prompts die expliciet cross-model kijken.

export interface DeliverableResult {
    markdown: string;
    inputTokens: number;
    outputTokens: number;
}

const DOC_SYSTEM = `Je bent een senior Power BI-consultant die opleverdocumentatie schrijft voor een PROJECT dat uit meerdere semantische modellen bestaat. Elk model staat onder een "# Model: {naam}"-kop.

Schrijf één helder Nederlands opleverdocument (markdown) met exact deze secties:

## Overzicht van het project
Eén alinea: waar dit landschap over gaat en hoe de modellen zich tot elkaar verhouden (overlappen ze, of dekken ze losse gebieden?), plus de schaal (aantal modellen/tabellen/measures).

## Per model
Voor elk model een korte subsectie (### {modelnaam}) met: de rol/het domein, de belangrijkste tabellen (feit/dimensie) en de kern-measures in begrijpelijke taal (niet de DAX herhalen).

## Samenhang & consistentie
Cross-model: gedeelde dimensies, measures die in meerdere modellen voorkomen (en of ze gelijk zijn), naamdrift en conflicterende relaties. Gebruik exacte namen en benoem in welk model iets zit.

## Aandachtspunten bij onderhoud
Korte lijst: wat een ontwikkelaar moet weten (bijv. RLS-patroon dat in één model zit terwijl andere modellen erop leunen, ontbrekende formatstrings, consolidatiekansen).

Regels: gebruik 'Tabel'[Kolom]- en [Measure]-notatie, verzin niets dat niet in de context staat, wees beknopt maar volledig. Dit is een deliverable die aan een klant of in een repo opgeleverd kan worden.`;

const RLS_SYSTEM = `Je bent een Power BI-specialist die RLS-testcases voorstelt voor een PROJECT met meerdere modellen. Elk model staat onder een "# Model: {naam}"-kop. LET OP: RLS-rollen en hun DAX-filters staan NIET in het schema — die zitten in de Power BI Service. Je leidt het beoogde RLS-patroon af en stelt voor wat getest moet worden. Cruciaal: het RLS-patroon kan in één model zitten terwijl andere modellen erop leunen — benoem dat expliciet.

Schrijf een Nederlands testdocument (markdown) met deze secties:

## Gedetecteerd RLS-patroon (per model)
Per model: welk RLS-patroon het schema suggereert (Manager_UPN/Manager_Pad, PATH/PATHCONTAINS, USERPRINCIPALNAME, organisatie-hiërarchie) of dat er géén patroon zichtbaar is. Exacte 'Model'[Tabel][Kolom]-verwijzingen.

## Samenhang tussen modellen
Welk model draagt de RLS-logica, en welke modellen zouden dezelfde afscherming moeten erven? Waar loopt het risico dat afscherming in het ene rapport wél en in het andere níet werkt?

## Testmatrix
Een markdown-tabel: | Model | Rol/gebruiker | Verwacht zichtbaar | Verwacht NIET zichtbaar | Hoe te testen |. Dek per relevant model minimaal een teammanager, een hogere manager en de eigen-rij-zichtbaarheid.

## Aandachtspunten
Wat dit NIET test (de echte rol-DAX) en waar het in de praktijk misgaat (RLS op e-mail i.p.v. hiërarchie, ontbrekende historiek).

Regels: exacte namen, verzin geen kolommen, en wees eerlijk waar een model geen RLS-patroon prijsgeeft.`;

async function generate(system: string, context: string, maxTokens: number): Promise<DeliverableResult> {
    if (!process.env.ANTHROPIC_API_KEY) {
        return {
            markdown: '*Oplevering niet beschikbaar (geen API key geconfigureerd).*',
            inputTokens: 0,
            outputTokens: 0,
        };
    }
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: context }],
    });
    const markdown = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    return { markdown, inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens };
}

export function generateProjectDocumentation(context: string): Promise<DeliverableResult> {
    return generate(DOC_SYSTEM, context, 4000);
}

export function generateProjectRls(context: string): Promise<DeliverableResult> {
    return generate(RLS_SYSTEM, context, 3500);
}
