import Link from "next/link";
import { ArrowRight, Code2, Building2, Heart, Briefcase, Server, Shield, DollarSign } from "lucide-react";
import type { Metadata } from 'next';
import { ProbleemIntro, SectorBadge } from '@/components/ui';

export const metadata: Metadata = {
    title: 'Power BI analytics in jouw SaaS-product — embedded architectuur | PowerBIStudio.nl',
    description: 'Jouw klanten willen dashboards in jouw app, niet in app.powerbi.com. Ik ontwerp de multi-tenant RLS-architectuur die dat mogelijk maakt — veilig, branded, schaalbaar.',
    alternates: { canonical: 'https://www.powerbistudio.nl/saas' },
};

export default function SaaSPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(83,74,183,0.08),transparent_50%)] pointer-events-none" />
                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <SectorBadge sector="saas" />
                    <h1 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4 max-w-3xl">
                        Jouw klanten willen analytics in jouw product. Niet ernaast.
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
                        Ik ontwerp de Power BI Embedded architectuur die dat mogelijk maakt — voordat de eerste klant live gaat.
                    </p>
                </div>
            </section>

            {/* ProbleemIntro */}
            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                    <ProbleemIntro>
                        <p>
                            78% van SaaS-bedrijven embedt analytics in hun product. Maar als de architectuur verkeerd is gebouwd —
                            verkeerd SKU, verkeerde RLS-opzet, verkeerde workspace-structuur — betaal je er jaren voor in
                            performance-problemen en Azure-rekeningen die niet kloppen.
                        </p>
                    </ProbleemIntro>
                </div>
            </section>

            {/* ISV Profielen */}
            <section className="py-20 bg-gray-50 border-y border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">Voor welk type softwarebedrijf?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Code2, title: 'SaaS scale-up', desc: 'Klanten vragen steeds vaker om rapportages in je product. Je wilt embedded analytics, maar de architectuur is nog niet bepaald.' },
                            { icon: Building2, title: 'ERP / branchesoftware', desc: 'Legacy rapportagemodule is verouderd. Power BI biedt een moderne vervanger — maar de integratie moet goed gebouwd worden.' },
                            { icon: Heart, title: 'Zorgsoftware', desc: 'Rapportages per klant met AVG-compliance. Multi-tenant isolatie is geen optie maar een vereiste.' },
                        ].map((p) => (
                            <div key={p.title} className="glass-card rounded-xl p-6 border border-[var(--border)]">
                                <p.icon size={24} style={{ color: 'var(--color-sector-saas)' }} className="mb-4" />
                                <h3 className="text-lg font-display font-bold mb-2">{p.title}</h3>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technische uitleg */}
            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">Wat de meeste ISVs te laat ontdekken</h2>
                    <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
                        {[
                            { icon: Shield, title: 'Multi-tenant RLS', desc: 'Één fout in je Row-Level Security = een data-lek tussen klanten. Dit moet vanaf dag één goed staan.' },
                            { icon: DollarSign, title: 'A-SKU vs P-SKU vs F-SKU', desc: 'Het kostenverschil kan factor 10 zijn. De keuze hangt af van je gebruikspatroon, niet van wat Microsoft adviseert.' },
                            { icon: Server, title: 'Workspace-architectuur', desc: 'Workspace-per-klant vs pooled vs tier. Elke keuze heeft gevolgen voor schaalbaarheid, kosten en beheer.' },
                        ].map((item) => (
                            <div key={item.title} className="flex items-start gap-4">
                                <item.icon size={20} className="shrink-0 mt-1" style={{ color: 'var(--color-sector-saas)' }} />
                                <div>
                                    <h3 className="font-display font-bold mb-1">{item.title}</h3>
                                    <p>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Twee routes */}
            <section className="py-20 bg-gray-50 border-y border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">Twee manieren om te starten</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-card rounded-xl p-8 border border-[var(--border)]" style={{ borderTop: '4px solid #10b981' }}>
                            <h3 className="text-xl font-display font-bold mb-3">Route 1 — DashPortal</h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                                De snelste route. DashPortal geeft je direct een white-label embedded portal,
                                zonder dat je zelf de infrastructuur bouwt.
                            </p>
                            <Link href="/dashportal" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:gap-3 transition-all">
                                Bekijk DashPortal <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="glass-card rounded-xl p-8 border border-[var(--border)]" style={{ borderTop: '4px solid var(--color-sector-saas)' }}>
                            <h3 className="text-xl font-display font-bold mb-3">Route 2 — Maatwerk</h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                                Voor complexere multi-tenant eisen of diepere integratie in jouw eigen platform.
                                Ik ontwerp de architectuur en begeleid de implementatie.
                            </p>
                            <Link href="/contact?type=saas" className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all" style={{ color: 'var(--color-sector-saas)' }}>
                                Plan een architectuurreview <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Engagement funnel */}
            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">Investering</h2>
                    <div className="space-y-4">
                        {[
                            { step: '01', title: 'Discovery & architectuurreview', price: '€2.500 vast' },
                            { step: '02', title: 'Proof of concept (1 tenant)', price: '€5.000–10.000' },
                            { step: '03', title: 'Volledige implementatie', price: '€20.000–80.000' },
                            { step: '04', title: 'Beheer & uitbreiding retainer', price: '€1.500–4.000/maand' },
                        ].map((item) => (
                            <div key={item.step} className="flex items-center gap-4 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                                <span className="text-sm font-mono font-bold" style={{ color: 'var(--color-sector-saas)' }}>{item.step}</span>
                                <span className="flex-grow font-medium">{item.title}</span>
                                <span className="text-sm text-[var(--text-secondary)] font-mono">{item.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-gray-50 border-t border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12 text-center max-w-2xl">
                    <p className="text-xl md:text-2xl font-display font-bold mb-6">
                        Jouw klanten willen analytics in jouw product. Laten we de architectuur bespreken.
                    </p>
                    <Link href="/contact?type=saas" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
                        Plan een architectuurreview <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </>
    );
}
