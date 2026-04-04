import type { PriceTier } from '@/lib/types/sectors';

const TIER_STYLES: Record<PriceTier, { bg: string; text: string; defaultLabel: string }> = {
  gratis: {
    bg: 'rgba(16, 185, 129, 0.1)',
    text: '#059669',
    defaultLabel: 'Gratis',
  },
  betaald: {
    bg: 'rgba(245, 158, 11, 0.1)',
    text: '#D97706',
    defaultLabel: 'Betaald',
  },
  'op-aanvraag': {
    bg: 'rgba(30, 58, 95, 0.1)',
    text: '#1E3A5F',
    defaultLabel: 'Op aanvraag',
  },
};

interface PriorityBadgeProps {
  tier: PriceTier;
  label?: string;
}

export default function PriorityBadge({ tier, label }: PriorityBadgeProps) {
  const style = TIER_STYLES[tier];

  return (
    <span
      className="inline-flex items-center text-[0.7rem] font-semibold px-3 py-1 rounded-full"
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {label || style.defaultLabel}
    </span>
  );
}
