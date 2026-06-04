import { supabase } from './supabase'
import type { LeadVertical } from './lead-store'

/**
 * Verticals waarvoor een nurture-sequence bestaat. Sinds de HR-rebrand
 * (2026) is dit uitsluitend de 'hr'-flow.
 */
export type NurtureVertical = 'hr'

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
  // HR-flow (sinds 2026): voor leads die de AVG-checklist HR hebben
  // gedownload of via de HR Readiness Scan zijn binnengekomen. Vijf
  // mails over 18 dagen — checklist-levering, twee inhoudelijke duikjes
  // (RLS + historiek), één transferbare case-les, en een soft CTA naar
  // Quick Scan / DashPortal HR. Geen sales-pitch, wel concrete waarde
  // per mail. Kleurpalet: groen/teal (#0F766E, #14B8A6) matchend met
  // de HR-rebrand.
  'hr': [
    {
      sequenceNumber: 0, delayDays: 0,
      subject: 'Je AVG-checklist HR — direct downloaden',
      bodyHtml: emailWrapper(`
        <h2 style="color: #0F766E;">Bedankt voor het opvragen van de checklist</h2>
        <p>De PDF staat klaar — twaalf concrete controlepunten voor je HR Power BI-model. Niet de AVG-theorie, wel de specifieke fouten die ik in audits tegenkom.</p>
        <p><a href="${BASE_URL}/downloads/avg-checklist-hr.pdf" style="display: inline-block; background: #0F766E; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Download de checklist (PDF) →</a></p>
        <p>De komende weken stuur ik je vier korte mails over de punten waar het vaakst iets misgaat. Geen verkooppraatje — je kunt op elk moment uitschrijven onderaan elke mail.</p>
        <p style="color: #6B7280; font-size: 14px;">Jan Willem den Hollander — HR analytics-specialist, Lean Six Sigma Black Belt</p>
      `),
    },
    {
      sequenceNumber: 1, delayDays: 3,
      subject: 'RLS in HR Power BI: één fout, alle managers zien alles',
      bodyHtml: emailWrapper(`
        <h2 style="color: #0F766E;">Het meest voorkomende AVG-lek bij HR-rapportage</h2>
        <p>Negen van de tien keer staat row-level security bij HR-data verkeerd ingericht: gekoppeld aan e-mailadres of een handmatige user-mapping in een Excel-tabel. Werkt prima — tot iemand van team wisselt.</p>
        <p>Dan blijft die persoon óf data zien die niet meer van hem is, óf valt hij eruit omdat zijn naam veranderd is. Beide zijn AVG-issues.</p>
        <p>De oplossing: hiërarchische RLS gekoppeld aan de actuele organisatie-hiërarchie uit AFAS, Visma of Nmbrs — automatisch, met type-2 historiek voor retroactieve correctheid. Geen Excel-mapping meer.</p>
        <p style="background: #F0FDFA; border-left: 3px solid #0F766E; padding: 12px 16px; margin: 16px 0;">
          <strong style="color: #0F766E;">Bonus voor checklist-downloaders</strong><br />
          Ik heb drie DAX-measures opgeschreven die deze RLS-aanpak concreet maken (plus verzuim met peildatum en formatie-realisatie). Niet publiek te vinden, alleen via deze link:<br />
          <a href="${BASE_URL}/templates/dax-hr" style="color: #0F766E; font-weight: 500;">Bekijk de DAX-templates →</a>
        </p>
        <p><a href="${BASE_URL}/methodiek" style="color: #0F766E; font-weight: 500;">Of lees hoe ik dit in de praktijk inricht →</a></p>
      `),
    },
    {
      sequenceNumber: 2, delayDays: 7,
      subject: 'Klopt je verzuim-cijfer van twee jaar terug nog?',
      bodyHtml: emailWrapper(`
        <h2 style="color: #0F766E;">De verborgen rapportagefout: ontbrekende historiek</h2>
        <p>Een reorganisatie verandert je hele HR-historie zonder dat iemand het merkt. Afdeling A wordt opgeknipt in A1 en A2, de medewerker-tabel wordt overschreven, en je verzuim-percentage van vorig jaar staat ineens 30% hoger of lager.</p>
        <p>Klopt het dan wat er stond? Of klopt het nu? Allebei niet — want zonder type-2 historiek (SCD2) ken je het verleden niet meer.</p>
        <p>Dit is geen schoonheidsfoutje. HR-managers nemen jaarlijks beslissingen op basis van trends. Als die trends elke maand stilletjes veranderen, sturen ze op ruis.</p>
        <p>Het patroon dat wel werkt: peildatum-logica in het semantisch model. De vraag "hoeveel FTE hadden we per 1 januari" geeft altijd hetzelfde antwoord, ongeacht latere mutaties.</p>
        <p><a href="${BASE_URL}/tools/readiness-scan" style="color: #0F766E; font-weight: 500;">Check je eigen historiek-aanpak in de Readiness Scan →</a></p>
      `),
    },
    {
      sequenceNumber: 3, delayDays: 12,
      subject: 'Wat ik leerde bij 25 GGD-regio\'s over gevoelige data',
      bodyHtml: emailWrapper(`
        <h2 style="color: #0F766E;">Multi-tenant RLS — een patroon dat ook voor HR werkt</h2>
        <p>Bij GGDGHOR bouwde ik een centraal datamodel voor 25 regio's plus het RIVM. Elk regio mag alleen eigen data zien; RIVM ziet het landelijk overzicht. Eén model, niet 25.</p>
        <p>Dat is precies het patroon dat HR-organisaties met meerdere vestigingen, BV's of landen nodig hebben. De manager van team A ziet team A. De HR-controller van BV X ziet BV X. De DPO ziet het volledige verwerkingsregister.</p>
        <p>De truc zit niet in de techniek (RLS is een Power BI-feature) maar in het ontwerp: één hiërarchie-tabel met type-2 historiek, en RLS-rollen die daar dynamisch op aansluiten.</p>
        <p>De alternatieven — losse rapporten per locatie, of één rapport waar iedereen alles ziet — zijn beide AVG-risico's. De eerste is onbeheersbaar, de tweede onverdedigbaar.</p>
        <p><a href="${BASE_URL}/cases/ggdghor" style="color: #0F766E; font-weight: 500;">Lees de GGDGHOR-case →</a></p>
      `),
    },
    {
      sequenceNumber: 4, delayDays: 18,
      subject: 'Een korte vraag — en drie routes als je verder wilt',
      bodyHtml: emailWrapper(`
        <h2 style="color: #0F766E;">Liever niet via een formulier?</h2>
        <p>Je hebt deze mailserie nu doorgenomen. Voor ik je drie routes laat zien: stuur deze mail terug met één regel over je situatie — bijvoorbeeld "we werken met AFAS, 800 FTE, AVG-audit komt eraan" — dan bel ik je deze week voor 15 minuten. Geen pitch, wel een eerlijk antwoord op wat voor jou de logische eerste stap is.</p>
        <p style="color: #6B7280; font-size: 14px;">Reageren kan gewoon op deze mail. Komt direct bij mij binnen.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
        <h2 style="color: #0F766E;">De drie routes</h2>
        <p>Liever zelf de scope kiezen? Drie pakketten waarmee je aan de slag kunt:</p>
        <ul style="line-height: 1.7;">
          <li><strong>HR Analytics Quick Scan</strong> — €1.950 vast. Anderhalve dag waarin ik je HR-model audit op de 12 punten met concrete actielijst.</li>
          <li><strong>HR Analytics Foundation</strong> — €34.500 vast. Volledig opnieuw bouwen volgens bron-zilver-goud-semantisch, AVG-by-design, RLS op hiërarchie, type-2 historiek, drie standaard-dashboards.</li>
          <li><strong>DashPortal HR</strong> — vanaf €1.250/maand. Doorlopende managed hosting voor je HR-dashboards met AVG-monitoring en refresh-bewaking.</li>
        </ul>
        <p><a href="${BASE_URL}/contact?type=quick-scan" style="display: inline-block; background: #0F766E; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Plan een Quick Scan →</a></p>
        <p style="background: #F0FDFA; border-left: 3px solid #0F766E; padding: 12px 16px; margin: 20px 0; font-size: 14px;">
          <strong style="color: #0F766E;">Nog even bekeken?</strong> De drie DAX-templates die ik je eerder stuurde staan hier:
          <a href="${BASE_URL}/templates/dax-hr" style="color: #0F766E; font-weight: 500;">DAX-templates voor HR Power BI</a>.
        </p>
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
