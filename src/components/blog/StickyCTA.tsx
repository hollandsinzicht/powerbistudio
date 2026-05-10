'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';

/**
 * StickyCTA — verschijnt vanaf 25% scroll-diepte op blog-posts.
 *
 * Op desktop: rechtsonder, klein, sluitbaar.
 * Op mobile: bottom bar volle breedte (op mobile rijst hij vanzelf
 * boven het scrollgebied).
 *
 * Gesloten in localStorage onthouden zodat hij niet bij elke pagina
 * terugkomt nadat de gebruiker hem dismissed heeft (per sessie).
 *
 * Verbergt zich automatisch wanneer de cookie-banner zichtbaar is
 * (eerste-bezoek-flow) — die heeft prioriteit.
 */

const DISMISS_KEY = 'pbi-sticky-cta-dismissed';
const COOKIE_KEY = 'pbi-cookie-consent';

export default function StickyCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Sessie-opslag: dismissed-flag uitlezen
    const wasDismissed = window.sessionStorage.getItem(DISMISS_KEY) === 'true';
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Niet tonen als cookie-banner nog actief is
    const hasCookieChoice = window.localStorage.getItem(COOKIE_KEY);

    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = window.scrollY;
      const total = (doc.scrollHeight || 0) - (window.innerHeight || 0);
      if (total <= 0) return;
      const ratio = scrolled / total;
      if (ratio > 0.25 && hasCookieChoice) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial check
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (dismissed || !visible) return null;

  const handleDismiss = () => {
    window.sessionStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div
      role="complementary"
      aria-label="Quick Scan call-to-action"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center gap-3 rounded-lg border border-[var(--border)] bg-white p-3 pl-4 shadow-lg md:right-6 md:left-auto md:bottom-6 md:max-w-sm"
    >
      <Link
        href="/contact?type=quick-scan"
        className="flex flex-1 items-center justify-between gap-2 text-sm font-semibold text-[var(--color-primary-900)] hover:text-[var(--color-primary-700)]"
      >
        <span>Plan een Quick Scan – €1.950</span>
        <ArrowRight
          className="h-4 w-4 text-[var(--color-action-600)]"
          aria-hidden="true"
        />
      </Link>
      <button
        onClick={handleDismiss}
        className="rounded-md p-1 text-[var(--text-secondary)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--text-primary)]"
        aria-label="Sluiten"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
