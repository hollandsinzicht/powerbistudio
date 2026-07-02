"use client";

import { useEffect } from "react";
import { X, FileType2, Wrench, FolderTree, AlertTriangle } from "lucide-react";

const FORMATS = [
    {
        icon: FileType2,
        ext: ".pbit — Power BI-sjabloon (meest gebruikt)",
        how: [
            "Open je rapport in Power BI Desktop.",
            "Kies Bestand → Exporteren → Power BI-sjabloon.",
            "Sla op zonder standaardwaarden in te vullen — die zijn niet nodig.",
            "Upload het .pbit-bestand hier.",
        ],
        note: "Een sjabloon bevat het volledige model (tabellen, measures, relaties) maar géén data — precies wat Studio nodig heeft.",
    },
    {
        icon: Wrench,
        ext: "model.bim — Tabular Editor",
        how: [
            "Open je model in Tabular Editor (2 of 3).",
            "Kies File → Save As en sla op als model.bim.",
            "Upload het .bim-bestand hier.",
        ],
        note: "Werk je met Fabric/Analysis Services of een database.json uit een ontwikkelproject, dan werkt dat ook (uploaden als .json kan eveneens).",
    },
    {
        icon: FolderTree,
        ext: ".pbip — Power BI-project (PBIP)",
        how: [
            "Sla je rapport in Power BI Desktop op als Power BI-project (.pbip).",
            "Open in de projectmap de map *.SemanticModel/definition. Je ziet daar o.a. model.tmdl, relationships.tmdl en een submap tables.",
            "Zip de héle map definition — inclusief de submap tables. Kies dus géén los bestand.",
            "Upload die .zip hier.",
        ],
        note: "Belangrijk: upload nooit één los .tmdl-bestand. De tabellen en measures zitten in de submap tables, de relaties in relationships.tmdl — alleen samen vormen ze het complete model. (De hele *.SemanticModel-map zippen werkt ook.)",
    },
] as const;

export default function FileHelpModal({ onClose }: { onClose: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Hoe kom ik aan een modelbestand?"
        >
            <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-1">
                    <h2 className="text-xl font-bold text-[var(--color-primary-900)]">
                        Hoe kom ik aan een modelbestand?
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)] transition-colors p-1"
                        aria-label="Sluiten"
                    >
                        <X size={20} />
                    </button>
                </div>
                <p className="text-sm text-[var(--color-neutral-700)] mb-6">
                    Studio leest het <strong>schema</strong> van je semantische model — tabellen,
                    kolommen, measures en relaties. Je data gaat dus nooit mee. Drie manieren om
                    zo&apos;n bestand te maken:
                </p>

                <div className="space-y-6">
                    {FORMATS.map((f) => (
                        <div key={f.ext} className="rounded-xl border border-[var(--color-neutral-200)] p-5">
                            <p className="flex items-center gap-2 font-semibold text-sm text-[var(--color-neutral-900)] mb-3">
                                <f.icon size={17} className="text-[var(--color-primary-700)]" />
                                {f.ext}
                            </p>
                            <ol className="list-decimal ml-5 space-y-1 text-sm text-[var(--color-neutral-700)]">
                                {f.how.map((step) => (
                                    <li key={step}>{step}</li>
                                ))}
                            </ol>
                            <p className="text-xs text-[var(--color-neutral-500)] mt-3">{f.note}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-[var(--color-warning)]/30 bg-amber-50 p-4">
                    <AlertTriangle size={16} className="text-[var(--color-warning)] mt-0.5 shrink-0" />
                    <p className="text-sm text-[var(--color-neutral-900)]">
                        <strong>Een .pbix werkt niet rechtstreeks</strong> — daarin zit het model
                        propriëtair gecomprimeerd (mét je data). Exporteer hem eerst als sjabloon:{" "}
                        <em>Bestand → Exporteren → Power BI-sjabloon</em>. Dat duurt tien seconden.
                    </p>
                </div>
            </div>
        </div>
    );
}
