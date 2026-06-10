"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectorBadge } from "@/components/ui";
import type { CaseStudy } from "@/lib/types/sectors";

const FILTERS = [
  { key: "alle", label: "Alle" },
  { key: "zorg", label: "Zorg & overheid" },
  { key: "data", label: "Data & migratie" },
] as const;

interface CaseFilterBarProps {
  cases: CaseStudy[];
}

export default function CaseFilterBar({ cases }: CaseFilterBarProps) {
  const [activeFilter, setActiveFilter] = useState<string>("alle");

  const filtered = activeFilter === "alle"
    ? cases
    : cases.filter((c) => c.sector === activeFilter);

  return (
    <>
      {/* Filter knoppen */}
      <div className="flex flex-wrap gap-2 mb-10">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              activeFilter === f.key
                ? "bg-[var(--color-primary-900)] text-white border-[var(--color-primary-900)]"
                : "bg-[var(--color-white)] text-[var(--color-neutral-700)] border-[var(--color-neutral-200)] hover:border-[var(--color-primary-900)] hover:text-[var(--color-primary-900)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Case kaarten */}
      <div className="grid gap-6">
        {filtered.map((c) => (
          <div
            key={c.slug}
            className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-[var(--color-neutral-200)] hover:border-[var(--color-primary-700)] transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="md:w-1/4">
                <SectorBadge sector={c.sector} label={c.sectorLabel} />
                <h3 className="text-xl font-display font-semibold mt-3 text-[var(--color-neutral-900)]">
                  {c.client}
                </h3>
              </div>
              <div className="md:w-3/4">
                <p className="text-[var(--color-neutral-700)] mb-3">
                  <span className="font-medium text-[var(--color-neutral-900)]">Uitdaging:</span>{" "}
                  {c.challenge.split(". ")[0]}.
                </p>
                <p className="font-semibold text-[var(--color-neutral-900)] mb-4">
                  {c.resultHighlight}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={`/cases/${c.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary-900)] hover:gap-3 transition-all"
                  >
                    Lees de volledige case <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/contact"
                    className="text-sm text-[var(--color-neutral-700)] hover:text-[var(--color-primary-900)] transition-colors"
                  >
                    Vergelijkbaar vraagstuk? →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
