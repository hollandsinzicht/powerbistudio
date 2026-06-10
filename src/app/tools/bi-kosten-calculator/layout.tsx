import type { Metadata } from 'next';

// De pagina zelf is een client component ('use client') en kan geen
// metadata exporteren — vandaar dit server-layout.
export const metadata: Metadata = {
  title: 'HR Rapportage-kosten Calculator — wat kost handmatig rapporteren? | PowerBIStudio',
  description:
    'Bereken wat handmatige HR-rapportage je organisatie jaarlijks kost aan uren en fouten. Direct resultaat, met concreet advies per kostenniveau.',
  alternates: { canonical: 'https://www.powerbistudio.nl/tools/bi-kosten-calculator' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
