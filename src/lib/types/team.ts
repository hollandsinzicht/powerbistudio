export type TeamMemberType = 'founder' | 'ai-agent';

export type TeamAccent =
  | 'navy-amber' // Jan Willem — founder
  | 'blue' // NOVA — blue robot
  | 'green' // ADA — green robot
  | 'orange'; // LEX — orange robot

export const TEAM_ACCENT_BORDER: Record<TeamAccent, string> = {
  'navy-amber': 'var(--color-primary-700)',
  blue: 'var(--color-primary-900)',
  green: 'var(--color-accent-700)',
  orange: 'var(--color-action-600)',
};

export const TEAM_ACCENT_COLOR: Record<TeamAccent, string> = {
  'navy-amber': 'var(--color-primary-900)',
  blue: 'var(--color-primary-900)',
  green: 'var(--color-accent-700)',
  orange: 'var(--color-action-600)',
};

export type TeamMemberId = 'jan-willem' | 'nova' | 'ada';

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
