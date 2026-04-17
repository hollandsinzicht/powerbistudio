import Link from "next/link";
import { ArrowRight, BrainCircuit, Activity, ExternalLink, Globe, ShieldCheck, Calculator } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tools voor Power BI — gratis en betaald | PowerBIStudio.nl',
    description: 'Readiness Scan, DAX Assistant, Report Auditor, BI-Kosten Calculator. Van diagnose tot AI-audit.',
    alternates: { canonical: 'https://www.powerbistudio.nl/tools' },
};

export default function ToolsPage() {
    return (
        <>
            <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                            Tools voor <span className="text-[var(--accent)]">betere inzichten</span>
                        </h1>
                        <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                            Wij hebben deze tools ontwikkeld om je direct op weg te helpen.
                            Ontdek de volwassenheid van jouw data-organisatie, of laat AI je helpen met complexe DAX formules.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

                        {/* Tool 1: Readiness Scan */}
                        <div className="group border border-[var(--border)] bg-gray-50 p-10 rounded-2xl hover:border-[var(--accent)] hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] transition-all flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Activity size={180} />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="bg-[var(--surface)] text-[var(--text-secondary)] text-sm font-mono px-4 py-1.5 border border-[var(--border)] rounded flex items-center gap-2">
                                        Gratis tool
                                    </span>
                                </div>

                                <h2 className="text-3xl font-display font-bold mb-4 group-hover:text-[var(--accent)] transition-colors">
                                    Power BI Readiness Scan
                                </h2>

                                <p className="text-[var(--text-secondary)] text-lg mb-10 flex-grow leading-relaxed max-w-lg">
                                    Weet jij waar jouw organisatie staat op het gebied van data en Power BI?
                                    Beantwoord 10 vragen en ontvang een persoonlijk rapport met jouw BI-volwassenheidsniveau en concrete volgende stappen.
                                </p>

                                <div className="mt-auto">
                                    <Link href="/tools/readiness-scan" className="btn-primary inline-flex items-center gap-2 text-lg px-6 py-3">
                                        Start de scan <ArrowRight size={20} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Tool 2: DAX Assistant */}
                        <div className="group border border-[var(--border)] bg-gray-50 p-10 rounded-2xl hover:border-[var(--accent-warm)] hover:shadow-[0_0_40px_rgba(245,158,11,0.1)] transition-all flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <BrainCircuit size={180} />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="bg-[rgba(245,158,11,0.05)] text-[var(--accent-warm)] text-sm font-mono px-4 py-1.5 border border-[rgba(245,158,11,0.2)] rounded flex items-center gap-2">
                                        <BrainCircuit size={16} /> AI-powered
                                    </span>
                                </div>

                                <h2 className="text-3xl font-display font-bold mb-4 group-hover:text-[var(--accent-warm)] transition-colors">
                                    DAX Formula Assistant
                                </h2>

                                <p className="text-[var(--text-secondary)] text-lg mb-10 flex-grow leading-relaxed max-w-lg">
                                    Beschrijf in gewone taal wat je wilt berekenen, en ontvang de juiste DAX-formule — inclusief uitleg.
                                    Of plak een bestaande formule in voor een heldere uitleg.
                                </p>

                                <div className="mt-auto">
                                    <Link href="/tools/dax-assistant" className="inline-flex items-center gap-2 bg-[var(--surface)] hover:bg-[#1f2937] text-[var(--text-primary)] border border-[var(--border)] group-hover:border-[var(--accent-warm)] px-6 py-3 rounded text-lg font-medium transition-all shadow-[0_0_15px_rgba(245,158,11,0)] group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                        Open de assistant <ArrowRight size={20} className="text-[var(--accent-warm)]" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Tool 3: Report Auditor */}
                        <div className="group border border-[var(--border)] bg-gray-50 p-10 rounded-2xl hover:border-[var(--primary)] hover:shadow-[0_0_40px_rgba(30,58,95,0.1)] transition-all flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShieldCheck size={180} />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="bg-[rgba(30,58,95,0.05)] text-[var(--primary)] text-sm font-mono px-4 py-1.5 border border-[rgba(30,58,95,0.2)] rounded flex items-center gap-2">
                                        <ShieldCheck size={16} /> Betaald
                                    </span>
                                    <span className="bg-[rgba(245,158,11,0.05)] text-[var(--accent-warm)] text-sm font-mono px-4 py-1.5 border border-[rgba(245,158,11,0.2)] rounded flex items-center gap-2">
                                        <BrainCircuit size={16} /> AI-powered
                                    </span>
                                </div>

                                <h2 className="text-3xl font-display font-bold mb-4 group-hover:text-[var(--primary)] transition-colors">
                                    Report Auditor
                                </h2>

                                <p className="text-[var(--text-secondary)] text-lg mb-10 flex-grow leading-relaxed max-w-lg">
                                    Upload je .pbix en ontvang een professionele AI-audit van je datamodel.
                                    Privacyproof — bewijs van dataverwijdering inbegrepen.
                                </p>

                                <div className="mt-auto">
                                    <Link href="/tools/report-auditor" className="btn-primary inline-flex items-center gap-2 text-lg px-6 py-3">
                                        Start een audit <ArrowRight size={20} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Tool 4: BI-Kosten Calculator */}
                        <div className="group border border-[var(--border)] bg-gray-50 p-10 rounded-2xl hover:border-[#B8963E] hover:shadow-[0_0_40px_rgba(184,150,62,0.1)] transition-all flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Calculator size={180} />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="bg-[var(--surface)] text-[var(--text-secondary)] text-sm font-mono px-4 py-1.5 border border-[var(--border)] rounded flex items-center gap-2">
                                        Gratis tool
                                    </span>
                                </div>

                                <h2 className="text-3xl font-display font-bold mb-4 group-hover:text-[#B8963E] transition-colors">
                                    BI-Kosten Calculator
                                </h2>

                                <p className="text-[var(--text-secondary)] text-lg mb-10 flex-grow leading-relaxed max-w-lg">
                                    Bereken wat slechte data jouw organisatie kost per maand.
                                    FTE, uren, uurtarief en vertraagde beslissingen — in euro&apos;s uitgedrukt.
                                </p>

                                <div className="mt-auto">
                                    <Link href="/tools/bi-kosten-calculator" className="inline-flex items-center gap-2 bg-[var(--surface)] hover:bg-[#1f2937] text-[var(--text-primary)] border border-[var(--border)] group-hover:border-[#B8963E] px-6 py-3 rounded text-lg font-medium transition-all shadow-[0_0_15px_rgba(184,150,62,0)] group-hover:shadow-[0_0_15px_rgba(184,150,62,0.2)]">
                                        Open de calculator <ArrowRight size={20} className="text-[#B8963E]" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Tool 5: DashPortal */}
                        <div className="group border border-[var(--border)] bg-gray-50 p-10 rounded-2xl hover:border-[#10b981] hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] transition-all flex flex-col h-full relative overflow-hidden lg:col-span-2">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Globe size={180} />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="bg-[rgba(16,185,129,0.05)] text-[#10b981] text-sm font-mono px-4 py-1.5 border border-[rgba(16,185,129,0.2)] rounded flex items-center gap-2">
                                        <ExternalLink size={16} /> Web app
                                    </span>
                                </div>

                                <h2 className="text-3xl font-display font-bold mb-4 group-hover:text-[#10b981] transition-colors">
                                    DashPortal.app
                                </h2>

                                <p className="text-[var(--text-secondary)] text-lg mb-10 flex-grow leading-relaxed max-w-lg">
                                    Publiceer en deel je Power BI dashboards via een eigen branded portaal. Met je eigen logo, kleuren en domein.
                                    Inclusief metadatabeheer en data-hygiëne monitoring — zonder technische kennis, binnen 10 minuten live.
                                </p>

                                <div className="mt-auto flex flex-wrap gap-4">
                                    <Link href="/dashportal" className="btn-primary inline-flex items-center gap-2 text-lg px-6 py-3" style={{ backgroundColor: '#10b981' }}>
                                        Meer informatie <ArrowRight size={20} />
                                    </Link>
                                    <a href="https://dashportal.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[var(--surface)] hover:bg-[#1f2937] text-[var(--text-primary)] border border-[var(--border)] group-hover:border-[#10b981] px-6 py-3 rounded text-lg font-medium transition-all">
                                        Naar DashPortal.app <ExternalLink size={20} className="text-[#10b981]" />
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
}
