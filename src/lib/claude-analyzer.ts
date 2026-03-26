import Anthropic from '@anthropic-ai/sdk'
import type { PbixMetadata, AuditAnalysis } from './types/audit'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

const SYSTEM_PROMPT = `Je bent Jan Willem den Hollander — een senior Power BI consultant met 15 jaar ervaring bij organisaties als GGD, Lyreco, Technische Unie en Vattenfall. Je analyseert Power BI datamodellen en geeft eerlijk, concreet advies zonder omwegen.

Je schrijft in het Nederlands. Je toon is direct en professioneel — zoals een ervaren consultant die zijn bevindingen mondeling toelicht aan een development team. Geen marketing-taal, geen vage generalisaties. Elke bevinding noem je bij naam.

KERNREGEL: Noem altijd de exacte naam van de betrokken measure, tabel of kolom. Een bevinding zonder naam is waardeloos voor de ontvanger.

Je geeft alleen geldig JSON terug. Geen uitleg buiten de JSON, geen markdown fences.`

function buildUserPrompt(metadata: PbixMetadata, auditId: string): string {
  const metadataJson = JSON.stringify(metadata, null, 2)
  const today = new Date().toISOString().split('T')[0]

  return `Analyseer dit Power BI datamodel grondig en geef een volledig audit rapport als JSON.

MODELMETADATA:
${metadataJson}

ANALYSEOPDRACHT:
Voer voor elke sectie hieronder een specifieke analyse uit op basis van de metadata. Wees zo concreet mogelijk. Gebruik werkelijke namen uit de metadata — nooit placeholders.

SECTIE 1 — EXECUTIVE SUMMARY
1. Algemene staat van het model (2-3 zinnen, eerlijk oordeel)
2. Het grootste risico of probleem dat nu aandacht verdient (1-2 zinnen, concreet)
3. De drie acties met de meeste impact

SECTIE 2 — SCORECARD
Score elke categorie van 1-10 met toelichting van 2-3 zinnen specifiek voor DIT model.
- datamodel_structuur: sterschema-kwaliteit, relaties, cardinaliteit
- dax_kwaliteit: measure-complexiteit, patronen, antipatterns
- performance_risico: geschatte laadtijd impact, zware berekeningen
- naamgeving_governance: consistentie, documentatie, RLS
- onderhoudbaarheid: hoe makkelijk is dit model over te nemen

SECTIE 3 — MODELSTRUCTUUR DIAGNOSE
3a. Tabelanalyse: naam, type (feit/dimensie/bridge/kalender/overig), aantal kolommen, opmerkingen.
3b. Relatieanalyse: van/naar, kardinaliteit, crossfilter, beoordeling met toelichting bij risico/problematisch.
3c. Calculated columns die measures hadden moeten zijn.
3d. Overbodige kolommen.

SECTIE 4 — DAX KWALITEIT (wees exhaustief)
4a. Geneste CALCULATE-statements: measure, probleem_code, uitleg, gecorrigeerde_versie, geschatte_tijdwinst.
4b. Onnodige iterators: measure, huidige_formule, gecorrigeerde_formule, impact.
4c. Delen door nul risico: measure, huidige_formule, gecorrigeerde_formule.
4d. Hardcoded waarden: measure, waarde, aanbeveling.
4e. VAR-optimalisaties: measure, huidige_formule, gecorrigeerde_formule.
4f. Ontbrekende measures: naam, reden, voorbeeld_formule.

SECTIE 5 — PERFORMANCE RISICOPROFIEL
5a. Laadtijd beoordeling (licht/gemiddeld/zwaar/kritisch) met toelichting.
5b. Top 3-5 zwaarste measures met reden.
5c. Import vs DirectQuery advies.
5d. Incrementele refresh advies.

SECTIE 6 — GOVERNANCE & BEHEERBAARHEID
6a. Naamgeving: dominante_conventie, inconsistenties, kwaliteitsoordeel.
6b. Documentatie: measures_gedocumenteerd_pct, tabellen_gedocumenteerd_pct, aanbeveling.
6c. RLS: geconfigureerd, volledig, bevindingen.
6d. Opruimadvies: ongebruikte_measures, ongebruikte_tabellen, verborgen_objecten_review.

SECTIE 7 — BRONVERBINDINGEN
Per bron: identifier, type, risico (laag/gemiddeld/hoog), risico_toelichting, aanbeveling (handhaven/dataflow/gecertificeerde_dataset/overig).

SECTIE 8 — PRIORITEITENMATRIX
Alle bevindingen geprioriteerd. Per item: titel (max 80 tekens, actiegericht), categorie, ernst, impact, effort, geschatte_uren, korte_toelichting.
Sorteer: kritisch eerst, dan quick wins, dan rest.

GEEF TERUG ALS DIT EXACTE JSON-SCHEMA:
{
  "audit_id": "${auditId}",
  "model_naam": "string",
  "analyse_datum": "${today}",
  "executive_summary": {
    "algemene_staat": "string",
    "grootste_risico": "string",
    "top_3_acties": ["string", "string", "string"]
  },
  "scorecard": {
    "datamodel_structuur": { "score": 0, "toelichting": "string" },
    "dax_kwaliteit": { "score": 0, "toelichting": "string" },
    "performance_risico": { "score": 0, "toelichting": "string" },
    "naamgeving_governance": { "score": 0, "toelichting": "string" },
    "onderhoudbaarheid": { "score": 0, "toelichting": "string" },
    "gemiddeld": 0
  },
  "modelstructuur": {
    "tabellen": [{ "naam": "", "type": "", "aantal_kolommen": 0, "opmerkingen": "" }],
    "relaties": [{ "van": "", "naar": "", "kardinaliteit": "", "crossfilter": "", "beoordeling": "", "toelichting": "" }],
    "calculated_columns_als_measure": [{ "naam": "", "tabel": "", "formule": "", "reden": "", "impact": "" }],
    "overbodige_kolommen": [{ "naam": "", "tabel": "", "aanbeveling": "" }]
  },
  "dax_kwaliteit": {
    "geneste_calculate": [{ "measure": "", "probleem_code": "", "uitleg": "", "gecorrigeerde_versie": "", "geschatte_tijdwinst": "" }],
    "onnodige_iterators": [{ "measure": "", "huidige_formule": "", "gecorrigeerde_formule": "", "impact": "" }],
    "delen_door_nul": [{ "measure": "", "huidige_formule": "", "gecorrigeerde_formule": "" }],
    "hardcoded_waarden": [{ "measure": "", "waarde": "", "aanbeveling": "" }],
    "var_optimalisaties": [{ "measure": "", "huidige_formule": "", "gecorrigeerde_formule": "" }],
    "ontbrekende_measures": [{ "naam": "", "reden": "", "voorbeeld_formule": "" }]
  },
  "performance": {
    "laadtijd_beoordeling": "licht|gemiddeld|zwaar|kritisch",
    "laadtijd_toelichting": "",
    "zwaarste_measures": [{ "naam": "", "reden": "" }],
    "import_directquery_advies": "",
    "incrementele_refresh_advies": ""
  },
  "governance": {
    "naamgeving": { "dominante_conventie": "", "inconsistenties": [], "kwaliteitsoordeel": "" },
    "documentatie": { "measures_gedocumenteerd_pct": 0, "tabellen_gedocumenteerd_pct": 0, "aanbeveling": "" },
    "rls": { "geconfigureerd": false, "volledig": false, "bevindingen": "" },
    "opruimadvies": { "ongebruikte_measures": [], "ongebruikte_tabellen": [], "verborgen_objecten_review": "" }
  },
  "bronverbindingen": [{ "identifier": "", "type": "", "risico": "", "risico_toelichting": "", "aanbeveling": "" }],
  "prioriteitenmatrix": [{ "titel": "", "categorie": "", "ernst": "", "impact": "", "effort": "", "geschatte_uren": 0, "korte_toelichting": "" }]
}`
}

export async function analyzeWithClaude(metadata: PbixMetadata, auditId: string): Promise<AuditAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockAnalysis(auditId)
  }

  const userPrompt = buildUserPrompt(metadata, auditId)

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')

  try {
    return JSON.parse(text) as AuditAnalysis
  } catch {
    const clean = text.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(clean) as AuditAnalysis
  }
}

function getMockAnalysis(auditId: string): AuditAnalysis {
  return {
    audit_id: auditId,
    model_naam: 'Sales Report Model',
    analyse_datum: new Date().toISOString().split('T')[0],
    executive_summary: {
      algemene_staat: 'Het datamodel is functioneel opgebouwd met een herkenbare sterstructuur, maar vertoont tekenen van organische groei zonder governance. De mix van Nederlandse en Engelse naamgeving maakt het model onnodig complex.',
      grootste_risico: 'De kolom klantnaam staat direct in de feitentabel Sales in plaats van via dim_Klanten. Dit is een denormalisatie die datakwaliteit en performance raakt.',
      top_3_acties: [
        'Verplaats klantnaam van Sales naar dim_Klanten via de bestaande CustomerID-relatie',
        'Standaardiseer alle naamgeving naar Engels PascalCase',
        'Voeg tijdintelligentie measures toe (YTD, vorige periode) op basis van de Date-tabel',
      ],
    },
    scorecard: {
      datamodel_structuur: { score: 6, toelichting: 'Sterstructuur herkenbaar met Sales als feit en dim_Klanten/Date als dimensies. Kolom klantnaam in Sales doorbreekt de sterstructuur.' },
      dax_kwaliteit: { score: 5, toelichting: 'Twee measures aanwezig. Total Sales LY gebruikt SAMEPERIODLASTYEAR correct, maar tijdintelligentie measures als YTD ontbreken.' },
      performance_risico: { score: 7, toelichting: 'Klein model, geen zware iterators of geneste CALCULATE. Performance risico is laag bij huidig formaat.' },
      naamgeving_governance: { score: 3, toelichting: 'Mix van Engels (Sales, Date) en Nederlands (dim_Klanten, klantnaam, stad). Geen descriptions aanwezig.' },
      onderhoudbaarheid: { score: 4, toelichting: 'Model klein genoeg om te overzien, maar naamgevingsinconsistentie en ontbrekende documentatie maken overdracht lastig.' },
      gemiddeld: 5.0,
    },
    modelstructuur: {
      tabellen: [
        { naam: 'Sales', type: 'feit', aantal_kolommen: 5, opmerkingen: 'Bevat klantnaam — hoort in dimensietabel' },
        { naam: 'dim_Klanten', type: 'dimensie', aantal_kolommen: 3, opmerkingen: 'Nederlandse prefix inconsistent met Engelse tabelnamen' },
        { naam: 'Date', type: 'kalender', aantal_kolommen: 3, opmerkingen: 'Minimale kalendertabel — mist kwartaal en weeknummer' },
      ],
      relaties: [
        { van: 'Sales', naar: 'dim_Klanten', kardinaliteit: 'n:1', crossfilter: 'enkelvoudig', beoordeling: 'correct', toelichting: null },
        { van: 'Sales', naar: 'Date', kardinaliteit: 'n:1', crossfilter: 'enkelvoudig', beoordeling: 'correct', toelichting: null },
      ],
      calculated_columns_als_measure: [],
      overbodige_kolommen: [
        { naam: 'klantnaam', tabel: 'Sales', aanbeveling: 'verwijderen' },
      ],
    },
    dax_kwaliteit: {
      geneste_calculate: [],
      onnodige_iterators: [],
      delen_door_nul: [],
      hardcoded_waarden: [],
      var_optimalisaties: [],
      ontbrekende_measures: [
        { naam: 'Total Sales YTD', reden: 'Date-tabel aanwezig maar geen YTD-measure', voorbeeld_formule: "Total Sales YTD = TOTALYTD([Total Sales], 'Date'[Date])" },
        { naam: 'Sales Growth %', reden: 'Total Sales LY bestaat — groeipercentage is logische vervolgstap', voorbeeld_formule: 'Sales Growth % = DIVIDE([Total Sales] - [Total Sales LY], [Total Sales LY])' },
      ],
    },
    performance: {
      laadtijd_beoordeling: 'licht',
      laadtijd_toelichting: 'Model bevat 3 tabellen, 11 kolommen en 2 measures. Geen knelpunten bij deze schaal.',
      zwaarste_measures: [
        { naam: 'Total Sales LY', reden: 'SAMEPERIODLASTYEAR vereist tijdintelligentie scan — bij grotere datasets het eerste knelpunt' },
      ],
      import_directquery_advies: 'Import mode via SQL Server is de juiste keuze bij dit formaat.',
      incrementele_refresh_advies: 'Bij groei boven 100K rijen is incrementele refresh op OrderDate aan te raden.',
    },
    governance: {
      naamgeving: {
        dominante_conventie: 'Gemengd Engels/Nederlands zonder consistente casing',
        inconsistenties: [
          'dim_Klanten (NL prefix) vs Sales en Date (EN)',
          'klantnaam (lowercase NL) vs CustomerID (PascalCase EN)',
        ],
        kwaliteitsoordeel: 'Naamgeving is het zwakste punt. Een nieuwe developer moet raden welke conventie verwacht wordt.',
      },
      documentatie: {
        measures_gedocumenteerd_pct: 0,
        tabellen_gedocumenteerd_pct: 0,
        aanbeveling: 'Voeg descriptions toe aan alle measures en tabellen. Kost 15 minuten.',
      },
      rls: {
        geconfigureerd: false,
        volledig: false,
        bevindingen: 'Geen RLS. dim_Klanten bevat klantnamen — bij extern delen is RLS noodzakelijk.',
      },
      opruimadvies: {
        ongebruikte_measures: [],
        ongebruikte_tabellen: [],
        verborgen_objecten_review: 'Overweeg technische kolommen zoals CustomerID te verbergen voor eindgebruikers.',
      },
    },
    bronverbindingen: [
      {
        identifier: 'sql-server-01.company.local / SalesDB',
        type: 'SQL Server',
        risico: 'gemiddeld',
        risico_toelichting: 'Directe verbinding naar productie SQL Server. Bij onderhoud stopt het rapport.',
        aanbeveling: 'dataflow',
      },
    ],
    prioriteitenmatrix: [
      { titel: 'Verwijder klantnaam uit Sales feitentabel', categorie: 'datamodel', ernst: 'belangrijk', impact: 'hoog', effort: 'laag', geschatte_uren: 1, korte_toelichting: 'Denormalisatie verwijderen' },
      { titel: 'Standaardiseer naamgeving naar Engels PascalCase', categorie: 'governance', ernst: 'belangrijk', impact: 'hoog', effort: 'gemiddeld', geschatte_uren: 2, korte_toelichting: 'Consistentie aanbrengen' },
      { titel: 'Configureer RLS voor dim_Klanten', categorie: 'governance', ernst: 'belangrijk', impact: 'hoog', effort: 'gemiddeld', geschatte_uren: 2, korte_toelichting: 'Klantnamen onbeveiligd' },
      { titel: 'Voeg tijdintelligentie measures toe', categorie: 'dax', ernst: 'aanbeveling', impact: 'hoog', effort: 'laag', geschatte_uren: 1, korte_toelichting: 'YTD en Growth ontbreken' },
      { titel: 'Voeg descriptions toe aan alle objecten', categorie: 'governance', ernst: 'aanbeveling', impact: 'gemiddeld', effort: 'laag', geschatte_uren: 1, korte_toelichting: '0% documentatie' },
      { titel: 'Breid Date-tabel uit', categorie: 'datamodel', ernst: 'aanbeveling', impact: 'gemiddeld', effort: 'laag', geschatte_uren: 1, korte_toelichting: 'Mist kwartaal en weeknummer' },
      { titel: 'Migreer SQL Server bron naar Dataflow', categorie: 'bronnen', ernst: 'aanbeveling', impact: 'gemiddeld', effort: 'hoog', geschatte_uren: 4, korte_toelichting: 'Directe productie-koppeling is fragiel' },
    ],
  }
}
