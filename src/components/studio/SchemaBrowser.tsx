"use client";

import { useState } from "react";
import { ChevronDown, Table2, EyeOff, Link2 } from "lucide-react";
import type { PbiModel, PbiTable } from "@/lib/pbi-parser/types";

function TableSection({ table }: { table: PbiTable }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 p-3.5 text-left"
            >
                <Table2 size={16} className="text-[var(--color-primary-700)] shrink-0" />
                <span className="text-sm font-medium text-[var(--color-neutral-900)] flex-grow truncate">
                    {table.name}
                </span>
                {table.isHidden && (
                    <EyeOff size={14} className="text-[var(--color-neutral-500)] shrink-0" />
                )}
                <span className="text-xs text-[var(--color-neutral-500)] shrink-0">
                    {table.columns.length} kolommen · {table.measures.length} measures
                </span>
                <ChevronDown
                    size={16}
                    className={`text-[var(--color-neutral-500)] shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && (
                <div className="px-4 pb-4 border-t border-[var(--color-neutral-100)] pt-3 space-y-4">
                    {table.columns.length > 0 && (
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-left text-[var(--color-neutral-500)]">
                                    <th className="py-1 pr-4 font-medium">Kolom</th>
                                    <th className="py-1 pr-4 font-medium">Datatype</th>
                                    <th className="py-1 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {table.columns.map((c) => (
                                    <tr key={c.name} className="border-t border-[var(--color-neutral-100)]">
                                        <td className="py-1.5 pr-4 font-mono text-[#1E3A5F]">{c.name}</td>
                                        <td className="py-1.5 pr-4 text-[var(--color-neutral-700)]">{c.dataType || "—"}</td>
                                        <td className="py-1.5 text-[var(--color-neutral-500)]">
                                            {c.isHidden ? "verborgen" : ""}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {table.measures.map((m) => (
                        <div key={m.name}>
                            <p className="text-xs font-semibold text-[var(--color-neutral-900)] mb-1">
                                [{m.name}]
                                {m.formatString && (
                                    <span className="font-normal text-[var(--color-neutral-500)]"> · {m.formatString}</span>
                                )}
                            </p>
                            <pre className="bg-gray-50 p-2.5 rounded-md font-mono text-xs border border-[var(--color-neutral-200)] overflow-x-auto text-[#1E3A5F] whitespace-pre-wrap">
                                {m.expression}
                            </pre>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SchemaBrowser({ model }: { model: PbiModel }) {
    const sorted = [...model.tables].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
    return (
        <div className="space-y-2">
            {sorted.map((t) => (
                <TableSection key={t.name} table={t} />
            ))}
            {model.relationships.length > 0 && (
                <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white p-3.5">
                    <p className="flex items-center gap-2 text-sm font-medium text-[var(--color-neutral-900)] mb-2">
                        <Link2 size={16} className="text-[var(--color-primary-700)]" /> Relaties
                    </p>
                    <ul className="space-y-1">
                        {model.relationships.map((r, i) => (
                            <li key={i} className="text-xs font-mono text-[#1E3A5F]">
                                &apos;{r.fromTable}&apos;[{r.fromColumn}]{" "}
                                {r.crossFilteringBehavior === "bothDirections" ? "↔" : "→"}{" "}
                                &apos;{r.toTable}&apos;[{r.toColumn}]
                                {!r.isActive && (
                                    <span className="text-[var(--color-warning)] font-sans"> (inactief)</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
