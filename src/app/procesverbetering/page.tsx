import Link from "next/link";
import { ArrowRight, Search, BarChart3, Microscope, Wrench, ShieldCheck, Calculator } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Power BI en procesverbetering — de Lean Six Sigma-aanpak | PowerBIStudio.nl',
    description: 'Dashboards zijn het middel, procesverbetering is het doel. Onze oprichter is LSS Black Belt, en het team van Power BI Studio toetst elk BI-vraagstuk aan die lens — de taal die CFO\'s en COO\'s spreken.',
    alternates: { canonical: 'https://www.powerbistudio.nl/procesverbetering' },
};

export default function ProcesverbeteringPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,150,62,0.08),transparent_50%)] pointer-events-none" />
                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <span className="inline-flex items-center text-[0.7rem] font-semibold px-3 py-1 rounded-full mb-4" style={{ backgroundColor: 'rgba(184, 150, 62, 0.1)', color: '#B8963E' }}>
                        Lean Six Sigma + Power BI
                    </span>
                    <h1 className="text-3xl md:text-5xl font-display font-bold mt-2 mb-4 max-w-3xl">
                        Dashboards zijn het middel. Procesverbetering is het doel.
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
                        Binnen Power BI Studio kijken we vanuit een Lean Six Sigma Black Belt-lens
                        naar data — een methodische achtergrond die onze oprichter inbrengt en die
                        het hele team gebruikt. We verbinden BI aan bedrijfsprocessen.
                    </p>
                </div>
            </section>

            {/* Propositie */}
            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                    <div className="text-[var(--text-secondary)] leading-relaxed space-y-4 text-lg">
                        <p>
                            Alle andere Power BI-consultants verkopen dashboards en rapporten
                            als eindproduct. Wij verkopen uitkomsten: kortere DSO, lagere
                            voorraadkosten, snellere rapportagecycli. Dat is het verschil tussen
                            een dashboard-klus en een procesverbeteringsproject.
                        </p>
                        <p>
                            Dit is de taal die CFO&apos;s en COO&apos;s spreken. En het is de reden dat
                            we ingezet worden op vraagstukken die verder gaan dan een rapport.
                        </p>
                    </div>
                </div>
            </section>

            {/* DMAIC */}
            <section className="py-20 bg-gray-50 border-y border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">Hoe DMAIC en Power BI samenkomen</h2>
                    <div className="space-y-8">
                        {[
                            {
                                icon: Search,
                                phase: 'Define',
                                desc: 'Wat is het procesprobleem? Niet "we hebben geen dashboard" maar "onze DSO is 12 dagen te lang en we weten niet waar het escaleert."',
                            },
                            {
                                icon: BarChart3,
                                phase: 'Measure',
                                desc: 'Power BI als meetinstrument. Niet ter decoratie, maar om de baseline te bepalen: waar in het proces verlies je tijd of geld?',
                            },
                            {
                                icon: Microscope,
                                phase: 'Analyze',
                                desc: 'Datamodel als analyseplatform. DAX-measures die de rootcause blootleggen, niet alleen de symptomen visualiseren.',
                            },
                            {
                                icon: Wrench,
                                phase: 'Improve',
                                desc: 'Dashboards die de verandering aandrijven, niet beschrijven. Operationele rapportages die het gedrag in het proces veranderen.',
                            },
                            {
                                icon: ShieldCheck,
                                phase: 'Control',
                                desc: 'Monitoring en governance die borgen dat de verbetering standhoudt. Deployment pipelines, data-eigenaarschap, alerting.',
                            },
                        ].map((step) => (
                            <div key={step.phase} className="flex items-start gap-4">
                                <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(184, 150, 62, 0.1)' }}>
                                    <step.icon size={20} style={{ color: '#B8963E' }} />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-lg mb-1">{step.phase}</h3>
                                    <p className="text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lyreco case */}
            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">In de praktijk: Lyreco</h2>
                    <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                        Bij Lyreco leverde Power BI Studio interim data team lead-capaciteit
                        (Jan Willem, oprichter). We bouwden niet alleen BI-oplossingen — we
                        pasten de DMAIC-methodiek toe op het BI-team zelf. Processen
                        geoptimaliseerd, backlog geprioriteerd op businessimpact, en governance
                        ingericht die na onze overdracht standhoudt.
                    </p>
                    <Link href="/cases/lyreco" className="inline-flex items-center gap-2 font-medium hover:gap-3 transition-all" style={{ color: '#B8963E' }}>
                        Lees de volledige Lyreco case <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* Doelrollen */}
            <section className="py-20 bg-gray-50 border-y border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">Voor welke rollen is dit relevant?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { role: 'COO', desc: 'Proceskosten reduceren via betere operationele data' },
                            { role: 'CFO', desc: 'Snellere rapportagecycli, minder handmatig werk, lagere DSO' },
                            { role: 'Operations director', desc: 'Capaciteitsplanning en bottleneck-detectie' },
                            { role: 'Data team lead', desc: 'Methodiek en structuur in een BI-team' },
                        ].map((r) => (
                            <div key={r.role} className="glass-card rounded-xl p-6 border border-[var(--border)]">
                                <h3 className="font-display font-bold mb-2">{r.role}</h3>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{r.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Calculator CTA */}
            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                    <Link href="/tools/bi-kosten-calculator" className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)] hover:border-[#B8963E] transition-all group flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(184, 150, 62, 0.1)' }}>
                            <Calculator size={24} style={{ color: '#B8963E' }} />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-lg mb-1">Bereken wat slechte data jouw organisatie kost</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-2">
                                De BI-Kosten Calculator rekent het uit in euro&apos;s — de taal die CFO&apos;s en COO&apos;s spreken.
                            </p>
                            <span className="inline-flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all" style={{ color: '#B8963E' }}>
                                Open de calculator <ArrowRight size={16} />
                            </span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 border-t border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12 text-center max-w-2xl">
                    <p className="text-xl md:text-2xl font-display font-bold mb-6">
                        Is jouw BI-vraagstuk eigenlijk een procesverbeteringsvraagstuk?
                    </p>
                    <Link href="/contact?type=procesverbetering" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
                        Plan een intake gesprek <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </>
    );
}
