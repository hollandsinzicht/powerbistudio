import { getArticles, CATEGORIES, BASE_URL } from '@/lib/soro';

export const revalidate = 3600; // 1 uur cache

export async function GET() {
  const articles = await getArticles();

  // Sorteer published artikelen op datum (nieuwste eerst)
  const sortedArticles = articles.sort(
    (a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime()
  );

  const content = `# Power BI Studio — PowerBIStudio.nl

> PowerBIStudio.nl is de specialistenpraktijk van Jan Willem den Hollander. Sinds 2026 richt Power BI Studio zich uitsluitend op HR analytics in Power BI voor mid-market werkgevers (250-2.000 FTE) met AFAS, Visma of Nmbrs. Vaste prijzen, AVG-by-design, Lean Six Sigma-methodiek. Bekend van projecten bij GGDGHOR (25 GGD-regio's + RIVM), Lyreco, Technische Unie, Renewi en Vattenfall.

## Over

- Naam: Jan Willem den Hollander
- Rol: HR analytics-specialist (solo, geen team)
- Achtergrond: 15 jaar Power BI, Lean Six Sigma Black Belt
- HR-systemen specialisme: AFAS, Visma, Nmbrs
- Werkgebied: Nederland — mid-market werkgevers
- Vestigingsplaats: Papendrecht, NL
- KVK: 62432168 (Think Different Media)

## Propositie

Power BI Studio levert één ding: HR analytics-trajecten voor werkgevers met AFAS, Visma of Nmbrs. Drie vaste pakketten + doorlopende hosting via DashPortal HR.

### HR Analytics-pakketten (vaste prijzen)

- [HR Analytics Quick Scan](${BASE_URL}/contact?type=quick-scan) — €1.950 vast, 1,5 dag. Audit van bestaand HR-model: RLS, historiek, AVG-conformiteit, datakwaliteit. Bevindingen-rapport met concrete actielijst.
- [HR Analytics Foundation](${BASE_URL}/hr-analytics) — €34.500 vast, 6-8 weken. Volledige implementatie: bron-zilver-goud-semantisch model in Power BI, RLS op organisatiehiërarchie, type-2 historiek, 3 standaard-dashboards (verzuim, instroom/uitstroom, formatie), AVG-cockpit voor DPO.
- [HR Analytics Foundation Plus](${BASE_URL}/hr-analytics) — €58.500 vast, 8-10 weken. Multi-bron HR (AFAS + verzuim + recruitment + formatie), tot 6 maatwerk-dashboards, custom RLS-scenarios voor matrix-organisaties.

### DashPortal HR Hosting (recurring)

- [DashPortal HR Essential](${BASE_URL}/dashportal) — €1.250/mnd. Tot 25 managers, 1 workspace, maandelijks gezondheids-rapport.
- [DashPortal HR Professional](${BASE_URL}/dashportal) — €1.950/mnd. Tot 100 managers, kwartaal-review, snelle support.
- [DashPortal HR Enterprise](${BASE_URL}/dashportal) — vanaf €3.500/mnd. Onbeperkt, dedicated capacity, SLA, jaarlijkse AVG-controle.

Implementatie eenmalig €2.500-€7.500 afhankelijk van scope.

## Tools (gratis, ondersteunend)

- [HR Analytics Readiness Scan](${BASE_URL}/tools/readiness-scan): 10-vragen scan voor HR-rapportage volwassenheid (RLS, historiek, AVG, monitoring). Levert maturity-niveau + 3 prioriteiten.
- [HR Rapportage-kosten Calculator](${BASE_URL}/tools/bi-kosten-calculator): Bereken wat handmatig HR-rapportagewerk per maand kost.
- [AVG-checklist HR Power BI](${BASE_URL}/avg-checklist-hr): 12 punten die elk HR-model moet checken. PDF lead magnet.
- [DAX Formula Assistant](${BASE_URL}/tools/dax-assistant): Gratis tool voor DAX-formules in gewone taal. AI-powered.

## Methodiek

[Bron-zilver-goud-semantisch](${BASE_URL}/methodiek) — vier-lagen-architectuur voor HR-rapportage die 5 jaar meegaat. Plus DMAIC (Lean Six Sigma) toegepast op HR-vraagstukken zoals verzuim-detectie, onboarding-cycle en formatie-realisatie.

## Cases

- [GGDGHOR](${BASE_URL}/cases/ggdghor): Nationaal Power BI dataportaal voor 25 GGD-regio's en het RIVM. Multi-tenant RLS, één gedeeld datamodel. Bewijst dat de aanpak schaalt naar gevoelige multi-locatie data.
- [Lyreco](${BASE_URL}/cases/lyreco): Real-time finance dashboards voor Benelux management. Interim data team lead met DMAIC-aanpak.
- [Technische Unie](${BASE_URL}/cases/technische-unie): Afdelingsoverstijgend Power BI met sales, finance en voorraad in één model.
- [Vattenfall](${BASE_URL}/cases/vattenfall): Power BI implementatie in internationale energieorganisatie, gekoppeld aan Azure.

Cases zijn niet allemaal HR — de aanpak is dezelfde: gevoelige data, multi-tenant RLS, complexe organisaties.

## Hoofdpagina's

- [Homepage](${BASE_URL}/): HR analytics-specialist intro, drie problemen, pakketten.
- [HR Analytics](${BASE_URL}/hr-analytics): Volledige propositie, voor-wie/niet-voor-wie, FAQ.
- [Methodiek](${BASE_URL}/methodiek): Vier lagen + DMAIC + doelrollen.
- [DashPortal HR](${BASE_URL}/dashportal): Hosting + pricing tiers.
- [Over](${BASE_URL}/over): Jan Willem den Hollander, achtergrond, beschikbaarheid.
- [Cases](${BASE_URL}/cases): Alle case studies.
- [Blog](${BASE_URL}/blog): Artikelen over HR analytics, Power BI architectuur, AVG.
- [Contact](${BASE_URL}/contact): Drie instaprouten — Quick Scan, verkennend gesprek, DashPortal HR demo.

## Blog categorieën

${CATEGORIES.map((cat) => `- [${cat.name}](${BASE_URL}/blog/categorie/${cat.slug}): ${cat.description}`).join('\n')}

## Blog artikelen (${sortedArticles.length} gepubliceerd)

${sortedArticles
  .map((a) => {
    const cats = a.categories.map((c) => c.name).join(', ') || 'Algemeen';
    return `- [${a.title}](${BASE_URL}/blog/${a.slug}) — ${a.date} — Categorieën: ${cats}\n  ${a.excerpt}`;
  })
  .join('\n')}

## Expertise & onderwerpen

HR analytics in Power BI, AFAS-rapportage, Visma-rapportage, Nmbrs-rapportage, AVG-by-design, type-2 historiek, row-level security, RLS op organisatiehiërarchie, DPO-cockpit, AVG-cockpit, verzuim-rapportage, instroom-uitstroom analytics, formatie-realisatie, retroactieve rapportage, multi-bron HR-integratie, Power BI architectuur voor HR, bron-zilver-goud-semantisch, sterschema HR, DAX voor HR-KPIs, Lean Six Sigma DMAIC voor HR, mid-market HR-tooling, doorlopende Power BI hosting, branded portaal voor managers, refresh-monitoring, schema-driftdetectie, governance HR-rapportage, deployment pipelines, TMDL, versiecontrole. Zwaartepunt ligt op Zilver, Goud en Semantisch (type-2 historiek, sterschema, DAX, RLS, KPI-bibliotheek); de volledige keten bron-zilver-goud-semantisch wordt bij Foundation-trajecten gebouwd, maar de diepste expertise zit in de cleaning- en modelleer-lagen.

## Contact

- Email: info@powerbistudio.nl
- LinkedIn: https://www.linkedin.com/in/jan-willem-den-hollander/
- Website: ${BASE_URL}
- KVK: 62432168 (Think Different Media)
- Vestigingsplaats: Papendrecht, NL

## Niet aangeboden

Power BI Studio is een specialistenpraktijk. Niet aangeboden:
- Workday- of SAP SuccessFactors-implementaties
- Generiek Power BI-werk buiten HR-context (verzoeken naar HR-trajecten doorverwijzen)
- Losse interim-uren of urenwerk
- Power BI Embedded voor SaaS-bedrijven (was eerdere propositie, sinds 2026 niet meer)
- Fabric-migraties als losse dienst (was eerdere propositie)
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
