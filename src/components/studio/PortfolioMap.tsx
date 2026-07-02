"use client";

import { Check } from "lucide-react";
import type { PortfolioEntity } from "@/lib/pbi-analysis/cross-model";

// Entiteit×model-matrix: welke dimensie/feit komt in welk model voor. Rijen
// gesorteerd op spreiding (meest gedeeld bovenaan) — precies de entiteiten die
// kandidaat zijn voor een gedeeld dataset.
export default function PortfolioMap({
    entities,
    modelNames,
}: {
    entities: PortfolioEntity[];
    modelNames: string[];
}) {
    if (!entities.length) {
        return (
            <p className="text-sm text-[var(--color-neutral-500)] rounded-lg border border-[var(--color-neutral-200)] bg-white p-4">
                Geen entiteiten gevonden. Draai eerst de analyse.
            </p>
        );
    }

    return (
        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white overflow-x-auto">
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="border-b border-[var(--color-neutral-200)]">
                        <th className="text-left font-semibold text-[var(--color-neutral-700)] px-4 py-3 sticky left-0 bg-white">
                            Entiteit
                        </th>
                        {modelNames.map((m) => (
                            <th
                                key={m}
                                className="font-medium text-[var(--color-neutral-500)] px-3 py-3 text-center align-bottom"
                            >
                                <span className="inline-block max-w-[8rem] truncate" title={m}>
                                    {m}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {entities.map((e) => {
                        const shared = e.modelCount >= 2;
                        const drift = e.names.length >= 2;
                        return (
                            <tr
                                key={e.key}
                                className={`border-b border-[var(--color-neutral-100)] last:border-0 ${
                                    shared ? "bg-[var(--color-accent-100)]/20" : ""
                                }`}
                            >
                                <td className="px-4 py-2.5 sticky left-0 bg-inherit">
                                    <span className="font-medium text-[var(--color-neutral-900)]">
                                        {e.names[0]}
                                    </span>
                                    {drift && (
                                        <span
                                            className="ml-2 text-xs text-[var(--color-warning)]"
                                            title={e.names.join(" / ")}
                                        >
                                            +{e.names.length - 1} andere naam
                                            {e.names.length - 1 > 1 ? "en" : ""}
                                        </span>
                                    )}
                                </td>
                                {modelNames.map((m) => (
                                    <td key={m} className="px-3 py-2.5 text-center">
                                        {e.models.includes(m) ? (
                                            <Check
                                                size={15}
                                                className="inline text-[var(--color-accent-700)]"
                                            />
                                        ) : (
                                            <span className="text-[var(--color-neutral-200)]">·</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
