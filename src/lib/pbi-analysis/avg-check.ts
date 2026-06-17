import Anthropic from '@anthropic-ai/sdk';

// AVG-checklist-tegen-het-model (delivery-versnelling, laag 2). Toetst een
// ingelezen HR-model tegen de 12 AVG-controlepunten uit de AVG-checklist HR
// (zie scripts/generate-avg-checklist-hr.tsx). Sommige punten zijn detecteerbaar
// uit het schema (SCD2-historiek, dataminimalisatie, hiërarchisch RLS-patroon),
// de governance-punten niet — die markeert het model eerlijk als
// 'niet-detecteerbaar' zodat JW ze handmatig beoordeelt. Dit is in feite de
// halfgeautomatiseerde Quick Scan.

export interface AvgPunt {
    nummer: number;
    titel: string;
    vraag: string;
    /** Of dit punt überhaupt uit een modelschema af te leiden is. Stuurt het model. */
    detecteerbaar: 'ja' | 'deels' | 'nee';
}

// Synced met de 12 punten in scripts/generate-avg-checklist-hr.tsx.
export const AVG_PUNTEN: AvgPunt[] = [
    { nummer: 1, titel: 'Hiërarchische RLS op organisatie-eenheid', vraag: 'Zien managers alleen hun eigen team — automatisch, zonder maandelijks bijhouden?', detecteerbaar: 'deels' },
    { nummer: 2, titel: 'Type-2 historiek op medewerker-dimensie', vraag: 'Klopt het verloop-cijfer van twee jaar terug nog steeds na reorganisaties?', detecteerbaar: 'ja' },
    { nummer: 3, titel: 'Dataminimalisatie — alleen velden die rapporten nodig hebben', vraag: 'Zit BSN, geboortedatum of paspoortnummer in het model terwijl geen rapport dat gebruikt?', detecteerbaar: 'ja' },
    { nummer: 4, titel: 'Doelbinding per dataset', vraag: 'Is per dataset vastgelegd wat het doel van de verwerking is?', detecteerbaar: 'nee' },
    { nummer: 5, titel: 'Bewaartermijnen automatisch toegepast', vraag: 'Verdwijnen uitgestroomde medewerkers automatisch na de wettelijke bewaartermijn?', detecteerbaar: 'deels' },
    { nummer: 6, titel: 'Verwerkingsregister gekoppeld aan het model', vraag: 'Weet de DPO welke velden, RLS-rollen en ontvangers aan welke dataset hangen?', detecteerbaar: 'nee' },
    { nummer: 7, titel: 'Toegangsbeheer in Power BI Service', vraag: 'Krijgt elke nieuwe HR-medewerker automatisch de juiste workspace-toegang?', detecteerbaar: 'nee' },
    { nummer: 8, titel: 'Export-beperking voor gevoelige rapporten', vraag: 'Kan iedereen die het verzuim-dashboard ziet, dat zonder restricties exporteren?', detecteerbaar: 'nee' },
    { nummer: 9, titel: 'Auditeerbare data-lineage', vraag: 'Kun je voor één veld terugherleiden uit welk AFAS/Visma/Nmbrs-veld het komt?', detecteerbaar: 'deels' },
    { nummer: 10, titel: 'Refresh-monitoring met stale-data-melding', vraag: 'Krijgen gebruikers een waarschuwing als het verzuim-cijfer 5 dagen oud is?', detecteerbaar: 'nee' },
    { nummer: 11, titel: 'Test-omgeving zonder productiedata', vraag: 'Bouwen ontwikkelaars met echte medewerker-data of met geanonimiseerde testdata?', detecteerbaar: 'nee' },
    { nummer: 12, titel: 'Incident-protocol voor datalekken', vraag: 'Weet je binnen 72 uur welke medewerkers wél en niet getroffen zijn bij een lek?', detecteerbaar: 'nee' },
];

export type AvgStatus = 'voldaan' | 'risico' | 'niet-detecteerbaar';

export interface AvgPuntResult {
    nummer: number;
    titel: string;
    status: AvgStatus;
    bevinding: string;
    aanbeveling: string;
}

export interface AvgReportResult {
    report: AvgPuntResult[];
    inputTokens: number;
    outputTokens: number;
}

function mockReport(): AvgPuntResult[] {
    return AVG_PUNTEN.map((p) => ({
        nummer: p.nummer,
        titel: p.titel,
        status: 'niet-detecteerbaar' as AvgStatus,
        bevinding: 'AVG-check niet beschikbaar (geen API key geconfigureerd).',
        aanbeveling: '',
    }));
}

const AVG_SYSTEM = `Je bent een Power BI- en AVG-specialist die een HR-datamodel toetst tegen de AVG-checklist HR (12 punten).
Je krijgt het volledige modelschema (tabellen, kolommen, measures met DAX, relaties). Je ziet NIET: de Power BI Service-instellingen, workspace-toegang, brondata of organisatorische processen.

Beoordeel ELK van de 12 punten en geef per punt een status:
- "voldaan": het schema laat duidelijk zien dat dit goed zit (bijv. GeldigVan/GeldigTot-kolommen aanwezig voor SCD2; geen gevoelige velden als BSN/geboortedatum aanwezig).
- "risico": het schema laat zien dat dit waarschijnlijk NIET goed zit (bijv. BSN-kolom aanwezig zonder dat een measure die gebruikt; geen historiek-kolommen op de medewerker-dimensie).
- "niet-detecteerbaar": dit punt gaat over Service-instellingen, processen of governance die niet uit een modelschema blijken. Wees hier eerlijk — verzin geen oordeel.

Per punt: een korte feitelijke 'bevinding' (wat je in het schema ziet, met exacte tabel-/kolomnamen) en een concrete 'aanbeveling' (wat te doen; bij niet-detecteerbaar: welke vraag JW handmatig moet stellen).

Detecteerbaarheidshint per punt is meegegeven — maar baseer je oordeel op wat je echt in het schema ziet.

OUTPUT — alleen valide JSON, geen markdown-fences, geen uitleg eromheen:
{ "report": [ { "nummer": 1, "titel": "...", "status": "voldaan|risico|niet-detecteerbaar", "bevinding": "...", "aanbeveling": "..." } ] }
Exact 12 items, in volgorde 1 t/m 12.`;

export async function generateAvgReport(schemaMarkdown: string): Promise<AvgReportResult> {
    if (!process.env.ANTHROPIC_API_KEY) {
        return { report: mockReport(), inputTokens: 0, outputTokens: 0 };
    }

    const puntenLijst = AVG_PUNTEN.map(
        (p) => `${p.nummer}. ${p.titel} — vraag: "${p.vraag}" (detecteerbaar uit schema: ${p.detecteerbaar})`
    ).join('\n');

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: AVG_SYSTEM,
        messages: [
            {
                role: 'user',
                content: `De 12 AVG-controlepunten:\n${puntenLijst}\n\n---\n\nModelschema:\n${schemaMarkdown}\n\nGeef het volledige rapport als JSON.`,
            },
        ],
    });

    const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('');

    const report = parseReport(text);
    return {
        report,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
    };
}

const VALID_STATUS: AvgStatus[] = ['voldaan', 'risico', 'niet-detecteerbaar'];

/** Parse + normaliseer; valt terug op de checklist-titels zodat altijd 12 punten terugkomen. */
function parseReport(text: string): AvgPuntResult[] {
    let parsed: { report?: unknown } = {};
    try {
        const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
    } catch {
        console.error('AVG-check: kon JSON niet parsen');
        return mockReport().map((p) => ({ ...p, bevinding: 'Kon AVG-rapport niet verwerken.' }));
    }

    const raw = Array.isArray(parsed.report) ? parsed.report : [];
    const byNummer = new Map<number, Record<string, unknown>>();
    for (const item of raw) {
        if (item && typeof item === 'object' && typeof (item as { nummer?: unknown }).nummer === 'number') {
            byNummer.set((item as { nummer: number }).nummer, item as Record<string, unknown>);
        }
    }

    // Anker op de 12 bekende punten — zo komt er altijd een volledig rapport terug.
    return AVG_PUNTEN.map((punt) => {
        const item = byNummer.get(punt.nummer);
        const status = item?.status
        const safeStatus = VALID_STATUS.includes(status as AvgStatus)
            ? (status as AvgStatus)
            : 'niet-detecteerbaar';
        return {
            nummer: punt.nummer,
            titel: punt.titel,
            status: safeStatus,
            bevinding: typeof item?.bevinding === 'string' ? item.bevinding : '—',
            aanbeveling: typeof item?.aanbeveling === 'string' ? item.aanbeveling : '',
        };
    });
}
