import Link from 'next/link';
import {
  ArrowRight, FileSearch, BrainCircuit, Zap, ClipboardCheck, Globe,
  Calculator, Wrench, MessageSquare, Users
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Category } from '@/lib/soro';

interface CTAItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

interface WeightedKW { term: string; weight: number }
interface ScoredCTA { cta: CTAItem; keywords: WeightedKW[] }

// --- Lead Magnet Pool (slot 1) ---
const LEAD_MAGNETS: ScoredCTA[] = [
  {
    cta: { title: 'AVG-checklist HR-data', description: 'Wie mag welke personeelsdata zien? Borg RLS en AVG in 12 stappen.', href: '/avg-checklist-hr', icon: ClipboardCheck, color: '#0E7C66' },
    keywords: [
      { term: 'avg', weight: 3 }, { term: 'privacy', weight: 3 }, { term: 'gdpr', weight: 3 },
      { term: 'rls', weight: 3 }, { term: 'row-level security', weight: 3 }, { term: 'autorisatie', weight: 3 },
      { term: 'compliance', weight: 2 }, { term: 'toegang', weight: 2 },
    ],
  },
  {
    cta: { title: 'DAX-templates voor HR', description: 'Kant-en-klare measures voor verloop, verzuim en instroom.', href: '/templates/dax-hr', icon: BrainCircuit, color: '#13315C' },
    keywords: [
      { term: 'dax', weight: 3 }, { term: 'measure', weight: 2 }, { term: 'formule', weight: 2 },
      { term: 'verloop', weight: 3 }, { term: 'verzuim', weight: 3 }, { term: 'instroom', weight: 2 },
      { term: 'calculated column', weight: 2 }, { term: 'filter context', weight: 2 },
    ],
  },
  {
    cta: { title: 'BI-Kosten Calculator', description: 'Bereken wat versnipperde HR-data jouw organisatie per maand kost.', href: '/tools/bi-kosten-calculator', icon: Calculator, color: '#B8963E' },
    keywords: [
      { term: 'kosten', weight: 3 }, { term: 'roi', weight: 3 }, { term: 'business case', weight: 3 },
      { term: 'budget', weight: 2 }, { term: 'besparing', weight: 2 }, { term: 'handwerk', weight: 2 },
    ],
  },
  {
    // Fallback lead magnet
    cta: { title: 'Readiness Scan', description: 'Hoe ver staat jouw HR-data? Beantwoord 10 vragen.', href: '/tools/readiness-scan', icon: FileSearch, color: '#1E3A5F' },
    keywords: [
      { term: 'beginnen', weight: 2 }, { term: 'starten', weight: 2 }, { term: 'volwassenheid', weight: 3 },
      { term: 'maturity', weight: 3 }, { term: 'roadmap', weight: 2 }, { term: 'overstappen', weight: 2 },
    ],
  },
];

// --- Service CTA Pool (slot 2) ---
const SERVICE_CTAS: ScoredCTA[] = [
  {
    cta: { title: 'HR-Analytics', description: 'Verloop, verzuim en bezetting in \u00e9\u00e9n betrouwbaar dashboard.', href: '/hr-analytics', icon: Users, color: '#0E7C66' },
    keywords: [
      { term: 'hr', weight: 3 }, { term: 'personeel', weight: 3 }, { term: 'medewerker', weight: 2 },
      { term: 'verloop', weight: 3 }, { term: 'verzuim', weight: 3 }, { term: 'bezetting', weight: 2 },
      { term: 'instroom', weight: 2 }, { term: 'uitstroom', weight: 2 }, { term: 'afas', weight: 3 },
      { term: 'visma', weight: 3 }, { term: 'nmbrs', weight: 3 },
    ],
  },
  {
    cta: { title: 'De methodiek', description: 'Betrouwbare HR-data: \u00e9\u00e9n bron, historie via SCD2, RLS op orde.', href: '/methodiek', icon: Wrench, color: '#13315C' },
    keywords: [
      { term: 'scd2', weight: 3 }, { term: 'historie', weight: 3 }, { term: 'datamodel', weight: 2 },
      { term: 'star schema', weight: 2 }, { term: 'bronnen', weight: 2 }, { term: 'rls', weight: 2 },
      { term: 'datakwaliteit', weight: 3 },
    ],
  },
  {
    cta: { title: 'DashPortal', description: 'Veilig HR-dashboards delen met managers \u2014 RLS per leidinggevende.', href: '/dashportal', icon: Globe, color: '#534AB7' },
    keywords: [
      { term: 'embedded', weight: 3 }, { term: 'portaal', weight: 3 }, { term: 'delen', weight: 2 },
      { term: 'leidinggevende', weight: 3 }, { term: 'manager', weight: 2 }, { term: 'self-service', weight: 2 },
    ],
  },
  {
    cta: { title: 'Quick Scan', description: 'In 1,5 dag inzicht in je HR-datamodel en een concrete actielijst.', href: '/quick-scan', icon: Zap, color: '#E07A2C' },
    keywords: [
      { term: 'quick scan', weight: 3 }, { term: 'audit', weight: 3 }, { term: 'pbix', weight: 2 },
      { term: 'performance', weight: 2 }, { term: 'traag', weight: 2 }, { term: 'langzaam', weight: 2 },
      { term: 'optimalisatie', weight: 2 },
    ],
  },
  {
    // Fallback — always scores 0
    cta: { title: 'Neem contact op', description: 'Plan een verkennend gesprek om te bespreken hoe ik je HR-rapportage kan helpen verbeteren.', href: '/contact?type=verkennend', icon: MessageSquare, color: '#1E3A5F' },
    keywords: [],
  },
];

// --- Scoring ---

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

function score(s: ScoredCTA, text: string): number {
  return s.keywords.reduce((t, kw) => t + (text.includes(kw.term) ? kw.weight : 0), 0);
}

function selectCTAs(title: string, excerpt: string, content: string | null): [CTAItem, CTAItem] {
  const parts = [title, title, excerpt, excerpt];
  if (content) parts.push(stripHtml(content));
  const text = parts.join(' ').toLowerCase();

  const leads = LEAD_MAGNETS.map((lm) => ({ cta: lm.cta, score: score(lm, text) })).sort((a, b) => b.score - a.score);
  const services = SERVICE_CTAS.map((sc) => ({ cta: sc.cta, score: score(sc, text) })).sort((a, b) => b.score - a.score);

  const bestLead = leads[0]?.score > 0 ? leads[0].cta : LEAD_MAGNETS[LEAD_MAGNETS.length - 1].cta;
  const bestService = services[0]?.score > 0 ? services[0].cta : SERVICE_CTAS[SERVICE_CTAS.length - 1].cta;

  if (bestLead.href === bestService.href) {
    const alt = services.find((s) => s.cta.href !== bestLead.href);
    return [bestLead, alt?.cta ?? SERVICE_CTAS[SERVICE_CTAS.length - 1].cta];
  }
  return [bestLead, bestService];
}

// --- Component ---

interface BlogCTAProps {
  categories: Category[];
  title: string;
  excerpt: string;
  content: string | null;
}

export default function BlogCTA({ title, excerpt, content }: BlogCTAProps) {
  const [leadCta, serviceCta] = selectCTAs(title, excerpt, content);
  const ctas = [leadCta, serviceCta];

  return (
    <div className="mt-16 pt-12 border-t border-[var(--border)]">
      <p className="text-[0.7rem] font-semibold tracking-widest uppercase text-[var(--text-secondary)] mb-6">
        Gerelateerde tools & resources
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ctas.map((cta) => {
          const Icon = cta.icon;
          return (
            <Link
              key={cta.href}
              href={cta.href}
              className="glass-card rounded-xl p-6 border border-[var(--border)] hover:border-[var(--accent)] transition-all group flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cta.color}15` }}>
                <Icon size={20} style={{ color: cta.color }} />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm mb-1">{cta.title}</h4>
                <p className="text-[var(--text-secondary)] text-xs leading-relaxed">{cta.description}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium mt-2 group-hover:gap-2 transition-all" style={{ color: cta.color }}>
                  Bekijk <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
