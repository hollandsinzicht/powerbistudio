"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Crumb {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
}

// Kruimelpad voor de studio: toont precies waar je bent en laat je terug
// navigeren. Laatste item = huidige locatie (niet klikbaar).
export default function Breadcrumb({ items }: { items: Crumb[] }) {
    return (
        <nav aria-label="Kruimelpad" className="flex items-center gap-0.5 text-sm min-w-0">
            {items.map((item, i) => {
                const last = i === items.length - 1;
                const Icon = item.icon;
                const inner = (
                    <>
                        {Icon && <Icon size={15} className="shrink-0" />}
                        <span className="truncate max-w-[14rem]">{item.label}</span>
                    </>
                );

                let node: React.ReactNode;
                if (last) {
                    node = (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 font-semibold text-[var(--color-primary-900)] min-w-0">
                            {inner}
                        </span>
                    );
                } else if (item.href) {
                    node = (
                        <Link
                            href={item.href}
                            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-900)] transition-colors min-w-0"
                        >
                            {inner}
                        </Link>
                    );
                } else if (item.onClick) {
                    node = (
                        <button
                            onClick={item.onClick}
                            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-900)] transition-colors min-w-0"
                        >
                            {inner}
                        </button>
                    );
                } else {
                    node = (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[var(--color-neutral-500)] min-w-0">
                            {inner}
                        </span>
                    );
                }

                return (
                    <span key={i} className="inline-flex items-center gap-0.5 min-w-0">
                        {node}
                        {!last && <ChevronRight size={14} className="text-[var(--color-neutral-300)] shrink-0" />}
                    </span>
                );
            })}
        </nav>
    );
}
