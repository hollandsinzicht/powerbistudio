import type { AuditAnalysis, DestructionProof } from './types/audit'

export const MOCK_AUDIT_DATA: AuditAnalysis = {
  audit_id: "AU-2024-DEMO",
  model_naam: "Verkoop & Finance Dashboard",
  analyse_datum: "2024-03-15",

  executive_summary: {
    algemene_staat: "Het datamodel bevat een solide basis met een herkenbare sterschema-structuur, maar heeft op meerdere plekken technische schuld opgebouwd die directe aandacht verdient. De DAX-laag is de zwakste schakel: 9 van de 24 measures bevatten antipatterns die de laadtijd van het rapport significant beinvloeden. Bij de huidige omvang is dat merkbaar voor eindgebruikers — slicers reageren traag en de Finance-pagina laadt gemiddeld 6-9 seconden.",
    grootste_risico: "De tabel 'fact_Verkoop' heeft een directe verbinding met de productiedatabase zonder Row Level Security. Iedereen met rapporttoegang ziet alle verkoopdata van alle regio's en vertegenwoordigers — inclusief targets en commissies.",
    top_3_acties: [
      "Configureer Row Level Security op fact_Verkoop en fact_Finance voor rolgebaseerde toegang per regio",
      "Herschrijf de 4 geneste CALCULATE-measures — dit is de directe oorzaak van de trage Finance-pagina",
      "Verplaats 6 calculated columns in dim_Klant naar measures — dit verlaagt het modelgeheugen met naar schatting 30-40%",
    ],
  },

  scorecard: {
    datamodel_structuur: { score: 7, toelichting: "Herkenbare sterschema-opzet met fact_Verkoop en fact_Finance als kerntabellen. De brug-tabel dim_KlantSegment introduceert echter een veel-op-veel relatie die niet noodzakelijk is en twee keer gefilterd wordt. De kalender is correct geconfigureerd met een doorlopende datumreeks." },
    dax_kwaliteit: { score: 4, toelichting: "Van de 24 measures bevatten er 9 antipatterns. De meest kritische zijn 4 geneste CALCULATE-statements in de Finance-sectie en 3 gevallen van SUMX waar SUM had volstaan. Bovendien ontbreken YTD-varianten voor de kernmaatstaven Omzet en Marge." },
    performance_risico: { score: 4, toelichting: "Zwaar beoordeeld door de combinatie van 6 calculated columns op een feitentabel met 2,4 miljoen rijen en de geneste CALCULATE-measures. De verwachte laadtijd op een gemiddelde Power BI-licentie is 6-9 seconden voor de Finance-pagina." },
    naamgeving_governance: { score: 6, toelichting: "Tabel- en kolomnamen zijn grotendeels consistent in snake_case Nederlands. De measures gebruiken echter een mix van camelCase en vrije tekst — 'OmzetYTD' naast 'Marge vorig jaar' naast 'KPI_Target_Q3'. 68% van de measures mist een description." },
    onderhoudbaarheid: { score: 5, toelichting: "Het model is overdraagbaar voor iemand met Power BI-ervaring, maar de ontbrekende documentatie en inconsistente naamgeving maken onboarding onnodig tijdrovend. De hardcoded drempelwaarden in 3 KPI-measures zijn een onderhoudsrisico bij jaarwisseling." },
    gemiddeld: 5.2,
  },

  modelstructuur: {
    tabellen: [
      { naam: "fact_Verkoop", type: "feit", aantal_kolommen: 18, opmerkingen: "Kerntabel. Directe productiedatabaseverbinding. Geen RLS geconfigureerd." },
      { naam: "fact_Finance", type: "feit", aantal_kolommen: 14, opmerkingen: "Bevat salarisdata en commissies. Geen RLS — kritisch risico." },
      { naam: "dim_Klant", type: "dimensie", aantal_kolommen: 22, opmerkingen: "6 calculated columns die beter measures zijn. Hoge geheugenimpact." },
      { naam: "dim_Product", type: "dimensie", aantal_kolommen: 11, opmerkingen: "Correct ingericht. Naamgeving consistent." },
      { naam: "dim_Datum", type: "kalender", aantal_kolommen: 16, opmerkingen: "Correct geconfigureerd als markeertabel. Doorlopende reeks 2019-2026." },
      { naam: "dim_Regio", type: "dimensie", aantal_kolommen: 7, opmerkingen: "Correct. Zou ideaal zijn als basis voor RLS-filtering." },
      { naam: "dim_KlantSegment", type: "bridge", aantal_kolommen: 3, opmerkingen: "Introduceert een onnodige veel-op-veel relatie. Zie relatieanalyse." },
      { naam: "Query1", type: "overig", aantal_kolommen: 8, opmerkingen: "Vermoedelijk een vergeten tijdelijke query. Wordt niet gebruikt. Aanbeveling: verwijderen." },
    ],
    relaties: [
      { van: "fact_Verkoop", naar: "dim_Klant", kardinaliteit: "n:1", crossfilter: "enkelvoudig", beoordeling: "correct", toelichting: null },
      { van: "fact_Verkoop", naar: "dim_Product", kardinaliteit: "n:1", crossfilter: "enkelvoudig", beoordeling: "correct", toelichting: null },
      { van: "fact_Verkoop", naar: "dim_Datum", kardinaliteit: "n:1", crossfilter: "enkelvoudig", beoordeling: "correct", toelichting: null },
      { van: "fact_Verkoop", naar: "dim_Regio", kardinaliteit: "n:1", crossfilter: "enkelvoudig", beoordeling: "correct", toelichting: null },
      { van: "fact_Finance", naar: "dim_Datum", kardinaliteit: "n:1", crossfilter: "enkelvoudig", beoordeling: "correct", toelichting: null },
      { van: "dim_Klant", naar: "dim_KlantSegment", kardinaliteit: "n:n", crossfilter: "beide", beoordeling: "problematisch", toelichting: "Veel-op-veel relatie via bridge-tabel is hier niet nodig. Een klant behoort tot een segment. Vervang door een directe n:1 relatie met een 'Segment' kolom in dim_Klant. De dubbele crossfiltering veroorzaakt onverwachte totalen in combinatievisuals." },
      { van: "fact_Finance", naar: "fact_Verkoop", kardinaliteit: "n:n", crossfilter: "beide", beoordeling: "problematisch", toelichting: "Directe relatie tussen twee feitentabellen is een datamodellingsfout. Verbind beide feitentabellen via gedeelde dimensies (dim_Datum, dim_Regio). Verwijder deze relatie." },
    ],
    calculated_columns_als_measure: [
      { naam: "Klant Leeftijdscategorie", tabel: "dim_Klant", formule: 'IF(dim_Klant[Leeftijd] < 30, "Jong", IF(dim_Klant[Leeftijd] < 50, "Midden", "Senior"))', reden: "Deze categorisering wordt alleen in slicers en visuals gebruikt, nooit in een relatie. Als measure berekend op filtercontext is dit 40x efficienter dan een kolom op 180.000 klantrijen.", impact: "Naar schatting 12-18 MB geheugenreductie" },
      { naam: "Klant Omzetklasse", tabel: "dim_Klant", formule: 'IF(RELATED(fact_Verkoop[Omzet_Totaal]) > 50000, "A", "B")', reden: "Gebruikt RELATED() op een feitentabel — dit forceert Power BI om de hele feitentabel te scannen bij elke modelrefresh. Dit is een van de zwaarste calculated column patronen.", impact: "Hoge impact op refresh-duur. Als measure geen refresh-impact." },
      { naam: "Dagen Sinds Aankoop", tabel: "dim_Klant", formule: "DATEDIFF(dim_Klant[Laatste_Aankoop], TODAY(), DAY)", reden: "TODAY() in een calculated column wordt alleen ververst bij een modelrefresh, niet bij het openen van het rapport. De waarde is dus altijd verouderd. Als measure berekent het altijd de actuele waarde.", impact: "Functioneel onjuist gedrag — gebruikers zien verouderde waarden" },
    ],
    overbodige_kolommen: [
      { naam: "Temp_Import_Check", tabel: "fact_Verkoop", aanbeveling: "verwijderen" },
      { naam: "Legacy_KlantCode", tabel: "dim_Klant", aanbeveling: "verwijderen" },
      { naam: "Kolom8", tabel: "Query1", aanbeveling: "verwijderen" },
    ],
  },

  dax_kwaliteit: {
    geneste_calculate: [
      {
        measure: "Marge % Vorig Jaar Gefilterd",
        probleem_code: 'CALCULATE(\n  CALCULATE(\n    DIVIDE([Marge Bedrag], [Omzet]),\n    FILTER(dim_Klant, dim_Klant[Segment] = "A")\n  ),\n  SAMEPERIODLASTYEAR(dim_Datum[Datum])\n)',
        uitleg: "De binnenste CALCULATE past een klantsegmentfilter toe, de buitenste verschuift naar vorig jaar. Elke CALCULATE creert een nieuwe filtercontext — Power BI evalueert dit als twee aparte scans van de feitentabel. Dit is de primaire oorzaak van de trage Finance-pagina.",
        gecorrigeerde_versie: 'VAR MargeVorigJaar =\n  CALCULATE(\n    DIVIDE([Marge Bedrag], [Omzet]),\n    SAMEPERIODLASTYEAR(dim_Datum[Datum]),\n    dim_Klant[Segment] = "A"\n  )\nRETURN MargeVorigJaar',
        geschatte_tijdwinst: "60-70% snellere evaluatie van deze measure",
      },
      {
        measure: "Omzet Budget Verschil %",
        probleem_code: 'CALCULATE(\n  CALCULATE(\n    [Omzet] - [Budget],\n    dim_Regio[Land] = "NL"\n  ),\n  REMOVEFILTERS(dim_Datum)\n) / CALCULATE([Budget], REMOVEFILTERS(dim_Datum))',
        uitleg: "Drie CALCULATE-aanroepen waarvan twee genest. De REMOVEFILTERS wordt twee keer onafhankelijk uitgevoerd. Bovendien ontbreekt DIVIDE() — bij een budget van nul gooit dit een fout of geeft INFINITY terug in de visual.",
        gecorrigeerde_versie: 'VAR OmzetNL =\n  CALCULATE(\n    [Omzet] - [Budget],\n    dim_Regio[Land] = "NL",\n    REMOVEFILTERS(dim_Datum)\n  )\nVAR BudgetBase =\n  CALCULATE([Budget], REMOVEFILTERS(dim_Datum))\nRETURN\n  DIVIDE(OmzetNL, BudgetBase)',
        geschatte_tijdwinst: "40-50% snellere evaluatie + geen INFINITY-fouten",
      },
    ],
    onnodige_iterators: [
      {
        measure: "Totaal Orderregels",
        huidige_formule: "SUMX(fact_Verkoop, fact_Verkoop[Aantal])",
        gecorrigeerde_formule: "SUM(fact_Verkoop[Aantal])",
        impact: "SUMX itereert rij voor rij over 2,4 miljoen records. SUM gebruikt een geoptimaliseerde kolomscan. Bij deze tabelomvang is het verschil merkbaar: ~0.8 seconden per visual.",
      },
      {
        measure: "Gemiddelde Orderwaarde",
        huidige_formule: "AVERAGEX(fact_Verkoop, fact_Verkoop[Omzet])",
        gecorrigeerde_formule: "AVERAGE(fact_Verkoop[Omzet])",
        impact: "Zelfde patroon als Totaal Orderregels. AVERAGEX is alleen nuttig als je een expressie per rij wilt berekenen — hier is dat niet het geval.",
      },
    ],
    delen_door_nul: [
      { measure: "Conversieratio", huidige_formule: "[Aantal Deals] / [Aantal Leads]", gecorrigeerde_formule: "DIVIDE([Aantal Deals], [Aantal Leads], 0)" },
      { measure: "Omzet Per Medewerker", huidige_formule: "[Omzet] / [Aantal FTE]", gecorrigeerde_formule: "DIVIDE([Omzet], [Aantal FTE], BLANK())" },
    ],
    hardcoded_waarden: [
      { measure: "KPI Omzet Status", waarde: 'IF([Omzet] > 250000, "Op koers", "Achter")', aanbeveling: "De drempelwaarde 250000 is hardcoded. Maak een tabel 'tbl_Parameters' met een rij 'Omzet_Target' en verwijs daar naar." },
      { measure: "KPI Marge Status", waarde: 'IF([Marge %] > 0.22, "Groen", IF([Marge %] > 0.18, "Oranje", "Rood"))', aanbeveling: "Twee hardcoded drempelwaarden (0.22 en 0.18). Centraliseer in tbl_Parameters zodat Finance de targets zelf kan aanpassen." },
    ],
    var_optimalisaties: [
      {
        measure: "Netto Marge Gecorrigeerd",
        huidige_formule: "([Omzet] - [Kosten] - [Retouren]) / ([Omzet] - [Retouren])",
        gecorrigeerde_formule: "VAR Netto = [Omzet] - [Kosten] - [Retouren]\nVAR Basis = [Omzet] - [Retouren]\nRETURN DIVIDE(Netto, Basis)",
      },
    ],
    ontbrekende_measures: [
      { naam: "Omzet YTD", reden: "Ontbreekt volledig. Omzet wordt alleen absoluut getoond — geen year-to-date vergelijking mogelijk.", voorbeeld_formule: "CALCULATE([Omzet], DATESYTD(dim_Datum[Datum]))" },
      { naam: "Omzet Vorig Jaar", reden: "Ontbreekt. Zonder prior-year vergelijking heeft de trendlijn geen context.", voorbeeld_formule: "CALCULATE([Omzet], SAMEPERIODLASTYEAR(dim_Datum[Datum]))" },
      { naam: "Marge % YTD", reden: "Omzet YTD en Marge Bedrag zijn aanwezig maar worden niet gecombineerd tot een YTD-percentage.", voorbeeld_formule: "DIVIDE(\n  CALCULATE([Marge Bedrag], DATESYTD(dim_Datum[Datum])),\n  CALCULATE([Omzet], DATESYTD(dim_Datum[Datum]))\n)" },
    ],
  },

  performance: {
    laadtijd_beoordeling: "zwaar",
    laadtijd_toelichting: "De combinatie van 6 calculated columns op dim_Klant (180.000 rijen), een directe relatie tussen twee feitentabellen, en 4 geneste CALCULATE-measures resulteert in een geschatte laadtijd van 6-9 seconden voor de Finance-pagina. Na doorvoering van de aanbevolen fixes is een reductie naar 1-2 seconden realistisch.",
    zwaarste_measures: [
      { naam: "Marge % Vorig Jaar Gefilterd", reden: "Dubbel geneste CALCULATE met tijdintelligentie en segmentfilter" },
      { naam: "Omzet Budget Verschil %", reden: "Drie CALCULATE-aanroepen, REMOVEFILTERS twee keer uitgevoerd" },
      { naam: "Klant Omzetklasse (calc. col.)", reden: "RELATED() op 2,4M feitenrijen bij elke refresh" },
      { naam: "Totaal Orderregels", reden: "SUMX over 2,4 miljoen rijen waar SUM volstaat" },
    ],
    import_directquery_advies: "Het model gebruikt Import-mode, wat correct is voor deze omvang. DirectQuery zou de performance verder verslechteren gezien de complexe DAX-laag.",
    incrementele_refresh_advies: "fact_Verkoop bevat een datum-kolom (Verkoopdatum) en groeit dagelijks. Incrementele refresh reduceert de dagelijkse refresh van 8-12 minuten naar 1-2 minuten. Configureer een rolling window van 2 jaar met incrementele refresh op de laatste 30 dagen.",
  },

  governance: {
    naamgeving: {
      dominante_conventie: "snake_case Nederlands voor tabellen en kolommen",
      inconsistenties: [
        "Measures gebruiken drie stijlen door elkaar: 'OmzetYTD' (camelCase), 'Marge vorig jaar' (vrije tekst), 'KPI_Target_Q3' (underscore met hoofdletters)",
        "Tabel 'Query1' wijkt af van de snake_case conventie — vermoedelijk nooit hernoemd na import",
        "Kolommen in fact_Finance zijn Engelstalig ('Revenue', 'Cost') terwijl alle andere tabellen Nederlandstalig zijn",
      ],
      kwaliteitsoordeel: "Tabel- en kolomnamen zijn voldoende consistent voor dagelijks gebruik. De measure-naamgeving vereist een eenmalige opschoonronde.",
    },
    documentatie: {
      measures_gedocumenteerd_pct: 12,
      tabellen_gedocumenteerd_pct: 0,
      aanbeveling: "Alleen 3 van de 24 measures hebben een description. Geen enkele tabel heeft een beschrijving. Prioriteit: documenteer eerst de 9 measures met antipatterns.",
    },
    rls: {
      geconfigureerd: false,
      volledig: false,
      bevindingen: "Geen Row Level Security geconfigureerd. fact_Finance bevat salarisgegevens en commissies. fact_Verkoop bevat targets per vertegenwoordiger. Iedereen met rapporttoegang ziet alle data. dim_Regio is beschikbaar als filterbasis voor RLS.",
    },
    opruimadvies: {
      ongebruikte_measures: ["Test_Marge_Backup", "Omzet_Oud_2022", "DEBUG_FilterContext"],
      ongebruikte_tabellen: ["Query1"],
      verborgen_objecten_review: "4 kolommen zijn verborgen maar worden wel gebruikt in measures — correct. 2 verborgen kolommen worden nergens gebruikt: fact_Verkoop[Temp_Import_Check] en dim_Klant[Legacy_KlantCode].",
    },
  },

  bronverbindingen: [
    { identifier: "SQL-PROD-01 / VerkoopDB", type: "SQL Server", risico: "hoog", risico_toelichting: "Directe verbinding met productiedatabase zonder staging-laag. Bij een trage query blokkeert het rapport de productiedatabase.", aanbeveling: "dataflow" },
    { identifier: "SharePoint / Budgetten_2024.xlsx", type: "Excel via SharePoint", risico: "gemiddeld", risico_toelichting: "Excel-bestanden als databron zijn fragiel — een hernoeming of verplaatsing breekt de verbinding.", aanbeveling: "gecertificeerde_dataset" },
    { identifier: "C:/Users/jdehaan/Documents/targets.xlsx", type: "Lokaal Excel-bestand", risico: "hoog", risico_toelichting: "Lokaal bestand op de laptop van een specifieke medewerker. Dit rapport kan alleen verversen op die ene machine.", aanbeveling: "gecertificeerde_dataset" },
  ],

  prioriteitenmatrix: [
    { titel: "Configureer RLS op fact_Verkoop en fact_Finance", categorie: "governance", ernst: "kritisch", impact: "hoog", effort: "gemiddeld", geschatte_uren: 4, korte_toelichting: "Salarisdata en targets zichtbaar voor alle gebruikers" },
    { titel: "Verwijder directe relatie tussen fact_Finance en fact_Verkoop", categorie: "datamodel", ernst: "kritisch", impact: "hoog", effort: "laag", geschatte_uren: 1, korte_toelichting: "Datamodellingsfout die onjuiste totalen veroorzaakt" },
    { titel: "Herschrijf Marge % Vorig Jaar Gefilterd met VAR", categorie: "dax", ernst: "kritisch", impact: "hoog", effort: "laag", geschatte_uren: 1, korte_toelichting: "Grootste bijdrage aan trage Finance-pagina" },
    { titel: "Herschrijf Omzet Budget Verschil % en voeg DIVIDE toe", categorie: "dax", ernst: "kritisch", impact: "hoog", effort: "laag", geschatte_uren: 1, korte_toelichting: "Drie geneste CALCULATE + INFINITY-risico" },
    { titel: "Verplaats 6 calculated columns in dim_Klant naar measures", categorie: "performance", ernst: "belangrijk", impact: "hoog", effort: "gemiddeld", geschatte_uren: 3, korte_toelichting: "30-40% geheugenreductie" },
    { titel: "Vervang SUMX door SUM in Totaal Orderregels", categorie: "dax", ernst: "belangrijk", impact: "hoog", effort: "laag", geschatte_uren: 0, korte_toelichting: "0.8 seconden sneller per visual" },
    { titel: "Vervang AVERAGEX door AVERAGE in Gemiddelde Orderwaarde", categorie: "dax", ernst: "belangrijk", impact: "hoog", effort: "laag", geschatte_uren: 0, korte_toelichting: "Zelfde patroon als Totaal Orderregels" },
    { titel: "Voeg DIVIDE toe aan Conversieratio en Omzet Per Medewerker", categorie: "dax", ernst: "belangrijk", impact: "gemiddeld", effort: "laag", geschatte_uren: 0, korte_toelichting: "Voorkomt INFINITY-waarden" },
    { titel: "Migreer lokaal targets.xlsx naar SharePoint of Dataflow", categorie: "bronnen", ernst: "belangrijk", impact: "hoog", effort: "laag", geschatte_uren: 2, korte_toelichting: "Rapport kan nu alleen verversen op een specifieke laptop" },
    { titel: "Configureer incrementele refresh op fact_Verkoop", categorie: "performance", ernst: "belangrijk", impact: "gemiddeld", effort: "gemiddeld", geschatte_uren: 2, korte_toelichting: "Refresh van ~10 min naar ~1-2 min" },
    { titel: "Voeg Omzet YTD, Omzet Vorig Jaar en Marge % YTD toe", categorie: "dax", ernst: "belangrijk", impact: "hoog", effort: "laag", geschatte_uren: 1, korte_toelichting: "Basisvereiste voor finance-rapportage" },
    { titel: "Centraliseer KPI-drempelwaarden in tbl_Parameters", categorie: "governance", ernst: "aanbeveling", impact: "gemiddeld", effort: "gemiddeld", geschatte_uren: 3, korte_toelichting: "Hardcoded in measures — breekt bij nieuwe budgetcyclus" },
    { titel: "Verwijder Query1, 3 ongebruikte measures en 2 kolommen", categorie: "governance", ernst: "aanbeveling", impact: "laag", effort: "laag", geschatte_uren: 1, korte_toelichting: "Modelopschoning" },
    { titel: "Standaardiseer measure-naamgeving naar snake_case NL", categorie: "governance", ernst: "aanbeveling", impact: "gemiddeld", effort: "gemiddeld", geschatte_uren: 2, korte_toelichting: "Nu drie stijlen door elkaar" },
    { titel: "Documenteer de 9 measures met antipatterns", categorie: "governance", ernst: "aanbeveling", impact: "laag", effort: "laag", geschatte_uren: 2, korte_toelichting: "12% van measures gedocumenteerd" },
  ],
}

export const MOCK_DESTRUCTION_PROOF: DestructionProof = {
  originalHash: "a3f9c2d8e1b4f7a3c9e2d5b8f1a4c7e0",
  originalDestroyedAt: "15 mrt 2024, 14:32",
  metadataHash: "7b12e4a9c3f6d2b8e5a1c4f7b0d3e6a9",
  metadataDestroyedAt: "15 mrt 2024, 14:32",
  verificationCode: "AU-2024-DEMO-X7K2",
}
