import { getArticles, CATEGORIES, BASE_URL } from '@/lib/soro'

export const revalidate = 3600 // 1 uur cache

export async function GET() {
  const articles = await getArticles()

  // Sorteer published artikelen op datum (nieuwste eerst)
  const sortedArticles = articles.sort((a, b) =>
    new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime()
  )

  const content = `# Power BI Studio — PowerBIStudio.nl

> PowerBIStudio.nl is de website van Jan Willem den Hollander — Power BI architect, Lean Six Sigma Black Belt, met 15 jaar ervaring. Specialist in Power BI, DAX, Microsoft Fabric, embedded analytics, procesverbetering en publieke sector BI. Bekend van projecten bij GGDGHOR (25 GGD-regio's + RIVM), Lyreco, Vattenfall, Technische Unie en Renewi.

## Over

- Naam: Jan Willem den Hollander
- Rol: Power BI architect, interim data team lead, product owner
- Achtergrond: Lean Six Sigma Black Belt, ex-Defensie
- Ervaring: 15 jaar Power BI en data-analyse
- Eigen producten: DashPortal, Report Auditor, DAX Formula Assistant
- Werkgebied: Nederland — zorg, overheid, finance, energie, groothandel, SaaS

## Diensten

- [Power BI voor SaaS & ISV](${BASE_URL}/saas): Embedded analytics architectuur, multi-tenant RLS, white-label portalen voor softwarebedrijven en ISV's.
- [Power BI voor publieke sector](${BASE_URL}/publieke-sector): BI voor gemeenten, GGD's, veiligheidsregio's en zorginstellingen. AVG-compliant, multi-locatie, governance.
- [Fabric migratie](${BASE_URL}/fabric-migratie): Migratie van Power BI Premium naar Microsoft Fabric. Fabric QuickScan €1.500 vast.
- [Copilot readiness](${BASE_URL}/copilot-readiness): Audit van semantic model voor Copilot in Power BI. Descriptions, verified answers, grounding.
- [Procesverbetering met BI](${BASE_URL}/procesverbetering): DMAIC + Power BI. Lean Six Sigma aanpak voor CFO's en COO's.

## Producten & Tools

- [DashPortal](${BASE_URL}/dashportal): Branded white-label Power BI portaal. Voor interne teams en ISV's. Geen Microsoft-licentie voor eindgebruikers.
- [Report Auditor](${BASE_URL}/tools/report-auditor): AI-audit van Power BI datamodel. Upload .pbix, ontvang actielijst binnen 24 uur. €49.
- [DAX Formula Assistant](${BASE_URL}/tools/dax-assistant): DAX-formules schrijven in gewone taal. Gratis.
- [Power BI Readiness Scan](${BASE_URL}/tools/readiness-scan): 10-vragen scan voor BI-volwassenheid. Gratis.
- [BI-Kosten Calculator](${BASE_URL}/tools/bi-kosten-calculator): Bereken wat slechte data je organisatie kost per maand. Gratis.

## Lead magnets / Resources

- [Resources overzicht](${BASE_URL}/resources): Alle gratis downloads en tools.
- [Publieke Sector BI-Checklist](${BASE_URL}/resources/publieke-sector-checklist): 12 vragen die een gemeente of GGD moet stellen vóór BI-aanbesteding.
- [ISV Architectuurgids](${BASE_URL}/resources/isv-architectuurgids): 5 architectuurbeslissingen vóór dag 1 van embedded Power BI.
- [DAX-fouten PDF](${BASE_URL}/tools/dax-assistant#dax-fouten): 10 meest voorkomende DAX-fouten in productie-modellen.

## Cases

- [GGDGHOR](${BASE_URL}/cases/ggdghor): Nationaal Power BI dataportaal voor 25 GGD-regio's en het RIVM. Multi-tenant RLS, één gedeeld datamodel.
- [Lyreco](${BASE_URL}/cases/lyreco): Real-time finance dashboards voor Benelux management. Interim data team lead met DMAIC-aanpak.
- [Technische Unie](${BASE_URL}/cases/technische-unie): Afdelingsoverstijgend Power BI met sales, finance en voorraad in één model.
- [Vattenfall](${BASE_URL}/cases/vattenfall): Power BI implementatie in een internationale energieorganisatie, gekoppeld aan Azure-infrastructuur.

## Blog categorieën

${CATEGORIES.map((cat) => `- [${cat.name}](${BASE_URL}/blog/categorie/${cat.slug}): ${cat.description}`).join('\n')}

## Algemene pagina's

- [Homepage](${BASE_URL}/): Power BI architect & AI specialist.
- [Over Jan Willem](${BASE_URL}/over): Achtergrond, expertise, drie rollen (developer, interim lead, product owner).
- [Cases overzicht](${BASE_URL}/cases): Alle bewezen Power BI implementaties per sector.
- [Blog](${BASE_URL}/blog): Artikelen en uitgebreide gidsen over Power BI, Fabric, DAX, governance.
- [Tools](${BASE_URL}/tools): Alle gratis en betaalde tools.
- [Contact](${BASE_URL}/contact): Plan een gesprek of vraag een offerte.

## Blog artikelen (${sortedArticles.length} gepubliceerd)

${sortedArticles
  .map((a) => {
    const cats = a.categories.map((c) => c.name).join(', ') || 'Algemeen'
    return `- [${a.title}](${BASE_URL}/blog/${a.slug}) — ${a.date} — Categorieën: ${cats}\n  ${a.excerpt}`
  })
  .join('\n')}

## Expertise & onderwerpen

Power BI ontwikkeling, Power BI dashboards, DAX formules, datamodellering, star schema, RLS (Row-Level Security), SQL, Python, Microsoft Fabric, Fabric migratie, F-SKU, OneLake, Azure Synapse, Azure Data Factory, ETL/ELT, Power BI Embedded, multi-tenant analytics, white-label portalen, ISV embedded analytics, semantic model, Copilot voor Power BI, semantic layer optimization, business intelligence strategie, BI-volwassenheid, governance, AVG-compliance voor BI, publieke sector BI, gemeenten BI, GGD BI, veiligheidsregio BI, Lean Six Sigma DMAIC, procesverbetering met data, KPI dashboards, finance dashboards, operationele BI, Power BI Premium naar Fabric, capacity planning, deployment pipelines, TMDL, versiecontrole.

## Contact

- Email: info@powerbistudio.nl
- Website: ${BASE_URL}
- KVK: 62432168
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
