import Link from "next/link";
import { ArrowRight, Code2, Users, Lightbulb } from "lucide-react";
import type { Metadata } from 'next';
import { StatBlok } from '@/components/ui';
import TeamMemberCard from '@/components/team/TeamMemberCard';
import { team } from '@/lib/team-data';

export const metadata: Metadata = {
    title: 'Over Power BI Studio — team, aanpak en AI-agents',
    description: 'Power BI Studio is een Nederlands collectief: oprichter Jan Willem den Hollander (15 jaar Power BI, LSS Black Belt) en twee transparant gelabelde AI-agents — ADA (DAX) en LEX (model-audit).',
    alternates: { canonical: 'https://www.powerbistudio.nl/over' },
};

const BASE_URL = 'https://www.powerbistudio.nl';

const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BASE_URL}/over#jan-willem`,
    name: 'Jan Willem den Hollander',
    jobTitle: 'Oprichter & Power BI architect',
    description: '15 jaar Power BI. LSS Black Belt. Oprichter van Power BI Studio.',
    url: `${BASE_URL}/over`,
    image: `${BASE_URL}/team/jan-willem.jpg`,
    worksFor: { '@id': `${BASE_URL}/#organization` },
    knowsAbout: ['Power BI', 'DAX', 'Microsoft Fabric', 'Lean Six Sigma', 'Power BI Embedded'],
    sameAs: ['https://www.linkedin.com/in/jan-willem-den-hollander/'],
};

const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Over', item: `${BASE_URL}/over` },
    ],
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            {/* Hero — tekst-only studio intro */}
            <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
                <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-3xl">
                    <h1 className="text-3xl md:text-5xl font-display font-bold mb-6">
                        Een Power BI Studio.<br />
                        Mensen én AI, altijd <span className="text-[var(--accent)]">transparant</span>.
                    </h1>
                    <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                        Power BI Studio is een Nederlands collectief voor Power BI architectuur,
                        procesverbetering en eigen AI-tools. Oprichter Jan Willem werkt samen
                        met twee AI-agents — ADA en LEX — die we zelf bouwden en open benoemen.
                        Geen verborgen AI in &ldquo;een team van seniors&rdquo;. Gewoon: mens + AI, met namen.
                    </p>
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

            {/* Ons team — founder + 4 AI-agents */}
            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-[var(--text-secondary)] mb-4 block">
                        Ons team
                    </span>
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 max-w-2xl">
                        Eén mens, vier AI-agents. Altijd met naam.
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {team.map((m) => (
                            <TeamMemberCard key={m.id} {...m} />
                        ))}
                    </div>
                    <div className="mt-10 max-w-3xl">
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed bg-gray-50 border border-[var(--border)] rounded-lg p-5">
                            <strong className="text-[var(--text-primary)]">Transparantie.</strong> Power BI Studio is een collectief
                            van Jan Willem den Hollander (oprichter, mens) en vier AI-agents die hij zelf bouwde (ATLAS, NOVA, ADA, LEX).
                            We maken altijd expliciet of output uit menselijk werk of AI-werk komt.
                            Klantinteractie loopt altijd via Jan Willem — de agents werken onder de motorkap.
                        </p>
                    </div>
                </div>
            </section>

            {/* Drie leveringsmodi — één studio */}
            <section className="py-24 bg-gray-50 border-y border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12">
                    <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-[var(--text-secondary)] mb-4 block">
                        Drie leveringsmodi — één studio
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                        <div className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)]">
                            <Code2 size={24} className="text-[var(--primary)] mb-4" />
                            <h3 className="text-lg font-display font-bold mb-3">Als development-partner</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                                We bouwen het zelf. DAX, Power Query, semantische modellen,
                                RLS-architectuur, deployment pipelines. Jan Willem leidt de
                                architectuur; ADA en LEX versnellen routine-audits en formule-werk.
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                                Referentie: <Link href="/cases/ggdghor" className="text-[var(--primary)] hover:underline">GGDGHOR — nationaal dataportaal</Link>
                            </p>
                        </div>
                        <div className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)]">
                            <Users size={24} className="text-[var(--primary)] mb-4" />
                            <h3 className="text-lg font-display font-bold mb-3">Als interim data lead</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                                We nemen tijdelijk de leiding van een data team. Prioritering,
                                stakeholdermanagement, backlog, governance. We vertalen
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
                                We vertalen gebruikersbehoeften naar product. Van epics en
                                user stories tot acceptance criteria en sprintplanning.
                                Met een oog op technische haalbaarheid.
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                                Referentie: <Link href="/dashportal" className="text-[var(--primary)] hover:underline">DashPortal — van idee tot SaaS-product</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Het verhaal van de studio */}
            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 max-w-6xl mx-auto">
                        <div className="w-full lg:w-3/5">
                            <h2 className="text-3xl font-display font-bold mb-8 text-[var(--text-primary)]">Het verhaal van de studio</h2>
                            <div className="text-[var(--text-secondary)] leading-relaxed space-y-6">
                                <p>
                                    Power BI Studio begon als de solo-praktijk van Jan Willem den Hollander —
                                    15 jaar diep in Power BI, de Microsoft Data stack, en de bedrijfsprocessen
                                    die eromheen draaien. Vandaag is het een collectief waar mens en AI samen
                                    werken, met heldere rolverdeling.
                                </p>
                                <p>
                                    Wat de studio onderscheidt van de meeste BI-consultancies is de Lean Six Sigma-
                                    achtergrond van de oprichter. Niet als marketingterm op een CV, maar als lens
                                    waarmee we naar data kijken. Elk dashboard heeft een procesreden. Elke
                                    vertraging in een rapport heeft een oorzaak. Die oorzaak zoeken we op.
                                </p>
                                <p>
                                    We hebben gewerkt voor organisaties als GGDGHOR (25 GGD-regio&apos;s + RIVM),
                                    Lyreco (finance dashboards Benelux), Vattenfall (energie), Technische
                                    Unie (groothandel) en Renewi (afvalbeheer). In die trajecten hebben we
                                    niet alleen gebouwd — we hebben aangestuurd, geadviseerd en meegedacht
                                    over architectuur op organisatieniveau.
                                </p>
                                <p>
                                    Naast interim- en advieswerk bouwt de studio eigen producten. DashPortal is
                                    een white-label Power BI portal. De Report Auditor (aangedreven door onze
                                    AI-agent LEX) analyseert Power BI datamodellen op kwaliteit. De DAX Formula
                                    Assistant (aangedreven door ADA) schrijft DAX op basis van natuurlijke taal.
                                    Dat zijn geen bijzaken — ze zijn het bewijs dat de kennis dieper gaat dan
                                    een projectklus.
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
            <section className="py-24 bg-gray-50 border-t border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12 text-center max-w-2xl">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">
                        Laten we kennismaken
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-8">
                        Je bericht komt bij Jan Willem terecht. Binnen één werkdag een reactie, altijd van een mens.
                    </p>
                    <Link href="/contact" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
                        Neem contact op <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </>
    );
}
