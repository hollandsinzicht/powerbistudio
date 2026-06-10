import { List } from 'lucide-react';
import type { TocEntry } from '@/lib/pillar-toc';

/**
 * Inline table of contents bovenaan de pillar-content. Toont alleen H2-entries
 * (H3 wordt overgeslagen om de TOC scanbaar te houden).
 *
 * scroll-margin op de heading-anchors staat in globals.css zodat de jump
 * onder een eventuele sticky header landt.
 */
export default function PillarTOC({ entries }: { entries: TocEntry[] }) {
    const h2Entries = entries.filter((e) => e.level === 2);
    if (h2Entries.length === 0) return null;

    return (
        <nav
            aria-label="Inhoudsopgave"
            className="bg-white shadow-sm rounded-2xl border border-[var(--color-neutral-200)] p-6 mb-10 not-prose"
        >
            <div className="flex items-center gap-2 mb-4">
                <List size={18} className="text-[var(--color-accent-700)]" />
                <h2 className="text-base font-display font-semibold text-[var(--color-neutral-900)] m-0">
                    In deze gids
                </h2>
            </div>
            <ol className="space-y-2 list-decimal pl-6 marker:text-[var(--color-neutral-700)] marker:font-semibold">
                {h2Entries.map((entry) => (
                    <li key={entry.id} className="text-[var(--color-neutral-700)]">
                        <a
                            href={`#${entry.id}`}
                            className="text-[var(--color-neutral-700)] hover:text-[var(--color-primary-900)] transition-colors no-underline"
                        >
                            {entry.text}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
