/**
 * Inter font loader voor next/og (satori).
 *
 * Fetcht Inter Regular en Bold van de auteur's CDN (rsms.me/inter).
 * Cached op module-niveau zodat elke serverless function instance de fonts
 * maar 1x hoeft te laden (niet per request).
 *
 * OTF formaat wordt ondersteund door satori; WOFF2 niet.
 */

let cachedRegular: ArrayBuffer | null = null
let cachedBold: ArrayBuffer | null = null

const INTER_REGULAR_URL = 'https://rsms.me/inter/font-files/Inter-Regular.otf?v=4.0'
const INTER_BOLD_URL = 'https://rsms.me/inter/font-files/Inter-Bold.otf?v=4.0'

export interface LoadedFonts {
  regular: ArrayBuffer
  bold: ArrayBuffer
}

export async function loadInterFonts(): Promise<LoadedFonts> {
  if (cachedRegular && cachedBold) {
    return { regular: cachedRegular, bold: cachedBold }
  }

  const [regular, bold] = await Promise.all([
    fetch(INTER_REGULAR_URL).then((r) => {
      if (!r.ok) throw new Error(`Inter Regular fetch failed: ${r.status}`)
      return r.arrayBuffer()
    }),
    fetch(INTER_BOLD_URL).then((r) => {
      if (!r.ok) throw new Error(`Inter Bold fetch failed: ${r.status}`)
      return r.arrayBuffer()
    }),
  ])

  cachedRegular = regular
  cachedBold = bold

  return { regular, bold }
}
