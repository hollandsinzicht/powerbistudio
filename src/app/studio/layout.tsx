import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Studio — analyseer je Power BI-datamodel | PowerBIStudio',
    description:
        'Upload je semantische model (.pbit of model.bim), krijg direct een analyse met best-practice-checks en stel vragen over je measures, relaties en DAX. Voor Power BI-developers.',
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
