'use client';

import { useEffect, useId } from 'react';

/**
 * Dependency-vrije Cal.com inline-embed.
 *
 * Vereist één env-var: NEXT_PUBLIC_CAL_LINK = je Cal.com base (bv. "powerbistudio").
 * Per afspraaktype maak je in Cal.com een event-type aan; de `event`-prop is de slug
 * daarvan (bv. "quick-scan"). De uiteindelijke calLink wordt: `{base}/{event}`.
 *
 * Als NEXT_PUBLIC_CAL_LINK niet is gezet, rendert dit component niets en blijft het
 * contactformulier de enige (fallback) route. Zo breekt er nooit iets in de build.
 */

type CalWindow = Window & {
  Cal?: ((...args: unknown[]) => void) & { loaded?: boolean; ns?: Record<string, unknown> };
};

const CAL_BASE = process.env.NEXT_PUBLIC_CAL_LINK?.trim() || '';

export function calConfigured(): boolean {
  return CAL_BASE.length > 0;
}

/** Volledige cal.com boekings-URL voor gebruik in bv. LinkedIn-DM's of knoppen. */
export function calBookingUrl(event: string): string {
  if (!CAL_BASE) return '';
  return `https://cal.com/${CAL_BASE}/${event}`;
}

function loadCalScript() {
  const w = window as CalWindow;
  if (w.Cal?.loaded) return;

  // Officiële Cal.com embed-loader (vanilla, geen npm-package nodig).
  (function (C: CalWindow, A: string) {
    const p = (a: { q: unknown[] }, ar: unknown) => {
      a.q.push(ar);
    };
    const d = C.document;
    C.Cal =
      C.Cal ||
      function (...args: unknown[]) {
        const cal = C.Cal as CalWindow['Cal'] & { q?: unknown[] };
        if (!cal!.loaded) {
          cal!.ns = {};
          cal!.q = cal!.q || [];
          d.head.appendChild(d.createElement('script')).src = A;
          cal!.loaded = true;
        }
        p(cal as unknown as { q: unknown[] }, args);
      };
  })(w, 'https://app.cal.com/embed/embed.js');

  w.Cal!('init', { origin: 'https://cal.com' });
}

interface CalEmbedProps {
  /** Event-type slug in Cal.com, bv. "quick-scan". */
  event: string;
  className?: string;
}

export default function CalEmbed({ event, className }: CalEmbedProps) {
  const reactId = useId();
  const elementId = `cal-inline-${reactId.replace(/[:]/g, '')}`;

  useEffect(() => {
    if (!CAL_BASE) return;
    loadCalScript();
    const w = window as CalWindow;
    // Maak de container leeg vóór (her)initialisatie. Cal.com rendert niet opnieuw
    // in een element dat al een embed bevat; zonder dit blijft bij een event-wissel
    // de eerste agenda staan.
    const el = w.document.getElementById(elementId);
    if (el) el.innerHTML = '';
    w.Cal!('inline', {
      elementOrSelector: `#${elementId}`,
      calLink: `${CAL_BASE}/${event}`,
      layout: 'month_view',
    });
  }, [elementId, event]);

  if (!CAL_BASE) return null;

  return (
    <div
      id={elementId}
      className={className}
      style={{ width: '100%', minHeight: 600, overflow: 'auto' }}
    />
  );
}
