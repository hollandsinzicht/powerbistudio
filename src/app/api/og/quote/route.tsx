import { ImageResponse } from 'next/og'
import { loadInterFonts } from '@/lib/og-fonts'

// Runtime nodejs (default) — ImageResponse werkt hier sinds Next.js 14
export const dynamic = 'force-dynamic'

// Output dimensions: LinkedIn portrait feed post (4:5 ratio)
const WIDTH = 1080
const HEIGHT = 1350

// Tokenize quote tekst in woorden met bold flag per woord.
// Zo kan satori flex-wrap elk woord op de juiste plek afbreken en
// blijft de emphasis correct gestyled.
function tokenize(text: string, emphasis: string): { word: string; bold: boolean }[] {
  const trimmed = text.trim()
  if (!emphasis) {
    return trimmed
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => ({ word: w, bold: false }))
  }

  const lowerText = trimmed.toLowerCase()
  const lowerEmph = emphasis.toLowerCase().trim()
  const idx = lowerText.indexOf(lowerEmph)

  if (idx === -1) {
    return trimmed
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => ({ word: w, bold: false }))
  }

  const before = trimmed.slice(0, idx).trim()
  const emph = trimmed.slice(idx, idx + emphasis.length).trim()
  const after = trimmed.slice(idx + emphasis.length).trim()

  const result: { word: string; bold: boolean }[] = []
  if (before) {
    for (const w of before.split(/\s+/).filter(Boolean)) {
      result.push({ word: w, bold: false })
    }
  }
  if (emph) {
    for (const w of emph.split(/\s+/).filter(Boolean)) {
      result.push({ word: w, bold: true })
    }
  }
  if (after) {
    for (const w of after.split(/\s+/).filter(Boolean)) {
      result.push({ word: w, bold: false })
    }
  }
  return result
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const text = searchParams.get('text') || ''
    const emphasis = searchParams.get('emphasis') || ''

    if (!text) {
      return new Response('text parameter required', { status: 400 })
    }

    const { regular, bold } = await loadInterFonts()
    const words = tokenize(text, emphasis)

    // Adaptieve fontSize: kortere quotes groter, langere quotes kleiner
    const len = text.length
    const fontSize = len < 60 ? 78 : len < 90 ? 68 : len < 120 ? 60 : 54

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#F3F6FA',
            backgroundImage:
              'linear-gradient(#E3EAF3 1px, transparent 1px), linear-gradient(90deg, #E3EAF3 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            padding: '80px',
            fontFamily: 'Inter',
          }}
        >
          {/* ===== Header: Power BI Studio logo ===== */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* Bar chart icon */}
              <svg width={72} height={72} viewBox="0 0 80 80" style={{ marginRight: 20 }}>
                <rect x={8} y={46} width={16} height={26} rx={3} fill="#6B8AAC" />
                <rect x={32} y={30} width={16} height={42} rx={3} fill="#1E3A5F" />
                <rect x={56} y={12} width={16} height={60} rx={3} fill="#1E3A5F" />
              </svg>
              <div
                style={{
                  display: 'flex',
                  fontSize: 56,
                  fontWeight: 700,
                  letterSpacing: -1.5,
                }}
              >
                <div style={{ color: '#1E3A5F' }}>Power</div>
                <div style={{ color: '#1E3A5F', marginLeft: 14 }}>BI</div>
                <div style={{ color: '#374151', marginLeft: 14, fontWeight: 400 }}>Studio</div>
              </div>
            </div>
            <div
              style={{
                width: 520,
                height: 3,
                backgroundColor: '#1E3A5F',
                marginTop: 22,
                borderRadius: 2,
              }}
            />
          </div>

          {/* ===== Quote mark decoratief ===== */}
          <div
            style={{
              display: 'flex',
              marginTop: 110,
              marginBottom: 10,
            }}
          >
            <svg width={180} height={140} viewBox="0 0 180 140">
              {/* Twee curly opening quote shapes */}
              <path
                d="M10 70 C10 35 35 10 70 10 L70 38 C48 38 38 52 38 70 L70 70 L70 130 L10 130 Z"
                fill="#C5D2E0"
              />
              <path
                d="M100 70 C100 35 125 10 160 10 L160 38 C138 38 128 52 128 70 L160 70 L160 130 L100 130 Z"
                fill="#C5D2E0"
              />
            </svg>
          </div>

          {/* ===== Quote tekst (word-level flex wrap) ===== */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              fontSize,
              lineHeight: 1.25,
              marginTop: 8,
              maxWidth: '100%',
            }}
          >
            {words.map((w, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  marginRight: Math.round(fontSize * 0.26),
                  marginBottom: Math.round(fontSize * 0.1),
                  fontWeight: w.bold ? 700 : 400,
                  color: w.bold ? '#1E3A5F' : '#374151',
                  letterSpacing: -0.5,
                }}
              >
                {w.word}
              </div>
            ))}
          </div>

          {/* ===== Footer pushed to bottom ===== */}
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              fontSize: 28,
              color: '#94A3B8',
              fontWeight: 500,
            }}
          >
            powerbistudio.nl
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        fonts: [
          { name: 'Inter', data: regular, weight: 400, style: 'normal' },
          { name: 'Inter', data: bold, weight: 700, style: 'normal' },
        ],
      }
    )
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}\n${err.stack}` : String(err)
    console.error('OG quote image error:', msg)
    return new Response(`Failed to generate image\n\n${msg}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}
