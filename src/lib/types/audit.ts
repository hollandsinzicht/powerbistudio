export type AuditPlan = 'single' | 'bundle' | 'free'

export type AuditStepKey =
  | 'received'
  | 'parsed'
  | 'original_destroyed'
  | 'analyzing'
  | 'analyzed'
  | 'metadata_destroyed'
  | 'report_generated'
  | 'complete'

export type AuditStep = {
  key: AuditStepKey
  label: string
  timestamp: string
  hash?: string
  metadata?: Record<string, unknown>
}

export type AuditStatus = {
  auditId: string
  fileName: string
  status: string
  steps: AuditStep[]
  verificationCode?: string
  pdfUrl?: string
  expiresAt?: number
}

export type AuditVerification = {
  auditId: string
  exists: boolean
  originalDestroyedAt?: string
  originalHash?: string
  metadataDestroyedAt?: string
  metadataHash?: string
  reportExpiredAt?: string
  status: string
}

export type PbixMetadata = {
  tables: { name: string; columns: { name: string; dataType: string }[]; measures: { name: string; expression: string }[] }[]
  relationships: { fromTable: string; toTable: string; fromColumn: string; toColumn: string; crossFilteringBehavior?: string }[]
  sources: { name: string; type: string }[]
  pages: { name: string; visualCount: number }[]
  objectCount: number
}

// --- Full audit analysis schema (returned by Claude) ---

export type ScoreCategory = {
  score: number
  toelichting: string
}

export type TabelAnalyse = {
  naam: string
  type: 'feit' | 'dimensie' | 'bridge' | 'kalender' | 'overig'
  aantal_kolommen: number
  opmerkingen: string
}

export type RelatieAnalyse = {
  van: string
  naar: string
  kardinaliteit: '1:n' | 'n:1' | '1:1' | 'n:n'
  crossfilter: 'enkelvoudig' | 'beide'
  beoordeling: 'correct' | 'risico' | 'problematisch'
  toelichting: string | null
}

export type CalculatedColumnAnalyse = {
  naam: string
  tabel: string
  formule: string | null
  reden: string
  impact: string
}

export type OverbodigeKolom = {
  naam: string
  tabel: string
  aanbeveling: 'verwijderen' | 'verbergen'
}

export type DaxFinding = {
  measure: string
  probleem_code?: string
  huidige_formule?: string
  gecorrigeerde_formule?: string
  gecorrigeerde_versie?: string
  uitleg?: string
  geschatte_tijdwinst?: string
  impact?: string
  waarde?: string
  aanbeveling?: string
}

export type OntbrekendeMeasure = {
  naam: string
  reden: string
  voorbeeld_formule: string
}

export type PrioriteitItem = {
  titel: string
  categorie: 'datamodel' | 'dax' | 'performance' | 'governance' | 'bronnen'
  ernst: 'kritisch' | 'belangrijk' | 'aanbeveling'
  impact: 'hoog' | 'gemiddeld' | 'laag'
  effort: 'hoog' | 'gemiddeld' | 'laag'
  geschatte_uren: number
  korte_toelichting: string
}

export type BronVerbinding = {
  identifier: string
  type: string
  risico: 'laag' | 'gemiddeld' | 'hoog'
  risico_toelichting: string
  aanbeveling: 'handhaven' | 'dataflow' | 'gecertificeerde_dataset' | 'overig'
}

export type AuditAnalysis = {
  audit_id: string
  model_naam: string
  analyse_datum: string

  executive_summary: {
    algemene_staat: string
    grootste_risico: string
    top_3_acties: string[]
  }

  scorecard: {
    datamodel_structuur: ScoreCategory
    dax_kwaliteit: ScoreCategory
    performance_risico: ScoreCategory
    naamgeving_governance: ScoreCategory
    onderhoudbaarheid: ScoreCategory
    gemiddeld: number
  }

  modelstructuur: {
    tabellen: TabelAnalyse[]
    relaties: RelatieAnalyse[]
    calculated_columns_als_measure: CalculatedColumnAnalyse[]
    overbodige_kolommen: OverbodigeKolom[]
  }

  dax_kwaliteit: {
    geneste_calculate: DaxFinding[]
    onnodige_iterators: DaxFinding[]
    delen_door_nul: DaxFinding[]
    hardcoded_waarden: DaxFinding[]
    var_optimalisaties: DaxFinding[]
    ontbrekende_measures: OntbrekendeMeasure[]
  }

  performance: {
    laadtijd_beoordeling: 'licht' | 'gemiddeld' | 'zwaar' | 'kritisch'
    laadtijd_toelichting: string
    zwaarste_measures: { naam: string; reden: string }[]
    import_directquery_advies: string | null
    incrementele_refresh_advies: string | null
  }

  governance: {
    naamgeving: {
      dominante_conventie: string
      inconsistenties: string[]
      kwaliteitsoordeel: string
    }
    documentatie: {
      measures_gedocumenteerd_pct: number
      tabellen_gedocumenteerd_pct: number
      aanbeveling: string
    }
    rls: {
      geconfigureerd: boolean
      volledig: boolean
      bevindingen: string
    }
    opruimadvies: {
      ongebruikte_measures: string[]
      ongebruikte_tabellen: string[]
      verborgen_objecten_review: string
    }
  }

  bronverbindingen: BronVerbinding[]

  prioriteitenmatrix: PrioriteitItem[]
}

export type DestructionProof = {
  originalHash: string
  originalDestroyedAt: string
  metadataHash: string
  metadataDestroyedAt: string
  verificationCode: string
}
