import { supabase } from './supabase'
import type { LeadVertical } from './lead-store'

/**
 * Verticals waarvoor een nurture-sequence bestaat. Een Lead kan ook
 * verticals hebben waarvoor (nog) geen sequence is gedefinieerd
 * (bijv. 'hr' — HR-flow staat op de roadmap). Voor die leads slaat
 * de cron-job het verzenden over.
 */
export type NurtureVertical = 'beslissers' | 'publieke-sector' | 'isv' | 'vakgenoot'

export interface NurtureEmailDef {
  sequenceNumber: number
  subject: string
  delayDays: number
  bodyHtml: string
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://powerbistudio.nl'

const emailWrapper = (content: string) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
  ${content}
  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
  <p style="color: #9CA3AF; font-size: 12px;">
    PowerBIStudio.nl — Jan Willem den Hollander<br />
    <a href="{{unsubscribe_url}}" style="color: #9CA3AF;">Uitschrijven</a>
  </p>
</div>`

export const NURTURE_SEQUENCES: Partial<Record<LeadVertical, NurtureEmailDef[]>> = {
  'beslissers': [
    {
      sequenceNumber: 0, delayDays: 0,
      subject: 'Je BI-kostenberekening — en wat je ermee kunt doen',
      bodyHtml: emailWrapper(`
        <h2 style="color: #1E3A5F;">Bedankt voor je berekening</h2>
        <p>Je hebt net berekend wat slechte data jouw organisatie kost. Dat bedrag is geen schatting — het is de realiteit die de meeste CFO's en COO's niet zien omdat het verspreid zit over afdelingen.</p>
        <p>In de komende twee weken deel ik concrete inzichten over hoe organisaties als Lyreco dit probleem hebben opgelost.</p>
        <p style="color: #6B7280; font-size: 14px;">Jan Willem den Hollander — Power BI architect, LSS Black Belt</p>
      `),
    },
    {
      sequenceNumber: 1, delayDays: 2,
      subject: 'Hoe Lyreco hun rapportagecyclus automatiseerde',
      bodyHtml: emailWrapper(`
        <h2 style="color: #1E3A5F;">Case: Lyreco Benelux</h2>
        <p>Bij Lyreco was de wekelijkse financiële rapportage een handmatig proces. Het management team wachtte dagenlang op cijfers die al verouderd waren.</p>
        <p>Met een DMAIC-aanpak (Lean Six Sigma) en Power BI hebben we dat geautomatiseerd. Het resultaat: real-time inzicht, nul handmatig werk.</p>
        <p><a href="${BASE_URL}/cases/lyreco" style="color: #1E3A5F; font-weight: 500;">Lees de volledige case →</a></p>
      `),
    },
    {
      sequenceNumber: 2, delayDays: 5,
      subject: 'De vraag die ik altijd stel aan een CFO',
      bodyHtml: emailWrapper(`
        <h2 style="color: #1E3A5F;">Niet "hoe ziet het dashboard eruit?"</h2>
        <p>De vraag die ik stel is: "Welk besluit moet sneller worden genomen, en wat kost het als dat nu misgaat?"</p>
        <p>Dat is het verschil tussen een dashboard-klus en een procesverbeteringsproject. Als LSS Black Belt kijk ik naar data als middel, niet als doel.</p>
        <p><a href="${BASE_URL}/procesverbetering" style="color: #1E3A5F; font-weight: 500;">Meer over de Lean-aanpak →</a></p>
      `),
    },
    {
      sequenceNumber: 3, delayDays: 9,
      subject: 'Fabric migratie: wat CFO\'s moeten weten',
      bodyHtml: emailWrapper(`
        <h2 style="color: #1E3A5F;">Microsoft stopt met Power BI Premium</h2>
        <p>De overgang naar Fabric heeft directe impact op je licentiekosten. Veel organisaties ontdekken dat te laat.</p>
        <p>Een Fabric QuickScan (€1.500 vast) geeft je helderheid: scope, planning en licentieadvies in 3-5 werkdagen.</p>
        <p><a href="${BASE_URL}/fabric-migratie" style="color: #1E3A5F; font-weight: 500;">Meer over Fabric migratie →</a></p>
      `),
    },
    {
      sequenceNumber: 4, delayDays: 14,
      subject: 'Laten we bespreken wat de volgende stap is',
      bodyHtml: emailWrapper(`
        <h2 style="color: #1E3A5F;">Twee weken geleden berekende je de kosten</h2>
        <p>Sindsdien heb ik je laten zien hoe andere organisaties dit probleem hebben opgelost. De vraag is: wat is jouw volgende stap?</p>
        <p>Ik bied twee concrete instappen:</p>
        <ul>
          <li><strong>Procesverbeterings-intake</strong> — gratis gesprek van 30 minuten</li>
          <li><strong>Fabric QuickScan</strong> — €1.500 vast, rapport in 3-5 dagen</li>
        </ul>
        <p><a href="${BASE_URL}/contact?type=procesverbetering" style="display: inline-block; background: #1E3A5F; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Plan een gesprek →</a></p>
      `),
    },
  ],

  'publieke-sector': [
    {
      sequenceNumber: 0, delayDays: 0,
      subject: 'Je BI-checklist voor de publieke sector — download',
      bodyHtml: emailWrapper(`
        <h2 style="color: #0F6E56;">Bedankt voor je download</h2>
        <p>De BI-checklist bevat 12 vragen die elke gemeente of GGD moet stellen vóór een BI-aanbesteding. Van AVG tot governance, van RLS tot overdracht.</p>
        <p>In de komende weken deel ik meer inzichten uit mijn ervaring met publieke sector BI-projecten — waaronder het GGDGHOR dataportaal voor 25 GGD-regio's.</p>
      `),
    },
    {
      sequenceNumber: 1, delayDays: 3,
      subject: 'Hoe 25 GGD-regio\'s één bron van waarheid kregen',
      bodyHtml: emailWrapper(`
        <h2 style="color: #0F6E56;">Case: GGDGHOR + RIVM</h2>
        <p>Elke GGD-regio rapporteerde apart. Het RIVM had geen direct inzicht. We bouwden één centraal datamodel met RLS-isolatie per regio.</p>
        <p><a href="${BASE_URL}/cases/ggdghor" style="color: #0F6E56; font-weight: 500;">Lees de volledige case →</a></p>
      `),
    },
    {
      sequenceNumber: 2, delayDays: 7,
      subject: 'AVG en Power BI: 3 fouten die gemeenten maken',
      bodyHtml: emailWrapper(`
        <h2 style="color: #0F6E56;">Privacy by design is geen optie</h2>
        <p>De drie meest voorkomende AVG-fouten bij publieke sector BI-projecten:</p>
        <ol><li>RLS niet op persoonsniveau maar op afdelingsniveau</li><li>Geen logging van wie welke data bekijkt</li><li>Datamodel niet gedocumenteerd voor audit</li></ol>
        <p><a href="${BASE_URL}/publieke-sector" style="color: #0F6E56; font-weight: 500;">Meer over publieke sector aanpak →</a></p>
      `),
    },
    {
      sequenceNumber: 3, delayDays: 12,
      subject: 'Governance die na de consultant standhoudt',
      bodyHtml: emailWrapper(`
        <h2 style="color: #0F6E56;">Het echte resultaat van een BI-project</h2>
        <p>De meeste BI-consultants bouwen dashboards en vertrekken. Ik richt governance in die standhoudt: deployment pipelines, data-eigenaarschap, overdrachtsprotocollen.</p>
        <p>Dat is wat de publieke sector nodig heeft — en wat ik standaard oplever.</p>
      `),
    },
    {
      sequenceNumber: 4, delayDays: 18,
      subject: 'Een referentiegesprek over het GGDGHOR-project?',
      bodyHtml: emailWrapper(`
        <h2 style="color: #0F6E56;">Benieuwd hoe dit in de praktijk werkt?</h2>
        <p>Ik bied een vrijblijvend referentiegesprek aan waarin ik de GGDGHOR-aanpak toelicht. Geen sales-pitch, maar een inhoudelijk gesprek over architectuur en governance.</p>
        <p><a href="${BASE_URL}/contact?type=publieke-sector" style="display: inline-block; background: #0F6E56; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Plan een referentiegesprek →</a></p>
      `),
    },
  ],

  'isv': [
    {
      sequenceNumber: 0, delayDays: 0,
      subject: 'Je ISV architectuurgids — 5 beslissingen vóór dag 1',
      bodyHtml: emailWrapper(`
        <h2 style="color: #534AB7;">Bedankt voor je download</h2>
        <p>De gids bevat de 5 architectuurbeslissingen die je vóór dag 1 moet nemen bij embedded Power BI: SKU-keuze, workspace-patroon, RLS-strategie, Copilot-implicaties en kosteninschatting.</p>
        <p>In de komende twee weken deel ik meer over embedded analytics architectuur.</p>
      `),
    },
    {
      sequenceNumber: 1, delayDays: 2,
      subject: 'DashPortal: embedded analytics zonder zelf te bouwen',
      bodyHtml: emailWrapper(`
        <h2 style="color: #534AB7;">De snelste route naar embedded analytics</h2>
        <p>DashPortal geeft je direct een white-label embedded portal. Per klant apart, eigen branding, geen Microsoft-licentie voor eindgebruikers. Live in minder dan 10 minuten.</p>
        <p><a href="${BASE_URL}/dashportal" style="color: #534AB7; font-weight: 500;">Bekijk DashPortal →</a></p>
      `),
    },
    {
      sequenceNumber: 2, delayDays: 5,
      subject: 'A-SKU vs F-SKU: het kostenverschil kan factor 10 zijn',
      bodyHtml: emailWrapper(`
        <h2 style="color: #534AB7;">De duurste fout bij embedded Power BI</h2>
        <p>De meeste ISVs kiezen de verkeerde SKU. Het verschil tussen A-SKU, P-SKU en F-SKU is niet alleen technisch — het is een kostenverschil van factor 10.</p>
        <p><a href="${BASE_URL}/saas" style="color: #534AB7; font-weight: 500;">Meer over ISV architectuur →</a></p>
      `),
    },
    {
      sequenceNumber: 3, delayDays: 9,
      subject: 'Multi-tenant RLS: één fout = data-lek',
      bodyHtml: emailWrapper(`
        <h2 style="color: #534AB7;">Row-Level Security voor ISVs</h2>
        <p>Bij multi-tenant embedded analytics is RLS geen nice-to-have. Eén fout betekent dat klant A de data van klant B ziet. Dit moet vanaf dag 1 goed staan.</p>
        <p>Ik ontwerp de architectuur die dat voorkomt — en test die vóór de eerste klant live gaat.</p>
      `),
    },
    {
      sequenceNumber: 4, delayDays: 13,
      subject: 'Gratis architectuurreview voor jouw embedded setup',
      bodyHtml: emailWrapper(`
        <h2 style="color: #534AB7;">Laten we jouw architectuur bespreken</h2>
        <p>Twee routes:</p>
        <ul>
          <li><strong>DashPortal trial</strong> — direct starten, geen technische kennis vereist</li>
          <li><strong>Architectuurreview</strong> — ik beoordeel je huidige of geplande opzet</li>
        </ul>
        <p><a href="${BASE_URL}/contact?type=saas" style="display: inline-block; background: #534AB7; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Plan een review →</a></p>
      `),
    },
  ],

  'vakgenoot': [
    {
      sequenceNumber: 0, delayDays: 0,
      subject: 'De 10 meest voorkomende DAX-fouten — je download',
      bodyHtml: emailWrapper(`
        <h2 style="color: #1E3A5F;">Bedankt voor je download</h2>
        <p>Deze 10 fouten zie ik in bijna elk productie-model dat ik audit. Van verkeerde CALCULATE-filters tot onnodige DISTINCTCOUNT op grote tabellen.</p>
        <p>In de komende weken deel ik meer technische inzichten.</p>
      `),
    },
    {
      sequenceNumber: 1, delayDays: 3,
      subject: 'Hoe deel je dashboards met klanten die geen Power BI kennen?',
      bodyHtml: emailWrapper(`
        <h2 style="color: #1E3A5F;">Het klantdeling-probleem</h2>
        <p>Je bouwt mooie dashboards. Maar je klant begrijpt niet waarom hij een Microsoft-account nodig heeft om ze te bekijken. Herkenbaar?</p>
        <p>DashPortal lost dit op: branded portal, eigen domein, geen MS-licentie voor eindgebruikers.</p>
        <p><a href="${BASE_URL}/dashportal" style="color: #1E3A5F; font-weight: 500;">Bekijk DashPortal →</a></p>
      `),
    },
    {
      sequenceNumber: 2, delayDays: 7,
      subject: 'Report Auditor: AI-audit van je datamodel voor €49',
      bodyHtml: emailWrapper(`
        <h2 style="color: #1E3A5F;">Sneller dan een consultant een offerte schrijft</h2>
        <p>Upload je .pbix. AI analyseert je datamodel op 5 kwaliteitscategorieën en geeft je een actielijst. Privacy-first — bestand vernietigd na analyse.</p>
        <p><a href="${BASE_URL}/tools/report-auditor" style="color: #1E3A5F; font-weight: 500;">Probeer de Report Auditor →</a></p>
      `),
    },
    {
      sequenceNumber: 3, delayDays: 11,
      subject: 'Is Copilot de toekomst van Power BI consulting?',
      bodyHtml: emailWrapper(`
        <h2 style="color: #1E3A5F;">Copilot verandert de markt</h2>
        <p>Copilot in Power BI is beschikbaar. Maar de meeste modellen zijn er niet op gebouwd. Dat is een kans voor consultants die weten hoe ze een model Copilot-klaar maken.</p>
        <p><a href="${BASE_URL}/copilot-readiness" style="color: #1E3A5F; font-weight: 500;">Meer over Copilot readiness →</a></p>
      `),
    },
    {
      sequenceNumber: 4, delayDays: 15,
      subject: 'DashPortal agency-programma: deel dashboards namens jouw klant',
      bodyHtml: emailWrapper(`
        <h2 style="color: #1E3A5F;">Bied DashPortal aan als onderdeel van jouw dienstverlening</h2>
        <p>Als consultant of BI-bureau kun je DashPortal doorverkopen aan je klanten. Eigen pricing, eigen klantrelatie. Wij regelen de techniek.</p>
        <p><a href="${BASE_URL}/dashportal#isv-gebruik" style="display: inline-block; background: #1E3A5F; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Start een gratis trial →</a></p>
      `),
    },
  ],
}

/** Seed alle nurture emails naar de Supabase nurture_emails tabel */
export async function seedNurtureEmails() {
  for (const [vertical, emails] of Object.entries(NURTURE_SEQUENCES)) {
    for (const email of emails) {
      const { error } = await supabase.from('nurture_emails').upsert(
        {
          vertical,
          sequence_number: email.sequenceNumber,
          subject: email.subject,
          body_html: email.bodyHtml,
          delay_days: email.delayDays,
        },
        { onConflict: 'vertical,sequence_number' }
      )
      if (error) console.error(`Failed to seed ${vertical}/${email.sequenceNumber}:`, error.message)
    }
  }
}
