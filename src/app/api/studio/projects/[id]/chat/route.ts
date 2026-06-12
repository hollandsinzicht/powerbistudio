import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getUser } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/security';
import { MAX_CHAT_MESSAGES_PER_MONTH } from '@/lib/studio/limits';
import { monthlyMessageCount } from '@/lib/studio/usage';

export const maxDuration = 300;

const HISTORY_TURNS = 12;
const MAX_QUESTION_LENGTH = 4000;

const CHAT_SYSTEM = `Je bent een senior Power BI-developer-assistent binnen Power BI Studio.
Je beantwoordt vragen van een developer over zijn/haar semantische model. Het volledige modelschema staat hieronder in je context.

Regels:
- Grond elk antwoord in het schema: gebruik exacte tabel-, kolom- en measure-namen in 'Tabel'[Kolom]-notatie.
- DAX altijd in \`\`\`dax-codeblokken, werkend en passend bij dít model (geen pseudocode).
- Wijs proactief op modelproblemen die relevant zijn voor de vraag (inactieve relaties, bidirectionele filters, many-to-many).
- Zeg het expliciet als iets niet in het schema staat — verzin geen tabellen of kolommen.
- Rapportvisuals, brondata en Power Query zijn niet zichtbaar; benoem dat als de vraag daarover gaat.
- Antwoord in het Nederlands, beknopt en technisch — je praat met een developer, niet met een eindgebruiker.`;

type Params = { params: Promise<{ id: string }> };

// Streaming chat over één project. Het schema gaat als gecached system-block
// mee (prompt caching): follow-upvragen binnen de cache-TTL lezen het schema
// tegen ~10% van de inputprijs.
export async function POST(req: Request, { params }: Params) {
    const limit = checkRateLimit(req, 'studio-chat', 10, 60_000);
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

    const { question, chatId } = await req.json().catch(() => ({}));
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
        return NextResponse.json(
            { error: 'De assistent is tijdelijk niet beschikbaar.' },
            { status: 503 }
        );
    }

    const used = await monthlyMessageCount(user.id);
    if (used >= MAX_CHAT_MESSAGES_PER_MONTH) {
        return NextResponse.json(
            {
                error: `Beta-limiet bereikt: ${MAX_CHAT_MESSAGES_PER_MONTH} vragen per maand. Volgende maand gaat de teller weer op nul.`,
            },
            { status: 403 }
        );
    }

    const { data: project } = await supabase
        .from('studio_projects')
        .select('id, schema_markdown')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
    if (!project) {
        return NextResponse.json({ error: 'Project niet gevonden.' }, { status: 404 });
    }

    const { data: chat } = await supabase
        .from('studio_chats')
        .select('id, title')
        .eq('id', chatId)
        .eq('project_id', id)
        .eq('user_id', user.id)
        .single();
    if (!chat) {
        return NextResponse.json({ error: 'Chat niet gevonden.' }, { status: 404 });
    }

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
            { type: 'text', text: CHAT_SYSTEM },
            {
                type: 'text',
                text: project.schema_markdown,
                cache_control: { type: 'ephemeral' },
            },
        ],
        messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
        async start(controller) {
            try {
                for await (const event of stream) {
                    if (
                        event.type === 'content_block_delta' &&
                        event.delta.type === 'text_delta'
                    ) {
                        controller.enqueue(encoder.encode(event.delta.text));
                    }
                }
                const final = await stream.finalMessage();
                const answer = final.content
                    .filter((b) => b.type === 'text')
                    .map((b) => b.text)
                    .join('');

                // Persistentie ná de stream, maar binnen de stream-lifetime
                // zodat de serverless function niet eerder wordt afgekapt.
                const { error: msgError } = await supabase.from('studio_messages').insert([
                    { project_id: id, chat_id: chatId, user_id: user.id, role: 'user', content: question },
                    {
                        project_id: id,
                        chat_id: chatId,
                        user_id: user.id,
                        role: 'assistant',
                        content: answer,
                        input_tokens: final.usage.input_tokens,
                        output_tokens: final.usage.output_tokens,
                    },
                ]);
                if (msgError) console.error('studio chat: persist failed', msgError.message);

                // Eerste vraag in een nieuw gesprek wordt de titel.
                if (chat.title === 'Nieuwe chat') {
                    await supabase
                        .from('studio_chats')
                        .update({ title: question.slice(0, 60) })
                        .eq('id', chatId);
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
                console.error('studio chat: stream failed', e instanceof Error ? e.message : e);
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
