"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, FolderOpen, Loader2, Info, MessageCircle, FileUp, Search, MessageSquareCode, ShieldCheck, Layers } from "lucide-react";
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
    { icon: FileUp, text: "Upload je model (.pbit, model.bim of .tmdl) — alleen het schema, nooit je data." },
    { icon: Search, text: "Je krijgt direct een analyse: best-practice-checks plus een AI-beoordeling." },
    { icon: MessageSquareCode, text: "Stel daarna vragen over je measures, relaties en DAX — gegrond in jóuw model." },
] as const;

interface ProjectSummary {
    id: string;
    name: string;
    source_filename: string;
    source_format: string;
    stats: PbiModelStats;
    created_at: string;
}

interface PortfolioSummary {
    id: string;
    name: string;
    modelCount: number;
    analyzed_at: string | null;
    created_at: string;
}

export default function StudioDashboard() {
    const router = useRouter();
    const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
    const [portfolios, setPortfolios] = useState<PortfolioSummary[]>([]);
    const [maxProjects, setMaxProjects] = useState(2);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showFileHelp, setShowFileHelp] = useState(false);
    const [showSecurity, setShowSecurity] = useState(false);
    const [deleteProof, setDeleteProof] = useState<DeleteVerification | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [portfolioName, setPortfolioName] = useState("");
    const [creating, setCreating] = useState(false);

    const load = useCallback(async () => {
        try {
            const [pRes, plRes] = await Promise.all([
                fetch("/api/studio/projects"),
                fetch("/api/studio/portfolios"),
            ]);
            const data = await pRes.json();
            if (!pRes.ok) throw new Error(data.error ?? "Laden mislukte.");
            setProjects(data.projects);
            setMaxProjects(data.maxProjects);
            const plData = await plRes.json().catch(() => ({}));
            if (plRes.ok) setPortfolios(plData.portfolios ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Laden mislukte.");
            setProjects([]);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleDelete = async (project: ProjectSummary) => {
        if (
            !window.confirm(
                `"${project.name}" definitief verwijderen? Het modelbestand, de analyse en de chatgeschiedenis worden permanent gewist.`
            )
        ) {
            return;
        }
        setDeleting(project.id);
        setError(null);
        try {
            const res = await fetch(`/api/studio/projects/${project.id}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error ?? "Verwijderen mislukte.");
            }
            if (data.verification) setDeleteProof(data.verification);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Verwijderen mislukte.");
        } finally {
            setDeleting(null);
        }
    };

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleCreatePortfolio = async () => {
        if (selected.size < 2) return;
        setCreating(true);
        setError(null);
        try {
            const res = await fetch("/api/studio/portfolios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: portfolioName.trim() || "Portfolio",
                    projectIds: [...selected],
                }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.error ?? "Portfolio aanmaken mislukte.");
            router.push(`/studio/portfolio/${json.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Portfolio aanmaken mislukte.");
            setCreating(false);
        }
    };

    const atLimit = projects !== null && projects.length >= maxProjects;

    return (
        <div className="container mx-auto px-6 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-primary-900)]">
                    Mijn projecten
                </h1>
                <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                    Je projecten, analyses en chats blijven bewaard, ook nadat je uitlogt.
                </p>
            </div>

            {/* Korte uitleg bovenaan — ook voor terugkerende gebruikers compact genoeg */}
            {projects !== null && (
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

            {projects === null ? (
                <div className="flex justify-center py-16">
                    <Loader2 size={28} className="animate-spin text-[var(--color-neutral-500)]" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Portfolios: cross-model-analyse over meerdere modellen */}
                    {portfolios.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-semibold text-[var(--color-neutral-700)] flex items-center gap-2">
                                <Layers size={16} className="text-[var(--color-primary-700)]" />
                                Portfolios
                            </h2>
                            {portfolios.map((pf) => (
                                <Link
                                    key={pf.id}
                                    href={`/studio/portfolio/${pf.id}`}
                                    className="flex items-center gap-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 hover:border-[var(--color-primary-700)] transition-colors"
                                >
                                    <Layers size={20} className="text-[var(--color-primary-700)] shrink-0" />
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-semibold text-[var(--color-neutral-900)] truncate">
                                            {pf.name}
                                        </p>
                                        <p className="text-xs text-[var(--color-neutral-500)]">
                                            {pf.modelCount} modellen ·{" "}
                                            {pf.analyzed_at ? "geanalyseerd" : "nog niet geanalyseerd"}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {projects.length > 0 && (
                        <div className="space-y-3">
                            {projects.map((p) => {
                                const isSelected = selected.has(p.id);
                                return (
                                    <div
                                        key={p.id}
                                        className={`flex items-center gap-4 rounded-xl border bg-white p-4 transition-colors ${
                                            isSelected
                                                ? "border-[var(--color-primary-700)]"
                                                : "border-[var(--color-neutral-200)]"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(p.id)}
                                            aria-label={`Selecteer ${p.name} voor portfolio`}
                                            className="shrink-0 h-4 w-4 accent-[var(--color-primary-700)]"
                                        />
                                        <FolderOpen size={20} className="text-[var(--color-primary-700)] shrink-0" />
                                        <Link href={`/studio/p/${p.id}`} className="flex-grow min-w-0 group">
                                            <p className="text-sm font-semibold text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-700)] transition-colors truncate">
                                                {p.name}
                                            </p>
                                            <p className="text-xs text-[var(--color-neutral-500)]">
                                                {p.stats.tables} tabellen · {p.stats.measures} measures ·{" "}
                                                {p.stats.relationships} relaties ·{" "}
                                                {new Date(p.created_at).toLocaleDateString("nl-NL")}
                                            </p>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(p)}
                                            disabled={deleting === p.id}
                                            className="shrink-0 text-[var(--color-neutral-500)] hover:text-[var(--color-error)] transition-colors p-2"
                                            aria-label={`Verwijder ${p.name}`}
                                        >
                                            {deleting === p.id ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Selectie → portfolio maken (cross-model-analyse) */}
                    {selected.size >= 1 && (
                        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-primary-700)]/40 bg-[var(--color-accent-100)]/30 p-4">
                            <Layers size={18} className="text-[var(--color-primary-700)] shrink-0" />
                            <p className="text-sm text-[var(--color-neutral-700)]">
                                {selected.size} model{selected.size === 1 ? "" : "len"} geselecteerd
                                {selected.size < 2 && " — kies er minstens 2 voor een portfolio"}
                            </p>
                            <input
                                type="text"
                                value={portfolioName}
                                onChange={(e) => setPortfolioName(e.target.value)}
                                placeholder="Naam van portfolio"
                                className="flex-grow min-w-[10rem] rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm"
                            />
                            <button
                                onClick={handleCreatePortfolio}
                                disabled={selected.size < 2 || creating}
                                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-700)] hover:bg-[var(--color-primary-900)] px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
                            >
                                {creating ? <Loader2 size={15} className="animate-spin" /> : <Layers size={15} />}
                                Maak portfolio
                            </button>
                        </div>
                    )}

                    {atLimit ? (
                        <p className="text-sm text-[var(--color-neutral-500)] rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-4">
                            Beta-limiet bereikt ({maxProjects} projecten). Verwijder een project om
                            een nieuw model te analyseren.
                        </p>
                    ) : (
                        <UploadDropzone />
                    )}

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
            {deleteProof && (
                <DeleteProofModal verification={deleteProof} onClose={() => setDeleteProof(null)} />
            )}
        </div>
    );
}
