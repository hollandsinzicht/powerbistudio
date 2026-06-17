'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, RotateCcw, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import LeadCaptureForm from '@/components/lead/LeadCaptureForm';

type AanbevelingType = 'quick-scan' | 'verkennend';

interface Turn {
    vraag: string;
    antwoord: string;
}

interface NextQuestion {
    done: false;
    vraag: string;
    opties: string[];
    toelichting?: string;
}

interface Verdict {
    done: true;
    niveau: string;
    samenvatting: string;
    bevindingen: string[];
    aanbeveling: { tekst: string; type: AanbevelingType };
}

type Step = NextQuestion | Verdict;

const CTA_BY_TYPE: Record<AanbevelingType, { href: string; label: string }> = {
    'quick-scan': { href: '/contact?type=quick-scan', label: 'Plan een Quick Scan – €1.950' },
    verkennend: { href: '/contact?type=verkennend', label: 'Plan een verkennend gesprek' },
};

export default function ReadinessScanPage() {
    const [phase, setPhase] = useState<'intro' | 'vraag' | 'klaar'>('intro');
    const [history, setHistory] = useState<Turn[]>([]);
    const [current, setCurrent] = useState<NextQuestion | null>(null);
    const [verdict, setVerdict] = useState<Verdict | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [custom, setCustom] = useState('');

    const fetchStep = async (nextHistory: Turn[]) => {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch('/api/readiness-scan/adaptive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: nextHistory }),
            });
            const data: Step = await res.json();
            if (!res.ok) throw new Error((data as unknown as { error?: string }).error ?? 'De scan is tijdelijk niet beschikbaar.');

            if (data.done) {
                setVerdict(data);
                setPhase('klaar');
            } else {
                setCurrent(data);
                setPhase('vraag');
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Er ging iets mis.');
        } finally {
            setBusy(false);
        }
    };

    const start = () => {
        setHistory([]);
        setVerdict(null);
        fetchStep([]);
    };

    const answer = (value: string) => {
        if (!current || !value.trim()) return;
        const next = [...history, { vraag: current.vraag, antwoord: value.trim() }];
        setHistory(next);
        setCustom('');
        fetchStep(next);
    };

    const reset = () => {
        setHistory([]);
        setCurrent(null);
        setVerdict(null);
        setError(null);
        setPhase('intro');
    };

    const vraagNummer = history.length + 1;

    return (
        <>
            <section className="border-b border-[var(--color-neutral-200)] bg-white">
                <div className="container mx-auto max-w-3xl px-6 py-16 md:px-12 md:py-20">
                    <p className="eyebrow mb-4">HR Analytics Readiness Scan</p>
                    <h1 className="mb-4">Hoe volwassen is jullie HR-rapportage in Power BI?</h1>
                    <p className="lead">
                        Een kort, meedenkend gesprek over RLS, historiek, AVG, datakwaliteit en
                        monitoring. De vragen passen zich aan op je antwoorden. Aan het eind krijg je
                        een eerlijke beoordeling en een concrete vervolgstap.
                    </p>
                </div>
            </section>

            <section className="py-12 md:py-16">
                <div className="container mx-auto max-w-2xl px-6 md:px-12">
                    {error && (
                        <div className="mb-6 rounded-md border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 p-4 text-sm text-[var(--color-error)]">
                            {error}
                        </div>
                    )}

                    {/* Intro */}
                    {phase === 'intro' && (
                        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white p-6 md:p-8">
                            <p className="mb-6 text-[var(--color-neutral-700)]">
                                Reken op 4 tot 7 korte vragen. Je hoeft niets te installeren of te
                                uploaden — beantwoord wat je weet, sla over wat je niet weet.
                            </p>
                            <button
                                onClick={start}
                                disabled={busy}
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-action-600)] px-6 py-3 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[var(--color-action-700)] disabled:opacity-60"
                            >
                                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                Start de scan
                            </button>
                        </div>
                    )}

                    {/* Vraag */}
                    {phase === 'vraag' && current && (
                        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white p-6 md:p-8">
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-sm font-semibold text-[var(--color-neutral-700)]">
                                    Vraag {vraagNummer}
                                </p>
                                {busy && <Loader2 className="h-4 w-4 animate-spin text-[var(--color-neutral-500)]" />}
                            </div>

                            <h2 className="mb-2 text-xl">{current.vraag}</h2>
                            {current.toelichting && (
                                <p className="mb-6 text-sm text-[var(--color-neutral-500)]">{current.toelichting}</p>
                            )}

                            <div className="space-y-3">
                                {current.opties.map((optie) => (
                                    <button
                                        key={optie}
                                        onClick={() => answer(optie)}
                                        disabled={busy}
                                        className="flex w-full items-start gap-3 rounded-md border border-[var(--color-neutral-200)] p-3 text-left text-sm transition-colors hover:border-[var(--color-accent-700)]/40 hover:bg-[var(--color-neutral-50)] disabled:opacity-50"
                                    >
                                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent-700)]" aria-hidden="true" />
                                        <span>{optie}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                <input
                                    type="text"
                                    value={custom}
                                    onChange={(e) => setCustom(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && answer(custom)}
                                    placeholder="Anders, namelijk… (optioneel)"
                                    disabled={busy}
                                    className="flex-1 rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:border-[var(--color-primary-700)] focus:outline-none"
                                />
                                <button
                                    onClick={() => answer(custom)}
                                    disabled={busy || !custom.trim()}
                                    className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--color-neutral-200)] px-4 py-2 text-sm font-medium text-[var(--color-neutral-700)] transition-colors hover:border-[var(--color-primary-700)] disabled:opacity-40"
                                >
                                    Verstuur
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Uitslag */}
                    {phase === 'klaar' && verdict && (
                        <div className="space-y-6">
                            <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white p-6 md:p-8">
                                <div className="mb-6 flex items-center gap-3">
                                    <ShieldCheck className="h-8 w-8 text-[var(--color-accent-700)]" aria-hidden="true" />
                                    <div>
                                        <p className="eyebrow text-[var(--color-accent-700)]">
                                            Niveau: {verdict.niveau}
                                        </p>
                                        <p className="text-2xl font-display font-semibold">Jouw uitslag</p>
                                    </div>
                                </div>

                                <p className="mb-6 leading-relaxed">{verdict.samenvatting}</p>

                                {verdict.bevindingen.length > 0 && (
                                    <>
                                        <h3 className="mb-3 text-base">Wat opvalt</h3>
                                        <ul className="mb-8 space-y-2">
                                            {verdict.bevindingen.map((b) => (
                                                <li key={b} className="flex items-start gap-2.5 text-sm">
                                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent-700)]" aria-hidden="true" />
                                                    <span>{b}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                <div className="rounded-md bg-[var(--color-neutral-50)] p-4">
                                    <p className="mb-3 text-sm font-medium text-[var(--color-neutral-900)]">
                                        Aanbevolen vervolgstap
                                    </p>
                                    <p className="mb-4 text-sm text-[var(--color-neutral-700)]">{verdict.aanbeveling.tekst}</p>
                                    <div className="flex flex-wrap gap-3">
                                        <Link
                                            href={CTA_BY_TYPE[verdict.aanbeveling.type].href}
                                            className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-action-600)] px-6 py-3 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[var(--color-action-700)]"
                                        >
                                            {CTA_BY_TYPE[verdict.aanbeveling.type].label}
                                        </Link>
                                        <button
                                            onClick={reset}
                                            className="inline-flex items-center gap-2 rounded-md border border-[var(--color-neutral-200)] px-5 py-2.5 text-[0.9375rem] font-medium text-[var(--color-neutral-700)] transition-colors hover:border-[var(--color-primary-700)] hover:text-[var(--color-primary-900)]"
                                        >
                                            <RotateCcw className="h-4 w-4" /> Opnieuw
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Lead-capture: mail de uitslag + vervolgstap */}
                            <LeadCaptureForm
                                vertical="hr"
                                source="readiness-scan"
                                title="Wil je de uitslag en je vervolgstap per mail?"
                                description="Ik stuur je deze beoordeling toe, plus een paar concrete punten die bij jouw situatie passen. Geen verkooppraatje — je kunt je altijd uitschrijven."
                                buttonText="Mail mij de uitslag"
                                fields={['name', 'email']}
                                metadata={{
                                    niveau: verdict.niveau,
                                    aanbeveling: verdict.aanbeveling.type,
                                    samenvatting: verdict.samenvatting,
                                }}
                            />
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
