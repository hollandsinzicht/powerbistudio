import type { Metadata } from 'next';
import { SectorBadge } from '@/components/ui';
import LeadCaptureForm from '@/components/lead/LeadCaptureForm';

export const metadata: Metadata = {
    title: 'BI-Checklist voor de publieke sector — 12 vragen vóór aanbesteding | PowerBIStudio.nl',
    description: '12 vragen die een gemeente of GGD moet stellen vóór aanbesteding van een BI-consultant. Over AVG, RLS, multi-locatie, governance en overdracht. Gratis PDF.',
    alternates: { canonical: 'https://www.powerbistudio.nl/resources/publieke-sector-checklist' },
};

const checklistItems = [
    'AVG-compliance en privacy by design',
    'Row-Level Security per locatie of regio',
    'Multi-locatie datamodel-architectuur',
    'Governance en data-eigenaarschap',
    'Deployment pipelines en change management',
    'Overdrachtsprotocol en documentatie',
    'Licentiemodel en kostenstructuur',
    'Aansluitbaarheid op bestaande systemen',
    'Monitoring en data-hygiëne',
    'Rapportage-eisen per doelgroep',
    'Training en adoptie-aanpak',
    'Escalatieprocedure bij datakwaliteitsproblemen',
];

export default function PubliekeSectorChecklistPage() {
    return (
        <>
            <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,110,86,0.08),transparent_50%)] pointer-events-none" />
                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <SectorBadge sector="zorg" />
                    <h1 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4 max-w-3xl">
                        BI-Checklist voor de publieke sector
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
                        12 vragen die een gemeente, GGD of veiligheidsregio moet stellen
                        vóór aanbesteding van een BI-consultant. Gebaseerd op ervaring met
                        het GGDGHOR-project (25 GGD-regio&apos;s + RIVM).
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl">
                        {/* Inhoud preview */}
                        <div>
                            <h2 className="text-xl font-display font-bold mb-6">Wat zit erin?</h2>
                            <div className="space-y-3">
                                {checklistItems.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <span className="shrink-0 w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-mono mt-0.5" style={{ backgroundColor: '#0F6E56' }}>
                                            {i + 1}
                                        </span>
                                        <span className="text-[var(--text-secondary)] text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Download formulier */}
                        <div>
                            <LeadCaptureForm
                                vertical="publieke-sector"
                                source="checklist"
                                title="Download de checklist (gratis)"
                                description="Ontvang de PDF met alle 12 vragen, inclusief toelichting en aandachtspunten per vraag."
                                buttonText="Download gratis PDF"
                                fields={['name', 'email', 'company']}
                                downloadUrl="/downloads/publieke-sector-checklist.pdf"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
