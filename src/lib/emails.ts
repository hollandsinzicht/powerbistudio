const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = 'PowerBIStudio <noreply@powerbistudio.nl>'
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://powerbistudio.nl'

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`)
    console.log(html)
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const errorData = await res.json()
    console.error('Resend error:', errorData)
    throw new Error(`Email failed: ${JSON.stringify(errorData)}`)
  }
}

export async function sendUploadConfirmationEmail(params: {
  email: string
  auditId: string
  fileName: string
}) {
  const statusUrl = `${BASE_URL}/tools/report-auditor/status/${params.auditId}`

  await sendEmail(
    params.email,
    `Audit gestart — ${params.fileName}`,
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <h2 style="color: #1E3A5F;">Je Power BI rapport audit is gestart</h2>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px 0; color: #6B7280;">Audit-ID:</td><td style="padding: 8px 0; font-family: monospace; font-weight: bold;">${params.auditId}</td></tr>
        <tr><td style="padding: 8px 0; color: #6B7280;">Bestand:</td><td style="padding: 8px 0;">${params.fileName}</td></tr>
      </table>

      <p><a href="${statusUrl}" style="display: inline-block; background: #1E3A5F; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Bekijk status</a></p>

      <p style="color: #6B7280; font-size: 14px; margin-top: 24px;">
        Je originele bestand wordt direct na het extraheren van de modelstructuur vernietigd.
        Je ontvangt een cryptografisch bewijs hiervan.
      </p>

      <p style="color: #6B7280; font-size: 14px;">Je rapport verwachten wij binnen 5 minuten.</p>

      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
      <p style="color: #9CA3AF; font-size: 12px;">PowerBIStudio.nl — Power BI & AI Specialist</p>
    </div>
    `
  )
}

export async function sendReportReadyEmail(params: {
  email: string
  auditId: string
  pdfUrl: string
  expiresAt: string
  originalHash: string
  originalDestroyedAt: string
  metadataHash: string
  metadataDestroyedAt: string
  verificationCode: string
}) {
  const verifyUrl = `${BASE_URL}/tools/report-auditor#verificeer`

  await sendEmail(
    params.email,
    `Je audit rapport is klaar — ${params.auditId}`,
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <h2 style="color: #1E3A5F;">Je Power BI rapport audit is voltooid</h2>

      <p><a href="${params.pdfUrl}" style="display: inline-block; background: #1E3A5F; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Download rapport</a></p>

      <p style="color: #6B7280; font-size: 13px;">Geldig tot ${params.expiresAt}</p>

      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #1E3A5F;">Vernietigingsbewijs</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #6B7280;">Origineel bestand:</td>
            <td style="padding: 6px 0; font-family: monospace; font-size: 11px; color: #9CA3AF;">${params.originalHash}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6B7280;">Vernietigd op:</td>
            <td style="padding: 6px 0;">${params.originalDestroyedAt}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6B7280;">Metadata:</td>
            <td style="padding: 6px 0; font-family: monospace; font-size: 11px; color: #9CA3AF;">${params.metadataHash}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6B7280;">Vernietigd op:</td>
            <td style="padding: 6px 0;">${params.metadataDestroyedAt}</td>
          </tr>
        </table>
      </div>

      <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px;"><strong>Verificatiecode:</strong> <code style="background: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${params.verificationCode}</code></p>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #6B7280;">Verifieer publiek: <a href="${verifyUrl}">${verifyUrl}</a></p>
      </div>

      <p style="color: #6B7280; font-size: 14px;">
        Je rapport is beschikbaar tot ${params.expiresAt}. Daarna wordt het automatisch van onze servers verwijderd.
      </p>

      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
      <p style="color: #9CA3AF; font-size: 12px;">PowerBIStudio.nl — Power BI & AI Specialist</p>
    </div>
    `
  )
}

// ===== LEAD GENERATION EMAILS =====

export async function sendLeadConfirmationEmail(params: {
  email: string
  name?: string
  downloadUrl?: string
  resourceTitle: string
}) {
  await sendEmail(
    params.email,
    `Je download: ${params.resourceTitle}`,
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <h2 style="color: #1E3A5F;">Bedankt${params.name ? `, ${params.name}` : ''}!</h2>
      <p>Je hebt <strong>${params.resourceTitle}</strong> aangevraagd.</p>
      ${params.downloadUrl ? `
      <p><a href="${params.downloadUrl}" style="display: inline-block; background: #1E3A5F; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Download nu</a></p>
      ` : '<p>Je ontvangt je download binnenkort per e-mail.</p>'}
      <p style="color: #6B7280; font-size: 14px; margin-top: 24px;">
        In de komende weken ontvang je een aantal verdiepende inzichten die aansluiten bij dit onderwerp. Je kunt je op elk moment uitschrijven.
      </p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
      <p style="color: #9CA3AF; font-size: 12px;">Jan Willem den Hollander — PowerBIStudio.nl</p>
    </div>
    `
  )
}

export async function sendCalculatorResultEmail(params: {
  email: string
  name?: string
  monthlyCost: number
  recommendation: string
}) {
  const formattedCost = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(params.monthlyCost)
  await sendEmail(
    params.email,
    `Je BI-kostenberekening: ${formattedCost} per maand`,
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <h2 style="color: #1E3A5F;">Je BI-kostenberekening</h2>
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px; margin: 20px 0; text-align: center;">
        <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px 0;">Geschatte maandelijkse kosten van slechte data</p>
        <p style="font-size: 36px; font-weight: bold; color: #1E3A5F; margin: 0;">${formattedCost}</p>
        <p style="color: #6B7280; font-size: 14px; margin: 8px 0 0 0;">per maand</p>
      </div>
      <p><strong>Aanbeveling:</strong> ${params.recommendation}</p>
      <p style="margin-top: 24px;">
        <a href="${BASE_URL}/contact?type=procesverbetering" style="display: inline-block; background: #1E3A5F; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Plan een procesverbeterings-intake</a>
      </p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
      <p style="color: #9CA3AF; font-size: 12px;">Jan Willem den Hollander — PowerBIStudio.nl</p>
    </div>
    `
  )
}

export async function sendNurtureEmail(params: {
  email: string
  subject: string
  bodyHtml: string
  unsubscribeUrl: string
}) {
  const html = params.bodyHtml.replace(/\{\{unsubscribe_url\}\}/g, params.unsubscribeUrl)
  await sendEmail(params.email, params.subject, html)
}

export async function sendReportDeletedEmail(params: {
  email: string
  auditId: string
}) {
  await sendEmail(
    params.email,
    `Audit rapport verwijderd — ${params.auditId}`,
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <h2 style="color: #1E3A5F;">Audit rapport verwijderd</h2>

      <p>Je audit rapport (<strong>${params.auditId}</strong>) is conform ons privacybeleid verwijderd van onze servers.</p>

      <p>Bewaar je lokale kopie van het rapport.</p>

      <p style="color: #6B7280; font-size: 14px;">
        Het vernietigingsbewijs blijft publiek verifieerbaar via je verificatiecode.
      </p>

      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
      <p style="color: #9CA3AF; font-size: 12px;">PowerBIStudio.nl — Power BI & AI Specialist</p>
    </div>
    `
  )
}
