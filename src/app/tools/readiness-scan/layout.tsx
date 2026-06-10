import type { Metadata } from 'next';

// De pagina zelf is een client component ('use client') en kan geen
// metadata exporteren — vandaar dit server-layout.
export const metadata: Metadata = {
  title: 'HR Analytics Readiness Scan — hoe volwassen is jullie rapportage? | PowerBIStudio',
  description:
    'Beantwoord 10 vragen en zie direct hoe volwassen jullie HR-rapportage in Power BI is — met concrete aanbevelingen per niveau. Gratis, zonder e-mailadres.',
  alternates: { canonical: 'https://www.powerbistudio.nl/tools/readiness-scan' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
