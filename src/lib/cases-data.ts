import type { CaseStudy } from '@/lib/types/sectors';

export const cases: CaseStudy[] = [
  {
    slug: 'ggdghor',
    client: 'GGDGHOR',
    sector: 'zorg',
    sectorLabel: 'Zorg & overheid',
    seoTitle: 'GGDGHOR — nationaal Power BI dataportaal voor 25 GGD-regio\'s en RIVM | PowerBIStudio.nl',
    seoDescription: 'Hoe wij voor 25 GGD-regio\'s en het RIVM één gedeeld Power BI datamodel bouwden met RLS-isolatie per regio. Lessen in multi-regio governance en publieke sector architectuur.',
    heroTitle: 'Één bron van waarheid voor alle gezondheidsdata in Nederland',
    heroSubtitle: 'Nationaal dataportaal in Power BI voor GGDGHOR — de koepelorganisatie van 25 GGD-regio\'s en het RIVM.',
    stats: [
      { value: '25', label: 'GGD-regio\'s' },
      { value: '1', label: 'Gedeeld datamodel' },
      { value: 'RIVM', label: 'Direct aangesloten' },
      { value: 'Realtime', label: 'Rapportage' },
    ],
    challenge: 'Elke GGD-regio rapporteerde apart. Er was geen landelijk overzicht. Het RIVM had geen directe toegang tot regionale data. Management werkte met Excel-exports die niet synchroon liepen. Beslissingen over volksgezondheid werden genomen op basis van versnipperde informatie.',
    approach: [
      'Centraal semantisch model in Power BI',
      'Row-level security per regio: elke GGD ziet alleen eigen data',
      'Gedeelde dataset voor RIVM-toegang op landelijk niveau',
      'Deployment pipeline voor gecontroleerde uitrol van updates',
      'Governance-structuur met data-eigenaarschap per regio',
    ],
    whatWeDidNot: 'We hebben bewust geen losse dashboards per regio gebouwd. Het alternatief — 25 individuele modellen — zou onderhoud onmogelijk hebben gemaakt. Eén centraal model met RLS was de enige schaalbare oplossing.',
    result: 'Eén bron van waarheid voor alle gezondheidsdata in Nederland. Rapportagetijd van uren naar realtime voor alle regio\'s.',
    resultHighlight: 'Rapportagetijd van uren naar realtime voor alle regio\'s',
    lessons: [
      'Multi-regio RLS moet je één keer goed ontwerpen — achteraf aanpassen kost maanden.',
      'Governance is belangrijker dan techniek: zonder data-eigenaarschap per regio werkt centralisatie niet.',
      'Deployment pipelines zijn geen luxe maar een vereiste in de publieke sector — elke wijziging moet controleerbaar zijn.',
    ],
    ctaText: 'Werkt jouw organisatie ook met meerdere locaties of regio\'s die elk eigen data hebben?',
    ctaHref: '/contact?type=publieke-sector',
    ctaType: 'publieke-sector',
  },
  {
    slug: 'technische-unie',
    client: 'Technische Unie',
    sector: 'data',
    sectorLabel: 'Groothandel',
    seoTitle: 'Technische Unie — afdelingsoverstijgend Power BI inzicht | PowerBIStudio.nl',
    seoDescription: 'Hoe wij voor Technische Unie een Power BI omgeving bouwden die sales, finance en voorraad verbindt. Handmatig rapportagewerk geëlimineerd.',
    heroTitle: 'Afdelingsoverstijgend inzicht over sales, finance en voorraad',
    heroSubtitle: 'Een Power BI omgeving die de silo\'s tussen afdelingen doorbreekt bij een van de grootste technische groothandels van Nederland.',
    stats: [
      { value: '3', label: 'Afdelingen verbonden' },
      { value: '0', label: 'Handmatige rapporten' },
      { value: '1', label: 'Geïntegreerd model' },
      { value: 'Dagelijks', label: 'Geautomatiseerde refresh' },
    ],
    challenge: 'Sales, finance en voorraad rapporteerden elk apart. Er was geen afdelingsoverstijgend inzicht. Management moest handmatig rapporten combineren om een compleet beeld te krijgen.',
    approach: [
      'Multi-app Power BI structuur met gedeelde datasets',
      'Integratie van sales-, finance- en voorraaddata in één semantisch model',
      'Geautomatiseerde data-refresh via deployment pipelines',
      'Role-based access voor verschillende afdelingen',
    ],
    result: 'Handmatig rapportagewerk volledig geëlimineerd. Management heeft nu dagelijks afdelingsoverstijgend inzicht.',
    resultHighlight: 'Handmatig rapportagewerk geëlimineerd',
    lessons: [
      'Begin met de business-vragen, niet met de databronnen — stakeholders denken in beslissingen, niet in tabellen.',
      'Een gedeeld semantisch model voorkomt dat elke afdeling zijn eigen waarheid bouwt.',
      'Automatisering van de refresh-cyclus is pas waardevol als de datakwaliteit geborgd is.',
    ],
    ctaText: 'Werken jouw afdelingen ook met losse rapporten die niet op elkaar aansluiten?',
    ctaHref: '/contact',
  },
  {
    slug: 'lyreco',
    client: 'Lyreco',
    sector: 'data',
    sectorLabel: 'Finance & operations',
    seoTitle: 'Lyreco — real-time finance dashboards voor Benelux management | PowerBIStudio.nl',
    seoDescription: 'Hoe wij voor Lyreco de wekelijkse rapportagecyclus automatiseerden en real-time finance dashboards bouwden voor het Benelux management team.',
    heroTitle: 'Real-time finance dashboards voor Benelux management',
    heroSubtitle: 'Power BI Studio leverde bij Lyreco interim data team lead-capaciteit (Jan Willem, oprichter). We bouwden niet alleen BI-oplossingen — we optimaliseerden het team en de processen eromheen.',
    stats: [
      { value: 'Benelux', label: 'Scope' },
      { value: 'Realtime', label: 'Finance inzicht' },
      { value: 'Interim', label: 'Data team lead' },
      { value: 'DMAIC', label: 'Methodiek toegepast' },
    ],
    challenge: 'Het management team kreeg wekelijks handmatig samengestelde financiële rapportages. De rapportagecyclus was traag en foutgevoelig. Er was geen real-time inzicht in financiële KPI\'s.',
    approach: [
      'Geautomatiseerde finance dashboards in Power BI',
      'Senior Management Team (SMT) rapportage gestroomlijnd',
      'DMAIC-methodiek toegepast op het BI-team zelf',
      'Backlog geprioriteerd op businessimpact',
      'Governance ingericht die na vertrek standhoudt',
    ],
    result: 'Wekelijkse rapportagecyclus volledig geautomatiseerd. Real-time financiële besluitvorming voor het Benelux management team.',
    resultHighlight: 'Wekelijkse rapportagecyclus geautomatiseerd',
    lessons: [
      'Een BI-team zonder procesfocus bouwt dashboards die niemand gebruikt.',
      'Prioritering op businessimpact — niet op technische complexiteit — bepaalt het succes van een data team.',
      'Governance die je na vertrek achterlaat, is het echte resultaat van een interim opdracht.',
    ],
    ctaText: 'Heeft jouw data team behoefte aan structuur, prioritering of interim leiderschap?',
    ctaHref: '/contact',
  },
  {
    slug: 'vattenfall',
    client: 'Vattenfall',
    sector: 'data',
    sectorLabel: 'Energie',
    seoTitle: 'Vattenfall — Power BI implementatie in een internationale energieorganisatie | PowerBIStudio.nl',
    seoDescription: 'Rapportageomgeving moderniseren bij Vattenfall. Power BI implementatie afdelingsoverstijgend, met aansluiting op bestaande Azure-infrastructuur.',
    heroTitle: 'Rapportageomgeving moderniseren in een internationale organisatie',
    heroSubtitle: 'Power BI implementatie bij een van de grootste energiebedrijven van Europa, met aansluiting op bestaande Azure-infrastructuur.',
    stats: [
      { value: 'EU', label: 'Internationale scope' },
      { value: 'Azure', label: 'Cloud-integratie' },
      { value: 'Multi', label: 'Afdelingen' },
      { value: 'Power BI', label: 'Gestandaardiseerd' },
    ],
    challenge: 'Rapportageomgeving moderniseren in een complexe, internationale organisatie. Meerdere afdelingen met verschillende datavereisten en bestaande Azure-infrastructuur.',
    approach: [
      'Power BI implementatie afdelingsoverstijgend',
      'Aansluiting op bestaande Azure-infrastructuur',
      'Standaardisatie van rapportageprocessen',
      'Governance en beheersstructuur ingericht',
    ],
    result: 'Gemoderniseerde rapportageomgeving met gestandaardiseerde Power BI-oplossingen die aansluiten op de Azure-infrastructuur.',
    resultHighlight: 'Rapportageomgeving gemoderniseerd naar Power BI',
    lessons: [
      'Bij internationale organisaties is stakeholdermanagement minstens zo belangrijk als de technische implementatie.',
      'Aansluiting op bestaande cloud-infrastructuur bespaart maanden aan migratie.',
      'Standaardisatie werkt alleen als het gedragen wordt door de afdelingen die het moeten gebruiken.',
    ],
    ctaText: 'Wil je jouw rapportageomgeving moderniseren?',
    ctaHref: '/contact',
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
