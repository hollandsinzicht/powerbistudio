"use client"

import { useState } from "react"
import { Search, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import type { AuditVerification } from "@/lib/types/audit"

export default function VerificationInput() {
  const [auditId, setAuditId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AuditVerification | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auditId.trim()) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/audit/${encodeURIComponent(auditId.trim())}/verify`)
      const data = await res.json()
      setResult(data as AuditVerification)
    } catch {
      setError("Er ging iets mis bij het verifiëren. Probeer het opnieuw.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleVerify} className="flex gap-3">
        <input
          type="text"
          value={auditId}
          onChange={(e) => setAuditId(e.target.value)}
          placeholder="Bijv. AU-2024-8821"
          className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors font-mono"
        />
        <button
          type="submit"
          disabled={!auditId.trim() || isLoading}
          className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
          Verifieer
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          <XCircle size={16} />
          {error}
        </div>
      )}

      {result && (
        <div
          className={`rounded-xl border p-5 ${
            result.exists
              ? "border-green-300 bg-[rgba(16,185,129,0.05)]"
              : "border-red-300 bg-red-50"
          }`}
        >
          {result.exists ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 size={20} />
                <span className="font-medium">Audit geverifieerd</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[var(--text-secondary)]">Origineel vernietigd</p>
                  <p className="font-mono text-xs text-gray-500 break-all">{result.originalHash}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {result.originalDestroyedAt &&
                      new Date(result.originalDestroyedAt).toLocaleString("nl-NL")}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--text-secondary)]">Metadata vernietigd</p>
                  <p className="font-mono text-xs text-gray-500 break-all">{result.metadataHash}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {result.metadataDestroyedAt &&
                      new Date(result.metadataDestroyedAt).toLocaleString("nl-NL")}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] pt-1 border-t border-green-200">
                Status: {result.status === "complete_and_cleaned" ? "Voltooid en opgeschoond" : result.status}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-700">
              <XCircle size={20} />
              <span className="font-medium">Audit-ID niet gevonden</span>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-[var(--text-secondary)]">
        Elk audit-ID is publiek verifieerbaar. Transparantie is geen marketingbelofte.
      </p>
    </div>
  )
}
