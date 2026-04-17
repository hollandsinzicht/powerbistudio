import Image from 'next/image';
import Link from 'next/link';
import { Cpu } from 'lucide-react';
import { getTeamMember } from '@/lib/team-data';
import { TEAM_ACCENT_BORDER, TEAM_ACCENT_COLOR } from '@/lib/types/team';
import type { TeamMemberId } from '@/lib/types/team';

interface AgentSignatureProps {
  /** Welke AI-agent hoort bij deze tool */
  agentId: Exclude<TeamMemberId, 'jan-willem'>;
  /** Optionele intro-tekst boven de agent-kaart */
  intro?: string;
  /** Compact (inline) of expanded (als sectieblok) */
  variant?: 'compact' | 'expanded';
}

/**
 * Toont welke AI-agent de tool op deze pagina aandrijft.
 * Maakt de "mens + AI, transparant" framing expliciet op tool-pagina's.
 */
export default function AgentSignature({
  agentId,
  intro = 'Deze tool wordt aangedreven door',
  variant = 'expanded',
}: AgentSignatureProps) {
  const agent = getTeamMember(agentId);
  if (!agent) return null;

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-3 text-sm">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[var(--border)] bg-gray-50 shrink-0">
          <Image src={agent.image} alt={`${agent.name} AI-agent`} fill sizes="32px" className="object-cover" />
        </div>
        <span className="text-[var(--text-secondary)]">
          {intro}{' '}
          <Link
            href="/over"
            className="font-semibold hover:underline"
            style={{ color: TEAM_ACCENT_COLOR[agent.accent] }}
          >
            {agent.name}
          </Link>
          <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.65rem] font-semibold border align-middle" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
            <Cpu size={10} />AI
          </span>
        </span>
      </div>
    );
  }

  return (
    <div
      className="glass-card rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start gap-6"
      style={{ borderLeft: `4px solid ${TEAM_ACCENT_BORDER[agent.accent]}` }}
    >
      {/* Avatar */}
      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-[var(--border)] bg-gray-50 shrink-0">
        <Image src={agent.image} alt={`${agent.name} — AI-agent`} fill sizes="96px" className="object-cover" />
        <div
          className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border text-[0.65rem] font-semibold shadow-sm"
          style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
        >
          <Cpu size={11} />
          <span>AI</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1">
        <p className="text-sm text-[var(--text-secondary)] mb-1">{intro}</p>
        <h3 className="text-xl md:text-2xl font-display font-bold mb-2">
          <Link href="/over" className="hover:underline" style={{ color: TEAM_ACCENT_COLOR[agent.accent] }}>
            {agent.name}
          </Link>
          <span className="text-[var(--text-secondary)] font-normal text-base ml-2">— {agent.role}</span>
        </h3>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-3">{agent.bio}</p>
        <p className="text-xs text-[var(--text-secondary)]">
          Klantinteractie loopt altijd via Jan Willem. {agent.name} werkt onder de motorkap.{' '}
          <Link href="/over" className="font-medium hover:underline" style={{ color: TEAM_ACCENT_COLOR[agent.accent] }}>
            Lees meer over het team →
          </Link>
        </p>
      </div>
    </div>
  );
}
