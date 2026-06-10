import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const linkClass = 'text-[var(--color-neutral-700)] hover:text-[var(--color-primary-900)] transition-colors';

  return (
    <footer className="border-t border-[var(--color-neutral-200)] bg-[var(--color-white)] pb-8 pt-16">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Kolom 1: HR Analytics */}
          <div>
            <h4 className="mb-4 font-display font-medium text-[var(--color-neutral-900)]">HR Analytics</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link href="/hr-analytics" className={linkClass}>Hoe ik werk</Link></li>
              <li><Link href="/methodiek" className={linkClass}>Methodiek</Link></li>
              <li><Link href="/dashportal" className={linkClass}>DashPortal HR Hosting</Link></li>
              <li><Link href="/cases" className={linkClass}>Cases</Link></li>
            </ul>
          </div>

          {/* Kolom 2: Tools & Resources */}
          <div>
            <h4 className="mb-4 font-display font-medium text-[var(--color-neutral-900)]">Tools &amp; Resources</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link href="/tools/readiness-scan" className={linkClass}>HR Readiness Scan</Link></li>
              <li><Link href="/tools/bi-kosten-calculator" className={linkClass}>HR Kosten Calculator</Link></li>
              <li><Link href="/avg-checklist-hr" className={linkClass}>AVG-checklist HR</Link></li>
              <li><Link href="/tools/dax-assistant" className={linkClass}>DAX Assistant</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Over */}
          <div>
            <h4 className="mb-4 font-display font-medium text-[var(--color-neutral-900)]">Over</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link href="/over" className={linkClass}>Jan Willem den Hollander</Link></li>
              <li><Link href="/blog" className={linkClass}>Blog</Link></li>
              <li><Link href="/contact" className={linkClass}>Contact</Link></li>
              <li><Link href="/privacy" className={linkClass}>Privacy</Link></li>
            </ul>
          </div>

          {/* Kolom 4: Contact */}
          <div>
            <h4 className="mb-4 font-display font-medium text-[var(--color-neutral-900)]">Contact</h4>
            <ul className="flex flex-col gap-3 text-sm text-[var(--color-neutral-700)]">
              <li>
                <a
                  href="mailto:info@powerbistudio.nl"
                  className="transition-colors hover:text-[var(--color-neutral-900)]"
                >
                  info@powerbistudio.nl
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/jan-willem-den-hollander/"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-[var(--color-neutral-900)]"
                >
                  LinkedIn
                </a>
              </li>
              <li className="flex items-start gap-2 pt-2">
                <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--color-success)]" />
                <span className="text-xs leading-relaxed">
                  Beschikbaar voor HR-trajecten Q2-Q3 2026
                </span>
              </li>
              <li className="mt-1 text-xs opacity-70">
                KVK: 62432168 — Think Different Media
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/jan-willem-den-hollander/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-2 text-[var(--color-neutral-700)] transition-colors hover:border-[var(--color-primary-900)] hover:text-[var(--color-neutral-900)]"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="mailto:info@powerbistudio.nl"
                className="rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-2 text-[var(--color-neutral-700)] transition-colors hover:border-[var(--color-primary-900)] hover:text-[var(--color-neutral-900)]"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--color-neutral-200)] pt-8 md:flex-row">
          <Link href="/" className="group flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Power BI Studio"
              width={140}
              height={35}
              className="h-6 w-auto opacity-70 transition-opacity group-hover:opacity-100"
            />
          </Link>
          <p className="text-sm text-[var(--color-neutral-700)]">
            &copy; {currentYear} Power BI Studio · HR analytics-specialist · Jan Willem den Hollander
          </p>
        </div>
      </div>
    </footer>
  );
}
