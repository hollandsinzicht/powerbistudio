'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  Linkedin,
  ClipboardCheck,
  Calendar as CalendarIcon,
  Server,
} from 'lucide-react';

// Vier vaste opties — vermindering van 8 oude opties
const AANVRAAG_TYPES = [
  { value: '', label: 'Selecteer een onderwerp...' },
  { value: 'quick-scan', label: 'HR Analytics Quick Scan (€1.950)' },
  { value: 'foundation', label: 'HR Analytics Foundation-traject' },
  { value: 'hosting', label: 'DashPortal HR Hosting' },
  { value: 'verkennend', label: 'Verkennend gesprek (gratis, 30 min)' },
  { value: 'anders', label: 'Iets anders' },
];

// Drie instap-blokken bovenaan
const INSTAP_OPTIES = [
  {
    icon: ClipboardCheck,
    titel: 'Quick Scan inplannen',
    prijs: '€1.950',
    voor: 'Bestaand HR-model dat audit nodig heeft',
    typeParam: 'quick-scan',
    cta: 'Plan een Quick Scan',
  },
  {
    icon: CalendarIcon,
    titel: 'Verkennend gesprek',
    prijs: 'Gratis',
    voor: 'Twijfel of HR Analytics in Power BI bij jullie past',
    typeParam: 'verkennend',
    cta: 'Plan een gesprek',
  },
  {
    icon: Server,
    titel: 'DashPortal HR demo',
    prijs: 'Op aanvraag',
    voor: 'Bestaand HR-dashboard dat hosting overweegt',
    typeParam: 'hosting',
    cta: 'Boek een demo',
  },
];

export default function ContactPage() {
  return (
    <Suspense>
      <ContactContent />
    </Suspense>
  );
}

function ContactContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    type: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      const match = AANVRAAG_TYPES.find((t) => t.value === typeParam);
      if (match) setFormData((prev) => ({ ...prev, type: match.value }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', company: '', type: '', message: '' });
      } else {
        alert(
          'Er ging iets mis. Probeer het opnieuw of mail direct naar info@powerbistudio.nl'
        );
      }
    } catch {
      alert(
        'Er ging iets mis. Probeer het opnieuw of mail direct naar info@powerbistudio.nl'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="container mx-auto max-w-4xl px-6 py-20 md:px-12 md:py-24">
          <p className="eyebrow mb-4">Contact</p>
          <h1 className="mb-4">Plan een gesprek</h1>
          <p className="lead">
            Drie manieren om te starten. Kies wat past — of vul het formulier in
            en ik bepaal samen met jou de juiste vorm.
          </p>
        </div>
      </section>

      {/* ═══ DRIE INSTAP-BLOKKEN ═══ */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-5xl px-6 md:px-12">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {INSTAP_OPTIES.map(({ icon: Icon, titel, prijs, voor, typeParam, cta }) => (
              <article
                key={typeParam}
                className="flex flex-col rounded-lg border border-[var(--border)] border-l-[3px] border-l-[var(--color-accent-700)] bg-white p-6"
              >
                <Icon
                  className="mb-4 h-7 w-7 text-[var(--color-accent-700)]"
                  aria-hidden="true"
                />
                <h2 className="mb-1 text-lg">{titel}</h2>
                <p className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
                  {prijs}
                </p>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {voor}
                </p>
                <Link
                  href={`#contact-form?type=${typeParam}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setFormData((prev) => ({ ...prev, type: typeParam }));
                    document
                      .getElementById('contact-form')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary-700)] underline underline-offset-4 transition-colors hover:text-[var(--color-primary-900)]"
                >
                  {cta}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FORMULIER + SIDEBAR ═══ */}
      <section
        id="contact-form"
        className="border-t border-[var(--border)] bg-[var(--color-neutral-50)] py-16 md:py-20 scroll-mt-24"
      >
        <div className="container mx-auto max-w-5xl px-6 md:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {/* Form — 2/3 */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-[var(--border)] bg-white p-6 md:p-8">
                <h2 className="mb-2 text-xl">Stuur een bericht</h2>
                <p className="mb-6 text-sm text-[var(--text-secondary)]">
                  Ik lees elk bericht zelf en reageer binnen één werkdag. Geen
                  automatische opvolging, geen sales-funnel.
                </p>

                {isSubmitted ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent-100)]">
                      <CheckCircle2
                        className="h-8 w-8 text-[var(--color-accent-700)]"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="mb-2 text-lg">Bericht ontvangen</h3>
                    <p className="mx-auto max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
                      Ik reageer binnen 1 werkdag. Geen automatische opvolging,
                      geen sales-funnel.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="mt-6 text-sm text-[var(--color-primary-700)] underline underline-offset-4 hover:text-[var(--color-primary-900)]"
                    >
                      Stuur nog een bericht
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="name"
                          className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                        >
                          Naam *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--color-accent-700)] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                        >
                          E-mail *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--color-accent-700)] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="company"
                        className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                      >
                        Organisatie (optioneel)
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--color-accent-700)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="type"
                        className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                      >
                        Type vraag *
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--color-accent-700)] focus:outline-none"
                      >
                        {AANVRAAG_TYPES.map((t) => (
                          <option
                            key={t.value}
                            value={t.value}
                            disabled={t.value === ''}
                          >
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                      >
                        Bericht (optioneel)
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full resize-none rounded-md border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--color-accent-700)] focus:outline-none"
                        placeholder="Beschrijf in een paar regels wat je situatie is."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--color-action-600)] px-6 py-3 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[var(--color-action-700)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        'Bezig met verzenden...'
                      ) : (
                        <>
                          Verstuur
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar — 1/3 */}
            <aside className="space-y-4">
              <div className="rounded-lg border border-[var(--border)] bg-white p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Mail
                    className="h-4 w-4 text-[var(--color-primary-700)]"
                    aria-hidden="true"
                  />
                  <h3 className="text-sm">E-mail</h3>
                </div>
                <a
                  href="mailto:info@powerbistudio.nl"
                  className="text-sm text-[var(--color-primary-700)] underline underline-offset-4 hover:text-[var(--color-primary-900)]"
                >
                  info@powerbistudio.nl
                </a>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-white p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Linkedin
                    className="h-4 w-4 text-[var(--color-primary-700)]"
                    aria-hidden="true"
                  />
                  <h3 className="text-sm">LinkedIn</h3>
                </div>
                <a
                  href="https://www.linkedin.com/in/jan-willem-den-hollander/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--color-primary-700)] underline underline-offset-4 hover:text-[var(--color-primary-900)]"
                >
                  Jan Willem den Hollander
                </a>
              </div>

              <div className="rounded-lg border border-[var(--border)] border-l-[3px] border-l-[var(--color-accent-700)] bg-white p-5">
                <h3 className="mb-2 text-sm">Beschikbaarheid</h3>
                <p className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--color-success)]" />
                  Beschikbaar voor HR-trajecten Q2-Q3 2026
                </p>
              </div>

              <p className="px-1 text-xs text-[var(--text-secondary)]">
                Geen account-manager, geen developer-vervanging halverwege. Eén
                lijn, één gezicht — Jan Willem.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
