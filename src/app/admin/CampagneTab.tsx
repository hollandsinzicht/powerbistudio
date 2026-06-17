"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Sparkles,
  Check,
  Copy,
  RotateCcw,
  CheckCircle2,
  CalendarClock,
  Lightbulb,
  FileText,
  Linkedin,
  AlertTriangle,
  Users,
  Settings2,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import { VALID_STYLES } from "@/lib/audiences";
import type { AudienceRecord } from "@/lib/audience-store";
import type { Campaign, CampaignStages, SeriesRole } from "@/lib/campaign-store";
import type { LinkedInStyle } from "@/lib/linkedin-writer";

const ROL_LABEL: Record<SeriesRole, string> = {
  haak: "Haak",
  inzicht: "Inzicht",
  bewijs: "Bewijs",
  cta: "CTA",
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

async function postJson(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

function StatusBadge({ approved, error }: { approved: boolean; error?: string }) {
  if (error) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600">
        <AlertTriangle size={13} /> mislukt
      </span>
    );
  }
  if (approved) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[var(--color-primary-900)] font-medium">
        <CheckCircle2 size={13} /> goedgekeurd
      </span>
    );
  }
  return <span className="text-xs text-[var(--color-neutral-700)]">concept</span>;
}

export default function CampagneTab() {
  const [seed, setSeed] = useState("");
  const [audiences, setAudiences] = useState<AudienceRecord[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [recent, setRecent] = useState<Campaign[]>([]);
  const [showManager, setShowManager] = useState(false);

  const loadAudiences = useCallback(async (selectAll = false) => {
    try {
      const res = await fetch("/api/admin/audiences", { headers: { "x-admin-token": getToken() } });
      if (res.ok) {
        const data = await res.json();
        const list: AudienceRecord[] = Array.isArray(data.audiences) ? data.audiences : [];
        setAudiences(list);
        if (selectAll) setSelected(new Set(list.map((a) => a.key)));
        else setSelected((prev) => new Set(list.filter((a) => prev.has(a.key)).map((a) => a.key)));
      }
    } catch {
      /* stil falen */
    }
  }, []);

  const loadRecent = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/campaign", { headers: { "x-admin-token": getToken() } });
      if (res.ok) {
        const data = await res.json();
        setRecent(Array.isArray(data.campaigns) ? data.campaigns : []);
      }
    } catch {
      /* stil falen */
    }
  }, []);

  useEffect(() => {
    loadAudiences(true);
    loadRecent();
  }, [loadAudiences, loadRecent]);

  const toggleAudience = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const run = async () => {
    if (selected.size === 0) {
      alert("Kies minstens één doelgroep.");
      return;
    }
    setRunning(true);
    try {
      const data = await postJson("/api/admin/campaign", {
        action: "run",
        seed: seed.trim() || undefined,
        audiences: Array.from(selected),
      });
      setCampaign(data.campaign);
      loadRecent();
    } catch (e) {
      alert(`Campagne starten mislukt: ${e instanceof Error ? e.message : e}`);
    } finally {
      setRunning(false);
    }
  };

  const mutate = async (body: Record<string, unknown>, busyKey: string) => {
    if (!campaign) return;
    setBusy(busyKey);
    try {
      const data = await postJson("/api/admin/campaign", { ...body, campaignId: campaign.id });
      setCampaign(data.campaign);
      if (body.action === "publish") {
        alert(`Ingepland voor ${new Date(data.scheduledFor).toLocaleString("nl-NL")}.`);
        loadRecent();
      }
    } catch (e) {
      alert(`Actie mislukt: ${e instanceof Error ? e.message : e}`);
    } finally {
      setBusy(null);
    }
  };

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  // Open een opgeslagen campagne terug in de stage-weergave (volledige inhoud
  // zit al in c.stages — de lijst haalt alles op).
  const openCampaign = (c: Campaign) => {
    setCampaign(c);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Persoonlijk vinkje: optimistisch togglen, dan persisteren.
  const toggleIngepland = async (c: Campaign) => {
    const next = !c.ingepland;
    setRecent((prev) => prev.map((r) => (r.id === c.id ? { ...r, ingepland: next } : r)));
    try {
      await postJson("/api/admin/campaign", {
        action: "set-ingepland",
        campaignId: c.id,
        ingepland: next,
      });
    } catch (e) {
      // Terugdraaien bij fout.
      setRecent((prev) => prev.map((r) => (r.id === c.id ? { ...r, ingepland: !next } : r)));
      alert(`Opslaan mislukt: ${e instanceof Error ? e.message : e}`);
    }
  };

  const stages: CampaignStages | null = campaign?.stages ?? null;
  const blogApproved = !!stages?.blog.approved;

  return (
    <div className="space-y-6">
      {/* Intro + guardrail */}
      <div className="p-4 rounded-lg bg-[rgba(15,118,110,0.05)] border border-[var(--color-primary-900)]">
        <h2 className="text-base font-semibold text-[var(--color-primary-900)] flex items-center gap-2">
          <Sparkles size={18} /> Campagne-flow
        </h2>
        <p className="text-sm text-[var(--color-neutral-700)] mt-1">
          Eén run knoopt idee → blogconcept → een opbouwende LinkedIn-reeks aan elkaar.
          Alles komt als <strong>concept</strong> terug; jij keurt per stap goed of genereert opnieuw.
          Niets gaat live zonder jouw akkoord — en geen agent raakt klant- of HR-data aan.
        </p>
      </div>

      {/* Startblok */}
      <div className="p-5 rounded-lg border border-[var(--color-neutral-300)] bg-white space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-neutral-800)] mb-1">
            Seed-onderwerp / keywords{" "}
            <span className="font-normal text-[var(--color-neutral-700)]">(optioneel)</span>
          </label>
          <input
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="bv. RLS in HR Power BI, verzuim met peildatum…"
            className="w-full px-3 py-2 border border-[var(--color-neutral-300)] rounded-lg text-sm"
          />
          <p className="text-xs text-[var(--color-neutral-700)] mt-1">
            Leeg laten → de agent kiest zelf een vers onderwerp (anti-herhaling t.o.v. bestaande posts).
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[var(--color-neutral-800)] flex items-center gap-2">
              <Users size={15} /> Doelgroepen voor de LinkedIn-varianten
            </label>
            <button
              onClick={() => setShowManager((s) => !s)}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-primary-900)] hover:underline"
            >
              <Settings2 size={13} /> {showManager ? "verberg beheer" : "doelgroepen beheren"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {audiences.map((a) => {
              const on = selected.has(a.key);
              return (
                <button
                  key={a.key}
                  onClick={() => toggleAudience(a.key)}
                  title={a.beschrijving}
                  className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                    on
                      ? "bg-[var(--color-primary-900)] text-white border-[var(--color-primary-900)]"
                      : "bg-white text-[var(--color-neutral-700)] border-[var(--color-neutral-300)] hover:bg-gray-50"
                  }`}
                >
                  {on && <Check size={13} className="inline mr-1" />}
                  {a.label}
                </button>
              );
            })}
            {audiences.length === 0 && (
              <span className="text-sm text-[var(--color-neutral-700)]">Doelgroepen laden…</span>
            )}
          </div>
        </div>

        {showManager && (
          <AudienceManager audiences={audiences} onChanged={() => loadAudiences(false)} />
        )}

        <button
          onClick={run}
          disabled={running}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-primary-900)] text-white text-sm font-medium disabled:opacity-60"
        >
          {running ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {running ? "Bezig… dit kan 1-2 minuten duren" : "Start campagne"}
        </button>
      </div>

      {/* Resultaat */}
      {stages && campaign && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-neutral-500)]">
              Campagne van {new Date(campaign.created_at).toLocaleDateString("nl-NL")}
            </span>
            <button
              onClick={() => setCampaign(null)}
              className="text-xs text-[var(--color-neutral-700)] hover:text-[var(--color-primary-900)] underline"
            >
              sluiten
            </button>
          </div>
          <StageCard icon={<Lightbulb size={16} />} title="1. Idee" approved={stages.idea.approved} error={stages.idea.error}>
            {stages.idea.output ? (
              <>
                <p className="font-medium text-[var(--color-neutral-900)]">{stages.idea.output.title}</p>
                {stages.idea.output.rationale && (
                  <p className="text-sm text-[var(--color-neutral-700)] mt-1">{stages.idea.output.rationale}</p>
                )}
                <p className="text-xs text-[var(--color-neutral-700)] mt-2">
                  Archetype: {stages.idea.output.archetype} · keywords: {stages.idea.output.keywords.join(", ")}
                </p>
              </>
            ) : (
              <p className="text-sm text-red-600">{stages.idea.error || "Geen idee"}</p>
            )}
            <StageActions
              onApprove={() => mutate({ action: "approve-stage", stage: "idea", approved: !stages.idea.approved }, "idea-approve")}
              onRegenerate={() => mutate({ action: "regenerate-stage", stage: "idea" }, "idea-regen")}
              approved={stages.idea.approved}
              busy={busy}
              regenKey="idea-regen"
              approveKey="idea-approve"
            />
          </StageCard>

          <StageCard icon={<FileText size={16} />} title="2. Blogconcept (draft)" approved={stages.blog.approved} error={stages.blog.error}>
            {stages.blog.output ? (
              <>
                <p className="font-medium text-[var(--color-neutral-900)]">{stages.blog.output.title}</p>
                <p className="text-sm text-[var(--color-neutral-700)] mt-1">{stages.blog.output.excerpt}</p>
                <p className="text-xs text-[var(--color-neutral-700)] mt-2">
                  Opgeslagen als draft · <code>/{stages.blog.output.slug}</code>
                  {stages.blog.output.image ? " · met header-image" : " · zonder image"}
                </p>
              </>
            ) : (
              <p className="text-sm text-red-600">{stages.blog.error || "Geen blog"}</p>
            )}
            <StageActions
              onApprove={() => mutate({ action: "approve-stage", stage: "blog", approved: !stages.blog.approved }, "blog-approve")}
              onRegenerate={() => mutate({ action: "regenerate-stage", stage: "blog" }, "blog-regen")}
              approved={stages.blog.approved}
              busy={busy}
              regenKey="blog-regen"
              approveKey="blog-approve"
            />
          </StageCard>

          <StageCard icon={<Linkedin size={16} />} title="3. LinkedIn-reeks" approved={false}>
            <p className="text-xs text-[var(--color-neutral-500)] mb-3">
              Een opbouw van 4 posts richting de blog, gespreid gepland. Posten doe je zelf
              (kopiëren) op de voorgestelde datum — LinkedIn staat auto-posten niet toe.
            </p>
            <div className="space-y-3">
              {stages.linkedin.length === 0 && (
                <p className="text-sm text-[var(--color-neutral-700)]">Geen reeks (geen blogconcept of geen doelgroep).</p>
              )}
              {stages.linkedin.map((v) => (
                <div key={v.index} className="border border-[var(--color-neutral-300)] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--color-neutral-900)]">
                      {v.index + 1}. {ROL_LABEL[v.rol] ?? v.rol}
                      <span className="font-normal text-[var(--color-neutral-500)]"> · {v.audienceLabel}</span>
                    </span>
                    <StatusBadge approved={v.approved} error={v.error} />
                  </div>
                  <p className="text-xs text-[var(--color-neutral-500)] mb-2 flex items-center gap-1">
                    <CalendarClock size={12} /> voorgesteld: {fmtDate(v.plannenOp)}
                  </p>
                  {v.error ? (
                    <p className="text-sm text-red-600">{v.error}</p>
                  ) : (
                    <>
                      <p className="text-sm text-[var(--color-neutral-800)] whitespace-pre-wrap">{v.postText}</p>
                      {v.hashtags.length > 0 && (
                        <p className="text-xs text-[var(--color-primary-900)] mt-2">{v.hashtags.join(" ")}</p>
                      )}
                    </>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => copy(`li-${v.index}`, `${v.postText}\n\n${v.hashtags.join(" ")}`)}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-[var(--color-neutral-300)] hover:bg-gray-50"
                    >
                      {copied === `li-${v.index}` ? <Check size={13} /> : <Copy size={13} />} kopieer
                    </button>
                    <button
                      onClick={() => mutate({ action: "regenerate-stage", stage: "linkedin", index: v.index }, `li-regen-${v.index}`)}
                      disabled={busy === `li-regen-${v.index}`}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-[var(--color-neutral-300)] hover:bg-gray-50 disabled:opacity-60"
                    >
                      {busy === `li-regen-${v.index}` ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                      opnieuw
                    </button>
                    <button
                      onClick={() => mutate({ action: "approve-stage", stage: "linkedin", index: v.index, approved: !v.approved }, `li-appr-${v.index}`)}
                      disabled={busy === `li-appr-${v.index}`}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded ${
                        v.approved ? "bg-gray-100 text-[var(--color-neutral-700)]" : "bg-[var(--color-primary-900)] text-white"
                      } disabled:opacity-60`}
                    >
                      <CheckCircle2 size={13} /> {v.approved ? "ingetrokken" : "goedkeuren"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </StageCard>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => mutate({ action: "publish" }, "publish")}
              disabled={!blogApproved || busy === "publish" || campaign.status === "scheduled"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-action-600)] text-white text-sm font-medium disabled:opacity-50"
            >
              {busy === "publish" ? <Loader2 size={16} className="animate-spin" /> : <CalendarClock size={16} />}
              {campaign.status === "scheduled" ? "Ingepland ✓" : "Plan blogconcept in"}
            </button>
            {!blogApproved && (
              <span className="text-xs text-[var(--color-neutral-700)]">Keur eerst het blogconcept goed.</span>
            )}
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div className="pt-4">
          <h3 className="text-sm font-medium text-[var(--color-neutral-800)] mb-1">Campagnes</h3>
          <p className="text-xs text-[var(--color-neutral-500)] mb-3">
            Vink &ldquo;ingepland&rdquo; aan zodra je de posts daadwerkelijk hebt ingepland/geplaatst — puur voor jezelf.
          </p>
          <ul className="divide-y divide-[var(--color-neutral-200)] rounded-lg border border-[var(--color-neutral-200)]">
            {recent.map((c) => (
              <li
                key={c.id}
                className={`flex items-center gap-3 px-3 py-2 text-sm ${
                  campaign?.id === c.id ? "bg-[rgba(15,118,110,0.06)]" : ""
                }`}
              >
                <button
                  onClick={() => openCampaign(c)}
                  className="flex-1 min-w-0 text-left group"
                  title="Bekijk deze campagne met alle teksten"
                >
                  <span className="block truncate text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-900)] group-hover:underline">
                    {c.stages?.idea?.output?.title || c.seed || "(zonder titel)"}
                  </span>
                  <span className="text-xs text-[var(--color-neutral-500)]">
                    {c.status === "scheduled" ? "blog ingepland" : c.status} ·{" "}
                    {(c.stages?.linkedin?.length ?? 0)} LinkedIn-posts ·{" "}
                    {new Date(c.created_at).toLocaleDateString("nl-NL")}
                  </span>
                </button>
                <button
                  onClick={() => openCampaign(c)}
                  className="shrink-0 text-xs px-2.5 py-1.5 rounded border border-[var(--color-neutral-300)] hover:bg-gray-50"
                >
                  bekijk
                </button>
                <label className="shrink-0 inline-flex items-center gap-1.5 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!c.ingepland}
                    onChange={() => toggleIngepland(c)}
                    className="h-4 w-4 accent-[var(--color-primary-900)]"
                  />
                  <span className={c.ingepland ? "text-[var(--color-primary-900)] font-medium" : "text-[var(--color-neutral-700)]"}>
                    ingepland
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Doelgroep-beheer
// ---------------------------------------------------------------------------
function AudienceManager({
  audiences,
  onChanged,
}: {
  audiences: AudienceRecord[];
  onChanged: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ label: "", beschrijving: "", guide: "", style: "educatief" as LinkedInStyle });

  const save = async (a: AudienceRecord) => {
    setBusyId(a.id);
    try {
      await postJson("/api/admin/audiences", {
        action: "update",
        id: a.id,
        label: a.label,
        beschrijving: a.beschrijving,
        guide: a.guide,
        style: a.style,
      });
      onChanged();
    } catch (e) {
      alert(`Opslaan mislukt: ${e instanceof Error ? e.message : e}`);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (a: AudienceRecord) => {
    if (!confirm(`Doelgroep "${a.label}" verwijderen?`)) return;
    setBusyId(a.id);
    try {
      await postJson("/api/admin/audiences", { action: "delete", id: a.id });
      onChanged();
    } catch (e) {
      alert(`Verwijderen mislukt: ${e instanceof Error ? e.message : e}`);
    } finally {
      setBusyId(null);
    }
  };

  const create = async () => {
    if (!draft.label.trim() || !draft.guide.trim()) {
      alert("Label en invalshoek-gids zijn verplicht.");
      return;
    }
    setAdding(true);
    try {
      await postJson("/api/admin/audiences", { action: "create", ...draft });
      setDraft({ label: "", beschrijving: "", guide: "", style: "educatief" });
      onChanged();
    } catch (e) {
      alert(`Aanmaken mislukt: ${e instanceof Error ? e.message : e}`);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-[var(--color-neutral-300)] bg-gray-50 p-4 space-y-4">
      <p className="text-xs text-[var(--color-neutral-700)]">
        Pas de invalshoek per doelgroep aan, of voeg een nieuwe toe. De invalshoek-gids stuurt de toon en
        focus van de LinkedIn-variant; de stijl bepaalt de standaardtoon.
      </p>

      {audiences.map((a, i) => (
        <AudienceRow
          key={a.id}
          audience={a}
          busy={busyId === a.id}
          onSave={save}
          onRemove={remove}
          // index alleen voor visuele scheiding
          first={i === 0}
        />
      ))}

      {/* Nieuwe doelgroep */}
      <div className="border-t border-[var(--color-neutral-300)] pt-4 space-y-2">
        <p className="text-sm font-medium text-[var(--color-neutral-800)] flex items-center gap-2">
          <Plus size={14} /> Nieuwe doelgroep
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            placeholder="Label (bv. DPO)"
            className="flex-1 min-w-[160px] px-2.5 py-1.5 border border-[var(--color-neutral-300)] rounded text-sm"
          />
          <select
            value={draft.style}
            onChange={(e) => setDraft({ ...draft, style: e.target.value as LinkedInStyle })}
            className="px-2.5 py-1.5 border border-[var(--color-neutral-300)] rounded text-sm"
          >
            {VALID_STYLES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <input
          value={draft.beschrijving}
          onChange={(e) => setDraft({ ...draft, beschrijving: e.target.value })}
          placeholder="Korte beschrijving (tooltip)"
          className="w-full px-2.5 py-1.5 border border-[var(--color-neutral-300)] rounded text-sm"
        />
        <textarea
          value={draft.guide}
          onChange={(e) => setDraft({ ...draft, guide: e.target.value })}
          placeholder="Invalshoek-gids: rol, pijn, toon, wat te vermijden…"
          rows={4}
          className="w-full px-2.5 py-1.5 border border-[var(--color-neutral-300)] rounded text-sm font-mono"
        />
        <button
          onClick={create}
          disabled={adding}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded bg-[var(--color-primary-900)] text-white disabled:opacity-60"
        >
          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Toevoegen
        </button>
      </div>
    </div>
  );
}

function AudienceRow({
  audience,
  busy,
  onSave,
  onRemove,
  first,
}: {
  audience: AudienceRecord;
  busy: boolean;
  onSave: (a: AudienceRecord) => void;
  onRemove: (a: AudienceRecord) => void;
  first: boolean;
}) {
  // Lokale edit-state, geïnitialiseerd uit de prop. Na opslaan/verwijderen
  // herlaadt de lijst met dezelfde waarden, dus een sync-effect is overbodig
  // (en zou de set-state-in-effect-regel triggeren).
  const [local, setLocal] = useState<AudienceRecord>(audience);

  return (
    <div className={`${first ? "" : "border-t border-[var(--color-neutral-300)] pt-3"} space-y-2`}>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={local.label}
          onChange={(e) => setLocal({ ...local, label: e.target.value })}
          className="flex-1 min-w-[160px] px-2.5 py-1.5 border border-[var(--color-neutral-300)] rounded text-sm font-medium"
        />
        <select
          value={local.style}
          onChange={(e) => setLocal({ ...local, style: e.target.value as LinkedInStyle })}
          className="px-2.5 py-1.5 border border-[var(--color-neutral-300)] rounded text-sm"
        >
          {VALID_STYLES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <code className="text-xs text-[var(--color-neutral-700)]">{local.key}</code>
      </div>
      <input
        value={local.beschrijving}
        onChange={(e) => setLocal({ ...local, beschrijving: e.target.value })}
        placeholder="Korte beschrijving"
        className="w-full px-2.5 py-1.5 border border-[var(--color-neutral-300)] rounded text-sm"
      />
      <textarea
        value={local.guide}
        onChange={(e) => setLocal({ ...local, guide: e.target.value })}
        rows={4}
        className="w-full px-2.5 py-1.5 border border-[var(--color-neutral-300)] rounded text-sm font-mono"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave(local)}
          disabled={busy}
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded bg-[var(--color-primary-900)] text-white disabled:opacity-60"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} opslaan
        </button>
        <button
          onClick={() => onRemove(local)}
          disabled={busy}
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          <Trash2 size={13} /> verwijderen
        </button>
      </div>
    </div>
  );
}

function StageCard({
  icon,
  title,
  approved,
  error,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  approved: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-neutral-300)] bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-[var(--color-neutral-900)] flex items-center gap-2">
          {icon} {title}
        </h3>
        <StatusBadge approved={approved} error={error} />
      </div>
      {children}
    </div>
  );
}

function StageActions({
  onApprove,
  onRegenerate,
  approved,
  busy,
  regenKey,
  approveKey,
}: {
  onApprove: () => void;
  onRegenerate: () => void;
  approved: boolean;
  busy: string | null;
  regenKey: string;
  approveKey: string;
}) {
  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={onRegenerate}
        disabled={busy === regenKey}
        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-[var(--color-neutral-300)] hover:bg-gray-50 disabled:opacity-60"
      >
        {busy === regenKey ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
        opnieuw
      </button>
      <button
        onClick={onApprove}
        disabled={busy === approveKey}
        className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded ${
          approved ? "bg-gray-100 text-[var(--color-neutral-700)]" : "bg-[var(--color-primary-900)] text-white"
        } disabled:opacity-60`}
      >
        <CheckCircle2 size={13} /> {approved ? "ingetrokken" : "goedkeuren"}
      </button>
    </div>
  );
}
