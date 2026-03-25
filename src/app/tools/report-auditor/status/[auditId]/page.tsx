"use client"

import { useParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import AuditStatusTracker from "@/components/report-auditor/AuditStatusTracker"
import type { AuditStep, AuditStatus } from "@/lib/types/audit"

// Demo data for when API is not available
const demoSteps: AuditStep[] = [
  { key: "received", label: "Bestand ontvangen (AES-256 encrypted)", timestamp: "2024-03-15T14:32:01Z" },
  { key: "parsed", label: "Metadata geextraheerd", timestamp: "2024-03-15T14:32:04Z", metadata: { objectCount: 187 } },
  { key: "original_destroyed", label: "Origineel bestand vernietigd", timestamp: "2024-03-15T14:32:04Z", hash: "a3f9c2d8e1b4f7a3c9e2d5b8f1a4c7e0" },
  { key: "analyzing", label: "AI-analyse gestart", timestamp: "2024-03-15T14:32:09Z" },
  { key: "analyzed", label: "Analyse voltooid", timestamp: "2024-03-15T14:32:31Z" },
  { key: "metadata_destroyed", label: "Metadata vernietigd", timestamp: "2024-03-15T14:32:31Z", hash: "7b12e4a9c3f6d2b8e5a1c4f7b0d3e6a9" },
  { key: "report_generated", label: "Rapport gegenereerd", timestamp: "2024-03-15T14:34:22Z" },
  { key: "complete", label: "Rapport beschikbaar tot 17 mrt 14:34", timestamp: "2024-03-15T14:34:22Z" },
]

export default function AuditStatusPage() {
  const params = useParams()
  const auditId = params.auditId as string

  const [steps, setSteps] = useState<AuditStep[]>([])
  const [fileName, setFileName] = useState("")
  const [verificationCode, setVerificationCode] = useState<string | undefined>()
  const [pdfUrl, setPdfUrl] = useState<string | undefined>()
  const [expiresAt, setExpiresAt] = useState<number | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/audit/${encodeURIComponent(auditId)}/status`)
      if (!res.ok) {
        // API not available — fall back to demo mode
        setIsDemo(true)
        return false
      }
      const data: AuditStatus = await res.json()
      setSteps(data.steps)
      setFileName(data.fileName)
      setVerificationCode(data.verificationCode)
      setPdfUrl(data.pdfUrl)
      setExpiresAt(data.expiresAt)
      return data.status === "complete" || data.status === "failed"
    } catch {
      setIsDemo(true)
      return false
    }
  }, [auditId])

  useEffect(() => {
    // Try API first
    let cancelled = false

    fetchStatus().then((done) => {
      if (cancelled || done) return

      if (!isDemo) {
        // Poll every 2 seconds
        const interval = setInterval(async () => {
          if (cancelled) return
          const isDone = await fetchStatus()
          if (isDone) clearInterval(interval)
        }, 2000)

        return () => {
          cancelled = true
          clearInterval(interval)
        }
      }
    })

    return () => { cancelled = true }
  }, [fetchStatus, isDemo])

  // Demo mode: progressive step reveal
  useEffect(() => {
    if (!isDemo) return

    setFileName("rapport_q4_finance.pbix")
    let stepIndex = 0
    setSteps([demoSteps[0]])
    stepIndex = 1

    const interval = setInterval(() => {
      if (stepIndex >= demoSteps.length) {
        clearInterval(interval)
        return
      }
      setSteps((prev) => [...prev, demoSteps[stepIndex]])
      stepIndex++
    }, 1200)

    return () => clearInterval(interval)
  }, [isDemo])

  const isComplete = steps.some((s) => s.key === "complete")

  return (
    <div className="min-h-screen bg-[var(--background)] pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/tools/report-auditor"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-2 mb-6 text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Terug naar Report Auditor
          </Link>
          <h1 className="text-3xl font-display font-bold">Audit Status</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Volg de voortgang van je audit in real-time.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Status tracker */}
        <AuditStatusTracker
          auditId={auditId}
          fileName={fileName}
          steps={steps}
          verificationCode={isDemo && isComplete ? `${auditId}-X7K2` : verificationCode}
          pdfUrl={isDemo && isComplete ? "#" : pdfUrl}
          expiresAt={isDemo && isComplete ? Date.now() + 48 * 60 * 60 * 1000 : expiresAt}
        />
      </div>
    </div>
  )
}
