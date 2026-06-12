"use client";

import { useState } from "react";
import { AlertTriangle, AlertCircle, Info, ChevronDown, CheckCircle2 } from "lucide-react";
import type { Finding } from "@/lib/pbi-analysis/checks";

const SEVERITY_STYLE = {
    issue: {
        icon: AlertCircle,
        label: "Probleem",
        chip: "bg-red-50 text-[var(--color-error)] border-[var(--color-error)]/30",
    },
    warning: {
        icon: AlertTriangle,
        label: "Waarschuwing",
        chip: "bg-amber-50 text-[var(--color-warning)] border-[var(--color-warning)]/30",
    },
    info: {
        icon: Info,
        label: "Info",
        chip: "bg-[var(--color-accent-100)]/50 text-[var(--color-accent-700)] border-[var(--color-accent-700)]/30",
    },
} as const;

function FindingCard({ finding }: { finding: Finding }) {
    const [open, setOpen] = useState(finding.severity === "issue");
    const style = SEVERITY_STYLE[finding.severity];
    const Icon = style.icon;

    return (
        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 p-4 text-left"
            >
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium shrink-0 ${style.chip}`}>
                    <Icon size={12} /> {style.label}
                </span>
                <span className="text-sm font-medium text-[var(--color-neutral-900)] flex-grow">
                    {finding.title}
                </span>
                <span className="text-xs text-[var(--color-neutral-500)] shrink-0">
                    {finding.items.length}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-[var(--color-neutral-500)] shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && (
                <div className="px-4 pb-4 border-t border-[var(--color-neutral-100)] pt-3">
                    <p className="text-sm text-[var(--color-neutral-700)] mb-3">{finding.description}</p>
                    <ul className="space-y-1">
                        {finding.items.map((item, i) => (
                            <li key={i} className="text-xs font-mono text-[#1E3A5F] bg-gray-50 rounded px-2 py-1.5 break-all">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function FindingsList({ findings }: { findings: Finding[] }) {
    if (!findings.length) {
        return (
            <div className="flex items-center gap-3 rounded-lg border border-[var(--color-accent-700)]/30 bg-[var(--color-accent-100)]/40 p-4">
                <CheckCircle2 size={20} className="text-[var(--color-accent-700)] shrink-0" />
                <p className="text-sm text-[var(--color-neutral-900)]">
                    Geen bevindingen — de geautomatiseerde checks vonden niets om op aan te merken.
                </p>
            </div>
        );
    }
    return (
        <div className="space-y-3">
            {findings.map((f) => (
                <FindingCard key={f.id} finding={f} />
            ))}
        </div>
    );
}
