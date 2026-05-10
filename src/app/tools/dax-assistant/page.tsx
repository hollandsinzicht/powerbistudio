"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, Play, Copy, RefreshCw, FileText, CheckCircle2, Download } from "lucide-react";
import LeadCaptureForm from "@/components/lead/LeadCaptureForm";
import AgentSignature from "@/components/team/AgentSignature";

export default function DaxAssistant() {
    const [mode, setMode] = useState<"generate" | "explain">("generate");
    const [input, setInput] = useState("");
    const [context, setContext] = useState("Sales");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const contexts = ["Sales", "Finance", "HR", "Operations", "Overig"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/dax-assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input, context, mode }),
            });

            const data = await res.json();
            if (data.result) {
                setResult(data.result);
            } else {
                setResult("Er is een fout opgetreden. Controleer of de API key geldig is.");
            }
        } catch (error) {
            console.error(error);
            setResult("Er is een verbindingsfout opgetreden.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;

        // Extract just the DAX code from markdown block if present
        const codeMatch = result.match(/```(?:dax)?\n([\s\S]*?)```/);
        const textToCopy = codeMatch ? codeMatch[1].trim() : result;

        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const currentPlaceholder = mode === "generate"
        ? "Bijv: Bereken de totale sales, maar negeer het filter op de klantentabel en filter alleen op het huidige jaar."
        : "Plak hier je (complexe) DAX formule om hem stap voor stap uitgelegd te krijgen.";

    return (
        <div className="min-h-screen bg-[var(--background)] pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-6xl">

                {/* Header */}
                <div className="mb-12">
                    <Link href="/tools" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-2 mb-6 text-sm transition-colors">
                        <ArrowLeft size={16} /> Terug naar Tools
                    </Link>

                    {/* Banner — verwijst naar HR Analytics als hoofdpropositie */}
                    <div className="mb-8 rounded-md border border-[var(--color-accent-700)]/30 bg-[var(--color-accent-100)]/40 p-4 text-sm">
                        <p className="text-[var(--text-primary)]">
                            <strong className="font-semibold">Voor HR-modellering, kijk hier:</strong>{' '}
                            Power BI Studio richt zich tegenwoordig op HR analytics-trajecten.
                            De DAX Assistant blijft beschikbaar als gratis tool.{' '}
                            <Link
                                href="/hr-analytics"
                                className="font-semibold text-[var(--color-primary-700)] underline underline-offset-4 hover:text-[var(--color-primary-900)]"
                            >
                                Lees over HR Analytics →
                            </Link>
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-4xl font-display font-bold">DAX Formula Assistant</h1>
                        <span className="bg-[rgba(245,158,11,0.1)] text-[var(--accent-warm)] text-xs font-mono px-3 py-1 border border-[rgba(245,158,11,0.2)] rounded-full flex items-center gap-1.5">
                            <BrainCircuit size={14} /> AI-powered
                        </span>
                    </div>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl mb-8">
                        Vertaal gewone taal naar werkende DAX-codes, of laat AI complexe formules aan je uitleggen in begrijpelijk Nederlands.
                    </p>

                    {/* Agent signature */}
                    <AgentSignature agentId="ada" intro="Deze tool wordt aangedreven door" />
                </div>

                {/* Main Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-full">

                    {/* Left Panel: Input */}
                    <div className="glass-card rounded-2xl flex flex-col h-full overflow-hidden border border-[var(--border)]">
                        {/* Mode Switcher */}
                        <div className="flex p-2 bg-[var(--surface)] border-b border-[var(--border)]">
                            <button
                                onClick={() => setMode("generate")}
                                className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${mode === "generate"
                                    ? "bg-[var(--surface)] text-[var(--text-primary)] shadow"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                    }`}
                            >
                                Genereer DAX
                            </button>
                            <button
                                onClick={() => setMode("explain")}
                                className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${mode === "explain"
                                    ? "bg-[var(--surface)] text-[var(--text-primary)] shadow"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                    }`}
                            >
                                Leg formule uit
                            </button>
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSubmit} className="p-6 md:p-8">

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    {mode === "generate" ? "Wat wil je berekenen?" : "Welke DAX formule wil je begrijpen?"}
                                </label>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={currentPlaceholder}
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-[var(--text-primary)] placeholder-[var(--text-secondary)] h-48 focus:outline-none focus:border-[var(--accent)] resize-none transition-colors"
                                    required
                                />
                            </div>

                            {mode === "generate" && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        Kies de datacontext (optioneel)
                                    </label>
                                    <select
                                        value={context}
                                        onChange={(e) => setContext(e.target.value)}
                                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] appearance-none"
                                    >
                                        {contexts.map(ctx => (
                                            <option key={ctx} value={ctx}>{ctx}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${mode === "generate"
                                    ? "bg-[var(--accent)] hover:bg-blue-600 text-[var(--text-primary)] shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                    : "bg-[var(--accent-warm)] hover:bg-amber-600 text-[#0A0E1A] shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isLoading ? (
                                    <><RefreshCw size={18} className="animate-spin" /> Bezig met verwerken...</>
                                ) : (
                                    mode === "generate" ? <><Play size={18} /> Genereer DAX Formule</> : <><FileText size={18} /> Leg formule uit</>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right Panel: Output */}
                    <div className="glass-card rounded-2xl flex flex-col h-[600px] lg:h-auto overflow-hidden border border-[var(--border)] relative bg-[var(--surface)]">

                        {/* Toolbar */}
                        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
                            <span className="text-sm font-mono text-[var(--text-secondary)] flex items-center gap-2">
                                <BrainCircuit size={14} className="text-[var(--accent)]" /> Claude Sonnet 4
                            </span>

                            <button
                                onClick={handleCopy}
                                disabled={!result}
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30 p-2"
                                title="Kopieer resultaat"
                            >
                                {copied ? <span className="text-green-500 text-xs font-medium mr-2 flex items-center gap-1"><CheckCircle2 size={14} /> Gekopieerd!</span> : <Copy size={18} />}
                            </button>
                        </div>

                        {/* Output Area */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-grow prose prose-invert max-w-none">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full text-[var(--border)]">
                                    <BrainCircuit size={48} className="animate-pulse mb-4 text-[var(--accent)] opacity-50" />
                                    <p className="text-[var(--text-secondary)] animate-pulse">AI is aan het nadenken...</p>
                                </div>
                            ) : result ? (
                                <div
                                    className="dax-result text-sm md:text-base text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: result
                                            // Simple regex highlight for the codeblock
                                            .replace(/```(?:dax)?\n([\s\S]*?)```/g,
                                                '<div class="my-6 bg-gray-50 p-4 rounded-lg font-mono text-sm border border-[var(--border)] overflow-x-auto text-[#1E3A5F]"><pre><code>$1</code></pre></div>'
                                            )
                                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--text-primary)] font-bold">$1</strong>')
                                            .replace(/\*(.*?)\*/g, '<em class="text-[var(--text-secondary)] italic">$1</em>')
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-[var(--border)]">
                                    <div className="w-16 h-16 rounded-full border border-dashed border-[var(--border)] flex items-center justify-center mb-4">
                                        <FileText size={24} className="opacity-50" />
                                    </div>
                                    <p className="text-[var(--text-secondary)] text-center max-w-xs">
                                        Jouw DAX resultaat verschijnt hier zodra je een opdracht indient.
                                    </p>
                                </div>
                            )}
                        </div>

                        {result && !isLoading && (
                            <div className="shrink-0 p-4 border-t border-[var(--border)] bg-[var(--surface)]">
                                <button
                                    onClick={() => {
                                        setInput("");
                                        setResult(null);
                                    }}
                                    className="w-full text-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-2"
                                >
                                    Stel een nieuwe vraag
                                </button>
                            </div>
                        )}

                    </div>

                </div>

                {/* DAX-fouten lead magnet */}
                <div id="dax-fouten" className="mt-16 pt-12 border-t border-[var(--border)]">
                    <div className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)]">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-[rgba(30,58,95,0.1)] flex items-center justify-center shrink-0">
                                <Download size={20} className="text-[var(--primary)]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-display font-bold mb-1">
                                    Download: 10 meest voorkomende DAX-fouten in productie-modellen
                                </h3>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                    Van verkeerde CALCULATE-filters tot onnodige DISTINCTCOUNT op grote tabellen.
                                    Met uitleg waarom het fout is en hoe je het oplost. Gratis PDF.
                                </p>
                            </div>
                        </div>
                        <LeadCaptureForm
                            vertical="vakgenoot"
                            source="dax-fouten"
                            title=""
                            buttonText="Download gratis PDF"
                            fields={['name', 'email']}
                            compact
                            downloadUrl="/downloads/dax-fouten-top10.pdf"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
