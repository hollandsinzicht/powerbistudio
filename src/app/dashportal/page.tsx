import Link from "next/link";
import { ArrowRight, ExternalLink, Monitor, Database, ShieldCheck, Users, Clock, Palette, Globe, BarChart3, AlertTriangle, CheckCircle2, ChevronRight, TrendingUp, DollarSign, Ban } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'DashPortal — branded Power BI portaal voor organisaties en ISVs | PowerBIStudio.nl',
    description: 'Deel Power BI dashboards via een eigen branded portaal. Voor interne teams én voor softwarebedrijven die analytics willen embedden in hun product. Geen Microsoft-licentie voor eindgebruikers.',
    alternates: { canonical: 'https://www.powerbistudio.nl/dashportal' },
};

const painPoints = [
    {
        icon: Users,
        title: "Microsoft-account verplicht",
        description: "Externe gebruikers begrijpen niet waarom ze een Microsoft-licentie nodig hebben alleen om een rapport te bekijken.",
    },
    {
        icon: Monitor,
        title: "Verwarrende interface",
        description: "Te veel menu's, knoppen en opties. Klanten raken verdwaald en stellen steeds dezelfde vragen.",
    },
    {
        icon: Palette,
        title: "Geen eigen branding",
        description: "Je stuurt klanten naar app.powerbi.com — niet bepaald een visitekaartje.",
    },
    {
        icon: ShieldCheck,
        title: "Toegangsbeheer is complex",
        description: "Row-level security instellen kost uren, en je hebt geen overzicht van wie toegang heeft tot welk rapport.",
    },
    {
        icon: AlertTriangle,
        title: "Geen zicht op datakwaliteit",
        description: "Wanneer is een dataset voor het laatst vernieuwd? Zijn er fouten? Je ontdekt het pas als een klant klaagt.",
    },
    {
        icon: Clock,
        title: "Handmatig gebruikersbeheer",
        description: "Elke nieuwe gebruiker, elk nieuw rapport — handmatig proces van licenties, rechten en e-mails.",
    },
];

const pillars = [
    {
        icon: Globe,
        title: "Branded Report Portal",
        color: "#10b981",
        features: [
            "Eigen logo, kleuren en domein",
            "Overzichtelijke tegel-interface per workspace",
            "Row-level security integratie",
            "Gebruikersbeheer via e-mail",
            "Microsoft SSO authenticatie",
        ],
    },
    {
        icon: Database,
        title: "Metadata Management",
        color: "#3b82f6",
        features: [
            "Automatische synchronisatie van workspaces en rapporten",
            "Dataset-eigenaarschap en verversingstatus",
            "Workspace-configuratie in één dashboard",
            "Wijzigingsgeschiedenis en audit trail",
        ],
    },
    {
        icon: BarChart3,
        title: "Data Hygiene Monitoring",
        color: "#f59e0b",
        features: [
            "Hygiëne-score per workspace",
            "Alerts bij mislukte dataset-verversingen",
            "Detectie van ongebruikte rapporten",
            "RLS-configuratie monitoring",
            "Datakwaliteit tracking",
        ],
    },
];

const steps = [
    { number: "01", title: "Kies je plan", description: "Start een gratis trial van 14 dagen. Geen creditcard nodig." },
    { number: "02", title: "Koppel Power BI", description: "Verbind je Microsoft-account. Workspaces en rapporten worden automatisch gesynchroniseerd." },
    { number: "03", title: "Style je portaal", description: "Upload je logo, kies je kleuren en koppel je eigen domein. Klaar in 2 minuten." },
    { number: "04", title: "Nodig gebruikers uit", description: "Voeg gebruikers toe via e-mail of Azure AD. Stel per persoon de rapporttoegang in." },
    { number: "05", title: "Ga live", description: "Deel de link met klanten of collega's. Zij hebben direct toegang." },
];

export default function DashPortalPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.06),transparent_50%)]" />

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-[rgba(16,185,129,0.1)] text-[#10b981] text-sm font-mono px-4 py-1.5 border border-[rgba(16,185,129,0.2)] rounded mb-8">
                            <ExternalLink size={14} />
                            Nu beschikbaar — start in 10 minuten
                        </div>

                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
                            Jouw eigen dataportaal voor <span className="text-[#10b981]">Power BI</span>
                        </h1>

                        <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mb-10">
                            Deel Power BI rapporten met klanten en collega&apos;s via een professioneel, branded portaal — met je eigen logo, kleuren en domein. Inclusief metadatabeheer en data-hygiëne monitoring.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://dashportal.app/onboarding/plan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3.5"
                            >
                                Start gratis trial <ArrowRight size={20} />
                            </a>
                            <a
                                href="https://dashportal.app/demo"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-3.5"
                            >
                                Bekijk live demo <ExternalLink size={18} />
                            </a>
                        </div>

                        <p className="text-sm text-[var(--text-secondary)] mt-6">
                            Geen creditcard nodig · Binnen 10 minuten live · Altijd opzegbaar
                        </p>
                    </div>
                </div>
            </section>

            {/* Doelgroep-splitsing */}
            <section className="py-12 border-b border-[var(--border)] bg-gray-50">
                <div className="container mx-auto px-6 md:px-12">
                    <p className="text-center text-[var(--text-secondary)] mb-6 font-medium">Voor welke situatie zoek je een oplossing?</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="#intern-gebruik" className="btn-secondary inline-flex items-center gap-2 px-6 py-3">
                            Intern dashboards delen
                        </a>
                        <a href="#embedded-kosten" className="btn-secondary inline-flex items-center gap-2 px-6 py-3">
                            Embedded te duur geworden?
                        </a>
                        <a href="#isv-gebruik" className="btn-secondary inline-flex items-center gap-2 px-6 py-3">
                            Analytics voor mijn klanten
                        </a>
                    </div>
                </div>
            </section>

            {/* Pain Points Section */}
            <section className="py-24 bg-[var(--surface)] border-y border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-2xl mb-16">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Herken je dit?</h2>
                        <p className="text-[var(--text-secondary)] text-lg">
                            Power BI is krachtig, maar het delen van rapporten met externe gebruikers is dat niet.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {painPoints.map((point) => (
                            <div key={point.title} className="border border-[var(--border)] bg-[var(--background)] p-6 rounded-xl">
                                <point.icon size={24} className="text-[var(--text-secondary)] mb-4" />
                                <h3 className="font-display font-bold mb-2">{point.title}</h3>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{point.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Solution Statement */}
            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-3xl">
                        <p className="text-2xl md:text-3xl font-display font-bold leading-snug">
                            Eén platform dat Power BI rapporten omzet naar een{" "}
                            <span className="text-[#10b981]">professioneel klantportaal</span>{" "}
                            — zonder technische kennis, binnen 10 minuten.
                        </p>
                    </div>
                </div>
            </section>

            {/* Three Pillars */}
            <section className="py-24 bg-[var(--surface)] border-y border-[var(--border)] relative overflow-hidden">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-[#10b981] rounded-full blur-[150px] opacity-10 pointer-events-none" />

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="max-w-2xl mb-16">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Alles wat je nodig hebt</h2>
                        <p className="text-[var(--text-secondary)] text-lg">
                            Drie pijlers die samen zorgen voor een professionele en beheersbare data-ervaring.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {pillars.map((pillar) => (
                            <div
                                key={pillar.title}
                                className="group border border-[var(--border)] bg-[var(--background)] p-8 rounded-xl hover:shadow-lg transition-all"
                                style={{ ["--pillar-color" as string]: pillar.color }}
                            >
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                                    style={{ backgroundColor: `${pillar.color}15` }}
                                >
                                    <pillar.icon size={24} style={{ color: pillar.color }} />
                                </div>

                                <h3 className="text-xl font-display font-bold mb-6">{pillar.title}</h3>

                                <ul className="space-y-3">
                                    {pillar.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-[var(--text-secondary)] text-sm">
                                            <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: pillar.color }} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-2xl mb-16">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">In 5 stappen live</h2>
                        <p className="text-[var(--text-secondary)] text-lg">
                            Van aanmelding tot een werkend portaal in minder dan 10 minuten.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-6">
                        {steps.map((step) => (
                            <div key={step.number} className="flex gap-6 items-start border border-[var(--border)] bg-[var(--surface)] p-6 rounded-xl">
                                <span className="text-3xl font-mono font-bold text-[#10b981] shrink-0">{step.number}</span>
                                <div>
                                    <h3 className="font-display font-bold mb-1">{step.title}</h3>
                                    <p className="text-[var(--text-secondary)] text-sm">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-16 bg-[var(--surface)] border-y border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-3xl">
                        <blockquote className="border-l-4 border-[#10b981] pl-6 py-2">
                            <p className="text-lg text-[var(--text-secondary)] leading-relaxed italic">
                                &ldquo;DashPortal is ontwikkeld door Power BI Studio — met jarenlange ervaring in het bouwen van Power BI oplossingen voor organisaties in heel Nederland. We kennen de uitdagingen, want we lossen ze dagelijks op voor onze klanten.&rdquo;
                            </p>
                        </blockquote>
                    </div>
                </div>
            </section>

            {/* Embedded kosten-realiteit */}
            <section id="embedded-kosten" className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-4xl">
                        <span className="text-[0.7rem] font-semibold tracking-widest uppercase mb-4 block text-red-500">
                            De embedded-kostenvalkuil
                        </span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                            Microsoft maakt Power BI Embedded onbetaalbaar voor mid-market ISVs
                        </h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
                            Als je Power BI-rapporten wilt tonen aan gebruikers buiten jouw organisatie — klanten van een SaaS-product,
                            of een portaal voor externe partijen — gebruik je Power BI Embedded. De eindgebruiker heeft zelf geen licentie nodig.
                            Tot voor kort was dat betaalbaar. Dat is het niet meer.
                        </p>

                        {/* Vroeger vs nu */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-xl">
                                <h3 className="font-display font-bold mb-3 flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-green-500" /> Hoe het was
                                </h3>
                                <ul className="text-[var(--text-secondary)] text-sm leading-relaxed space-y-2">
                                    <li><strong>A-SKUs</strong> (Azure, pay-as-you-go) — flexibel, uur-gebaseerd. Begin op A1 voor circa &euro;700/maand.</li>
                                    <li><strong>EM-SKUs</strong> (via Microsoft 365) — goedkoper instapniveau, breed gebruikt voor portaal-toepassingen.</li>
                                    <li>Een kleine ISV kon betaalbaar starten en doorgroeien.</li>
                                </ul>
                            </div>
                            <div className="border border-red-200 bg-red-50 p-6 rounded-xl">
                                <h3 className="font-display font-bold mb-3 flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-red-500" /> Wat er is veranderd
                                </h3>
                                <ul className="text-[var(--text-secondary)] text-sm leading-relaxed space-y-2">
                                    <li>EM-SKUs zijn <strong>afgeschaft</strong>. A-SKUs zijn herzien.</li>
                                    <li>De vervanging is de <strong>F-SKU</strong> (Fabric capacity).</li>
                                    <li>Minimum voor embedding: <strong>F64 — circa &euro;6.000&ndash;&euro;8.000/maand</strong>.</li>
                                    <li>Zonder hoge capaciteit: elke externe gebruiker heeft een <strong>Pro-licentie</strong> nodig.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Drie pijnpunten */}
                        <h3 className="text-xl font-display font-bold mb-6">De drie pijnpunten voor ISVs</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-xl">
                                <TrendingUp size={24} className="text-red-500 mb-3" />
                                <h4 className="font-display font-bold text-sm mb-2">Kostendrempel omhoog</h4>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                    De laagste Fabric-capaciteit die embedding ondersteunt voor externe gebruikers
                                    ligt een factor 8&ndash;10 hoger dan voorheen. Kleine ISVs worden de markt uitgeduwd.
                                </p>
                            </div>
                            <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-xl">
                                <DollarSign size={24} className="text-red-500 mb-3" />
                                <h4 className="font-display font-bold text-sm mb-2">Per-user licenties</h4>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                    Zonder hoge capaciteit moet elke externe klant-gebruiker een eigen Pro-licentie hebben.
                                    Bij honderden of duizenden eindgebruikers is dat financieel onhaalbaar.
                                </p>
                            </div>
                            <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-xl">
                                <Ban size={24} className="text-red-500 mb-3" />
                                <h4 className="font-display font-bold text-sm mb-2">Korte aankondigingstermijnen</h4>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                    ISVs worden met weinig aankondiging geconfronteerd met het afschaffen van SKUs.
                                    Lopende klantcontracten kunnen niet snel genoeg worden aangepast.
                                </p>
                            </div>
                        </div>

                        {/* DashPortal als antwoord */}
                        <div className="border-l-4 border-[#10b981] bg-[rgba(16,185,129,0.04)] rounded-r-xl p-6 md:p-8">
                            <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                                <Globe size={20} className="text-[#10b981]" /> Waarom ISVs naar DashPortal kijken
                            </h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                                Dit is precies het landschap waar DashPortal in opereert. De kostenpijn bij embedding
                                is de marktopening: ISVs zoeken alternatieven voor rechtstreekse Power BI Embedded
                                omdat de Microsoft-route te duur of te complex wordt.
                            </p>
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                                DashPortal biedt een white-label portaal dat de complexiteit wegneemt en de
                                licentiekosten beheersbaar maakt. Geen F64 nodig. Geen Pro-licenties voor
                                eindgebruikers. Live in 10 minuten.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ISV Sectie */}
            <section id="isv-gebruik" className="py-24 bg-gray-50 border-y border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-4xl mx-auto">
                        <span className="text-[0.7rem] font-semibold tracking-widest uppercase mb-4 block" style={{ color: '#534AB7' }}>
                            ISV & agency
                        </span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                            Voor softwarebedrijven en consultants
                        </h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed mb-10 max-w-2xl">
                            Jouw klanten verwachten analytics in jouw product — niet in een
                            apart Microsoft-portaal met een login die ze niet begrijpen.
                            DashPortal biedt een white-label laag: jouw branding, jouw domein,
                            jouw klantportalen.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-xl">
                                <h3 className="font-display font-bold mb-2">White-label per klant</h3>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                    Elk klantportaal heeft eigen logo, kleuren en domein. De klant ziet alleen jouw product.
                                </p>
                            </div>
                            <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-xl">
                                <h3 className="font-display font-bold mb-2">Multi-tenant architectuur</h3>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                    Workspaces per klant, RLS-isolatie, gebruikersbeheer via API.
                                    Schaalbaar van 10 naar 1.000 klanten.
                                </p>
                            </div>
                            <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-xl">
                                <h3 className="font-display font-bold mb-2">Agency-programma</h3>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                    Consultant of BI-bureau? Bied DashPortal aan als onderdeel van
                                    jouw dienstverlening. Eigen pricing, eigen klantrelatie.
                                </p>
                            </div>
                        </div>

                        {/* Vergelijkingstabel */}
                        <h3 className="text-xl font-display font-bold mb-4">DashPortal vs. alternatieven</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border border-[var(--border)] rounded-xl overflow-hidden">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left p-3 font-medium text-[var(--text-secondary)]"></th>
                                        <th className="text-left p-3 font-medium text-[#10b981]">DashPortal</th>
                                        <th className="text-left p-3 font-medium text-[var(--text-secondary)]">Zelf bouwen</th>
                                        <th className="text-left p-3 font-medium text-[var(--text-secondary)]">PBI Embedded direct</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {[
                                        ['Tijd tot live', '< 10 minuten', '3-6 maanden', '2-4 weken'],
                                        ['MS-licentie eindgebruiker', 'Niet nodig', 'Niet nodig', 'Niet nodig'],
                                        ['White-label', 'Ja', 'Ja', 'Gedeeltelijk'],
                                        ['Multi-tenant RLS', 'Ingebouwd', 'Zelf bouwen', 'Zelf bouwen'],
                                        ['Technische kennis', 'Geen', 'Hoog', 'Gemiddeld'],
                                        ['Maandelijkse kosten', 'Laag', 'Hoog (dev-uren)', 'Gemiddeld'],
                                    ].map(([label, d, z, p]) => (
                                        <tr key={label} className="hover:bg-gray-50">
                                            <td className="p-3 font-medium text-[var(--text-primary)]">{label}</td>
                                            <td className="p-3 text-[#10b981] font-medium">{d}</td>
                                            <td className="p-3 text-[var(--text-secondary)]">{z}</td>
                                            <td className="p-3 text-[var(--text-secondary)]">{p}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_60%)]" />

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Klaar om te starten?</h2>
                        <p className="text-xl text-[var(--text-secondary)] mb-10">
                            Maak in enkele minuten een branded dataportaal voor jouw organisatie.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="https://dashportal.app/onboarding/plan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3.5"
                            >
                                Start 14 dagen gratis <ArrowRight size={20} />
                            </a>
                            <Link
                                href="/contact"
                                className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-3.5"
                            >
                                Neem contact op <ChevronRight size={18} />
                            </Link>
                        </div>

                        <p className="text-sm text-[var(--text-secondary)] mt-6">
                            Geen creditcard nodig · Binnen 10 minuten live · Altijd opzegbaar
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
