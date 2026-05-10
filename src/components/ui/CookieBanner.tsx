'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * CookieBanner — minimale opt-in voor GA4 conform AVG.
 *
 * Werkt samen met Google Consent Mode v2 (gconfig in layout.tsx zet
 * standaard alle consent op 'denied'). Pas wanneer de gebruiker hier op
 * "Accepteren" klikt, wordt analytics_storage op 'granted' gezet.
 *
 * Keuze wordt onthouden in localStorage zodat de banner niet elke
 * pagina-load terugkomt. Sleutel: 'pbi-cookie-consent' met waarde
 * 'granted' | 'denied'.
 *
 * Geen tracking-cookies vóór opt-in. Functionele localStorage-keuze
 * is geen tracking en valt onder essentieel.
 */

const STORAGE_KEY = 'pbi-cookie-consent';

declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: Record<string, string>
    ) => void;
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // SSR-safe: alleen op client checken
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    } else if (stored === 'granted' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  }, []);

  const setConsent = (consent: 'granted' | 'denied') => {
    window.localStorage.setItem(STORAGE_KEY, consent);
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: consent,
      });
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie-toestemming"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-lg border border-[var(--border)] bg-white p-5 shadow-xl md:right-6 md:left-auto md:bottom-6 md:max-w-md"
    >
      <h2 className="mb-2 text-sm font-display font-semibold text-[var(--color-primary-900)]">
        Korte vraag over analytics
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
        Ik gebruik Google Analytics om te zien welke pagina&apos;s mensen lezen
        en waar ze afhaken. Anoniem, geen cross-site-tracking. Mag dat?{' '}
        <Link
          href="/privacy"
          className="text-[var(--color-primary-700)] underline underline-offset-2"
        >
          Privacy
        </Link>
        .
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setConsent('granted')}
          className="inline-flex items-center justify-center rounded-md bg-[var(--color-action-600)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-action-700)]"
        >
          Accepteren
        </button>
        <button
          onClick={() => setConsent('denied')}
          className="inline-flex items-center justify-center rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--color-primary-900)] hover:text-[var(--text-primary)]"
        >
          Liever niet
        </button>
      </div>
    </div>
  );
}
