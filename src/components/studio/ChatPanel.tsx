"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { renderStudioMarkdown } from "./markdown";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

interface ChatPanelProps {
    projectId: string;
    initialMessages: ChatMessage[];
    usage: { used: number; limit: number };
}

export default function ChatPanel({ projectId, initialMessages, usage }: ChatPanelProps) {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [input, setInput] = useState("");
    const [used, setUsed] = useState(usage.used);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const question = input.trim();
        if (!question || isStreaming) return;

        setError(null);
        setInput("");
        setIsStreaming(true);
        setMessages((prev) => [
            ...prev,
            { role: "user", content: question },
            { role: "assistant", content: "" },
        ]);

        try {
            const res = await fetch(`/api/studio/projects/${projectId}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
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
            <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-4 p-4">
                {messages.length === 0 && (
                    <div className="text-sm text-[var(--color-neutral-500)] space-y-2 pt-8 text-center">
                        <p className="font-medium text-[var(--color-neutral-700)]">
                            Stel een vraag over dit model
                        </p>
                        <p className="text-xs max-w-sm mx-auto">
                            Bijvoorbeeld: &ldquo;Waarom is de relatie tussen de feitentabel en de
                            datumtabel inactief?&rdquo; of &ldquo;Schrijf een measure voor het
                            voortschrijdend gemiddelde over 3 maanden.&rdquo;
                        </p>
                    </div>
                )}
                {messages.map((m, i) => (
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
                ))}
            </div>

            {error && (
                <p className="px-4 pb-2 text-sm text-[var(--color-error)]">{error}</p>
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
                <p className="mt-1.5 text-xs text-[var(--color-neutral-500)] text-right">
                    {used} van {usage.limit} vragen deze maand
                </p>
            </form>
        </div>
    );
}
