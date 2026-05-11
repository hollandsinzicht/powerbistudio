# Blog editorial guidelines — HR-lens

> Sinds 2026 is Power BI Studio een HR analytics-specialist. Deze richtlijn beschrijft hoe alle blogcontent dat positioneringssignaal moet versterken — voor nieuwe artikelen én voor het herschrijven van bestaande.

## Kernregel

**HR is de standaard, techniek mag waar logisch.**

Elke blogpost moet binnen de eerste **150 woorden** óf:

- een **HR-probleem** benoemen (verzuim, formatie, instroom/uitstroom, AVG-risico, manager-toegang), óf
- een **HR-dataset** als voorbeeld kiezen (medewerkertabel, verzuimregistratie, organisatie-hiërarchie), óf
- een **HR-rol** als lezer aanspreken (HR-directeur, HR-controller, DPO, BI-lead bij HR).

Pure techniek-content (geen HR-framing) mag alleen als het onderwerp universeel Microsoft-tooling betreft (nieuwe Fabric SKU, nieuwe DAX-functie, breaking change in Power BI Desktop). Schat: ~20% van het volume mag dit zijn, niet meer.

## Doelgroep

Schrijf voor:

- **HR-directeur** in mid-market werkgever (250-2.000 FTE) — strategisch, weinig tijd, niet-technisch
- **HR-controller** — getallenmens, wil weten of cijfers kloppen, leest details
- **DPO / Functionaris Gegevensbescherming** — let op AVG-conformiteit, verwerkingsregisters, RLS
- **BI-lead bij HR-team** — bouwt zelf in Power BI, zoekt patterns die werken

Niet meer voor:

- ISV/SaaS-bouwers (was oude propositie, vervallen)
- Power BI-consultants als peer-publiek (geen lead-pool)
- Generieke "elke organisatie" (te breed, converteert niet)

## HR-systemen waar de praktijk om draait

Noem deze waar relevant — ze zijn deel van de positionering, niet decoratie:

- **AFAS** — Profit/Personeel & Salaris
- **Visma** — Visma.net HRM, YouServe
- **Nmbrs** — salarisadministratie + HRM

Geen Workday, geen SAP SuccessFactors (uitsluiting in `/llms.txt` "Niet aangeboden").

## HR-vocabulaire (gebruik waar van toepassing)

- **Metrics:** verzuim, verzuimpercentage, instroom, uitstroom, doorstroom, formatie-realisatie, FTE, time-to-hire, employee turnover, ziekteverzuim-meldfrequentie
- **Architectuur:** hiërarchische RLS, organisatie-hiërarchie, type-2 historiek (SCD2), retroactieve mutaties, peildatum, manager-rol, kostendrager
- **Governance:** AVG, GDPR, DPO, verwerkingsregister, dataminimalisatie, doelbinding, bewaartermijn, AVG-cockpit
- **Mid-market:** "mid-market werkgever", "250-2.000 FTE", "tussen MKB en enterprise"

## Per archetype — HR-framing instructie

| Archetype | HR-framing voorschrift |
|---|---|
| `technical-deep-dive` | Voorbeeld-dataset MOET HR zijn (verzuim, medewerker, hiërarchie). Geen verkoopdata, geen voorraad. Code-snippets gebruiken HR-kolomnamen (Medewerker_ID, FTE, Verzuim_uren). |
| `decision-framework` | Beslistabel positioneert keuze voor mid-market HR-organisatie (250-2.000 FTE, AFAS/Visma/Nmbrs). Drempelwaarden in HR-grootheden (aantal managers, aantal medewerkers, aantal RLS-rollen). |
| `anti-pattern-essay` | Anti-pattern wordt geïllustreerd in HR-context — bijv. "verzuim per maand zonder peildatum" of "RLS met email-adres in plaats van hiërarchie". |
| `comparison` | Scenario's per kant zijn HR-organisaties. "Wanneer A wint = HR-team van 50 in AFAS." "Wanneer B wint = HR-team met 5 bronnen en eigen DPO." |
| `case-driven` | Bij voorkeur een HR-case. Bestaande cases (GGDGHOR, Lyreco, Technische Unie, Vattenfall) zijn geen pure HR-cases — gebruik ze alleen als de transferbare les expliciet over HR-relevante mechanismen gaat (RLS-hiërarchie, multi-bron-integratie, DMAIC op rapportagecyclus). |
| `tutorial` | Einddoel is een werkend HR-dashboardelement: een verzuim-measure, een hiërarchische RLS-rol, een formatie-versus-realisatie tabel, een AVG-conforme medewerker-dimensie met SCD2. |
| `faq` | Geselecteerde vragen zijn vragen die HR-directeuren en HR-controllers stellen, niet wat een ontwikkelaar in Google typt. Vermijd "wat is X" — kies "kan ik X in AFAS zonder Y?" |

## Voorbeelden van herframing

Voor het herschrijven van bestaande posts:

| Oude framing (generiek) | Nieuwe framing (HR-lens) |
|---|---|
| Row-Level Security in Power BI | RLS voor HR-hiërarchie: hoe manager X alleen team Y ziet |
| Type 2 SCD in semantisch model | Historiciteit in HR: hoe reorganisaties je verzuimcijfer kapotmaken |
| DAX-performance optimaliseren | Verzuimdashboard van 30s naar 2s: drie DAX-fouten in AFAS-data |
| Fabric vs Premium | Fabric voor HR: wanneer migreren bij 1.000+ FTE de moeite waard wordt |
| Lean Six Sigma in BI | DMAIC op je instroomproces: van 47 naar 28 dagen time-to-hire |
| Power BI governance | HR-governance in Power BI: AVG, DPO-cockpit en bewaartermijnen |
| Star schema bouwen | Sterschema voor HR-data: medewerker, organisatie, verzuim, contract |
| Datakwaliteit Power BI | Datakwaliteit in HR: waarom je verzuimcijfer elke maand anders is |

## Herschrijfworkflow voor bestaande posts

1. **Slug blijft gelijk** (URL-autoriteit behouden, geen 301-redirect-keten).
2. **Title en seo_title** herzien — HR-trefwoord erin waar logisch.
3. **Excerpt** herschrijven naar HR-framing.
4. **H1 + intro (eerste 150 woorden)** herschrijven volgens de kernregel hierboven.
5. **Voorbeelden door artikel heen** — DAX-snippets, tabellen, screenshot-placeholders — vervangen door HR-equivalent waar mogelijk.
6. **`updated_at` automatisch** geüpdatet — dat versterkt het schema.org `dateModified` signaal.

Prioriteit: top-traffic posts eerst (te bepalen via Google Search Console of Vercel Analytics).

## Wat NIET meer in nieuwe content

- Generieke "elke organisatie heeft data-uitdagingen"-openingen
- ISV/SaaS-voorbeelden (oude propositie, vervallen)
- Embedded analytics als kernonderwerp (legacy categorie, niet meer aanbieden)
- Generieke Power BI peer-tips zonder HR-relevantie
- Verkoopdata, voorraad of finance-zonder-HR-link als voorbeeld-dataset
- Klantnamen anders dan in `case-driven` archetype (regel uit `blog-archetypes.ts` blijft staan)
- "Wij" of "ons team" — Power BI Studio is solo (Jan Willem)

## Snelle zelf-check voor publicatie

- [ ] Openen de eerste 150 woorden met HR-probleem, HR-dataset of HR-rol?
- [ ] Wordt minstens één van AFAS/Visma/Nmbrs genoemd óf één HR-metric (verzuim, formatie, instroom)?
- [ ] Is het voorbeeld in code-snippets of tabellen een HR-dataset?
- [ ] Is de doelgroep een HR-directeur, HR-controller, DPO of BI-lead bij HR — geen ISV-bouwer?
- [ ] Zijn de externe links nog actueel (geen `/saas`, geen `/publieke-sector` als losse propositie)?
