import { NextResponse } from 'next/server'
import { generatePdfReport } from '@/lib/pdf-generator'
import { MOCK_AUDIT_DATA, MOCK_DESTRUCTION_PROOF } from '@/lib/mock-audit-data'

export async function GET() {
  try {
    const pdfBuffer = await generatePdfReport(MOCK_AUDIT_DATA, MOCK_DESTRUCTION_PROOF, { isMock: true })

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="PowerBIStudio-Voorbeeldrapport.pdf"',
        'Cache-Control': 'public, max-age=86400', // 24u cache
      },
    })
  } catch (error) {
    console.error('Mock PDF generation error:', error)
    return NextResponse.json(
      { error: 'Kon voorbeeldrapport niet genereren.' },
      { status: 500 }
    )
  }
}
