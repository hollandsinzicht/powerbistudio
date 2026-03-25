import React from 'react'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { AuditAnalysis } from './types/audit'

const colors = {
  primary: '#1E3A5F',
  accent: '#F59E0B',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  green: '#10B981',
  orange: '#F59E0B',
  red: '#EF4444',
  bgLight: '#F9FAFB',
}

const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: 'Helvetica', fontSize: 10, color: colors.text },
  footer: { position: 'absolute', bottom: 30, left: 50, right: 50, fontSize: 8, color: colors.textSecondary, borderTop: `1pt solid ${colors.border}`, paddingTop: 8 },

  // Cover
  coverTitle: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 8 },
  coverSubtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 40 },
  coverMeta: { fontSize: 10, color: colors.textSecondary, marginBottom: 4 },
  coverDisclaimer: { fontSize: 8, color: colors.textSecondary, marginTop: 40, padding: 12, backgroundColor: colors.bgLight, borderRadius: 4 },

  // Scorecard
  sectionTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 16 },
  scoreRow: { flexDirection: 'row', marginBottom: 12, padding: 10, backgroundColor: colors.bgLight, borderRadius: 4 },
  scoreLabel: { width: 140, fontSize: 11, fontFamily: 'Helvetica-Bold' },
  scoreValue: { width: 40, fontSize: 16, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  scoreToelichting: { flex: 1, fontSize: 9, color: colors.textSecondary, paddingLeft: 12 },

  // Findings
  findingCard: { marginBottom: 10, padding: 10, backgroundColor: colors.bgLight, borderRadius: 4, borderLeft: '3pt solid #E5E7EB' },
  findingTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  findingBadge: { fontSize: 8, fontFamily: 'Helvetica-Bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, marginRight: 8 },
  findingText: { fontSize: 9, color: colors.textSecondary, marginBottom: 3 },

  // Priorities
  priorityRow: { flexDirection: 'row', marginBottom: 8, padding: 8, backgroundColor: colors.bgLight, borderRadius: 4 },
  priorityRank: { width: 24, fontSize: 14, fontFamily: 'Helvetica-Bold', color: colors.primary },
  priorityContent: { flex: 1 },
  priorityActie: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  priorityMeta: { fontSize: 8, color: colors.textSecondary },

  // Proof
  proofBox: { padding: 12, backgroundColor: colors.bgLight, borderRadius: 4, marginBottom: 8 },
  proofLabel: { fontSize: 8, color: colors.textSecondary, marginBottom: 2 },
  proofValue: { fontSize: 8, fontFamily: 'Courier' },
})

function getScoreColor(score: number): string {
  if (score >= 8) return colors.green
  if (score >= 5) return colors.orange
  return colors.red
}

function getErnstColor(ernst: string): string {
  if (ernst === 'kritisch') return colors.red
  if (ernst === 'belangrijk') return colors.orange
  return colors.primary
}

function getErnstBg(ernst: string): string {
  if (ernst === 'kritisch') return '#FEF2F2'
  if (ernst === 'belangrijk') return '#FFFBEB'
  return '#EFF6FF'
}

const scoreCategoryLabels: Record<string, string> = {
  datamodel: 'Datamodel',
  dax_kwaliteit: 'DAX Kwaliteit',
  performance_risico: 'Performance Risico',
  naamgeving: 'Naamgeving',
  onderhoudbaarheid: 'Onderhoudbaarheid',
}

type PdfParams = {
  auditId: string
  fileName: string
  analysis: AuditAnalysis
  verificationCode: string
  originalHash: string
  originalDestroyedAt: string
  metadataHash: string
  metadataDestroyedAt: string
}

function AuditReport(props: PdfParams) {
  const { auditId, fileName, analysis, verificationCode, originalHash, originalDestroyedAt, metadataHash, metadataDestroyedAt } = props
  const date = new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })

  const overallScore = Object.values(analysis.scores).reduce((sum, s) => sum + s.score, 0) / 5

  return (
    <Document>
      {/* Cover */}
      <Page size="A4" style={styles.page}>
        <Text style={{ fontSize: 10, color: colors.textSecondary, marginBottom: 40 }}>PowerBIStudio.nl</Text>
        <Text style={styles.coverTitle}>Power BI Rapport Audit</Text>
        <Text style={styles.coverSubtitle}>Professionele analyse van je datamodel</Text>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.coverMeta}>Bestand: {fileName}</Text>
          <Text style={styles.coverMeta}>Datum: {date}</Text>
          <Text style={styles.coverMeta}>Audit-ID: {auditId}</Text>
          <Text style={styles.coverMeta}>Verificatiecode: {verificationCode}</Text>
        </View>

        <Text style={styles.coverDisclaimer}>
          Dit rapport analyseert modelstructuur. Geen data-inhoud is verwerkt of opgeslagen.
          Het originele bestand en alle metadata zijn vernietigd na analyse.
        </Text>

        <View style={styles.footer}>
          <Text>&copy; PowerBIStudio.nl — Vertrouwelijk — Audit-ID: {auditId}</Text>
        </View>
      </Page>

      {/* Scorecard */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Scorecard</Text>
        <View style={{ ...styles.scoreRow, backgroundColor: colors.primary, marginBottom: 20 }}>
          <Text style={{ ...styles.scoreLabel, color: 'white' }}>Overall Score</Text>
          <Text style={{ ...styles.scoreValue, color: colors.accent, fontSize: 22 }}>{overallScore.toFixed(1)}</Text>
        </View>

        {Object.entries(analysis.scores).map(([key, val]) => (
          <View key={key} style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>{scoreCategoryLabels[key] || key}</Text>
            <Text style={{ ...styles.scoreValue, color: getScoreColor(val.score) }}>{val.score}</Text>
            <Text style={styles.scoreToelichting}>{val.toelichting}</Text>
          </View>
        ))}

        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Samenvatting</Text>
          <Text style={{ fontSize: 9, color: colors.textSecondary, lineHeight: 1.5 }}>{analysis.samenvatting}</Text>
        </View>

        <View style={styles.footer}>
          <Text>&copy; PowerBIStudio.nl — Vertrouwelijk — Audit-ID: {auditId}</Text>
        </View>
      </Page>

      {/* Findings */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Bevindingen</Text>

        {analysis.bevindingen
          .sort((a, b) => {
            const order = { kritisch: 0, belangrijk: 1, aanbeveling: 2 }
            return (order[a.ernst] ?? 3) - (order[b.ernst] ?? 3)
          })
          .map((finding, i) => (
            <View key={i} style={{ ...styles.findingCard, borderLeftColor: getErnstColor(finding.ernst) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ ...styles.findingBadge, color: getErnstColor(finding.ernst), backgroundColor: getErnstBg(finding.ernst) }}>
                  {finding.ernst.toUpperCase()}
                </Text>
                <Text style={styles.findingTitle}>{finding.titel}</Text>
              </View>
              <Text style={styles.findingText}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Probleem: </Text>{finding.probleem}</Text>
              <Text style={styles.findingText}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Risico: </Text>{finding.risico}</Text>
              <Text style={styles.findingText}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Oplossing: </Text>{finding.oplossing}</Text>
            </View>
          ))}

        <View style={styles.footer}>
          <Text>&copy; PowerBIStudio.nl — Vertrouwelijk — Audit-ID: {auditId}</Text>
        </View>
      </Page>

      {/* Priorities + Proof */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Top 5 Prioriteiten</Text>

        {analysis.prioriteiten.map((p) => (
          <View key={p.rang} style={styles.priorityRow}>
            <Text style={styles.priorityRank}>{p.rang}</Text>
            <View style={styles.priorityContent}>
              <Text style={styles.priorityActie}>{p.actie}</Text>
              <Text style={styles.priorityMeta}>Impact: {p.impact} | Effort: {p.effort}</Text>
            </View>
          </View>
        ))}

        <View style={{ marginTop: 30 }}>
          <Text style={styles.sectionTitle}>Vernietigingsbewijs</Text>

          <View style={styles.proofBox}>
            <Text style={styles.proofLabel}>Origineel bestand</Text>
            <Text style={styles.proofValue}>Hash: {originalHash}</Text>
            <Text style={styles.proofValue}>Vernietigd: {originalDestroyedAt}</Text>
          </View>

          <View style={styles.proofBox}>
            <Text style={styles.proofLabel}>Geextraheerde metadata</Text>
            <Text style={styles.proofValue}>Hash: {metadataHash}</Text>
            <Text style={styles.proofValue}>Vernietigd: {metadataDestroyedAt}</Text>
          </View>

          <View style={styles.proofBox}>
            <Text style={styles.proofLabel}>Verificatie</Text>
            <Text style={styles.proofValue}>Code: {verificationCode}</Text>
            <Text style={styles.proofValue}>URL: powerbistudio.nl/tools/report-auditor#verificeer</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>&copy; PowerBIStudio.nl — Vertrouwelijk — Audit-ID: {auditId}</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generatePdfReport(params: PdfParams): Promise<Buffer> {
  const buffer = await renderToBuffer(<AuditReport {...params} />)
  return Buffer.from(buffer)
}
