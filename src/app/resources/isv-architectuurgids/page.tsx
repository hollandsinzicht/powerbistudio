import type { Metadata } from 'next';
import { SectorBadge } from '@/components/ui';
import LeadCaptureForm from '@/components/lead/LeadCaptureForm';

export const metadata: Metadata = {
    title: 'ISV Architectuurgids — 5 beslissingen vóór dag 1 van embedded Power BI | PowerBIStudio.nl',
    description: '5 beslissingen die je vóór dag 1 moet nemen bij embedded Power BI. SKU-keuze, workspace-patroon, RLS-strategie, Copilot-implicaties, kosteninschatting.',
    alternates: { canonical: 'https://www.powerbistudio.nl/resources/isv-architectuurgids' },
};

const decisions = [
    { title: 'SKU-keuze', desc: 'A-SKU vs F-SKU vs P-SKU — het kostenverschil kan factor 10 zijn.' },
    { title: 'Workspace-patroon', desc: 'Per klant, pooled of tiered — elke keuze heeft gevolgen voor schaalbaarheid.' },
    { title: 'RLS-strategie', desc: 'Multi-tenant Row-Level Security: één fout = data-lek tussen klanten.' },
    { title: 'Copilot-implicaties', desc: 'Copilot werkt niet in embedded. Architectuurkennis blijft noodzakelijk.' },
    { title: 'Kosteninschatting', desc: 'Azure-kosten per klant per maand — voordat de eerste klant live gaat.' },
];

export default function ISVArchitectuurgidsPage() {
    return (
        <>
            <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(83,74,183,0.08),transparent_50%)] pointer-events-none" />
                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <SectorBadge sector="saas" />
                    <h1 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4 max-w-3xl">
                        ISV Architectuurgids
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
                        5 beslissingen die je vóór dag 1 moet nemen bij embedded Power BI.
                        Voorkom architectuurfouten die je jaren achtervolgen.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl">
                        <div>
                            <h2 className="text-xl font-display font-bold mb-6">De 5 beslissingen</h2>
                            <div className="space-y-4">
                                {decisions.map((d, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <span className="shrink-0 w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center" style={{ backgroundColor: '#534AB7' }}>
                                            {i + 1}
                                        </span>
                                        <div>
                                            <h3 className="font-display font-bold text-sm">{d.title}</h3>
                                            <p className="text-[var(--text-secondary)] text-sm">{d.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <LeadCaptureForm
                                vertical="isv"
                                source="architectuurgids"
                                title="Download de architectuurgids (gratis)"
                                description="2-pagina PDF met de 5 beslissingen, technische toelichting en kostenindicaties."
                                buttonText="Download gratis PDF"
                                fields={['name', 'email', 'company']}
                                downloadUrl="/downloads/isv-architectuurgids.pdf"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
