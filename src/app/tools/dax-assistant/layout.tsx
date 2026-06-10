import type { Metadata } from 'next';

// De pagina zelf is een client component ('use client') en kan geen
// metadata exporteren — vandaar dit server-layout.
export const metadata: Metadata = {
  title: 'DAX Formula Assistant — gratis AI-hulp bij DAX-formules | PowerBIStudio',
  description:
    'Beschrijf wat je wilt berekenen en krijg een werkende DAX-formule met uitleg in het Nederlands. Of plak een bestaande formule en laat hem uitleggen. Gratis.',
  alternates: { canonical: 'https://www.powerbistudio.nl/tools/dax-assistant' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
