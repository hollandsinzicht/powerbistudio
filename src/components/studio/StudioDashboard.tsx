"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, FolderOpen, Loader2, LogOut } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import UploadDropzone from "./UploadDropzone";
import type { PbiModelStats } from "@/lib/pbi-parser/types";

interface ProjectSummary {
    id: string;
    name: string;
    source_filename: string;
    source_format: string;
    stats: PbiModelStats;
    created_at: string;
}

export default function StudioDashboard({ email }: { email: string }) {
    const router = useRouter();
    const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
    const [maxProjects, setMaxProjects] = useState(2);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await fetch("/api/studio/projects");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Laden mislukte.");
            setProjects(data.projects);
            setMaxProjects(data.maxProjects);
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
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? "Verwijderen mislukte.");
            }
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Verwijderen mislukte.");
        } finally {
            setDeleting(null);
        }
    };

    const handleLogout = async () => {
        await supabaseBrowser().auth.signOut();
        router.refresh();
    };

    const atLimit = projects !== null && projects.length >= maxProjects;

    return (
        <div className="container mx-auto px-6 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-primary-900)]">
                        Mijn projecten
                    </h1>
                    <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                        Ingelogd als {email}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 text-sm text-[var(--color-neutral-700)] hover:text-[var(--color-neutral-900)] transition-colors"
                >
                    <LogOut size={16} /> Uitloggen
                </button>
            </div>

            {error && <p className="mb-4 text-sm text-[var(--color-error)]">{error}</p>}

            {projects === null ? (
                <div className="flex justify-center py-16">
                    <Loader2 size={28} className="animate-spin text-[var(--color-neutral-500)]" />
                </div>
            ) : (
                <div className="space-y-6">
                    {projects.length > 0 && (
                        <div className="space-y-3">
                            {projects.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex items-center gap-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4"
                                >
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
                            ))}
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
                </div>
            )}
        </div>
    );
}
