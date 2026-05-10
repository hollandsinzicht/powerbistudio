import Link from 'next/link';
import {
  ArrowRight, FileSearch, BrainCircuit, Zap, ClipboardCheck, Building, Globe,
  Calculator, Wrench, MessageSquare
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
    cta: { title: 'BI-Kosten Calculator', description: 'Bereken wat slechte data jouw organisatie kost per maand.', href: '/tools/bi-kosten-calculator', icon: Calculator, color: '#B8963E' },
    keywords: [
      { term: 'kosten', weight: 3 }, { term: 'roi', weight: 3 }, { term: 'business case', weight: 3 },
      { term: 'budget', weight: 2 }, { term: 'besparing', weight: 2 }, { term: 'cfo', weight: 3 },
      { term: 'coo', weight: 3 }, { term: 'operationeel', weight: 2 }, { term: 'procesverbetering', weight: 2 },
      { term: 'lean', weight: 2 }, { term: 'six sigma', weight: 2 }, { term: 'dmaic', weight: 2 },
    ],
  },
  {
    cta: { title: 'BI-checklist publieke sector', description: '12 vragen voor een BI-aanbesteding. Gratis download.', href: '/resources/publieke-sector-checklist', icon: Building, color: '#0F6E56' },
    keywords: [
      { term: 'gemeente', weight: 3 }, { term: 'ggd', weight: 3 }, { term: 'overheid', weight: 3 },
      { term: 'publieke sector', weight: 3 }, { term: 'aanbesteding', weight: 3 },
      { term: 'veiligheidsregio', weight: 3 }, { term: 'jeugdzorg', weight: 3 }, { term: 'wmo', weight: 3 },
    ],
  },
  {
    cta: { title: 'ISV Architectuurgids', description: '5 beslissingen voor dag 1 van embedded Power BI.', href: '/resources/isv-architectuurgids', icon: Globe, color: '#534AB7' },
    keywords: [
      { term: 'isv', weight: 3 }, { term: 'saas', weight: 3 }, { term: 'embedded', weight: 3 },
      { term: 'multi-tenant', weight: 3 }, { term: 'white-label', weight: 3 }, { term: 'white label', weight: 3 },
      { term: 'cto', weight: 3 }, { term: 'softwarebedrijf', weight: 3 },
    ],
  },
  {
    cta: { title: 'DAX-fouten PDF', description: 'De 10 meest voorkomende DAX-fouten en hoe je ze voorkomt.', href: '/tools/dax-assistant#dax-fouten', icon: BrainCircuit, color: '#F59E0B' },
    keywords: [
      { term: 'dax', weight: 3 }, { term: 'measure', weight: 2 }, { term: 'formule', weight: 2 },
      { term: 'calculated column', weight: 3 }, { term: 'filter context', weight: 3 },
      { term: 'star schema', weight: 2 }, { term: 'datamodel', weight: 2 },
    ],
  },
  {
    cta: { title: 'Report Auditor', description: 'AI-audit van je datamodel. Upload je .pbix en ontvang een actielijst.', href: '/tools/report-auditor', icon: FileSearch, color: '#1E3A5F' },
    keywords: [
      { term: 'pbix', weight: 3 }, { term: 'audit', weight: 3 }, { term: 'performance', weight: 2 },
      { term: 'optimalisatie', weight: 2 }, { term: 'traag', weight: 2 }, { term: 'langzaam', weight: 2 },
    ],
  },
  {
    // Fallback lead magnet
    cta: { title: 'Readiness Scan', description: 'Waar staat jouw organisatie? Beantwoord 10 vragen.', href: '/tools/readiness-scan', icon: ClipboardCheck, color: '#1E3A5F' },
    keywords: [
      { term: 'beginnen', weight: 2 }, { term: 'starten', weight: 2 }, { term: 'volwassenheid', weight: 3 },
      { term: 'maturity', weight: 3 }, { term: 'roadmap', weight: 2 }, { term: 'overstappen', weight: 2 },
    ],
  },
];

// --- Service CTA Pool (slot 2) ---
const SERVICE_CTAS: ScoredCTA[] = [
  {
    cta: { title: 'Procesverbetering', description: 'DMAIC + Power BI: de taal die CFOs en COOs spreken.', href: '/procesverbetering', icon: Wrench, color: '#B8963E' },
    keywords: [
      { term: 'lean', weight: 3 }, { term: 'six sigma', weight: 3 }, { term: 'dmaic', weight: 3 },
      { term: 'kpi', weight: 2 }, { term: 'operationeel', weight: 2 }, { term: 'bottleneck', weight: 3 },
      { term: 'cfo', weight: 2 }, { term: 'coo', weight: 2 },
    ],
  },
  {
    cta: { title: 'Fabric QuickScan', description: 'Scope, planning en licentieadvies. \u20AC1.500 vast.', href: '/fabric-migratie', icon: Zap, color: '#D85A30' },
    keywords: [
      { term: 'fabric', weight: 3 }, { term: 'migratie', weight: 3 }, { term: 'migreren', weight: 3 },
      { term: 'premium', weight: 2 }, { term: 'onelake', weight: 3 }, { term: 'licentie', weight: 2 },
    ],
  },
  {
    cta: { title: 'SaaS & Embedded', description: 'Power BI embedded in je product.', href: '/saas', icon: Globe, color: '#534AB7' },
    keywords: [
      { term: 'saas', weight: 3 }, { term: 'embedded', weight: 3 }, { term: 'isv', weight: 3 },
      { term: 'multi-tenant', weight: 3 }, { term: 'white-label', weight: 3 }, { term: 'klantportaal', weight: 3 },
    ],
  },
  {
    cta: { title: 'Publieke Sector BI', description: 'BI voor gemeenten, GGDs en veiligheidsregios.', href: '/publieke-sector', icon: Building, color: '#0F6E56' },
    keywords: [
      { term: 'gemeente', weight: 3 }, { term: 'ggd', weight: 3 }, { term: 'overheid', weight: 3 },
      { term: 'publieke sector', weight: 3 }, { term: 'avg', weight: 2 }, { term: 'privacy', weight: 2 },
    ],
  },
  {
    cta: { title: 'Copilot Readiness', description: 'Is jouw data klaar voor AI en Copilot?', href: '/copilot-readiness', icon: BrainCircuit, color: '#F59E0B' },
    keywords: [
      { term: 'copilot', weight: 3 }, { term: 'ai', weight: 2 }, { term: 'artificial intelligence', weight: 3 },
      { term: 'openai', weight: 3 }, { term: 'gpt', weight: 3 },
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
