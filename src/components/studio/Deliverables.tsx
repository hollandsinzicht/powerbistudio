"use client";

import { useState } from "react";
import { Loader2, FileText, ShieldCheck, KeyRound, RotateCcw, Sparkles, ChevronDown } from "lucide-react";
import { renderStudioMarkdown } from "@/components/studio/markdown";
import DownloadButtons from "@/components/studio/DownloadButtons";
import type { AvgPuntResult, AvgStatus } from "@/lib/pbi-analysis/avg-check";

type Kind = "doc" | "avg" | "rls";

interface Props {
    projectId: string;
    initialDoc: string | null;
    initialAvg: AvgPuntResult[] | null;
    initialRls: string | null;
}

const STATUS_STYLE: Record<AvgStatus, { label: string; cls: string }> = {
    voldaan: { label: "voldaan", cls: "bg-green-100 text-green-800" },
    risico: { label: "risico", cls: "bg-red-100 text-red-700" },
    "niet-detecteerbaar": { label: "handmatig", cls: "bg-gray-100 text-gray-600" },
};

export default function Deliverables({ projectId, initialDoc, initialAvg, initialRls }: Props) {
    const [doc, setDoc] = useState<string | null>(initialDoc);
    const [avg, setAvg] = useState<AvgPuntResult[] | null>(initialAvg);
    const [rls, setRls] = useState<string | null>(initialRls);
    const [busy, setBusy] = useState<Kind | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Opleveringen zijn inklapbaar: bestaande content start ingeklapt (ruimte
    // besparen), maar klapt automatisch open zodra je hem net genereert.
    const [open, setOpen] = useState<Record<Kind, boolean>>({ doc: false, avg: false, rls: false });
    const toggle = (kind: Kind) => setOpen((o) => ({ ...o, [kind]: !o[kind] }));

    const generate = async (kind: Kind) => {
        setBusy(kind);
        setError(null);
        try {
            const res = await fetch(`/api/studio/projects/${projectId}/deliverables`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kind }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.error ?? "Genereren mislukte.");
            if (kind === "doc") setDoc(json.value as string);
            else if (kind === "avg") setAvg(json.value as AvgPuntResult[]);
            else setRls(json.value as string);
            setOpen((o) => ({ ...o, [kind]: true }));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Genereren mislukte.");
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="space-y-6">
            <p className="text-xs text-[var(--color-neutral-500)]">
                Opleveringen worden gegenereerd op het ingelezen modelschema — niet op live data. Genereer
                wat je nodig hebt; je beoordeelt en levert het zelf op.
            </p>
            {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

            <DeliverableCard
                icon={<FileText size={15} />}
                title="Modeldocumentatie"
                hint="Leesbaar NL-document: tabellen, measures, relaties, aandachtspunten."
                hasContent={!!doc}
                busy={busy === "doc"}
                onGenerate={() => generate("doc")}
                projectId={projectId}
                downloadKind="doc"
                open={open.doc}
                onToggle={() => toggle("doc")}
            >
                {doc && (
                    <div
                        className="text-sm text-[var(--color-neutral-700)] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderStudioMarkdown(doc) }}
                    />
                )}
            </DeliverableCard>

            <DeliverableCard
                icon={<ShieldCheck size={15} />}
                title="AVG-check tegen het model"
                hint="De 12-punts AVG-checklist HR getoetst aan dit model. Governance-punten worden eerlijk als 'handmatig' gemarkeerd."
                hasContent={!!avg}
                busy={busy === "avg"}
                onGenerate={() => generate("avg")}
                projectId={projectId}
                downloadKind="avg"
                open={open.avg}
                onToggle={() => toggle("avg")}
            >
                {avg && <AvgTable report={avg} />}
            </DeliverableCard>

            <DeliverableCard
                icon={<KeyRound size={15} />}
                title="RLS-testcases"
                hint="Testmatrix op het gedetecteerde RLS-patroon. Toetst niet de echte rol-DAX (die zit in de Service) — stelt voor wat te testen."
                hasContent={!!rls}
                busy={busy === "rls"}
                onGenerate={() => generate("rls")}
                projectId={projectId}
                downloadKind="rls"
                open={open.rls}
                onToggle={() => toggle("rls")}
            >
                {rls && (
                    <div
                        className="text-sm text-[var(--color-neutral-700)] leading-relaxed studio-md"
                        dangerouslySetInnerHTML={{ __html: renderStudioMarkdown(rls) }}
                    />
                )}
            </DeliverableCard>
        </div>
    );
}

function DeliverableCard({
    icon,
    title,
    hint,
    hasContent,
    busy,
    onGenerate,
    projectId,
    downloadKind,
    open,
    onToggle,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    hint: string;
    hasContent: boolean;
    busy: boolean;
    onGenerate: () => void;
    projectId: string;
    downloadKind: "doc" | "avg" | "rls";
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
                {hasContent ? (
                    <button
                        onClick={onToggle}
                        className="flex items-start gap-2 text-left min-w-0 group"
                        aria-expanded={open}
                    >
                        <ChevronDown
                            size={16}
                            className={`mt-0.5 shrink-0 text-[var(--color-neutral-500)] transition-transform ${open ? "rotate-180" : ""}`}
                        />
                        <span className="min-w-0">
                            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-900)]">
                                {icon} {title}
                            </span>
                            <span className="block text-xs text-[var(--color-neutral-500)] mt-1">
                                {hint}
                                {!open && " · ingeklapt"}
                            </span>
                        </span>
                    </button>
                ) : (
                    <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-900)]">
                            {icon} {title}
                        </p>
                        <p className="text-xs text-[var(--color-neutral-500)] mt-1">{hint}</p>
                    </div>
                )}
                <div className="shrink-0 flex items-center gap-2">
                    {hasContent && <DownloadButtons source="project" id={projectId} kind={downloadKind} />}
                    <button
                        onClick={onGenerate}
                        disabled={busy}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-primary-900)] text-white text-sm font-medium disabled:opacity-60"
                    >
                        {busy ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : hasContent ? (
                            <RotateCcw size={14} />
                        ) : (
                            <Sparkles size={14} />
                        )}
                        {busy ? "Bezig…" : hasContent ? "Opnieuw" : "Genereer"}
                    </button>
                </div>
            </div>
            {hasContent && open && children && (
                <div className="mt-4 pt-4 border-t border-[var(--color-neutral-100)]">{children}</div>
            )}
        </div>
    );
}

function AvgTable({ report }: { report: AvgPuntResult[] }) {
    return (
        <div className="space-y-3">
            {report.map((p) => {
                const s = STATUS_STYLE[p.status] ?? STATUS_STYLE["niet-detecteerbaar"];
                return (
                    <div key={p.nummer} className="text-sm">
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${s.cls}`}>{s.label}</span>
                            <span className="font-medium text-[var(--color-neutral-900)]">
                                {p.nummer}. {p.titel}
                            </span>
                        </div>
                        {p.bevinding && (
                            <p className="text-[var(--color-neutral-700)] mt-1">{p.bevinding}</p>
                        )}
                        {p.aanbeveling && (
                            <p className="text-[var(--color-neutral-500)] mt-0.5">
                                <span className="font-medium">Aanbeveling:</span> {p.aanbeveling}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
