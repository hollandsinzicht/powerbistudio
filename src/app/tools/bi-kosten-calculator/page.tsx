"use client";

import { useState } from "react";
import { Calculator, TrendingDown, ArrowRight } from "lucide-react";
import LeadCaptureForm from "@/components/lead/LeadCaptureForm";

function getRecommendation(cost: number): string {
  if (cost < 5000) return 'Jullie kosten zijn relatief laag. Een HR Analytics Readiness Scan helpt om te bepalen waar de quick wins zitten zonder direct een investering aan te gaan.';
  if (cost < 15000) return 'Dit bedrag rechtvaardigt een gerichte investering. Een Quick Scan (€1.950, 1,5 dag) levert binnen een week een prioriteitenlijst op waarmee je morgen kunt beginnen.';
  if (cost < 50000) return 'Dit is een serieus bedrag dat structurele verbetering rechtvaardigt. Een Foundation-traject (€34.500 vast, 6-8 weken) zou dit binnen een jaar terugverdienen.';
  return 'Dit is een kritieke kostenpost. Directe actie is nodig. Een Foundation Plus-traject (€58.500) plus DashPortal HR Hosting voor doorlopende support is meestal de juiste combinatie.';
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
      <section className="border-b border-[var(--border)] bg-white">
        <div className="container mx-auto px-6 py-20 md:px-12 md:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">HR Rapportage-kosten Calculator</p>
            <h1 className="mb-4">
              Wat kost handmatige HR-rapportage jullie organisatie?
            </h1>
            <p className="lead">
              Bereken de maandelijkse en jaarlijkse kosten van handmatig HR-rapportagewerk
              door HR-medewerkers en controllers — plus de gemiste-inzicht-kosten.
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
                      Aantal HR-medewerkers + controllers die handmatig rapporteren
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range" min={1} max={50} value={fte}
                        onChange={(e) => setFte(Number(e.target.value))}
                        className="flex-grow accent-[var(--color-accent-700)]"
                      />
                      <span className="text-lg font-mono font-bold w-12 text-right">{fte}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Gemiddeld uren per week aan HR-rapportagewerk
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range" min={1} max={40} value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        className="flex-grow accent-[var(--color-accent-700)]"
                      />
                      <span className="text-lg font-mono font-bold w-12 text-right">{hours}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Gemiddeld uurtarief HR-staff (intern, in &euro;)
                    </label>
                    <input
                      type="number" min={25} max={250} value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-accent-700)] transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Geschatte kosten gemiste HR-inzichten per maand (&euro;)
                    </label>
                    <input
                      type="number" min={0} step={1000} value={delayed}
                      onChange={(e) => setDelayed(Number(e.target.value))}
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-accent-700)] transition-colors font-mono"
                    />
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Denk aan: te late verzuim-detectie, ongewenst verloop niet zien aankomen, gemiste onboarding-correcties, formatie-overschrijdingen
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
                      <p className="text-4xl md:text-5xl font-display font-bold mt-2" style={{ color: 'var(--color-accent-700)' }}>
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
      <section className="border-y border-[var(--border)] bg-[var(--color-neutral-50)] py-20">
        <div className="container mx-auto max-w-3xl px-6 md:px-12">
          <h2 className="mb-6">Hoe werkt deze berekening?</h2>
          <div className="space-y-4 leading-relaxed text-[var(--text-secondary)]">
            <p>
              De formule is eenvoudig: <strong>(HR-staff &times; uren per week &times; uurtarief &times; 4,33 weken)</strong>{' '}
              plus de geschatte kosten van gemiste HR-inzichten. Het eerste deel meet de directe
              kosten van handmatig HR-rapportagewerk. Het tweede deel — vaak veel groter — meet
              wat het kost als verzuim, verloop of formatie-issues niet of te laat in beeld komen.
            </p>
            <p>
              Dit is de taal die HR-directeuren en CFO&apos;s spreken. Niet &ldquo;we hebben een dashboard
              nodig&rdquo;, maar &ldquo;dit kost ons X per maand en dat kunnen we terugbrengen naar Y&rdquo;.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
