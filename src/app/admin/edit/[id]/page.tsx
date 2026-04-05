"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, Eye } from "lucide-react";

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string; content: string;
  image: string | null; status: string; seo_title: string | null;
  seo_description: string | null; target_keywords: string[];
  published_at: string | null; scheduled_for: string | null;
}

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [keywords, setKeywords] = useState("");

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch("/api/admin/blog", {
          headers: { "x-admin-token": getToken() },
        });
        if (res.ok) {
          const data = await res.json();
          const found = data.posts.find((p: BlogPost) => p.id === id);
          if (found) {
            setPost(found);
            setTitle(found.title);
            setSlug(found.slug);
            setExcerpt(found.excerpt);
            setContent(found.content);
            setImage(found.image || "");
            setSeoTitle(found.seo_title || "");
            setSeoDescription(found.seo_description || "");
            setKeywords((found.target_keywords || []).join(", "));
          }
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchPost();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({
          id,
          title, slug, excerpt, content,
          image: image || null,
          seo_title: seoTitle || null,
          seo_description: seoDescription || null,
          target_keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        }),
      });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handlePublish = async () => {
    await handleSave();
    try {
      await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ id, action: "publish" }),
      });
      router.push("/admin");
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="text-center py-20 text-[var(--text-secondary)]">Laden...</div>;
  if (!post) return <div className="text-center py-20 text-red-500">Post niet gevonden</div>;

  const inputClass = "w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors text-sm";

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
          <ArrowLeft size={16} /> Terug naar overzicht
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPreview(!showPreview)} className="btn-secondary inline-flex items-center gap-2 text-sm px-4 py-2">
            <Eye size={16} /> {showPreview ? "Editor" : "Preview"}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-secondary inline-flex items-center gap-2 text-sm px-4 py-2 disabled:opacity-50">
            <Save size={16} /> Opslaan
          </button>
          {post.status !== "published" && (
            <button onClick={handlePublish} className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2">
              <Send size={16} /> Publiceren
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor */}
        <div className={showPreview ? "hidden lg:block" : ""}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Titel</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Excerpt</label>
              <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Content (HTML)</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={20} className={`${inputClass} font-mono text-xs`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Afbeelding URL</label>
              <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">SEO Titel</label>
                <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">SEO Description</label>
                <input type="text" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Keywords (komma-gescheiden)</label>
              <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className={!showPreview ? "hidden lg:block" : ""}>
          <div className="glass-card rounded-xl p-6 md:p-8 border border-[var(--border)] sticky top-24">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-[var(--text-secondary)] mb-4">Preview</p>
            <h1 className="text-2xl font-display font-bold mb-3">{title || "Geen titel"}</h1>
            <p className="text-sm text-[var(--text-secondary)] mb-6 italic">{excerpt || "Geen excerpt"}</p>
            {content ? (
              <div
                className="prose prose-sm max-w-none prose-headings:font-display prose-p:text-[var(--text-secondary)]"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <p className="text-[var(--text-secondary)] text-sm">Geen content om te tonen.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
