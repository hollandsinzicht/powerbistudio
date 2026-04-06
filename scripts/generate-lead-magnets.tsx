/**
 * Generates de 3 lead magnet PDFs met echte content.
 *
 * Gebruik: npx tsx scripts/generate-lead-magnets.tsx
 *
 * Schrijft naar /public/downloads/:
 * - publieke-sector-checklist.pdf
 * - isv-architectuurgids.pdf
 * - dax-fouten-top10.pdf
 */

import React from 'react';
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import fs from 'fs/promises';
import path from 'path';

// ============ BRAND ============
const C = {
  dark: '#0F1C2E',
  primary: '#1E3A5F',
  accent: '#F2A623',
  zorg: '#0F6E56',
  saas: '#534AB7',
  data: '#D85A30',
  g100: '#F3F4F6',
  g200: '#E5E7EB',
  g500: '#6B7280',
  g700: '#374151',
  white: '#FFFFFF',
};

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 11, color: C.dark, paddingTop: 56, paddingBottom: 60, paddingHorizontal: 56, backgroundColor: C.white, lineHeight: 1.5 },
  hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: C.g200 },
  hdrLabel: { fontSize: 9, color: C.g500, letterSpacing: 1.5, textTransform: 'uppercase' },
  hdrBrand: { fontSize: 10, color: C.primary, fontFamily: 'Helvetica-Bold' },
  ftr: { position: 'absolute', bottom: 24, left: 56, right: 56, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: C.g500, borderTopWidth: 0.5, borderTopColor: C.g200, paddingTop: 8 },

  // Cover
  coverLabel: { fontSize: 11, letterSpacing: 2, marginBottom: 12, fontFamily: 'Helvetica-Bold' },
  coverTitle: { fontSize: 32, fontFamily: 'Helvetica-Bold', lineHeight: 1.2, marginBottom: 16 },
  coverSub: { fontSize: 14, color: C.g700, lineHeight: 1.5, marginBottom: 32 },
  coverAuthor: { fontSize: 10, color: C.g500, marginTop: 'auto' },

  // Sections
  h1: { fontSize: 22, fontFamily: 'Helvetica-Bold', marginTop: 24, marginBottom: 12, color: C.dark },
  h2: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginTop: 20, marginBottom: 8, color: C.dark },
  h3: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginTop: 12, marginBottom: 4, color: C.dark },
  p: { marginBottom: 8 },

  // Items
  itemRow: { flexDirection: 'row', marginBottom: 14, gap: 10 },
  itemNum: { width: 24, height: 24, borderRadius: 12, color: C.white, fontSize: 11, fontFamily: 'Helvetica-Bold', textAlign: 'center', paddingTop: 6 },
  itemBody: { flex: 1 },
  itemTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  itemDesc: { fontSize: 10, color: C.g700, lineHeight: 1.5 },
  itemHint: { fontSize: 9, color: C.g500, marginTop: 4, fontStyle: 'italic' },

  // Callouts
  callout: { backgroundColor: C.g100, borderLeftWidth: 3, padding: 12, marginVertical: 12 },
  calloutTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  calloutText: { fontSize: 10, color: C.g700, lineHeight: 1.5 },

  // Code
  code: { fontFamily: 'Courier', fontSize: 9, backgroundColor: '#1E293B', color: '#E2E8F0', padding: 10, borderRadius: 4, marginVertical: 8 },
});

// ============ SHARED ============
function Header({ label }: { label: string }) {
  return (
    <View style={s.hdr} fixed>
      <Text style={s.hdrLabel}>{label}</Text>
      <Text style={s.hdrBrand}>PowerBIStudio.nl</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={s.ftr} fixed>
      <Text>Jan Willem den Hollander — Power BI architect, LSS Black Belt</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function Item({ num, title, desc, hint, color }: { num: number; title: string; desc: string; hint?: string; color: string }) {
  return (
    <View style={s.itemRow} wrap={false}>
      <Text style={[s.itemNum, { backgroundColor: color }]}>{num}</Text>
      <View style={s.itemBody}>
        <Text style={s.itemTitle}>{title}</Text>
        <Text style={s.itemDesc}>{desc}</Text>
        {hint && <Text style={s.itemHint}>💡 {hint}</Text>}
      </View>
    </View>
  );
}

// ============ 1. PUBLIEKE SECTOR CHECKLIST ============

const checklistItems = [
  {
    title: 'AVG-compliance en data classificatie',
    desc: 'Vraag de leverancier hoe persoonsgegevens worden geclassificeerd, gelogd en welke verwerkersovereenkomst er ligt. Eis dat data classification expliciet wordt vastgelegd voor BSN, gezondheidsdata en sociale dossiers.',
    hint: 'Een goede leverancier komt zelf met een DPIA-template en een data classification matrix.',
  },
  {
    title: 'Row-Level Security per locatie of regio',
    desc: 'Hoe wordt voorkomen dat medewerkers van locatie A data van locatie B kunnen zien? Vraag concreet naar het RLS-model: dynamisch via USERPRINCIPALNAME(), via een security tabel, of via Azure AD groepen?',
    hint: 'Bij multi-locatie organisaties is dit het #1 risicopunt. Eis een diagram van de RLS-architectuur.',
  },
  {
    title: 'Multi-locatie of multi-regio datamodel',
    desc: 'Bouwt de leverancier per locatie een apart model (onderhoudbaar nachtmerrie) of één centraal model met RLS (de juiste aanpak)? Vraag naar referenties van vergelijkbare multi-locatie projecten.',
    hint: 'Bij GGDGHOR draaien 25 GGD-regio\'s op één gedeeld semantic model met RLS isolatie per regio.',
  },
  {
    title: 'Governance en data-eigenaarschap',
    desc: 'Wie is verantwoordelijk voor welke data? Hoe worden bron-systemen, dataset eigenaren en rapport stewards georganiseerd? Een leverancier zonder governance-aanpak levert na 6 maanden chaos.',
    hint: 'Vraag om een RACI-matrix voor data-eigenaarschap.',
  },
  {
    title: 'Deployment pipelines en change management',
    desc: 'Hoe worden wijzigingen getest en uitgerold? Gebruikt de leverancier Power BI Deployment Pipelines of een vergelijkbare CI/CD aanpak met Dev → Test → Acceptatie → Productie?',
    hint: 'Zonder pipelines kun je geen veilige updates uitrollen — een vereiste in de publieke sector.',
  },
  {
    title: 'Documentatie en audit trail',
    desc: 'Welke documentatie wordt opgeleverd? Een goede leverancier levert: architectuur diagram, datamodel documentatie (TMDL of vergelijkbaar), DAX measure beschrijvingen, en een wijzigingslogboek.',
    hint: 'Voor aanbestedingstrajecten is dit verplicht — zonder documentatie kun je het traject niet auditen.',
  },
  {
    title: 'Overdrachtsprotocol bij einde contract',
    desc: 'Wat gebeurt er als jullie de samenwerking beëindigen? Eis een overdrachtsdraaiboek waarin staat: hoe wordt de omgeving overgedragen, welke kennis-overdrachtsessies zijn ingepland, hoe lang is de leverancier nog beschikbaar voor support?',
    hint: 'Zonder overdrachtsplan word je gegijzeld door je leverancier.',
  },
  {
    title: 'Licentiemodel en jaarlijkse kosten',
    desc: 'Vraag een TCO-overzicht voor 3 jaar: Power BI Pro of Premium licenties, aantal gebruikers, capaciteit en eventuele Azure data-platform kosten. Vergeet niet te vragen naar Fabric migratie-impact.',
    hint: 'Microsoft\'s prijsmodel verandert — vraag wat er gebeurt bij Fabric migratie.',
  },
  {
    title: 'Monitoring en data-hygiëne',
    desc: 'Hoe wordt gemonitord of refreshes slagen, welke datasets niet meer gebruikt worden en of de data nog kwalitatief is? Een goede leverancier richt monitoring in vanaf dag één.',
    hint: 'Zonder monitoring ontdek je problemen pas als gebruikers klagen.',
  },
  {
    title: 'Training en kennisoverdracht',
    desc: 'Wordt jouw eigen team opgeleid om eenvoudige rapporten zelf aan te passen, of blijf je voor elke kleine wijziging afhankelijk? Eis een training-plan met concrete leerdoelen.',
    hint: 'Onafhankelijkheid van de leverancier verlaagt je TCO drastisch op lange termijn.',
  },
  {
    title: 'Escalatieprocedure en SLA',
    desc: 'Wat is de reactietijd bij datakwaliteitsproblemen of een storing? Vraag concrete SLA\'s: response binnen 4 uur kantooruren, oplossing binnen 24 uur voor kritieke issues.',
    hint: 'Een leverancier zonder SLA garanties is een leverancier zonder verantwoordelijkheid.',
  },
  {
    title: 'Referenties uit dezelfde sector',
    desc: 'Vraag minimaal 2 referenties van vergelijkbare publieke sector organisaties (gemeente, GGD, veiligheidsregio, zorginstelling). Bel ze op en vraag specifiek naar de overdracht en lange termijn samenwerking.',
    hint: 'Geen referenties uit jouw sector? Dan zijn ze misschien niet bekend met de specifieke eisen.',
  },
];

function ChecklistPdf() {
  return (
    <Document>
      {/* Cover */}
      <Page size="A4" style={s.page}>
        <Header label="BI-Checklist Publieke Sector" />
        <View style={{ marginTop: 60 }}>
          <Text style={[s.coverLabel, { color: C.zorg }]}>VOOR GEMEENTEN, GGD&apos;S EN VEILIGHEIDSREGIO&apos;S</Text>
          <Text style={s.coverTitle}>BI-Checklist voor de publieke sector</Text>
          <Text style={s.coverSub}>
            12 vragen die je moet stellen vóór een aanbesteding van een Business Intelligence leverancier.
            Gebaseerd op ervaring met het GGDGHOR project — 25 GGD-regio&apos;s + RIVM op één gedeeld Power BI model.
          </Text>
        </View>
        <View style={s.callout}>
          <Text style={s.calloutTitle}>Hoe gebruik je deze checklist</Text>
          <Text style={s.calloutText}>
            Stel deze 12 vragen tijdens de leverancier-selectie. Een goede leverancier kan ze allemaal beantwoorden
            zonder aarzelen en met concrete voorbeelden. Onduidelijke of vage antwoorden zijn een rode vlag.
          </Text>
        </View>
        <Text style={s.coverAuthor}>Door Jan Willem den Hollander — Power BI architect, Lean Six Sigma Black Belt</Text>
        <Footer />
      </Page>

      {/* Vragen */}
      <Page size="A4" style={s.page}>
        <Header label="BI-Checklist Publieke Sector" />
        <Text style={s.h1}>De 12 vragen</Text>
        {checklistItems.map((item, i) => (
          <Item key={i} num={i + 1} title={item.title} desc={item.desc} hint={item.hint} color={C.zorg} />
        ))}
        <View style={[s.callout, { borderLeftColor: C.zorg, marginTop: 24 }]}>
          <Text style={s.calloutTitle}>Klaar om te starten?</Text>
          <Text style={s.calloutText}>
            Wil je deze checklist bespreken in jouw concrete situatie, of een tweede mening over een leverancier?
            Plan een vrijblijvend gesprek via powerbistudio.nl/contact
          </Text>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}

// ============ 2. ISV ARCHITECTUURGIDS ============

const isvDecisions = [
  {
    title: 'SKU-keuze: A-SKU, EM-SKU of F-SKU?',
    desc: 'De grootste kostenfout: de verkeerde SKU kiezen. EM-SKU\'s zijn afgeschaft. A-SKU\'s zijn herzien. F-SKU is de toekomst maar de instap (F64) ligt rond €6.000-€8.000/maand.',
    detail: 'Voor mid-market ISV\'s met < 100 eindgebruikers per klant is A-SKU pay-as-you-go vaak nog goedkoper. Voor schaal vanaf 1.000+ gebruikers wordt F-SKU economisch. Reken het uit voor jouw specifieke gebruikspatroon.',
    hint: 'Het kostenverschil tussen verkeerd en goed gekozen SKU is vaak factor 5-10.',
  },
  {
    title: 'Workspace-patroon: per klant, pooled, of tier?',
    desc: 'Drie patronen, drie consequenties. Workspace-per-klant is veilig maar beheerintensief. Pooled met RLS is schaalbaar maar kwetsbaar voor data-lekkage. Tiered (groepen klanten samen) is een middenweg.',
    detail: 'Voor SaaS met 10-50 klanten: workspace-per-klant. Voor 50-500: tiered op basis van klantgrootte. Voor 500+: pooled met sterke RLS én cell-level isolatie via dedicated capacities.',
    hint: 'Deze keuze is bijna onmogelijk later te wijzigen. Beslis vóór de eerste klant live gaat.',
  },
  {
    title: 'RLS-strategie: dynamic, static, of multi-tenant isolation?',
    desc: 'Bij multi-tenant analytics is Row-Level Security geen feature, het is fundament. Eén fout in dynamic RLS = data van klant A zichtbaar voor klant B = einde van je SaaS reputatie.',
    detail: 'Combineer altijd: (1) USERPRINCIPALNAME() filter op security tabel, (2) hash-based klant-ID validatie in elke measure, (3) automated test suite die per klant verifieert dat alleen eigen data zichtbaar is. Test bij elke release.',
    hint: 'Bouw automated RLS tests in CI/CD vanaf dag één.',
  },
  {
    title: 'Copilot-implicaties: het werkt niet in embedded',
    desc: 'Microsoft\'s Copilot voor Power BI werkt niet in embedded scenarios voor externe gebruikers. Als je klanten AI-functionaliteit verwachten, moet je een eigen oplossing bouwen.',
    detail: 'Overweeg: (1) eigen LLM laag boven je semantic model via Anthropic of OpenAI API, (2) custom Q&A interface met natural language to DAX vertaling, (3) of accepteer dat AI features alleen voor interne gebruikers werken.',
    hint: 'Communiceer dit duidelijk in je product roadmap — Copilot is een Microsoft-only feature.',
  },
  {
    title: 'Kosteninschatting: Azure compute + capacity planning',
    desc: 'Vergeet de Azure kosten naast je Power BI capaciteit niet: data sources (SQL Database/Synapse), data movement (Data Factory), opslag (ADLS Gen2), monitoring, en backup. Voor een mid-market SaaS reken op €1.500-€3.500/maand bovenop de Power BI capaciteit.',
    detail: 'Maak een TCO calculator per klant die meeneemt: aantal users, data volume per maand, refresh frequentie, complexiteit van het model. Reken minimaal 30% buffer voor groei.',
    hint: 'Onderschat dit niet — Azure data kosten kunnen je marge volledig opeten.',
  },
];

function ISVPdf() {
  return (
    <Document>
      {/* Cover */}
      <Page size="A4" style={s.page}>
        <Header label="ISV Architectuurgids" />
        <View style={{ marginTop: 60 }}>
          <Text style={[s.coverLabel, { color: C.saas }]}>VOOR ISV CTO&apos;S EN PRODUCT DIRECTORS</Text>
          <Text style={s.coverTitle}>ISV Architectuurgids: 5 beslissingen vóór dag 1</Text>
          <Text style={s.coverSub}>
            De vijf architectuurkeuzes die het verschil maken tussen een schaalbaar embedded analytics product
            en een onbetaalbare puinhoop. Gebaseerd op 15 jaar Power BI architectuur.
          </Text>
        </View>
        <View style={s.callout}>
          <Text style={s.calloutTitle}>Waarom deze gids</Text>
          <Text style={s.calloutText}>
            78% van SaaS-bedrijven embedt analytics in hun product. Maar als de architectuur verkeerd is gebouwd,
            betaal je daar jaren voor in performance-problemen en Azure-rekeningen die niet kloppen.
            Deze 5 beslissingen voorkom je die fouten.
          </Text>
        </View>
        <Text style={s.coverAuthor}>Door Jan Willem den Hollander — Power BI architect, ervaring met SaaS embedded analytics</Text>
        <Footer />
      </Page>

      {/* Beslissingen */}
      <Page size="A4" style={s.page}>
        <Header label="ISV Architectuurgids" />
        <Text style={s.h1}>De 5 beslissingen</Text>
        {isvDecisions.map((item, i) => (
          <View key={i} wrap={false} style={{ marginBottom: 18 }}>
            <View style={s.itemRow}>
              <Text style={[s.itemNum, { backgroundColor: C.saas }]}>{i + 1}</Text>
              <View style={s.itemBody}>
                <Text style={s.itemTitle}>{item.title}</Text>
                <Text style={s.itemDesc}>{item.desc}</Text>
                <Text style={[s.itemDesc, { marginTop: 6 }]}>{item.detail}</Text>
                <Text style={s.itemHint}>💡 {item.hint}</Text>
              </View>
            </View>
          </View>
        ))}
      </Page>

      {/* Conclusie */}
      <Page size="A4" style={s.page}>
        <Header label="ISV Architectuurgids" />
        <Text style={s.h1}>Wat nu?</Text>
        <Text style={s.p}>
          Deze 5 beslissingen lijken technisch, maar ze bepalen of jouw embedded analytics product winstgevend wordt
          of een kostenpost blijft. De grootste fouten worden gemaakt vóór de eerste regel code wordt geschreven.
        </Text>

        <Text style={s.h2}>Twee routes voor PowerBIStudio.nl klanten</Text>
        <View style={s.callout}>
          <Text style={s.calloutTitle}>Route 1 — DashPortal</Text>
          <Text style={s.calloutText}>
            Direct een white-label embedded portal zonder dat je zelf de architectuur bouwt. Multi-tenant RLS
            ingebouwd, geen Microsoft-licentie voor eindgebruikers. Live in 10 minuten. Voor ISV&apos;s die snel willen
            valideren of met een lager risico willen starten.
          </Text>
        </View>
        <View style={[s.callout, { borderLeftColor: C.saas }]}>
          <Text style={s.calloutTitle}>Route 2 — Architectuurreview op maat</Text>
          <Text style={s.calloutText}>
            Voor complexere multi-tenant eisen of diepere integratie in je eigen platform. Vaste prijs van €2.500
            voor een complete architectuurreview met aanbevelingen, TCO berekening en implementatieplan.
          </Text>
        </View>

        <Text style={[s.itemHint, { marginTop: 16 }]}>
          Bespreek je situatie via powerbistudio.nl/contact?type=saas
        </Text>
        <Footer />
      </Page>
    </Document>
  );
}

// ============ 3. DAX FOUTEN TOP 10 ============

const daxErrors = [
  {
    title: 'CALCULATE met rij-context i.p.v. filter context',
    desc: 'CALCULATE converteert rij-context naar filter-context. Vergeten dat dit gebeurt is fout #1. Bij een measure die van een kolom verwacht dat het een waarde is, verschijnt er een aggregatie.',
    code: '// FOUT — Sales[Amount] is een kolom, geen waarde\nTotalSales = CALCULATE(SUM(Sales[Amount]), Sales[Amount] > 100)\n\n// GOED — gebruik FILTER met expliciete iteratie\nTotalSales = CALCULATE(SUM(Sales[Amount]), FILTER(Sales, Sales[Amount] > 100))',
  },
  {
    title: 'DISTINCTCOUNT op grote tabellen',
    desc: 'DISTINCTCOUNT() is duur op tabellen met meer dan ~1M rijen. Op fact tables met 50M+ rijen kan dit een rapport van 100ms naar 30 seconden brengen.',
    code: '// LANGZAAM op grote tabel\nUniqueCustomers = DISTINCTCOUNT(Sales[CustomerID])\n\n// SNELLER — gebruik COUNTROWS over een dimensie tabel\nUniqueCustomers = COUNTROWS(\n  CALCULATETABLE(VALUES(Customer[CustomerID]), Sales)\n)',
  },
  {
    title: 'Calculated columns voor measures gebruiken',
    desc: 'Calculated columns worden tijdens refresh berekend en opgeslagen — ze nemen geheugen in. Measures worden bij query-tijd berekend. Voor aggregaties altijd measures, voor rij-niveau labels columns.',
    code: '// FOUT — calculated column voor een aggregatie\nSales[YearTotal] = CALCULATE(SUM(Sales[Amount]), ALL(Date))\n\n// GOED — measure\nYearTotal := CALCULATE(SUM(Sales[Amount]), ALL(Date))',
  },
  {
    title: 'Onnodige IFERROR rond elke measure',
    desc: 'IFERROR() voegt overhead toe en verbergt echte fouten. Gebruik het alleen waar je verwacht dat een fout kan voorkomen — niet als blanket "veiligheid".',
    code: '// SLECHT — IFERROR overal\nSales := IFERROR(SUM(Sales[Amount]), 0)\n\n// BETER — geen IFERROR nodig, SUM van lege tabel = blank\nSales := SUM(Sales[Amount])\n\n// Of expliciet als je 0 wilt tonen\nSales := COALESCE(SUM(Sales[Amount]), 0)',
  },
  {
    title: 'SUM() in een measure i.p.v. SUMX() waar nodig',
    desc: 'SUM werkt op één kolom. Als je een berekening per rij wilt sommeren (bijv. quantity × price), heb je SUMX nodig. Dit is een veel voorkomende oorzaak van verkeerde totalen.',
    code: '// FOUT — kan geen vermenigvuldiging in SUM\nRevenue := SUM(Sales[Quantity] * Sales[Price])\n\n// GOED — SUMX voor row-level berekening\nRevenue := SUMX(Sales, Sales[Quantity] * Sales[Price])',
  },
  {
    title: 'Bidirectionele relaties zonder reden',
    desc: 'Bidirectionele filters lijken handig maar maken queries trager en kunnen ambigue resultaten geven. Gebruik ze alleen voor many-to-many scenarios, en zelfs dan alleen als USERELATIONSHIP() niet werkt.',
    code: '// Vermijd standaard bidirectionele relatie tussen Sales <-> Customer\n\n// Gebruik in plaats daarvan CROSSFILTER waar nodig:\nMeasure := CALCULATE(\n  COUNTROWS(Customer),\n  CROSSFILTER(Sales[CustomerID], Customer[CustomerID], BOTH)\n)',
  },
  {
    title: 'Geen variabelen voor herhaalde expressies',
    desc: 'Variabelen worden één keer berekend en hergebruikt. Zonder VAR herhaalt de engine de berekening voor elke verwijzing. Voor complexe measures kan dit 5-10x sneller zijn.',
    code: '// LANGZAAM — SUM(Sales[Amount]) wordt 3x berekend\nMargin := \n  (SUM(Sales[Amount]) - SUM(Sales[Cost])) / SUM(Sales[Amount])\n\n// SNELLER met VAR\nMargin := \nVAR Revenue = SUM(Sales[Amount])\nVAR Cost = SUM(Sales[Cost])\nRETURN DIVIDE(Revenue - Cost, Revenue)',
  },
  {
    title: 'ALL() versus ALLEXCEPT() verwarring',
    desc: 'ALL() verwijdert alle filters. ALLEXCEPT() houdt sommige filters. Dit verwisselen geeft foutieve % berekeningen op subtotaal niveau.',
    code: '// % van regio totaal — FOUT met ALL()\nPctOfRegion := DIVIDE(\n  SUM(Sales[Amount]),\n  CALCULATE(SUM(Sales[Amount]), ALL(Sales))\n)\n\n// GOED — behoud regio context\nPctOfRegion := DIVIDE(\n  SUM(Sales[Amount]),\n  CALCULATE(SUM(Sales[Amount]), ALLEXCEPT(Sales, Sales[Region]))\n)',
  },
  {
    title: 'CONTAINS() i.p.v. IN voor lijst-filters',
    desc: 'CONTAINS() is verouderde syntax. IN met een tabelliteral is leesbaarder en sneller.',
    code: '// VEROUDERD\nFilteredSales := CALCULATE(\n  SUM(Sales[Amount]),\n  CONTAINS(Sales, Sales[Region], "North", Sales[Region], "South")\n)\n\n// MODERN\nFilteredSales := CALCULATE(\n  SUM(Sales[Amount]),\n  Sales[Region] IN { "North", "South" }\n)',
  },
  {
    title: 'Geen data type checks bij DIVIDE',
    desc: 'DIVIDE() vangt deling door nul af, maar niet wat er gebeurt als je per ongeluk text deelt door een getal. Validation in je model voorkomt verrassingen.',
    code: '// Eenvoudig — werkt voor de meeste cases\nMargin := DIVIDE(SUM(Sales[Profit]), SUM(Sales[Revenue]))\n\n// Met fallback voor zeldzame edge cases\nMargin := DIVIDE(\n  SUM(Sales[Profit]),\n  SUM(Sales[Revenue]),\n  BLANK()  // expliciete fallback i.p.v. impliciete 0\n)',
  },
];

function DaxPdf() {
  return (
    <Document>
      {/* Cover */}
      <Page size="A4" style={s.page}>
        <Header label="DAX-fouten Top 10" />
        <View style={{ marginTop: 60 }}>
          <Text style={[s.coverLabel, { color: C.primary }]}>VOOR POWER BI CONSULTANTS EN ONTWIKKELAARS</Text>
          <Text style={s.coverTitle}>10 meest voorkomende DAX-fouten in productie-modellen</Text>
          <Text style={s.coverSub}>
            De fouten die ik in bijna elk Power BI model dat ik audit terugzie. Met uitleg waarom het fout is,
            wat het kost in performance en hoe je het oplost.
          </Text>
        </View>
        <View style={s.callout}>
          <Text style={s.calloutTitle}>Hoe gebruik je deze gids</Text>
          <Text style={s.calloutText}>
            Loop je eigen model door en check elke fout. Voor elke geïdentificeerde fout: implementeer de fix
            in een test-omgeving, meet de performance-impact, en rol uit naar productie via een deployment pipeline.
          </Text>
        </View>
        <Text style={s.coverAuthor}>Door Jan Willem den Hollander — Power BI architect met 15 jaar DAX ervaring</Text>
        <Footer />
      </Page>

      {/* Fouten */}
      {daxErrors.map((err, i) => (
        <Page key={i} size="A4" style={s.page}>
          <Header label="DAX-fouten Top 10" />
          <View style={s.itemRow}>
            <Text style={[s.itemNum, { backgroundColor: C.primary }]}>{i + 1}</Text>
            <View style={s.itemBody}>
              <Text style={[s.itemTitle, { fontSize: 16, marginBottom: 6 }]}>{err.title}</Text>
              <Text style={[s.itemDesc, { fontSize: 11 }]}>{err.desc}</Text>
            </View>
          </View>
          <Text style={s.code}>{err.code}</Text>
          <Footer />
        </Page>
      ))}

      {/* Conclusie */}
      <Page size="A4" style={s.page}>
        <Header label="DAX-fouten Top 10" />
        <Text style={s.h1}>Het Power BI Studio audit-proces</Text>
        <Text style={s.p}>
          Deze 10 fouten zijn de meest voorkomende, maar niet de enige. Een volledige audit van een productie-model
          identificeert ook problemen in datamodel-architectuur, performance optimalisatie, naamconventies,
          documentatie en onderhoudbaarheid.
        </Text>

        <Text style={s.h2}>De Power BI Report Auditor</Text>
        <Text style={s.p}>
          Upload je .pbix bestand en ontvang binnen 24 uur een volledige AI-audit met:
        </Text>
        <View style={{ marginLeft: 12 }}>
          <Text style={s.p}>• Scorecard op 5 kwaliteitscategorieën</Text>
          <Text style={s.p}>• Bevindingen gesorteerd op ernst (kritisch / belangrijk / aanbeveling)</Text>
          <Text style={s.p}>• Top 5 actielijst met inschatting van effort</Text>
          <Text style={s.p}>• Privacy-first: cryptografisch bewijs van dataverwijdering</Text>
        </View>

        <View style={[s.callout, { borderLeftColor: C.accent }]}>
          <Text style={s.calloutTitle}>€49 in plaats van €750+</Text>
          <Text style={s.calloutText}>
            Een consultant vraagt €750+ voor een handmatige modelreview. De Report Auditor doet hetzelfde
            in 24 uur voor €49 — en laat je cryptografisch bewijs achter dat je data veilig is.
          </Text>
        </View>

        <Text style={[s.itemHint, { marginTop: 16 }]}>
          Probeer op powerbistudio.nl/tools/report-auditor
        </Text>
        <Footer />
      </Page>
    </Document>
  );
}

// ============ MAIN ============
async function generatePdf(component: React.ReactElement, fileName: string) {
  console.log(`Genereer ${fileName}...`);
  const buffer = await renderToBuffer(component);
  const outPath = path.join(process.cwd(), 'public', 'downloads', fileName);
  await fs.writeFile(outPath, buffer);
  console.log(`  -> Geschreven naar ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
  await fs.mkdir(downloadsDir, { recursive: true });

  await generatePdf(<ChecklistPdf />, 'publieke-sector-checklist.pdf');
  await generatePdf(<ISVPdf />, 'isv-architectuurgids.pdf');
  await generatePdf(<DaxPdf />, 'dax-fouten-top10.pdf');

  console.log('\nKlaar! Alle 3 PDF\'s gegenereerd in /public/downloads/');
}

main().catch(console.error);
