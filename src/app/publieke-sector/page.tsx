import Link from "next/link";
import { ArrowRight, Shield, Building, Users, Lock } from "lucide-react";
import type { Metadata } from 'next';
import { ProbleemIntro, SectorBadge, StatBlok } from '@/components/ui';

export const metadata: Metadata = {
    title: 'Power BI voor zorg en overheid — multi-regio, AVG-compliant | PowerBIStudio.nl',
    description: 'Rapportages voor gemeenten, GGD\'s, veiligheidsregio\'s en zorginstellingen. Bewezen aanpak: 25 GGD-regio\'s + RIVM. Multi-tenant RLS, AVG-governance, publieke sector architectuur.',
    alternates: { canonical: 'https://www.powerbistudio.nl/publieke-sector' },
};

export default function PubliekeSectorPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,110,86,0.08),transparent_50%)] pointer-events-none" />
                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <SectorBadge sector="zorg" />
                    <h1 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4 max-w-3xl">
                        Rapportages voor de publieke sector vereisen meer dan een goed dashboard.
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
                        AVG-compliance, multi-locatie RLS en governance die gecontroleerd wordt.
                        Bewezen in de Nederlandse publieke sector.
                    </p>
                </div>
            </section>

            {/* Referentieblok */}
            <section className="py-12 bg-gray-50 border-b border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12 text-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-6">
                        <StatBlok value="25" label="GGD-regio's" />
                        <StatBlok value="RIVM" label="Direct aangesloten" />
                        <StatBlok value="1" label="Gedeeld datamodel" />
                        <StatBlok value="Realtime" label="Rapportage" />
                    </div>
                    <Link href="/cases/ggdghor" className="inline-flex items-center gap-2 font-medium hover:gap-3 transition-all" style={{ color: 'var(--color-sector-zorg)' }}>
                        Lees de GGDGHOR casepagina <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* Doelgroepen */}
            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">Voor welke organisaties</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Building, label: 'Gemeenten en provincies' },
                            { icon: Shield, label: 'GGD\'s en veiligheidsregio\'s' },
                            { icon: Users, label: 'GGZ-instellingen en ziekenhuizen' },
                            { icon: Lock, label: 'Rijksoverheid en uitvoeringsorganisaties' },
                        ].map((d) => (
                            <div key={d.label} className="glass-card rounded-xl p-6 border border-[var(--border)] text-center">
                                <d.icon size={28} style={{ color: 'var(--color-sector-zorg)' }} className="mx-auto mb-3" />
                                <p className="font-medium text-sm">{d.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Drie kernthema's */}
            <section className="py-20 bg-gray-50 border-y border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">Wat anders is in de publieke sector</h2>
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-display font-bold mb-2">AVG & datasoevereiniteit</h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                                Data van burgers en patiënten heeft andere vereisten dan commerciële data.
                                Ik bouw modellen waar privacy by design geen optie is, maar een architectuurvereiste.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-display font-bold mb-2">Multi-locatie governance</h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                                Meerdere vestigingen of regio&apos;s die elk eigen data hebben maar ook een gedeeld
                                landelijk beeld nodig hebben. Dat vereist een RLS-model dat je één keer goed ontwerpt.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-display font-bold mb-2">Aanbesteding & documentatie</h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                                Publieke sector vraagt om documentatie, architectuuroverzichten en overdrachtsprotocollen.
                                Die lever ik standaard op.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Militaire achtergrond */}
            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                    <blockquote className="border-l-4 pl-6 py-2" style={{ borderColor: 'var(--color-sector-zorg)' }}>
                        <p className="text-[var(--text-secondary)] leading-relaxed italic">
                            Naast mijn BI-ervaring heb ik een achtergrond bij het Ministerie van Defensie,
                            inclusief een internationale uitzending. Ik ken de cultuur en eisen van
                            overheidsorganisaties van binnenuit.
                        </p>
                    </blockquote>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-gray-50 border-t border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12 text-center max-w-2xl">
                    <p className="text-xl md:text-2xl font-display font-bold mb-6">
                        Werkt jouw organisatie in de publieke sector?
                    </p>
                    <Link href="/contact?type=publieke-sector" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
                        Bespreek jouw situatie <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </>
    );
}
