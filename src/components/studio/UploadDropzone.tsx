"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, AlertCircle } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Phase = "idle" | "uploading" | "analyzing";

// Upload: signed URL ophalen → bestand direct naar de private bucket →
// server parseert + analyseert → door naar de projectpagina.
export default function UploadDropzone() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [phase, setPhase] = useState<Phase>("idle");
    const [error, setError] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);

    const handleFile = async (file: File) => {
        setError(null);
        setPhase("uploading");
        try {
            const urlRes = await fetch("/api/studio/upload-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: file.name, size: file.size }),
            });
            const urlData = await urlRes.json();
            if (!urlRes.ok) throw new Error(urlData.error ?? "Upload-URL aanvragen mislukte.");

            const supabase = supabaseBrowser();
            const { error: uploadError } = await supabase.storage
                .from("pbi-models")
                .uploadToSignedUrl(urlData.path, urlData.token, file);
            if (uploadError) throw new Error("Uploaden mislukte. Probeer het opnieuw.");

            setPhase("analyzing");
            const createRes = await fetch("/api/studio/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: urlData.projectId,
                    path: urlData.path,
                    filename: file.name,
                }),
            });
            const created = await createRes.json();
            if (!createRes.ok) throw new Error(created.error ?? "Analyseren mislukte.");

            router.push(`/studio/p/${created.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Er ging iets mis.");
            setPhase("idle");
        }
    };

    const busy = phase !== "idle";

    return (
        <div>
            <div
                onClick={() => !busy && inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!busy) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file && !busy) handleFile(file);
                }}
                className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
                    busy
                        ? "border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] cursor-wait"
                        : dragging
                          ? "border-[var(--color-primary-700)] bg-[var(--color-accent-100)]/30 cursor-pointer"
                          : "border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-primary-700)] cursor-pointer"
                }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pbit,.bim,.json,.tmdl,.zip"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                        e.target.value = "";
                    }}
                />
                {busy ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 size={32} className="animate-spin text-[var(--color-primary-700)]" />
                        <p className="text-sm font-medium text-[var(--color-neutral-900)]">
                            {phase === "uploading"
                                ? "Bestand uploaden…"
                                : "Model analyseren — dit duurt zo'n 30 seconden…"}
                        </p>
                        {phase === "analyzing" && (
                            <p className="text-xs text-[var(--color-neutral-500)]">
                                We parseren het schema, draaien best-practice-checks en schrijven een samenvatting.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <FileUp size={32} className="text-[var(--color-primary-700)]" />
                        <p className="text-sm font-medium text-[var(--color-neutral-900)]">
                            Sleep je modelbestand hierheen of klik om te kiezen
                        </p>
                        <p className="text-xs text-[var(--color-neutral-500)]">
                            .pbit · model.bim · .tmdl · .zip — alleen metadata, geen bedrijfsdata.
                            <br />
                            Een .pbix? Exporteer eerst via <em>Bestand → Exporteren → Power BI-sjabloon</em>.
                        </p>
                    </div>
                )}
            </div>
            {error && (
                <div className="mt-3 flex items-start gap-2 rounded-md border border-[var(--color-error)]/30 bg-red-50 p-3 text-sm text-[var(--color-neutral-900)]">
                    <AlertCircle size={16} className="text-[var(--color-error)] mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}
