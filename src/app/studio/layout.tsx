import type { Metadata } from 'next';
import { getUser } from '@/lib/supabase-server';
import StudioShell from '@/components/studio/StudioShell';

export const metadata: Metadata = {
    title: 'Studio — analyseer je Power BI-datamodel | PowerBIStudio',
    description:
        'Upload je semantische model (.pbit of model.bim), krijg direct een analyse met best-practice-checks en stel vragen over je measures, relaties en DAX. Voor Power BI-developers.',
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
    const user = await getUser();
    return <StudioShell email={user?.email ?? null}>{children}</StudioShell>;
}
