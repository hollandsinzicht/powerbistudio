import Link from "next/link";
import { ArrowRight, Users, Building2, Landmark, ChevronDown } from "lucide-react";
import type { Metadata } from 'next';
import { ProbleemIntro } from '@/components/ui';

export const metadata: Metadata = {
    title: 'Power BI naar Fabric migreren — wat je als organisatie moet weten | PowerBIStudio.nl',
    description: 'Microsoft forceert de overgang van Power BI Premium naar Fabric. Wat betekent dat voor jouw licenties, je datamodel en je architectuur? Fabric QuickScan: €1.500 vast.',
    alternates: { canonical: 'https://www.powerbistudio.nl/fabric-migratie' },
};

export default function FabricMigratiePage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,90,48,0.08),transparent_50%)] pointer-events-none" />
                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <span className="inline-flex items-center text-[0.7rem] font-semibold px-3 py-1 rounded-full mb-4" style={{ backgroundColor: 'rgba(216, 90, 48, 0.1)', color: '#D85A30' }}>
                        Data & migratie
                    </span>
                    <h1 className="text-3xl md:text-5xl font-display font-bold mt-2 mb-4 max-w-3xl">
                        Microsoft stopt met Power BI Premium zoals je het kent.
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
                        De overgang naar Fabric is geen optie — het is een planning.
                        Wij helpen je die planning maken voordat Microsoft hem voor je maakt.
                    </p>
                </div>
            </section>

            {/* ProbleemIntro */}
            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                    <ProbleemIntro>
                        <p>
                            Veel organisaties ontdekken de impact van de Fabric-transitie pas als ze een
                            verlengingsmail krijgen van Microsoft. Tegen die tijd zijn de licentiekosten al
                            gewijzigd en de architectuurkeuzes al gemaakt — zonder jou.
                        </p>
                    </ProbleemIntro>
                </div>
            </section>

            {/* Drie scenario's */}
            <section className="py-20 bg-gray-50 border-y border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">Waar sta jij?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Users,
                                title: 'Klein (< 50 gebruikers)',
                                desc: 'Waarschijnlijk goedkoper en eenvoudiger dan je denkt. Fabric F2 of F4 capacity is voldoende. We helpen je in één dag een migratiescope te definiëren.',
                            },
                            {
                                icon: Building2,
                                title: 'Mid-market (50–500 gebruikers)',
                                desc: 'Hier liggen de echte beslissingen: workspace-structuur, OneLake vs. bestaande datawarehouse, Copilot-gereedheid. Een Fabric QuickScan geeft je helderheid.',
                            },
                            {
                                icon: Landmark,
                                title: 'Enterprise (500+ gebruikers)',
                                desc: 'Waarschijnlijk al in gesprek met Microsoft. Wij adviseren als onafhankelijke architectuurpartij — niet gebonden aan een Microsoft-partnercommissie.',
                            },
                        ].map((s) => (
                            <div key={s.title} className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)]">
                                <s.icon size={24} style={{ color: '#D85A30' }} className="mb-4" />
                                <h3 className="text-lg font-display font-bold mb-2">{s.title}</h3>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* QuickScan */}
            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">Fabric QuickScan</h2>
                    <p className="text-2xl font-display font-bold mb-6" style={{ color: '#D85A30' }}>€1.500 vast</p>
                    <div className="space-y-3 mb-8">
                        {[
                            'Analyse van je huidige Power BI-omgeving',
                            'Migratiescope en -planning',
                            'Licentieadvies (welke Fabric SKU past bij jouw gebruik)',
                            'Copilot-gereedheid beoordeling',
                            'Schriftelijk rapport met prioriteiten',
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center font-mono mt-0.5">
                                    {i + 1}
                                </span>
                                <span className="text-[var(--text-secondary)]">{item}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-6">Doorlooptijd: 3–5 werkdagen</p>
                    <Link href="/contact?type=fabric" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                        Vraag een Fabric QuickScan aan <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-gray-50 border-y border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">Veelgestelde vragen</h2>
                    <div className="space-y-6">
                        {[
                            { q: 'Wat is het verschil tussen Power BI Premium en Fabric?', a: 'Fabric is het nieuwe platform van Microsoft dat Power BI Premium vervangt. Het integreert data engineering, data science en BI in één platform met capaciteitsgebaseerde prijzen.' },
                            { q: 'Moet ik alles opnieuw bouwen?', a: 'Nee. Bestaande Power BI-rapporten en datasets werken in Fabric. Maar de architectuur eromheen — workspaces, pipelines, governance — moet mogelijk worden aangepast.' },
                            { q: 'Wat kost Fabric vergeleken met mijn huidige licenties?', a: 'Dat hangt af van je huidige setup. In veel gevallen is Fabric goedkoper, maar zonder analyse kun je niet voorspellen of dat voor jouw situatie geldt.' },
                            { q: 'Is Copilot alleen beschikbaar in Fabric?', a: 'Copilot voor Power BI is beschikbaar in alle betaalde Fabric SKUs. Voor de beste resultaten moet je semantic model specifiek worden voorbereid.' },
                            { q: 'Wat is OneLake en moet ik het gebruiken?', a: 'OneLake is de data lake van Fabric. Je hoeft het niet te gebruiken, maar het biedt voordelen voor organisaties die meerdere databronnen willen consolideren.' },
                        ].map((faq) => (
                            <div key={faq.q} className="border-b border-[var(--border)] pb-6">
                                <h3 className="font-display font-bold mb-2">{faq.q}</h3>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12 text-center max-w-2xl">
                    <p className="text-xl md:text-2xl font-display font-bold mb-6">
                        Wil je weten wat Fabric voor jouw organisatie betekent?
                    </p>
                    <Link href="/contact?type=fabric" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
                        Vraag een Fabric QuickScan aan <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </>
    );
}
