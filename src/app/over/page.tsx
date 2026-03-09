import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Over | PowerBIStudio',
    description: 'Mijn naam is Jan Willem den Hollander. Ik werk al 15 jaar in de wereld van data en business intelligence als specialist in Power BI, DAX, SQL en Python.',
};

export default function OverPage() {
    const skills = [
        "Power BI",
        "DAX",
        "SQL",
        "Python",
        "Azure Data Factory",
        "Microsoft Fabric",
        "Datamodellering",
        "ETL Processen",
        "AI-integraties"
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">

                        <div className="w-full md:w-1/2 flex justify-center md:justify-end order-2 md:order-1 relative">
                            <div className="w-64 h-64 md:w-80 md:h-80 relative rounded-2xl overflow-hidden border border-[var(--border)] shadow-[0_0_40px_rgba(59,130,246,0.15)] group">
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] to-transparent z-10 opacity-60" />
                                <Image
                                    src="/jan-willem.jpg"
                                    alt="Jan Willem den Hollander"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    priority
                                />
                                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-[rgba(255,255,255,0.9)] backdrop-blur px-3 py-1.5 rounded-full border border-[var(--border)]">
                                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                                    <span className="text-xs font-medium text-[var(--text-primary)]">Beschikbaar voor interim</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 order-1 md:order-2">
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 pb-2">
                                Specialist zijn is een keuze. <span className="text-[var(--accent)]">Mijn keuze.</span>
                            </h1>
                            <p className="text-xl text-[var(--text-secondary)] mb-6 leading-relaxed">
                                Mijn naam is Jan Willem. Ik implementeer geen "standaard pakketten".
                                Ik bouw op maat gemaakte data-fundamenten die meegroeien met jouw organisatie.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 max-w-6xl mx-auto">

                        {/* Story */}
                        <div className="w-full lg:w-3/5 prose prose-invert prose-lg">
                            <h2 className="text-3xl font-display font-bold mb-8 text-[var(--text-primary)]">Mijn Verhaal</h2>

                            <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                                Ik werk al 15 jaar in de wereld van data en business intelligence. Niet als generalist, maar als specialist: Power BI, DAX, SQL en Python. Ik heb gewerkt voor organisaties als GGDGHOR, Lyreco, Vattenfall en Renewi &mdash; en ik weet wat het verschil maakt tussen een dashboard dat er mooi uitziet en een dashboard dat echt gebruikt wordt.
                            </p>

                            <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                                In de loop der jaren heb ik veel bedrijven zien worstelen met dezelfde problemen. De data is versnipperd, de dashboards zijn traag, en het management vertrouwt de cijfers niet. Dit gebeurt vaak wanneer data als een "IT-projectje" wordt gezien in plaats van een strategisch middel.
                            </p>

                            <blockquote className="border-l-4 border-[var(--accent)] pl-6 py-2 my-10 bg-[rgba(59,130,246,0.05)] rounded-r-lg italic text-lg text-[var(--text-primary)]">
                                "Mijn overtuiging: de combinatie van Power BI en AI is de grootste kans die er nu ligt voor organisaties die datagedreven willen werken."
                            </blockquote>

                            <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                                De meeste bedrijven weten echter niet waar ze moeten beginnen. Ik help ze om die stap te zetten &mdash; met een aanpak die werkt, niet een project dat na zes maanden in de prullenbak belandt.
                            </p>

                            <div className="mt-12 pt-8 border-t border-[var(--border)]">
                                <Link href="/contact" className="inline-flex items-center gap-2 text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors font-medium text-lg">
                                    Laten we kennismaken <ArrowRight size={20} />
                                </Link>
                            </div>
                        </div>

                        {/* Sidebar Skills & Timeline */}
                        <div className="w-full lg:w-2/5">

                            <div className="glass-card p-8 rounded-xl mb-8">
                                <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                                    Technische Stack
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map(skill => (
                                        <span key={skill} className="bg-gray-50 border border-[var(--border)] text-[var(--text-secondary)] px-3 py-1.5 rounded-md text-sm cursor-default hover:border-[var(--accent)] hover:text-[var(--text-primary)] transition-colors">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>



                        </div>

                    </div>

                    {/* Horizontal Timeline */}
                    <div className="mt-24 max-w-6xl mx-auto">
                        <h3 className="text-3xl font-display font-bold mb-12 text-center text-[var(--text-primary)]">Relevante Opdrachten</h3>

                        <div className="relative">
                            {/* Horizontal Line (visible on md+) */}
                            <div className="hidden md:block absolute top-[28px] left-8 right-8 h-0.5 bg-gradient-to-r from-[var(--surface)] via-[var(--border)] to-[var(--surface)]"></div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                                {/* Timeline Item 1 */}
                                <div className="relative flex flex-col items-center group">
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-[3px] border-[var(--surface)] bg-[var(--accent)] shadow z-10 mb-6 group-hover:scale-125 transition-transform"></div>
                                    <div className="p-6 bg-[var(--surface)] text-center border border-[var(--border)] rounded-xl shadow hover:border-[var(--accent)] transition-colors w-full h-full">
                                        <span className="text-[var(--accent)] font-mono text-xs tracking-wider uppercase">Interim</span>
                                        <h4 className="text-[var(--text-primary)] font-bold mt-2">GGDGHOR</h4>
                                        <p className="text-[var(--text-secondary)] text-sm mt-3">Ontwikkeling Nationaal Dataportaal. Architectuur & Realisatie.</p>
                                    </div>
                                </div>

                                {/* Timeline Item 2 */}
                                <div className="relative flex flex-col items-center group">
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-[3px] border-[var(--surface)] bg-[var(--surface)] ring-1 ring-[var(--border)] shadow z-10 mb-6 group-hover:scale-125 group-hover:bg-[var(--accent-warm)] group-hover:ring-0 transition-all"></div>
                                    <div className="p-6 bg-[var(--surface)] text-center border border-[var(--border)] rounded-xl shadow hover:border-[var(--accent-warm)] transition-colors w-full h-full">
                                        <span className="text-[var(--accent-warm)] font-mono text-xs tracking-wider uppercase">Project</span>
                                        <h4 className="text-[var(--text-primary)] font-bold mt-2">Technische Unie</h4>
                                        <p className="text-[var(--text-secondary)] text-sm mt-3">Afdelingsoverstijgende business intelligence opzet.</p>
                                    </div>
                                </div>

                                {/* Timeline Item 3 */}
                                <div className="relative flex flex-col items-center group">
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-[3px] border-[var(--surface)] bg-[var(--surface)] ring-1 ring-[var(--border)] shadow z-10 mb-6 group-hover:scale-125 group-hover:bg-gray-400 group-hover:ring-0 transition-all"></div>
                                    <div className="p-6 bg-[var(--surface)] text-center border border-[var(--border)] rounded-xl shadow hover:border-gray-400 transition-colors w-full h-full">
                                        <span className="text-[var(--text-secondary)] font-mono text-xs tracking-wider uppercase">Consultancy</span>
                                        <h4 className="text-[var(--text-primary)] font-bold mt-2">Lyreco</h4>
                                        <p className="text-[var(--text-secondary)] text-sm mt-3">Financiële dashboards voor Benelux management.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
