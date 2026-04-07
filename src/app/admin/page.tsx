"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, FileText, Plus, CheckCircle2, XCircle, PenLine, Eye, Send, Archive, Loader2, Clock, Link2, ArrowUp, ArrowDown, Image as ImageIcon, Linkedin, Copy, Check } from "lucide-react";

type LinkedInStyle = "educatief" | "scherp" | "provocatief" | "storytelling";

const LINKEDIN_STYLES: { value: LinkedInStyle; label: string; description: string }[] = [
  { value: "educatief", label: "Educatief", description: "Leer de lezer iets concreets dat ze morgen kunnen toepassen." },
  { value: "scherp", label: "Scherp & direct", description: "Korte zinnen, duidelijke mening, geen omhaal." },
  { value: "provocatief", label: "Provocatief", description: "Een contrarian standpunt dat de mainstream uitdaagt." },
  { value: "storytelling", label: "Storytelling", description: "Trek de lezer mee in een korte anekdote of situatie." },
];

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
  const [actionId, setActionId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [seedKeywords, setSeedKeywords] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [useAi, setUseAi] = useState(true);

  // LinkedIn modal state
  const [linkedinPost, setLinkedinPost] = useState<BlogPost | null>(null);
  const [linkedinStyle, setLinkedinStyle] = useState<LinkedInStyle>("educatief");
  const [linkedinExtraContext, setLinkedinExtraContext] = useState("");
  const [linkedinResult, setLinkedinResult] = useState<{ postText: string; hashtags: string[] } | null>(null);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [linkedinCopied, setLinkedinCopied] = useState(false);

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

  const handleClearAllIdeas = async () => {
    if (!confirm("Weet je zeker dat je alle onderwerpen wilt verwijderen? Geschreven en afgewezen ideeën worden ook verwijderd.")) return;
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ action: "clear_all_ideas" }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) { console.error(e); }
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

  const handleRegenerateImage = async (postId: string) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ id: postId, action: "regenerate_image" }),
      });
      if (res.ok) {
        await fetchData();
      } else {
        const data = await res.json();
        alert(`Image generatie mislukt: ${data.error || "onbekende fout"}`);
      }
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const handlePostAction = async (id: string, action: string, extra?: Record<string, string>) => {
    // Markeer deze specifieke rij als "bezig" zodat de gebruiker feedback ziet
    setActionId(id);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ id, action, ...extra }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Actie '${action}' mislukt: ${data.error || res.statusText}`);
      }
      await fetchData();
    } catch (e) {
      console.error(e);
      alert(`Netwerkfout bij actie '${action}'. Check de console.`);
    } finally {
      setActionId(null);
    }
  };

  const handleDateChange = async (id: string, dateStr: string) => {
    if (!dateStr) return;
    const isoDate = new Date(dateStr + "T07:00:00Z").toISOString();
    await handlePostAction(id, "schedule", { scheduled_for: isoDate });
  };

  const handleSwapDates = async (idA: string, idB: string) => {
    await handlePostAction(idA, "swap_dates", { other_id: idB });
  };

  // ===== LinkedIn post generator =====
  const openLinkedinModal = (post: BlogPost) => {
    setLinkedinPost(post);
    setLinkedinResult(null);
    setLinkedinExtraContext("");
    setLinkedinStyle("educatief");
    setLinkedinCopied(false);
  };

  const closeLinkedinModal = () => {
    setLinkedinPost(null);
    setLinkedinResult(null);
    setLinkedinExtraContext("");
    setLinkedinLoading(false);
    setLinkedinCopied(false);
  };

  const handleGenerateLinkedin = async () => {
    if (!linkedinPost) return;
    setLinkedinLoading(true);
    setLinkedinResult(null);
    setLinkedinCopied(false);
    try {
      const res = await fetch("/api/admin/blog/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({
          postId: linkedinPost.id,
          style: linkedinStyle,
          extraContext: linkedinExtraContext.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLinkedinResult({ postText: data.postText, hashtags: data.hashtags });
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`LinkedIn post genereren mislukt: ${data.error || res.statusText}`);
      }
    } catch (e) {
      console.error(e);
      alert("Netwerkfout bij genereren van LinkedIn post.");
    } finally {
      setLinkedinLoading(false);
    }
  };

  const handleCopyLinkedin = async () => {
    if (!linkedinResult) return;
    const fullText = `${linkedinResult.postText}\n\n${linkedinResult.hashtags.join(" ")}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setLinkedinCopied(true);
      setTimeout(() => setLinkedinCopied(false), 2500);
    } catch {
      alert("Kopiëren mislukt — selecteer en kopieer handmatig.");
    }
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
  const activeIdeasCount = ideas.filter((i) => i.status === "suggested" || i.status === "approved").length;

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
          <span className="flex items-center gap-2"><Sparkles size={16} /> Onderwerpen ({activeIdeasCount})</span>
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
                    <div key={post.id} className={`glass-card rounded-lg p-3 border border-[var(--border)] flex items-center gap-3 transition-opacity ${actionId === post.id ? "opacity-50 pointer-events-none" : ""}`}>
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
                        {actionId === post.id && <Loader2 size={15} className="animate-spin text-[var(--accent)]" />}
                        {post.status === "published" && (
                          <>
                            <a href={`/blog/${post.slug}`} target="_blank" className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)]" title="Bekijk"><Eye size={15} /></a>
                            <button onClick={() => openLinkedinModal(post)} className="p-2 text-[var(--text-secondary)] hover:text-[#0A66C2]" title="Genereer LinkedIn post"><Linkedin size={15} /></button>
                            <button onClick={() => handleUpdateLinks(post.id)} disabled={generating} className="p-2 text-[var(--text-secondary)] hover:text-blue-500" title="Update interne links"><Link2 size={15} /></button>
                          </>
                        )}
                        {post.status !== "archived" && (
                          <button onClick={() => handleRegenerateImage(post.id)} disabled={generating} className="p-2 text-[var(--text-secondary)] hover:text-purple-500" title={post.image ? "Image opnieuw genereren" : "Image genereren"}><ImageIcon size={15} /></button>
                        )}
                        <Link href={`/admin/edit/${post.id}`} className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)]" title="Bewerk"><PenLine size={15} /></Link>
                        {(post.status === "draft" || post.status === "scheduled") && (
                          <button onClick={() => handlePostAction(post.id, "publish")} disabled={actionId === post.id} className="p-2 text-green-500 hover:text-green-700 disabled:opacity-50" title="Nu publiceren"><Send size={15} /></button>
                        )}
                        {post.status !== "archived" && (
                          <button onClick={() => handlePostAction(post.id, "archive")} disabled={actionId === post.id} className="p-2 text-[var(--text-secondary)] hover:text-red-500 disabled:opacity-50" title="Archiveer"><Archive size={15} /></button>
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
          {tab === "ideas" && (() => {
            // Filter: toon alleen actieve ideeën (suggested + approved).
            // Written en rejected worden automatisch verborgen.
            const activeIdeas = ideas.filter((i) => i.status === "suggested" || i.status === "approved");

            return (
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
                  <div className="flex flex-wrap gap-2">
                    <button onClick={handleGenerateIdeas} disabled={generating} className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50">
                      <Sparkles size={16} /> AI: Stel onderwerpen voor {seedKeywords ? "(met jouw keywords)" : "(via web search)"}
                    </button>
                    {ideas.length > 0 && (
                      <button onClick={handleClearAllIdeas} disabled={generating} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 transition-colors">
                        <XCircle size={16} /> Verwijder alle onderwerpen
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {activeIdeas.map((idea) => (
                    <div key={idea.id} className="glass-card rounded-lg p-4 border border-[var(--border)]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              idea.status === "suggested" ? "bg-blue-100 text-blue-700" :
                              "bg-green-100 text-green-700"
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
                          <button onClick={() => handleApproveIdea(idea.id)} disabled={generating} className="p-2 text-green-500 hover:text-green-700 disabled:opacity-50" title="Goedkeuren → schrijf artikel + plan in"><CheckCircle2 size={16} /></button>
                          <button onClick={() => handlePostAction(idea.id, "delete_idea")} className="p-2 text-red-400 hover:text-red-600" title="Verwijderen"><XCircle size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {activeIdeas.length === 0 && (
                    <p className="text-center py-12 text-[var(--text-secondary)] text-sm">
                      Geen actieve onderwerpen. Vul eventueel keywords in en klik op &ldquo;Stel onderwerpen voor&rdquo;.
                    </p>
                  )}
                </div>
              </>
            );
          })()}

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

      {/* ===== LINKEDIN POST MODAL ===== */}
      {linkedinPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeLinkedinModal}>
          <div className="glass-card bg-[var(--background)] rounded-xl border border-[var(--border)] max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] sticky top-0 bg-[var(--background)] z-10">
              <div className="flex items-center gap-3">
                <Linkedin size={20} className="text-[#0A66C2]" />
                <div>
                  <h2 className="font-display font-bold text-base">LinkedIn post genereren</h2>
                  <p className="text-xs text-[var(--text-secondary)] truncate max-w-md">{linkedinPost.title}</p>
                </div>
              </div>
              <button onClick={closeLinkedinModal} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" title="Sluiten">
                <XCircle size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {/* Stijl picker */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Stijl</label>
                <div className="grid grid-cols-2 gap-2">
                  {LINKEDIN_STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setLinkedinStyle(s.value)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        linkedinStyle === s.value
                          ? "border-[var(--accent)] bg-[rgba(245,158,11,0.05)]"
                          : "border-[var(--border)] hover:border-[var(--text-secondary)]"
                      }`}
                    >
                      <div className="font-semibold text-sm">{s.label}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] leading-snug mt-1">{s.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra context */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Extra context <span className="text-[var(--text-secondary)] font-normal">(optioneel — eigen invalshoek of recente ervaring)</span>
                </label>
                <textarea
                  value={linkedinExtraContext}
                  onChange={(e) => setLinkedinExtraContext(e.target.value)}
                  placeholder="Bv: Vorige week zat ik bij een gemeente die exact dit probleem had — ze hadden een DAX-formule die 4 minuten draaide..."
                  rows={3}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Generate knop */}
              <button
                onClick={handleGenerateLinkedin}
                disabled={linkedinLoading}
                className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {linkedinLoading ? <><Loader2 size={16} className="animate-spin" /> Bezig...</> : <><Sparkles size={16} /> Genereer LinkedIn post</>}
              </button>

              {/* Resultaat */}
              {linkedinResult && (
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Resultaat</label>
                    <span className="text-[10px] text-[var(--text-secondary)]">{linkedinResult.postText.length} tekens</span>
                  </div>
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
                    {linkedinResult.postText}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {linkedinResult.hashtags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full bg-[rgba(10,102,194,0.1)] text-[#0A66C2] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={handleCopyLinkedin}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#0A66C2] text-white rounded-lg hover:bg-[#084d92] transition-colors"
                    >
                      {linkedinCopied ? <><Check size={15} /> Gekopieerd!</> : <><Copy size={15} /> Kopieer naar klembord</>}
                    </button>
                    <a
                      href="https://www.linkedin.com/feed/?shareActive=true"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-lg hover:border-[#0A66C2] hover:text-[#0A66C2] transition-colors"
                    >
                      <Linkedin size={15} /> Open LinkedIn
                    </a>
                    <button
                      onClick={handleGenerateLinkedin}
                      disabled={linkedinLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-lg hover:border-[var(--accent)] disabled:opacity-50"
                    >
                      <Sparkles size={15} /> Probeer opnieuw
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
