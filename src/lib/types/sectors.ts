export type Sector = 'zorg' | 'saas' | 'data';
export type PriceTier = 'gratis' | 'betaald' | 'op-aanvraag';

export const SECTOR_COLORS: Record<Sector, string> = {
  zorg: 'var(--color-sector-zorg)',
  saas: 'var(--color-sector-saas)',
  data: 'var(--color-sector-data)',
};

export const SECTOR_HEX: Record<Sector, string> = {
  zorg: '#0F6E56',
  saas: '#534AB7',
  data: '#D85A30',
};

export const SECTOR_LABELS: Record<Sector, string> = {
  zorg: 'Zorg & overheid',
  saas: 'SaaS / ISV',
  data: 'Data teams',
};

export interface CaseStudy {
  slug: string;
  client: string;
  sector: Sector;
  sectorLabel?: string;
  seoTitle: string;
  seoDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  stats: { value: string; label: string }[];
  challenge: string;
  approach: string[];
  whatWeDidNot?: string;
  result: string;
  resultHighlight: string;
  lessons: string[];
  ctaText: string;
  ctaHref: string;
  ctaType?: string;
}
