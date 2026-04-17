import Link from "next/link";
import { ArrowRight, BrainCircuit, FileSearch, Sparkles, Globe, ShieldCheck, Zap } from "lucide-react";
import type { Metadata } from 'next';
import { DoelgroepBlok, SectorBadge, PriorityBadge } from '@/components/ui';
import TeamMemberCard from '@/components/team/TeamMemberCard';
import { team } from '@/lib/team-data';

export const metadata: Metadata = {
    title: 'Power BI Studio — Power BI die écht werkt',
    description: 'Power BI Studio: een Nederlandse studio met 15 jaar ervaring, LSS-methodiek en twee transparant gelabelde AI-agents (ADA & LEX). Voor SaaS-bedrijven, data teams en de publieke sector.',
    openGraph: {
        title: 'Power BI Studio — architectuur, AI-tools, procesverbetering',
        description: 'Van Fabric-migratie tot embedded analytics voor SaaS. Mensen + AI, altijd transparant. Bewezen aanpak, eigen producten, publieke sector-referenties.',
    },
    alternates: { canonical: 'https://www.powerbistudio.nl/' },
};

export default function HomePage() {
    return (
        <>
            {/* ═══ HERO ═══ */}
            <section className="min-h-[90vh] flex items-center relative overflow-hidden border-b border-[var(--border)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,58,95,0.1),transparent_50%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.06),transparent_50%)] pointer-events-none" />

                <div className="container mx-auto px-6 md:px-12 relative z-10 py-32">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-display font-bold leading-[1.15] mb-6">
                            Power BI dat werkt.<br />
                            Processen die verbeteren.<br />
                            Resultaten die <span className="text-[var(--accent)]">blijven</span>.
                        </h1>
                        <p className="text-[var(--text-secondary)] text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                            Power BI Studio combineert 15 jaar hands-on architectuur-ervaring
                            met eigen AI-tools. Voor organisaties die meer willen dan mooie
                            dashboards — en transparantie willen over wát door een mens en wát
                            door AI gedaan wordt.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/over" className="btn-primary inline-flex items-center gap-2 text-lg px-6 py-3">
                                Leer het team kennen <ArrowRight size={18} />
                            </Link>
                            <Link href="/tools" className="btn-secondary inline-flex items-center gap-2 text-lg px-6 py-3">
                                Probeer de tools
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ LOGOBALK ═══ */}
            <section className="py-8 border-b border-[var(--border)] bg-gray-50">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-[var(--text-secondary)]">
                        {["GGDGHOR", "Lyreco", "Vattenfall", "Renewi", "iO", "Technische Unie"].map((name) => (
                            <span key={name} className="text-sm font-medium tracking-wide opacity-60 hover:opacity-100 transition-opacity">
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ DRIE DOELGROEP-BLOKKEN ═══ */}
            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-[var(--text-secondary)] mb-4 block">
                        Voor wie werken wij
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                        <DoelgroepBlok
                            sector="saas"
                            label="Voor softwareteams"
                            title="Analytics embedded in jouw product"
                            description="Jouw klanten willen dashboards in jouw app — niet in een apart Microsoft-portaal. We ontwerpen de architectuur die dat mogelijk maakt, veilig en schaalbaar."
                            linkText="Meer over embedded analytics →"
                            href="/saas"
                        />
                        <DoelgroepBlok
                            sector="data"
                            label="Voor data teams"
                            title="Audit, Fabric-migratie of interim begeleiding"
                            description="Van slecht presterend datamodel tot Fabric-transitie. We komen binnen als developer, lead of product owner — afhankelijk van wat jouw team nodig heeft."
                            linkText="Bekijk onze aanpak →"
                            href="/over"
                        />
                        <DoelgroepBlok
                            sector="zorg"
                            label="Voor zorg & overheid"
                            title="Rapportages voor meerdere locaties of regio's"
                            description="Van 25 GGD-regio's naar één gedeeld datamodel. We kennen de eisen van de publieke sector: AVG, multi-tenant RLS, en governance die gecontroleerd wordt."
                            linkText="Bekijk de publieke sector aanpak →"
                            href="/publieke-sector"
                        />
                    </div>
                </div>
            </section>

            {/* ═══ LEAN-LENS ═══ */}
            <section className="py-24 border-y border-[var(--border)] bg-gray-50">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-3xl mx-auto">
                        <span className="text-[0.7rem] font-semibold tracking-widest uppercase mb-4 block" style={{ color: 'var(--color-accent-lean)' }}>
                            Wat ons onderscheidt
                        </span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                            Dashboards zijn het middel. Procesverbetering is het doel.
                        </h2>
                        <div className="text-[var(--text-secondary)] leading-relaxed space-y-4">
                            <p>
                                Onze oprichter is gecertificeerd Lean Six Sigma Black Belt, en het
                                team toetst elk BI-vraagstuk aan die lens. We verbinden BI aan
                                bedrijfsprocessen — niet alleen aan rapportage. De vraag is niet
                                &ldquo;hoe ziet het dashboard eruit?&rdquo;, maar &ldquo;welk besluit moet sneller
                                worden genomen, en wat kost het als dat nu misgaat?&rdquo;
                            </p>
                            <p>
                                Dat is de taal die CFO&apos;s en COO&apos;s spreken. En het is de reden dat
                                organisaties als Lyreco ons inzetten op BI-vraagstukken die verder
                                gaan dan een dashboard-klus.
                            </p>
                        </div>
                        <Link
                            href="/procesverbetering"
                            className="inline-flex items-center gap-2 mt-6 font-medium hover:gap-3 transition-all"
                            style={{ color: 'var(--color-accent-lean)' }}
                        >
                            Lees meer over de Lean-aanpak <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ AI + POWER BI ═══ */}
            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-[var(--accent)] mb-4 block">
                        AI + Power BI — concreet
                    </span>
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 max-w-2xl">
                        AI is geen toevoeging. Het is de volgende laag van je datamodel.
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* DAX Assistant */}
                        <div className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)] hover:border-[var(--accent)] transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <BrainCircuit size={24} className="text-[var(--accent)]" />
                                <PriorityBadge tier="gratis" />
                            </div>
                            <h3 className="text-lg font-display font-bold mb-3">DAX in gewone taal</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                                Beschrijf wat je wilt berekenen. De DAX Formula Assistant schrijft
                                de formule — inclusief uitleg. Geen DAX-kennis vereist voor complexe
                                berekeningen.
                            </p>
                            <Link href="/tools/dax-assistant" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:gap-3 transition-all">
                                Open de assistant <ArrowRight size={16} />
                            </Link>
                        </div>

                        {/* Report Auditor */}
                        <div className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)] hover:border-[var(--accent)] transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <FileSearch size={24} className="text-[var(--primary)]" />
                                <PriorityBadge tier="betaald" label="€49" />
                            </div>
                            <h3 className="text-lg font-display font-bold mb-3">Rapport-audit in 24 uur</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                                Upload je .pbix. AI analyseert je datamodel op vijf kwaliteits&shy;categorieën
                                en geeft je een actielijst. Sneller dan een consultant
                                een offerte schrijft.
                            </p>
                            <Link href="/tools/report-auditor" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:gap-3 transition-all">
                                Start een audit <ArrowRight size={16} />
                            </Link>
                        </div>

                        {/* Copilot Readiness */}
                        <div className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)] hover:border-[var(--accent)] transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles size={24} style={{ color: 'var(--color-sector-saas)' }} />
                                <PriorityBadge tier="op-aanvraag" />
                            </div>
                            <h3 className="text-lg font-display font-bold mb-3">Copilot-klaar maken</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                                Copilot in Power BI is beschikbaar — maar de meeste modellen zijn
                                er niet op gebouwd. We checken je semantic model en geven je een
                                concreet actieplan.
                            </p>
                            <Link href="/copilot-readiness" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:gap-3 transition-all">
                                Vraag een audit aan <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ HET TEAM — teaser ═══ */}
            <section className="py-24 border-t border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12">
                    <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-[var(--text-secondary)] mb-4 block">
                        Het team
                    </span>
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 max-w-2xl">
                        Mensen + AI. Altijd transparant.
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-12 max-w-2xl leading-relaxed">
                        Power BI Studio is een collectief: onze oprichter Jan Willem en twee
                        AI-agents (ADA voor DAX, LEX voor model-audits) die we zelf hebben
                        gebouwd. We maken altijd expliciet welke output van een mens komt en
                        welke van een AI — zonder marketing-fog.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {team.map((m) => (
                            <TeamMemberCard key={m.id} {...m} />
                        ))}
                    </div>
                    <div className="mt-10">
                        <Link href="/over" className="btn-secondary inline-flex items-center gap-2 px-6 py-3">
                            Lees meer over het team <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ PRODUCTSTACK ═══ */}
            <section className="py-24 border-y border-[var(--border)] bg-gray-50">
                <div className="container mx-auto px-6 md:px-12">
                    <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-[var(--text-secondary)] mb-4 block">
                        Eigen producten
                    </span>
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 max-w-2xl">
                        De enige Power BI studio in Nederland met een eigen productstack
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-12 max-w-2xl leading-relaxed">
                        Alle andere consultants verkopen uren. Wij bouwen ook producten —
                        DashPortal, de Report Auditor (aangedreven door onze AI-agent LEX)
                        en de DAX Assistant (aangedreven door ADA). Dat is geen bijzaak;
                        het is het bewijs dat we de architectuur echt doorgronden.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link href="/dashportal" className="glass-card rounded-xl p-6 border border-[var(--border)] hover:border-emerald-400 transition-all group">
                            <Globe size={28} className="text-emerald-500 mb-4" />
                            <h3 className="text-lg font-display font-bold mb-2">DashPortal</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                Branded Power BI portalen voor organisaties en ISVs.
                            </p>
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 mt-4 group-hover:gap-3 transition-all">
                                Bekijk DashPortal <ArrowRight size={16} />
                            </span>
                        </Link>
                        <Link href="/tools/report-auditor" className="glass-card rounded-xl p-6 border border-[var(--border)] hover:border-[var(--accent)] transition-all group">
                            <ShieldCheck size={28} className="text-[var(--primary)] mb-4" />
                            <h3 className="text-lg font-display font-bold mb-2">Report Auditor</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                AI-audit van je Power BI datamodel. Privacy-first, €49.
                            </p>
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] mt-4 group-hover:gap-3 transition-all">
                                Start een audit <ArrowRight size={16} />
                            </span>
                        </Link>
                        <Link href="/tools/dax-assistant" className="glass-card rounded-xl p-6 border border-[var(--border)] hover:border-[var(--accent)] transition-all group">
                            <Zap size={28} className="text-[var(--accent)] mb-4" />
                            <h3 className="text-lg font-display font-bold mb-2">DAX Formula Assistant</h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                DAX in gewone taal. Gratis.
                            </p>
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] mt-4 group-hover:gap-3 transition-all">
                                Open de assistant <ArrowRight size={16} />
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ CASES PREVIEW ═══ */}
            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-[var(--text-secondary)] mb-4 block">
                        Impact in de praktijk
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                        {[
                            {
                                client: 'GGDGHOR',
                                sector: 'zorg' as const,
                                label: 'Zorg & overheid',
                                description: 'Één bron van waarheid voor 25 GGD-regio\'s en het RIVM.',
                                highlight: 'Rapportagetijd van uren naar realtime voor alle regio\'s',
                                href: '/cases/ggdghor',
                            },
                            {
                                client: 'Lyreco',
                                sector: 'data' as const,
                                label: 'Finance & operations',
                                description: 'Real-time finance dashboards voor Benelux management.',
                                highlight: 'Wekelijkse rapportagecyclus geautomatiseerd',
                                href: '/cases/lyreco',
                            },
                            {
                                client: 'Technische Unie',
                                sector: 'data' as const,
                                label: 'Groothandel',
                                description: 'Afdelingsoverstijgend inzicht over sales, finance en voorraad.',
                                highlight: 'Handmatig rapportagewerk geëlimineerd',
                                href: '/cases/technische-unie',
                            },
                        ].map((c) => (
                            <Link
                                key={c.client}
                                href={c.href}
                                className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)] hover:border-[var(--accent)] transition-all group"
                            >
                                <SectorBadge sector={c.sector} label={c.label} />
                                <h3 className="text-xl font-display font-bold mt-3 mb-2">{c.client}</h3>
                                <p className="text-[var(--text-secondary)] text-sm mb-3">{c.description}</p>
                                <p className="font-semibold text-sm text-[var(--text-primary)]">{c.highlight}</p>
                                <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] mt-4 group-hover:gap-3 transition-all">
                                    Lees de volledige case <ArrowRight size={16} />
                                </span>
                            </Link>
                        ))}
                    </div>
                    <div className="text-center mt-10">
                        <Link href="/cases" className="btn-secondary inline-flex items-center gap-2 px-6 py-3">
                            Bekijk alle cases <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ DRIE SEGMENT CTA'S ═══ */}
            <section className="py-24 border-t border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="rounded-xl p-6 md:p-8" style={{ backgroundColor: 'rgba(83, 74, 183, 0.05)', borderLeft: '4px solid var(--color-sector-saas)' }}>
                            <span className="text-[0.7rem] font-semibold tracking-widest uppercase mb-3 block" style={{ color: 'var(--color-sector-saas)' }}>
                                Voor ISV/SaaS-bedrijven
                            </span>
                            <p className="text-[var(--text-primary)] font-medium mb-4">
                                Jouw klanten willen analytics in jouw product.
                            </p>
                            <Link href="/contact?type=saas" className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all" style={{ color: 'var(--color-sector-saas)' }}>
                                Plan een architectuurreview <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="rounded-xl p-6 md:p-8" style={{ backgroundColor: 'rgba(216, 90, 48, 0.05)', borderLeft: '4px solid var(--color-sector-data)' }}>
                            <span className="text-[0.7rem] font-semibold tracking-widest uppercase mb-3 block" style={{ color: 'var(--color-sector-data)' }}>
                                Voor data teams
                            </span>
                            <p className="text-[var(--text-primary)] font-medium mb-4">
                                Slecht presterend model of Fabric-migratie?
                            </p>
                            <Link href="/tools/readiness-scan" className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all" style={{ color: 'var(--color-sector-data)' }}>
                                Start een Readiness Scan <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="rounded-xl p-6 md:p-8" style={{ backgroundColor: 'rgba(15, 110, 86, 0.05)', borderLeft: '4px solid var(--color-sector-zorg)' }}>
                            <span className="text-[0.7rem] font-semibold tracking-widest uppercase mb-3 block" style={{ color: 'var(--color-sector-zorg)' }}>
                                Voor zorg & overheid
                            </span>
                            <p className="text-[var(--text-primary)] font-medium mb-4">
                                Meerdere locaties, één BI-omgeving.
                            </p>
                            <Link href="/cases/ggdghor" className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all" style={{ color: 'var(--color-sector-zorg)' }}>
                                Bekijk de GGDGHOR case <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
