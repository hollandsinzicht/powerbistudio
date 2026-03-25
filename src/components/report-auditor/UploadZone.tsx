"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileCheck, Mail, CreditCard, AlertCircle, X } from "lucide-react"
import type { AuditPlan } from "@/lib/types/audit"

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export default function UploadZone() {
  const [file, setFile] = useState<File | null>(null)
  const [email, setEmail] = useState("")
  const [plan, setPlan] = useState<AuditPlan>("single")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const validateFile = useCallback((f: File): string | null => {
    if (!f.name.toLowerCase().endsWith(".pbix")) {
      return "Alleen .pbix bestanden zijn toegestaan."
    }
    if (f.size > MAX_FILE_SIZE) {
      return `Bestand is te groot (${(f.size / 1024 / 1024).toFixed(1)}MB). Maximum is 100MB.`
    }
    return null
  }, [])

  const handleFile = useCallback((f: File) => {
    const validationError = validateFile(f)
    if (validationError) {
      setError(validationError)
      setFile(null)
      return
    }
    setError(null)
    setFile(f)
  }, [validateFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFile(droppedFile)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !email || !agreedToTerms) return

    setIsSubmitting(true)
    setError(null)

    try {
      // For paid plans, first upload the file, then redirect to Stripe
      const formData = new FormData()
      formData.append("file", file)
      formData.append("email", email)
      formData.append("plan", plan)

      const uploadRes = await fetch("/api/audit/upload", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) {
        setError(uploadData.error || "Er ging iets mis bij het uploaden.")
        return
      }

      if (plan === "free") {
        // Free plan: go directly to status page
        router.push(uploadData.statusUrl)
      } else {
        // Paid plan: redirect to Stripe checkout
        const checkoutRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auditId: uploadData.auditId,
            plan,
            email,
          }),
        })

        const checkoutData = await checkoutRes.json()

        if (checkoutData.url) {
          window.location.href = checkoutData.url
        } else {
          // Stripe not configured — go to status page directly
          router.push(uploadData.statusUrl)
        }
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError("Er ging iets mis bij het uploaden. Probeer het opnieuw.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-[var(--accent)] bg-[rgba(245,158,11,0.05)]"
              : file
                ? "border-green-400 bg-[rgba(16,185,129,0.05)]"
                : "border-[var(--border)] hover:border-[var(--text-secondary)] bg-[var(--surface)]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pbix"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <FileCheck size={40} className="text-green-500" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">{file.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
                className="text-sm text-[var(--text-secondary)] hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <X size={14} /> Verwijder bestand
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload size={40} className="text-[var(--text-secondary)] opacity-50" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">
                  Sleep je .pbix bestand hierheen
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  of klik om te selecteren (max 100MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            <Mail size={14} className="inline mr-1.5 -mt-0.5" />
            E-mailadres (verplicht)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jouw@email.nl"
            required
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        {/* Plan selector */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
            <CreditCard size={14} className="inline mr-1.5 -mt-0.5" />
            Kies je plan
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Single */}
            <label
              className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                plan === "single"
                  ? "border-[var(--primary)] bg-[rgba(30,58,95,0.03)]"
                  : "border-[var(--border)] hover:border-[var(--text-secondary)]"
              }`}
            >
              <input
                type="radio"
                name="plan"
                value="single"
                checked={plan === "single"}
                onChange={() => setPlan("single")}
                className="sr-only"
              />
              <span className="text-lg font-bold text-[var(--text-primary)]">&euro;49</span>
              <span className="text-sm text-[var(--text-secondary)]">Eenmalige audit</span>
            </label>

            {/* Bundle */}
            <label
              className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                plan === "bundle"
                  ? "border-[var(--primary)] bg-[rgba(30,58,95,0.03)]"
                  : "border-[var(--border)] hover:border-[var(--text-secondary)]"
              }`}
            >
              <input
                type="radio"
                name="plan"
                value="bundle"
                checked={plan === "bundle"}
                onChange={() => setPlan("bundle")}
                className="sr-only"
              />
              <span className="absolute -top-2.5 right-3 bg-[var(--accent)] text-[var(--primary)] text-xs font-bold px-2 py-0.5 rounded-full">
                Populair
              </span>
              <span className="text-lg font-bold text-[var(--text-primary)]">&euro;149</span>
              <span className="text-sm text-[var(--text-secondary)]">Bundel 5 audits</span>
            </label>

            {/* Free */}
            <label
              className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                plan === "free"
                  ? "border-[var(--primary)] bg-[rgba(30,58,95,0.03)]"
                  : "border-[var(--border)] hover:border-[var(--text-secondary)]"
              }`}
            >
              <input
                type="radio"
                name="plan"
                value="free"
                checked={plan === "free"}
                onChange={() => setPlan("free")}
                className="sr-only"
              />
              <span className="text-lg font-bold text-[var(--text-primary)]">Gratis</span>
              <span className="text-sm text-[var(--text-secondary)]">Ik ben consultant</span>
            </label>
          </div>
          {plan === "free" && (
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Je ontvangt een gratis rapport. In ruil sturen wij je mogelijk relevante informatie over onze diensten.
            </p>
          )}
        </div>

        {/* AVG checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
          />
          <span className="text-sm text-[var(--text-secondary)]">
            Ik ga akkoord met de{" "}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setShowTermsModal(true)
              }}
              className="text-[var(--primary)] underline hover:no-underline"
            >
              verwerkersovereenkomst (AVG)
            </button>
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={!file || !email || !agreedToTerms || isSubmitting}
          className="w-full btn-primary py-4 rounded-xl font-medium flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Bezig met uploaden...
            </>
          ) : plan === "free" ? (
            "Start gratis audit"
          ) : (
            `Betaal en start audit — €${plan === "single" ? "49" : "149"}`
          )}
        </button>

        <p className="text-xs text-center text-[var(--text-secondary)]">
          Je bestand wordt direct na analyse vernietigd. Cryptografisch bewijs volgt per email.
        </p>
      </form>

      {/* AVG Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowTermsModal(false)}>
          <div
            className="bg-[var(--surface)] rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-bold">Verwerkersovereenkomst</h3>
              <button onClick={() => setShowTermsModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
              <p><strong className="text-[var(--text-primary)]">Doel van de verwerking:</strong> Analyse van de structuur van je Power BI datamodel ten behoeve van een kwaliteitsaudit.</p>
              <p><strong className="text-[var(--text-primary)]">Wat we verwerken:</strong> Uitsluitend modelstructuur (tabelnamen, kolomnamen, DAX measures, relaties, bronverbindingen). Geen data-inhoud, persoonsgegevens of financiele waarden.</p>
              <p><strong className="text-[var(--text-primary)]">Bewaartermijn:</strong> Je originele .pbix bestand wordt direct na extractie van de modelstructuur vernietigd. De geextraheerde metadata wordt vernietigd na analyse. Het gegenereerde PDF-rapport is 48 uur beschikbaar en wordt daarna automatisch verwijderd.</p>
              <p><strong className="text-[var(--text-primary)]">Cryptografisch bewijs:</strong> Bij elke vernietigingsstap genereren wij een SHA-256 hash als bewijs. Deze hashes zijn publiek verifieerbaar.</p>
              <p><strong className="text-[var(--text-primary)]">Verwerker:</strong> PowerBIStudio.nl (Jan Willem den Hollander, KVK 62432168). Gegevensverwerking vindt plaats op servers binnen de EU.</p>
            </div>
            <button
              onClick={() => {
                setAgreedToTerms(true)
                setShowTermsModal(false)
              }}
              className="w-full btn-primary mt-6 py-3 rounded-xl"
            >
              Akkoord en sluiten
            </button>
          </div>
        </div>
      )}
    </>
  )
}
