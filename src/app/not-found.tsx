import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pagina niet gevonden | PowerBIStudio',
  description: 'Deze pagina bestaat niet (meer). Bekijk de HR Analytics-paginas.',
  robots: { index: false, follow: false },
};

const SUGGESTIES = [
  { href: '/hr-analytics', label: 'HR Analytics' },
  { href: '/methodiek', label: 'Methodiek' },
  { href: '/dashportal', label: 'DashPortal HR Hosting' },
  { href: '/cases', label: 'Cases' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function NotFound() {
  return (
    <section className="min-h-[70vh] bg-white">
      <div className="container mx-auto max-w-3xl px-6 py-24 md:px-12 md:py-32">
        <p className="eyebrow mb-4">404</p>
        <h1 className="mb-6">Deze pagina bestaat niet (meer).</h1>
        <p className="lead mb-10">
          Sinds 2026 richt Power BI Studio zich uitsluitend op HR analytics in
          Power BI. Veel oude pagina&apos;s zijn omgeleid of verwijderd. Mogelijk
          ben je op zoek naar een van deze:
        </p>

        <ul className="mb-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SUGGESTIES.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--color-neutral-50)] px-4 py-3 text-sm transition-colors hover:border-[var(--color-accent-700)]/40 hover:bg-white"
              >
                <span className="font-medium text-[var(--text-primary)]">
                  {s.label}
                </span>
                <ArrowRight
                  className="h-4 w-4 text-[var(--color-accent-700)] transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-sm text-[var(--text-secondary)]">
          Niets gevonden wat je zocht?{' '}
          <Link
            href="/contact?type=verkennend"
            className="text-[var(--color-primary-700)] underline underline-offset-4 hover:text-[var(--color-primary-900)]"
          >
            Plan een verkennend gesprek →
          </Link>
        </p>
      </div>
    </section>
  );
}
