"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, FileText, Plus, CheckCircle2, XCircle, PenLine, Eye, Send, Archive, Loader2 } from "lucide-react";

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string; status: string;
  published_at: string | null; ai_generated: boolean; created_at: string;
}

interface BlogIdea {
  id: string; title: string; keywords: string[]; rationale: string | null;
  target_audience: string | null; status: string; created_at: string;
}

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<"ideas" | "posts" | "new">("posts");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [ideas, setIdeas] = useState<BlogIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Nieuw artikel formulier
  const [newTitle, setNewTitle] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [useAi, setUseAi] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog", {
        headers: { "x-admin-token": getToken() },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        setIdeas(data.ideas || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerateIdeas = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ action: "ideas" }),
      });
      if (res.ok) await fetchData();
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
      if (res.ok) {
        await fetchData();
        setTab("posts");
      }
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const handleWriteNew = async () => {
    if (!newTitle.trim()) return;
    setGenerating(true);
    try {
      if (useAi) {
        const res = await fetch("/api/admin/blog/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
          body: JSON.stringify({
            action: "write",
            title: newTitle,
            keywords: newKeywords.split(",").map((k) => k.trim()).filter(Boolean),
          }),
        });
        if (res.ok) {
          setNewTitle("");
          setNewKeywords("");
          await fetchData();
          setTab("posts");
        }
      }
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const handlePostAction = async (id: string, action: string) => {
    try {
      await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ id, action }),
      });
      await fetchData();
    } catch (e) { console.error(e); }
  };

  const handleIdeaAction = async (id: string, status: string) => {
    try {
      await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ id, idea_status: status }),
      });
      await fetchData();
    } catch (e) { console.error(e); }
  };

  const filteredPosts = statusFilter === "all" ? posts : posts.filter((p) => p.status === statusFilter);

  const tabClass = (t: string) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t ? "bg-[var(--primary)] text-white" : "text-[var(--text-secondary)] hover:bg-gray-100"}`;

  return (
    <>
      {/* Tab bar */}
      <div className="flex gap-2 mb-8">
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
          {/* ===== TAB: ARTIKELEN ===== */}
          {tab === "posts" && (
            <>
              <div className="flex gap-2 mb-6">
                {["all", "draft", "published", "scheduled", "archived"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${statusFilter === s ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)]"}`}
                  >
                    {s === "all" ? "Alle" : s}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="glass-card rounded-lg p-4 border border-[var(--border)] flex items-center gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          post.status === "published" ? "bg-green-100 text-green-700" :
                          post.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                          post.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>{post.status}</span>
                        {post.ai_generated && <span className="text-[10px] text-[var(--accent)]">AI</span>}
                      </div>
                      <h3 className="font-medium text-sm">{post.title}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{post.excerpt.slice(0, 100)}...</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {post.status === "published" && (
                        <a href={`/blog/${post.slug}`} target="_blank" className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors" title="Bekijk">
                          <Eye size={16} />
                        </a>
                      )}
                      <Link href={`/admin/edit/${post.id}`} className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors" title="Bewerk">
                        <PenLine size={16} />
                      </Link>
                      {post.status === "draft" && (
                        <button onClick={() => handlePostAction(post.id, "publish")} className="p-2 text-green-500 hover:text-green-700 transition-colors" title="Publiceer">
                          <Send size={16} />
                        </button>
                      )}
                      {post.status !== "archived" && (
                        <button onClick={() => handlePostAction(post.id, "archive")} className="p-2 text-[var(--text-secondary)] hover:text-red-500 transition-colors" title="Archiveer">
                          <Archive size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredPosts.length === 0 && (
                  <p className="text-center py-12 text-[var(--text-secondary)] text-sm">Geen artikelen gevonden.</p>
                )}
              </div>
            </>
          )}

          {/* ===== TAB: ONDERWERPEN ===== */}
          {tab === "ideas" && (
            <>
              <button
                onClick={handleGenerateIdeas}
                disabled={generating}
                className="btn-primary inline-flex items-center gap-2 mb-6 text-sm disabled:opacity-50"
              >
                <Sparkles size={16} /> AI: Stel nieuwe onderwerpen voor
              </button>

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
                        <div className="flex gap-1 mt-2">
                          {idea.keywords.map((kw) => (
                            <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-[var(--text-secondary)]">{kw}</span>
                          ))}
                        </div>
                      </div>
                      {idea.status === "suggested" && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleIdeaAction(idea.id, "approved")} className="p-2 text-green-500 hover:text-green-700" title="Goedkeuren">
                            <CheckCircle2 size={16} />
                          </button>
                          <button onClick={() => handleIdeaAction(idea.id, "rejected")} className="p-2 text-red-400 hover:text-red-600" title="Afwijzen">
                            <XCircle size={16} />
                          </button>
                          <button onClick={() => handleWriteFromIdea(idea.id)} disabled={generating} className="p-2 text-[var(--accent)] hover:text-[var(--primary)]" title="Schrijf artikel">
                            <PenLine size={16} />
                          </button>
                        </div>
                      )}
                      {idea.status === "approved" && (
                        <button onClick={() => handleWriteFromIdea(idea.id)} disabled={generating} className="btn-primary text-xs px-3 py-1.5">
                          Schrijf artikel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {ideas.length === 0 && (
                  <p className="text-center py-12 text-[var(--text-secondary)] text-sm">
                    Geen onderwerpen. Klik op &ldquo;Stel nieuwe onderwerpen voor&rdquo; om te beginnen.
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
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Bijv: Fabric migratie: de 5 grootste fouten"
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Keywords (komma-gescheiden)</label>
                  <input
                    type="text"
                    value={newKeywords}
                    onChange={(e) => setNewKeywords(e.target.value)}
                    placeholder="fabric, migratie, fouten, premium"
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="useAi"
                    checked={useAi}
                    onChange={(e) => setUseAi(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="useAi" className="text-sm text-[var(--text-secondary)]">
                    Laat AI het artikel schrijven (anders: handmatig bewerken na aanmaken)
                  </label>
                </div>
                <button
                  onClick={handleWriteNew}
                  disabled={!newTitle.trim() || generating}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
                >
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
