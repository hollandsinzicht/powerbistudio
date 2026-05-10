"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Download } from "lucide-react";

type LeadVertical = 'beslissers' | 'publieke-sector' | 'isv' | 'vakgenoot';
type FieldName = 'name' | 'email' | 'company';

interface LeadCaptureFormProps {
  vertical: LeadVertical;
  source: string;
  title: string;
  description?: string;
  buttonText?: string;
  fields?: FieldName[];
  compact?: boolean;
  downloadUrl?: string;
  metadata?: Record<string, unknown>;
}

export default function LeadCaptureForm({
  vertical,
  source,
  title,
  description,
  buttonText = "Download gratis",
  fields = ['name', 'email'],
  compact = false,
  downloadUrl,
  metadata,
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({ name: '', email: '', company: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name || undefined,
          company: formData.company || undefined,
          vertical,
          source,
          downloadUrl,
          metadata,
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        setError('Er ging iets mis. Probeer het opnieuw.');
      }
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputClass = "w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors text-sm";

  if (isSubmitted) {
    return (
      <div className={`${compact ? 'p-6' : 'p-8'} text-center`}>
        <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
        <p className="font-display font-bold text-lg mb-1">Verstuurd!</p>
        <p className="text-[var(--text-secondary)] text-sm">
          {downloadUrl
            ? 'Check je inbox voor de downloadlink.'
            : 'Bedankt voor je aanvraag. Je hoort van ons.'}
        </p>
        {downloadUrl && (
          <a
            href={downloadUrl}
            className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-[var(--primary)] hover:gap-3 transition-all"
          >
            <Download size={16} /> Direct downloaden
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={compact ? '' : 'glass-card rounded-xl p-6 md:p-8 border border-[var(--border)]'}>
      {!compact && (
        <>
          <h3 className="text-lg font-display font-bold mb-2">{title}</h3>
          {description && (
            <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">{description}</p>
          )}
        </>
      )}

      <form onSubmit={handleSubmit} className={`${compact ? 'flex flex-col sm:flex-row gap-3' : 'space-y-4'}`}>
        {fields.includes('name') && (
          <input
            type="text"
            name="name"
            placeholder="Naam"
            value={formData.name}
            onChange={handleChange}
            className={`${inputClass} ${compact ? 'sm:flex-1' : ''}`}
          />
        )}
        {fields.includes('email') && (
          <input
            type="email"
            name="email"
            placeholder="E-mailadres *"
            value={formData.email}
            onChange={handleChange}
            required
            className={`${inputClass} ${compact ? 'sm:flex-1' : ''}`}
          />
        )}
        {fields.includes('company') && !compact && (
          <input
            type="text"
            name="company"
            placeholder="Organisatie (optioneel)"
            value={formData.company}
            onChange={handleChange}
            className={inputClass}
          />
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn-primary inline-flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-70 ${
            compact ? 'px-6 py-3 whitespace-nowrap' : 'w-full py-3'
          }`}
        >
          {isSubmitting ? 'Bezig...' : (
            <>{buttonText} <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <p className="text-[10px] text-[var(--text-secondary)] mt-3 opacity-60">
        Ik respecteer je privacy. Je kunt je op elk moment uitschrijven.
      </p>
    </div>
  );
}
