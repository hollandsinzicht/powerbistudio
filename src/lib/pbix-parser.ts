import JSZip from 'jszip'
import type { PbixMetadata } from './types/audit'

export async function extractPbixMetadata(fileBuffer: Buffer): Promise<PbixMetadata> {
  const zip = await JSZip.loadAsync(fileBuffer)

  // Parse DataModelSchema — contains table structure, measures, relationships
  const dataModelSchemaRaw = await zip.file('DataModelSchema')?.async('string')
  const dataModelSchema = dataModelSchemaRaw ? JSON.parse(dataModelSchemaRaw) : {}

  // Parse Report/Layout — contains pages and visuals
  const reportLayoutRaw = await zip.file('Report/Layout')?.async('string')
  const reportLayout = reportLayoutRaw ? JSON.parse(reportLayoutRaw) : {}

  // Parse Connections — contains data source connection strings (no credentials)
  const connectionsRaw = await zip.file('Connections')?.async('string')
  const connections = connectionsRaw ? JSON.parse(connectionsRaw) : {}

  const tables = extractTables(dataModelSchema)
  const relationships = extractRelationships(dataModelSchema)
  const sources = extractSources(connections)
  const pages = extractPages(reportLayout)

  const objectCount =
    tables.length +
    tables.reduce((sum, t) => sum + t.columns.length + t.measures.length, 0) +
    relationships.length

  return {
    tables,
    relationships,
    sources,
    pages,
    objectCount,
  }
}

function extractTables(schema: Record<string, unknown>): PbixMetadata['tables'] {
  const model = schema.model as Record<string, unknown> | undefined
  if (!model) return []

  const rawTables = (model.tables as Array<Record<string, unknown>>) || []

  return rawTables.map((table) => {
    const columns = ((table.columns as Array<Record<string, unknown>>) || []).map((col) => ({
      name: String(col.name || ''),
      dataType: String(col.dataType || 'unknown'),
    }))

    const measures = ((table.measures as Array<Record<string, unknown>>) || []).map((m) => ({
      name: String(m.name || ''),
      expression: String(m.expression || ''),
    }))

    return {
      name: String(table.name || ''),
      columns,
      measures,
    }
  })
}

function extractRelationships(schema: Record<string, unknown>): PbixMetadata['relationships'] {
  const model = schema.model as Record<string, unknown> | undefined
  if (!model) return []

  const rawRelationships = (model.relationships as Array<Record<string, unknown>>) || []

  return rawRelationships.map((rel) => ({
    fromTable: String(rel.fromTable || ''),
    toTable: String(rel.toTable || ''),
    fromColumn: String(rel.fromColumn || ''),
    toColumn: String(rel.toColumn || ''),
    crossFilteringBehavior: rel.crossFilteringBehavior
      ? String(rel.crossFilteringBehavior)
      : undefined,
  }))
}

function extractSources(connections: Record<string, unknown>): PbixMetadata['sources'] {
  const remoteArtifacts = (connections.RemoteArtifacts as Array<Record<string, unknown>>) || []

  return remoteArtifacts.map((artifact) => {
    const connString = String(artifact.ConnectionString || '')
    // Extract a readable name from the connection string
    const nameMatch = connString.match(/Data Source=([^;]+)/) ||
      connString.match(/Initial Catalog=([^;]+)/)
    const name = nameMatch ? nameMatch[1] : connString.substring(0, 80)

    return {
      name,
      type: String(artifact.DataSourceType || 'Unknown'),
    }
  })
}

function extractPages(layout: Record<string, unknown>): PbixMetadata['pages'] {
  const sections = (layout.sections as Array<Record<string, unknown>>) || []

  return sections.map((section) => {
    const visualContainers = (section.visualContainers as Array<unknown>) || []
    return {
      name: String(section.displayName || section.name || 'Unnamed'),
      visualCount: visualContainers.length,
    }
  })
}

/**
 * Validates that a buffer is a valid .pbix file (ZIP with expected entries).
 * Returns null if valid, error message if invalid.
 */
export async function validatePbixFile(fileBuffer: Buffer): Promise<string | null> {
  // Check ZIP magic bytes (PK\x03\x04)
  if (
    fileBuffer.length < 4 ||
    fileBuffer[0] !== 0x50 ||
    fileBuffer[1] !== 0x4b ||
    fileBuffer[2] !== 0x03 ||
    fileBuffer[3] !== 0x04
  ) {
    return 'Bestand is geen geldig ZIP/PBIX archief.'
  }

  try {
    const zip = await JSZip.loadAsync(fileBuffer)
    const hasDataModel = zip.file('DataModelSchema') !== null
    const hasLayout = zip.file('Report/Layout') !== null

    if (!hasDataModel && !hasLayout) {
      return 'Bestand lijkt geen geldig .pbix bestand te zijn (DataModelSchema en Report/Layout ontbreken).'
    }

    return null
  } catch {
    return 'Bestand kon niet worden geopend als ZIP archief.'
  }
}
