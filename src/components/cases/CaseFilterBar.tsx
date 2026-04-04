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
                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
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
            className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)] hover:border-[var(--accent)] transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="md:w-1/4">
                <SectorBadge sector={c.sector} label={c.sectorLabel} />
                <h3 className="text-xl font-display font-bold mt-3 text-[var(--text-primary)]">
                  {c.client}
                </h3>
              </div>
              <div className="md:w-3/4">
                <p className="text-[var(--text-secondary)] mb-3">
                  <span className="font-medium text-[var(--text-primary)]">Uitdaging:</span>{" "}
                  {c.challenge.split(". ")[0]}.
                </p>
                <p className="font-semibold text-[var(--text-primary)] mb-4">
                  {c.resultHighlight}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={`/cases/${c.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:gap-3 transition-all"
                  >
                    Lees de volledige case <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/contact"
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
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
