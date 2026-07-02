"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Loader2, FolderOpen, Unlink, ExternalLink, Sparkles } from "lucide-react";
import FindingsList from "./FindingsList";
import SchemaBrowser from "./SchemaBrowser";
import { renderStudioMarkdown } from "./markdown";
import type { Finding } from "@/lib/pbi-analysis/checks";
import type { PbiModel, PbiModelStats } from "@/lib/pbi-parser/types";

interface Detail {
    schema_json: PbiModel;
    analysis_findings: Finding[] | null;
    analysis_narrative: string | null;
}

// Inline drill-down van één model binnen de projectpagina: uitklappen toont
// Analyse/Schema van dat model, zónder de projectpagina te verlaten. Detail wordt
// lui geladen bij het openen.
export default function ProjectModelPanel({
    modelId,
    name,
    stats,
    onDetach,
    busy,
}: {
    modelId: string;
    name: string;
    stats: PbiModelStats;
    onDetach: () => void;
    busy: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [detail, setDetail] = useState<Detail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sub, setSub] = useState<"analyse" | "schema">("analyse");

    const toggle = async () => {
        const next = !open;
        setOpen(next);
        if (next && !detail && !loading) {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/studio/projects/${modelId}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.error ?? "Laden mislukte.");
                setDetail(json.project);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Laden mislukte.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white">
            <div className="flex items-center gap-3 p-4">
                <button onClick={toggle} className="flex items-center gap-3 flex-grow min-w-0 text-left" aria-expanded={open}>
                    <ChevronDown size={16} className={`shrink-0 text-[var(--color-neutral-500)] transition-transform ${open ? "rotate-180" : ""}`} />
                    <FolderOpen size={18} className="text-[var(--color-primary-700)] shrink-0" />
                    <span className="min-w-0">
                        <span className="block text-sm font-semibold text-[var(--color-neutral-900)] truncate">{name}</span>
                        <span className="block text-xs text-[var(--color-neutral-500)]">
                            {stats.tables} tabellen · {stats.measures} measures · {stats.relationships} relaties
                        </span>
                    </span>
                </button>
                <button
                    onClick={onDetach}
                    disabled={busy}
                    className="shrink-0 inline-flex items-center gap-1.5 text-xs text-[var(--color-neutral-500)] hover:text-[var(--color-error)] transition-colors"
                    title="Uit project halen (blijft als los datamodel bestaan)"
                >
                    <Unlink size={14} /> Losmaken
                </button>
            </div>

            {open && (
                <div className="border-t border-[var(--color-neutral-100)] p-4">
                    {loading ? (
                        <div className="flex justify-center py-6">
                            <Loader2 size={20} className="animate-spin text-[var(--color-neutral-500)]" />
                        </div>
                    ) : error ? (
                        <p className="text-sm text-[var(--color-error)]">{error}</p>
                    ) : detail ? (
                        <>
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <div className="flex gap-1">
                                    {(["analyse", "schema"] as const).map((k) => (
                                        <button
                                            key={k}
                                            onClick={() => setSub(k)}
                                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                                sub === k
                                                    ? "bg-[var(--color-neutral-100)] font-medium text-[var(--color-neutral-900)]"
                                                    : "text-[var(--color-neutral-700)] hover:text-[var(--color-neutral-900)]"
                                            }`}
                                        >
                                            {k === "analyse" ? "Analyse" : "Schema"}
                                        </button>
                                    ))}
                                </div>
                                <Link
                                    href={`/studio/p/${modelId}`}
                                    className="shrink-0 inline-flex items-center gap-1 text-xs text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)] transition-colors"
                                    title="Open als volledige pagina (met eigen oplevering)"
                                >
                                    <ExternalLink size={12} /> Volledige pagina
                                </Link>
                            </div>

                            {sub === "analyse" && (
                                <div className="space-y-4">
                                    <FindingsList findings={detail.analysis_findings ?? []} />
                                    {detail.analysis_narrative && (
                                        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white p-4">
                                            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-900)] mb-2">
                                                <Sparkles size={14} className="text-[var(--color-accent-700)]" /> AI-samenvatting
                                            </p>
                                            <div
                                                className="text-sm text-[var(--color-neutral-700)] leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: renderStudioMarkdown(detail.analysis_narrative) }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            {sub === "schema" && <SchemaBrowser model={detail.schema_json} />}
                        </>
                    ) : null}
                </div>
            )}
        </div>
    );
}
