export type TeamMemberType = 'founder' | 'ai-agent';

export type TeamAccent = 'navy-amber' | 'purple-orange' | 'zorg';

export const TEAM_ACCENT_BORDER: Record<TeamAccent, string> = {
  'navy-amber': 'var(--accent)',
  'purple-orange': 'var(--color-sector-saas)',
  zorg: 'var(--color-sector-zorg)',
};

export const TEAM_ACCENT_COLOR: Record<TeamAccent, string> = {
  'navy-amber': 'var(--primary)',
  'purple-orange': 'var(--color-sector-saas)',
  zorg: 'var(--color-sector-zorg)',
};

export interface TeamMember {
  id: 'jan-willem' | 'ada' | 'lex';
  name: string;
  role: string;
  type: TeamMemberType;
  image: string;
  bio: string;
  specialties: string[];
  tiedToProduct?: { name: string; href: string };
  linkHref?: string;
  linkText?: string;
  accent: TeamAccent;
  available?: boolean;
}
