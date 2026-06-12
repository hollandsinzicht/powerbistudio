"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Trash2, Sparkles } from "lucide-react";
import FindingsList from "@/components/studio/FindingsList";
import SchemaBrowser from "@/components/studio/SchemaBrowser";
import ChatPanel, { ChatSummary } from "@/components/studio/ChatPanel";
import DeleteProofModal, { DeleteVerification } from "@/components/studio/DeleteProofModal";
import { renderStudioMarkdown } from "@/components/studio/markdown";
import type { Finding } from "@/lib/pbi-analysis/checks";
import type { PbiModel, PbiModelStats } from "@/lib/pbi-parser/types";

interface ProjectData {
    project: {
        id: string;
        name: string;
        source_filename: string;
        schema_json: PbiModel;
        stats: PbiModelStats;
        analysis_findings: Finding[] | null;
        analysis_narrative: string | null;
        created_at: string;
    };
    chats: ChatSummary[];
    usage: { used: number; limit: number };
}

export default function StudioProject({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState<ProjectData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteProof, setDeleteProof] = useState<DeleteVerification | null>(null);
    const [tab, setTab] = useState<"report" | "schema">("report");

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/studio/projects/${id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.error ?? "Project laden mislukte.");
                setData(json);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Project laden mislukte.");
            }
        })();
    }, [id]);

    const handleDelete = async () => {
        if (!data) return;
        if (
            !window.confirm(
                `"${data.project.name}" definitief verwijderen? Het modelbestand, de analyse en de chatgeschiedenis worden permanent gewist.`
            )
        ) {
            return;
        }
        setDeleting(true);
        try {
            const res = await fetch(`/api/studio/projects/${id}`, { method: "DELETE" });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(json.error ?? "Verwijderen mislukte.");
            }
            if (json.verification) {
                setDeleteProof(json.verification);
            } else {
                router.push("/studio");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Verwijderen mislukte.");
            setDeleting(false);
        }
    };

    if (deleteProof) {
        return (
            <div className="min-h-screen bg-[var(--color-neutral-50)] pt-32 pb-24">
                <DeleteProofModal
                    verification={deleteProof}
                    onClose={() => router.push("/studio")}
                />
            </div>
        );
    }

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

    const { project, chats, usage } = data;

    return (
        <div className="min-h-screen bg-[var(--color-neutral-50)] pt-28 pb-12">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Kop */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <Link
                        href="/studio"
                        className="text-[var(--color-neutral-700)] hover:text-[var(--color-neutral-900)] inline-flex items-center gap-2 text-sm transition-colors"
                    >
                        <ArrowLeft size={16} /> Mijn projecten
                    </Link>
                    <div className="flex-grow min-w-0">
                        <h1 className="text-xl font-bold text-[var(--color-primary-900)] truncate">
                            {project.name}
                        </h1>
                        <p className="text-xs text-[var(--color-neutral-500)]">
                            {project.source_filename} · {project.stats.tables} tabellen ·{" "}
                            {project.stats.columns} kolommen · {project.stats.measures} measures ·{" "}
                            {project.stats.relationships} relaties
                        </p>
                    </div>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="inline-flex items-center gap-2 text-sm text-[var(--color-neutral-700)] hover:text-[var(--color-error)] transition-colors"
                    >
                        {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        Verwijder project
                    </button>
                </div>

                {error && <p className="mb-4 text-sm text-[var(--color-error)]">{error}</p>}

                <div className="grid lg:grid-cols-2 gap-6 items-start">
                    {/* Linkerpaneel: rapport/schema */}
                    <div>
                        <div className="flex gap-1 mb-3">
                            {(
                                [
                                    ["report", "Analyse"],
                                    ["schema", "Schema"],
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

                        {tab === "report" ? (
                            <div className="space-y-6">
                                <FindingsList findings={project.analysis_findings ?? []} />
                                {project.analysis_narrative && (
                                    <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white p-5">
                                        <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-900)] mb-2">
                                            <Sparkles size={15} className="text-[var(--color-accent-700)]" />
                                            AI-samenvatting
                                        </p>
                                        <div
                                            className="text-sm text-[var(--color-neutral-700)] leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                                __html: renderStudioMarkdown(project.analysis_narrative),
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <SchemaBrowser model={project.schema_json} />
                        )}
                    </div>

                    {/* Rechterpaneel: chat */}
                    <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-white overflow-hidden lg:sticky lg:top-24 flex flex-col h-[70vh]">
                        <ChatPanel projectId={project.id} initialChats={chats} usage={usage} />
                    </div>
                </div>
            </div>
        </div>
    );
}
