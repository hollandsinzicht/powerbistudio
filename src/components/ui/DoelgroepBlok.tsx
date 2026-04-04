import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Sector } from '@/lib/types/sectors';
import { SECTOR_COLORS } from '@/lib/types/sectors';

interface DoelgroepBlokProps {
  sector: Sector;
  label: string;
  title: string;
  description: string;
  linkText: string;
  href: string;
}

export default function DoelgroepBlok({ sector, label, title, description, linkText, href }: DoelgroepBlokProps) {
  return (
    <Link
      href={href}
      className="glass-card p-6 md:p-8 rounded-xl group hover:shadow-lg transition-all flex flex-col"
      style={{ borderLeft: `4px solid ${SECTOR_COLORS[sector]}` }}
    >
      <span
        className="text-[0.7rem] font-semibold tracking-widest uppercase mb-3"
        style={{ color: SECTOR_COLORS[sector] }}
      >
        {label}
      </span>
      <h3 className="text-lg md:text-xl font-display font-bold mb-3 text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="text-[var(--text-secondary)] text-sm leading-relaxed flex-grow">
        {description}
      </p>
      <span
        className="inline-flex items-center gap-2 text-sm font-medium mt-4 group-hover:gap-3 transition-all"
        style={{ color: SECTOR_COLORS[sector] }}
      >
        {linkText} <ArrowRight size={16} />
      </span>
    </Link>
  );
}
