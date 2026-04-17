import Link from "next/link";
import { ArrowRight, MessageSquare, CheckSquare, EyeOff } from "lucide-react";
import type { Metadata } from 'next';
import { ProbleemIntro } from '@/components/ui';

export const metadata: Metadata = {
    title: 'Is jouw Power BI model klaar voor Copilot? Copilot Readiness Audit | PowerBIStudio.nl',
    description: 'Copilot is beschikbaar in alle betaalde Fabric SKUs — maar de meeste datamodellen zijn er niet op gebouwd. Wij checken je semantic model en geven je een concreet actieplan.',
    alternates: { canonical: 'https://www.powerbistudio.nl/copilot-readiness' },
};

export default function CopilotReadinessPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(83,74,183,0.06),transparent_50%)] pointer-events-none" />
                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <span className="inline-flex items-center text-[0.7rem] font-semibold px-3 py-1 rounded-full mb-4" style={{ backgroundColor: 'rgba(83, 74, 183, 0.1)', color: '#534AB7' }}>
                        AI & Copilot
                    </span>
                    <h1 className="text-3xl md:text-5xl font-display font-bold mt-2 mb-4 max-w-3xl">
                        Copilot is beschikbaar in jouw Power BI. Maar geeft het de goede antwoorden?
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
                        De kwaliteit van Copilot-antwoorden hangt volledig af van je semantic model.
                        De meeste modellen zijn daar niet op gebouwd.
                    </p>
                </div>
            </section>

            {/* ProbleemIntro */}
            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                    <ProbleemIntro>
                        <p>
                            Copilot geeft verkeerde antwoorden? De oplossing zit niet in Copilot.
                            Het zit in je datamodel. Descriptions ontbreken. Verified answers zijn
                            niet ingesteld. Kolommen zijn niet op Copilot afgestemd. Dat is geen
                            Microsoft-fout — dat is een architectuurkeuze die je opnieuw moet maken.
                        </p>
                    </ProbleemIntro>
                </div>
            </section>

            {/* Drie kwaliteitsdimensies */}
            <section className="py-20 bg-gray-50 border-y border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">Drie dimensies van Copilot-kwaliteit</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)]">
                            <MessageSquare size={24} style={{ color: '#534AB7' }} className="mb-4" />
                            <h3 className="text-lg font-display font-bold mb-3">Descriptions & context</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                Copilot leest de descriptions van je tabellen, kolommen en measures.
                                Ontbreken die, dan gokt Copilot. We checken of je model beschrijvend
                                genoeg is voor betrouwbare AI-antwoorden.
                            </p>
                        </div>
                        <div className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)]">
                            <CheckSquare size={24} style={{ color: '#534AB7' }} className="mb-4" />
                            <h3 className="text-lg font-display font-bold mb-3">Verified answers</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                Microsoft biedt de mogelijkheid om antwoorden op veelgestelde vragen
                                te verifiëren en te verankeren in je model. Bijna niemand heeft dit
                                ingericht. Wij doen dat voor je.
                            </p>
                        </div>
                        <div className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)]">
                            <EyeOff size={24} style={{ color: '#534AB7' }} className="mb-4" />
                            <h3 className="text-lg font-display font-bold mb-3">Hidden columns & grounding</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                Niet alle kolommen zijn relevant voor Copilot. Verkeerde kolommen
                                in Copilot&apos;s zichtlijn leiden tot ruis. We filteren en structureren
                                je model voor maximale Copilot-betrouwbaarheid.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dienst */}
            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">Copilot Readiness Audit</h2>
                    <p className="text-lg font-display font-bold mb-6" style={{ color: '#534AB7' }}>Op aanvraag</p>
                    <div className="space-y-3 mb-8">
                        {[
                            'Beoordeling van je semantic model op Copilot-gereedheid',
                            'Concrete lijst van aanpassingen (descriptions, verified answers, hidden columns, grounding)',
                            'Prioritering op impact',
                            'Optioneel: implementatie van de top-10 aanpassingen',
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className="shrink-0 w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-mono mt-0.5" style={{ backgroundColor: '#534AB7' }}>
                                    {i + 1}
                                </span>
                                <span className="text-[var(--text-secondary)]">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Eerste stap */}
            <section className="py-16 bg-gray-50 border-y border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl text-center">
                    <p className="text-[var(--text-secondary)] mb-4">
                        Begin met de Report Auditor voor een algemene modelbeoordeling.
                        Daarna volgt de Copilot-specifieke laag.
                    </p>
                    <Link href="/tools/report-auditor" className="btn-secondary inline-flex items-center gap-2 px-6 py-3">
                        Start met de Report Auditor <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12 text-center max-w-2xl">
                    <p className="text-xl md:text-2xl font-display font-bold mb-6">
                        Wil je weten of jouw model klaar is voor Copilot?
                    </p>
                    <Link href="/contact?type=copilot" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
                        Vraag een Copilot Readiness Audit aan <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </>
    );
}
