"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, FileText, Plus, CheckCircle2, XCircle, PenLine, Eye, Send, Archive, Loader2, Clock, Link2, ArrowUp, ArrowDown } from "lucide-react";

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

function dateInputValue(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toISOString().split("T")[0];
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<"posts" | "ideas" | "new">("posts");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [ideas, setIdeas] = useState<BlogIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [seedKeywords, setSeedKeywords] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [useAi, setUseAi] = useState(true);

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

  const handleApproveIdea = async (ideaId: string) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ id: ideaId, action: "approve_idea" }),
      });
      if (res.ok) {
        const data = await res.json();
        await fetchData();
        setTab("posts");
        if (data.scheduledFor) {
          alert(`Artikel geschreven en ingepland voor ${formatDate(data.scheduledFor)}`);
        }
      }
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

  const handleDateChange = async (id: string, dateStr: string) => {
    if (!dateStr) return;
    const isoDate = new Date(dateStr + "T07:00:00Z").toISOString();
    await handlePostAction(id, "schedule", { scheduled_for: isoDate });
  };

  const handleSwapDates = async (idA: string, idB: string) => {
    await handlePostAction(idA, "swap_dates", { other_id: idB });
  };

  // Sorteer posts: scheduled (op datum ASC) → drafts (op created_at DESC) → published (op published_at DESC) → archived
  const sortedPosts = [...posts].sort((a, b) => {
    const order = { scheduled: 0, draft: 1, published: 2, archived: 3 };
    const oA = order[a.status as keyof typeof order] ?? 4;
    const oB = order[b.status as keyof typeof order] ?? 4;
    if (oA !== oB) return oA - oB;

    if (a.status === "scheduled" && b.status === "scheduled") {
      return (a.scheduled_for || "").localeCompare(b.scheduled_for || "");
    }
    if (a.status === "published" && b.status === "published") {
      return (b.published_at || "").localeCompare(a.published_at || "");
    }
    return (b.created_at || "").localeCompare(a.created_at || "");
  });

  const filteredPosts = statusFilter === "all" ? sortedPosts : sortedPosts.filter((p) => p.status === statusFilter);
  const scheduledPosts = sortedPosts.filter((p) => p.status === "scheduled");

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
          {/* ===== TAB: ARTIKELEN — UNIFIED TABEL ===== */}
          {tab === "posts" && (
            <>
              <div className="flex gap-2 mb-6">
                {["all", "draft", "scheduled", "published", "archived"].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${statusFilter === s ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)]"}`}>
                    {s === "all" ? "Alle" : s}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredPosts.map((post) => {
                  // Bepaal index in scheduled lijst voor reorder pijlen
                  const scheduledIndex = post.status === "scheduled"
                    ? scheduledPosts.findIndex((p) => p.id === post.id)
                    : -1;
                  const canMoveUp = scheduledIndex > 0;
                  const canMoveDown = scheduledIndex >= 0 && scheduledIndex < scheduledPosts.length - 1;

                  return (
                    <div key={post.id} className="glass-card rounded-lg p-3 border border-[var(--border)] flex items-center gap-3">
                      {/* Reorder arrows (alleen voor scheduled) */}
                      {post.status === "scheduled" && (
                        <div className="flex flex-col shrink-0">
                          <button
                            onClick={() => canMoveUp && handleSwapDates(post.id, scheduledPosts[scheduledIndex - 1].id)}
                            disabled={!canMoveUp}
                            className="p-0.5 text-[var(--text-secondary)] hover:text-[var(--primary)] disabled:opacity-20 disabled:cursor-not-allowed"
                            title="Eerder"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => canMoveDown && handleSwapDates(post.id, scheduledPosts[scheduledIndex + 1].id)}
                            disabled={!canMoveDown}
                            className="p-0.5 text-[var(--text-secondary)] hover:text-[var(--primary)] disabled:opacity-20 disabled:cursor-not-allowed"
                            title="Later"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      )}

                      {/* Thumbnail */}
                      {post.image ? (
                        <div className="w-14 h-9 rounded overflow-hidden shrink-0 bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={post.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-14 h-9 rounded shrink-0 bg-gray-100 flex items-center justify-center text-[var(--text-secondary)]">
                          <FileText size={14} />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            post.status === "published" ? "bg-green-100 text-green-700" :
                            post.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                            post.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-500"
                          }`}>{post.status}</span>
                          {post.ai_generated && <span className="text-[10px] text-[var(--accent)]">AI</span>}
                        </div>
                        <h3 className="font-medium text-sm truncate">{post.title}</h3>
                      </div>

                      {/* Datum (editbaar) */}
                      <div className="shrink-0 flex items-center gap-1">
                        {post.status === "scheduled" || post.status === "draft" ? (
                          <input
                            type="date"
                            value={dateInputValue(post.scheduled_for)}
                            onChange={(e) => handleDateChange(post.id, e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1 text-xs focus:outline-none focus:border-[var(--accent)]"
                          />
                        ) : post.status === "published" ? (
                          <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                            <Clock size={10} /> {formatDate(post.published_at)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[var(--text-secondary)]">{formatDate(post.created_at)}</span>
                        )}
                      </div>

                      {/* Acties */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        {post.status === "published" && (
                          <>
                            <a href={`/blog/${post.slug}`} target="_blank" className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)]" title="Bekijk"><Eye size={15} /></a>
                            <button onClick={() => handleUpdateLinks(post.id)} disabled={generating} className="p-2 text-[var(--text-secondary)] hover:text-blue-500" title="Update interne links"><Link2 size={15} /></button>
                          </>
                        )}
                        <Link href={`/admin/edit/${post.id}`} className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)]" title="Bewerk"><PenLine size={15} /></Link>
                        {(post.status === "draft" || post.status === "scheduled") && (
                          <button onClick={() => handlePostAction(post.id, "publish")} className="p-2 text-green-500 hover:text-green-700" title="Nu publiceren"><Send size={15} /></button>
                        )}
                        {post.status !== "archived" && (
                          <button onClick={() => handlePostAction(post.id, "archive")} className="p-2 text-[var(--text-secondary)] hover:text-red-500" title="Archiveer"><Archive size={15} /></button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredPosts.length === 0 && <p className="text-center py-12 text-[var(--text-secondary)] text-sm">Geen artikelen gevonden.</p>}
              </div>
            </>
          )}

          {/* ===== TAB: ONDERWERPEN ===== */}
          {tab === "ideas" && (
            <>
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
                        {idea.status === "suggested" && (
                          <>
                            <button onClick={() => handleApproveIdea(idea.id)} disabled={generating} className="p-2 text-green-500 hover:text-green-700 disabled:opacity-50" title="Goedkeuren → schrijf artikel + plan in"><CheckCircle2 size={16} /></button>
                            <button onClick={() => handlePostAction(idea.id, "reject_idea")} className="p-2 text-red-400 hover:text-red-600" title="Afwijzen"><XCircle size={16} /></button>
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
