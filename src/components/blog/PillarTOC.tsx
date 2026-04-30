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
            className="glass-card rounded-2xl border border-[var(--border)] p-6 mb-10 not-prose"
        >
            <div className="flex items-center gap-2 mb-4">
                <List size={18} className="text-[var(--accent)]" />
                <h2 className="text-base font-display font-bold text-[var(--text-primary)] m-0">
                    In deze gids
                </h2>
            </div>
            <ol className="space-y-2 list-decimal pl-6 marker:text-[var(--text-secondary)] marker:font-semibold">
                {h2Entries.map((entry) => (
                    <li key={entry.id} className="text-[var(--text-secondary)]">
                        <a
                            href={`#${entry.id}`}
                            className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors no-underline"
                        >
                            {entry.text}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
