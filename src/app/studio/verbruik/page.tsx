"use client";

import { useEffect, useState } from "react";
import { Loader2, BarChart3 } from "lucide-react";
import type { UsageSummary, UsageKind } from "@/lib/studio/usage";

const KIND_LABEL: Record<UsageKind, string> = {
    analysis: "Modelanalyse",
    chat: "Chatvraag",
    deliverable: "Oplevering",
    portfolio: "Portfolio-analyse",
};

const eur = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
});
const num = new Intl.NumberFormat("nl-NL");

function fmtDate(iso: string): string {
    return new Date(iso).toLocaleString("nl-NL", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function VerbruikPage() {
    const [data, setData] = useState<UsageSummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/studio/usage");
                const json = await res.json();
                if (!res.ok) throw new Error(json.error ?? "Laden mislukte.");
                setData(json);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Laden mislukte.");
            }
        })();
    }, []);

    if (error) {
        return (
            <div className="container mx-auto px-6 max-w-4xl py-8">
                <p className="text-sm text-[var(--color-error)]">{error}</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex justify-center py-24">
                <Loader2 size={28} className="animate-spin text-[var(--color-neutral-500)]" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 max-w-4xl py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-primary-900)] flex items-center gap-2">
                    <BarChart3 size={26} className="text-[var(--color-primary-700)]" />
                    Verbruik
                </h1>
                <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                    Wat je AI-acties kosten. Bedragen zijn een raming (bovengrens — prompt caching
                    maakt de werkelijke kosten vaak lager).
                </p>
            </div>

            {/* Totalen */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <StatCard
                    label="Deze maand"
                    cost={data.month.costEur}
                    actions={data.month.actions}
                    tokens={data.month.inputTokens + data.month.outputTokens}
                />
                <StatCard
                    label="Totaal"
                    cost={data.total.costEur}
                    actions={data.total.actions}
                    tokens={data.total.inputTokens + data.total.outputTokens}
                />
            </div>

            {/* Per soort */}
            <h2 className="text-sm font-semibold text-[var(--color-neutral-700)] mb-3">Per soort actie</h2>
            <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white overflow-x-auto mb-8">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[var(--color-neutral-200)] text-left text-[var(--color-neutral-500)]">
                            <th className="px-4 py-3 font-medium">Soort</th>
                            <th className="px-4 py-3 font-medium text-right">Acties</th>
                            <th className="px-4 py-3 font-medium text-right">Tokens</th>
                            <th className="px-4 py-3 font-medium text-right">Kosten (raming)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.byKind.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-[var(--color-neutral-500)]">
                                    Nog geen verbruik.
                                </td>
                            </tr>
                        )}
                        {data.byKind.map((b) => (
                            <tr key={b.kind} className="border-b border-[var(--color-neutral-100)] last:border-0">
                                <td className="px-4 py-2.5 text-[var(--color-neutral-900)]">{KIND_LABEL[b.kind] ?? b.kind}</td>
                                <td className="px-4 py-2.5 text-right">{num.format(b.actions)}</td>
                                <td className="px-4 py-2.5 text-right">{num.format(b.inputTokens + b.outputTokens)}</td>
                                <td className="px-4 py-2.5 text-right font-medium">{eur.format(b.costEur)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Recente acties */}
            <h2 className="text-sm font-semibold text-[var(--color-neutral-700)] mb-3">Recente acties</h2>
            <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[var(--color-neutral-200)] text-left text-[var(--color-neutral-500)]">
                            <th className="px-4 py-3 font-medium">Wanneer</th>
                            <th className="px-4 py-3 font-medium">Soort</th>
                            <th className="px-4 py-3 font-medium text-right">Tokens</th>
                            <th className="px-4 py-3 font-medium text-right">Kosten</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.recent.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-[var(--color-neutral-500)]">
                                    Nog geen acties.
                                </td>
                            </tr>
                        )}
                        {data.recent.map((e, i) => (
                            <tr key={i} className="border-b border-[var(--color-neutral-100)] last:border-0">
                                <td className="px-4 py-2.5 text-[var(--color-neutral-500)]">{fmtDate(e.createdAt)}</td>
                                <td className="px-4 py-2.5 text-[var(--color-neutral-900)]">{KIND_LABEL[e.kind] ?? e.kind}</td>
                                <td className="px-4 py-2.5 text-right">{num.format(e.inputTokens + e.outputTokens)}</td>
                                <td className="px-4 py-2.5 text-right">{eur.format(e.costEur)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatCard({
    label,
    cost,
    actions,
    tokens,
}: {
    label: string;
    cost: number;
    actions: number;
    tokens: number;
}) {
    return (
        <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5">
            <p className="text-xs text-[var(--color-neutral-500)]">{label}</p>
            <p className="text-2xl font-bold text-[var(--color-primary-900)] mt-1">{eur.format(cost)}</p>
            <p className="text-xs text-[var(--color-neutral-500)] mt-1">
                {num.format(actions)} acties · {num.format(tokens)} tokens
            </p>
        </div>
    );
}
