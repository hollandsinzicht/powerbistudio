import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Code2, Users, Lightbulb } from "lucide-react";
import type { Metadata } from 'next';
import { StatBlok } from '@/components/ui';

export const metadata: Metadata = {
    title: 'Over Jan Willem den Hollander — Power BI architect, LSS Black Belt | PowerBIStudio.nl',
    description: '15 jaar Power BI specialist. LSS Black Belt. Maker van DashPortal. Developer, interim lead én product owner in één persoon. Bewezen in publieke sector, energie en finance.',
    alternates: { canonical: 'https://www.powerbistudio.nl/over' },
};

export default function OverPage() {
    const skills = [
        "Power BI", "DAX", "SQL", "Python",
        "Azure Data Factory", "Microsoft Fabric",
        "Datamodellering", "ETL Processen", "AI-integraties",
        "Lean Six Sigma Black Belt", "Deployment Pipelines",
        "Power BI Embedded", "RLS-architectuur", "TMDL/versiecontrole",
    ];

    return (
        <>
            {/* Hero */}
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
                            <h1 className="text-3xl md:text-5xl font-display font-bold mb-6">
                                De Power BI architect die procesverbetering als <span className="text-[var(--accent)]">uitkomst</span> levert
                            </h1>
                            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                                Niet &ldquo;ook een goede Power BI consultant&rdquo;. De enige die publieke
                                sector-bewijs, Lean Six Sigma-methodiek, eigen product-IP en
                                hands-on senioriteit als developer, interim lead én product owner
                                combineert.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* StatBlokken */}
            <section className="py-12 border-b border-[var(--border)] bg-gray-50">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <StatBlok value="15 jaar" label="Power BI-ervaring" />
                        <StatBlok value="25+" label="GGD-regio's bediend" />
                        <StatBlok value="5" label="Sectoren" />
                        <StatBlok value="3" label="Eigen producten" />
                    </div>
                </div>
            </section>

            {/* Drie rollen */}
            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-[var(--text-secondary)] mb-4 block">
                        Drie rollen — één specialist
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                        <div className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)]">
                            <Code2 size={24} className="text-[var(--primary)] mb-4" />
                            <h3 className="text-lg font-display font-bold mb-3">Als developer</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                                Ik bouw het zelf. DAX, Power Query, semantische modellen,
                                RLS-architectuur, deployment pipelines. Geen interpretatie
                                verloren in een overdracht.
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                                Referentie: <Link href="/cases/ggdghor" className="text-[var(--primary)] hover:underline">GGDGHOR — nationaal dataportaal</Link>
                            </p>
                        </div>
                        <div className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)]">
                            <Users size={24} className="text-[var(--primary)] mb-4" />
                            <h3 className="text-lg font-display font-bold mb-3">Als interim lead</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                                Ik neem tijdelijk de leiding van een data team. Prioritering,
                                stakeholdermanagement, backlog, governance. Ik vertaal
                                bedrijfsvragen naar technische beslissingen.
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                                Referentie: <Link href="/cases/lyreco" className="text-[var(--primary)] hover:underline">Lyreco — interim data team lead Benelux</Link>
                            </p>
                        </div>
                        <div className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)]">
                            <Lightbulb size={24} className="text-[var(--primary)] mb-4" />
                            <h3 className="text-lg font-display font-bold mb-3">Als product owner</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                                Ik vertaal gebruikersbehoeften naar product. Van epics en
                                user stories tot acceptance criteria en sprintplanning.
                                Met een oog op de technische haalbaarheid.
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                                Referentie: <Link href="/dashportal" className="text-[var(--primary)] hover:underline">DashPortal — van idee tot SaaS-product</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Verhaal */}
            <section className="py-24 bg-gray-50 border-y border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 max-w-6xl mx-auto">
                        <div className="w-full lg:w-3/5">
                            <h2 className="text-3xl font-display font-bold mb-8 text-[var(--text-primary)]">Mijn achtergrond</h2>
                            <div className="text-[var(--text-secondary)] leading-relaxed space-y-6">
                                <p>
                                    Ik werk al 15 jaar in de wereld van data en business intelligence.
                                    Niet als generalist die alles een beetje doet, maar als specialist:
                                    Power BI, de volledige Microsoft Data stack, en de bedrijfsprocessen
                                    die eromheen draaien.
                                </p>
                                <p>
                                    Wat mij onderscheidt van de meeste BI-consultants is mijn achtergrond
                                    in Lean Six Sigma. Ik ben gecertificeerd Black Belt — en ik gebruik die
                                    methodiek actief. Niet als marketingterm op een CV, maar als lens
                                    waarmee ik naar data kijk. Elk dashboard heeft een procesreden. Elke
                                    vertraging in een rapport heeft een oorzaak. Ik zoek die oorzaak op.
                                </p>
                                <p>
                                    Ik heb gewerkt voor organisaties als GGDGHOR (25 GGD-regio&apos;s + RIVM),
                                    Lyreco (finance dashboards Benelux), Vattenfall (energie), Technische
                                    Unie (groothandel) en Renewi (afvalbeheer). In die trajecten heb ik
                                    niet alleen gebouwd — ik heb aangestuurd, geadviseerd en meegedacht
                                    over architectuur op organisatieniveau.
                                </p>
                                <p>
                                    Naast interim- en advieswerk bouw ik eigen producten. DashPortal is
                                    een white-label Power BI portal die organisaties en softwarebedrijven
                                    gebruiken om dashboards te delen met klanten zonder Microsoft-licenties.
                                    De Report Auditor is een AI-tool die Power BI datamodellen analyseert
                                    op kwaliteit. Dat zijn niet bijzaken — ze zijn het bewijs dat de kennis
                                    dieper gaat dan een projectklus.
                                </p>
                            </div>
                            <div className="mt-8">
                                <Link href="/procesverbetering" className="inline-flex items-center gap-2 font-medium text-[var(--primary)] hover:gap-3 transition-all">
                                    Lees meer over de Lean-aanpak <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="w-full lg:w-2/5">
                            <div className="glass-card p-8 rounded-xl mb-8">
                                <h3 className="text-xl font-display font-bold mb-6">Technische Stack</h3>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map(skill => (
                                        <span key={skill} className="bg-gray-50 border border-[var(--border)] text-[var(--text-secondary)] px-3 py-1.5 rounded-md text-sm cursor-default hover:border-[var(--accent)] hover:text-[var(--text-primary)] transition-colors">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Klantcitaat placeholder */}
                            <div className="glass-card p-8 rounded-xl border-l-4 border-[var(--accent)]">
                                <blockquote className="italic text-[var(--text-secondary)] leading-relaxed">
                                    &ldquo;[Citaat van contactpersoon — in te vullen met toestemming van opdrachtgever]&rdquo;
                                </blockquote>
                                <p className="text-sm text-[var(--text-secondary)] mt-4">— [Naam], [Functie], [Organisatie]</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12 text-center max-w-2xl">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">
                        Laten we kennismaken
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-8">
                        Ik reageer binnen één werkdag. Geen automatische opvolging, geen sales-funnel.
                    </p>
                    <Link href="/contact" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
                        Neem contact op <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </>
    );
}
