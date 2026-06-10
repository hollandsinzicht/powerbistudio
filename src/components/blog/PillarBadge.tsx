/**
 * Amber pill-badge die op de pillar-detailpagina boven de titel staat.
 * Gebruikt --accent (#F59E0B) voor visuele "begin-hier"-signalering.
 */
export default function PillarBadge() {
    return (
        <span className="inline-block px-3 py-1 rounded-md bg-[var(--color-accent-700)] text-white text-xs font-bold uppercase tracking-wider">
            Complete gids
        </span>
    );
}
