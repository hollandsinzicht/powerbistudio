"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, FolderOpen, Loader2, Info, MessageCircle, FileUp, Search, MessageSquareCode, ShieldCheck, Layers, Plus } from "lucide-react";
import UploadDropzone from "./UploadDropzone";
import FileHelpModal from "./FileHelpModal";
import SecurityInfoModal from "./SecurityInfoModal";
import DeleteProofModal, { DeleteVerification } from "./DeleteProofModal";
import type { PbiModelStats } from "@/lib/pbi-parser/types";

// WhatsApp rechtstreeks naar Jan-Willem — laagdrempelig kanaal tijdens de beta.
const WHATSAPP_URL =
    "https://wa.me/31612654166?text=" +
    encodeURIComponent("Hoi Jan-Willem, ik gebruik Studio en heb een vraag: ");

const STEPS = [
    { icon: FileUp, text: "Upload een datamodel (.pbit, model.bim of .tmdl) — alleen het schema, nooit je data." },
    { icon: Search, text: "Je krijgt direct een analyse: best-practice-checks plus een AI-beoordeling." },
    { icon: MessageSquareCode, text: "Bundel modellen tot een project voor cross-model-analyse en projectchat." },
] as const;

interface DatamodelSummary {
    id: string;
    name: string;
    source_filename: string;
    source_format: string;
    stats: PbiModelStats;
    created_at: string;
}

interface ProjectSummary {
    id: string;
    name: string;
    modelCount: number;
    analyzed_at: string | null;
    created_at: string;
}

export default function StudioDashboard() {
    const router = useRouter();
    const [models, setModels] = useState<DatamodelSummary[] | null>(null);
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFileHelp, setShowFileHelp] = useState(false);
    const [showSecurity, setShowSecurity] = useState(false);
    const [deleteProof, setDeleteProof] = useState<DeleteVerification | null>(null);

    const load = useCallback(async () => {
        try {
            const [mRes, pRes] = await Promise.all([
                fetch("/api/studio/projects?scope=loose"),
                fetch("/api/studio/portfolios"),
            ]);
            const mData = await mRes.json();
            if (!mRes.ok) throw new Error(mData.error ?? "Laden mislukte.");
            setModels(mData.projects);
            const pData = await pRes.json().catch(() => ({}));
            if (pRes.ok) setProjects(pData.portfolios ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Laden mislukte.");
            setModels([]);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleDelete = async (model: DatamodelSummary) => {
        if (
            !window.confirm(
                `"${model.name}" definitief verwijderen? Het modelbestand, de analyse en de chatgeschiedenis worden permanent gewist.`
            )
        ) {
            return;
        }
        setDeleting(model.id);
        setError(null);
        try {
            const res = await fetch(`/api/studio/projects/${model.id}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error ?? "Verwijderen mislukte.");
            if (data.verification) setDeleteProof(data.verification);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Verwijderen mislukte.");
        } finally {
            setDeleting(null);
        }
    };

    const handleNewProject = async () => {
        const name = window.prompt("Naam van het nieuwe project:", "Nieuw project");
        if (name === null) return;
        setCreating(true);
        setError(null);
        try {
            const res = await fetch("/api/studio/portfolios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() || "Nieuw project" }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.error ?? "Project aanmaken mislukte.");
            router.push(`/studio/portfolio/${json.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Project aanmaken mislukte.");
            setCreating(false);
        }
    };

    return (
        <div className="container mx-auto px-6 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-primary-900)]">Overzicht</h1>
                <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                    Je projecten, datamodellen, analyses en chats blijven bewaard, ook nadat je uitlogt.
                </p>
            </div>

            {models !== null && (
                <div className="mb-8 grid sm:grid-cols-3 gap-4">
                    {STEPS.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4">
                            <step.icon size={18} className="text-[var(--color-primary-700)] mt-0.5 shrink-0" />
                            <p className="text-sm text-[var(--color-neutral-700)]">{step.text}</p>
                        </div>
                    ))}
                </div>
            )}

            {error && <p className="mb-4 text-sm text-[var(--color-error)]">{error}</p>}

            {models === null ? (
                <div className="flex justify-center py-16">
                    <Loader2 size={28} className="animate-spin text-[var(--color-neutral-500)]" />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Projecten (containers) */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-[var(--color-neutral-700)] flex items-center gap-2">
                                <Layers size={16} className="text-[var(--color-primary-700)]" />
                                Projecten
                            </h2>
                            <button
                                onClick={handleNewProject}
                                disabled={creating}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary-900)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
                            >
                                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                Nieuw project
                            </button>
                        </div>
                        {projects.length === 0 ? (
                            <p className="text-sm text-[var(--color-neutral-500)] rounded-xl border border-dashed border-[var(--color-neutral-200)] bg-white p-4">
                                Nog geen projecten. Een project bundelt meerdere datamodellen voor
                                cross-model-analyse en projectchat.
                            </p>
                        ) : (
                            projects.map((pf) => (
                                <Link
                                    key={pf.id}
                                    href={`/studio/portfolio/${pf.id}`}
                                    className="flex items-center gap-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 hover:border-[var(--color-primary-700)] transition-colors"
                                >
                                    <Layers size={20} className="text-[var(--color-primary-700)] shrink-0" />
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-semibold text-[var(--color-neutral-900)] truncate">{pf.name}</p>
                                        <p className="text-xs text-[var(--color-neutral-500)]">
                                            {pf.modelCount} {pf.modelCount === 1 ? "datamodel" : "datamodellen"} ·{" "}
                                            {pf.analyzed_at ? "geanalyseerd" : "nog niet geanalyseerd"}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Losse datamodellen */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-[var(--color-neutral-700)] flex items-center gap-2">
                            <FolderOpen size={16} className="text-[var(--color-primary-700)]" />
                            Losse datamodellen
                        </h2>
                        {models.map((m) => (
                            <div key={m.id} className="flex items-center gap-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4">
                                <FolderOpen size={20} className="text-[var(--color-primary-700)] shrink-0" />
                                <Link href={`/studio/p/${m.id}`} className="flex-grow min-w-0 group">
                                    <p className="text-sm font-semibold text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-700)] transition-colors truncate">{m.name}</p>
                                    <p className="text-xs text-[var(--color-neutral-500)]">
                                        {m.stats.tables} tabellen · {m.stats.measures} measures · {m.stats.relationships} relaties ·{" "}
                                        {new Date(m.created_at).toLocaleDateString("nl-NL")}
                                    </p>
                                </Link>
                                <button
                                    onClick={() => handleDelete(m)}
                                    disabled={deleting === m.id}
                                    className="shrink-0 text-[var(--color-neutral-500)] hover:text-[var(--color-error)] transition-colors p-2"
                                    aria-label={`Verwijder ${m.name}`}
                                >
                                    {deleting === m.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                </button>
                            </div>
                        ))}
                        <UploadDropzone />
                    </div>

                    {/* Hulp: bestandsuitleg + direct contact */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setShowFileHelp(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-neutral-200)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-neutral-900)] hover:border-[var(--color-primary-700)] transition-colors"
                        >
                            <Info size={16} className="text-[var(--color-primary-700)]" />
                            Hoe kom ik aan een modelbestand?
                        </button>
                        <button
                            onClick={() => setShowSecurity(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-neutral-200)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-neutral-900)] hover:border-[var(--color-accent-700)] transition-colors"
                        >
                            <ShieldCheck size={16} className="text-[var(--color-accent-700)]" />
                            Zo zit de beveiliging in elkaar
                        </button>
                        <a
                            href={WHATSAPP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#1ebe5b] px-4 py-2.5 text-sm font-medium text-white transition-colors"
                        >
                            <MessageCircle size={16} />
                            Vraag of feedback? App Jan-Willem
                        </a>
                    </div>
                </div>
            )}

            {showFileHelp && <FileHelpModal onClose={() => setShowFileHelp(false)} />}
            {showSecurity && <SecurityInfoModal onClose={() => setShowSecurity(false)} />}
            {deleteProof && <DeleteProofModal verification={deleteProof} onClose={() => setDeleteProof(null)} />}
        </div>
    );
}
