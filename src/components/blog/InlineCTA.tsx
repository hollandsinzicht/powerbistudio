import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * InlineCTA — kleine conversie-prompt onderaan elke blog-post,
 * net boven de uitgebreidere BlogCTA. Smal, scanbaar, één duidelijke
 * actie naar de Quick Scan.
 *
 * Past in de leesflow zonder de aandacht volledig te kapen.
 */
export default function InlineCTA() {
  return (
    <aside
      className="my-12 rounded-lg border border-[var(--border)] border-l-[3px] border-l-[var(--color-accent-700)] bg-[var(--color-accent-100)]/40 p-5 md:p-6"
      aria-label="Call-to-action"
    >
      <p className="mb-3 text-sm font-display font-semibold text-[var(--color-primary-900)] md:text-base">
        Wil je dit zelf laten checken?
      </p>
      <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
        Een HR Analytics Quick Scan kost €1.950 vast en duurt 1,5 dag.
        Je krijgt een audit-rapport van 8-12 paginas met concrete
        actiepunten voor jouw HR-rapportage in Power BI.
      </p>
      <Link
        href="/contact?type=quick-scan"
        className="inline-flex items-center gap-2 rounded-md bg-[var(--color-action-600)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-action-700)]"
      >
        Plan een Quick Scan
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </aside>
  );
}
