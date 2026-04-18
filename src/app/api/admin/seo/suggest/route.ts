import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { computeSeoOverview } from '@/lib/seo/analysis';
import { ALL_PERSONAS, type Persona } from '@/lib/seo/keyword-universe';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

function checkAuth(req: Request): boolean {
  return req.headers.get('x-admin-token') === ADMIN_PASSWORD;
}

interface Suggestion {
  term: string;
  rationale: string;
  persona: Persona;
  theme: string;
  sources: string[];
  suggestedTitle: string;
}

/**
 * POST /api/admin/seo/suggest
 * Body: { persona?: Persona, limit?: number }
 *
 * Vraagt Claude om nieuwe zoekterm-kansen te brainstormen op basis van:
 *  - Huidige dekking per persona
 *  - Bestaande blog-titels (om dubbelingen te vermijden)
 *  - Kennis van wat er op Reddit/X/LinkedIn/Google trendy is voor Power BI
 *
 * Returns: array van suggesties met titel, rationale, persona, bron.
 */
export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY niet ingesteld' },
      { status: 500 },
    );
  }

  let body: { persona?: Persona; limit?: number } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is ok
  }
  const targetPersona = body.persona;
  const limit = body.limit ?? 8;

  try {
    const overview = await computeSeoOverview();

    // Bouw context: reeds geschreven titels + top gaps per persona
    const existingTitles = Array.from(
      new Set(
        overview.keywords
          .flatMap((k) => k.hits.map((h) => h.title))
          .slice(0, 50),
      ),
    );

    const gapsByPersona = overview.personaCoverage
      .map((pc) => ({
        persona: pc.persona,
        coveragePct: pc.coveragePct,
        gaps: pc.topGaps.map((g) => g.term),
      }))
      .filter((p) => !targetPersona || p.persona === targetPersona);

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const systemPrompt = `Je bent een SEO-strateeg voor Power BI Studio, een Nederlandse consultancy gericht op Power BI, Microsoft Fabric, datamodellering en procesverbetering.

Doelgroep-persona's: ${ALL_PERSONAS.join(', ')}.

Voor het merk zijn de volgende platforms relevant waar doelgroepen over BI/data praten:
- Reddit (r/PowerBI, r/dataengineering, r/MicrosoftFabric)
- X/Twitter (Microsoft MVPs, data influencers, #PowerBI)
- LinkedIn (CIO/CEO-content, Microsoft Partner updates, thought-leadership)
- Google Search (landing + how-to queries)

Jouw taak: genereer concrete, specifieke zoekterm-kansen waar Power BI Studio een artikel over kan schrijven. Per suggestie geef je:
- term: korte Nederlandse/Engelse zoekterm (max 6 woorden)
- suggestedTitle: concrete artikelkop in het Nederlands (max 80 chars)
- rationale: waarom is dit een kans? (1 zin, verwijs naar waar de discussie leeft)
- persona: één van ${ALL_PERSONAS.join(' / ')}
- theme: architectuur | governance | kosten-licenties | migratie-fabric | ai-copilot | performance | dax-modellering | security-rls | procesverbetering | embedded-saas | adoption-change
- sources: array van bronnen (Reddit, X, Google, LinkedIn) waar deze term actief besproken wordt

REGELS:
- GEEN dubbelingen met bestaande artikelen
- Specifiek en concreet — geen generieke termen als "Power BI tips"
- Focus op wat NIET al gedekt is
- Spreek de businesswaarde aan die bij de persona past (CIO = strategie/kosten, PBI-dev = techniek, etc.)
- Antwoord ALLEEN met valide JSON. Geen tekst eromheen. Format: { "suggestions": [ {term, suggestedTitle, rationale, persona, theme, sources}, ... ] }`;

    const userPrompt = `Bestaande artikel-titels (niet dupliceren):
${existingTitles.slice(0, 30).map((t) => `- ${t}`).join('\n')}

Huidige dekking per persona:
${gapsByPersona.map((p) => `- ${p.persona}: ${p.coveragePct}% coverage. Grootste gaps: ${p.gaps.join(', ') || 'n.v.t.'}`).join('\n')}

Genereer ${limit} concrete nieuwe zoekterm-kansen${targetPersona ? ` specifiek voor persona ${targetPersona}` : ''}. Focus op termen die nu NIET gedekt zijn en die aantoonbaar leven op Reddit/X/LinkedIn voor deze doelgroep.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0];
    if (text.type !== 'text') {
      return NextResponse.json({ error: 'Claude gaf geen tekst terug' }, { status: 500 });
    }

    // Parse JSON — strip eventuele markdown code fences
    const raw = text.text.trim();
    const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

    let parsed: { suggestions: Suggestion[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error('Claude JSON parse failed:', err, raw.slice(0, 200));
      return NextResponse.json(
        { error: 'Kon Claude-respons niet parsen', raw: raw.slice(0, 500) },
        { status: 502 },
      );
    }

    return NextResponse.json({
      suggestions: parsed.suggestions ?? [],
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('SEO suggest failed:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
