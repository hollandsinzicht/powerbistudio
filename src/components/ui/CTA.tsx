import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

/**
 * CTA — één component voor alle call-to-actions op de site.
 *
 * Vier varianten met vaste defaults (tekst + href):
 *   • primary      → "Plan een Quick Scan"           → /contact?type=quick-scan
 *   • lead-magnet  → "Download de AVG-checklist HR"  → /avg-checklist-hr
 *   • soft         → "Plan een verkennend gesprek"   → /contact?type=verkennend
 *   • navigation   → "Lees meer →"                   → href required
 *
 * Tekst en href kunnen per gebruik overschreven worden, maar in 90% van de
 * gevallen worden de defaults gebruikt — dat is het hele punt.
 *
 * Gebruik:
 *   <CTA variant="primary" />
 *   <CTA variant="navigation" href="/cases/lyreco">Lees de Lyreco case</CTA>
 *   <CTA variant="primary" href="/contact?type=hosting">Boek een DashPortal demo</CTA>
 */

export type CTAVariant = 'primary' | 'lead-magnet' | 'soft' | 'navigation';

interface CTAProps {
  variant: CTAVariant;
  href?: string;
  children?: React.ReactNode;
  className?: string;
  size?: 'default' | 'sm';
}

const VARIANT_DEFAULTS: Record<
  CTAVariant,
  { text: string; href: string; iconAfter?: boolean }
> = {
  primary: {
    text: 'Plan een Quick Scan',
    href: '/contact?type=quick-scan',
  },
  'lead-magnet': {
    text: 'Download de AVG-checklist HR',
    href: '/avg-checklist-hr',
  },
  soft: {
    text: 'Plan een verkennend gesprek',
    href: '/contact?type=verkennend',
  },
  navigation: {
    text: 'Lees meer',
    href: '#',
    iconAfter: true,
  },
};

// Tailwind v4 + bestaande @theme inline conflict: scaled tokens als
// `bg-action-600` worden niet gegenereerd zolang er ook flat aliases
// (--color-primary, --color-accent) bestaan. Daarom gebruiken we de
// expliciete bracket-syntax met var(...) wat altijd werkt.
const VARIANT_STYLES: Record<CTAVariant, string> = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-action-600)] px-6 py-3 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[var(--color-action-700)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-700)]',
  'lead-magnet':
    'inline-flex items-center justify-center gap-2 rounded-md border border-[var(--color-primary-900)] bg-transparent px-5 py-2.5 text-[0.9375rem] font-semibold text-[var(--color-primary-900)] transition-colors hover:bg-[var(--color-primary-900)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary-900)]',
  soft:
    'inline-flex items-center justify-center gap-2 rounded-md border border-[var(--color-primary-900)] bg-transparent px-5 py-2.5 text-[0.9375rem] font-semibold text-[var(--color-primary-900)] transition-colors hover:bg-[var(--color-primary-900)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary-900)]',
  navigation:
    'inline-flex items-center gap-1 text-[0.9375rem] font-medium text-[var(--color-primary-700)] underline underline-offset-4 transition-colors hover:text-[var(--color-primary-900)]',
};

const SIZE_OVERRIDES: Record<NonNullable<CTAProps['size']>, string> = {
  default: '',
  sm: 'px-4 py-2 text-sm',
};

function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export default function CTA({
  variant,
  href,
  children,
  className,
  size = 'default',
}: CTAProps) {
  const defaults = VARIANT_DEFAULTS[variant];
  const finalHref = href ?? defaults.href;
  const finalText = children ?? defaults.text;
  const showIcon = defaults.iconAfter ?? false;

  const classes = cn(
    VARIANT_STYLES[variant],
    variant !== 'navigation' && SIZE_OVERRIDES[size],
    className
  );

  if (variant === 'navigation' && finalHref === '#') {
    // Geen interne link — render als span om "lege" links te voorkomen
    return <span className={classes}>{finalText}</span>;
  }

  return (
    <Link href={finalHref} className={classes}>
      {finalText}
      {showIcon && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
    </Link>
  );
}
