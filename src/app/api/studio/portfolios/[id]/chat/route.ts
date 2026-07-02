import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getUser } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/security';
import { MAX_CHAT_MESSAGES_PER_MONTH } from '@/lib/studio/limits';
import { monthlyMessageCount } from '@/lib/studio/usage';
import { buildProjectChatContext, buildSchemaContext } from '@/lib/studio/schema-context';
import { PbiModel } from '@/lib/pbi-parser';

export const maxDuration = 300;

const HISTORY_TURNS = 12;
const MAX_QUESTION_LENGTH = 4000;

const PROJECT_CHAT_SYSTEM = `Je bent een senior Power BI-developer-assistent binnen Power BI Studio.
Je beantwoordt vragen van een developer over een PROJECT dat uit meerdere semantische modellen bestaat. Elk model staat hieronder onder een "# Model: {naam}"-kop.

Regels:
- Grond elk antwoord in de schema's: gebruik exacte tabel-, kolom- en measure-namen in 'Tabel'[Kolom]-notatie, en benoem uit wélk model iets komt.
- Vergelijk waar relevant tussen modellen (naamdrift, dubbele measures, afwijkende relaties).
- DAX altijd in \`\`\`dax-codeblokken, werkend en passend bij het betreffende model.
- Zeg het expliciet als iets niet in de schema's staat — verzin geen tabellen of kolommen.
- Antwoord in het Nederlands, beknopt en technisch — je praat met een developer.`;

type Params = { params: Promise<{ id: string }> };

// Streaming chat over een heel project (meerdere modellen). Met modelIds tag je
// een subset; zonder tag doen alle modellen mee. Het gecombineerde schema gaat
// als gecached system-block mee (prompt caching).
export async function POST(req: Request, { params }: Params) {
    const limit = checkRateLimit(req, 'studio-project-chat', 10, 60_000);
    if (!limit.ok) {
        return NextResponse.json(
            { error: 'Te veel verzoeken. Probeer het zo opnieuw.' },
            { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
        );
    }

    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }
    const { id } = await params;

    const { question, chatId, modelIds } = await req.json().catch(() => ({}));
    if (typeof question !== 'string' || !question.trim()) {
        return NextResponse.json({ error: 'question is verplicht.' }, { status: 400 });
    }
    if (typeof chatId !== 'string') {
        return NextResponse.json({ error: 'chatId is verplicht.' }, { status: 400 });
    }
    if (question.length > MAX_QUESTION_LENGTH) {
        return NextResponse.json(
            { error: `Vraag te lang (max ${MAX_QUESTION_LENGTH} tekens).` },
            { status: 400 }
        );
    }
    if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json({ error: 'De assistent is tijdelijk niet beschikbaar.' }, { status: 503 });
    }

    const used = await monthlyMessageCount(user.id);
    if (used >= MAX_CHAT_MESSAGES_PER_MONTH) {
        return NextResponse.json(
            { error: `Beta-limiet bereikt: ${MAX_CHAT_MESSAGES_PER_MONTH} vragen per maand.` },
            { status: 403 }
        );
    }

    const { data: chat } = await supabase
        .from('studio_chats')
        .select('id, title')
        .eq('id', chatId)
        .eq('portfolio_id', id)
        .eq('user_id', user.id)
        .single();
    if (!chat) {
        return NextResponse.json({ error: 'Chat niet gevonden.' }, { status: 404 });
    }

    // Modellen van het project (optioneel gefilterd op de getagde selectie).
    const { data: members } = await supabase
        .from('studio_projects')
        .select('id, name, schema_json')
        .eq('portfolio_id', id)
        .eq('user_id', user.id);
    if (!members?.length) {
        return NextResponse.json({ error: 'Dit project heeft nog geen modellen.' }, { status: 400 });
    }
    const selectedIds: string[] | null = Array.isArray(modelIds) && modelIds.length ? modelIds : null;
    const selected = selectedIds ? members.filter((m) => selectedIds.includes(m.id)) : members;
    const usedModels = selected.length ? selected : members;

    const contextModels = usedModels.map((m) => ({
        name: m.name,
        schemaMarkdown: buildSchemaContext(m.schema_json as PbiModel).markdown,
    }));
    const { markdown } = buildProjectChatContext(contextModels);

    const { data: history } = await supabase
        .from('studio_messages')
        .select('role, content')
        .eq('chat_id', chatId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(HISTORY_TURNS);

    const messages: Anthropic.MessageParam[] = [
        ...(history ?? [])
            .reverse()
            .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: question },
    ];

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const stream = anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: [
            { type: 'text', text: PROJECT_CHAT_SYSTEM },
            { type: 'text', text: markdown, cache_control: { type: 'ephemeral' } },
        ],
        messages,
    });

    const taggedIds = usedModels.map((m) => m.id);
    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
        async start(controller) {
            try {
                for await (const event of stream) {
                    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                        controller.enqueue(encoder.encode(event.delta.text));
                    }
                }
                const final = await stream.finalMessage();
                const answer = final.content.filter((b) => b.type === 'text').map((b) => b.text).join('');

                const { error: msgError } = await supabase.from('studio_messages').insert([
                    { portfolio_id: id, chat_id: chatId, user_id: user.id, role: 'user', content: question, tagged_model_ids: taggedIds },
                    {
                        portfolio_id: id,
                        chat_id: chatId,
                        user_id: user.id,
                        role: 'assistant',
                        content: answer,
                        input_tokens: final.usage.input_tokens,
                        output_tokens: final.usage.output_tokens,
                    },
                ]);
                if (msgError) console.error('studio project chat: persist failed', msgError.message);

                if (chat.title === 'Nieuwe chat') {
                    await supabase.from('studio_chats').update({ title: question.slice(0, 60) }).eq('id', chatId);
                }
                await supabase.from('studio_usage').insert({
                    user_id: user.id,
                    kind: 'chat',
                    project_id: id,
                    input_tokens: final.usage.input_tokens,
                    output_tokens: final.usage.output_tokens,
                });
                controller.close();
            } catch (e) {
                console.error('studio project chat: stream failed', e instanceof Error ? e.message : e);
                controller.error(e);
            }
        },
    });

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Accel-Buffering': 'no',
        },
    });
}
