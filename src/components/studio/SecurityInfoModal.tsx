"use client";

import { useEffect } from "react";
import { X, Lock, Eye, Trash2, Bot } from "lucide-react";

const SECTIONS = [
    {
        icon: Lock,
        title: "Waar staat je bestand?",
        body: "In een afgeschermde opslag-bucket (Supabase) in een EU-datacenter. De bucket is privé: er bestaan geen publieke links, en uploaden kan alleen via een door onze server uitgegeven, kortlevende upload-URL nadat je bent ingelogd. Downloaden kan uitsluitend door de server zelf — je browser (of die van wie dan ook) heeft geen directe toegang tot de opslag.",
    },
    {
        icon: Eye,
        title: "Wie kan erbij?",
        body: "Alleen jouw account. Elke databaserij is met row-level security aan jouw gebruikers-ID gekoppeld — andere gebruikers kunnen jouw projecten technisch niet opvragen, ook niet bij een fout in de applicatie. In serverlogboeken slaan we nooit schema-inhoud, DAX of tabelnamen op; alleen anonieme aantallen en tijdsduren.",
    },
    {
        icon: Bot,
        title: "Wat gaat er naar de AI?",
        body: "Voor de analyse en chat sturen we het modelschema (tabel-, kolom- en measure-namen plus DAX — metadata, geen data) en jouw vragen naar de Anthropic API. Anthropic gebruikt API-verkeer standaard niet om modellen te trainen. Let op: wat je zelf in de chat typt, wordt bij je project bewaard — deel daarin dus geen bedrijfsdata of persoonsgegevens.",
    },
    {
        icon: Trash2,
        title: "Wat gebeurt er bij verwijderen?",
        body: "Verwijderen is een hard delete: het bestand wordt uit de opslag gewist en het project, de analyse en de volledige chatgeschiedenis uit de database. Direct daarna lezen we opslag en database opnieuw uit en tonen we je het resultaat van die hercontrole — je hoeft ons niet op ons woord te geloven. Eén eerlijke kanttekening: de databaseprovider bewaart voor calamiteiten kortlopende technische backups die automatisch verlopen; daarna bestaat er nergens meer een kopie.",
    },
] as const;

export default function SecurityInfoModal({ onClose }: { onClose: () => void }) {
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
            aria-label="Zo zit de beveiliging in elkaar"
        >
            <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-1">
                    <h2 className="text-xl font-bold text-[var(--color-primary-900)]">
                        Zo zit de beveiliging in elkaar
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
                    Geen marketingtaal — dit is technisch hoe het werkt.
                </p>

                <div className="space-y-5">
                    {SECTIONS.map((s) => (
                        <div key={s.title}>
                            <p className="flex items-center gap-2 font-semibold text-sm text-[var(--color-neutral-900)] mb-1.5">
                                <s.icon size={16} className="text-[var(--color-accent-700)]" />
                                {s.title}
                            </p>
                            <p className="text-sm text-[var(--color-neutral-700)] leading-relaxed">{s.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
