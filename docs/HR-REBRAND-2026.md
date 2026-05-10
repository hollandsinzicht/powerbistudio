# HR-rebrand 2026 — go-live-rapport

PowerBIStudio.nl is herpositioneerd van een algemene Power BI-studio
(zes proposities, "we/wij/team") naar een HR-analytics-specialistenpraktijk
(één propositie, solo "ik"). Deze file documenteert de eindstand van het
traject, de QA-resultaten en de openstaande stop-points.

## Branch-stack

Veertien feature-branches, elk gestapeld op de vorige. Mergen kan in volgorde
naar `main`, of als één squash-PR.

```
feat/qa-final                   ←  jij bent hier (deze branch)
feat/blog-conversion       9d6af9e
feat/microcopy             3c3c02c
feat/seo-metadata          41c8373
feat/footer-menu           6702026
feat/global-text-replace   ffd9fcd
feat/redirects-and-cleanup 64d4f5a
feat/tools-cleanup         59c1f28
feat/over-rewrite          fd375cc
feat/dashportal-rewrite    80307c3
feat/methodiek-page        d05a5db
feat/hr-analytics-page     9b5dd37
feat/homepage-hr           66c8dfd
feat/methodiek-visual      d785cb4
feat/design-system         3682b64
main                       ← startpunt
```

Tag `pre-hr-rebrand-2026` ligt op de pre-rebrand-stand van `main` als
safety-net.

## QA-checks (uitgevoerd op feat/qa-final)

### Build

`npm run build` — slaagt zonder errors. **38 routes** statisch
gegenereerd. Geen TypeScript-errors, geen broken imports.

### Redirects (curl-getest, alle 308/307)

| Source | Status | Destination |
|---|---|---|
| `/saas` | 308 | `/hr-analytics` |
| `/saas/:path*` | 308 | `/hr-analytics` |
| `/publieke-sector` | 308 | `/cases/ggdghor` |
| `/publieke-sector/:path*` | 308 | `/cases/ggdghor` |
| `/fabric-migratie` | 308 | `/blog` |
| `/fabric-migratie/:path*` | 308 | `/blog` |
| `/copilot-readiness` | 308 | `/hr-analytics` |
| `/copilot-readiness/:path*` | 308 | `/hr-analytics` |
| `/procesverbetering` | 308 | `/methodiek` |
| `/procesverbetering/:path*` | 308 | `/methodiek` |
| `/tools/report-auditor` | 308 | `/hr-analytics` |
| `/tools/report-auditor/:path*` | 308 | `/hr-analytics` |
| `/resources` | 307 | `/avg-checklist-hr` |
| `/resources/:path*` | 307 | `/avg-checklist-hr` |
| `/kennisbank` | 308 | `/blog` |
| `/kennisbank/:path*` | 308 | `/blog` |

### HTTP-statuscodes op nieuwe pagina's

| Path | Status |
|---|---|
| `/` | 200 |
| `/hr-analytics` | 200 |
| `/methodiek` | 200 |
| `/dashportal` | 200 |
| `/over` | 200 |
| `/contact` | 200 |
| `/privacy` | 200 |
| `/sitemap.xml` | 200 |
| `/robots.txt` | 200 |
| `/llms.txt` | 200 |
| `/willekeurige-onbekende-url` | 404 |

### Sitemap.xml

Bevat alleen actieve HR-URL's plus dynamische cases en blog-categorieën.
Geen verwijzingen meer naar verwijderde proposities. Privacy-pagina is opgenomen.

### llms.txt

Volledig herschreven naar HR-propositie. Bevat NAW (Papendrecht, KVK 62432168),
solo-positionering, vier HR-pakketten met prijzen, methodiek-uitleg, cases
en sectie "Niet aangeboden" (Workday, SuccessFactors, generic Power BI).

### Schema.org

- Layout root: `ProfessionalService` met NAW, founder, knowsAbout, OfferCatalog
- `/over`: `Person` (Jan Willem)
- `/hr-analytics`: `FAQPage` (8 vragen) + `Service` per pakket
- Blog posts: `BlogPosting` met `Person` author = Jan Willem
- Breadcrumbs op /over en blog-posts

**Te valideren door jou voor go-live:** [Google Rich Results Test](https://search.google.com/test/rich-results) op /, /hr-analytics, /over en een blog-post.

### Privacy & analytics

- Facebook/Meta Pixel: **verwijderd**
- Google Analytics 4 (G-YHED8H8DHL): behouden, met **Consent Mode v2**:
  - Default: alle storage-types op `denied`
  - Pas wanneer gebruiker cookie-banner accepteert: `analytics_storage` → `granted`
  - localStorage onthoudt keuze (`pbi-cookie-consent`)
- `anonymize_ip: true` actief
- Privacy statement op `/privacy` (concept, stop-point voor jurist)

## Wat is er gebouwd / herschreven

### Nieuwe pagina's
- `/hr-analytics` — hoofdlandingspagina (444 regels): hero, voor-wie/niet-voor-wie,
  drie problemen uitgebreid, methodiek-visual, vier pakketten in 2x2 grid met
  Foundation gemarkeerd "Meest gekozen", FAQ (8 vragen, collapsible), footer-CTA
- `/methodiek` (285 regels) — vervangt /procesverbetering. Hero, vier-lagen-visual,
  per-laag-uitleg, DMAIC toegepast op HR, vier doelrollen, footer-CTA
- `/privacy` — concept-versie privacy-statement (stop-point voor AVG-jurist)
- 404-pagina (`not-found.tsx`) met 6 suggestie-links

### Volledig herschreven
- `/` (homepage) — 8 secties HR-propositie
- `/over` — solo-positionering, drie leveringsmodi-sectie verwijderd
- `/dashportal` — herpositionering naar "DashPortal HR Hosting" met 3 pricing-tiers
- `/contact` — 3 instap-blokken + simpel formulier (5 type-opties)
- `/tools` — 3 HR-tools in plaats van 5
- `/tools/readiness-scan` — 10 HR-vragen + 4 maturiteits-niveaus
- `/tools/bi-kosten-calculator` — HR-context (slug behouden voor SEO)
- `/blog` (overview) + `/blog/[slug]` (HR-context, conversie-elementen)

### Nieuwe components
- `<CTA />` — vier varianten (primary, lead-magnet, soft, navigation)
- `<MethodieDiagram />` — herbruikbare bron-zilver-goud-semantisch SVG
- `<InlineCTA />` — Quick Scan-prompt onderaan blog-posts
- `<StickyCTA />` — verschijnt vanaf 25% scroll, sluitbaar
- `<CookieBanner />` — GA4 opt-in via Consent Mode v2

### Verwijderd
- 6 oude pagina-folders (saas, publieke-sector, fabric-migratie, copilot-readiness,
  procesverbetering, resources)
- Report Auditor + Stripe + audit-API + audit-libs (volledige uitfasering)
- Facebook/Meta Pixel
- Drie sector-vars uit design system (sector-zorg/saas/data — legacy fallbacks blijven)
- Diensten-dropdown uit hoofdmenu
- LEX agent uit team-data

### Tools die blijven
- `/tools/dax-assistant` — blijft gratis tool met Claude API. Banner bovenaan
  verwijst naar HR Analytics als hoofdpropositie.
- `/cases/*` — alle vier cases (GGDGHOR, Lyreco, Technische Unie, Vattenfall)
- `/blog/*` — content blijft, infrastructuur (Supabase, admin, cron) ongewijzigd

## Code-stats

| Branch | Files Δ | Insertions | Deletions |
|---|---|---|---|
| design-system | 3 | +316 | -36 |
| methodiek-visual | 2 | +184 | 0 |
| homepage-hr | 3 | +431 | -350 |
| hr-analytics-page | 1 | +444 | 0 |
| methodiek-page | 1 | +285 | 0 |
| dashportal-rewrite | 1 | +357 | -456 |
| over-rewrite | 1 | +212 | -214 |
| tools-cleanup | 27 | +485 | -3456 |
| blog-conversion | 5 | +166 | -14 |
| redirects-and-cleanup | 13 | +42 | -1086 |
| global-text-replace | 7 | +12 | -12 |
| seo-metadata | 2 | +210 | -128 |
| footer-menu | 2 | +236 | -315 |
| microcopy | 5 | +735 | -210 |
| **Totaal** | | **+4115** | **-6277** |

Netto **2162 regels code minder** in de codebase, met substantieel meer
functionaliteit (solo-positionering, AVG-conform, vaste pakketten, doorlopende
hosting). Tools-cleanup is verantwoordelijk voor het grootste deel van de
verwijderingen (Stripe + audit-infra).

## Stop-points (nodig vóór go-live)

Deze items zijn placeholders en vereisen jouw input:

1. **Pricing definitief** — bevestig: Quick Scan €1.950 / Foundation €34.500 /
   Foundation Plus €58.500 / DashPortal Essential €1.250/mnd / Professional
   €1.950/mnd / Enterprise vanaf €3.500/mnd / implementatie €2.500-€7.500
2. **Privacy statement** — concept-tekst staat op `/privacy`. Laten checken
   door AVG-jurist alvorens live.
3. **AVG-checklist HR PDF** — link `/avg-checklist-hr` is in nav/footer/cta's,
   maar de pagina zelf bestaat nog niet (out-of-scope voor deze 14 branches).
   Komt in `feat/lead-magnet-avg-checklist`.
4. **Brevo HR contact-list ID** — vereist voor lead-magnet-flow. Maak nieuwe list
   in Brevo, deel ID voor `BREVO_LIST_HR` env var.
5. **Tone of voice 5-mail HR-flow** — uit te schrijven.
6. **OG-images per pagina** — momenteel default OG. Optioneel
   per-pagina-template.

## Out-of-scope (eventueel na launch)

- ISO 27001 traject
- Calendly + Stripe self-service Quick Scan booking
- Webinar-platform
- Klantportaal voor DashPortal HR-klanten
- Testimonial-component
- KPI-bibliotheek HR (interactieve resource)
- DPIA-template als download

## Aanbevolen merge-volgorde

Als je squash-mergen wilt, kan dat in één keer (alle commits
samengevoegd). Als je linear wilt mergen voor een schone history:

```
git checkout main
git merge feat/design-system
git merge feat/methodiek-visual
git merge feat/homepage-hr
git merge feat/hr-analytics-page
git merge feat/methodiek-page
git merge feat/dashportal-rewrite
git merge feat/over-rewrite
git merge feat/tools-cleanup
git merge feat/blog-conversion
git merge feat/redirects-and-cleanup
git merge feat/global-text-replace
git merge feat/seo-metadata
git merge feat/footer-menu
git merge feat/microcopy
git merge feat/qa-final
```

Of: een PR per branch met de stack-volgorde aanhouden.

## Pre-rebrand snapshot

Tag `pre-hr-rebrand-2026` op het oude `main`. Reverten kan via:

```
git checkout main
git reset --hard pre-hr-rebrand-2026
```

(Niet doen tenzij echt nodig — alle nieuwe content gaat dan verloren.)
