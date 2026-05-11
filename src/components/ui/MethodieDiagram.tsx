import { Database, Filter, Layers, BarChart3, Server, History, Shield, ArrowUp } from 'lucide-react';

/**
 * MethodieDiagram — signature visual van de bron-zilver-goud-semantisch methodiek.
 *
 * Vier lagen, bottom-up:
 *   1. Bron        — ruwe data uit AFAS, Visma, Nmbrs                (neutral-100)
 *   2. Zilver      — opgeschoonde tabellen + type-2 historiek (SCD2) (neutral-200)
 *   3. Goud        — HR-feiten/dimensies in sterschema                (accent-100)
 *   4. Semantisch  — Power BI-model met DAX, RLS, KPI's               (accent-700)
 *
 * Elke laag heeft:
 *   - Label (bv. "Bron")
 *   - Subtitle (uitleg van de laag)
 *   - Twee iconen (illustratief van wat er gebeurt)
 *   - Subtiele opwaartse pijl tussen lagen
 *
 * Twee weergaven:
 *   - default ('full')  — volledige uitleg, gebruikt op /hr-analytics en /methodiek
 *   - compact           — gestileerd, kleiner, voor homepage-sectie waar
 *                         een "lees meer →" link onder staat
 *
 * Voor OG-images en PDF-export wordt deze SVG later gerenderd via een
 * dedicated /api/og/methodiek route. Die route is out-of-scope voor deze branch.
 */

interface MethodieDiagramProps {
  variant?: 'full' | 'compact';
  className?: string;
}

interface Layer {
  key: string;
  label: string;
  subtitle: string;
  icons: Array<{ Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>; label: string }>;
  bg: string;
  fg: string;
  border: string;
  accent?: boolean;
}

// Lagen worden hier top-down gedeclareerd voor leesgemak, maar in de render
// in omgekeerde volgorde getoond (data stroomt naar boven).
const LAYERS: Layer[] = [
  {
    key: 'semantisch',
    label: 'Semantisch model',
    subtitle: 'Power BI-model met DAX, RLS, KPI-bibliotheek',
    icons: [
      { Icon: BarChart3, label: 'KPI dashboards' },
      { Icon: Shield, label: 'Row-level security' },
    ],
    bg: 'bg-[var(--color-accent-700)]',
    fg: 'text-white',
    border: 'border-[var(--color-accent-700)]',
    accent: true,
  },
  {
    key: 'goud',
    label: 'Goud',
    subtitle: 'HR-feiten en -dimensies in sterschema',
    icons: [
      { Icon: Layers, label: 'Feit-/dimensie-tabellen' },
      { Icon: BarChart3, label: 'Analyse-klaar sterschema' },
    ],
    bg: 'bg-[var(--color-accent-100)]',
    fg: 'text-[var(--color-primary-900)]',
    border: 'border-[color-mix(in_oklch,var(--color-accent-700)_30%,transparent)]',
  },
  {
    key: 'zilver',
    label: 'Zilver',
    subtitle: 'Opgeschoonde tabellen, datatypes consistent, met type-2 historiek',
    icons: [
      { Icon: Filter, label: 'Datacleaning' },
      { Icon: History, label: 'Type-2 historiek (SCD2)' },
    ],
    bg: 'bg-[var(--color-neutral-200)]',
    fg: 'text-[var(--color-primary-900)]',
    border: 'border-[var(--color-neutral-200)]',
  },
  {
    key: 'bron',
    label: 'Bron',
    subtitle: 'Ruwe data uit AFAS, Visma, Nmbrs',
    icons: [
      { Icon: Server, label: 'AFAS / Visma / Nmbrs' },
      { Icon: Database, label: 'Ruwe tabellen' },
    ],
    bg: 'bg-[var(--color-neutral-100)]',
    fg: 'text-[var(--color-primary-900)]',
    border: 'border-[var(--color-neutral-200)]',
  },
];

export default function MethodieDiagram({ variant = 'full', className = '' }: MethodieDiagramProps) {
  const compact = variant === 'compact';

  return (
    <figure
      className={`mx-auto w-full max-w-3xl ${className}`}
      aria-labelledby="methodiek-diagram-titel"
    >
      <figcaption id="methodiek-diagram-titel" className="sr-only">
        Vier-lagen-methodiek: bron, zilver, goud, semantisch model. Data stroomt
        van onder (ruwe data uit HR-systemen) naar boven (Power BI-model met
        KPI&apos;s).
      </figcaption>

      <div
        role="presentation"
        className={`flex flex-col ${compact ? 'gap-1.5' : 'gap-2'}`}
      >
        {LAYERS.map((layer, idx) => {
          const isLast = idx === LAYERS.length - 1;
          return (
            <div key={layer.key}>
              <div
                className={`relative flex items-center justify-between rounded-lg border ${layer.bg} ${layer.fg} ${layer.border} ${
                  compact ? 'px-4 py-3' : 'px-5 py-4 md:px-6 md:py-5'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className={`font-display font-semibold ${compact ? 'text-base' : 'text-lg md:text-xl'}`}>
                    {layer.label}
                  </div>
                  {!compact && (
                    <div
                      className={`mt-0.5 text-sm ${
                        layer.accent ? 'text-white/85' : 'text-[var(--color-neutral-700)]'
                      }`}
                    >
                      {layer.subtitle}
                    </div>
                  )}
                </div>

                <div
                  className={`flex shrink-0 items-center gap-3 ${
                    compact ? 'ml-3' : 'ml-4'
                  }`}
                  aria-hidden="true"
                >
                  {layer.icons.map(({ Icon, label }) => (
                    <span
                      key={label}
                      title={label}
                      className={`inline-flex items-center justify-center rounded-md ${
                        layer.accent
                          ? 'bg-white/15 text-white'
                          : 'bg-white/80 text-[var(--color-primary-700)]'
                      } ${compact ? 'h-7 w-7' : 'h-9 w-9'}`}
                    >
                      <Icon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
                    </span>
                  ))}
                </div>
              </div>

              {/* Opwaartse pijl tussen lagen — markeert dat data omhoog stroomt */}
              {!isLast && (
                <div className="flex justify-center" aria-hidden="true">
                  <ArrowUp
                    className={`text-[var(--color-neutral-500)] ${compact ? 'h-3 w-3' : 'h-4 w-4'}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!compact && (
        <p className="mt-4 text-xs text-[var(--color-neutral-500)]">
          Data stroomt van onder naar boven. Elke laag heeft één duidelijke taak,
          en wijzigingen plant je in de laag waar het probleem ontstaat — niet in
          het uiteindelijke rapport.
        </p>
      )}
    </figure>
  );
}
