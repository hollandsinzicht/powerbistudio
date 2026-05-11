/**
 * Genereert public/downloads/avg-checklist-hr.pdf op basis van de
 * 12 controlepunten die ook op de /avg-checklist-hr pagina staan.
 *
 * Gebruik: npx tsx scripts/generate-avg-checklist-hr.tsx
 *
 * Stijl: HR-rebrand palet (teal #0F766E + mid #14B8A6), sober,
 * print-vriendelijk A4. Cover + 3 inhoud-pagina's + vervolgpagina.
 */

import React from 'react';
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import fs from 'fs/promises';
import path from 'path';

// ============ BRAND (HR-rebrand) ============
const C = {
  primary: '#0F766E',   // teal-700 — hoofdkleur
  accent: '#14B8A6',    // teal-500 — accentstaaf
  light: '#CCFBF1',     // teal-100 — subtiele achtergrond
  dark: '#0F1C2E',
  body: '#1F2937',      // gray-900 — body tekst
  muted: '#6B7280',     // gray-500
  border: '#E5E7EB',    // gray-200
  bg: '#F9FAFB',        // gray-50
  white: '#FFFFFF',
};

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: C.body,
    paddingTop: 56,
    paddingBottom: 60,
    paddingHorizontal: 56,
    backgroundColor: C.white,
    lineHeight: 1.5,
  },
  hdr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  hdrLabel: { fontSize: 9, color: C.muted, letterSpacing: 1.5 },
  hdrBrand: { fontSize: 10, color: C.primary, fontFamily: 'Helvetica-Bold' },
  ftr: {
    position: 'absolute',
    bottom: 24,
    left: 56,
    right: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: C.muted,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 8,
  },

  // Cover
  coverLabel: {
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 12,
    fontFamily: 'Helvetica-Bold',
    color: C.primary,
  },
  coverTitle: {
    fontSize: 30,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.2,
    marginBottom: 16,
    color: C.dark,
  },
  coverSub: {
    fontSize: 13,
    color: C.body,
    lineHeight: 1.5,
    marginBottom: 28,
  },
  coverMeta: {
    fontSize: 10,
    color: C.muted,
    marginTop: 'auto',
    lineHeight: 1.6,
  },

  // Section heading
  h1: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginTop: 8,
    marginBottom: 16,
    color: C.dark,
  },
  h2: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    marginTop: 18,
    marginBottom: 8,
    color: C.dark,
  },
  p: { marginBottom: 8 },

  // Punt-item
  itemRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  itemNum: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: C.light,
    color: C.primary,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    paddingTop: 7,
  },
  itemBody: { flex: 1 },
  itemTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: C.dark,
  },
  itemQuestion: {
    fontSize: 10.5,
    color: C.primary,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 10,
    color: C.body,
    lineHeight: 1.5,
  },

  // Callout
  callout: {
    backgroundColor: C.bg,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    padding: 14,
    marginVertical: 14,
  },
  calloutTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: C.dark,
  },
  calloutText: {
    fontSize: 10,
    color: C.body,
    lineHeight: 1.5,
  },

  // Routes-blok
  routesGrid: { marginTop: 8 },
  route: {
    backgroundColor: C.bg,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    padding: 14,
    marginBottom: 10,
  },
  routeTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
    marginBottom: 4,
  },
  routePrice: {
    fontSize: 10,
    color: C.primary,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  routeDesc: { fontSize: 10, color: C.body, lineHeight: 1.5 },
});

// ============ DATA — 12 punten ============
// Spiegelt src/app/avg-checklist-hr/page.tsx; bij wijziging beide bijwerken.

interface Punt {
  nummer: number;
  titel: string;
  vraag: string;
  uitleg: string;
}

const PUNTEN: Punt[] = [
  {
    nummer: 1,
    titel: 'Hiërarchische RLS op organisatie-eenheid',
    vraag: 'Zien managers alleen hun eigen team — automatisch, zonder maandelijks bijhouden?',
    uitleg:
      'RLS op e-mailadres of handmatige user-mapping breekt zodra iemand van team wisselt. Verbind RLS aan de actuele organisatie-hiërarchie uit AFAS/Visma/Nmbrs, met type-2 historiek voor retroactieve correctheid.',
  },
  {
    nummer: 2,
    titel: 'Type-2 historiek op medewerker-dimensie',
    vraag: 'Klopt jullie verloop-cijfer van twee jaar terug nog steeds als er reorganisaties zijn geweest?',
    uitleg:
      'Zonder SCD2 verandert je historisch verzuim- en formatiecijfer elke keer dat een medewerker van team wisselt of een afdeling wordt opgeknipt. Type-2 historiek (peildatum-logica) houdt de waarheid van toen vast.',
  },
  {
    nummer: 3,
    titel: 'Dataminimalisatie — alleen velden die rapporten nodig hebben',
    vraag: 'Zit BSN, geboortedatum of paspoortnummer in het Power BI-model terwijl geen enkel rapport dat gebruikt?',
    uitleg:
      'AVG eist dat je niet méér verwerkt dan nodig. Een audit van de medewerker-tabel: welke velden zijn écht in gebruik? De rest hoort niet in de semantische laag, alleen in de bron.',
  },
  {
    nummer: 4,
    titel: 'Doelbinding per dataset',
    vraag: 'Is per Power BI-dataset vastgelegd wat het doel van de verwerking is?',
    uitleg:
      'Een dataset voor verzuim-analyse heeft een ander doel dan een dataset voor formatie-rapportage. Het verwerkingsregister moet per dataset het doel, de grondslag en de ontvangers benoemen — niet één algemene "HR-rapportage" entry.',
  },
  {
    nummer: 5,
    titel: 'Bewaartermijnen automatisch toegepast',
    vraag: 'Verdwijnen uitgestroomde medewerkers automatisch uit het model na de wettelijke bewaartermijn?',
    uitleg:
      'Salarisadministratie 7 jaar, sollicitatiegegevens 4 weken, exit-data 2 jaar — verschillende termijnen per veld. Power BI moet die termijnen kennen en filteren, niet de HR-medewerker die handmatig moet opschonen.',
  },
  {
    nummer: 6,
    titel: 'Verwerkingsregister gekoppeld aan het model',
    vraag: 'Weet de DPO welke velden, welke RLS-rollen en welke ontvangers er aan welke Power BI-dataset hangen?',
    uitleg:
      'Een verwerkingsregister in een Word-document is na drie wijzigingen verouderd. Maak een AVG-cockpit die uit Power BI metadata leest: welke velden bestaan, welke RLS, wie heeft toegang. Live, niet een snapshot.',
  },
  {
    nummer: 7,
    titel: 'Toegangsbeheer in Power BI Service',
    vraag: 'Krijgt elke nieuwe HR-medewerker automatisch de juiste workspace-toegang, en wordt die ingetrokken bij uitstroom?',
    uitleg:
      'AVG-toegangsbeheer is meer dan RLS in het model. Workspace-rollen (Viewer, Member, Contributor, Admin) bepalen wie wat kan zien én wijzigen. Koppel dat aan een Azure AD-groep die meegaat met in- en uitstroom, niet aan individuele accounts.',
  },
  {
    nummer: 8,
    titel: 'Export-beperking voor gevoelige rapporten',
    vraag: 'Kan iedereen die het verzuim-dashboard ziet, dat zonder restricties naar Excel exporteren?',
    uitleg:
      'Een Excel-export verlaat de governance-grenzen van Power BI. Voor gevoelige HR-rapporten: zet export uit (sensitivity labels of workspace-policy), of beperk tot geaggregeerde data. Audit-trail van wie wat heeft geëxporteerd hoort thuis in tenant-instellingen.',
  },
  {
    nummer: 9,
    titel: 'Auditeerbare data-lineage',
    vraag: 'Kun je voor één veld in een HR-rapport terugherleiden uit welk AFAS/Visma/Nmbrs-veld het komt?',
    uitleg:
      'Bij een AVG-vraag ("welke gegevens van mij zitten waar?") moet je antwoord kunnen geven. Data-lineage via Power BI (lineage view) of expliciet gedocumenteerd in de zilver- en goud-laag — niet alleen in iemands hoofd.',
  },
  {
    nummer: 10,
    titel: 'Refresh-monitoring met stale-data-melding',
    vraag: 'Krijgen rapport-gebruikers een waarschuwing als het verzuim-cijfer 5 dagen oud is?',
    uitleg:
      'Beslissen op verouderde data is een AVG-risico (onjuiste verwerking) én een operationeel risico. Refresh-monitoring met automatische alerts naar de eigenaar als datasets niet ververst zijn. DashPortal HR biedt dit standaard.',
  },
  {
    nummer: 11,
    titel: 'Test-omgeving zonder productiedata',
    vraag: 'Bouwen ontwikkelaars en testers met echte medewerker-data of met geanonimiseerde testdata?',
    uitleg:
      'Productiedata in een dev-workspace is een datalek-in-wachtende-staat. Bouw een geanonimiseerde testset (zelfde structuur, fictieve namen en cijfers) voor alle non-productie omgevingen. DEV en TEST krijgen die testset, PROD de echte bron.',
  },
  {
    nummer: 12,
    titel: 'Incident-protocol voor datalekken',
    vraag: 'Weet je binnen 72 uur welke medewerkers wél en welke niet getroffen zijn bij een rapportagelek?',
    uitleg:
      'AVG eist meldplicht binnen 72 uur bij datalek. Dat kan alleen als je een audit-trail hebt van toegangen en exports, gekoppeld aan een protocol dat DPO, IT en HR samen activeert. Documenteer dit voordat het nodig is — niet erna.',
  },
];

// ============ COMPONENTS ============
function Header() {
  return (
    <View style={s.hdr} fixed>
      <Text style={s.hdrLabel}>AVG-CHECKLIST HR</Text>
      <Text style={s.hdrBrand}>PowerBIStudio.nl</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={s.ftr} fixed>
      <Text>Jan Willem den Hollander — HR analytics-specialist</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function PuntBlok({ punt }: { punt: Punt }) {
  return (
    <View style={s.itemRow} wrap={false}>
      <Text style={s.itemNum}>{punt.nummer}</Text>
      <View style={s.itemBody}>
        <Text style={s.itemTitle}>{punt.titel}</Text>
        <Text style={s.itemQuestion}>{punt.vraag}</Text>
        <Text style={s.itemDesc}>{punt.uitleg}</Text>
      </View>
    </View>
  );
}

// ============ DOCUMENT ============
function ChecklistHRPdf() {
  // Verdeel 12 punten over 3 pagina's: 4-4-4
  const blok1 = PUNTEN.slice(0, 4);
  const blok2 = PUNTEN.slice(4, 8);
  const blok3 = PUNTEN.slice(8, 12);

  return (
    <Document
      title="AVG-checklist HR Power BI — 12 controlepunten"
      author="Jan Willem den Hollander"
      subject="AVG-conformiteit voor HR-rapportage in Power BI"
      keywords="AVG, HR, Power BI, RLS, AFAS, Visma, Nmbrs"
    >
      {/* Cover */}
      <Page size="A4" style={s.page}>
        <Header />
        <View style={{ marginTop: 60 }}>
          <Text style={s.coverLabel}>VOOR HR-DIRECTEUR, HR-CONTROLLER EN DPO</Text>
          <Text style={s.coverTitle}>
            Twaalf controlepunten voor je HR Power BI-model
          </Text>
          <Text style={s.coverSub}>
            Wat in negen van de tien HR Power BI-audits naar boven komt — bewerkt
            tot een checklist die je nu kunt aflopen. Geen AVG-theorie, wel
            concrete punten die je in je eigen model kunt controleren.
          </Text>
        </View>

        <View style={s.callout}>
          <Text style={s.calloutTitle}>Hoe je deze checklist gebruikt</Text>
          <Text style={s.calloutText}>
            Loop de twaalf punten af op je eigen HR Power BI-model. Per punt: de
            vraag die je stelt, en de typische fout als het antwoord &quot;nee&quot;
            is. Deel deze met je DPO, IT-lead of externe auditor — één pagina
            cover, drie pagina&apos;s checklist, één pagina vervolgstappen.
          </Text>
        </View>

        <Text style={s.coverMeta}>
          Jan Willem den Hollander{'\n'}
          HR analytics-specialist · Lean Six Sigma Black Belt{'\n'}
          PowerBIStudio.nl · info@powerbistudio.nl
        </Text>
        <Footer />
      </Page>

      {/* Pagina 2: punten 1-4 */}
      <Page size="A4" style={s.page}>
        <Header />
        <Text style={s.h1}>Punten 1 – 4: hiërarchie en historiek</Text>
        {blok1.map((p) => (
          <PuntBlok key={p.nummer} punt={p} />
        ))}
        <Footer />
      </Page>

      {/* Pagina 3: punten 5-8 */}
      <Page size="A4" style={s.page}>
        <Header />
        <Text style={s.h1}>Punten 5 – 8: bewaartermijnen en toegang</Text>
        {blok2.map((p) => (
          <PuntBlok key={p.nummer} punt={p} />
        ))}
        <Footer />
      </Page>

      {/* Pagina 4: punten 9-12 */}
      <Page size="A4" style={s.page}>
        <Header />
        <Text style={s.h1}>Punten 9 – 12: lineage, monitoring en incidenten</Text>
        {blok3.map((p) => (
          <PuntBlok key={p.nummer} punt={p} />
        ))}
        <Footer />
      </Page>

      {/* Pagina 5: vervolgstappen */}
      <Page size="A4" style={s.page}>
        <Header />
        <Text style={s.h1}>Wat je hierna kunt doen</Text>
        <Text style={s.p}>
          De checklist is een zelfdiagnose. Drie routes als je dit in je eigen
          organisatie wilt aanpakken — afhankelijk van waar je staat.
        </Text>

        <View style={s.routesGrid}>
          <View style={s.route}>
            <Text style={s.routeTitle}>HR Analytics Quick Scan</Text>
            <Text style={s.routePrice}>€1.950 vast · 1,5 dag</Text>
            <Text style={s.routeDesc}>
              Anderhalve dag waarin ik je HR-model audit op deze twaalf punten,
              met een concrete actielijst per punt. Inclusief eindrapport voor
              je DPO en managementteam.
            </Text>
          </View>

          <View style={s.route}>
            <Text style={s.routeTitle}>HR Analytics Foundation</Text>
            <Text style={s.routePrice}>€34.500 vast · 6-8 weken</Text>
            <Text style={s.routeDesc}>
              Volledige implementatie volgens bron-zilver-goud-semantisch, met
              AVG-by-design vanaf dag één: RLS op hiërarchie, type-2 historiek,
              drie standaard-dashboards (verzuim, instroom/uitstroom, formatie),
              AVG-cockpit voor de DPO.
            </Text>
          </View>

          <View style={s.route}>
            <Text style={s.routeTitle}>DashPortal HR</Text>
            <Text style={s.routePrice}>Vanaf €1.250 / maand</Text>
            <Text style={s.routeDesc}>
              Doorlopende managed hosting voor je HR-dashboards. Refresh-
              monitoring, AVG-bewaking en maandelijks gezondheids-rapport.
              Geschikt voor organisaties die niet zelf het beheer willen doen.
            </Text>
          </View>
        </View>

        <View style={s.callout}>
          <Text style={s.calloutTitle}>Geen pakket dat past?</Text>
          <Text style={s.calloutText}>
            Plan een vrijblijvend verkennend gesprek van 30 minuten —
            powerbistudio.nl/contact?type=verkennend. Geen pitch, wel een
            eerlijk antwoord op wat voor jouw situatie de logische eerste
            stap is.
          </Text>
        </View>

        <Footer />
      </Page>
    </Document>
  );
}

// ============ MAIN ============
async function main() {
  const outDir = path.join(process.cwd(), 'public', 'downloads');
  await fs.mkdir(outDir, { recursive: true });

  const outPath = path.join(outDir, 'avg-checklist-hr.pdf');
  console.log(`Generating: ${outPath}`);

  const buffer = await renderToBuffer(<ChecklistHRPdf />);
  await fs.writeFile(outPath, buffer);

  const stats = await fs.stat(outPath);
  console.log(`Done — ${(stats.size / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
