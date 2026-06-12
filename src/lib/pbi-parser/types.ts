// Genormaliseerd Power BI-datamodel, onafhankelijk van het bronformaat
// (.pbit/DataModelSchema, model.bim/TMSL of .tmdl). Port van de Python-parser
// in de pbi-model skill; relaties dragen hier ook kardinaliteit mee zodat de
// analyse many-to-many kan detecteren.

export interface PbiColumn {
    name: string;
    dataType: string;
    isHidden: boolean;
}

export interface PbiMeasure {
    name: string;
    expression: string;
    displayFolder: string;
    formatString: string;
}

export interface PbiTable {
    name: string;
    isHidden: boolean;
    columns: PbiColumn[];
    measures: PbiMeasure[];
}

export interface PbiRelationship {
    fromTable: string;
    fromColumn: string;
    toTable: string;
    toColumn: string;
    isActive: boolean;
    crossFilteringBehavior: string;
    // TMSL-default: many → one
    fromCardinality: string;
    toCardinality: string;
}

export interface PbiModel {
    name: string;
    source: string;
    tables: PbiTable[];
    relationships: PbiRelationship[];
}

export interface PbiModelStats {
    tables: number;
    columns: number;
    measures: number;
    relationships: number;
}

export function newModel(name: string, source: string): PbiModel {
    return { name, source, tables: [], relationships: [] };
}

export function newTable(name: string): PbiTable {
    return { name, isHidden: false, columns: [], measures: [] };
}

export function modelStats(model: PbiModel): PbiModelStats {
    return {
        tables: model.tables.length,
        columns: model.tables.reduce((n, t) => n + t.columns.length, 0),
        measures: model.tables.reduce((n, t) => n + t.measures.length, 0),
        relationships: model.relationships.length,
    };
}

export const AUTO_DATE_PREFIXES = ['LocalDateTable_', 'DateTableTemplate_'];

export function hasAutoDatePrefix(name: string): boolean {
    return AUTO_DATE_PREFIXES.some((p) => name.startsWith(p));
}
