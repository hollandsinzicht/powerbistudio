export type TeamMemberType = 'founder' | 'ai-agent';

export type TeamAccent =
  | 'navy-amber' // Jan Willem — founder
  | 'blue' // NOVA — blue robot
  | 'green' // ADA — green robot
  | 'orange'; // LEX — orange robot

export const TEAM_ACCENT_BORDER: Record<TeamAccent, string> = {
  'navy-amber': 'var(--accent)',
  blue: 'var(--primary)',
  green: 'var(--color-sector-zorg)',
  orange: 'var(--color-sector-data)',
};

export const TEAM_ACCENT_COLOR: Record<TeamAccent, string> = {
  'navy-amber': 'var(--primary)',
  blue: 'var(--primary)',
  green: 'var(--color-sector-zorg)',
  orange: 'var(--color-sector-data)',
};

export type TeamMemberId = 'jan-willem' | 'nova' | 'ada' | 'lex';

export interface TeamMember {
  id: TeamMemberId;
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
