"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles, Search, Users, Target, RefreshCw, TrendingUp, AlertCircle } from "lucide-react";

// ─── Types die terugkomen uit /api/admin/seo/overview ───────────────

interface ArticleHit {
  postId: string;
  slug: string;
  title: string;
  status: string;
  count: number;
  matchedTerms: string[];
}

interface KeywordAnalysis {
  term: string;
  aliases: string[];
  personas: string[];
  theme: string;
  priority: 1 | 2 | 3;
  sources: string[];
  articleCount: number;
  totalOccurrences: number;
  hits: ArticleHit[];
  opportunityScore: number;
}

interface PersonaCoverage {
  persona: string;
  totalKeywords: number;
  coveredKeywords: number;
  coveragePct: number;
  topGaps: { term: string; priority: number }[];
}

interface SeoOverview {
  generatedAt: string;
  totalPublished: number;
  keywords: KeywordAnalysis[];
  personaCoverage: PersonaCoverage[];
  summary: {
    totalKeywords: number;
    fullyUncovered: number;
    thinlyCovered: number;
    wellCovered: number;
  };
}

interface Suggestion {
  term: string;
  suggestedTitle: string;
  rationale: string;
  persona: string;
  theme: string;
  sources: string[];
}

// ─── Helpers ────────────────────────────────────────────────────────

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("admin_token") || "";
}

function coverageColor(pct: number): string {
  if (pct >= 66) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (pct >= 33) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function priorityLabel(p: 1 | 2 | 3): string {
  return p === 3 ? "hoog" : p === 2 ? "middel" : "laag";
}

// ─── Page ───────────────────────────────────────────────────────────

export default function AdminSeoPage() {
  const [tab, setTab] = useState<"opportunities" | "density" | "personas" | "suggest">("opportunities");
  const [overview, setOverview] = useState<SeoOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [personaFilter, setPersonaFilter] = useState<string>("all");
  const [themeFilter, setThemeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [suggestPersona, setSuggestPersona] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/seo/overview", {
        headers: { "x-admin-token": getToken() },
      });
      if (!res.ok) {
        console.error("SEO overview failed", await res.text());
        setOverview(null);
        return;
      }
      const data: SeoOverview = await res.json();
      setOverview(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const filteredKeywords = useMemo(() => {
    if (!overview) return [];
    return overview.keywords.filter((k) => {
      if (personaFilter !== "all" && !k.personas.includes(personaFilter)) return false;
      if (themeFilter !== "all" && k.theme !== themeFilter) return false;
      if (search && !k.term.toLowerCase().includes(search.toLowerCase()) &&
        !k.aliases.some((a) => a.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [overview, personaFilter, themeFilter, search]);

  const allThemes = useMemo(() => {
    if (!overview) return [];
    return Array.from(new Set(overview.keywords.map((k) => k.theme))).sort();
  }, [overview]);

  const allPersonas = useMemo(() => {
    if (!overview) return [];
    return Array.from(new Set(overview.keywords.flatMap((k) => k.personas))).sort();
  }, [overview]);

  async function runSuggest() {
    setSuggestLoading(true);
    setSuggestError(null);
    try {
      const res = await fetch("/api/admin/seo/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": getToken(),
        },
        body: JSON.stringify({
          persona: suggestPersona || undefined,
          limit: 10,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSuggestError(data.error || "Onbekende fout");
        setSuggestions([]);
      } else {
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      setSuggestError(err instanceof Error ? err.message : "Netwerkfout");
    } finally {
      setSuggestLoading(false);
    }
  }

  async function addToIdeas(s: Suggestion) {
    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": getToken(),
        },
        body: JSON.stringify({
          action: "add-idea",
          title: s.suggestedTitle,
          keywords: [s.term, ...(s.term.split(" ").length > 1 ? [] : [])],
          rationale: s.rationale,
          target_audience: s.persona,
        }),
      });
      if (res.ok) {
        alert(`Toegevoegd aan onderwerpen: "${s.suggestedTitle}"`);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Toevoegen mislukt: ${data.error || res.statusText}`);
      }
    } catch (err) {
      alert(`Netwerkfout: ${err instanceof Error ? err.message : "onbekend"}`);
    }
  }

  const tabClass = (t: string) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${tab === t ? "bg-[var(--primary)] text-white" : "text-[var(--text-secondary)] hover:bg-gray-100"}`;

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <Link href="/admin" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-2 mb-6 text-sm transition-colors">
          <ArrowLeft size={16} /> Terug naar admin
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">SEO Dashboard</h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Keyword-dichtheid over alle gepubliceerde artikelen + gap-analyse tegen de doelgroep-universe (CIO, CEO, IT-manager, Data-manager, PBI-dev).
            </p>
          </div>
          <button
            onClick={fetchOverview}
            disabled={refreshing}
            className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
          >
            {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Vernieuwen
          </button>
        </div>

        {/* Summary stats */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card rounded-xl p-4">
              <div className="text-2xl font-display font-bold text-[var(--primary)]">{overview.totalPublished}</div>
              <div className="text-xs text-[var(--text-secondary)]">Gepubliceerde artikelen</div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-2xl font-display font-bold text-red-600">{overview.summary.fullyUncovered}</div>
              <div className="text-xs text-[var(--text-secondary)]">Termen niet gedekt (0 art.)</div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-2xl font-display font-bold text-amber-600">{overview.summary.thinlyCovered}</div>
              <div className="text-xs text-[var(--text-secondary)]">Dun gedekt (1-2 art.)</div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-2xl font-display font-bold text-emerald-600">{overview.summary.wellCovered}</div>
              <div className="text-xs text-[var(--text-secondary)]">Goed gedekt (≥3 art.)</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto">
          <button onClick={() => setTab("opportunities")} className={tabClass("opportunities")}>
            <span className="flex items-center gap-2"><Target size={16} /> Opportunities</span>
          </button>
          <button onClick={() => setTab("density")} className={tabClass("density")}>
            <span className="flex items-center gap-2"><Search size={16} /> Density</span>
          </button>
          <button onClick={() => setTab("personas")} className={tabClass("personas")}>
            <span className="flex items-center gap-2"><Users size={16} /> Per persona</span>
          </button>
          <button onClick={() => setTab("suggest")} className={tabClass("suggest")}>
            <span className="flex items-center gap-2"><Sparkles size={16} /> AI-suggesties</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[var(--text-secondary)]">Analyse loopt...</div>
        ) : !overview ? (
          <div className="glass-card rounded-xl p-6 border border-red-200 bg-red-50 text-red-700 flex items-center gap-3">
            <AlertCircle size={20} />
            <div>Kon SEO-data niet laden. Check admin-token en Supabase-config.</div>
          </div>
        ) : (
          <>
            {/* ── Filter bar (density + opportunities) ── */}
            {(tab === "opportunities" || tab === "density") && (
              <div className="glass-card rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center text-sm">
                <input
                  type="text"
                  placeholder="Zoek term..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 min-w-[200px] bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2"
                />
                <select
                  value={personaFilter}
                  onChange={(e) => setPersonaFilter(e.target.value)}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2"
                >
                  <option value="all">Alle persona&apos;s</option>
                  {allPersonas.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select
                  value={themeFilter}
                  onChange={(e) => setThemeFilter(e.target.value)}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2"
                >
                  <option value="all">Alle thema&apos;s</option>
                  {allThemes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span className="text-xs text-[var(--text-secondary)]">{filteredKeywords.length} termen</span>
              </div>
            )}

            {/* ── Opportunities tab ── */}
            {tab === "opportunities" && (
              <div className="glass-card rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-[var(--border)] text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Zoekterm</th>
                      <th className="px-4 py-3 font-medium">Persona&apos;s</th>
                      <th className="px-4 py-3 font-medium">Thema</th>
                      <th className="px-4 py-3 font-medium text-center">Artikelen</th>
                      <th className="px-4 py-3 font-medium text-center">Priority</th>
                      <th className="px-4 py-3 font-medium text-center">Opportunity</th>
                      <th className="px-4 py-3 font-medium">Bronnen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKeywords
                      .filter((k) => k.opportunityScore > 0)
                      .slice(0, 100)
                      .map((k) => (
                        <tr key={k.term} className="border-b border-[var(--border)] hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-[var(--text-primary)]">{k.term}</div>
                            {k.aliases.length > 0 && (
                              <div className="text-xs text-[var(--text-secondary)]">+ {k.aliases.slice(0, 3).join(", ")}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {k.personas.map((p) => (
                                <span key={p} className="bg-gray-100 text-[var(--text-secondary)] px-2 py-0.5 rounded text-xs">{p}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[var(--text-secondary)]">{k.theme}</td>
                          <td className={`px-4 py-3 text-center font-semibold ${k.articleCount === 0 ? "text-red-600" : k.articleCount < 3 ? "text-amber-600" : "text-emerald-600"}`}>
                            {k.articleCount}
                          </td>
                          <td className="px-4 py-3 text-center text-xs">{priorityLabel(k.priority)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 bg-[var(--primary)] text-white px-2 py-0.5 rounded text-xs font-semibold">
                              <TrendingUp size={12} /> {k.opportunityScore}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{k.sources.join(", ")}</td>
                        </tr>
                      ))}
                    {filteredKeywords.filter((k) => k.opportunityScore > 0).length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-[var(--text-secondary)]">
                          Geen open kansen voor deze filter — dekking is goed! 🎯
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Density tab ── */}
            {tab === "density" && (
              <div className="space-y-3">
                {filteredKeywords.map((k) => (
                  <details key={k.term} className="glass-card rounded-xl">
                    <summary className="px-4 py-3 cursor-pointer flex items-center gap-4 flex-wrap">
                      <span className="font-medium flex-1">{k.term}</span>
                      <span className="text-xs text-[var(--text-secondary)]">{k.theme}</span>
                      <span className={`text-sm font-semibold ${k.articleCount === 0 ? "text-red-600" : k.articleCount < 3 ? "text-amber-600" : "text-emerald-600"}`}>
                        {k.articleCount} art. · {k.totalOccurrences} mentions
                      </span>
                    </summary>
                    <div className="px-4 pb-4 border-t border-[var(--border)] pt-3">
                      <div className="text-xs text-[var(--text-secondary)] mb-3">
                        Aliases: {k.aliases.join(", ") || "geen"} · Persona&apos;s: {k.personas.join(", ")} · Bronnen: {k.sources.join(", ")}
                      </div>
                      {k.hits.length === 0 ? (
                        <div className="text-sm text-red-600">Nog geen artikel bespreekt deze term.</div>
                      ) : (
                        <ul className="space-y-2 text-sm">
                          {k.hits.map((h) => (
                            <li key={h.postId} className="flex items-center gap-3">
                              <span className="bg-[var(--primary)] text-white px-2 py-0.5 rounded text-xs font-mono min-w-[3rem] text-center">{h.count}x</span>
                              <Link href={`/blog/${h.slug}`} target="_blank" className="text-[var(--primary)] hover:underline flex-1">
                                {h.title}
                              </Link>
                              <span className="text-xs text-[var(--text-secondary)]">{h.matchedTerms.join(", ")}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            )}

            {/* ── Personas tab ── */}
            {tab === "personas" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overview.personaCoverage.map((pc) => (
                  <div key={pc.persona} className="glass-card rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display font-bold text-lg">{pc.persona}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${coverageColor(pc.coveragePct)}`}>
                        {pc.coveragePct}% dekking
                      </span>
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] mb-4">
                      {pc.coveredKeywords} van {pc.totalKeywords} relevante zoektermen zijn minstens in 1 artikel behandeld.
                    </div>
                    {pc.topGaps.length > 0 && (
                      <>
                        <div className="text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                          Top 5 gaps (niet gedekt)
                        </div>
                        <ul className="space-y-1.5">
                          {pc.topGaps.map((g) => (
                            <li key={g.term} className="text-sm flex items-center justify-between">
                              <span>{g.term}</span>
                              <span className="text-xs text-[var(--text-secondary)]">prio {g.priority}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── AI suggest tab ── */}
            {tab === "suggest" && (
              <div className="space-y-6">
                <div className="glass-card rounded-xl p-6 flex flex-wrap gap-3 items-center">
                  <label className="text-sm text-[var(--text-secondary)]">
                    Focus op persona:
                    <select
                      value={suggestPersona}
                      onChange={(e) => setSuggestPersona(e.target.value)}
                      className="ml-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2"
                    >
                      <option value="">Alle persona&apos;s</option>
                      {allPersonas.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={runSuggest}
                    disabled={suggestLoading}
                    className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
                  >
                    {suggestLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Genereer suggesties (Claude)
                  </button>
                  <span className="text-xs text-[var(--text-secondary)]">
                    Claude brainstormt zoekterm-kansen op basis van huidige dekking + wat er leeft op Reddit/X/LinkedIn.
                  </span>
                </div>

                {suggestError && (
                  <div className="glass-card rounded-xl p-4 border border-red-200 bg-red-50 text-red-700 text-sm">
                    {suggestError}
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div className="space-y-3">
                    {suggestions.map((s, i) => (
                      <div key={i} className="glass-card rounded-xl p-5">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-display font-bold flex-1">{s.suggestedTitle}</h3>
                          <button
                            onClick={() => addToIdeas(s)}
                            className="btn-secondary inline-flex items-center gap-1 px-3 py-1 text-xs whitespace-nowrap"
                          >
                            → Naar onderwerpen
                          </button>
                        </div>
                        <div className="text-sm text-[var(--text-secondary)] mb-3">
                          Zoekterm: <strong>{s.term}</strong>
                        </div>
                        <p className="text-sm leading-relaxed mb-3">{s.rationale}</p>
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          <span className="bg-[rgba(30,58,95,0.1)] text-[var(--primary)] px-2 py-0.5 rounded">{s.persona}</span>
                          <span className="bg-gray-100 text-[var(--text-secondary)] px-2 py-0.5 rounded">{s.theme}</span>
                          {s.sources.map((src) => (
                            <span key={src} className="bg-[rgba(245,158,11,0.1)] text-[var(--accent)] px-2 py-0.5 rounded">{src}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
