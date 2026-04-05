"use client";

import { useState } from "react";
import { Calculator, TrendingDown, ArrowRight } from "lucide-react";
import LeadCaptureForm from "@/components/lead/LeadCaptureForm";

function getRecommendation(cost: number): string {
  if (cost < 5000) return "Je kosten zijn relatief laag. Een Power BI Readiness Scan kan helpen bepalen waar de quick wins zitten.";
  if (cost < 15000) return "Dit bedrag rechtvaardigt een gerichte investering in Power BI en procesoptimalisatie. Een Fabric QuickScan of Report Audit is een logische eerste stap.";
  if (cost < 50000) return "Dit is een serieus bedrag dat structurele verbetering rechtvaardigt. Een procesverbeterings-intake met Lean Six Sigma-aanpak is aan te raden.";
  return "Dit is een kritieke kostenpost. Directe actie is nodig. Een combinatie van procesverbetering, data-architectuur en governance-interventie heeft de hoogste impact.";
}

export default function BiKostenCalculatorPage() {
  const [fte, setFte] = useState(5);
  const [hours, setHours] = useState(8);
  const [rate, setRate] = useState(75);
  const [delayed, setDelayed] = useState(5000);
  const [showResult, setShowResult] = useState(false);

  const monthlyCost = Math.round(fte * hours * rate * 4.33 + delayed);
  const yearlyCost = monthlyCost * 12;
  const recommendation = getRecommendation(monthlyCost);
  const formattedMonthly = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(monthlyCost);
  const formattedYearly = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(yearlyCost);

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 border-b border-[var(--border)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,150,62,0.08),transparent_50%)] pointer-events-none" />
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center text-[0.7rem] font-semibold px-3 py-1 rounded-full mb-4" style={{ backgroundColor: "rgba(184, 150, 62, 0.1)", color: "#B8963E" }}>
              Gratis tool
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-bold mt-2 mb-4">
              Wat kost slechte data jouw organisatie?
            </h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
              Bereken de maandelijkse kosten van handmatig rapportagewerk en vertraagde beslissingen.
              Het resultaat zal je verbazen.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Input */}
              <div>
                <h2 className="text-xl font-display font-bold mb-6">Vul je situatie in</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Aantal FTE dat handmatig rapporteert
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range" min={1} max={50} value={fte}
                        onChange={(e) => setFte(Number(e.target.value))}
                        className="flex-grow accent-[#B8963E]"
                      />
                      <span className="text-lg font-mono font-bold w-12 text-right">{fte}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Gemiddeld uren per week per FTE
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range" min={1} max={40} value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        className="flex-grow accent-[#B8963E]"
                      />
                      <span className="text-lg font-mono font-bold w-12 text-right">{hours}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Gemiddeld uurtarief (intern, in &euro;)
                    </label>
                    <input
                      type="number" min={25} max={250} value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Geschatte kosten vertraagde beslissingen per maand (&euro;)
                    </label>
                    <input
                      type="number" min={0} step={1000} value={delayed}
                      onChange={(e) => setDelayed(Number(e.target.value))}
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors font-mono"
                    />
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Denk aan: uitgestelde investeringen, gemiste contractdeadlines, voorraadfouten
                    </p>
                  </div>

                  {!showResult && (
                    <button
                      onClick={() => setShowResult(true)}
                      className="btn-primary w-full py-4 text-lg font-medium flex items-center justify-center gap-2"
                    >
                      <Calculator size={20} /> Bereken kosten
                    </button>
                  )}
                </div>
              </div>

              {/* Result */}
              <div>
                {showResult ? (
                  <div className="glass-card rounded-xl p-8 border border-[var(--border)] sticky top-28">
                    <div className="text-center mb-6">
                      <TrendingDown size={32} className="mx-auto mb-3 text-red-500" />
                      <p className="text-sm text-[var(--text-secondary)]">Geschatte maandelijkse kosten</p>
                      <p className="text-4xl md:text-5xl font-display font-bold mt-2" style={{ color: "#B8963E" }}>
                        {formattedMonthly}
                      </p>
                      <p className="text-[var(--text-secondary)] text-sm mt-1">per maand</p>
                      <p className="text-lg font-display font-bold mt-4 text-[var(--text-primary)]">
                        {formattedYearly} per jaar
                      </p>
                    </div>

                    <div className="border-t border-[var(--border)] pt-4 mb-6">
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        <strong>Aanbeveling:</strong> {recommendation}
                      </p>
                    </div>

                    <div className="border-t border-[var(--border)] pt-6">
                      <p className="text-sm font-medium mb-3">Ontvang het volledige rapport per e-mail:</p>
                      <LeadCaptureForm
                        vertical="beslissers"
                        source="calculator"
                        title=""
                        buttonText="Verstuur rapport"
                        fields={["name", "email"]}
                        compact
                        metadata={{
                          fte, hours, rate, delayed, monthlyCost, yearlyCost, recommendation,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="glass-card rounded-xl p-8 border border-[var(--border)] flex items-center justify-center min-h-[300px]">
                    <div className="text-center text-[var(--text-secondary)]">
                      <Calculator size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-sm">Vul de gegevens in en klik op &ldquo;Bereken kosten&rdquo;</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Context */}
      <section className="py-20 bg-gray-50 border-y border-[var(--border)]">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <h2 className="text-2xl font-display font-bold mb-6">Hoe werkt deze berekening?</h2>
          <div className="text-[var(--text-secondary)] leading-relaxed space-y-4">
            <p>
              De formule is eenvoudig: <strong>(FTE &times; uren &times; uurtarief &times; 4,33 weken)</strong> plus
              de geschatte kosten van vertraagde beslissingen. Het eerste deel meet de directe
              kosten van handmatig rapportagewerk. Het tweede deel — vaak veel groter — meet
              wat het kost als beslissingen te laat of op basis van verkeerde data worden genomen.
            </p>
            <p>
              Dit is de taal die CFO&apos;s en COO&apos;s spreken. Niet &ldquo;we hebben een dashboard nodig&rdquo;,
              maar &ldquo;dit kost ons X per maand en dat kunnen we terugbrengen naar Y&rdquo;.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
