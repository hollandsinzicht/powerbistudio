import type { CaseStudy } from '@/lib/types/sectors';

export const cases: CaseStudy[] = [
  {
    slug: 'ggdghor',
    client: 'GGDGHOR',
    sector: 'zorg',
    sectorLabel: 'Zorg & overheid',
    seoTitle: 'GGDGHOR — één AVG-proof HR- en verzuimportaal voor 25 GGD-regio\'s | PowerBIStudio.nl',
    seoDescription: 'Van 25 losse datasets en tientallen losse rapportages naar één Power BI-portaal voor HR en verzuim, met row-level security per regio en aantoonbare AVG-borging.',
    heroTitle: 'Eén HR- en verzuimportaal voor 25 GGD-regio\'s — met RLS en AVG-borging',
    heroSubtitle: 'Voor GGDGHOR, de koepel van 25 GGD-regio\'s, bouwde ik één gedeeld dataplatform dat versnipperde HR- en verzuimdata samenbrengt zonder dat regio\'s elkaars personeelsdata kunnen zien.',
    stats: [
      { value: '25 → 1', label: 'Datasets naar portaal' },
      { value: '25', label: 'Regio\'s op RLS' },
      { value: 'AVG', label: 'Aantoonbaar proof' },
      { value: 'HR + verzuim', label: 'In één model' },
    ],
    challenge: 'Elke GGD-regio had eigen losse bronnen. In totaal draaiden er 25 aparte datasets en tientallen losse rapportages voor HR en verzuim — elk met een eigen definitie, eigen rechten en geen onderlinge aansluiting. Er was geen landelijk beeld, en bij gevoelige personeelsdata is een verkeerd ingestelde rechtenstructuur direct een AVG-risico.',
    approach: [
      'Eén centraal semantisch model voor HR en verzuim over alle regio\'s',
      'Row-level security per regio: elke GGD ziet uitsluitend de eigen personeelsdata',
      'AVG-borging ingebouwd in het model: gevoelige velden afgeschermd en herleidbaar',
      'Deployment pipeline voor gecontroleerde, controleerbare uitrol van updates',
      'Governance-structuur met data-eigenaarschap belegd per regio',
    ],
    whatWeDidNot: 'Ik heb bewust geen 25 losse modellen blijven onderhouden. Dat alternatief schaalt niet en maakt AVG-borging onmogelijk te bewijzen. Eén centraal model met strakke RLS per regio was de enige route die zowel beheersbaar als verdedigbaar is.',
    result: 'Van 25 losse datasets en tientallen losse rapportages naar één portaal voor HR en verzuim, met row-level security per regio en aantoonbare AVG-borging. Eén bron van waarheid voor alle 25 regio\'s.',
    resultHighlight: 'Van 25 losse datasets naar één AVG-proof HR-portaal',
    lessons: [
      'Multi-entiteit RLS moet je één keer goed ontwerpen — achteraf aanpassen op een live model kost maanden.',
      'Bij personeelsdata is AVG geen sluitstuk maar een ontwerpeis: borg het in het model, niet in een document achteraf.',
      'Governance is belangrijker dan techniek — zonder data-eigenaarschap per regio valt centralisatie weer uiteen.',
    ],
    ctaText: 'Werk jij ook met meerdere entiteiten of vestigingen die elk alleen hun eigen personeelsdata mogen zien? Een Quick Scan laat zien of jouw RLS en AVG-borging kloppen.',
    ctaHref: '/contact?type=quick-scan',
  },
  {
    slug: 'technische-unie',
    client: 'Technische Unie',
    sector: 'data',
    sectorLabel: 'Groothandel',
    seoTitle: 'Technische Unie — HR-data-architectuur en RLS op orde | PowerBIStudio.nl',
    seoDescription: 'Van geen row-level security en geen gestructureerde dataflow naar een uitgewerkte data-architectuur en de eerste semantische HR-modellen, met afgeschermde personeelsdata.',
    heroTitle: 'Van geen RLS naar een gecontroleerd HR-datamodel',
    heroSubtitle: 'Bij een van de grootste technische groothandels van Nederland bracht ik de data-architectuur in kaart en legde ik het fundament voor betrouwbare, afgeschermde HR-rapportage.',
    stats: [
      { value: 'Geen → RLS', label: 'Rechten op orde' },
      { value: '1', label: 'Architectuur in kaart' },
      { value: 'HR', label: 'Eerste semantisch model' },
      { value: 'Fundament', label: 'Voor opschaling' },
    ],
    challenge: 'Er was geen row-level security en geen gestructureerde dataflow. Personeelsdata was niet afgeschermd en stroomde niet betrouwbaar door naar rapportages. Voordat je überhaupt aan dashboards kunt denken, moet eerst de fundering kloppen — anders bouw je risico\'s in.',
    approach: [
      'Volledige data-architectuur in kaart gebracht: bronnen, stromen en knelpunten',
      'Row-level security ontworpen zodat personeelsdata per rol wordt afgeschermd',
      'Eerste semantische HR-modellen opgezet als betrouwbaar fundament',
      'Dataflow ingericht zodat rapportage voortbouwt op één gecontroleerde bron',
    ],
    result: 'De data-architectuur is in kaart gebracht en de eerste semantische HR-modellen staan, met row-level security die personeelsdata correct afschermt. Een gecontroleerd fundament om op verder te bouwen.',
    resultHighlight: 'Data-architectuur in kaart, eerste HR-modellen met RLS live',
    lessons: [
      'Zonder RLS is elk HR-dashboard een datalek-in-wording — het rechtenmodel komt eerst, niet de visuals.',
      'Een architectuur op papier voorkomt dat je gefragmenteerde modellen bouwt die later niet samenkomen.',
      'Het eerste semantische model bepaalt de definities voor alles erna — daar moet je tijd in steken.',
    ],
    ctaText: 'Weet je niet zeker of jouw HR-data goed is afgeschermd en gestructureerd? Een Quick Scan brengt de architectuur en RLS in kaart.',
    ctaHref: '/contact?type=quick-scan',
  },
  {
    slug: 'lyreco',
    client: 'Lyreco',
    sector: 'data',
    sectorLabel: 'Finance & operations',
    seoTitle: 'Lyreco — van Excel naar realtime: rapportagetijd van weken naar uren | PowerBIStudio.nl',
    seoDescription: 'Een compleet greenfield-traject: van geen enkele rapportage en alles handmatig in Excel naar een geautomatiseerd Power BI-model dat de rapportagetijd terugbracht van weken naar enkele uren.',
    heroTitle: 'Van Excel naar realtime: rapportagetijd van weken naar uren',
    heroSubtitle: 'Een compleet greenfield-traject bij Lyreco: er was geen enkele gestructureerde rapportage — alles werd handmatig in Excel gedaan. Ik bouwde het dataplatform van de grond af op.',
    stats: [
      { value: 'Weken → uren', label: 'Rapportagetijd' },
      { value: 'Greenfield', label: 'Van nul opgebouwd' },
      { value: 'Excel → BI', label: 'Handwerk vervangen' },
      { value: 'Direct', label: 'Inzicht beschikbaar' },
    ],
    challenge: 'Volledig greenfield: er was geen enkele gestructureerde rapportage. Alle cijfers werden handmatig in Excel samengesteld — traag, foutgevoelig en niet schaalbaar. Een nieuw inzicht kostte weken aan handwerk voordat het op tafel lag.',
    approach: [
      'Datamodel van de grond af opgebouwd op een solide semantische basis',
      'Handmatige Excel-processen vervangen door een geautomatiseerd Power BI-model',
      'Geautomatiseerde data-refresh zodat cijfers actueel zijn zonder handwerk',
      'Rapportage gestroomlijnd zodat besluitvormers direct inzicht hebben',
    ],
    result: 'De rapportagetijd ging van weken aan handmatig Excel-werk naar slechts enkele uren — en voor veel vragen direct inzicht. Een schaalbaar fundament in plaats van losse spreadsheets.',
    resultHighlight: 'Rapportagetijd van weken naar enkele uren',
    lessons: [
      'Bij greenfield bepaalt het eerste datamodel alles — investeer in de semantische laag voordat je dashboards bouwt.',
      'Excel is geen rapportageplatform: zodra je handwerk automatiseert, win je niet alleen tijd maar ook betrouwbaarheid.',
      'Snelheid van inzicht is een businessresultaat, geen technisch detail — weken versus uren verandert hoe een team beslist.',
    ],
    ctaText: 'Stel jij jouw HR-rapportage ook nog handmatig samen in Excel? Een Quick Scan laat zien wat een geautomatiseerd model je oplevert.',
    ctaHref: '/contact?type=quick-scan',
  },
  {
    slug: 'vattenfall',
    client: 'Vattenfall',
    sector: 'data',
    sectorLabel: 'Energie',
    seoTitle: 'Vattenfall — van handmatige Excel-rapportage naar een geautomatiseerd model | PowerBIStudio.nl',
    seoDescription: 'Handmatige Excel-rapportages vervangen door een geautomatiseerd Power BI-model bij een internationale energieorganisatie, met aansluiting op de bestaande Azure-infrastructuur en rapportage die zonder handwerk actueel blijft.',
    heroTitle: 'Van handmatige Excel-rapportage naar een geautomatiseerd model',
    heroSubtitle: 'Bij een van de grootste energiebedrijven van Europa verving ik handmatige, Excel-gedreven rapportage door een geautomatiseerd Power BI-model bovenop de bestaande Azure-infrastructuur.',
    stats: [
      { value: 'Excel → BI', label: 'Handwerk vervangen' },
      { value: 'Geautomatiseerd', label: 'Refresh i.p.v. handwerk' },
      { value: 'Azure', label: 'Cloud-integratie' },
      { value: 'EU', label: 'Internationale scope' },
    ],
    challenge: 'Net als in veel grote organisaties werd de rapportage handmatig in Excel samengesteld: traag, foutgevoelig en afhankelijk van een paar mensen. In een complexe, internationale omgeving met bestaande Azure-infrastructuur was dat niet langer houdbaar.',
    approach: [
      'Handmatige Excel-rapportages vervangen door een geautomatiseerd Power BI-model',
      'Aangesloten op de bestaande Azure-infrastructuur in plaats van een parallel spoor',
      'Geautomatiseerde refresh zodat rapportage actueel blijft zonder handwerk',
      'Rapportageprocessen gestandaardiseerd en governance ingericht',
    ],
    result: 'Handmatig Excel-werk vervangen door een geautomatiseerd model op de bestaande Azure-infrastructuur, waarmee rapportage zonder handwerk actueel blijft en niet langer afhankelijk is van een paar mensen.',
    resultHighlight: 'Excel-handwerk vervangen door een geautomatiseerd Azure-model',
    lessons: [
      'Sluit aan op de bestaande cloud-infrastructuur — een parallel spoor kost maanden extra migratie.',
      'Handmatige Excel-rapportage is een afhankelijkheid van mensen; automatisering maakt het proces robuust.',
      'Standaardisatie werkt alleen als de afdelingen die ermee werken het ook dragen.',
    ],
    ctaText: 'Draait jouw HR-rapportage ook op handmatige Excel-bestanden? Een Quick Scan laat zien hoe je dat automatiseert.',
    ctaHref: '/contact?type=quick-scan',
  },
];

export function getCaseBySlug(slug: string): CaseStudy | undefined {
  return cases.find((c) => c.slug === slug);
}

export function getAllCaseSlugs(): string[] {
  return cases.map((c) => c.slug);
}

export function getCasesBySector(sector: string): CaseStudy[] {
  if (sector === 'alle') return cases;
  return cases.filter((c) => c.sector === sector);
}
