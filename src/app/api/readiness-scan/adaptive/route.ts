import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkRateLimit } from '@/lib/security';

// Adaptieve HR Analytics Readiness Scan (laag 3, client-facing). Turn-based:
// de client houdt het gesprek vast en post elke beurt de volledige historie.
// De LLM geeft óf de volgende, op eerdere antwoorden afgestemde meerkeuzevraag,
// óf — als er genoeg signaal is — een eindbeoordeling met een concrete
// vervolgstap (Quick Scan of verkennend gesprek). Stateless: geen auth, geen
// opslag; lead-capture gebeurt pas aan het eind via /api/leads.
//
// GRENS: de scan diagnosticeert en adviseert op wat de bezoeker zélf intypt.
// Geen klantdata, geen toezeggingen — de afspraak doet JW, niet de agent.

export const maxDuration = 60;

const MIN_VRAGEN = 4;
const MAX_VRAGEN = 7;

interface Turn {
    vraag: string;
    antwoord: string;
}

export type AanbevelingType = 'quick-scan' | 'verkennend';

interface NextQuestion {
    done: false;
    vraag: string;
    opties: string[];
    toelichting?: string;
}

interface Verdict {
    done: true;
    niveau: string;
    samenvatting: string;
    bevindingen: string[];
    aanbeveling: { tekst: string; type: AanbevelingType };
}

const SYSTEM = `Je bent de HR Analytics Readiness Scan van Jan Willem den Hollander (Power BI Studio), een HR-analytics-specialist voor mid-market werkgevers (250-2.000 FTE) op AFAS, Visma of Nmbrs.

Je voert een kort, adaptief diagnosegesprek met een HR-, finance- of IT-verantwoordelijke om in te schatten hoe volwassen hun HR-rapportage in Power BI is. Je stelt één vraag per beurt, in begrijpelijke taal (geen DAX, geen jargon zonder uitleg), met 3-4 concrete meerkeuze-opties die oplopen van "onvolwassen" naar "volwassen".

Je toetst — afhankelijk van de antwoorden, niet als vaste lijst — deze vijf thema's:
1. Row-level security: handmatig/op e-mail vs. automatisch op organisatiehiërarchie.
2. Historiek (type-2/SCD2): kloppen historische cijfers na reorganisaties nog?
3. Bronnen: losse Excel-exports vs. één geconsolideerde bron-zilver-goud-architectuur.
4. AVG/governance: weet de DPO welke gevoelige velden en RLS er zijn; bewaartermijnen.
5. Versheid & eigenaarschap: refresh-monitoring, gedocumenteerde eigenaar/definities.

REGELS:
- Pas je vervolgvraag aan op eerdere antwoorden: graaf door op een zwak punt, sla door op wat al goed zit.
- Stel minimaal ${MIN_VRAGEN} en maximaal ${MAX_VRAGEN} vragen. Heb je na een paar vragen genoeg beeld, concludeer dan eerder.
- Verzin geen cijfers, klantnamen of resultaten.
- Bij de eindbeoordeling: bepaal een niveau (kies een passende korte labelnaam zoals "Risico", "Achterstand", "Onderweg" of "Volwassen"), schrijf een eerlijke samenvatting (2-4 zinnen), 2-4 concrete bevindingen, en één vervolgstap. Vervolgstap-type:
  - "quick-scan": als er duidelijke risico's/gaten zijn die een audit (€1.950, 1,5 dag) rechtvaardigen.
  - "verkennend": als het beeld onduidelijk, licht, of juist al volwassen is — een kort gesprek past dan beter.

OUTPUT — uitsluitend geldige JSON, geen markdown-fences, geen tekst eromheen.
Volgende vraag:
{ "done": false, "vraag": "...", "opties": ["...", "...", "..."], "toelichting": "optioneel, 1 zin" }
Of eindbeoordeling:
{ "done": true, "niveau": "...", "samenvatting": "...", "bevindingen": ["...", "..."], "aanbeveling": { "tekst": "...", "type": "quick-scan" } }`;

export async function POST(req: Request) {
    const limit = checkRateLimit(req, 'readiness-scan-adaptive', 15, 60_000);
    if (!limit.ok) {
        return NextResponse.json(
            { error: 'Te veel verzoeken. Probeer het zo opnieuw.' },
            { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
        );
    }

    const body = await req.json().catch(() => ({}));
    const history: Turn[] = Array.isArray(body?.history)
        ? body.history
              .filter(
                  (t: unknown): t is Turn =>
                      !!t && typeof (t as Turn).vraag === 'string' && typeof (t as Turn).antwoord === 'string'
              )
              .slice(0, MAX_VRAGEN)
        : [];

    // Mock-pad zonder API key, zodat de flow lokaal volledig te testen is.
    if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json(mockStep(history));
    }

    const transcript = history.length
        ? history.map((t, i) => `V${i + 1}: ${t.vraag}\nA${i + 1}: ${t.antwoord}`).join('\n\n')
        : '(nog geen antwoorden — stel de eerste vraag)';

    const beantwoord = history.length;
    const instructie =
        beantwoord >= MAX_VRAGEN
            ? `Er zijn al ${beantwoord} vragen beantwoord (maximum). Geef NU de eindbeoordeling (done: true).`
            : beantwoord >= MIN_VRAGEN
              ? `Er zijn ${beantwoord} vragen beantwoord. Stel nog een vraag óf geef de eindbeoordeling als je genoeg beeld hebt.`
              : `Er zijn ${beantwoord} vragen beantwoord. Stel de volgende vraag.`;

    try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1500,
            temperature: 0.7,
            system: SYSTEM,
            messages: [
                {
                    role: 'user',
                    content: `Gespreksverloop tot nu toe:\n${transcript}\n\n${instructie}\nOutput alleen de JSON.`,
                },
            ],
        });

        const text = response.content
            .filter((b) => b.type === 'text')
            .map((b) => b.text)
            .join('');

        const parsed = parseStep(text, beantwoord);
        return NextResponse.json(parsed);
    } catch (e) {
        console.error('readiness-scan adaptive error:', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'De scan is tijdelijk niet beschikbaar.' }, { status: 503 });
    }
}

function parseStep(text: string, beantwoord: number): NextQuestion | Verdict {
    try {
        const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        const obj = JSON.parse(cleaned) as Record<string, unknown>;

        if (obj.done === true) {
            const a = obj.aanbeveling as { tekst?: unknown; type?: unknown } | undefined;
            const type: AanbevelingType = a?.type === 'verkennend' ? 'verkennend' : 'quick-scan';
            return {
                done: true,
                niveau: typeof obj.niveau === 'string' ? obj.niveau : 'Onbepaald',
                samenvatting: typeof obj.samenvatting === 'string' ? obj.samenvatting : '',
                bevindingen: Array.isArray(obj.bevindingen)
                    ? (obj.bevindingen.filter((x) => typeof x === 'string') as string[])
                    : [],
                aanbeveling: {
                    tekst: typeof a?.tekst === 'string' ? a.tekst : 'Plan een vervolgstap.',
                    type,
                },
            };
        }

        const opties = Array.isArray(obj.opties)
            ? (obj.opties.filter((x) => typeof x === 'string') as string[])
            : [];
        if (typeof obj.vraag === 'string' && opties.length >= 2) {
            return {
                done: false,
                vraag: obj.vraag,
                opties,
                toelichting: typeof obj.toelichting === 'string' ? obj.toelichting : undefined,
            };
        }
    } catch {
        console.error('readiness-scan adaptive: kon JSON niet parsen');
    }

    // Vangnet: kon de stap niet lezen → forceer een eindbeoordeling als er al
    // genoeg vragen zijn, anders een generieke vraag.
    if (beantwoord >= MIN_VRAGEN) {
        return {
            done: true,
            niveau: 'Onbepaald',
            samenvatting:
                'Op basis van je antwoorden is een kort gesprek de beste volgende stap om je situatie scherp te krijgen.',
            bevindingen: [],
            aanbeveling: { tekst: 'Plan een verkennend gesprek van 30 minuten.', type: 'verkennend' },
        };
    }
    return mockStep(new Array(beantwoord).fill({ vraag: '', antwoord: '' }));
}

// ---- Mock-flow (zonder API key) -------------------------------------------
const MOCK_VRAGEN: NextQuestion[] = [
    {
        done: false,
        vraag: 'Hoe is row-level security in jullie HR Power BI ingericht?',
        opties: [
            'Geen RLS — iedereen ziet alle data',
            'Handmatige user-mapping, maandelijks bijwerken',
            'RLS-rollen, niet gekoppeld aan de hiërarchie',
            'Automatisch op organisatiehiërarchie, met audit-trail',
        ],
    },
    {
        done: false,
        vraag: 'Klopt jullie verloop-cijfer van twee jaar terug nog steeds?',
        opties: [
            'Geen idee — niemand kijkt achteruit',
            'Nee, reorganisaties veranderen historische cijfers',
            'Soms wel, soms niet',
            'Ja, type-2 historiek op alle HR-dimensies',
        ],
    },
    {
        done: false,
        vraag: 'Uit welke bron komt jullie HR-data?',
        opties: [
            'Excel-exports die handmatig worden samengevoegd',
            'Eén HR-systeem, verzuim/formatie zit elders',
            'Meerdere bronnen, half-geautomatiseerd',
            'Geconsolideerd in één bron-zilver-goud-architectuur',
        ],
    },
];

function mockStep(history: Turn[]): NextQuestion | Verdict {
    if (history.length < MOCK_VRAGEN.length) {
        return MOCK_VRAGEN[history.length];
    }
    return {
        done: true,
        niveau: 'Achterstand (demo)',
        samenvatting:
            '*Demo-uitslag (geen API key geconfigureerd).* Op basis van je antwoorden mist je HR-rapportage waarschijnlijk een aantal fundamenten — een Quick Scan brengt dat binnen 1,5 dag in kaart.',
        bevindingen: [
            'RLS lijkt niet automatisch aan de organisatiehiërarchie gekoppeld.',
            'Historiek (type-2) is mogelijk niet sluitend.',
        ],
        aanbeveling: {
            tekst: 'Plan een HR Analytics Quick Scan voor een concrete prioriteitenlijst.',
            type: 'quick-scan',
        },
    };
}
