import fs from 'fs/promises'
import path from 'path'

/**
 * Inter font loader voor next/og (satori).
 *
 * Leest Inter Regular en Bold WOFF bestanden van disk (public/fonts/).
 * Bundling via @fontsource/inter en gekopieerd tijdens setup.
 *
 * Cached op module-niveau zodat elke serverless function instance de fonts
 * maar 1x inleest (niet per request).
 *
 * WOFF wordt door satori ondersteund; WOFF2 niet.
 */

let cachedRegular: Buffer | null = null
let cachedBold: Buffer | null = null

export interface LoadedFonts {
  regular: Buffer
  bold: Buffer
}

export async function loadInterFonts(): Promise<LoadedFonts> {
  if (cachedRegular && cachedBold) {
    return { regular: cachedRegular, bold: cachedBold }
  }

  const fontsDir = path.join(process.cwd(), 'public', 'fonts')

  const [regular, bold] = await Promise.all([
    fs.readFile(path.join(fontsDir, 'Inter-Regular.woff')),
    fs.readFile(path.join(fontsDir, 'Inter-Bold.woff')),
  ])

  cachedRegular = regular
  cachedBold = bold

  return { regular, bold }
}
