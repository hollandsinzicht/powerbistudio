import Link from 'next/link';
import { ShieldCheck, Search, MessageSquareCode, Trash2, FileUp, Sparkles } from 'lucide-react';
import { getUser } from '@/lib/supabase-server';
import StudioDashboard from '@/components/studio/StudioDashboard';

const STEPS = [
    {
        icon: FileUp,
        title: '1. Upload je model',
        text: 'Een .pbit, model.bim of .tmdl-export. Alleen het schema — tabellen, measures, relaties — geen bedrijfsdata.',
    },
    {
        icon: Search,
        title: '2. Direct een analyse',
        text: 'Best-practice-checks (inactieve relaties, bidirectionele filters, measure-kwaliteit) plus een AI-beoordeling van de architectuur.',
    },
    {
        icon: MessageSquareCode,
        title: '3. Stel vragen',
        text: 'Vraag naar logica, laat measures uitleggen of nieuwe DAX schrijven — gegrond in jóuw tabel- en kolomnamen.',
    },
];

const SECURITY_POINTS = [
    {
        title: 'Alleen metadata',
        text: 'Een .pbit- of .bim-schema bevat tabelnamen, measures en relaties — nooit de data zelf. Alleen wat je zelf in de chat typt, wordt daarnaast bij je project bewaard.',
    },
    {
        title: 'Afgeschermde opslag in de EU',
        text: 'Je model staat in een private opslag binnen de EU, zonder publieke toegang; alleen jouw account kan erbij.',
    },
    {
        title: 'Verwijderen = echt weg',
        text: 'Verwijder je een project, dan wissen we het bestand, de analyse en de chatgeschiedenis permanent.',
    },
];

export default async function StudioPage() {
    const user = await getUser();

    if (user) {
        return (
            <div className="min-h-screen bg-[var(--color-neutral-50)] pt-8 pb-16">
                <StudioDashboard />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-neutral-50)] pt-8 pb-16">
            <div className="container mx-auto px-6 max-w-5xl">
                {/* Hero */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <p className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent-700)]/30 bg-[var(--color-accent-100)]/40 px-3 py-1 text-xs font-medium text-[var(--color-accent-700)] mb-6">
                        <Sparkles size={14} /> Gratis tijdens de beta
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-primary-900)] mb-5">
                        Je Power BI-model, geanalyseerd en bevraagbaar
                    </h1>
                    <p className="text-lg text-[var(--color-neutral-700)] mb-8">
                        Upload je semantische model en krijg direct een eerlijke beoordeling:
                        modelproblemen, measure-kwaliteit en quick wins. Daarna stel je gewoon
                        vragen over je eigen DAX. Gebouwd voor developers, niet voor eindgebruikers.
                    </p>
                    <Link
                        href="/studio/login"
                        className="inline-flex items-center justify-center rounded-md bg-[var(--color-action-600)] hover:bg-[var(--color-action-700)] text-white font-semibold px-6 py-3 transition-colors"
                    >
                        Start gratis — log in met je e-mail
                    </Link>
                </div>

                {/* Hoe het werkt */}
                <div className="grid md:grid-cols-3 gap-6 mb-20">
                    {STEPS.map((step) => (
                        <div key={step.title} className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-6">
                            <step.icon size={22} className="text-[var(--color-primary-700)] mb-3" />
                            <h2 className="font-semibold text-[var(--color-neutral-900)] mb-2">{step.title}</h2>
                            <p className="text-sm text-[var(--color-neutral-700)]">{step.text}</p>
                        </div>
                    ))}
                </div>

                {/* Security */}
                <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-8 mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck size={24} className="text-[var(--color-accent-700)]" />
                        <h2 className="text-xl font-bold text-[var(--color-primary-900)]">
                            Jouw model blijft van jou
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {SECURITY_POINTS.map((point) => (
                            <div key={point.title}>
                                <h3 className="text-sm font-semibold text-[var(--color-neutral-900)] mb-1.5 flex items-center gap-2">
                                    {point.title === 'Verwijderen = echt weg' && (
                                        <Trash2 size={14} className="text-[var(--color-accent-700)]" />
                                    )}
                                    {point.title}
                                </h3>
                                <p className="text-sm text-[var(--color-neutral-700)]">{point.text}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-[var(--color-neutral-500)] mt-6 pt-4 border-t border-[var(--color-neutral-100)]">
                        Voor het beantwoorden van vragen wordt het modelschema (metadata) naar de
                        Anthropic API gestuurd; die gebruikt API-invoer standaard niet voor het
                        trainen van modellen. Zie ook ons{' '}
                        <Link href="/privacy" className="underline underline-offset-2">
                            privacybeleid
                        </Link>
                        .
                    </p>
                </div>

                {/* Beta-voorwaarden */}
                <div className="text-center text-sm text-[var(--color-neutral-500)]">
                    <p>
                        Beta: maximaal 2 projecten en 50 vragen per maand per account.
                        Werkt met .pbit, model.bim en .tmdl — een .pbix exporteer je eerst als
                        Power BI-sjabloon.
                    </p>
                </div>
            </div>
        </div>
    );
}
