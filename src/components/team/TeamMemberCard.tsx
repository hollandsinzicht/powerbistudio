import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Cpu } from 'lucide-react';
import type { TeamMember } from '@/lib/types/team';
import { TEAM_ACCENT_BORDER, TEAM_ACCENT_COLOR } from '@/lib/types/team';

export default function TeamMemberCard(props: TeamMember) {
  const {
    name,
    role,
    image,
    bio,
    specialties,
    type,
    accent,
    linkHref,
    linkText,
    available,
    tiedToProduct,
  } = props;

  const isAiAgent = type === 'ai-agent';
  const ariaLabel = isAiAgent
    ? `${name} — AI-agent, geen mens`
    : `${name} — ${role}`;

  return (
    <article
      aria-label={ariaLabel}
      className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)] hover:shadow-lg transition-all flex flex-col"
      style={{ borderLeft: `4px solid ${TEAM_ACCENT_BORDER[accent]}` }}
    >
      {/* Avatar */}
      <div className="relative w-24 h-24 md:w-28 md:h-28 mb-5 rounded-2xl overflow-hidden border border-[var(--border)] bg-gray-50">
        <Image
          src={image}
          alt={
            isAiAgent
              ? `${name} — stylized AI-agent avatar (no human portrait)`
              : `${name}`
          }
          fill
          sizes="112px"
          className="object-cover"
        />

        {/* Badge: AI-agent (amber outlined pill) OR founder-availability (green pulse) */}
        {isAiAgent ? (
          <div
            className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border text-[0.65rem] font-semibold shadow-sm"
            style={{
              color: 'var(--accent)',
              borderColor: 'var(--accent)',
            }}
          >
            <Cpu size={11} />
            <span>AI</span>
          </div>
        ) : (
          available && (
            <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-[var(--border)] text-[0.65rem] font-semibold shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[var(--text-primary)]">Beschikbaar</span>
            </div>
          )
        )}
      </div>

      {/* Role label */}
      <span
        className="text-[0.65rem] font-semibold tracking-widest uppercase mb-1"
        style={{ color: TEAM_ACCENT_COLOR[accent] }}
      >
        {isAiAgent ? 'AI-agent' : 'Oprichter'}
      </span>

      {/* Name */}
      <h3 className="text-lg md:text-xl font-display font-bold mb-1 text-[var(--text-primary)]">
        {name}
      </h3>

      {/* Role */}
      <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">
        {role}
      </p>

      {/* Bio */}
      <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4 flex-grow">
        {bio}
      </p>

      {/* Specialties pills */}
      {specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {specialties.map((s) => (
            <span
              key={s}
              className="bg-gray-50 border border-[var(--border)] text-[var(--text-secondary)] px-2 py-0.5 rounded-md text-xs"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Tied-to-product (AI agents only) */}
      {tiedToProduct && (
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          Aangedreven door{' '}
          <Link
            href={tiedToProduct.href}
            className="font-medium hover:underline"
            style={{ color: TEAM_ACCENT_COLOR[accent] }}
          >
            {tiedToProduct.name}
          </Link>
        </p>
      )}

      {/* CTA link */}
      {linkHref && linkText && (
        <Link
          href={linkHref}
          className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all mt-auto"
          style={{ color: TEAM_ACCENT_COLOR[accent] }}
        >
          {linkText} <ArrowRight size={16} />
        </Link>
      )}
    </article>
  );
}
