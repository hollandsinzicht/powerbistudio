"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Sparkles,
  Check,
  Copy,
  Save,
  CircleDot,
  CheckCircle2,
  PenLine,
  Linkedin,
} from "lucide-react";
import type { BrandCategory } from "@/lib/brand-profile-schema";

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

type LinkedInStyle = "educatief" | "scherp" | "provocatief" | "storytelling";

const LINKEDIN_STYLES: { value: LinkedInStyle; label: string }[] = [
  { value: "educatief", label: "Educatief" },
  { value: "scherp", label: "Scherp & direct" },
  { value: "provocatief", label: "Provocatief" },
  { value: "storytelling", label: "Storytelling" },
];

interface CategoryProgress {
  filled: number;
  total: number;
  pct: number;
}

interface ProgressData {
  perCategory: Record<string, CategoryProgress>;
  total: CategoryProgress;
}

// Sidebar-keuze: een categorie-id óf het vrije-post paneel.
type Selection = string | "__freepost__";

export default function ProfielTab() {
  const [schema, setSchema] = useState<BrandCategory[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Selection>("context");

  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [interviewingId, setInterviewingId] = useState<string | null>(null);

  // Vrije-post panel
  const [topic, setTopic] = useState("");
  const [angle, setAngle] = useState("");
  const [freeStyle, setFreeStyle] = useState<LinkedInStyle>("educatief");
  const [freeLoading, setFreeLoading] = useState(false);
  const [freeResult, setFreeResult] = useState<{
    postText: string;
    hashtags: string[];
    usage?: { inputTokens: number; outputTokens: number; costUsd: number; costEur: number };
  } | null>(null);
  const [freeCopied, setFreeCopied] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/brand", { headers: { "x-admin-token": getToken() } });
      if (res.ok) {
        const data = await res.json();
        setSchema(data.schema || []);
        setAnswers(data.answers || {});
        setProgress(data.progress || null);
      }
    } catch (e) {
      console.error("Profiel laden mislukt:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const valueFor = (id: string) => (id in drafts ? drafts[id] : answers[id] || "");
  const isDirty = (id: string) => id in drafts && drafts[id] !== (answers[id] || "");

  const handleSave = async (id: string) => {
    setSavingId(id);
    try {
      const res = await fetch("/api/admin/brand", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ key: id, value: valueFor(id) }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnswers((cur) => ({ ...cur, [id]: valueFor(id) }));
        setDrafts((cur) => {
          const next = { ...cur };
          delete next[id];
          return next;
        });
        if (data.progress) setProgress(data.progress);
        setSavedId(id);
        setTimeout(() => setSavedId((c) => (c === id ? null : c)), 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Opslaan mislukt: ${data.error || res.statusText}`);
      }
    } catch (e) {
      console.error(e);
      alert("Netwerkfout bij opslaan.");
    } finally {
      setSavingId(null);
    }
  };

  const handleInterview = async (id: string) => {
    setInterviewingId(id);
    try {
      const res = await fetch("/api/admin/brand/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ kennispuntId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.draft) setDrafts((cur) => ({ ...cur, [id]: data.draft }));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`AI-interview mislukt: ${data.error || res.statusText}`);
      }
    } catch (e) {
      console.error(e);
      alert("Netwerkfout bij AI-interview.");
    } finally {
      setInterviewingId(null);
    }
  };

  const handleGenerateFree = async () => {
    if (!topic.trim()) {
      alert("Vul een onderwerp in.");
      return;
    }
    setFreeLoading(true);
    setFreeResult(null);
    try {
      const res = await fetch("/api/admin/blog/free-post", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ topic, angle, style: freeStyle }),
      });
      if (res.ok) {
        const data = await res.json();
        setFreeResult({ postText: data.postText || "", hashtags: data.hashtags || [], usage: data.usage });
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Genereren mislukt: ${data.error || res.statusText}`);
      }
    } catch (e) {
      console.error(e);
      alert("Netwerkfout bij genereren.");
    } finally {
      setFreeLoading(false);
    }
  };

  const handleCopyFree = async () => {
    if (!freeResult) return;
    const full = `${freeResult.postText}\n\n${freeResult.hashtags.join(" ")}`.trim();
    try {
      await navigator.clipboard.writeText(full);
      setFreeCopied(true);
      setTimeout(() => setFreeCopied(false), 2500);
    } catch {
      alert("Kopiëren mislukt — selecteer en kopieer handmatig.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-[var(--color-neutral-700)]">
        <Loader2 size={20} className="animate-spin" /> Profiel laden...
      </div>
    );
  }

  const activeCategory = schema.find((c) => c.id === selected);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      {/* ===== Sidebar ===== */}
      <aside className="space-y-2">
        {progress && (
          <div className="mb-4 p-3 rounded-lg bg-[var(--color-white)] border border-[var(--color-neutral-200)]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-[var(--color-neutral-900)]">Totale voortgang</span>
              <span className="text-[var(--color-neutral-700)]">
                {progress.total.filled}/{progress.total.total}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-[var(--color-primary-900)] transition-all"
                style={{ width: `${progress.total.pct}%` }}
              />
            </div>
          </div>
        )}

        {schema.map((cat) => {
          const p = progress?.perCategory[cat.id];
          const active = selected === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelected(cat.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                active
                  ? "border-[var(--color-action-600)] bg-[rgba(245,158,11,0.05)]"
                  : "border-[var(--color-neutral-200)] hover:border-[var(--color-neutral-700)]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{cat.title}</span>
                {p && <span className="text-[11px] text-[var(--color-neutral-700)]">{p.pct}%</span>}
              </div>
              {p && (
                <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-action-600)] transition-all"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}

        <button
          onClick={() => setSelected("__freepost__")}
          className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-2 ${
            selected === "__freepost__"
              ? "border-[#0A66C2] bg-[rgba(10,102,194,0.05)]"
              : "border-[var(--color-neutral-200)] hover:border-[var(--color-neutral-700)]"
          }`}
        >
          <Linkedin size={16} className="text-[#0A66C2]" />
          <span className="font-semibold text-sm">Vrije post genereren</span>
        </button>
      </aside>

      {/* ===== Main ===== */}
      <div className="min-w-0">
        {/* Kennispunt-kaarten */}
        {activeCategory && (
          <div className="space-y-6">
            {activeCategory.subcategories.map((sub) => (
              <section key={sub.id}>
                <h3 className="font-display font-bold text-sm uppercase tracking-wide text-[var(--color-neutral-700)] mb-3">
                  {sub.title}
                </h3>
                <div className="space-y-4">
                  {sub.kennispunten.map((kp) => {
                    const filled = Boolean((answers[kp.id] || "").trim());
                    const dirty = isDirty(kp.id);
                    return (
                      <div
                        key={kp.id}
                        className="p-4 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-white)]"
                      >
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="min-w-0">
                            <div className="font-semibold text-sm">{kp.title}</div>
                            <p className="text-xs text-[var(--color-neutral-700)] mt-0.5">{kp.question}</p>
                          </div>
                          <span
                            className={`shrink-0 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${
                              filled
                                ? "bg-[rgba(16,185,129,0.1)] text-green-700"
                                : "bg-gray-100 text-[var(--color-neutral-700)]"
                            }`}
                          >
                            {filled ? <CheckCircle2 size={12} /> : <CircleDot size={12} />}
                            {filled ? "Ingevuld" : "Te doen"}
                          </span>
                        </div>

                        <textarea
                          value={valueFor(kp.id)}
                          onChange={(e) =>
                            setDrafts((cur) => ({ ...cur, [kp.id]: e.target.value }))
                          }
                          placeholder={kp.placeholder || "Jouw antwoord..."}
                          rows={4}
                          className="w-full mt-2 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-action-600)]"
                        />

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <button
                            onClick={() => handleSave(kp.id)}
                            disabled={savingId === kp.id || !dirty}
                            className="btn-primary inline-flex items-center gap-2 text-sm px-3 py-1.5 disabled:opacity-40"
                          >
                            {savingId === kp.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : savedId === kp.id ? (
                              <Check size={14} />
                            ) : (
                              <Save size={14} />
                            )}
                            {savedId === kp.id ? "Opgeslagen" : "Opslaan"}
                          </button>
                          <button
                            onClick={() => handleInterview(kp.id)}
                            disabled={interviewingId === kp.id}
                            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 border border-[var(--color-neutral-200)] rounded-lg hover:border-[var(--color-action-600)] disabled:opacity-50"
                            title="Laat AI een conceptantwoord opstellen dat je daarna bewerkt"
                          >
                            {interviewingId === kp.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <PenLine size={14} />
                            )}
                            AI-interview
                          </button>
                          {dirty && (
                            <span className="text-[11px] text-[var(--color-action-600)]">niet opgeslagen</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Vrije-post panel */}
        {selected === "__freepost__" && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <h3 className="font-display font-bold text-base mb-1">Vrije LinkedIn post</h3>
              <p className="text-sm text-[var(--color-neutral-700)]">
                Genereer een post vanuit je merkprofiel — zonder dat er een blogartikel voor nodig is.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-1">Onderwerp</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Bijv. waarom verzuimcijfers vaak misleiden"
                className="w-full bg-[var(--color-white)] border border-[var(--color-neutral-200)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-action-600)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-1">
                Invalshoek <span className="font-normal">(optioneel)</span>
              </label>
              <textarea
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                placeholder="Bijv. vanuit een concrete situatie bij een mid-market HR-afdeling"
                rows={2}
                className="w-full bg-[var(--color-white)] border border-[var(--color-neutral-200)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-action-600)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">Stijl</label>
              <div className="grid grid-cols-2 gap-2">
                {LINKEDIN_STYLES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setFreeStyle(s.value)}
                    className={`text-left p-2.5 rounded-lg border text-sm font-medium transition-all ${
                      freeStyle === s.value
                        ? "border-[var(--color-action-600)] bg-[rgba(245,158,11,0.05)]"
                        : "border-[var(--color-neutral-200)] hover:border-[var(--color-neutral-700)]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateFree}
              disabled={freeLoading}
              className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {freeLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Bezig...</>
              ) : (
                <><Sparkles size={16} /> Genereer post</>
              )}
            </button>

            {freeResult && (
              <div className="space-y-3 pt-3 border-t border-[var(--color-neutral-200)]">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-[var(--color-neutral-700)]">Resultaat</label>
                  <span className="text-[10px] text-[var(--color-neutral-700)] text-right">
                    {freeResult.usage && (
                      <>≈ €{freeResult.usage.costEur.toFixed(3).replace('.', ',')} · {freeResult.usage.inputTokens.toLocaleString('nl-NL')} in / {freeResult.usage.outputTokens.toLocaleString('nl-NL')} out · </>
                    )}
                    {freeResult.postText.length} tekens
                  </span>
                </div>
                <div className="bg-[var(--color-white)] border border-[var(--color-neutral-200)] rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-neutral-900)]">
                  {freeResult.postText}
                </div>
                <div className="flex flex-wrap gap-2">
                  {freeResult.hashtags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-[rgba(10,102,194,0.1)] text-[#0A66C2] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handleCopyFree}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#0A66C2] text-white rounded-lg hover:bg-[#084d92] transition-colors"
                  >
                    {freeCopied ? <><Check size={15} /> Gekopieerd!</> : <><Copy size={15} /> Kopieer naar klembord</>}
                  </button>
                  <button
                    onClick={handleGenerateFree}
                    disabled={freeLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--color-neutral-200)] rounded-lg hover:border-[var(--color-action-600)] disabled:opacity-50"
                  >
                    <Sparkles size={15} /> Probeer opnieuw
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
