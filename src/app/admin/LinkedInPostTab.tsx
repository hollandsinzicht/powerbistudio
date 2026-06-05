"use client";

import { useState } from "react";
import {
  Loader2,
  Sparkles,
  Check,
  Copy,
  MessageSquare,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

type FunnelStage = "tofu" | "mofu" | "bofu";
type PostCategory =
  | "3-hr-problemen"
  | "klantcase"
  | "mythe-provocatie"
  | "persoonlijk-visie";

interface InterviewTurn {
  vraag: string;
  antwoord: string;
}

interface UsageInfo {
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  costEur: number;
}

const FUNNELS: { value: FunnelStage; label: string; hint: string }[] = [
  { value: "tofu", label: "TOFU", hint: "Herkenning, geen aanbod" },
  { value: "mofu", label: "MOFU", hint: "Verdieping, vertrouwen" },
  { value: "bofu", label: "BOFU", hint: "Concreet aanbod" },
];

const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "3-hr-problemen", label: "3 HR-data-problemen" },
  { value: "klantcase", label: "Klantcase / verhaal" },
  { value: "mythe-provocatie", label: "Mythe / provocatie" },
  { value: "persoonlijk-visie", label: "Persoonlijk / visie" },
];

type Step = "opzet" | "gesprek" | "klaar";

export default function LinkedInPostTab() {
  const [step, setStep] = useState<Step>("opzet");

  // Opzet
  const [funnelStage, setFunnelStage] = useState<FunnelStage | null>(null);
  const [category, setCategory] = useState<PostCategory | null>(null);
  const [topic, setTopic] = useState("");

  // Gesprek
  const [interview, setInterview] = useState<InterviewTurn[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [lastBatch, setLastBatch] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Resultaat
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    postText: string;
    hashtags: string[];
    usage?: UsageInfo;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Haalt de volgende vragen op (opening of vervolg) op basis van de tot nu toe
  // verzamelde antwoorden. answersSoFar=[] → de AI geeft 2-3 openingsvragen.
  const fetchQuestions = async (answersSoFar: InterviewTurn[]) => {
    setLoadingQuestions(true);
    try {
      const res = await fetch("/api/admin/blog/post-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ funnelStage, category, topic: topic.trim(), answers: answersSoFar }),
      });
      if (res.ok) {
        const data = await res.json();
        const qs: string[] = Array.isArray(data.questions) ? data.questions : [];
        if (qs.length === 0) {
          // Geen vragen meer → meteen naar genereren.
          setStep("klaar");
          return;
        }
        setQuestions(qs);
        setAnswers(Array(qs.length).fill(""));
        setLastBatch(Boolean(data.done));
        setStep("gesprek");
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Vragen ophalen mislukt: ${data.error || res.statusText}`);
      }
    } catch (e) {
      console.error(e);
      alert("Netwerkfout bij het ophalen van vragen.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleStart = async () => {
    if (!funnelStage || !category || !topic.trim()) {
      alert("Kies funnel-fase, categorie en een onderwerp.");
      return;
    }
    setInterview([]);
    await fetchQuestions([]);
  };

  const handleNext = async () => {
    if (answers.some((a) => !a.trim())) {
      alert("Beantwoord alle vragen voordat je verdergaat.");
      return;
    }
    const newTurns: InterviewTurn[] = questions.map((vraag, i) => ({
      vraag,
      antwoord: answers[i].trim(),
    }));
    const updated = [...interview, ...newTurns];
    setInterview(updated);

    if (lastBatch) {
      setStep("klaar");
    } else {
      await fetchQuestions(updated);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/blog/post-from-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ funnelStage, category, topic: topic.trim(), interview }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult({ postText: data.postText || "", hashtags: data.hashtags || [], usage: data.usage });
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Genereren mislukt: ${data.error || res.statusText}`);
      }
    } catch (e) {
      console.error(e);
      alert("Netwerkfout bij genereren.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const full = `${result.postText}\n\n${result.hashtags.join(" ")}`.trim();
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Kopiëren mislukt — selecteer en kopieer handmatig.");
    }
  };

  const handleReset = () => {
    setStep("opzet");
    setFunnelStage(null);
    setCategory(null);
    setTopic("");
    setInterview([]);
    setQuestions([]);
    setAnswers([]);
    setLastBatch(false);
    setResult(null);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="font-display font-bold text-base mb-1 flex items-center gap-2">
          <MessageSquare size={18} className="text-[#0A66C2]" />
          LinkedIn-post via vraaggesprek
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Een kort adaptief gesprek voedt de generator. De post bouwt voort op je
          eerdere posts, zodat de funnel logisch doorloopt en niets zich herhaalt.
        </p>
      </div>

      {/* ===== Stap 1: Opzet ===== */}
      {step === "opzet" && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Funnel-fase
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FUNNELS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFunnelStage(f.value)}
                  className={`text-left p-2.5 rounded-lg border text-sm transition-all ${
                    funnelStage === f.value
                      ? "border-[var(--accent)] bg-[rgba(245,158,11,0.05)]"
                      : "border-[var(--border)] hover:border-[var(--text-secondary)]"
                  }`}
                >
                  <div className="font-semibold">{f.label}</div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{f.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Categorie
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`text-left p-2.5 rounded-lg border text-sm font-medium transition-all ${
                    category === c.value
                      ? "border-[var(--accent)] bg-[rgba(245,158,11,0.05)]"
                      : "border-[var(--border)] hover:border-[var(--text-secondary)]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Onderwerp
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Bijv. waarom verzuimcijfers vaak misleiden"
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <button
            onClick={handleStart}
            disabled={loadingQuestions}
            className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingQuestions ? (
              <><Loader2 size={16} className="animate-spin" /> Gesprek starten...</>
            ) : (
              <><MessageSquare size={16} /> Start gesprek</>
            )}
          </button>
        </div>
      )}

      {/* ===== Stap 2: Gesprek ===== */}
      {step === "gesprek" && (
        <div className="space-y-5">
          <div className="text-xs text-[var(--text-secondary)]">
            {interview.length > 0 && <span>{interview.length} beantwoord · </span>}
            {lastBatch ? "Laatste vraag" : "Beantwoord en ga verder"}
          </div>

          {questions.map((q, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {q}
              </label>
              <textarea
                value={answers[i] || ""}
                onChange={(e) =>
                  setAnswers((cur) => {
                    const next = [...cur];
                    next[i] = e.target.value;
                    return next;
                  })
                }
                placeholder="Jouw antwoord in eigen woorden..."
                rows={3}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleNext}
              disabled={loadingQuestions}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {loadingQuestions ? (
                <><Loader2 size={16} className="animate-spin" /> Bezig...</>
              ) : lastBatch ? (
                <><Check size={16} /> Naar genereren</>
              ) : (
                <><ArrowRight size={16} /> Volgende</>
              )}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-sm px-3 py-1.5 border border-[var(--border)] rounded-lg hover:border-[var(--accent)]"
            >
              <RotateCcw size={14} /> Opnieuw
            </button>
          </div>
        </div>
      )}

      {/* ===== Stap 3: Genereren / Resultaat ===== */}
      {step === "klaar" && (
        <div className="space-y-5">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
            <div className="text-sm font-semibold text-[var(--text-primary)]">Gesprek ({interview.length})</div>
            {interview.map((t, i) => (
              <div key={i} className="text-xs">
                <div className="font-medium text-[var(--text-secondary)]">{t.vraag}</div>
                <div className="text-[var(--text-primary)] mt-0.5 whitespace-pre-wrap">{t.antwoord}</div>
              </div>
            ))}
          </div>

          {!result && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <><Loader2 size={16} className="animate-spin" /> Bezig...</>
                ) : (
                  <><Sparkles size={16} /> Genereer post</>
                )}
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-sm px-3 py-1.5 border border-[var(--border)] rounded-lg hover:border-[var(--accent)]"
              >
                <RotateCcw size={14} /> Opnieuw
              </button>
            </div>
          )}

          {result && (
            <div className="space-y-3 pt-3 border-t border-[var(--border)]">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Resultaat</label>
                <span className="text-[10px] text-[var(--text-secondary)] text-right">
                  {result.usage && (
                    <>≈ €{result.usage.costEur.toFixed(3).replace(".", ",")} · {result.usage.inputTokens.toLocaleString("nl-NL")} in / {result.usage.outputTokens.toLocaleString("nl-NL")} out · </>
                  )}
                  {result.postText.length} tekens
                </span>
              </div>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
                {result.postText}
              </div>
              <div className="flex flex-wrap gap-2">
                {result.hashtags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-[rgba(10,102,194,0.1)] text-[#0A66C2] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#0A66C2] text-white rounded-lg hover:bg-[#084d92] transition-colors"
                >
                  {copied ? <><Check size={15} /> Gekopieerd!</> : <><Copy size={15} /> Kopieer naar klembord</>}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-lg hover:border-[var(--accent)] disabled:opacity-50"
                >
                  <Sparkles size={15} /> Probeer opnieuw
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-lg hover:border-[var(--accent)]"
                >
                  <RotateCcw size={15} /> Nieuw gesprek
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
