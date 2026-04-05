import Link from "next/link";
import { ArrowRight, Building, Globe, Code2, Calculator } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Resources — Gratis downloads voor Power BI professionals | PowerBIStudio.nl',
    description: 'BI-checklist voor de publieke sector, ISV architectuurgids, DAX-fouten PDF en BI-kosten calculator. Gratis downloads, direct bruikbaar.',
    alternates: { canonical: 'https://www.powerbistudio.nl/resources' },
};

const resources = [
    {
        title: 'BI-Kosten Calculator',
        description: 'Bereken wat slechte data jouw organisatie kost per maand. Interactieve tool met direct resultaat.',
        audience: 'CFO / COO / Operations director',
        href: '/tools/bi-kosten-calculator',
        icon: Calculator,
        color: '#B8963E',
    },
    {
        title: 'Publieke Sector BI-Checklist',
        description: '12 vragen die een gemeente of GGD moet stellen vóór aanbesteding van een BI-consultant. Over AVG, RLS, multi-locatie en governance.',
        audience: 'Inkoper / manager publieke sector',
        href: '/resources/publieke-sector-checklist',
        icon: Building,
        color: '#0F6E56',
    },
    {
        title: 'ISV Architectuurgids',
        description: '5 beslissingen die je vóór dag 1 moet nemen bij embedded Power BI. SKU-keuze, workspace-patroon, RLS-strategie.',
        audience: 'CTO / Product director',
        href: '/resources/isv-architectuurgids',
        icon: Globe,
        color: '#534AB7',
    },
    {
        title: '10 DAX-fouten in productie-modellen',
        description: 'De meest voorkomende DAX-fouten die performance killen en verkeerde cijfers opleveren. Met uitleg en oplossing.',
        audience: 'Power BI consultant / developer',
        href: '/tools/dax-assistant#dax-fouten',
        icon: Code2,
        color: '#1E3A5F',
    },
];

export default function ResourcesPage() {
    return (
        <>
            <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,58,95,0.06),transparent_50%)] pointer-events-none" />
                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                            Gratis <span className="text-[var(--accent)]">resources</span>
                        </h1>
                        <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                            Downloads en tools die je direct verder helpen — van BI-kostenberekening
                            tot aanbestedingschecklist.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                        {resources.map((r) => (
                            <Link
                                key={r.href}
                                href={r.href}
                                className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)] hover:border-[var(--accent)] transition-all group"
                            >
                                <r.icon size={28} style={{ color: r.color }} className="mb-4" />
                                <h2 className="text-xl font-display font-bold mb-2">{r.title}</h2>
                                <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: r.color }}>
                                    {r.audience}
                                </p>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                                    {r.description}
                                </p>
                                <span className="inline-flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all" style={{ color: r.color }}>
                                    Bekijk <ArrowRight size={16} />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
