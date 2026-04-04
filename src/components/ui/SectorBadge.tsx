import type { Sector } from '@/lib/types/sectors';
import { SECTOR_HEX, SECTOR_LABELS } from '@/lib/types/sectors';

interface SectorBadgeProps {
  sector: Sector;
  label?: string;
}

export default function SectorBadge({ sector, label }: SectorBadgeProps) {
  const hex = SECTOR_HEX[sector];

  return (
    <span
      className="inline-flex items-center text-[0.7rem] font-semibold px-3 py-1 rounded-full"
      style={{
        backgroundColor: `${hex}14`,
        color: hex,
      }}
    >
      {label || SECTOR_LABELS[sector]}
    </span>
  );
}
