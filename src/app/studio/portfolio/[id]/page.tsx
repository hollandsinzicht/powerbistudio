"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Trash2, Sparkles, Layers, RefreshCw } from "lucide-react";
import FindingsList from "@/components/studio/FindingsList";
import PortfolioMap from "@/components/studio/PortfolioMap";
import { renderStudioMarkdown } from "@/components/studio/markdown";
import type { CrossModelFinding, PortfolioMap as PortfolioMapType, CrossModelStats } from "@/lib/pbi-analysis/cross-model";
import type { PbiModelStats } from "@/lib/pbi-parser/types";

interface Member {
    id: string;
    name: string;
    source_filename: string;
    stats: PbiModelStats;
    created_at: string;
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
        created_at: string;
    };
    members: Member[];
}

export default function StudioPortfolio({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState<PortfolioData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [tab, setTab] = useState<"findings" | "map" | "narrative" | "models">("findings");

    const load = async () => {
        try {
            const res = await fetch(`/api/studio/portfolios/${id}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Portfolio laden mislukte.");
            setData(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Portfolio laden mislukte.");
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

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
        if (
            !window.confirm(
                `Portfolio "${data.portfolio.name}" verwijderen? De gekoppelde modellen blijven bestaan.`
            )
        ) {
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

    if (error && !data) {
        return (
            <div className="min-h-screen bg-[var(--color-neutral-50)] pt-32 pb-24">
                <div className="container mx-auto px-6 max-w-2xl text-center">
                    <p className="text-sm text-[var(--color-error)] mb-4">{error}</p>
                    <Link href="/studio" className="text-sm underline underline-offset-2">
                        Terug naar mijn projecten
                    </Link>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-[var(--color-neutral-50)] pt-32 pb-24 flex justify-center">
                <Loader2 size={28} className="animate-spin text-[var(--color-neutral-500)] mt-16" />
            </div>
        );
    }

    const { portfolio, members } = data;
    const analyzed = Boolean(portfolio.analyzed_at);
    const modelNames = members.map((m) => m.name || m.source_filename);

    return (
        <div className="min-h-screen bg-[var(--color-neutral-50)] pt-28 pb-12">
            <div className="container mx-auto px-6 max-w-5xl">
                {/* Kop */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <Link
                        href="/studio"
                        className="text-[var(--color-neutral-700)] hover:text-[var(--color-neutral-900)] inline-flex items-center gap-2 text-sm transition-colors"
                    >
                        <ArrowLeft size={16} /> Mijn projecten
                    </Link>
                    <div className="flex-grow min-w-0">
                        <h1 className="text-xl font-bold text-[var(--color-primary-900)] truncate flex items-center gap-2">
                            <Layers size={18} className="text-[var(--color-primary-700)]" />
                            {portfolio.name}
                        </h1>
                        <p className="text-xs text-[var(--color-neutral-500)]">
                            {members.length} modellen
                            {portfolio.stats
                                ? ` · ${portfolio.stats.sharedEntities} gedeelde entiteiten · ${portfolio.stats.findings} bevindingen`
                                : ""}
                        </p>
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-700)] hover:bg-[var(--color-primary-900)] px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60"
                    >
                        {analyzing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                        {analyzed ? "Opnieuw analyseren" : "Analyseer portfolio"}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="inline-flex items-center gap-2 text-sm text-[var(--color-neutral-700)] hover:text-[var(--color-error)] transition-colors"
                    >
                        {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        Verwijder
                    </button>
                </div>

                {error && <p className="mb-4 text-sm text-[var(--color-error)]">{error}</p>}

                {!analyzed ? (
                    <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-8 text-center">
                        <Layers size={28} className="mx-auto text-[var(--color-primary-700)] mb-3" />
                        <p className="text-sm text-[var(--color-neutral-700)] mb-1">
                            Dit portfolio is nog niet geanalyseerd.
                        </p>
                        <p className="text-xs text-[var(--color-neutral-500)] mb-5">
                            De cross-model-analyse vergelijkt {members.length} modellen op naamdrift,
                            gedeelde dimensies, dubbele measures en conflicterende relaties.
                        </p>
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-700)] hover:bg-[var(--color-primary-900)] px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60"
                        >
                            {analyzing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                            Start analyse
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-1 mb-3">
                            {(
                                [
                                    ["findings", "Bevindingen"],
                                    ["map", "Model-map"],
                                    ["narrative", "AI-analyse"],
                                    ["models", "Modellen"],
                                ] as const
                            ).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setTab(key)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        tab === key
                                            ? "bg-white text-[var(--color-neutral-900)] border border-[var(--color-neutral-200)] shadow-sm"
                                            : "text-[var(--color-neutral-700)] hover:text-[var(--color-neutral-900)]"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {tab === "findings" && (
                            <FindingsList findings={portfolio.analysis_findings ?? []} />
                        )}
                        {tab === "map" && (
                            <PortfolioMap
                                entities={portfolio.map_json?.entities ?? []}
                                modelNames={modelNames}
                            />
                        )}
                        {tab === "narrative" && portfolio.analysis_narrative && (
                            <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white p-5">
                                <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-900)] mb-2">
                                    <Sparkles size={15} className="text-[var(--color-accent-700)]" />
                                    AI-analyse van het landschap
                                </p>
                                <div
                                    className="text-sm text-[var(--color-neutral-700)] leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: renderStudioMarkdown(portfolio.analysis_narrative),
                                    }}
                                />
                            </div>
                        )}
                        {tab === "models" && (
                            <div className="space-y-3">
                                {members.map((m) => (
                                    <Link
                                        key={m.id}
                                        href={`/studio/p/${m.id}`}
                                        className="flex items-center gap-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 hover:border-[var(--color-primary-700)] transition-colors"
                                    >
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-semibold text-[var(--color-neutral-900)] truncate">
                                                {m.name}
                                            </p>
                                            <p className="text-xs text-[var(--color-neutral-500)]">
                                                {m.stats.tables} tabellen · {m.stats.measures} measures ·{" "}
                                                {m.stats.relationships} relaties
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
