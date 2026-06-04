/**
 * Acquisitie-data voor de admin-sectie "Acquisitie".
 *
 * Eén bron voor wat de admin toont: de ICP-starters, de 6 LinkedIn-posts en de
 * outreach-funnel (A3 + A4 uit het acquisitieplan).
 *
 * Werkkopieën (voor Sheets-import / nieuwe schrijf-chat) blijven bestaan in:
 *   - docs/icp-lijst.csv              → bewerkbare ICP-lijst voor Sales Navigator/Sheets
 *   - docs/linkedin-posts-context.md  → volledige handoff + stijlregels
 * Deze module spiegelt die inhoud zodat ze read-only in de admin zichtbaar is.
 */

export interface IcpStarter {
  bedrijf: string;
  plaats: string;
  fte: string;
  functie: string;
  /** Concrete aanleiding voor outreach; leeg = nog te checken. */
  trigger?: string;
}

/**
 * 5 geverifieerde NL mid-market starters (250-2.000 FTE).
 * Naam/LinkedIn/salarissysteem bewust leeg: die verifieert JW per account
 * (integriteit — geen verzonnen persoonsdata).
 */
export const ICP_STARTERS: IcpStarter[] = [
  {
    bedrijf: 'DSW Zorgverzekeraar',
    plaats: 'Schiedam',
    fte: '~600',
    functie: 'HR-directeur of Manager HR',
    trigger: 'vacature data-analist open (publiek mei 2026)',
  },
  {
    bedrijf: 'Woningcorporatie Portaal',
    plaats: 'Utrecht',
    fte: '~480',
    functie: 'HR-directeur of Manager HR',
  },
  {
    bedrijf: 'Koninklijke Gazelle',
    plaats: 'Dieren',
    fte: '~485',
    functie: 'HR-directeur of Manager HR',
  },
  {
    bedrijf: 'Koninklijke Auping',
    plaats: 'Deventer',
    fte: '~350',
    functie: 'HR-directeur of Manager HR',
  },
  {
    bedrijf: 'Royal Lemkes',
    plaats: 'Bleiswijk',
    fte: '~280',
    functie: 'HR-directeur of Manager HR',
  },
];

export type LinkedInPostStyle =
  | 'educatief'
  | 'scherp'
  | 'provocatief'
  | 'storytelling';

export interface LinkedInPostDraft {
  week: 1 | 2;
  dag: 'ma' | 'wo' | 'vr';
  style: LinkedInPostStyle;
  thema: string;
  body: string;
  hashtags: string[];
}

/**
 * De 6 posts (ma/wo/vr × 2 weken). Op afstand geschreven — nog niet in JW's
 * eigen stem (zie vragengesprek in docs/linkedin-posts-context.md).
 */
export const LINKEDIN_POSTS: LinkedInPostDraft[] = [
  {
    week: 1,
    dag: 'ma',
    style: 'educatief',
    thema: '3 universele HR-data-problemen',
    body: `Bijna elke HR-afdeling die ik spreek, zit met dezelfde drie problemen. Niet met hun mensen — met hun data.

Eén: de bronnen staan los. AFAS voor salaris, een los systeem voor verzuim, Excel voor verloop. Niemand sluit op elkaar aan, dus elk getal moet je met de hand kloppend maken.

Twee: er is geen historie. Je weet hoeveel mensen er vandaag in dienst zijn, maar niet hoe je bestand er een jaar geleden uitzag. Vergelijken kan niet, dus trends zie je niet aankomen.

Drie: de rechten zijn niet dichtgetimmerd. Een manager ziet de salarissen van een andere afdeling, of erger. Bij personeelsdata is dat geen ongemak — dat is een AVG-risico.

Het frustrerende: dit zijn geen onoplosbare problemen. Het zijn ontwerpkeuzes die je vooraf goed moet maken. Achteraf repareren op een live model kost maanden.

Begin bij het rechtenmodel en de historie. De dashboards komen daarna vanzelf.`,
    hashtags: ['#HRanalytics', '#PowerBI', '#DataGovernance', '#AVG'],
  },
  {
    week: 1,
    dag: 'wo',
    style: 'storytelling',
    thema: 'anonieme mini-case (25 regio\'s)',
    body: `Een koepelorganisatie met 25 regio's belde me. Elke regio had eigen HR- en verzuimdata. In totaal: 25 losse datasets en tientallen losse rapportages.

Niemand had een landelijk beeld. En het echte probleem: niemand kon garanderen dat regio A niet per ongeluk de personeelsdata van regio B kon zien.

De verleiding is dan om 25 modellen netjes te onderhouden. Dat schaalt niet, en je kunt AVG-borging nooit bewijzen.

We bouwden één centraal model. Eén bron van waarheid voor HR en verzuim, met row-level security per regio: elke regio ziet uitsluitend de eigen mensen. Gevoelige velden afgeschermd, herleidbaar wie wat ziet.

Van 25 losse datasets naar één portaal dat aantoonbaar AVG-proof is.

De les die ik telkens terugzie: multi-entiteit security moet je één keer goed ontwerpen. Niet als sluitstuk, maar als ontwerpeis. Anders bouw je een datalek in.`,
    hashtags: ['#HRanalytics', '#RowLevelSecurity', '#PowerBI', '#Privacy'],
  },
  {
    week: 1,
    dag: 'vr',
    style: 'scherp',
    thema: 'stop met Excel',
    body: `Stop met je HR-rapportage in Excel samenstellen.

Niet omdat Excel slecht is. Maar omdat handwerk drie dingen kost die je je niet kunt veroorloven.

Tijd. Een nieuw inzicht duurt weken in plaats van uren.

Betrouwbaarheid. Eén verkeerde formule en je stuurt op een cijfer dat niet klopt.

Mensen. Het hangt aan die ene collega die "de sheet" snapt. Wat als die weg is?

Ik heb bij een greenfield-traject de rapportagetijd zien gaan van weken naar enkele uren. Niet door magie — door het handwerk te vervangen door een model dat zichzelf ververst.

Excel is een rekenmachine. Geen rapportageplatform.`,
    hashtags: ['#HRanalytics', '#PowerBI', '#Excel', '#DataAutomation'],
  },
  {
    week: 2,
    dag: 'ma',
    style: 'provocatief',
    thema: 'RLS = datalek-in-wording',
    body: `Onpopulaire mening: het eerste HR-dashboard dat je bouwt, is vaak een datalek-in-wording.

Niet door slechte bedoelingen. Door volgorde.

De meeste trajecten beginnen bij de visuals — mooie grafieken, kleurtjes, een KPI bovenaan. Het rechtenmodel komt "later wel".

Maar bij personeelsdata is dat precies verkeerd om. Salaris, verzuim, verloop: dat mag niet zomaar door iedereen gezien worden. Als row-level security niet vanaf dag één in het fundament zit, bouw je risico in dat je er achteraf nauwelijks uit krijgt.

De juiste volgorde: eerst wie-mag-wat-zien, dan het datamodel, dan pas de dashboards.

Een dashboard maken kan iedereen. Een dashboard maken dat AVG-proof is, is het echte werk.`,
    hashtags: ['#HRanalytics', '#RowLevelSecurity', '#AVG', '#PowerBI'],
  },
  {
    week: 2,
    dag: 'wo',
    style: 'educatief',
    thema: 'geen historie / SCD2',
    body: `"Hoeveel mensen hadden we vorig jaar in dienst?"

Simpele vraag. Toch kan de meeste HR-rapportage 'm niet beantwoorden.

De reden: de meeste systemen tonen alleen de stand van vandaag. Iemand verandert van afdeling, en de oude situatie wordt gewoon overschreven. De historie verdwijnt.

Daardoor kun je geen trends zien. Geen verloop over tijd. Geen verzuimopbouw per kwartaal. Geen "waar stonden we toen, waar staan we nu".

De oplossing zit in hoe je je datamodel inricht — wijzigingen vastleggen in plaats van overschrijven, zodat elke maand een momentopname blijft bestaan.

Het klinkt technisch, maar de impact is puur strategisch: zonder historie stuur je altijd op een foto, nooit op de film.

En personeelsbeleid gaat over de film.`,
    hashtags: [
      '#HRanalytics',
      '#Datamodellering',
      '#PowerBI',
      '#StrategischePersoneelsplanning',
    ],
  },
  {
    week: 2,
    dag: 'vr',
    style: 'storytelling',
    thema: 'greenfield + zachte wedge',
    body: `Een tijd geleden kwam ik bij een organisatie waar nul rapportage stond. Echt nul. Alle cijfers werden met de hand in Excel samengesteld.

Elke maand opnieuw kopiëren, plakken, controleren. Een verkeerd inzicht kostte weken voordat het op tafel lag — als het al klopte.

We zijn van de grond af begonnen. Eerst het datamodel, daarna pas de visuals. Geen mooie grafieken op een wankel fundament.

Het resultaat: van weken handwerk naar inzicht in uren. En belangrijker — niemand hoeft meer te twijfelen of het cijfer wel klopt.

Wat ik eruit meeneem: bij een lege start bepaalt je eerste model alles wat erna komt. Daar moet je tijd in steken, niet in het laatste dashboard.

Zit je zelf nog vast in maandelijks Excel-handwerk? Stuur me gerust een bericht — ik denk graag een half uur vrijblijvend mee.`,
    hashtags: ['#HRanalytics', '#PowerBI', '#Excel', '#DataStrategie'],
  },
];

export interface OutreachBlok {
  label: string;
  /** Korte toelichting wanneer/hoe te gebruiken. */
  toelichting?: string;
  tekst: string;
}

/** Stap 1 — connectieverzoeken (kort, geen pitch). */
export const CONNECT_VARIANTEN: OutreachBlok[] = [
  {
    label: 'Variant A — nieuwe HR-lead',
    tekst:
      'Hoi [voornaam], ik zag dat je sinds kort de HR-rol bij [bedrijf] hebt opgepakt — mooie stap. Ik werk veel met HR-teams rond data en rapportage en volg graag wat je deelt. Leuk om te connecten.',
  },
  {
    label: 'Variant B — vacature HR-analist',
    tekst:
      'Hoi [voornaam], ik zag dat [bedrijf] een HR-analist zoekt. Ik help organisaties juist met de datakant van HR, dus ik volg dit soort ontwikkelingen met interesse. Leuk om te connecten.',
  },
  {
    label: 'Variant C — algemeen',
    tekst:
      'Hoi [voornaam], we zitten allebei in de HR-data-hoek. Ik schrijf en bouw rond Power BI voor HR-teams en kom graag in contact met mensen die met dezelfde vraagstukken bezig zijn.',
  },
];

/** Stap 2-4 — opvolgberichten in de funnel. */
export const OUTREACH_STAPPEN: OutreachBlok[] = [
  {
    label: 'Stap 2 — opvolg-DM',
    toelichting: '1-2 dagen ná acceptatie. Nooit direct. Één concreet probleem.',
    tekst:
      'Bedankt voor het connecten, [voornaam]. Ik zal je niet lastigvallen met een verkooppraatje. Eén observatie: bij organisaties van jullie omvang zie ik vaak dat HR-data over losse bronnen verspreid staat — AFAS voor salaris, iets anders voor verzuim — en dat rapportage daardoor handwerk blijft. Plus dat de rechten op personeelsdata niet altijd waterdicht zijn (AVG). Herkenbaar bij [bedrijf], of hebben jullie dat al strak?',
  },
  {
    label: 'Stap 3 — wedge + boekingslink',
    toelichting: 'Bij interesse. Quick Scan als next step.',
    tekst:
      'Goed om te horen. De snelste manier om er grip op te krijgen is een Quick Scan: in 1,5 dag breng ik je HR-data, rechtenmodel en knelpunten in kaart en krijg je een concreet beeld van wat er nodig is. Vaste prijs, geen verplichting daarna. Als het je wat lijkt kun je zo een moment prikken: https://cal.com/powerbistudio/quick-scan — of even bellen eerst? https://cal.com/powerbistudio/verkennend-gesprek',
  },
  {
    label: 'Stap 4 — zachte follow-up',
    toelichting: 'Na ~5-7 dagen geen reactie. Max. 1 follow-up, daarna loslaten.',
    tekst:
      'Hoi [voornaam], geen haast — ik laat het even bij je. Mocht HR-rapportage of de AVG-kant rond personeelsdata ooit op tafel komen, dan denk ik graag een keer vrijblijvend mee. Fijne week!',
  },
];
