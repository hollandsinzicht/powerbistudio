import type { Metadata } from 'next';

// De contactpagina zelf is een client-component (formulier + Cal-embed) en kan
// daarom geen `metadata` exporteren. Deze server-side layout vult dat gat.
export const metadata: Metadata = {
  title: 'Contact — plan een Quick Scan of verkennend gesprek | PowerBIStudio',
  description:
    'Neem contact op voor een HR Analytics Quick Scan (€1.950), een DashPortal HR-demo of een verkennend gesprek. Reactie binnen één werkdag.',
  alternates: { canonical: 'https://www.powerbistudio.nl/contact' },
  openGraph: {
    title: 'Contact — PowerBIStudio',
    description:
      'Plan een HR Analytics Quick Scan, DashPortal HR-demo of verkennend gesprek.',
    url: 'https://www.powerbistudio.nl/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
