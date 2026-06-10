# Site-optimalisatie: snelheid, security, design-systeem & content-herstel

## Samenvatting

Vijf commits uit twee optimalisatierondes, samen één grote opruimactie over snelheid, beveiliging, visuele consistentie en content-kwaliteit.

### ⚡ Snelheid (`c347969`)
- Team-avatars van ~9,4 MB → 568 KB (2048px → 512px, ongebruikte `lex.png` verwijderd)
- Supabase-reads voor blog gecached via `unstable_cache` (1u TTL, tag-invalidatie bij publiceren) — voorheen ging elke render naar de database

### 🔒 Security (`c347969` + `567c1ec`)
- **Admin-paneel server-side afgeschermd** via `src/proxy.ts` (Next 16) + httpOnly sessie-cookie; vervangt de localStorage-check die elk wachtwoord ≥ 4 tekens accepteerde
- `'admin'`-wachtwoord-fallback verwijderd uit 15 admin-API-routes (fail-closed)
- Rate limiting op `/api/contact`, `/api/leads`, `/api/dax-assistant`, `/api/readiness-scan` en de nieuwe login-route
- HTML-escaping in contactmail (injectie-lek gedicht)
- `middleware.ts` → `proxy.ts` migratie (deprecation-warning weg, legacy `/blog?post=`-redirect behouden)

### 🎨 Design-systeem (`5d37f7b`)
- ~790 legacy-tokenverwijzingen gemigreerd naar de HR-rebrand-tokens; legacy-laag (`--accent`, `--background`, `glass-card`, sector-kleuren) volledig verwijderd uit `globals.css`
- Oranje nu exclusief voor CTA's: hover/links → navy, badges → groen
- Latente bug gefixt: `--accent-warm` was nergens gedefinieerd (DAX-assistant)
- Headings op publieke pagina's genormaliseerd naar semibold (600)

### 🔍 Audit & content-herstel (`75f098c` + `f4c1c20`)
- Metadata + canonicals toegevoegd aan drie tools-pagina's en `/blog`
- Site-crawl (86 pagina's): **45 van 61 blogartikelen** bleken corrupte geneste links te bevatten (auto-linkificatie-bug, tot 5 niveaus diep) → hersteld via `scripts/audit-blog-links.ts` met backup; her-crawl toont **0 kapotte links** (was 33× 404)
- UX: cookie-banner gelijkwaardige knoppen, hero-foto op mobiel, GA zonder Google Signals

## ⚠️ Vóór deploy
- [ ] **`ADMIN_PASSWORD` instellen in Vercel** — zonder deze env var sluit het admin-paneel iedereen buiten (fail-closed by design)

## Verificatie
- Productie-build groen, alle publieke pagina's statisch/SSG
- Admin-flow end-to-end getest (redirect, 401, cookie, diepe routes)
- Visueel geverifieerd: home, cases, case-detail, blog, tools
- Supabase-herstel: dry-run → fix → her-audit (0 corrupt) → her-crawl (0 broken links); rollback-backup in `scripts/`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
