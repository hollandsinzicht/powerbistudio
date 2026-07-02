"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Loader2, Plus, Trash2, History } from "lucide-react";
import { renderStudioMarkdown } from "./markdown";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface ChatSummary {
    id: string;
    title: string;
    created_at: string;
}

interface ChatPanelProps {
    // Basispad van de chat-API: /api/studio/projects/{id} (datamodel) of
    // /api/studio/portfolios/{id} (project).
    apiBase: string;
    initialChats: ChatSummary[];
    usage: { used: number; limit: number };
    // Aanwezig bij een projectchat: modellen die je kunt taggen (in/uit de context).
    models?: { id: string; name: string }[];
    initialModelIds?: string[];
}

export default function ChatPanel({ apiBase, initialChats, usage, models, initialModelIds }: ChatPanelProps) {
    const [chats, setChats] = useState<ChatSummary[]>(initialChats);
    const [activeChatId, setActiveChatId] = useState<string | null>(initialChats[0]?.id ?? null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(Boolean(initialChats.length));
    const [input, setInput] = useState("");
    const [used, setUsed] = useState(usage.used);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedModelIds, setSelectedModelIds] = useState<string[]>(
        initialModelIds?.length ? initialModelIds : (models?.map((m) => m.id) ?? [])
    );
    const scrollRef = useRef<HTMLDivElement>(null);

    const toggleModel = (modelId: string) =>
        setSelectedModelIds((prev) =>
            prev.includes(modelId) ? prev.filter((x) => x !== modelId) : [...prev, modelId]
        );

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }, [messages]);

    // Berichten van het actieve gesprek laden
    const loadMessages = useCallback(
        async (chatId: string) => {
            setLoadingMessages(true);
            setError(null);
            try {
                const res = await fetch(`${apiBase}/chats/${chatId}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error ?? "Chat laden mislukte.");
                setMessages(data.messages);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Chat laden mislukte.");
                setMessages([]);
            } finally {
                setLoadingMessages(false);
            }
        },
        [apiBase]
    );

    useEffect(() => {
        if (activeChatId) loadMessages(activeChatId);
        else setMessages([]);
    }, [activeChatId, loadMessages]);

    const createChat = async (): Promise<string | null> => {
        const res = await fetch(`${apiBase}/chats`, { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setError(data.error ?? "Nieuwe chat aanmaken mislukte.");
            return null;
        }
        setChats((prev) => [data.chat, ...prev]);
        setActiveChatId(data.chat.id);
        setMessages([]);
        return data.chat.id;
    };

    const handleNewChat = async () => {
        if (isStreaming) return;
        // Geen lege chats stapelen: een leeg actief gesprek ís al een nieuwe chat.
        const active = chats.find((c) => c.id === activeChatId);
        if (active && active.title === "Nieuwe chat" && messages.length === 0) return;
        await createChat();
    };

    const handleDeleteChat = async () => {
        if (!activeChatId || isStreaming) return;
        const active = chats.find((c) => c.id === activeChatId);
        if (
            !window.confirm(
                `Chat "${active?.title ?? ""}" verwijderen? De berichten worden permanent gewist.`
            )
        ) {
            return;
        }
        const res = await fetch(`${apiBase}/chats/${activeChatId}`, {
            method: "DELETE",
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error ?? "Chat verwijderen mislukte.");
            return;
        }
        const remaining = chats.filter((c) => c.id !== activeChatId);
        setChats(remaining);
        setActiveChatId(remaining[0]?.id ?? null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const question = input.trim();
        if (!question || isStreaming) return;

        let chatId = activeChatId;
        if (!chatId) {
            chatId = await createChat();
            if (!chatId) return;
        }

        setError(null);
        setInput("");
        setIsStreaming(true);
        setMessages((prev) => [
            ...prev,
            { role: "user", content: question },
            { role: "assistant", content: "" },
        ]);

        try {
            const res = await fetch(`${apiBase}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    models ? { question, chatId, modelIds: selectedModelIds } : { question, chatId }
                ),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? "Er ging iets mis.");
            }
            if (!res.body) throw new Error("Geen antwoord ontvangen.");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let answer = "";
            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                answer += decoder.decode(value, { stream: true });
                const current = answer;
                setMessages((prev) => [
                    ...prev.slice(0, -1),
                    { role: "assistant", content: current },
                ]);
            }
            setUsed((u) => u + 1);
            // Server zet de eerste vraag als titel — lokaal spiegelen.
            setChats((prev) =>
                prev.map((c) =>
                    c.id === chatId && c.title === "Nieuwe chat"
                        ? { ...c, title: question.slice(0, 60) }
                        : c
                )
            );
        } catch (err) {
            // Mislukte beurt terugdraaien zodat de geschiedenis klopt.
            setMessages((prev) => prev.slice(0, -2));
            setInput(question);
            setError(err instanceof Error ? err.message : "Er ging iets mis.");
        } finally {
            setIsStreaming(false);
        }
    };

    const limitReached = used >= usage.limit;

    return (
        <div className="flex flex-col h-full">
            {/* Gesprekken: kiezen, nieuw, verwijderen */}
            <div className="shrink-0 flex items-center gap-2 border-b border-[var(--color-neutral-200)] p-2.5">
                <History size={15} className="text-[var(--color-neutral-500)] shrink-0 ml-1" />
                <select
                    value={activeChatId ?? ""}
                    onChange={(e) => setActiveChatId(e.target.value || null)}
                    disabled={isStreaming || !chats.length}
                    className="flex-grow min-w-0 rounded-md border border-[var(--color-neutral-200)] px-2 py-1.5 text-sm text-[var(--color-neutral-900)] bg-white focus:outline-none focus:border-[var(--color-primary-700)] truncate"
                    aria-label="Kies een gesprek"
                >
                    {!chats.length && <option value="">Nog geen gesprekken</option>}
                    {chats.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.title} · {new Date(c.created_at).toLocaleDateString("nl-NL")}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleNewChat}
                    disabled={isStreaming}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-[var(--color-neutral-200)] px-2.5 py-1.5 text-sm font-medium text-[var(--color-neutral-900)] hover:border-[var(--color-primary-700)] transition-colors"
                    title="Nieuwe chat"
                >
                    <Plus size={15} /> Nieuw
                </button>
                {activeChatId && (
                    <button
                        onClick={handleDeleteChat}
                        disabled={isStreaming}
                        className="shrink-0 p-1.5 text-[var(--color-neutral-500)] hover:text-[var(--color-error)] transition-colors"
                        aria-label="Verwijder deze chat"
                        title="Verwijder deze chat"
                    >
                        <Trash2 size={15} />
                    </button>
                )}
            </div>

            <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-4 p-4">
                {loadingMessages ? (
                    <div className="flex justify-center pt-10">
                        <Loader2 size={20} className="animate-spin text-[var(--color-neutral-500)]" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-sm text-[var(--color-neutral-500)] space-y-2 pt-8 text-center">
                        <p className="font-medium text-[var(--color-neutral-700)]">
                            {models ? "Stel een vraag over dit project" : "Stel een vraag over dit model"}
                        </p>
                        <p className="text-xs max-w-sm mx-auto">
                            Bijvoorbeeld: &ldquo;Waarom is de relatie tussen de feitentabel en de
                            datumtabel inactief?&rdquo; of &ldquo;Schrijf een measure voor het
                            voortschrijdend gemiddelde over 3 maanden.&rdquo;
                        </p>
                        <p className="text-xs max-w-sm mx-auto">
                            Je gesprekken blijven bij dit project bewaard — ook nadat je uitlogt
                            pak je ze hier weer op.
                        </p>
                    </div>
                ) : (
                    messages.map((m, i) => (
                        <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                            {m.role === "user" ? (
                                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[var(--color-primary-800)] text-white px-4 py-2.5 text-sm whitespace-pre-wrap">
                                    {m.content}
                                </div>
                            ) : (
                                <div className="max-w-[95%] text-sm text-[var(--color-neutral-700)] leading-relaxed">
                                    {m.content ? (
                                        <div dangerouslySetInnerHTML={{ __html: renderStudioMarkdown(m.content) }} />
                                    ) : (
                                        <Loader2 size={16} className="animate-spin text-[var(--color-neutral-500)] mt-1" />
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {error && (
                <p className="px-4 pb-2 text-sm text-[var(--color-error)]">{error}</p>
            )}

            {models && models.length > 0 && (
                <div className="shrink-0 border-t border-[var(--color-neutral-200)] px-3 pt-2.5">
                    <p className="text-xs text-[var(--color-neutral-500)] mb-1.5">
                        Modellen in de vraag {selectedModelIds.length === 0 && "(geen keuze = alle)"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {models.map((m) => {
                            const on = selectedModelIds.includes(m.id);
                            return (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => toggleModel(m.id)}
                                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                                        on
                                            ? "border-[var(--color-primary-700)] bg-[var(--color-primary-900)] text-white"
                                            : "border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-700)] hover:border-[var(--color-primary-700)]"
                                    }`}
                                    title={on ? "Klik om uit te sluiten" : "Klik om mee te nemen"}
                                >
                                    {m.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="shrink-0 border-t border-[var(--color-neutral-200)] p-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isStreaming || limitReached}
                        placeholder={
                            limitReached
                                ? "Maandlimiet bereikt — volgende maand weer beschikbaar"
                                : "Vraag iets over logica, measures of DAX…"
                        }
                        className="flex-grow rounded-xl border border-[var(--color-neutral-200)] px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary-700)] disabled:bg-[var(--color-neutral-50)]"
                    />
                    <button
                        type="submit"
                        disabled={isStreaming || limitReached || !input.trim()}
                        className="rounded-xl bg-[var(--color-action-600)] hover:bg-[var(--color-action-700)] text-white px-4 transition-colors disabled:opacity-50"
                        aria-label="Versturen"
                    >
                        {isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
                <div className="mt-1.5 flex items-start justify-between gap-4 text-xs text-[var(--color-neutral-500)]">
                    <p>
                        Je chats worden bij dit project bewaard, ook na uitloggen. Studio kent
                        alleen je modelschema — plak dus zelf geen bedrijfsdata of
                        persoonsgegevens in je vragen.
                    </p>
                    <p className="shrink-0">
                        {used} van {usage.limit} vragen deze maand
                    </p>
                </div>
            </form>
        </div>
    );
}
