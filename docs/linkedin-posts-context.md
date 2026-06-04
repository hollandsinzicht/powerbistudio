# LinkedIn-posts context (handoff voor een nieuwe chat)

> Doel van dit bestand: een **nieuwe, aparte chat** voor het schrijven van LinkedIn-posts kan dit lezen
> en direct voortbouwen op wat al gemaakt is. Een nieuwe chat heeft géén automatisch geheugen van andere
> chats — deze file ís het geheugen. Open een nieuwe chat, zeg "lees docs/linkedin-posts-context.md" en ga verder.

---

## 1. Positionering (de kern, niet onderhandelbaar)

- **Wie:** Power BI Studio — Jan Willem den Hollander, solo.
- **Wat:** exclusief **HR-analytics** voor de **NL mid-market**.
- **ICP:** bedrijven **250-2.000 FTE** op **AFAS / Visma / Nmbrs**.
- **Beslissers:** HR-directeur · Manager HR · business controller.
- **Wedge-aanbod in alle outreach:** alleen de **€1.950 Quick Scan** (1,5 dag). Géén Foundation (€34,5k) in eerste contact.
- **3 universele HR-data-problemen** (de inhoudelijke rode draad van alle content):
  1. losse bronnen (salaris/verzuim/verloop sluiten niet op elkaar aan)
  2. geen historie (SCD2 ontbreekt → alleen stand van vandaag)
  3. rechten niet dichtgetimmerd (RLS ontbreekt → AVG-risico)

## 2. Stijlregels (bron: `src/lib/linkedin-writer.ts`)

Lees voor de volledige regels altijd `src/lib/linkedin-writer.ts`. Samengevat:
- ik-/je-vorm, spreektaal, **geen AI-taal**.
- **kleine letters**, behalve merknamen (Power BI, Microsoft Fabric, DAX, Excel, Azure, Copilot, DashPortal) en eigennamen. Geen Title Case.
- samenstelling met merknaam = koppelteken (bv. "Power BI-model").
- sterke hook in de eerste 2-3 zinnen.
- lengte **800-1300 tekens**.
- hashtags apart (3-4, CamelCase).
- **integriteitsregel: geen verzonnen cijfers.** Alleen echte getallen (bv. Lyreco "weken → uren" is echt; Vattenfall bewust kwalitatief gemaakt).

## 3. De 6 bestaande posts (op afstand geschreven — nog NIET in JW's eigen stem)

Ritme: **ma / wo / vr**, 2 weken.

### Week 1 — Ma · educatief (3 universele problemen)
```
Bijna elke HR-afdeling die ik spreek, zit met dezelfde drie problemen. Niet met hun mensen — met hun data.

Eén: de bronnen staan los. AFAS voor salaris, een los systeem voor verzuim, Excel voor verloop. Niemand sluit op elkaar aan, dus elk getal moet je met de hand kloppend maken.

Twee: er is geen historie. Je weet hoeveel mensen er vandaag in dienst zijn, maar niet hoe je bestand er een jaar geleden uitzag. Vergelijken kan niet, dus trends zie je niet aankomen.

Drie: de rechten zijn niet dichtgetimmerd. Een manager ziet de salarissen van een andere afdeling, of erger. Bij personeelsdata is dat geen ongemak — dat is een AVG-risico.

Het frustrerende: dit zijn geen onoplosbare problemen. Het zijn ontwerpkeuzes die je vooraf goed moet maken. Achteraf repareren op een live model kost maanden.

Begin bij het rechtenmodel en de historie. De dashboards komen daarna vanzelf.
```
`#HRanalytics #PowerBI #DataGovernance #AVG`

### Week 1 — Wo · storytelling (anonieme mini-case, 25 regio's)
```
Een koepelorganisatie met 25 regio's belde me. Elke regio had eigen HR- en verzuimdata. In totaal: 25 losse datasets en tientallen losse rapportages.

Niemand had een landelijk beeld. En het echte probleem: niemand kon garanderen dat regio A niet per ongeluk de personeelsdata van regio B kon zien.

De verleiding is dan om 25 modellen netjes te onderhouden. Dat schaalt niet, en je kunt AVG-borging nooit bewijzen.

We bouwden één centraal model. Eén bron van waarheid voor HR en verzuim, met row-level security per regio: elke regio ziet uitsluitend de eigen mensen. Gevoelige velden afgeschermd, herleidbaar wie wat ziet.

Van 25 losse datasets naar één portaal dat aantoonbaar AVG-proof is.

De les die ik telkens terugzie: multi-entiteit security moet je één keer goed ontwerpen. Niet als sluitstuk, maar als ontwerpeis. Anders bouw je een datalek in.
```
`#HRanalytics #RowLevelSecurity #PowerBI #Privacy`

### Week 1 — Vr · scherp (stop met Excel)
```
Stop met je HR-rapportage in Excel samenstellen.

Niet omdat Excel slecht is. Maar omdat handwerk drie dingen kost die je je niet kunt veroorloven.

Tijd. Een nieuw inzicht duurt weken in plaats van uren.

Betrouwbaarheid. Eén verkeerde formule en je stuurt op een cijfer dat niet klopt.

Mensen. Het hangt aan die ene collega die "de sheet" snapt. Wat als die weg is?

Ik heb bij een greenfield-traject de rapportagetijd zien gaan van weken naar enkele uren. Niet door magie — door het handwerk te vervangen door een model dat zichzelf ververst.

Excel is een rekenmachine. Geen rapportageplatform.
```
`#HRanalytics #PowerBI #Excel #DataAutomation`

### Week 2 — Ma · provocatief (RLS = datalek-in-wording)
```
Onpopulaire mening: het eerste HR-dashboard dat je bouwt, is vaak een datalek-in-wording.

Niet door slechte bedoelingen. Door volgorde.

De meeste trajecten beginnen bij de visuals — mooie grafieken, kleurtjes, een KPI bovenaan. Het rechtenmodel komt "later wel".

Maar bij personeelsdata is dat precies verkeerd om. Salaris, verzuim, verloop: dat mag niet zomaar door iedereen gezien worden. Als row-level security niet vanaf dag één in het fundament zit, bouw je risico in dat je er achteraf nauwelijks uit krijgt.

De juiste volgorde: eerst wie-mag-wat-zien, dan het datamodel, dan pas de dashboards.

Een dashboard maken kan iedereen. Een dashboard maken dat AVG-proof is, is het echte werk.
```
`#HRanalytics #RowLevelSecurity #AVG #PowerBI`

### Week 2 — Wo · educatief (geen historie / SCD2)
```
"Hoeveel mensen hadden we vorig jaar in dienst?"

Simpele vraag. Toch kan de meeste HR-rapportage 'm niet beantwoorden.

De reden: de meeste systemen tonen alleen de stand van vandaag. Iemand verandert van afdeling, en de oude situatie wordt gewoon overschreven. De historie verdwijnt.

Daardoor kun je geen trends zien. Geen verloop over tijd. Geen verzuimopbouw per kwartaal. Geen "waar stonden we toen, waar staan we nu".

De oplossing zit in hoe je je datamodel inricht — wijzigingen vastleggen in plaats van overschrijven, zodat elke maand een momentopname blijft bestaan.

Het klinkt technisch, maar de impact is puur strategisch: zonder historie stuur je altijd op een foto, nooit op de film.

En personeelsbeleid gaat over de film.
```
`#HRanalytics #Datamodellering #PowerBI #StrategischePersoneelsplanning`

### Week 2 — Vr · storytelling + zachte wedge (greenfield)
```
Een tijd geleden kwam ik bij een organisatie waar nul rapportage stond. Echt nul. Alle cijfers werden met de hand in Excel samengesteld.

Elke maand opnieuw kopiëren, plakken, controleren. Een verkeerd inzicht kostte weken voordat het op tafel lag — als het al klopte.

We zijn van de grond af begonnen. Eerst het datamodel, daarna pas de visuals. Geen mooie grafieken op een wankel fundament.

Het resultaat: van weken handwerk naar inzicht in uren. En belangrijker — niemand hoeft meer te twijfelen of het cijfer wel klopt.

Wat ik eruit meeneem: bij een lege start bepaalt je eerste model alles wat erna komt. Daar moet je tijd in steken, niet in het laatste dashboard.

Zit je zelf nog vast in maandelijks Excel-handwerk? Stuur me gerust een bericht — ik denk graag een half uur vrijblijvend mee.
```
`#HRanalytics #PowerBI #Excel #DataStrategie`

## 4. Outreach-funnel (A4) — invelvelden `[trigger]` `[voornaam]` `[bedrijf]` uit ICP-lijst

**Stap 1 — connectieverzoek (kort, geen pitch):**
- Variant A (nieuwe HR-lead): "Hoi [voornaam], ik zag dat je sinds kort de HR-rol bij [bedrijf] hebt opgepakt — mooie stap. Ik werk veel met HR-teams rond data en rapportage en volg graag wat je deelt. Leuk om te connecten."
- Variant B (vacature HR-analist): "Hoi [voornaam], ik zag dat [bedrijf] een HR-analist zoekt. Ik help organisaties juist met de datakant van HR, dus ik volg dit soort ontwikkelingen met interesse. Leuk om te connecten."
- Variant C (algemeen): "Hoi [voornaam], we zitten allebei in de HR-data-hoek. Ik schrijf en bouw rond Power BI voor HR-teams en kom graag in contact met mensen die met dezelfde vraagstukken bezig zijn."

**Stap 2 — opvolg-DM (1-2 dagen ná acceptatie, één concreet probleem):**
"Bedankt voor het connecten, [voornaam]. Ik zal je niet lastigvallen met een verkooppraatje. Eén observatie: bij organisaties van jullie omvang zie ik vaak dat HR-data over losse bronnen verspreid staat — AFAS voor salaris, iets anders voor verzuim — en dat rapportage daardoor handwerk blijft. Plus dat de rechten op personeelsdata niet altijd waterdicht zijn (AVG). Herkenbaar bij [bedrijf], of hebben jullie dat al strak?"

**Stap 3 — bij interesse → wedge + boekingslink:**
"Goed om te horen. De snelste manier om er grip op te krijgen is een Quick Scan: in 1,5 dag breng ik je HR-data, rechtenmodel en knelpunten in kaart en krijg je een concreet beeld van wat er nodig is. Vaste prijs, geen verplichting daarna. Als het je wat lijkt kun je zo een moment prikken: https://cal.com/powerbistudio/quick-scan — of even bellen eerst? https://cal.com/powerbistudio/verkennend-gesprek"

**Stap 4 — zachte follow-up (na ~5-7 dagen geen reactie):**
"Hoi [voornaam], geen haast — ik laat het even bij je. Mocht HR-rapportage of de AVG-kant rond personeelsdata ooit op tafel komen, dan denk ik graag een keer vrijblijvend mee. Fijne week!"

**Funnel-regels:** nooit stap 2 direct ná acceptatie (wacht 1-2 dagen); max. 1 follow-up (stap 4); daarna loslaten en content het werk laten doen.

## 5. Open: het vragengesprek (om posts in JW's ÉCHTE stem te schrijven)

De 6 posts hierboven zijn op afstand geschreven. Om ze persoonlijk te maken, beantwoord deze 6 vragen kort (spreektaal):
1. Welke fout/aanname bij klanten irriteert je het meest rond HR-data?
2. Een concreet moment uit een project dat je is bijgebleven (mag anoniem)?
3. Wat is je stelligste mening over BI die anderen niet durven zeggen?
4. Welk woord/zin gebruik je vaak die typisch "jij" is?
5. Voor wie schrijf je — HR-directeur, controller, of allebei?
6. Wil je posts eindigen met een DM-uitnodiging, een linkje, of helemaal zacht?

→ Antwoorden in de nieuwe chat, dan worden de 6 posts herschreven in eigen stem + een voorraad opgebouwd.

## 6. Status van de rest (kort)

- **B1 (Cal.com boeking):** code af + gecommit/gepusht. Wacht op JW: `NEXT_PUBLIC_CAL_LINK=powerbistudio` in Vercel (alle 3 envs) + `.env.local`, daarna redeploy.
- **B2 (cases HR-refresh):** klaar in `src/lib/cases-data.ts` (Vattenfall bewust kwalitatief). Geverifieerd.
- **B3 (Quick Scan landingspagina):** bestaat (`src/app/quick-scan/page.tsx`).
- **A2 (ICP-lijst 30-50 accounts):** nog te bouwen door JW. Template-uitleg staat in het acquisitieplan.
