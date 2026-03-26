import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Upload,
  Trash2,
  Brain,
  FileText,
  CheckCircle2,
  BarChart3,
  Search,
  ListChecks,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react"
import UploadZone from "@/components/report-auditor/UploadZone"
import VerificationInput from "@/components/report-auditor/VerificationInput"

export const metadata: Metadata = {
  title: "Power BI Report Auditor | PowerBIStudio",
  description:
    "Upload je .pbix bestand en ontvang een professionele AI-audit van je datamodel. Privacy-first — cryptografisch bewijs van dataverwijdering inbegrepen.",
}

const analysisYes = [
  "Tabelnamen",
  "Kolomnamen",
  "DAX measure-code",
  "M/Power Query scripts",
  "Relaties en cardinaliteit",
  "Bronverbindingsnamen",
]

const analysisNo = [
  "Data-rijen of celwaarden",
  "Credentials of wachtwoorden",
  "Persoonlijke gegevens",
  "Financiele waarden",
  "API-sleutels",
  "Gecachte data",
]

const howItWorks = [
  {
    icon: Upload,
    title: "Upload je .pbix bestand",
    description: "Sleep je bestand in de uploadzone of selecteer het handmatig.",
  },
  {
    icon: Eye,
    title: "Wij extraheren alleen de modelstructuur",
    description: "Tabellen, kolommen, DAX en relaties. Geen data-inhoud.",
  },
  {
    icon: Trash2,
    title: "Je originele bestand wordt direct vernietigd",
    description: "Je ontvangt cryptografisch bewijs van de vernietiging.",
  },
  {
    icon: Brain,
    title: "AI analyseert de modelkwaliteit",
    description: "Claude beoordeelt je model op 5 kwaliteitscategorieen.",
  },
  {
    icon: FileText,
    title: "Rapport + bewijs per email",
    description: "Binnen 5 minuten ontvang je een professioneel PDF-rapport.",
  },
]

export default function ReportAuditorPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,58,95,0.08),transparent_50%)] pointer-events-none" />

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <Link
            href="/tools"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-2 mb-8 text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Terug naar Tools
          </Link>

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-[rgba(245,158,11,0.05)] text-[var(--accent)] text-sm font-mono px-4 py-1.5 border border-[rgba(245,158,11,0.2)] rounded flex items-center gap-2">
                <BrainCircuit size={16} /> AI-powered
              </span>
              <span className="bg-[rgba(16,185,129,0.05)] text-[#10b981] text-sm font-mono px-4 py-1.5 border border-[rgba(16,185,129,0.2)] rounded flex items-center gap-2">
                <ShieldCheck size={16} /> Privacy-first — bestand vernietigd na analyse
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Power BI Report Auditor
            </h1>

            <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-8">
              Upload je .pbix bestand en ontvang een professionele AI-audit van je datamodel.
              Inclusief cryptografisch bewijs dat je data veilig is verwerkt en vernietigd.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#upload"
                className="btn-primary inline-flex items-center gap-2 text-lg px-6 py-3"
              >
                Start gratis audit <ArrowRight size={20} />
              </a>
              <a
                href="/api/audit/mock-report"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2 text-lg px-6 py-3 rounded"
              >
                <FileText size={20} /> Bekijk voorbeeldrapport
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What We Analyze */}
      <section className="py-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-bold mb-10 text-center">
              Wat we <span className="text-[var(--accent)]">analyseren</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* What we DO read */}
              <div className="glass-card rounded-2xl p-8 border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-5">
                  <Eye size={20} className="text-[var(--primary)]" />
                  <h3 className="font-display font-bold text-lg">Wat we WEL lezen</h3>
                </div>
                <ul className="space-y-3">
                  {analysisYes.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[var(--text-secondary)]">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What we NEVER read */}
              <div className="glass-card rounded-2xl p-8 border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-5">
                  <EyeOff size={20} className="text-red-500" />
                  <h3 className="font-display font-bold text-lg">Wat we NOOIT lezen</h3>
                </div>
                <ul className="space-y-3">
                  {analysisNo.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[var(--text-secondary)]">
                      <Lock size={16} className="text-red-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" className="py-20 bg-gray-50 border-y border-[var(--border)]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-display font-bold mb-3 text-center">
              Start je <span className="text-[var(--accent)]">audit</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-center mb-10">
              Upload je .pbix bestand en ontvang je rapport binnen 5 minuten.
            </p>

            <div className="glass-card rounded-2xl p-8 border border-[var(--border)]">
              <UploadZone />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-bold mb-12 text-center">
              Hoe het <span className="text-[var(--accent)]">werkt</span>
            </h2>

            <div className="space-y-0">
              {howItWorks.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={i} className="relative flex gap-6 pb-10 last:pb-0">
                    {/* Connector line */}
                    {i < howItWorks.length - 1 && (
                      <div className="absolute left-[23px] top-[52px] w-0.5 h-[calc(100%-28px)] bg-[var(--border)]" />
                    )}

                    {/* Step number */}
                    <div className="shrink-0 w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-display font-bold text-lg relative z-10">
                      {i + 1}
                    </div>

                    {/* Content */}
                    <div className="pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={18} className="text-[var(--accent)]" />
                        <h3 className="font-display font-bold text-lg">{step.title}</h3>
                      </div>
                      <p className="text-[var(--text-secondary)]">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 bg-gray-50 border-y border-[var(--border)]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-display font-bold mb-12 text-center">
              Wat je <span className="text-[var(--accent)]">krijgt</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Scorecard */}
              <div className="glass-card rounded-2xl p-8 border border-[var(--border)] flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-[rgba(59,130,246,0.1)] flex items-center justify-center mb-5">
                  <BarChart3 size={24} className="text-blue-500" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">Scorecard</h3>
                <p className="text-[var(--text-secondary)] flex-grow">
                  5 categorieen (datamodel, DAX-kwaliteit, performance, naamgeving, onderhoudbaarheid) elk gescoord van 1-10 met toelichting.
                </p>
              </div>

              {/* Bevindingen */}
              <div className="glass-card rounded-2xl p-8 border border-[var(--border)] flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-[rgba(245,158,11,0.1)] flex items-center justify-center mb-5">
                  <Search size={24} className="text-[var(--accent)]" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">Bevindingen</h3>
                <p className="text-[var(--text-secondary)] flex-grow">
                  Per issue: het probleem, het risico en een concrete oplossing. Gesorteerd op ernst (kritisch, belangrijk, aanbeveling).
                </p>
              </div>

              {/* Actielijst */}
              <div className="glass-card rounded-2xl p-8 border border-[var(--border)] flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-[rgba(16,185,129,0.1)] flex items-center justify-center mb-5">
                  <ListChecks size={24} className="text-green-500" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">Actielijst</h3>
                <p className="text-[var(--text-secondary)] flex-grow">
                  Top 5 prioriteiten gesorteerd op impact, met inschatting van effort. Direct toepasbaar door jou of je team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Section */}
      <section id="verificeer" className="py-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-4">
                <ShieldCheck size={24} className="text-[var(--primary)]" />
                <h2 className="text-3xl font-display font-bold">
                  Verifieer een audit
                </h2>
              </div>
              <p className="text-[var(--text-secondary)]">
                Elk audit-rapport bevat een unieke verificatiecode. Controleer hier of een audit
                daadwerkelijk is uitgevoerd en dat alle data is vernietigd.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-[var(--border)]">
              <VerificationInput />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
