import type { Metadata } from 'next';
import DaxTemplateClient from './DaxTemplateClient';

export const metadata: Metadata = {
  // Exclusieve pagina voor wie de AVG-checklist HR heeft gedownload.
  // Niet in sitemap, niet in nav. Bewust geen index voor SEO — dit is
  // een bonus voor de funnel, niet content voor zoekverkeer.
  title: 'DAX-templates voor HR Power BI | PowerBIStudio',
  description:
    'Drie DAX-measures voor HR-rapportage: hi\u00ebrarchische RLS, verzuim met peildatum en formatie-realisatie. Exclusief voor checklist-downloaders.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://www.powerbistudio.nl/templates/dax-hr' },
};

export default function DaxHRTemplatePage() {
  return <DaxTemplateClient />;
}
