import type { TeamMember, TeamMemberId } from './types/team';

/**
 * Single source of truth voor het team.
 * Power BI Studio is een collectief: Jan Willem (oprichter, mens) +
 * vier transparant gelabelde AI-agents, elk gekoppeld aan een service
 * of tool van de studio.
 */
export const team: TeamMember[] = [
  {
    id: 'jan-willem',
    name: 'Jan Willem den Hollander',
    role: 'Oprichter & Power BI architect',
    type: 'founder',
    image: '/team/jan-willem.jpg',
    bio: '15 jaar Power BI. LSS Black Belt. Oprichter van Power BI Studio. Bouwt de architectuur, stuurt interim data teams aan, en reviewt elke AI-output voordat die bij klanten landt.',
    specialties: [
      'Power BI architectuur',
      'Fabric-migratie',
      'LSS Black Belt',
      'Interim data lead',
      'Publieke sector',
    ],
    available: true,
    accent: 'navy-amber',
    linkHref: '/contact',
    linkText: 'Plan een kennismaking →',
  },
  {
    id: 'nova',
    name: 'NOVA',
    role: 'AI Readiness Scanner',
    type: 'ai-agent',
    image: '/team/nova.png',
    bio: 'NOVA is onze AI voor data-readiness. Beantwoord een aantal vragen en NOVA brengt de volwassenheid van jouw data-organisatie in kaart — governance, modellen, skills, infrastructuur.',
    specialties: [
      'Readiness',
      'Maturity scan',
      'Governance',
      'Benchmark',
    ],
    tiedToProduct: { name: 'Readiness Scan', href: '/tools/readiness-scan' },
    accent: 'blue',
    linkHref: '/tools/readiness-scan',
    linkText: 'Start een Readiness Scan →',
  },
  {
    id: 'ada',
    name: 'ADA',
    role: 'AI DAX-specialist',
    type: 'ai-agent',
    image: '/team/ada.png',
    bio: 'ADA is onze AI DAX-specialist. Beschrijf in gewone taal wat je wilt berekenen — ADA schrijft de formule, legt het patroon uit, en toont varianten.',
    specialties: [
      'DAX',
      'Measure-patronen',
      'Natural-language → formule',
      'Context-aware',
    ],
    tiedToProduct: { name: 'DAX Formula Assistant', href: '/tools/dax-assistant' },
    accent: 'green',
    linkHref: '/tools/dax-assistant',
    linkText: 'Probeer ADA (gratis) →',
  },
  // LEX (Report Auditor agent) is verwijderd in feat/tools-cleanup —
  // Report Auditor is uitgefaseerd in HR-rebrand.
];

export const founders = team.filter((m) => m.type === 'founder');
export const aiAgents = team.filter((m) => m.type === 'ai-agent');

export function getTeamMember(id: TeamMemberId): TeamMember | undefined {
  return team.find((m) => m.id === id);
}
