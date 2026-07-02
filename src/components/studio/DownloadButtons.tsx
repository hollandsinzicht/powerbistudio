"use client";

import { useState } from "react";
import { Loader2, FileDown, FileText } from "lucide-react";
import { exportArtifact, type ExportSource, type ExportFormat } from "@/lib/studio/download";

// Twee knopjes (Markdown + PDF) voor een gegenereerd artefact. Herbruikbaar op
// opleveringen en de portfolio-audit.
export default function DownloadButtons({
    source,
    id,
    kind,
}: {
    source: ExportSource;
    id: string;
    kind: string;
}) {
    const [busy, setBusy] = useState<ExportFormat | null>(null);
    const [error, setError] = useState<string | null>(null);

    const run = async (format: ExportFormat) => {
        setBusy(format);
        setError(null);
        try {
            await exportArtifact(source, id, kind, format);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Download mislukte.");
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => run("md")}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-neutral-200)] bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--color-neutral-700)] hover:border-[var(--color-primary-700)] transition-colors disabled:opacity-60"
            >
                {busy === "md" ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
                Markdown
            </button>
            <button
                onClick={() => run("pdf")}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-neutral-200)] bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--color-neutral-700)] hover:border-[var(--color-primary-700)] transition-colors disabled:opacity-60"
            >
                {busy === "pdf" ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
                PDF
            </button>
            {error && <span className="text-xs text-[var(--color-error)]">{error}</span>}
        </div>
    );
}
