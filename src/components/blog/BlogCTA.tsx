import Link from 'next/link';
import { ArrowRight, FileSearch, BrainCircuit, Zap, ClipboardCheck, Building, Globe, Calculator, Wrench, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CTAItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

const CTA_MAP: Record<string, CTAItem[]> = {
  'power-bi': [
    { title: 'Report Auditor', description: 'AI-audit van je datamodel. Upload je .pbix en ontvang een actielijst.', href: '/tools/report-auditor', icon: FileSearch, color: '#1E3A5F' },
    { title: 'DAX Formula Assistant', description: 'Beschrijf wat je wilt berekenen en ontvang de juiste DAX-formule.', href: '/tools/dax-assistant', icon: BrainCircuit, color: '#F59E0B' },
  ],
  'dax-datamodellering': [
    { title: 'Report Auditor', description: 'AI-audit van je datamodel. Upload je .pbix en ontvang een actielijst.', href: '/tools/report-auditor', icon: FileSearch, color: '#1E3A5F' },
    { title: 'DAX Formula Assistant', description: 'Beschrijf wat je wilt berekenen en ontvang de juiste DAX-formule.', href: '/tools/dax-assistant', icon: BrainCircuit, color: '#F59E0B' },
  ],
  'data-platform': [
    { title: 'Fabric QuickScan', description: 'Scope, planning en licentieadvies voor je Fabric-migratie. €1.500 vast.', href: '/fabric-migratie', icon: Zap, color: '#D85A30' },
    { title: 'Readiness Scan', description: 'Waar staat jouw organisatie? Beantwoord 10 vragen en ontvang je rapport.', href: '/tools/readiness-scan', icon: ClipboardCheck, color: '#1E3A5F' },
  ],
  'fabric-migratie': [
    { title: 'Fabric QuickScan', description: 'Scope, planning en licentieadvies voor je Fabric-migratie. €1.500 vast.', href: '/fabric-migratie', icon: Zap, color: '#D85A30' },
    { title: 'Readiness Scan', description: 'Waar staat jouw organisatie? Beantwoord 10 vragen en ontvang je rapport.', href: '/tools/readiness-scan', icon: ClipboardCheck, color: '#1E3A5F' },
  ],
  'governance-avg': [
    { title: 'BI-checklist publieke sector', description: '12 vragen die je moet stellen vóór een BI-aanbesteding. Gratis download.', href: '/resources/publieke-sector-checklist', icon: Building, color: '#0F6E56' },
    { title: 'GGDGHOR case', description: 'Hoe 25 GGD-regio\'s één bron van waarheid kregen.', href: '/cases/ggdghor', icon: Building, color: '#0F6E56' },
  ],
  'embedded-analytics': [
    { title: 'ISV Architectuurgids', description: '5 beslissingen vóór dag 1 van embedded Power BI. Gratis download.', href: '/resources/isv-architectuurgids', icon: Globe, color: '#534AB7' },
    { title: 'DashPortal', description: 'White-label Power BI portal. Live in 10 minuten, zonder technische kennis.', href: '/dashportal', icon: Globe, color: '#10b981' },
  ],
  'procesverbetering-bi': [
    { title: 'BI-Kosten Calculator', description: 'Bereken wat slechte data jouw organisatie kost per maand.', href: '/tools/bi-kosten-calculator', icon: Calculator, color: '#B8963E' },
    { title: 'Procesverbetering', description: 'DMAIC + Power BI: de taal die CFO\'s en COO\'s spreken.', href: '/procesverbetering', icon: Wrench, color: '#B8963E' },
  ],
  'strategie': [
    { title: 'Readiness Scan', description: 'Waar staat jouw organisatie? Beantwoord 10 vragen en ontvang je rapport.', href: '/tools/readiness-scan', icon: ClipboardCheck, color: '#1E3A5F' },
    { title: 'Neem contact op', description: 'Laten we bespreken hoe we jouw data voor je kunnen laten werken.', href: '/contact', icon: MessageSquare, color: '#1E3A5F' },
  ],
};

// Default CTAs for when no category matches
const DEFAULT_CTAS: CTAItem[] = [
  { title: 'Readiness Scan', description: 'Waar staat jouw organisatie? Beantwoord 10 vragen en ontvang je rapport.', href: '/tools/readiness-scan', icon: ClipboardCheck, color: '#1E3A5F' },
  { title: 'DAX Formula Assistant', description: 'Beschrijf wat je wilt berekenen en ontvang de juiste DAX-formule.', href: '/tools/dax-assistant', icon: BrainCircuit, color: '#F59E0B' },
];

interface BlogCTAProps {
  categorySlug: string | null;
}

export default function BlogCTA({ categorySlug }: BlogCTAProps) {
  const ctas = (categorySlug && CTA_MAP[categorySlug]) || DEFAULT_CTAS;

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
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${cta.color}15` }}
              >
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
