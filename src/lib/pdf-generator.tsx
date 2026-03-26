import React from 'react'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { AuditAnalysis, DestructionProof } from './types/audit'

// --- Brand colors ---
const C = {
  dark: '#0F1C2E',
  primary: '#1E3A5F',
  accent: '#F2A623',
  danger: '#DC2626',
  warning: '#D97706',
  success: '#16A34A',
  info: '#2563EB',
  g100: '#F3F4F6',
  g300: '#D1D5DB',
  g500: '#6B7280',
  g700: '#374151',
  white: '#FFFFFF',
}

const scoreColor = (s: number) => s >= 8 ? C.success : s >= 5 ? C.warning : C.danger
const ernstColor = (e: string) => e === 'kritisch' ? C.danger : e === 'belangrijk' ? C.warning : C.info
const ernstBg = (e: string) => e === 'kritisch' ? '#FEF2F2' : e === 'belangrijk' ? '#FFFBEB' : '#EFF6FF'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: C.dark, paddingTop: 48, paddingBottom: 60, paddingHorizontal: 48, backgroundColor: C.white },
  hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: C.g300 },
  ftr: { position: 'absolute', bottom: 24, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: C.g500, borderTopWidth: 0.5, borderTopColor: C.g300, paddingTop: 8 },
  title: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.dark, marginBottom: 4, marginTop: 20 },
  sub: { fontSize: 9, color: C.g500, marginBottom: 16 },
  card: { backgroundColor: C.g100, borderRadius: 6, padding: 12, marginBottom: 8 },
  code: { fontFamily: 'Courier', fontSize: 8, backgroundColor: '#1E293B', color: '#E2E8F0', padding: 10, borderRadius: 4, marginVertical: 6 },
  tblHdr: { flexDirection: 'row', backgroundColor: C.dark, padding: 6, borderRadius: 4, marginBottom: 2 },
  tblCell: { fontSize: 9, color: C.g700 },
  tblRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: C.g300 },
})

// --- Watermark for mock ---
function Watermark() {
  return (
    <Text style={{ position: 'absolute', top: '38%', left: '8%', fontSize: 48, color: C.g300, fontFamily: 'Helvetica-Bold', transform: 'rotate(-35deg)', opacity: 0.4 }} fixed>
      VOORBEELDRAPPORT
    </Text>
  )
}

// --- Mock banner for cover ---
function MockBanner() {
  return (
    <View style={{ backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#F59E0B', borderRadius: 6, padding: 10, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{ fontSize: 9, color: '#92400E', lineHeight: 1.5 }}>
        Dit is een voorbeeldrapport op basis van fictieve data. Een echte audit analyseert jouw eigen .pbix bestand.
      </Text>
    </View>
  )
}

// --- Shared Components ---
function Hdr({ id, section }: { id: string; section: string }) {
  return (
    <View style={s.hdr} fixed>
      <Text style={{ fontSize: 9, color: C.g500, fontFamily: 'Helvetica-Bold' }}>PowerBIStudio.nl — Report Auditor</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Text style={{ fontSize: 9, color: C.accent, fontFamily: 'Helvetica-Bold' }}>{section}</Text>
        <Text style={{ fontSize: 9, color: C.g500 }}>{id}</Text>
      </View>
    </View>
  )
}
function Ftr({ id }: { id: string }) {
  return (
    <View style={s.ftr} fixed>
      <Text>© PowerBIStudio.nl — Vertrouwelijk</Text>
      <Text>Audit {id}</Text>
    </View>
  )
}

// --- Page 1: Cover ---
function CoverPage({ d, isMock }: { d: AuditAnalysis; isMock?: boolean }) {
  const gem = d.scorecard.gemiddeld
  return (
    <Page size="A4" style={s.page}>
      {isMock && <Watermark />}
      <View style={{ backgroundColor: C.dark, margin: -48, marginBottom: 0, padding: 48, paddingBottom: 40 }}>
        <Text style={{ fontSize: 9, color: C.accent, fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>POWERBISTUDIO.NL — REPORT AUDITOR</Text>
        <Text style={{ fontSize: 26, color: C.white, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>Power BI rapport audit</Text>
        <Text style={{ fontSize: 12, color: '#94A3B8', marginBottom: 24 }}>{d.model_naam}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
          <Text style={{ fontSize: 52, fontFamily: 'Helvetica-Bold', color: scoreColor(gem) }}>{gem.toFixed(1)}</Text>
          <Text style={{ fontSize: 14, color: '#94A3B8', marginBottom: 8 }}>/10 overall</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 24, marginTop: 28, marginBottom: 28 }}>
        {[
          { l: 'Audit-ID', v: d.audit_id },
          { l: 'Datum', v: d.analyse_datum },
          { l: 'Tabellen', v: String(d.modelstructuur.tabellen.length) },
          { l: 'Bevindingen', v: String(d.prioriteitenmatrix.length) },
        ].map(({ l, v }) => (
          <View key={l} style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, color: C.g500, marginBottom: 2 }}>{l}</Text>
            <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold' }}>{v}</Text>
          </View>
        ))}
      </View>
      {isMock && <MockBanner />}
      <Text style={s.title}>Samenvatting</Text>
      <Text style={{ fontSize: 10, lineHeight: 1.6, color: C.g700, marginBottom: 10 }}>{d.executive_summary.algemene_staat}</Text>
      <View style={{ backgroundColor: '#FEF2F2', borderLeftWidth: 3, borderLeftColor: C.danger, padding: 10, borderRadius: 4, marginBottom: 12 }}>
        <Text style={{ fontSize: 8, color: C.danger, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>GROOTSTE RISICO</Text>
        <Text style={{ fontSize: 10, color: C.dark, lineHeight: 1.5 }}>{d.executive_summary.grootste_risico}</Text>
      </View>
      <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>Top 3 aanbevolen acties</Text>
      {d.executive_summary.top_3_acties.map((a, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
          <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 8, color: C.white, fontFamily: 'Helvetica-Bold' }}>{i + 1}</Text>
          </View>
          <Text style={{ flex: 1, fontSize: 10, lineHeight: 1.5, color: C.g700, paddingTop: 2 }}>{a}</Text>
        </View>
      ))}
      <View style={{ marginTop: 'auto', paddingTop: 16, borderTopWidth: 0.5, borderTopColor: C.g300 }}>
        <Text style={{ fontSize: 8, color: C.g500, lineHeight: 1.5 }}>
          Dit rapport is gebaseerd op uitsluitend de structuurmetadata van het .pbix bestand. Geen data-inhoud, rijen, celwaarden of persoonlijke informatie zijn verwerkt of opgeslagen.
        </Text>
      </View>
      <Ftr id={d.audit_id} />
    </Page>
  )
}

// --- Page 2: Scorecard ---
function ScorecardPage({ d, isMock }: { d: AuditAnalysis; isMock?: boolean }) {
  const cats = [
    { key: 'datamodel_structuur' as const, label: 'Datamodel structuur' },
    { key: 'dax_kwaliteit' as const, label: 'DAX kwaliteit' },
    { key: 'performance_risico' as const, label: 'Performance risico' },
    { key: 'naamgeving_governance' as const, label: 'Naamgeving & governance' },
    { key: 'onderhoudbaarheid' as const, label: 'Onderhoudbaarheid' },
  ]
  return (
    <Page size="A4" style={s.page}>
      {isMock && <Watermark />}
      <Hdr id={d.audit_id} section="Scorecard" />
      {cats.map(({ key, label }) => {
        const { score, toelichting } = d.scorecard[key]
        const clr = scoreColor(score)
        return (
          <View key={key} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>{label}</Text>
              <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: clr }}>{score}/10</Text>
            </View>
            <View style={{ height: 6, backgroundColor: C.g300, borderRadius: 3, marginBottom: 6 }}>
              <View style={{ height: 6, width: `${score * 10}%`, backgroundColor: clr, borderRadius: 3 }} />
            </View>
            <Text style={{ fontSize: 9, color: C.g700, lineHeight: 1.5 }}>{toelichting}</Text>
          </View>
        )
      })}
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 16, padding: 10, backgroundColor: C.g100, borderRadius: 6 }}>
        {[
          { r: '8-10', l: 'Goed', c: C.success },
          { r: '5-7', l: 'Aandacht nodig', c: C.warning },
          { r: '1-4', l: 'Kritisch', c: C.danger },
        ].map(({ r, l, c }) => (
          <View key={r} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c }} />
            <Text style={{ fontSize: 8, color: C.g700 }}>{r} — {l}</Text>
          </View>
        ))}
      </View>
      <Ftr id={d.audit_id} />
    </Page>
  )
}

// --- Page 3: Modelstructuur ---
function ModelstructuurPage({ d, isMock }: { d: AuditAnalysis; isMock?: boolean }) {
  const { tabellen, relaties, calculated_columns_als_measure, overbodige_kolommen } = d.modelstructuur
  return (
    <Page size="A4" style={s.page} wrap>
      {isMock && <Watermark />}
      <Hdr id={d.audit_id} section="Modelstructuur" />
      <Text style={s.title}>Tabellen ({tabellen.length})</Text>
      <View style={s.tblHdr}>
        <Text style={{ color: C.white, fontSize: 8, fontFamily: 'Helvetica-Bold', flex: 2 }}>Naam</Text>
        <Text style={{ color: C.white, fontSize: 8, fontFamily: 'Helvetica-Bold', flex: 1 }}>Type</Text>
        <Text style={{ color: C.white, fontSize: 8, fontFamily: 'Helvetica-Bold', width: 40 }}>Kol.</Text>
        <Text style={{ color: C.white, fontSize: 8, fontFamily: 'Helvetica-Bold', flex: 2 }}>Opmerkingen</Text>
      </View>
      {tabellen.map((t, i) => (
        <View key={i} style={[s.tblRow, i % 2 === 1 ? { backgroundColor: C.g100 } : {}]}>
          <Text style={[s.tblCell, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>{t.naam}</Text>
          <Text style={[s.tblCell, { flex: 1 }]}>{t.type}</Text>
          <Text style={[s.tblCell, { width: 40 }]}>{t.aantal_kolommen}</Text>
          <Text style={[s.tblCell, { flex: 2, color: C.g500 }]}>{t.opmerkingen || '—'}</Text>
        </View>
      ))}
      {relaties.filter(r => r.beoordeling !== 'correct').length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={s.title}>Relaties — aandachtspunten</Text>
          {relaties.filter(r => r.beoordeling !== 'correct').map((rel, i) => (
            <View key={i} style={{ borderLeftWidth: 3, borderLeftColor: ernstColor(rel.beoordeling === 'problematisch' ? 'kritisch' : 'belangrijk'), paddingLeft: 10, marginBottom: 8 }}>
              <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>{rel.van} → {rel.naar}</Text>
              <Text style={{ fontSize: 8, color: C.g500 }}>{rel.kardinaliteit} · {rel.crossfilter} · {rel.beoordeling}</Text>
              {rel.toelichting && <Text style={{ fontSize: 9, color: C.g700, lineHeight: 1.5, marginTop: 4 }}>{rel.toelichting}</Text>}
            </View>
          ))}
        </View>
      )}
      {calculated_columns_als_measure.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={s.title}>Calculated columns — beter als measure ({calculated_columns_als_measure.length})</Text>
          {calculated_columns_als_measure.map((cc, i) => (
            <View key={i} style={s.card}>
              <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>{cc.naam} ({cc.tabel})</Text>
              {cc.formule && <Text style={s.code}>{cc.formule}</Text>}
              <Text style={{ fontSize: 9, color: C.g700, lineHeight: 1.5 }}>{cc.reden}</Text>
            </View>
          ))}
        </View>
      )}
      {overbodige_kolommen.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={s.title}>Overbodige kolommen ({overbodige_kolommen.length})</Text>
          {overbodige_kolommen.map((k, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
              <Text style={{ fontSize: 9, fontFamily: 'Courier' }}>{k.tabel}.{k.naam}</Text>
              <Text style={{ fontSize: 8, color: C.warning }}>→ {k.aanbeveling}</Text>
            </View>
          ))}
        </View>
      )}
      <Ftr id={d.audit_id} />
    </Page>
  )
}

// --- Page 4: DAX Kwaliteit ---
function DaxKwaliteitPage({ d, isMock }: { d: AuditAnalysis; isMock?: boolean }) {
  const dax = d.dax_kwaliteit
  const heeftBevindingen = [dax.geneste_calculate, dax.onnodige_iterators, dax.delen_door_nul, dax.hardcoded_waarden, dax.var_optimalisaties].some(a => a.length > 0)

  return (
    <Page size="A4" style={s.page} wrap>
      {isMock && <Watermark />}
      <Hdr id={d.audit_id} section="DAX kwaliteit" />
      {!heeftBevindingen && (
        <View style={{ padding: 20, backgroundColor: '#F0FDF4', borderRadius: 6, borderLeftWidth: 3, borderLeftColor: C.success }}>
          <Text style={{ fontSize: 10, color: C.success, fontFamily: 'Helvetica-Bold' }}>Geen DAX-antipatterns gevonden</Text>
          <Text style={{ fontSize: 9, color: C.g700, marginTop: 4 }}>De measures in dit model volgen correcte patronen.</Text>
        </View>
      )}
      {dax.geneste_calculate.length > 0 && (
        <View>
          <Text style={s.title}>Geneste CALCULATE ({dax.geneste_calculate.length})</Text>
          {dax.geneste_calculate.map((item, i) => (
            <View key={i} style={{ borderLeftWidth: 3, borderLeftColor: C.danger, paddingLeft: 10, marginBottom: 12 }} wrap={false}>
              <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>{item.measure}</Text>
              <Text style={{ fontSize: 8, color: C.g500 }}>Huidig (problematisch)</Text>
              <Text style={s.code}>{item.probleem_code}</Text>
              <Text style={{ fontSize: 9, color: C.g700, lineHeight: 1.5, marginBottom: 4 }}>{item.uitleg}</Text>
              <Text style={{ fontSize: 8, color: C.success }}>Gecorrigeerd</Text>
              <Text style={[s.code, { backgroundColor: '#064E3B' }]}>{item.gecorrigeerde_versie}</Text>
            </View>
          ))}
        </View>
      )}
      {dax.onnodige_iterators.length > 0 && (
        <View>
          <Text style={s.title}>Onnodige iterators ({dax.onnodige_iterators.length})</Text>
          {dax.onnodige_iterators.map((item, i) => (
            <View key={i} style={{ borderLeftWidth: 3, borderLeftColor: C.warning, paddingLeft: 10, marginBottom: 8 }} wrap={false}>
              <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>{item.measure}</Text>
              <Text style={{ fontSize: 8, color: C.g500 }}>Huidig → Gecorrigeerd</Text>
              <Text style={s.code}>{item.huidige_formule}{'\n'}→ {item.gecorrigeerde_formule}</Text>
            </View>
          ))}
        </View>
      )}
      {dax.delen_door_nul.length > 0 && (
        <View>
          <Text style={s.title}>Delen door nul ({dax.delen_door_nul.length})</Text>
          {dax.delen_door_nul.map((item, i) => (
            <View key={i} style={[s.card, { marginBottom: 6 }]} wrap={false}>
              <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>{item.measure}</Text>
              <Text style={s.code}>{item.huidige_formule}{'\n'}→ {item.gecorrigeerde_formule}</Text>
            </View>
          ))}
        </View>
      )}
      {dax.ontbrekende_measures.length > 0 && (
        <View>
          <Text style={s.title}>Aanbevolen aanvullingen ({dax.ontbrekende_measures.length})</Text>
          {dax.ontbrekende_measures.map((item, i) => (
            <View key={i} style={[s.card, { marginBottom: 6 }]} wrap={false}>
              <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>{item.naam}</Text>
              <Text style={{ fontSize: 9, color: C.g700, marginBottom: 4, lineHeight: 1.4 }}>{item.reden}</Text>
              <Text style={s.code}>{item.voorbeeld_formule}</Text>
            </View>
          ))}
        </View>
      )}
      <Ftr id={d.audit_id} />
    </Page>
  )
}

// --- Page 5: Performance + Governance ---
function PerfGovPage({ d, isMock }: { d: AuditAnalysis; isMock?: boolean }) {
  const { performance, governance } = d
  const ltClr = ({ licht: C.success, gemiddeld: C.info, zwaar: C.warning, kritisch: C.danger } as Record<string, string>)[performance.laadtijd_beoordeling] || C.g500

  return (
    <Page size="A4" style={s.page} wrap>
      {isMock && <Watermark />}
      <Hdr id={d.audit_id} section="Performance & governance" />
      <Text style={s.title}>Performance risicoprofiel</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <View style={{ padding: 14, backgroundColor: C.g100, borderRadius: 8, alignItems: 'center', minWidth: 100 }}>
          <Text style={{ fontSize: 8, color: C.g500, marginBottom: 4 }}>Laadtijd inschatting</Text>
          <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: ltClr }}>{performance.laadtijd_beoordeling.toUpperCase()}</Text>
        </View>
        <Text style={{ flex: 1, fontSize: 9, color: C.g700, lineHeight: 1.6, paddingTop: 4 }}>{performance.laadtijd_toelichting}</Text>
      </View>
      {performance.zwaarste_measures.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>Zwaarste measures</Text>
          {performance.zwaarste_measures.map((m, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
              <Text style={{ fontSize: 9, fontFamily: 'Courier' }}>{m.naam}</Text>
              <Text style={{ fontSize: 9, color: C.g700, flex: 1 }}>— {m.reden}</Text>
            </View>
          ))}
        </View>
      )}
      {performance.incrementele_refresh_advies && (
        <View style={{ padding: 10, backgroundColor: '#EFF6FF', borderRadius: 6, borderLeftWidth: 3, borderLeftColor: C.info, marginBottom: 12 }}>
          <Text style={{ fontSize: 8, color: C.info, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>INCREMENTELE REFRESH</Text>
          <Text style={{ fontSize: 9, color: C.g700, lineHeight: 1.5 }}>{performance.incrementele_refresh_advies}</Text>
        </View>
      )}

      <Text style={[s.title, { marginTop: 24 }]}>Governance & beheerbaarheid</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        {[
          { l: 'Measures gedocumenteerd', p: governance.documentatie.measures_gedocumenteerd_pct },
          { l: 'Tabellen gedocumenteerd', p: governance.documentatie.tabellen_gedocumenteerd_pct },
        ].map(({ l, p }) => (
          <View key={l} style={{ flex: 1, padding: 10, backgroundColor: C.g100, borderRadius: 6 }}>
            <Text style={{ fontSize: 8, color: C.g500, marginBottom: 4 }}>{l}</Text>
            <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: scoreColor(p / 10) }}>{p}%</Text>
            <View style={{ height: 4, backgroundColor: C.g300, borderRadius: 2, marginTop: 6 }}>
              <View style={{ height: 4, width: `${Math.min(p, 100)}%`, backgroundColor: scoreColor(p / 10), borderRadius: 2 }} />
            </View>
          </View>
        ))}
      </View>
      <View style={s.card}>
        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Naamgeving — {governance.naamgeving.dominante_conventie}</Text>
        {governance.naamgeving.inconsistenties.map((inc, i) => (
          <Text key={i} style={{ fontSize: 9, color: C.warning, marginBottom: 2 }}>• {inc}</Text>
        ))}
        <Text style={{ fontSize: 9, color: C.g700, marginTop: 4 }}>{governance.naamgeving.kwaliteitsoordeel}</Text>
      </View>
      <View style={{ borderLeftWidth: 3, borderLeftColor: governance.rls.geconfigureerd && governance.rls.volledig ? C.success : C.danger, paddingLeft: 10, marginTop: 8, marginBottom: 8 }}>
        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>
          RLS — {governance.rls.geconfigureerd ? (governance.rls.volledig ? 'Volledig' : 'Onvolledig') : 'Niet geconfigureerd'}
        </Text>
        <Text style={{ fontSize: 9, color: C.g700, lineHeight: 1.5 }}>{governance.rls.bevindingen}</Text>
      </View>
      <Ftr id={d.audit_id} />
    </Page>
  )
}

// --- Page 6: Prioriteiten + Bewijs ---
function PrioriteitenPage({ d, proof, isMock }: { d: AuditAnalysis; proof: DestructionProof; isMock?: boolean }) {
  const kritisch = d.prioriteitenmatrix.filter(p => p.ernst === 'kritisch')
  const quickWins = d.prioriteitenmatrix.filter(p => p.ernst !== 'kritisch' && p.impact === 'hoog' && p.effort === 'laag')
  const overig = d.prioriteitenmatrix.filter(p => !kritisch.includes(p) && !quickWins.includes(p))
  const totalUren = d.prioriteitenmatrix.reduce((sum, p) => sum + p.geschatte_uren, 0)

  const groups = [
    { titel: 'Kritisch', items: kritisch, kleur: C.danger, bg: '#FEF2F2' },
    { titel: 'Quick wins', items: quickWins, kleur: C.success, bg: '#F0FDF4' },
    { titel: 'Overige aanbevelingen', items: overig, kleur: C.g500, bg: C.g100 },
  ].filter(g => g.items.length > 0)

  return (
    <Page size="A4" style={s.page} wrap>
      {isMock && <Watermark />}
      <Hdr id={d.audit_id} section="Prioriteiten & bewijs" />
      <Text style={s.title}>Prioriteitenmatrix</Text>
      <Text style={{ fontSize: 9, color: C.g500, marginBottom: 12 }}>
        Totale geschatte inspanning: {totalUren} uur — {d.prioriteitenmatrix.length} bevindingen
      </Text>

      {groups.map(({ titel, items, kleur, bg }) => (
        <View key={titel} style={{ marginBottom: 14 }} wrap={false}>
          <View style={{ backgroundColor: bg, padding: 6, borderRadius: 4, marginBottom: 6, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: kleur }} />
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: kleur }}>{titel}</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: C.g300 }}>
              <Text style={{ fontSize: 9, flex: 3, lineHeight: 1.4 }}>{item.titel}</Text>
              <Text style={{ fontSize: 8, color: C.g500, flex: 1, textAlign: 'center' }}>{item.categorie}</Text>
              <Text style={{ fontSize: 8, color: C.g500, width: 60, textAlign: 'center' }}>{item.impact}/{item.effort}</Text>
              <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', width: 30, textAlign: 'right' }}>{item.geschatte_uren}u</Text>
            </View>
          ))}
        </View>
      ))}

      {/* Destruction proof */}
      <View style={{ marginTop: 20, padding: 14, backgroundColor: C.dark, borderRadius: 8 }} wrap={false}>
        <Text style={{ fontSize: 9, color: C.accent, fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>CRYPTOGRAFISCH VERNIETIGINGSBEWIJS</Text>
        {[
          { l: 'Origineel bestand vernietigd', t: proof.originalDestroyedAt, h: proof.originalHash },
          { l: 'Metadata vernietigd', t: proof.metadataDestroyedAt, h: proof.metadataHash },
        ].map(({ l, t, h }) => (
          <View key={l} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 8, color: '#94A3B8' }}>{l}</Text>
              <Text style={{ fontSize: 8, color: '#94A3B8' }}>{t}</Text>
            </View>
            <Text style={{ fontFamily: 'Courier', fontSize: 8, color: '#64748B', marginTop: 2 }}>{h}</Text>
          </View>
        ))}
        <View style={{ borderTopWidth: 0.5, borderTopColor: '#334155', paddingTop: 8, marginTop: 4 }}>
          <Text style={{ fontSize: 8, color: '#94A3B8', marginBottom: 2 }}>Verificatiecode</Text>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11, color: C.accent }}>{proof.verificationCode}</Text>
          <Text style={{ fontSize: 8, color: '#64748B', marginTop: 4 }}>Verifieer publiek: powerbistudio.nl/tools/report-auditor#verificeer</Text>
        </View>
      </View>
      <Ftr id={d.audit_id} />
    </Page>
  )
}

// --- Main export ---
export async function generatePdfReport(
  analysis: AuditAnalysis,
  proof: DestructionProof,
  options?: { isMock?: boolean }
): Promise<Buffer> {
  const mock = options?.isMock ?? false
  const doc = (
    <Document
      title={mock ? 'PowerBIStudio — Voorbeeldrapport' : `Power BI Audit — ${analysis.model_naam} — ${analysis.audit_id}`}
      author="PowerBIStudio.nl"
      subject="Power BI Report Audit"
      creator="PowerBIStudio Report Auditor"
    >
      <CoverPage d={analysis} isMock={mock} />
      <ScorecardPage d={analysis} isMock={mock} />
      <ModelstructuurPage d={analysis} isMock={mock} />
      <DaxKwaliteitPage d={analysis} isMock={mock} />
      <PerfGovPage d={analysis} isMock={mock} />
      <PrioriteitenPage d={analysis} proof={proof} isMock={mock} />
    </Document>
  )

  const buffer = await renderToBuffer(doc)
  return Buffer.from(buffer)
}
