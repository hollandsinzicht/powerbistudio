"use client";

import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

export interface DeleteVerification {
    filename: string;
    hadFile: boolean;
    storageObjectsRemaining: number;
    projectRowsRemaining: number;
    messageRowsRemaining: number;
    messagesDeleted: number;
    verifiedAt: string;
}

function Check({ ok, label }: { ok: boolean; label: string }) {
    const Icon = ok ? CheckCircle2 : XCircle;
    return (
        <li className="flex items-start gap-2.5">
            <Icon
                size={17}
                className={`mt-0.5 shrink-0 ${ok ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}
            />
            <span className="text-sm text-[var(--color-neutral-900)]">{label}</span>
        </li>
    );
}

// Toont het resultaat van de live hercontrole die de server ná het
// verwijderen uitvoerde: opslag en database zijn opnieuw uitgelezen.
export default function DeleteProofModal({
    verification,
    onClose,
}: {
    verification: DeleteVerification;
    onClose: () => void;
}) {
    const v = verification;
    const allClear =
        v.storageObjectsRemaining === 0 &&
        v.projectRowsRemaining === 0 &&
        v.messageRowsRemaining === 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Verwijdering geverifieerd"
        >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck size={24} className="text-[var(--color-success)]" />
                    <h2 className="text-xl font-bold text-[var(--color-primary-900)]">
                        {allClear ? "Verwijderd en geverifieerd" : "Verwijderd — met kanttekening"}
                    </h2>
                </div>
                <p className="text-sm text-[var(--color-neutral-700)] mb-5">
                    Dit is geen bevestiging maar een <strong>meting</strong>: na het verwijderen
                    hebben we de opslag en database opnieuw uitgelezen.
                </p>

                <ul className="space-y-2.5 mb-5">
                    {v.hadFile && (
                        <Check
                            ok={v.storageObjectsRemaining === 0}
                            label={`Modelbestand (${v.filename}) — hercontrole van de opslagmap: ${
                                v.storageObjectsRemaining === 0
                                    ? "leeg, bestand is weg"
                                    : `${v.storageObjectsRemaining} object(en) aangetroffen`
                            }`}
                        />
                    )}
                    <Check
                        ok={v.projectRowsRemaining === 0}
                        label={`Project en analyse — hercontrole van de database: ${
                            v.projectRowsRemaining === 0 ? "0 rijen over" : `${v.projectRowsRemaining} rij(en) over`
                        }`}
                    />
                    <Check
                        ok={v.messageRowsRemaining === 0}
                        label={`Chatgeschiedenis (${v.messagesDeleted} bericht${v.messagesDeleted === 1 ? "" : "en"}) — hercontrole: ${
                            v.messageRowsRemaining === 0 ? "0 berichten over" : `${v.messageRowsRemaining} over`
                        }`}
                    />
                </ul>

                <p className="text-xs text-[var(--color-neutral-500)] mb-6">
                    Geverifieerd op{" "}
                    {new Date(v.verifiedAt).toLocaleString("nl-NL", {
                        dateStyle: "short",
                        timeStyle: "medium",
                    })}
                    . Kortlopende technische backups van de databaseprovider verlopen automatisch;
                    daarna bestaat er nergens meer een kopie.
                </p>

                <button
                    onClick={onClose}
                    className="w-full rounded-md bg-[var(--color-primary-800)] hover:bg-[var(--color-primary-900)] text-white font-semibold px-4 py-2.5 text-sm transition-colors"
                >
                    Sluiten
                </button>
            </div>
        </div>
    );
}
