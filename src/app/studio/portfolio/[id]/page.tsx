"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Sparkles, Layers, RefreshCw, FolderKanban, Plus, Unlink, FolderOpen } from "lucide-react";
import Breadcrumb from "@/components/studio/Breadcrumb";
import FindingsList from "@/components/studio/FindingsList";
import PortfolioMap from "@/components/studio/PortfolioMap";
import DownloadButtons from "@/components/studio/DownloadButtons";
import UploadDropzone from "@/components/studio/UploadDropzone";
import ChatPanel, { ChatSummary } from "@/components/studio/ChatPanel";
import Deliverables from "@/components/studio/Deliverables";
import { renderStudioMarkdown } from "@/components/studio/markdown";
import type { CrossModelFinding, PortfolioMap as PortfolioMapType, CrossModelStats } from "@/lib/pbi-analysis/cross-model";
import type { AvgPuntResult } from "@/lib/pbi-analysis/avg-check";
import type { PbiModelStats } from "@/lib/pbi-parser/types";

interface Member {
    id: string;
    name: string;
    source_filename: string;
    stats: PbiModelStats;
    created_at: string;
}

interface LooseModel {
    id: string;
    name: string;
}

interface PortfolioData {
    portfolio: {
        id: string;
        name: string;
        analysis_findings: CrossModelFinding[] | null;
        analysis_narrative: string | null;
        map_json: PortfolioMapType | null;
        stats: CrossModelStats | null;
        analyzed_at: string | null;
        doc_markdown: string | null;
        avg_report: AvgPuntResult[] | null;
        rls_markdown: string | null;
        created_at: string;
    };
    members: Member[];
    chats: ChatSummary[];
    usage: { used: number; limit: number };
}

type Tab = "findings" | "map" | "narrative" | "oplevering" | "models";

export default function StudioProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState<PortfolioData | null>(null);
    const [loose, setLoose] = useState<LooseModel[]>([]);
    const [attachId, setAttachId] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [tab, setTab] = useState<Tab>("findings");
    const [preTag, setPreTag] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/studio/portfolios/${id}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Project laden mislukte.");
            setData(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Project laden mislukte.");
        }
    }, [id]);

    const loadLoose = useCallback(async () => {
        const res = await fetch("/api/studio/projects?scope=loose");
        const json = await res.json().catch(() => ({}));
        if (res.ok) setLoose((json.projects ?? []).map((p: LooseModel) => ({ id: p.id, name: p.name })));
    }, []);

    useEffect(() => {
        load();
        loadLoose();
        setPreTag(new URLSearchParams(window.location.search).get("model"));
    }, [load, loadLoose]);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        setError(null);
        try {
            const res = await fetch(`/api/studio/portfolios/${id}/analyze`, { method: "POST" });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.error ?? "Analyse mislukte.");
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Analyse mislukte.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleDelete = async () => {
        if (!data) return;
        if (!window.confirm(`Project "${data.portfolio.name}" verwijderen? De datamodellen blijven bestaan (worden weer los).`)) {
            return;
        }
        setDeleting(true);
        try {
            const res = await fetch(`/api/studio/portfolios/${id}`, { method: "DELETE" });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.error ?? "Verwijderen mislukte.");
            router.push("/studio");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Verwijderen mislukte.");
            setDeleting(false);
        }
    };

    const setMembership = async (modelId: string, portfolioId: string | null) => {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(`/api/studio/projects/${modelId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ portfolioId }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.error ?? "Bijwerken mislukte.");
            setAttachId("");
            await Promise.all([load(), loadLoose()]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Bijwerken mislukte.");
        } finally {
            setBusy(false);
        }
    };

    if (error && !data) {
        return (
            <div className="min-h-screen bg-[var(--color-neutral-50)] pt-8 pb-16">
                <div className="container mx-auto px-6 max-w-2xl text-center">
                    <p className="text-sm text-[var(--color-error)] mb-4">{error}</p>
                    <Link href="/studio" className="text-sm underline underline-offset-2">Terug naar overzicht</Link>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-[var(--color-neutral-50)] pt-8 pb-16 flex justify-center">
                <Loader2 size={28} className="animate-spin text-[var(--color-neutral-500)] mt-16" />
            </div>
        );
    }

    const { portfolio, members, chats, usage } = data;
    const analyzed = Boolean(portfolio.analyzed_at);
    const canAnalyze = members.length >= 2;
    const modelNames = members.map((m) => m.name || m.source_filename);
    const TAB_LABELS: Record<Tab, string> = { findings: "Bevindingen", map: "Model-map", narrative: "AI-analyse", oplevering: "Oplevering", models: "Modellen" };

    const notAnalyzed = (
        <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-8 text-center">
            <Layers size={26} className="mx-auto text-[var(--color-primary-700)] mb-3" />
            <p className="text-sm text-[var(--color-neutral-700)] mb-1">Nog geen cross-model-analyse.</p>
            <p className="text-xs text-[var(--color-neutral-500)] mb-5">
                {canAnalyze
                    ? `Vergelijk ${members.length} modellen op naamdrift, gedeelde dimensies, dubbele measures en conflicterende relaties.`
                    : "Voeg minstens 2 datamodellen toe om cross-model-analyse te draaien."}
            </p>
            {canAnalyze && (
                <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-700)] hover:bg-[var(--color-primary-900)] px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60"
                >
                    {analyzing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                    Start analyse
                </button>
            )}
        </div>
    );

    const modelsTab = (
        <div className="space-y-4">
            <div className="space-y-3">
                {members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4">
                        <FolderOpen size={18} className="text-[var(--color-primary-700)] shrink-0" />
                        <Link href={`/studio/p/${m.id}`} className="flex-grow min-w-0 group">
                            <p className="text-sm font-semibold text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-700)] transition-colors truncate">{m.name}</p>
                            <p className="text-xs text-[var(--color-neutral-500)]">
                                {m.stats.tables} tabellen · {m.stats.measures} measures · {m.stats.relationships} relaties
                            </p>
                        </Link>
                        <button
                            onClick={() => setMembership(m.id, null)}
                            disabled={busy}
                            className="shrink-0 inline-flex items-center gap-1.5 text-xs text-[var(--color-neutral-500)] hover:text-[var(--color-error)] transition-colors"
                            title="Uit project halen (blijft als los datamodel bestaan)"
                        >
                            <Unlink size={14} /> Losmaken
                        </button>
                    </div>
                ))}
            </div>

            {/* Bestaand los datamodel toevoegen */}
            {loose.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4">
                    <span className="text-sm text-[var(--color-neutral-700)]">Bestaand datamodel toevoegen:</span>
                    <select
                        value={attachId}
                        onChange={(e) => setAttachId(e.target.value)}
                        className="flex-grow min-w-[10rem] rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 text-sm bg-white"
                    >
                        <option value="">Kies een los datamodel…</option>
                        {loose.map((l) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => attachId && setMembership(attachId, id)}
                        disabled={!attachId || busy}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary-900)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        <Plus size={15} /> Toevoegen
                    </button>
                </div>
            )}

            {/* Nieuw model uploaden in dit project */}
            <div>
                <p className="text-sm font-medium text-[var(--color-neutral-700)] mb-2">Nieuw datamodel uploaden in dit project</p>
                <UploadDropzone portfolioId={id} onUploaded={() => { load(); loadLoose(); }} />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--color-neutral-50)] pt-8 pb-12">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Kop */}
                <div className="mb-6">
                    <Breadcrumb
                        items={[
                            { label: "Studio", href: "/studio", icon: FolderKanban },
                            { label: portfolio.name, icon: Layers, onClick: () => setTab("findings") },
                            { label: TAB_LABELS[tab] },
                        ]}
                    />
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                        <div className="flex-grow min-w-0">
                            <h1 className="text-xl font-bold text-[var(--color-primary-900)] truncate">{portfolio.name}</h1>
                            <p className="text-xs text-[var(--color-neutral-500)]">
                                {members.length} {members.length === 1 ? "datamodel" : "datamodellen"}
                                {portfolio.stats ? ` · ${portfolio.stats.sharedEntities} gedeelde entiteiten · ${portfolio.stats.findings} bevindingen` : ""}
                            </p>
                        </div>
                        {canAnalyze && (
                            <button
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-700)] hover:bg-[var(--color-primary-900)] px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60"
                            >
                                {analyzing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                                {analyzed ? "Opnieuw analyseren" : "Analyseer project"}
                            </button>
                        )}
                        {analyzed && <DownloadButtons source="portfolio" id={id} kind="portfolio" />}
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center gap-2 text-sm text-[var(--color-neutral-700)] hover:text-[var(--color-error)] transition-colors"
                        >
                            {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            Verwijder
                        </button>
                    </div>
                </div>

                {error && <p className="mb-4 text-sm text-[var(--color-error)]">{error}</p>}

                {members.length === 0 ? (
                    <div className="max-w-2xl">
                        <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-6 mb-4 text-center">
                            <Layers size={26} className="mx-auto text-[var(--color-primary-700)] mb-2" />
                            <p className="text-sm text-[var(--color-neutral-700)]">Dit project heeft nog geen datamodellen. Upload er een of voeg een bestaand los model toe.</p>
                        </div>
                        {loose.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 mb-4">
                                <span className="text-sm text-[var(--color-neutral-700)]">Bestaand datamodel toevoegen:</span>
                                <select value={attachId} onChange={(e) => setAttachId(e.target.value)} className="flex-grow min-w-[10rem] rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 text-sm bg-white">
                                    <option value="">Kies een los datamodel…</option>
                                    {loose.map((l) => (<option key={l.id} value={l.id}>{l.name}</option>))}
                                </select>
                                <button onClick={() => attachId && setMembership(attachId, id)} disabled={!attachId || busy} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary-900)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
                                    <Plus size={15} /> Toevoegen
                                </button>
                            </div>
                        )}
                        <UploadDropzone portfolioId={id} onUploaded={() => { load(); loadLoose(); }} />
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-6 items-start">
                        {/* Links: analyse + modellen */}
                        <div>
                            <div className="flex flex-wrap gap-1 mb-3">
                                {(Object.keys(TAB_LABELS) as Tab[]).map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => setTab(key)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            tab === key
                                                ? "bg-white text-[var(--color-neutral-900)] border border-[var(--color-neutral-200)] shadow-sm"
                                                : "text-[var(--color-neutral-700)] hover:text-[var(--color-neutral-900)]"
                                        }`}
                                    >
                                        {TAB_LABELS[key]}
                                    </button>
                                ))}
                            </div>

                            {tab === "findings" && (analyzed ? <FindingsList findings={portfolio.analysis_findings ?? []} /> : notAnalyzed)}
                            {tab === "map" && (analyzed ? <PortfolioMap entities={portfolio.map_json?.entities ?? []} modelNames={modelNames} /> : notAnalyzed)}
                            {tab === "narrative" && (analyzed && portfolio.analysis_narrative ? (
                                <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white p-5">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-900)] mb-2">
                                        <Sparkles size={15} className="text-[var(--color-accent-700)]" /> AI-analyse van het landschap
                                    </p>
                                    <div className="text-sm text-[var(--color-neutral-700)] leading-relaxed" dangerouslySetInnerHTML={{ __html: renderStudioMarkdown(portfolio.analysis_narrative) }} />
                                </div>
                            ) : notAnalyzed)}
                            {tab === "oplevering" && (
                                <Deliverables
                                    source="portfolio"
                                    id={id}
                                    apiBase={`/api/studio/portfolios/${id}`}
                                    initialDoc={portfolio.doc_markdown}
                                    initialAvg={portfolio.avg_report}
                                    initialRls={portfolio.rls_markdown}
                                />
                            )}
                            {tab === "models" && modelsTab}
                        </div>

                        {/* Rechts: projectchat met model-taggen */}
                        <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-white overflow-hidden lg:sticky lg:top-6 flex flex-col h-[75vh]">
                            <ChatPanel
                                apiBase={`/api/studio/portfolios/${id}`}
                                initialChats={chats}
                                usage={usage}
                                models={members.map((m) => ({ id: m.id, name: m.name }))}
                                initialModelIds={preTag ? [preTag] : undefined}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
