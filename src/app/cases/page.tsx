import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from 'next';
import { cases } from '@/lib/cases-data';
import CaseFilterBar from '@/components/cases/CaseFilterBar';

export const metadata: Metadata = {
    title: 'Cases — Power BI implementaties in zorg, energie, finance en groothandel | PowerBIStudio.nl',
    description: 'Bewezen Power BI-resultaten: GGDGHOR (25 GGD-regio\'s), Vattenfall, Lyreco, Technische Unie. Van nationaal gezondheidsdataportaal tot Fabric-migratie.',
    alternates: { canonical: 'https://www.powerbistudio.nl/cases' },
};

export default function CasesPage() {
    return (
        <>
            <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-[var(--text-secondary)] mb-4 block">
                            Impact in de praktijk
                        </span>
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                            Bewezen <span className="text-[var(--accent)]">resultaten</span> per sector
                        </h1>
                        <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                            Geen theorie, maar concrete Power BI-implementaties bij organisaties
                            in de publieke sector, energie, finance en groothandel.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12 max-w-5xl">
                    <CaseFilterBar cases={cases} />
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-gray-50 border-t border-[var(--border)]">
                <div className="container mx-auto px-6 md:px-12 text-center max-w-2xl">
                    <h3 className="text-2xl font-display font-bold mb-4">
                        Staat jouw organisatie hier binnenkort?
                    </h3>
                    <p className="text-[var(--text-secondary)] mb-8">
                        Werk je in HR en herken je deze problematiek? Plan een Quick Scan om je bestaande HR-model te laten beoordelen.
                    </p>
                    <Link href="/contact" className="btn-primary inline-flex items-center gap-2 text-lg">
                        Neem contact op <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </>
    );
}
