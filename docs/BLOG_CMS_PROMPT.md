# Prompt: Bouw een eigen AI-powered Blog CMS

> Kopieer-en-plak deze hele prompt in een nieuwe agent (Claude Code, Cursor, etc.) om hetzelfde blogsysteem te bouwen in een andere Next.js-site.

---

## Rol en doel

Je bent een senior full-stack engineer die een **volledig eigen blog-CMS** gaat bouwen in een bestaande Next.js 15/16 App Router website. Het systeem vervangt afhankelijkheid van externe CMS-tools (WordPress, Soro, Ghost, Contentful) en geeft de eigenaar volledige controle over content, AI-gestuurde content creatie, en automatische planning.

Het systeem moet **zelfstandig** werken: onderwerpen voorstellen via AI, artikelen schrijven via AI, header images genereren, posts automatisch inplannen en publiceren — allemaal vanuit één admin-dashboard.

---

## Technische eisen (aanpassen op de host-site)

- **Framework:** Next.js 15+ App Router + TypeScript + Tailwind v4
- **Database:** Supabase (PostgreSQL + Storage)
- **AI content:** Anthropic Claude SDK (`@anthropic-ai/sdk`) — model `claude-sonnet-4-20250514` of nieuwer
- **AI images:** OpenAI DALL·E 3 (`openai` SDK)
- **Cron:** Vercel cron jobs
- **Auth:** Simpele wachtwoord-auth via `ADMIN_PASSWORD` env var (geen NextAuth nodig)

Als de host-site een andere stack heeft, is de architectuur 1-op-1 over te brengen — alleen de adapters wijzigen.

---

## Eindresultaat (wat de eigenaar moet kunnen)

1. **`/admin` pagina** beveiligd met wachtwoord. Eén dashboard met drie tabs:
   - **Artikelen** — overzicht van alle posts (draft, scheduled, published, archived) in één tabel met status-filter, inline datepicker, reorder-pijlen (▲▼) om de publicatievolgorde te wisselen, knoppen voor nu-publiceren / archiveren / image herge­nereren / interne links updaten / bewerken.
   - **Onderwerpen** — textarea voor seed-keywords, "AI: stel 5 onderwerpen voor" knop, lijst van actieve onderwerpen (written/rejected automatisch verborgen) met goedkeuren ✓ en verwijderen ✗ knoppen, plus "Verwijder alle onderwerpen" bulk-actie.
   - **Nieuw artikel** — handmatig een titel + keywords invoeren, optioneel AI laten schrijven.

2. **AI onderwerpsuggesties**: de gebruiker vult optioneel keywords in (bv. "fabric kosten", "dax performance"). Claude stelt 5 concrete blogonderwerpen voor die DIRECT over die keywords gaan — geen generieke suggesties.

3. **AI artikel schrijven**: bij het goedkeuren van een onderwerp gebeurt automatisch alles achter elkaar:
   - Claude schrijft het volledige artikel (1500-2500 woorden, correct HTML, met 2-4 interne links naar bestaande posts/pagina's)
   - DALL·E 3 genereert een relevante header image op basis van een door Claude bedachte scene-beschrijving (geen generieke stock)
   - Het artikel krijgt automatisch een publicatiedatum: dag na de laatst geplande post, op 07:00 UTC
   - Het idee gaat naar status `written`

4. **Geplande publicatie via cron**: elke ochtend draait een Vercel cron die alle posts met status `scheduled` en `scheduled_for <= now()` publiceert.

5. **Interne links updaten**: knop per post om handmatig Claude door alle bestaande artikelen te laten lopen en natuurlijke interne links toe te voegen naar deze post.

6. **Geen breaking changes op de frontend**: de bestaande `/blog`, `/blog/[slug]` en `/blog/categorie/[category]` pagina's blijven werken omdat het nieuwe systeem dezelfde adapter-interface hanteert als het oude CMS.

---

## Architectuur (hoog niveau)

```
┌──────────────────────────────────────────────────────────────┐
│ Admin UI (/admin)                                            │
│  ├── Layout met password auth                                │
│  └── Dashboard met 3 tabs                                    │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│ Admin API routes (/api/admin/blog, /api/admin/blog/generate) │
│  ├── GET  — list posts + ideas                               │
│  ├── POST — create post                                      │
│  ├── PUT  — publish/archive/schedule/approve_idea/...        │
│  └── POST (generate) — ideas, write, update-links            │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│ lib/blog-store.ts — Supabase CRUD voor blog_posts + ideas    │
│ lib/blog-writer.ts — Claude content generation               │
│ lib/blog-image-generator.ts — Claude scene → DALL·E → Storage│
│ lib/blog-adapter.ts — front-end adapter (zelfde als oud CMS) │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│ Supabase — blog_posts, blog_ideas tables + Storage bucket    │
└──────────────────────────────────────────────────────────────┘

Cron: /api/cron/publish (daily) → publiceert due scheduled posts
```

---

## Stap 1: Database schema (Supabase)

Maak één migratie-bestand `supabase/migrations/00X_blog_cms.sql`:

```sql
-- ===== BLOG POSTS =====
CREATE TABLE public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,          -- HTML content
  image TEXT,                     -- Featured image URL (Supabase Storage)
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  target_keywords TEXT[] DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts (status);
CREATE INDEX idx_blog_posts_published
  ON public.blog_posts (published_at DESC)
  WHERE status = 'published';

-- ===== BLOG IDEAS =====
CREATE TABLE public.blog_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  rationale TEXT,
  target_audience TEXT,
  status TEXT NOT NULL DEFAULT 'suggested'
    CHECK (status IN ('suggested', 'approved', 'rejected', 'written')),
  blog_post_id UUID REFERENCES public.blog_posts(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== RLS =====
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on blog_posts"
  ON public.blog_posts FOR ALL USING (true);

CREATE POLICY "Service role full access on blog_ideas"
  ON public.blog_ideas FOR ALL USING (true);
```

**Supabase Storage bucket**: maak een publieke bucket `blog-images` aan voor de header images.

---

## Stap 2: Data layer — `src/lib/blog-store.ts`

Alle database-operaties gaan via deze module. **Belangrijke functies**:

```typescript
import { supabase } from './supabase'

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  image: string | null
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  published_at: string | null
  scheduled_for: string | null
  seo_title: string | null
  seo_description: string | null
  target_keywords: string[]
  ai_generated: boolean
  created_at: string
  updated_at: string
}

export interface BlogIdea {
  id: string
  title: string
  keywords: string[]
  rationale: string | null
  target_audience: string | null
  status: 'suggested' | 'approved' | 'rejected' | 'written'
  blog_post_id: string | null
  created_at: string
}

// Posts
getPublishedPosts()          // alleen published, sorted by published_at DESC
getAllPosts()                // alles, sorted by created_at DESC
getPostBySlug(slug)          // single published post
getPostById(id)              // any post
createPost(post)             // insert, returns id
updatePost(id, updates)      // partial update, auto-update updated_at
publishPost(id)              // status='published', published_at=now()
archivePost(id)              // status='archived'
schedulePost(id, date)       // status='scheduled', scheduled_for=date
getScheduledPostsDue()       // alle scheduled posts waar scheduled_for <= now
getNextAvailableScheduleDate() // dag na laatst geplande, 07:00 UTC, of morgen
swapScheduleDates(idA, idB)  // wissel scheduled_for van 2 posts

// Ideas
getIdeas()                   // alle ideas, DESC
getIdeaById(id)
createIdea(idea)
updateIdeaStatus(id, status, blogPostId?)
deleteIdea(id)
deleteAllIdeas()             // clean slate; returns count
```

**Belangrijke logica van `getNextAvailableScheduleDate()`**:
1. Query `blog_posts` waar `status='scheduled'` sorted DESC op `scheduled_for`
2. Als er een laatste scheduled post is: base = `scheduled_for` van die post
3. Anders: base = nu
4. Return: `base + 1 dag`, tijd gezet op 07:00:00 UTC

Dit zorgt dat opeenvolgende goedkeuringen netjes op achtereenvolgende dagen worden ingepland, één artikel per dag.

---

## Stap 3: Front-end adapter — `src/lib/blog-adapter.ts`

**Cruciaal voor backward compatibility**: als de site al een blog had (bv. via externe CMS), behoud dan **exact dezelfde exports** maar haal de data nu uit Supabase. Dan hoeven `/blog`, `/blog/[slug]` en category-pagina's **niet** aangepast te worden.

Exports die typisch nodig zijn:
- `getArticles()` → alle published, sorted newest first
- `getArticleBySlug(slug)` → single post
- `getArticlesByCategory(categorySlug)` → filtered
- `CATEGORIES` constant
- `Article` / `Post` interface

Bonus feature: **multi-category met gewogen scoring**. In plaats van één categorie per post, krijgen posts meerdere categorieën op basis van gewogen keywords in titel + excerpt + content:

```typescript
const CATEGORY_KEYWORDS: Record<string, WeightedKeyword[]> = {
  'categorie-a': [
    { keyword: 'zeer specifiek', weight: 3 },
    { keyword: 'matig specifiek', weight: 2 },
    { keyword: 'generiek', weight: 1 },
  ],
  // ...
}

function getCategoriesForArticle(title, slug, excerpt, content?) {
  const text = `${title} ${slug} ${excerpt} ${content || ''}`.toLowerCase()
  const scores: Record<string, number> = {}

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const { keyword, weight } of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        scores[cat] = (scores[cat] || 0) + weight
      }
    }
  }

  // Threshold: alleen categorieën met score >= 3 meetellen
  return Object.entries(scores)
    .filter(([, s]) => s >= 3)
    .sort(([, a], [, b]) => b - a)
    .map(([cat]) => cat)
}
```

Dit voorkomt dat alle artikelen in één generieke "Power BI" / "Main" categorie belanden.

---

## Stap 4: AI content generator — `src/lib/blog-writer.ts`

Gebruikt de Anthropic SDK. Drie exports:

### 4.1 `generateBlogIdeas(existingTitles, seedKeywords?)`

Genereert 5 blogonderwerpen. **Kritische regel**: als de gebruiker seed-keywords meegeeft, MOETEN alle 5 suggesties daarover gaan — geen generieke onderwerpen.

Opzet:
- Twee aparte prompts: mét seed en zonder seed
- Mét seed: de prompt zegt expliciet `ALLE 5 MOETEN over deze keywords gaan`, geeft een voorbeeld, en de system prompt versterkt: "wijk nooit af van de opgegeven keywords"
- Random `variationSeed` per call zodat dezelfde keywords verschillende suggesties genereren bij opnieuw klikken
- `temperature: 1` voor variatie
- Output: JSON array `[{ title, keywords, rationale, target_audience }]`

### 4.2 `generateBlogPost({ title, keywords, targetAudience, existingPostSlugs })`

Schrijft het volledige artikel. Returnt `{ title, slug, excerpt, content, seoTitle, seoDescription }`.

**System prompt moet bevatten** (pas aan op taal en merk):

```
TOON & STIJL:
- Schrijf als een kennisautoriteit, niet als verkoper
- Informatief en uitgebreid — een gids die iemand bookmarkt
- MENSELIJK en natuurlijk geschreven, niet corporate of stijf
- Varieer in zinslengte: kort, dan lang, dan kort
- Concrete voorbeelden boven abstracte concepten
- "Je/jij" vorm — niet overdreven in "ik"
- Geen corporate-speak, geen buzzwords, geen sales-taal, geen "in deze blog gaan we..."

HOOFDLETTERS (voor Nederlandse content — pas aan per taal):
- Hoofdletters ALLEEN bij: zinsbegin, eigennamen, productnamen/merken, plaats-/orgnamen
- GEEN Title Case in koppen: "De vijf grootste fouten bij X" — niet "De Vijf Grootste Fouten Bij X"
- Samengesteld met merknaam: koppelteken (Power BI-rapport, Fabric-migratie)

STRUCTUUR:
- Korte inleiding (2-3 zinnen, geen "wij gaan het hebben over...")
- 4-5+ H2 hoofdsecties met duidelijke koppen
- H3 voor subsecties
- Paragrafen van 3-5 zinnen
- Bullet lists voor stappen/vergelijkingen
- <strong> spaarzaam voor eerste introductie van begrip
- Afsluitende "Samenvatting" of "Conclusie" H2

LENGTE: 1500-2500 woorden

INTERNE LINKS: 2-4 natuurlijke <a href="..."> tags naar bestaande posts/pagina's (lijst wordt meegegeven)

GEEN: H1, <html>/<body>, CTA's in de tekst, "neem contact op", sales-taal

Output: valid JSON (geen markdown fences):
{
  "title": "...",
  "slug": "url-vriendelijke-slug",
  "excerpt": "1-2 zinnen, max 160 chars",
  "content": "<h2>...</h2><p>...</p>",
  "seoTitle": "Max 60 chars | Sitenaam",
  "seoDescription": "Max 155 chars"
}
```

User message bevat: het onderwerp, de keywords, doelgroep, en een lijst van alle bestaande posts + statische pagina's om naar te kunnen linken.

### 4.3 `suggestInternalLinks({ postTitle, postContent, newPostSlug, newPostTitle })`

Zoekt in een bestaand artikel naar woorden die natuurlijk te linken zijn naar een nieuw artikel.

**Kritieke regel**: de replacement mag **geen tekst toevoegen of wijzigen** — alleen een `<a>` tag om bestaande woorden plaatsen. Validatie na de call:

```typescript
return suggestions.filter((s) => {
  const findClean = s.elementToFind.replace(/<[^>]*>/g, '').trim()
  const replaceClean = s.replacement.replace(/<[^>]*>/g, '').trim()
  return findClean === replaceClean // tekst zonder tags moet identiek zijn
})
```

Anders gaat Claude eigen tekst toevoegen zoals "Lees meer in onze gids", wat de artikelen beschadigt.

---

## Stap 5: Image generator — `src/lib/blog-image-generator.ts`

**Tweestap aanpak** (belangrijk!):

### Stap A: Claude bedenkt een scene

Gebruik Claude (sonnet) om op basis van titel + excerpt een concrete visuele scene-beschrijving te maken. Voorkom generieke output door expliciete regels:

```
System prompt:
Je bent een art director voor blog header illustraties. Op basis van titel en samenvatting
bedenk je EEN specifieke, concrete visuele scene die het kernconcept weergeeft.

REGELS:
- 1 specifieke scene in 2-4 zinnen, in het Engels
- Concrete visuele metaforen die bij het ONDERWERP passen — niet generiek
- Mention specific objects, charts, data visualizations, abstract shapes die het concept representeren
- GEEN generieke elementen zoals windmolens, mensen aan een laptop, AI robots, stock kantoren
- WEL: schematische visualisaties van het concept (bv. voor "migratie": koppelingen oude-nieuwe
  systemen; voor "performance": snelheidsmeter; voor "security": gescheiden data-lagen met sloten)
- Geen tekst in de scene
- Eén centraal idee, geen overvolle scene
- Antwoord ALLEEN met de scene-beschrijving, geen uitleg
```

### Stap B: DALL·E 3 genereert het beeld

Bouw de DALL·E prompt op: scene + consistente stijl-instructies:

```typescript
function buildImagePrompt(scene: string, colorHint: string): string {
  return `${scene}

Visual style requirements (apply consistently):
- Modern flat vector illustration in soft cartoon style
- Color palette: ${colorHint}, on a soft cream/off-white background
- Rounded shapes, gentle gradients, soft drop shadows
- Clean lines, professional but warm and approachable
- Similar to illustrations from Stripe, Notion, Figma, or Slack marketing pages
- NO text, NO letters, NO words in the image
- NO real people faces — only abstract figures or none at all
- Centered composition with breathing room
- Wide landscape format optimized for blog header / OG image
- High quality vector art style`
}
```

Color hint bepalen op basis van categorie (bv. `getCategoriesForArticle(title, slug, excerpt)` → eerste categorie → kleur-map).

DALL·E call:
```typescript
const response = await openai.images.generate({
  model: 'dall-e-3',
  prompt,
  size: '1792x1024',   // landscape, dichtst bij OG image ratio
  quality: 'standard',
  n: 1,
  response_format: 'b64_json',
})
```

Upload naar Supabase Storage bucket `blog-images` onder `blog/{slug}-{timestamp}.png` met `cacheControl: '31536000'`. Return de public URL.

**Next.js image config**: voeg de Supabase hostname toe aan `next.config.ts` in `images.remotePatterns`, anders rendered `<Image>` niet:

```typescript
{
  protocol: 'https',
  hostname: '**.supabase.co',
  pathname: '/storage/v1/object/public/**',
}
```

---

## Stap 6: Admin UI

### 6.1 Layout met auth — `src/app/admin/layout.tsx`

Simpele client-side wachtwoord-check:
- Leest `ADMIN_PASSWORD` via een auth-check endpoint OF vergelijkt client-side (minder veilig)
- Beste: server-side check endpoint dat een token teruggeeft, opgeslagen in `localStorage`
- Alle `/api/admin/*` routes checken een `x-admin-token` header tegen `ADMIN_PASSWORD`
- De layout toont een password-prompt als er geen token is, anders de content

### 6.2 Dashboard — `src/app/admin/page.tsx` (client component)

State:
```typescript
const [tab, setTab] = useState<"posts" | "ideas" | "new">("posts")
const [posts, setPosts] = useState<BlogPost[]>([])
const [ideas, setIdeas] = useState<BlogIdea[]>([])
const [loading, setLoading] = useState(true)
const [generating, setGenerating] = useState(false)
const [actionId, setActionId] = useState<string | null>(null) // voor per-rij spinner
const [statusFilter, setStatusFilter] = useState<string>("all")
const [seedKeywords, setSeedKeywords] = useState("")
```

Drie tabs:

**Tab "Artikelen" — unified tabel**

Sorteer posts: scheduled (ASC op datum) → drafts → published (DESC) → archived.

Filter chips: Alle / draft / scheduled / published / archived.

Per rij:
- Reorder pijlen (▲▼) — alleen voor scheduled posts, wissel `scheduled_for` met buur via `swap_dates` API
- Thumbnail (post.image) of placeholder icoon
- Status badge (kleurgecodeerd) + AI badge als `ai_generated`
- Titel
- Datum: voor draft/scheduled → inline `<input type="date">` om te schedulen; voor published → `published_at` tekst
- Actie-knoppen:
  - 👁 bekijk (alleen published, target _blank naar `/blog/{slug}`)
  - 🔗 update interne links (alleen published → roept `update-links` endpoint aan)
  - 🖼 image (her)genereer — werkt voor alle niet-archived
  - ✏ bewerk → `/admin/edit/{id}`
  - 📤 nu publiceren (alleen draft/scheduled)
  - 📦 archiveren (alle niet-archived)
- Per-rij `actionId === post.id` → toont spinner + opacity-50 op de hele rij + disables de knoppen

**Tab "Onderwerpen"**

- Textarea voor `seedKeywords` (optioneel, placeholder: "bv. fabric kosten, dax performance, ...")
- Knop "AI: stel onderwerpen voor (met jouw keywords)" indien seed, anders "via web search"
- Knop "Verwijder alle onderwerpen" (rood outline) — alleen zichtbaar als er ideeën zijn, met `confirm()` prompt
- Lijst van **actieve ideeën** — filter: alleen `suggested` + `approved`, hide automatisch `written` + `rejected`
- Per idee: status badge, doelgroep, titel, rationale, keyword chips
- Knoppen per idee: ✓ goedkeuren (roept `approve_idea` aan — zie flow hieronder) en ✗ verwijderen (roept `delete_idea` aan)
- Tab counter toont `activeIdeasCount` (suggested+approved), niet totaal

**Tab "Nieuw artikel"**

- Input: titel, keywords (komma-gescheiden)
- Checkbox: "Laat AI het artikel schrijven"
- Knop: "AI: schrijf artikel" → roept generate endpoint aan met `action: "write"` + titel + keywords

### 6.3 Handlers pattern

Alle mutaties moeten:
1. `setActionId(id)` of `setGenerating(true)`
2. `await fetch(...)` de API met `x-admin-token` header
3. `if (!res.ok)` → `alert(data.error || res.statusText)` — geen stille failure
4. `await fetchData()` om de tabel te refreshen
5. `finally` → reset de loading state

```typescript
const handlePostAction = async (id, action, extra?) => {
  setActionId(id)
  try {
    const res = await fetch("/api/admin/blog", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
      body: JSON.stringify({ id, action, ...extra }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Actie '${action}' mislukt: ${data.error || res.statusText}`)
    }
    await fetchData()
  } catch (e) {
    alert(`Netwerkfout bij actie '${action}'`)
  } finally {
    setActionId(null)
  }
}
```

### 6.4 Edit page — `src/app/admin/edit/[id]/page.tsx`

Client component met:
- Formulier voor alle velden (titel, slug, excerpt, content, image, seo_title, seo_description, target_keywords)
- Content als textarea met HTML, of simpele rich text editor
- Live preview naast het formulier (optioneel)
- Opslaan als draft / publiceren knoppen

---

## Stap 7: API routes

### 7.1 `src/app/api/admin/blog/route.ts`

```typescript
export const maxDuration = 300        // admin mag lang duren (AI calls)
export const dynamic = 'force-dynamic'

function checkAuth(req: Request): boolean {
  return req.headers.get('x-admin-token') === process.env.ADMIN_PASSWORD
}

function revalidateBlog(slug?: string) {
  revalidatePath('/blog')
  revalidatePath('/sitemap.xml')
  if (slug) revalidatePath(`/blog/${slug}`)
  // + elke categoriepagina
}
```

**GET** — return `{ posts: getAllPosts(), ideas: getIdeas() }`

**POST** — `createPost()` met body velden, return `{ postId }`

**PUT** — dispatcher op `action`:

| action | params | gedrag |
|---|---|---|
| `publish` | `id` | `publishPost(id)` + `revalidateBlog()` → **direct retour, GEEN blocking links loop** |
| `archive` | `id` | `archivePost(id)` + revalidate |
| `schedule` | `id`, `scheduled_for` | `schedulePost(id, date)` |
| `swap_dates` | `id`, `other_id` | `swapScheduleDates(id, other_id)` |
| `approve_idea` | `id` | **Complete flow** — zie hieronder |
| `reject_idea` | `id` | `updateIdeaStatus(id, 'rejected')` |
| `delete_idea` | `id` | `deleteIdea(id)` |
| `clear_all_ideas` | _geen id_ | `deleteAllIdeas()` — bulk delete |
| `regenerate_image` | `id` | `generateBlogImage({ title, slug, excerpt })` → `updatePost(id, { image })` |
| _geen action_ | `id` + velden | generieke `updatePost(id, updates)` |

**Approve idea flow** (de belangrijkste):
```typescript
if (putAction === 'approve_idea') {
  const idea = await getIdeaById(id)
  if (!idea) return 404

  await updateIdeaStatus(id, 'approved')

  // 1. Schrijf het artikel via Claude
  const existingPosts = await getPublishedPosts()
  const existingPostSlugs = existingPosts.map(p => ({ slug: p.slug, title: p.title }))
  const post = await generateBlogPost({
    title: idea.title,
    keywords: idea.keywords,
    targetAudience: idea.target_audience || undefined,
    existingPostSlugs,
  })

  // 2. Bereken volgende vrije datum
  const scheduledFor = await getNextAvailableScheduleDate()

  // 3. Maak de post aan als draft, dan schedule
  const postId = await createPost({ ...post, status: 'draft', ai_generated: true })
  await schedulePost(postId, scheduledFor)

  // 4. Genereer image non-blocking (wrap in try/catch)
  try {
    const imageUrl = await generateBlogImage({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
    })
    if (imageUrl) await updatePost(postId, { image: imageUrl })
  } catch (err) {
    console.error('Image generation failed (non-blocking):', err)
  }

  // 5. Markeer idee als 'written'
  await updateIdeaStatus(id, 'written', postId)

  revalidateBlog(post.slug)
  return NextResponse.json({ success: true, postId, scheduledFor })
}
```

### 7.2 `src/app/api/admin/blog/generate/route.ts`

POST dispatcher op `action`:
- `"ideas"` — leest `seedKeywords` + `existingTitles`, roept `generateBlogIdeas()`, saves elke idea via `createIdea()`, return list
- `"write"` — handmatige "schrijf nieuw artikel met deze titel", roept `generateBlogPost()`, saves als draft, return post
- `"update-links"` — voor één post ID, loopt door alle OTHER published posts, roept `suggestInternalLinks()` per post, filter validatie, `updatePost()` met nieuwe content. Return `{ updatedCount }`

### 7.3 `src/app/api/cron/publish/route.ts`

```typescript
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const CRON_SECRET = process.env.CRON_SECRET

function isAuthorizedCron(req: Request): boolean {
  // 1) Vercel cron header (aanwezig bij elke Vercel cron invocation)
  if (req.headers.get('x-vercel-cron')) return true
  // 2) Bearer token voor handmatige triggers
  const authHeader = req.headers.get('authorization')
  if (CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) return true
  // 3) Geen secret ingesteld → open (dev)
  if (!CRON_SECRET) return true
  return false
}

export async function GET(req: Request) {
  console.log('[PUBLISH CRON] Triggered')

  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const duePosts = await getScheduledPostsDue()
  let published = 0
  for (const post of duePosts) {
    try {
      await publishPost(post.id)
      published++
    } catch (err) {
      console.error(`Failed to publish ${post.id}:`, err)
    }
  }

  return NextResponse.json({
    checked: duePosts.length,
    published,
    timestamp: new Date().toISOString(),
  })
}
```

**Belangrijk**: ondersteun ZOWEL `x-vercel-cron` header ALS `CRON_SECRET` bearer. Voeg debug logs toe om te kunnen verifiëren of de cron ooit door Vercel getriggerd wordt.

---

## Stap 8: Vercel cron config

Maak/update `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish",
      "schedule": "0 6 * * *"
    }
  ]
}
```

**Belangrijke noten over Vercel cron**:
- Schedule is in **UTC** — geen timezone support
- **Hobby plan**: crons hebben een **flexibel uur-venster**, draait ergens binnen dat uur
- Voor 07:00 Nederlandse (winter)tijd → schedule op `"0 6 * * *"` (wordt 08:00 in zomertijd)
- Hobby plan: max 2 crons, daily schedule
- Na deployment: check `https://vercel.com/{team}/{project}/settings/cron-jobs` — de crons moeten daar zichtbaar zijn
- Als crons niet draaien: check `CRON_SECRET` env var + "View Logs" in dashboard + handmatig "Run" knop

---

## Stap 9: Environment variables

Voeg toe in Vercel project (Production + Preview + Development):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# AI providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Admin + cron
ADMIN_PASSWORD=kies-een-lang-willekeurig-wachtwoord
CRON_SECRET=kies-een-lang-willekeurig-secret

# Site
NEXT_PUBLIC_SITE_URL=https://www.example.com
```

---

## Stap 10: Migratieproces (als er al een blog is)

Als de site al een blog heeft via een externe CMS:

1. **Migratie SQL draaien** in Supabase
2. **Import script schrijven** — `scripts/import-from-old-cms.ts` dat:
   - Alle bestaande artikelen ophaalt via de oude API
   - Per artikel ook de content ophaalt
   - Alles insert in `blog_posts` met `status='published'` en `published_at` op de oorspronkelijke datum
   - Draait via `npx tsx scripts/import-from-old-cms.ts`
3. **Blog adapter deployen** met nieuwe Supabase-backend (zelfde exports als oud)
4. **Verifiëren** dat `/blog`, `/blog/[slug]`, `/blog/categorie/[slug]` nog werken
5. **Oude CMS opzeggen**

---

## Stap 11: Kritische gotchas (lessons learned)

1. **PUT publish mag NIET blocken op internal links**. Als je na `publishPost()` door alle bestaande posts gaat en per stuk Claude aanroept, timeout je serverless function na 10-60s. Maak het een aparte, handmatige actie.

2. **Admin handlers moeten visuele feedback geven**. Een `fetch` zonder loading state + zonder error handling voelt aan als "knop werkt niet" terwijl de backend 30 seconden aan het werken is.

3. **DALL·E prompts MOETEN specifiek zijn**, anders krijg je elke keer dezelfde generieke stock-achtige illustratie. Gebruik ALTIJD de tweestap: Claude bedenkt scene → DALL·E rendert.

4. **AI voor interne links MOET gevalideerd worden**. Zonder validatie voegt Claude eigen tekst toe ("Lees meer in onze gids") in plaats van alleen een `<a>` tag te plaatsen. Valideer dat `elementToFind` en `replacement` na HTML-strip identiek zijn.

5. **Next.js image remotePatterns** moet de Supabase Storage hostname bevatten, anders rendered `<Image>` niet.

6. **Seed keywords moet dominant zijn in de prompt**. Als je ze als "extra context" meegeeft, negeert Claude ze. Maak ze de primaire instructie met "ALLE 5 MOETEN over deze keywords gaan".

7. **Vercel cron `x-vercel-cron` header** is nodig naast `CRON_SECRET` — sommige Vercel configuraties triggeren alleen met die header. Accepteer beide.

8. **Nederlandse hoofdletters**: in meeste niet-Engelse talen moet je expliciet tegen Claude zeggen om GEEN Title Case te gebruiken in koppen. Anders krijg je "De Vijf Grootste Fouten" in plaats van "De vijf grootste fouten".

9. **`revalidatePath()` na elke mutatie** is noodzakelijk omdat Next.js de statische `/blog` pagina anders niet update met nieuwe posts of images.

10. **`export const maxDuration = 300`** op admin routes — AI calls duren lang, default timeout is te kort.

---

## Checklist voor acceptatie

- [ ] Supabase tables bestaan + RLS policies actief
- [ ] Supabase Storage bucket `blog-images` aangemaakt (publiek)
- [ ] `/admin` vereist wachtwoord en werkt na login
- [ ] Tab "Artikelen" toont alle posts gesorteerd in unified tabel
- [ ] Filter chips werken (all / draft / scheduled / published / archived)
- [ ] Reorder pijlen wisselen data correct
- [ ] Inline datepicker update `scheduled_for`
- [ ] "Nu publiceren" knop werkt direct (< 3s) met visuele spinner
- [ ] Tab "Onderwerpen" toont seed keywords textarea
- [ ] "AI: stel onderwerpen voor" zonder seed geeft 5 generieke suggesties
- [ ] "AI: stel onderwerpen voor" MÉT seed geeft 5 suggesties die ALLE over die keywords gaan
- [ ] Goedkeuren ✓ schrijft artikel + genereert image + plant in op next free day
- [ ] Geplande artikel verschijnt in Artikelen tab met juiste datum
- [ ] Image wordt zichtbaar in de admin tabel én op `/blog`
- [ ] "Verwijder alle onderwerpen" doet bulk delete
- [ ] Written + rejected ideeën zijn automatisch verborgen
- [ ] `vercel.json` cron is geregistreerd in Vercel dashboard
- [ ] Handmatig cron triggeren via Vercel "Run" knop publiceert due posts
- [ ] `/blog` en `/blog/[slug]` tonen de nieuwe (Supabase) content
- [ ] `npm run build` slaagt zonder errors

---

## Bestandsoverzicht (als reference)

```
supabase/
└── migrations/
    └── 00X_blog_cms.sql              # database schema

src/
├── lib/
│   ├── supabase.ts                   # Supabase client (reuse bestaande)
│   ├── blog-store.ts                 # Database CRUD (nieuw)
│   ├── blog-adapter.ts               # Front-end adapter met categories
│   ├── blog-writer.ts                # Claude: ideas + write + internal links
│   └── blog-image-generator.ts       # Claude scene + DALL·E
│
├── app/
│   ├── admin/
│   │   ├── layout.tsx                # password auth
│   │   ├── page.tsx                  # dashboard met 3 tabs
│   │   └── edit/[id]/page.tsx        # article editor
│   │
│   └── api/
│       ├── admin/
│       │   └── blog/
│       │       ├── route.ts          # GET/POST/PUT dispatcher
│       │       └── generate/
│       │           └── route.ts      # ideas/write/update-links
│       │
│       └── cron/
│           └── publish/
│               └── route.ts          # daily publish cron
│
└── (existing blog routes — NIET aanpassen)
    ├── blog/page.tsx
    ├── blog/[slug]/page.tsx
    └── blog/categorie/[category]/page.tsx

scripts/
└── import-from-old-cms.ts            # eenmalige migratie (indien nodig)

vercel.json                            # cron config
```

---

## Volgende stappen nadat dit is gebouwd

Na het bouwen van dit kernsysteem, overweeg deze uitbreidingen:

1. **Content-aware CTAs**: weeg keywords in titel+excerpt+content en selecteer twee relevante CTA's per post (één lead magnet, één service)
2. **Analytics hook**: log views per post in Supabase
3. **Scheduled social posts**: bij publicatie automatisch een LinkedIn post draft genereren
4. **RSS/Atom feed**: `/blog/rss.xml` auto-generated
5. **Sitemap integratie**: zorg dat nieuwe posts in `sitemap.xml` komen (gebruik `revalidatePath('/sitemap.xml')` na mutaties)
6. **`llms.txt` route**: dynamische `llms.txt` die alle gepubliceerde posts bevat voor AI search engines
7. **Newsletter integratie**: sync nieuwe posts automatisch naar Brevo/Mailchimp/ConvertKit

---

**Begin nu met bouwen. Werk fase-voor-fase (database → store → API → UI → cron) en draai `npm run build` na elke fase om te verifiëren dat alles compileert. Test elke handler handmatig via de admin UI voordat je naar de volgende fase gaat.**
