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

export type ScoreCategory = {
  score: number
  toelichting: string
}

export type AuditFinding = {
  categorie: 'datamodel' | 'dax' | 'performance' | 'naamgeving' | 'governance'
  ernst: 'kritisch' | 'belangrijk' | 'aanbeveling'
  titel: string
  probleem: string
  risico: string
  oplossing: string
}

export type AuditPriority = {
  rang: number
  actie: string
  impact: 'hoog' | 'gemiddeld' | 'laag'
  effort: 'hoog' | 'gemiddeld' | 'laag'
}

export type AuditAnalysis = {
  scores: {
    datamodel: ScoreCategory
    dax_kwaliteit: ScoreCategory
    performance_risico: ScoreCategory
    naamgeving: ScoreCategory
    onderhoudbaarheid: ScoreCategory
  }
  bevindingen: AuditFinding[]
  prioriteiten: AuditPriority[]
  samenvatting: string
}

export type PbixMetadata = {
  tables: { name: string; columns: { name: string; dataType: string }[]; measures: { name: string; expression: string }[] }[]
  relationships: { fromTable: string; toTable: string; fromColumn: string; toColumn: string; crossFilteringBehavior?: string }[]
  sources: { name: string; type: string }[]
  pages: { name: string; visualCount: number }[]
  objectCount: number
}
