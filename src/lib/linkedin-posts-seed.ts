import type { FunnelStage, PostCategory } from './linkedin-writer'

// De 6 bestaande posts uit docs/linkedin-posts-context.md, verbatim als
// startinventaris voor het postgeheugen. ensureSeedPosts() upsert deze één keer
// (onConflict seed_key) zodat de generator vanaf post 1 weet wat er al staat en
// niet in herhaling valt. Op afstand geschreven — nog niet in JW's eigen stem.

export interface SeedPost {
  seedKey: string
  funnelStage: FunnelStage
  category: PostCategory
  style: string
  topic: string
  postText: string
  hashtags: string[]
}

export const SEED_POSTS: SeedPost[] = [
  {
    seedKey: 'seed-w1-ma',
    funnelStage: 'tofu',
    category: '3-hr-problemen',
    style: 'educatief',
    topic: 'De drie universele HR-data-problemen',
    postText: `Bijna elke HR-afdeling die ik spreek, zit met dezelfde drie problemen. Niet met hun mensen — met hun data.

Eén: de bronnen staan los. AFAS voor salaris, een los systeem voor verzuim, Excel voor verloop. Niemand sluit op elkaar aan, dus elk getal moet je met de hand kloppend maken.

Twee: er is geen historie. Je weet hoeveel mensen er vandaag in dienst zijn, maar niet hoe je bestand er een jaar geleden uitzag. Vergelijken kan niet, dus trends zie je niet aankomen.

Drie: de rechten zijn niet dichtgetimmerd. Een manager ziet de salarissen van een andere afdeling, of erger. Bij personeelsdata is dat geen ongemak — dat is een AVG-risico.

Het frustrerende: dit zijn geen onoplosbare problemen. Het zijn ontwerpkeuzes die je vooraf goed moet maken. Achteraf repareren op een live model kost maanden.

Begin bij het rechtenmodel en de historie. De dashboards komen daarna vanzelf.`,
    hashtags: ['#HRanalytics', '#PowerBI', '#DataGovernance', '#AVG'],
  },
  {
    seedKey: 'seed-w1-wo',
    funnelStage: 'mofu',
    category: 'klantcase',
    style: 'storytelling',
    topic: 'Koepelorganisatie met 25 regio\u2019s naar één centraal model',
    postText: `Een koepelorganisatie met 25 regio's belde me. Elke regio had eigen HR- en verzuimdata. In totaal: 25 losse datasets en tientallen losse rapportages.

Niemand had een landelijk beeld. En het echte probleem: niemand kon garanderen dat regio A niet per ongeluk de personeelsdata van regio B kon zien.

De verleiding is dan om 25 modellen netjes te onderhouden. Dat schaalt niet, en je kunt AVG-borging nooit bewijzen.

We bouwden één centraal model. Eén bron van waarheid voor HR en verzuim, met row-level security per regio: elke regio ziet uitsluitend de eigen mensen. Gevoelige velden afgeschermd, herleidbaar wie wat ziet.

Van 25 losse datasets naar één portaal dat aantoonbaar AVG-proof is.

De les die ik telkens terugzie: multi-entiteit security moet je één keer goed ontwerpen. Niet als sluitstuk, maar als ontwerpeis. Anders bouw je een datalek in.`,
    hashtags: ['#HRanalytics', '#RowLevelSecurity', '#PowerBI', '#Privacy'],
  },
  {
    seedKey: 'seed-w1-vr',
    funnelStage: 'tofu',
    category: 'mythe-provocatie',
    style: 'scherp',
    topic: 'Stop met HR-rapportage in Excel samenstellen',
    postText: `Stop met je HR-rapportage in Excel samenstellen.

Niet omdat Excel slecht is. Maar omdat handwerk drie dingen kost die je je niet kunt veroorloven.

Tijd. Een nieuw inzicht duurt weken in plaats van uren.

Betrouwbaarheid. Eén verkeerde formule en je stuurt op een cijfer dat niet klopt.

Mensen. Het hangt aan die ene collega die "de sheet" snapt. Wat als die weg is?

Ik heb bij een greenfield-traject de rapportagetijd zien gaan van weken naar enkele uren. Niet door magie — door het handwerk te vervangen door een model dat zichzelf ververst.

Excel is een rekenmachine. Geen rapportageplatform.`,
    hashtags: ['#HRanalytics', '#PowerBI', '#Excel', '#DataAutomation'],
  },
  {
    seedKey: 'seed-w2-ma',
    funnelStage: 'mofu',
    category: 'mythe-provocatie',
    style: 'provocatief',
    topic: 'Het eerste HR-dashboard is vaak een datalek-in-wording',
    postText: `Onpopulaire mening: het eerste HR-dashboard dat je bouwt, is vaak een datalek-in-wording.

Niet door slechte bedoelingen. Door volgorde.

De meeste trajecten beginnen bij de visuals — mooie grafieken, kleurtjes, een KPI bovenaan. Het rechtenmodel komt "later wel".

Maar bij personeelsdata is dat precies verkeerd om. Salaris, verzuim, verloop: dat mag niet zomaar door iedereen gezien worden. Als row-level security niet vanaf dag één in het fundament zit, bouw je risico in dat je er achteraf nauwelijks uit krijgt.

De juiste volgorde: eerst wie-mag-wat-zien, dan het datamodel, dan pas de dashboards.

Een dashboard maken kan iedereen. Een dashboard maken dat AVG-proof is, is het echte werk.`,
    hashtags: ['#HRanalytics', '#RowLevelSecurity', '#AVG', '#PowerBI'],
  },
  {
    seedKey: 'seed-w2-wo',
    funnelStage: 'mofu',
    category: '3-hr-problemen',
    style: 'educatief',
    topic: 'Geen historie: waarom HR-rapportage vorig jaar niet kan tonen',
    postText: `"Hoeveel mensen hadden we vorig jaar in dienst?"

Simpele vraag. Toch kan de meeste HR-rapportage 'm niet beantwoorden.

De reden: de meeste systemen tonen alleen de stand van vandaag. Iemand verandert van afdeling, en de oude situatie wordt gewoon overschreven. De historie verdwijnt.

Daardoor kun je geen trends zien. Geen verloop over tijd. Geen verzuimopbouw per kwartaal. Geen "waar stonden we toen, waar staan we nu".

De oplossing zit in hoe je je datamodel inricht — wijzigingen vastleggen in plaats van overschrijven, zodat elke maand een momentopname blijft bestaan.

Het klinkt technisch, maar de impact is puur strategisch: zonder historie stuur je altijd op een foto, nooit op de film.

En personeelsbeleid gaat over de film.`,
    hashtags: ['#HRanalytics', '#Datamodellering', '#PowerBI', '#StrategischePersoneelsplanning'],
  },
  {
    seedKey: 'seed-w2-vr',
    funnelStage: 'bofu',
    category: 'klantcase',
    style: 'storytelling',
    topic: 'Greenfield: van nul rapportage naar inzicht in uren (zachte wedge)',
    postText: `Een tijd geleden kwam ik bij een organisatie waar nul rapportage stond. Echt nul. Alle cijfers werden met de hand in Excel samengesteld.

Elke maand opnieuw kopiëren, plakken, controleren. Een verkeerd inzicht kostte weken voordat het op tafel lag — als het al klopte.

We zijn van de grond af begonnen. Eerst het datamodel, daarna pas de visuals. Geen mooie grafieken op een wankel fundament.

Het resultaat: van weken handwerk naar inzicht in uren. En belangrijker — niemand hoeft meer te twijfelen of het cijfer wel klopt.

Wat ik eruit meeneem: bij een lege start bepaalt je eerste model alles wat erna komt. Daar moet je tijd in steken, niet in het laatste dashboard.

Zit je zelf nog vast in maandelijks Excel-handwerk? Stuur me gerust een bericht — ik denk graag een half uur vrijblijvend mee.`,
    hashtags: ['#HRanalytics', '#PowerBI', '#Excel', '#DataStrategie'],
  },
]
