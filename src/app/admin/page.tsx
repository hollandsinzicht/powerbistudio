"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, FileText, Plus, CheckCircle2, XCircle, PenLine, Eye, Send, Archive, Loader2, CalendarDays, Clock, Link2 } from "lucide-react";

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string; status: string;
  published_at: string | null; scheduled_for: string | null; ai_generated: boolean;
  image: string | null; created_at: string;
}

interface BlogIdea {
  id: string; title: string; keywords: string[]; rationale: string | null;
  target_audience: string | null; status: string; created_at: string;
}

function getToken() { return localStorage.getItem("admin_token") || ""; }

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<"posts" | "ideas" | "new" | "planning">("posts");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [ideas, setIdeas] = useState<BlogIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Ideas tab
  const [seedKeywords, setSeedKeywords] = useState("");

  // Nieuw artikel
  const [newTitle, setNewTitle] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [useAi, setUseAi] = useState(true);

  // Planning
  const [scheduleDates, setScheduleDates] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog", { headers: { "x-admin-token": getToken() } });
      if (res.ok) { const data = await res.json(); setPosts(data.posts || []); setIdeas(data.ideas || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerateIdeas = async () => {
    setGenerating(true);
    try {
      await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ action: "ideas", seedKeywords: seedKeywords || undefined }),
      });
      await fetchData();
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const handleWriteFromIdea = async (ideaId: string) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ action: "write", ideaId }),
      });
      if (res.ok) { await fetchData(); setTab("posts"); }
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const handleWriteNew = async () => {
    if (!newTitle.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({
          action: "write", title: newTitle,
          keywords: newKeywords.split(",").map((k) => k.trim()).filter(Boolean),
        }),
      });
      if (res.ok) { setNewTitle(""); setNewKeywords(""); await fetchData(); setTab("posts"); }
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const handleUpdateLinks = async (postId: string) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ action: "update-links", postId }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Interne links bijgewerkt in ${data.updatedCount} bestaande artikelen.`);
      }
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const handlePostAction = async (id: string, action: string, extra?: Record<string, string>) => {
    try {
      await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ id, action, ...extra }),
      });
      await fetchData();
    } catch (e) { console.error(e); }
  };

  const filteredPosts = statusFilter === "all" ? posts : posts.filter((p) => p.status === statusFilter);
  const scheduledPosts = posts.filter((p) => p.status === "scheduled").sort((a, b) => (a.scheduled_for || "").localeCompare(b.scheduled_for || ""));
  const draftPosts = posts.filter((p) => p.status === "draft");

  const tabClass = (t: string) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t ? "bg-[var(--primary)] text-white" : "text-[var(--text-secondary)] hover:bg-gray-100"}`;

  return (
    <>
      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setTab("posts")} className={tabClass("posts")}>
          <span className="flex items-center gap-2"><FileText size={16} /> Artikelen ({posts.length})</span>
        </button>
        <button onClick={() => setTab("ideas")} className={tabClass("ideas")}>
          <span className="flex items-center gap-2"><Sparkles size={16} /> Onderwerpen ({ideas.length})</span>
        </button>
        <button onClick={() => setTab("planning")} className={tabClass("planning")}>
          <span className="flex items-center gap-2"><CalendarDays size={16} /> Planning ({scheduledPosts.length})</span>
        </button>
        <button onClick={() => setTab("new")} className={tabClass("new")}>
          <span className="flex items-center gap-2"><Plus size={16} /> Nieuw artikel</span>
        </button>
      </div>

      {generating && (
        <div className="mb-6 p-4 rounded-lg bg-[rgba(245,158,11,0.05)] border border-[var(--accent)] flex items-center gap-3">
          <Loader2 size={18} className="text-[var(--accent)] animate-spin" />
          <span className="text-sm text-[var(--text-secondary)]">AI is bezig met genereren... dit kan 30-60 seconden duren.</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-[var(--text-secondary)]">Laden...</div>
      ) : (
        <>
          {/* ===== TAB: ARTIKELEN ===== */}
          {tab === "posts" && (
            <>
              <div className="flex gap-2 mb-6">
                {["all", "draft", "published", "scheduled", "archived"].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${statusFilter === s ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)]"}`}>
                    {s === "all" ? "Alle" : s}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="glass-card rounded-lg p-4 border border-[var(--border)] flex items-center gap-4">
                    {post.image && (
                      <div className="w-16 h-10 rounded overflow-hidden shrink-0 bg-gray-100">
                        <img src={post.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          post.status === "published" ? "bg-green-100 text-green-700" :
                          post.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                          post.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>{post.status}</span>
                        {post.ai_generated && <span className="text-[10px] text-[var(--accent)]">AI</span>}
                        {post.scheduled_for && post.status === "scheduled" && (
                          <span className="text-[10px] text-blue-500 flex items-center gap-1"><Clock size={10} /> {formatDate(post.scheduled_for)}</span>
                        )}
                      </div>
                      <h3 className="font-medium text-sm truncate">{post.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {post.status === "published" && (
                        <>
                          <a href={`/blog/${post.slug}`} target="_blank" className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)]" title="Bekijk"><Eye size={16} /></a>
                          <button onClick={() => handleUpdateLinks(post.id)} disabled={generating} className="p-2 text-[var(--text-secondary)] hover:text-blue-500" title="Update interne links in andere artikelen"><Link2 size={16} /></button>
                        </>
                      )}
                      <Link href={`/admin/edit/${post.id}`} className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)]" title="Bewerk"><PenLine size={16} /></Link>
                      {post.status === "draft" && (
                        <button onClick={() => handlePostAction(post.id, "publish")} className="p-2 text-green-500 hover:text-green-700" title="Publiceer"><Send size={16} /></button>
                      )}
                      {post.status !== "archived" && (
                        <button onClick={() => handlePostAction(post.id, "archive")} className="p-2 text-[var(--text-secondary)] hover:text-red-500" title="Archiveer"><Archive size={16} /></button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredPosts.length === 0 && <p className="text-center py-12 text-[var(--text-secondary)] text-sm">Geen artikelen gevonden.</p>}
              </div>
            </>
          )}

          {/* ===== TAB: ONDERWERPEN ===== */}
          {tab === "ideas" && (
            <>
              {/* Seed keywords */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Keywords of thema&apos;s (optioneel)
                </label>
                <textarea
                  value={seedKeywords}
                  onChange={(e) => setSeedKeywords(e.target.value)}
                  placeholder="Bijv: fabric kosten, dax performance, gemeente bi aanbesteding, copilot semantic model"
                  rows={2}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors text-sm mb-3"
                />
                <button onClick={handleGenerateIdeas} disabled={generating} className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50">
                  <Sparkles size={16} /> AI: Stel onderwerpen voor {seedKeywords ? "(met jouw keywords)" : "(via web search)"}
                </button>
              </div>

              <div className="space-y-3">
                {ideas.map((idea) => (
                  <div key={idea.id} className="glass-card rounded-lg p-4 border border-[var(--border)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            idea.status === "suggested" ? "bg-blue-100 text-blue-700" :
                            idea.status === "approved" ? "bg-green-100 text-green-700" :
                            idea.status === "written" ? "bg-purple-100 text-purple-700" :
                            "bg-gray-100 text-gray-500"
                          }`}>{idea.status}</span>
                          {idea.target_audience && <span className="text-[10px] text-[var(--text-secondary)]">{idea.target_audience}</span>}
                        </div>
                        <h3 className="font-medium text-sm">{idea.title}</h3>
                        {idea.rationale && <p className="text-xs text-[var(--text-secondary)] mt-1">{idea.rationale}</p>}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {idea.keywords.map((kw) => (
                            <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-[var(--text-secondary)]">{kw}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {(idea.status === "suggested" || idea.status === "approved") && (
                          <>
                            {idea.status === "suggested" && (
                              <>
                                <button onClick={() => handlePostAction(idea.id, "approve_idea")} className="p-2 text-green-500 hover:text-green-700" title="Goedkeuren"><CheckCircle2 size={16} /></button>
                                <button onClick={() => handlePostAction(idea.id, "reject_idea")} className="p-2 text-red-400 hover:text-red-600" title="Afwijzen"><XCircle size={16} /></button>
                              </>
                            )}
                            <button onClick={() => handleWriteFromIdea(idea.id)} disabled={generating} className="p-2 text-[var(--accent)] hover:text-[var(--primary)]" title="Schrijf artikel"><PenLine size={16} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {ideas.length === 0 && (
                  <p className="text-center py-12 text-[var(--text-secondary)] text-sm">
                    Geen onderwerpen. Klik op &ldquo;Stel onderwerpen voor&rdquo; om te beginnen.
                  </p>
                )}
              </div>
            </>
          )}

          {/* ===== TAB: PLANNING ===== */}
          {tab === "planning" && (
            <>
              <h2 className="text-lg font-display font-bold mb-6">Geplande publicaties</h2>

              {scheduledPosts.length > 0 ? (
                <div className="space-y-3 mb-10">
                  {scheduledPosts.map((post) => (
                    <div key={post.id} className="glass-card rounded-lg p-4 border border-blue-200 bg-blue-50 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <CalendarDays size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-sm">{post.title}</h3>
                        <p className="text-xs text-blue-600 mt-1">
                          Gepland voor: {formatDate(post.scheduled_for)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/admin/edit/${post.id}`} className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)]"><PenLine size={16} /></Link>
                        <button onClick={() => handlePostAction(post.id, "publish")} className="text-xs btn-primary px-3 py-1.5">Nu publiceren</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--text-secondary)] text-sm mb-10">Geen geplande publicaties.</p>
              )}

              {/* Drafts inplannen */}
              {draftPosts.length > 0 && (
                <>
                  <h3 className="text-sm font-display font-bold mb-4 text-[var(--text-secondary)]">Drafts — kies een publicatiedatum</h3>
                  <div className="space-y-3">
                    {draftPosts.map((post) => (
                      <div key={post.id} className="glass-card rounded-lg p-4 border border-[var(--border)] flex items-center gap-4">
                        <div className="flex-grow">
                          <h3 className="font-medium text-sm">{post.title}</h3>
                          <p className="text-xs text-[var(--text-secondary)] mt-1">Draft — {formatDate(post.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="date"
                            value={scheduleDates[post.id] || ""}
                            onChange={(e) => setScheduleDates((prev) => ({ ...prev, [post.id]: e.target.value }))}
                            min={new Date().toISOString().split("T")[0]}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
                          />
                          <button
                            onClick={() => {
                              const date = scheduleDates[post.id];
                              if (date) handlePostAction(post.id, "schedule", { scheduled_for: new Date(date + "T07:00:00Z").toISOString() });
                            }}
                            disabled={!scheduleDates[post.id]}
                            className="text-xs btn-primary px-3 py-1.5 disabled:opacity-50"
                          >
                            Inplannen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ===== TAB: NIEUW ARTIKEL ===== */}
          {tab === "new" && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-display font-bold mb-6">Nieuw artikel schrijven</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Onderwerp / Titel</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Bijv: Fabric migratie: de 5 grootste fouten"
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Keywords (komma-gescheiden)</label>
                  <input type="text" value={newKeywords} onChange={(e) => setNewKeywords(e.target.value)}
                    placeholder="fabric, migratie, fouten, premium"
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors" />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="useAi" checked={useAi} onChange={(e) => setUseAi(e.target.checked)} className="rounded" />
                  <label htmlFor="useAi" className="text-sm text-[var(--text-secondary)]">Laat AI het artikel schrijven</label>
                </div>
                <button onClick={handleWriteNew} disabled={!newTitle.trim() || generating} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
                  {useAi ? <><Sparkles size={16} /> AI: Schrijf artikel</> : <><Plus size={16} /> Maak draft aan</>}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
