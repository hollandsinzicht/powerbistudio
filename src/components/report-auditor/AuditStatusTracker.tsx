"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, Copy, CheckCheck, Download, Lock } from "lucide-react"
import type { AuditStep } from "@/lib/types/audit"

type Props = {
  auditId: string
  fileName: string
  steps: AuditStep[]
  verificationCode?: string
  pdfUrl?: string
  expiresAt?: number
}

const stepLabels: Record<string, string> = {
  received: "Bestand ontvangen (AES-256 encrypted)",
  parsed: "Metadata geextraheerd",
  original_destroyed: "Origineel bestand vernietigd",
  analyzing: "AI-analyse gestart",
  analyzed: "Analyse voltooid",
  metadata_destroyed: "Metadata vernietigd",
  report_generated: "Rapport gegenereerd",
  complete: "Rapport beschikbaar",
}

function formatTime(timestamp: string): string {
  try {
    const d = new Date(timestamp)
    return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  } catch {
    return timestamp
  }
}

function formatDate(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

export default function AuditStatusTracker({ auditId, fileName, steps, verificationCode, pdfUrl, expiresAt }: Props) {
  const [copiedCode, setCopiedCode] = useState(false)

  const isComplete = steps.some((s) => s.key === "complete")
  const lastStep = steps[steps.length - 1]

  const handleCopyCode = () => {
    if (!verificationCode) return
    navigator.clipboard.writeText(verificationCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-[var(--border)]">
        <p className="text-sm text-[var(--text-secondary)] mb-1">Audit</p>
        <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
          #{auditId}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] font-mono mt-1">{fileName}</p>
      </div>

      {/* Steps */}
      <div className="glass-card rounded-2xl p-6 border border-[var(--border)]">
        <div className="space-y-0">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1
            const isActiveStep = isLast && !isComplete

            return (
              <div key={step.key} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[11px] top-[28px] w-0.5 h-[calc(100%-4px)] bg-green-200" />
                )}

                <div className="flex items-start gap-4 py-3">
                  {/* Icon */}
                  <div className="shrink-0 mt-0.5">
                    {isActiveStep ? (
                      <Loader2 size={22} className="text-[var(--accent)] animate-spin" />
                    ) : (
                      <CheckCircle2 size={22} className="text-green-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs font-mono text-[var(--text-secondary)]">
                        {formatTime(step.timestamp)}
                      </span>
                      <span className="text-sm text-[var(--text-primary)]">
                        {step.label || stepLabels[step.key] || step.key}
                        {step.metadata?.objectCount ? (
                          <span className="text-[var(--text-secondary)]">
                            {" "}({String(step.metadata.objectCount)} objecten gedetecteerd)
                          </span>
                        ) : null}
                      </span>
                    </div>

                    {/* Hash display */}
                    {step.hash && (
                      <p className="text-xs font-mono text-gray-400 mt-1 break-all">
                        Hash: {step.hash}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Waiting indicator when not complete */}
          {!isComplete && lastStep && (
            <div className="flex items-start gap-4 py-3">
              <div className="shrink-0 mt-0.5">
                <Loader2 size={22} className="text-[var(--accent)] animate-spin" />
              </div>
              <span className="text-sm text-[var(--text-secondary)] animate-pulse">
                Verwerking loopt...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Verification code */}
      {verificationCode && (
        <div className="glass-card rounded-2xl p-6 border border-[var(--accent)] bg-[rgba(245,158,11,0.03)]">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={16} className="text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Verificatiecode</span>
          </div>
          <div className="flex items-center gap-3">
            <code className="flex-1 font-mono text-lg font-bold text-[var(--primary)] bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2.5">
              {verificationCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="shrink-0 p-2.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
              title="Kopieer verificatiecode"
            >
              {copiedCode ? <CheckCheck size={18} className="text-green-500" /> : <Copy size={18} className="text-[var(--text-secondary)]" />}
            </button>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Verifieer op powerbistudio.nl/tools/report-auditor#verificeer
          </p>
        </div>
      )}

      {/* Download button */}
      {isComplete && pdfUrl && (
        <div className="space-y-3">
          <a
            href={pdfUrl}
            className="btn-primary w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 text-lg"
          >
            <Download size={20} /> Download rapport
          </a>
          {expiresAt && (
            <p className="text-xs text-center text-[var(--text-secondary)]">
              Beschikbaar tot {formatDate(expiresAt)}. Daarna wordt het rapport automatisch verwijderd.
            </p>
          )}
        </div>
      )}

      {/* Email reminder */}
      <p className="text-sm text-center text-[var(--text-secondary)]">
        We sturen ook een email zodra je rapport klaar is.
      </p>
    </div>
  )
}
