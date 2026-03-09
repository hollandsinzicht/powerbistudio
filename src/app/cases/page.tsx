import Link from "next/link";
import { ArrowRight, Database, LineChart, PieChart } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cases | PowerBIStudio',
    description: 'Bekijk de impact van professionele Power BI implementaties bij organisaties zoals GGDGHOR, Technische Unie en Lyreco.',
};

export default function CasesPage() {
    const cases = [
        {
            id: "ggdghor",
            client: "GGDGHOR",
            sector: "Publieke gezondheid",
            challenge: "Centrale data-ontsluiting voor 25 GGD-regio's en RIVM",
            solution: "Ontwikkeling van een centraal dataportaal in Power BI met gestandaardiseerde rapporten voor medewerkers, managers en directeuren",
            result: "Één bron van waarheid voor alle gezondheidsdata in Nederland",
            icon: <Database size={32} className="text-[var(--accent)]" />
        },
        {
            id: "technische-unie",
            client: "Technische Unie",
            sector: "Groothandel / distributie",
            challenge: "Gefragmenteerde data over sales, finance en voorraad",
            solution: "Complete Power BI structuur met meerdere apps per afdeling",
            result: "Afdelingsoverstijgend inzicht, minder handmatig rapportagewerk",
            icon: <LineChart size={32} className="text-[var(--accent-warm)]" />
        },
        {
            id: "lyreco",
            client: "Lyreco",
            sector: "B2B kantoorartikelen",
            challenge: "Financiële dashboards en KPI-rapportage voor het Benelux management",
            solution: "Power BI-omgeving met geautomatiseerde finance dashboards en SMT-rapportage",
            result: "Snellere besluitvorming op basis van real-time financiële data",
            icon: <PieChart size={32} className="text-[var(--text-primary)] opacity-80" />
        }
    ];

    return (
        <>
            <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                            Impact in de <span className="text-[var(--accent)]">praktijk</span>
                        </h1>
                        <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                            Geen theorie, maar bewezen resultaten. Bekijk hoe de inzet van Power BI
                            bij verschillende organisaties heeft geleid tot beter en sneller inzicht.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 gap-12 max-w-5xl mx-auto">

                        {cases.map((kase, index) => (
                            <div
                                key={kase.id}
                                className={`glass-card rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-colors group flex flex-col md:flex-row ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''
                                    }`}
                            >
                                {/* Visual side */}
                                <div className="w-full md:w-2/5 md:min-h-[300px] bg-[var(--surface)] p-8 md:p-12 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-[var(--border)] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(59,130,246,0.05)_25%,transparent_25%,transparent_50%,rgba(59,130,246,0.05)_50%,rgba(59,130,246,0.05)_75%,transparent_75%,transparent)] bg-[length:20px_20px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                                    <div className="relative z-10 bg-[var(--surface)] w-24 h-24 rounded-full flex items-center justify-center border border-[var(--border)] shadow-[0_0_30px_rgba(59,130,246,0.1)] group-hover:scale-110 transition-transform duration-500">
                                        {kase.icon}
                                    </div>
                                    <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mt-6 relative z-10 text-center">
                                        {kase.client}
                                    </h2>
                                    <span className="text-[var(--text-secondary)] text-sm mt-2 uppercase tracking-widest relative z-10 text-center">
                                        {kase.sector}
                                    </span>
                                </div>

                                {/* Content side */}
                                <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center bg-gray-50">

                                    <div className="mb-6">
                                        <h3 className="text-sm font-bold text-[var(--accent)] uppercase tracking-wider mb-2">Uitdaging</h3>
                                        <p className="text-[var(--text-primary)] text-lg leading-snug">{kase.challenge}</p>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Oplossing</h3>
                                        <p className="text-[var(--text-secondary)] leading-relaxed">{kase.solution}</p>
                                    </div>

                                    <div className="mt-2 pt-6 border-t border-[var(--border)]">
                                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">Resultaat</h3>
                                        <p className="text-[var(--text-primary)] font-medium italic">"{kase.result}"</p>
                                    </div>

                                </div>
                            </div>
                        ))}

                    </div>

                    <div className="mt-24 text-center max-w-2xl mx-auto">
                        <h3 className="text-2xl font-display font-bold mb-4">Staat jouw organisatie hier binnenkort?</h3>
                        <p className="text-[var(--text-secondary)] mb-8">
                            Laten we bespreken hoe we jullie data-uitdagingen kunnen omzetten in structurele oplossingen.
                        </p>
                        <Link href="/contact" className="btn-primary inline-flex items-center gap-2 text-lg">
                            Neem contact op <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
