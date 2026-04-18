/**
 * Seed universe van zoektermen relevant voor Power BI Studio's doelgroepen.
 *
 * Elk keyword heeft:
 *  - term: de zoekterm zelf (NL of EN — gebruikt in content-matching)
 *  - aliases: variaties/synoniemen die ook als match tellen
 *  - personas: wie deze term zoekt (CIO, CEO, IT-manager, Data-manager, PBI-dev)
 *  - theme: thematische groep (voor clustering in de UI)
 *  - priority: 1 (laag) — 3 (hoog), voor opportunity-score
 *  - sources: op welke platforms deze term trendy/veelbesproken is
 *    (puur informatief — we roepen geen externe APIs aan)
 */

export type Persona = 'CIO' | 'CEO' | 'IT-manager' | 'Data-manager' | 'PBI-dev';

export type Theme =
  | 'architectuur'
  | 'governance'
  | 'kosten-licenties'
  | 'migratie-fabric'
  | 'ai-copilot'
  | 'performance'
  | 'dax-modellering'
  | 'security-rls'
  | 'procesverbetering'
  | 'embedded-saas'
  | 'adoption-change';

export type ContentSource = 'Reddit' | 'X' | 'Google' | 'LinkedIn';

export interface SeedKeyword {
  term: string;
  aliases?: string[];
  personas: Persona[];
  theme: Theme;
  priority: 1 | 2 | 3;
  sources: ContentSource[];
}

export const KEYWORD_UNIVERSE: SeedKeyword[] = [
  // ─── CIO / CEO strategy ────────────────────────────────────────────
  { term: 'Fabric ROI', aliases: ['Microsoft Fabric ROI', 'Fabric business case'], personas: ['CIO', 'CEO'], theme: 'kosten-licenties', priority: 3, sources: ['Google', 'LinkedIn'] },
  { term: 'Power BI licentiekosten', aliases: ['Power BI pricing', 'Premium vs Pro'], personas: ['CIO', 'IT-manager'], theme: 'kosten-licenties', priority: 3, sources: ['Reddit', 'Google'] },
  { term: 'data governance strategie', aliases: ['data governance roadmap', 'governance framework'], personas: ['CIO', 'Data-manager'], theme: 'governance', priority: 3, sources: ['LinkedIn', 'Google'] },
  { term: 'BI modernisatie', aliases: ['BI modernization', 'legacy BI vervangen'], personas: ['CIO', 'IT-manager'], theme: 'migratie-fabric', priority: 2, sources: ['LinkedIn', 'Google'] },
  { term: 'self-service analytics risico', aliases: ['self-service BI governance', 'self-service pitfalls'], personas: ['CIO', 'Data-manager'], theme: 'governance', priority: 2, sources: ['Reddit', 'LinkedIn'] },
  { term: 'AI adoptie bestuur', aliases: ['AI adoption enterprise', 'Copilot adoption CIO'], personas: ['CIO', 'CEO'], theme: 'ai-copilot', priority: 3, sources: ['LinkedIn', 'X'] },
  { term: 'data platform TCO', aliases: ['data stack cost', 'platform kosten'], personas: ['CIO', 'IT-manager'], theme: 'kosten-licenties', priority: 2, sources: ['LinkedIn', 'Google'] },
  { term: 'data driven organisatie', aliases: ['data-driven cultuur', 'data culture'], personas: ['CEO', 'CIO'], theme: 'adoption-change', priority: 2, sources: ['LinkedIn', 'Google'] },
  { term: 'shadow IT BI', aliases: ['schaduw IT', 'rogue Power BI'], personas: ['CIO', 'IT-manager'], theme: 'governance', priority: 2, sources: ['Reddit', 'LinkedIn'] },
  { term: 'data mesh', aliases: ['data mesh architectuur'], personas: ['CIO', 'Data-manager'], theme: 'architectuur', priority: 2, sources: ['LinkedIn', 'X'] },

  // ─── IT-manager ────────────────────────────────────────────────────
  { term: 'Fabric capacity planning', aliases: ['F-SKU capacity', 'Fabric capacity sizing'], personas: ['IT-manager', 'PBI-dev'], theme: 'architectuur', priority: 3, sources: ['Reddit', 'Google'] },
  { term: 'Azure cost optimization', aliases: ['Azure kosten beheersen', 'Fabric cost control'], personas: ['IT-manager', 'CIO'], theme: 'kosten-licenties', priority: 3, sources: ['Reddit', 'LinkedIn'] },
  { term: 'deployment pipelines Power BI', aliases: ['Power BI CI/CD', 'Fabric deployment'], personas: ['IT-manager', 'PBI-dev'], theme: 'architectuur', priority: 2, sources: ['Reddit', 'Google'] },
  { term: 'Power BI gateway', aliases: ['on-premises gateway', 'gateway errors'], personas: ['IT-manager', 'PBI-dev'], theme: 'architectuur', priority: 2, sources: ['Reddit', 'Google'] },
  { term: 'Power BI security', aliases: ['BI security best practices', 'tenant security'], personas: ['IT-manager', 'CIO'], theme: 'security-rls', priority: 3, sources: ['LinkedIn', 'Google'] },
  { term: 'workspace governance', aliases: ['workspace strategie', 'workspace architectuur'], personas: ['IT-manager', 'Data-manager'], theme: 'governance', priority: 2, sources: ['Reddit', 'LinkedIn'] },
  { term: 'Microsoft Purview Fabric', aliases: ['Purview data governance', 'Purview lineage'], personas: ['IT-manager', 'Data-manager'], theme: 'governance', priority: 2, sources: ['LinkedIn', 'Google'] },

  // ─── Data-manager ──────────────────────────────────────────────────
  { term: 'semantic model governance', aliases: ['semantic layer', 'enterprise semantic model'], personas: ['Data-manager', 'PBI-dev'], theme: 'governance', priority: 3, sources: ['LinkedIn', 'Google'] },
  { term: 'data lineage Power BI', aliases: ['dataset lineage', 'impact analysis'], personas: ['Data-manager', 'IT-manager'], theme: 'governance', priority: 2, sources: ['Reddit', 'Google'] },
  { term: 'master data management', aliases: ['MDM Power BI', 'master data governance'], personas: ['Data-manager'], theme: 'governance', priority: 2, sources: ['LinkedIn', 'Google'] },
  { term: 'data quality monitoring', aliases: ['data quality dashboards', 'DQ framework'], personas: ['Data-manager', 'PBI-dev'], theme: 'governance', priority: 2, sources: ['LinkedIn', 'Google'] },
  { term: 'metadata catalog', aliases: ['data catalog Fabric', 'OneLake catalog'], personas: ['Data-manager'], theme: 'governance', priority: 2, sources: ['LinkedIn', 'Google'] },
  { term: 'DataOps', aliases: ['DataOps best practices', 'DataOps Power BI'], personas: ['Data-manager', 'PBI-dev'], theme: 'architectuur', priority: 2, sources: ['LinkedIn', 'X'] },
  { term: 'data warehouse vs lakehouse', aliases: ['lakehouse architectuur', 'warehouse vs lake'], personas: ['Data-manager', 'CIO'], theme: 'architectuur', priority: 3, sources: ['LinkedIn', 'Reddit'] },

  // ─── Power BI developer ────────────────────────────────────────────
  { term: 'DAX performance', aliases: ['DAX optimalisatie', 'DAX optimization patterns'], personas: ['PBI-dev'], theme: 'performance', priority: 3, sources: ['Reddit', 'Google'] },
  { term: 'CALCULATE filter', aliases: ['CALCULATE context', 'filter context'], personas: ['PBI-dev'], theme: 'dax-modellering', priority: 2, sources: ['Reddit', 'Google'] },
  { term: 'Direct Lake', aliases: ['Direct Lake mode', 'Direct Lake Fabric'], personas: ['PBI-dev', 'Data-manager'], theme: 'migratie-fabric', priority: 3, sources: ['Reddit', 'LinkedIn'] },
  { term: 'composite models', aliases: ['composite model Power BI', 'DirectQuery composite'], personas: ['PBI-dev'], theme: 'architectuur', priority: 2, sources: ['Reddit', 'Google'] },
  { term: 'incremental refresh', aliases: ['incremental refresh Power BI', 'refresh policy'], personas: ['PBI-dev'], theme: 'performance', priority: 2, sources: ['Reddit', 'Google'] },
  { term: 'TMDL version control', aliases: ['TMDL git', 'Power BI source control'], personas: ['PBI-dev'], theme: 'architectuur', priority: 2, sources: ['Reddit', 'X'] },
  { term: 'calculation groups', aliases: ['calculation groups DAX', 'time intelligence'], personas: ['PBI-dev'], theme: 'dax-modellering', priority: 2, sources: ['Reddit', 'Google'] },
  { term: 'row-level security', aliases: ['RLS Power BI', 'dynamic RLS', 'OLS object level security'], personas: ['PBI-dev', 'IT-manager'], theme: 'security-rls', priority: 3, sources: ['Reddit', 'Google'] },
  { term: 'query folding', aliases: ['Power Query folding', 'native query'], personas: ['PBI-dev'], theme: 'performance', priority: 2, sources: ['Reddit', 'Google'] },
  { term: 'Power BI embedded', aliases: ['Power BI Embedded architectuur', 'embedded analytics SaaS'], personas: ['PBI-dev', 'IT-manager', 'CIO'], theme: 'embedded-saas', priority: 3, sources: ['Reddit', 'LinkedIn'] },
  { term: 'multi-tenant RLS', aliases: ['multi-tenant Power BI', 'tenant isolation'], personas: ['PBI-dev', 'IT-manager'], theme: 'embedded-saas', priority: 2, sources: ['Reddit', 'Google'] },

  // ─── AI / Copilot (cross-persona) ───────────────────────────────────
  { term: 'Copilot Power BI', aliases: ['Copilot in Power BI', 'Copilot readiness'], personas: ['CIO', 'PBI-dev', 'Data-manager'], theme: 'ai-copilot', priority: 3, sources: ['LinkedIn', 'Google'] },
  { term: 'Copilot semantic model', aliases: ['Copilot verified answers', 'semantic model descriptions'], personas: ['PBI-dev', 'Data-manager'], theme: 'ai-copilot', priority: 2, sources: ['LinkedIn', 'Reddit'] },
  { term: 'AI agents data', aliases: ['AI agent workflow', 'agentic analytics'], personas: ['CIO', 'Data-manager'], theme: 'ai-copilot', priority: 2, sources: ['X', 'LinkedIn'] },
  { term: 'Copilot kosten', aliases: ['Copilot ROI', 'Copilot licentie'], personas: ['CIO', 'IT-manager'], theme: 'kosten-licenties', priority: 2, sources: ['LinkedIn', 'Reddit'] },

  // ─── Migratie / Fabric (cross-persona) ──────────────────────────────
  { term: 'Fabric migratie', aliases: ['migratie naar Fabric', 'Fabric transition'], personas: ['CIO', 'IT-manager', 'PBI-dev'], theme: 'migratie-fabric', priority: 3, sources: ['LinkedIn', 'Google'] },
  { term: 'Fabric vs Premium', aliases: ['Power BI Premium einde', 'Fabric capacity vs Premium'], personas: ['CIO', 'IT-manager'], theme: 'migratie-fabric', priority: 3, sources: ['Reddit', 'LinkedIn'] },
  { term: 'OneLake', aliases: ['OneLake Fabric', 'OneLake shortcuts'], personas: ['Data-manager', 'PBI-dev'], theme: 'architectuur', priority: 2, sources: ['LinkedIn', 'Reddit'] },
  { term: 'Fabric Real-Time Intelligence', aliases: ['Fabric streaming', 'KQL Fabric'], personas: ['Data-manager', 'PBI-dev'], theme: 'architectuur', priority: 2, sources: ['LinkedIn', 'X'] },

  // ─── Adoption / change (CEO/CIO) ────────────────────────────────────
  { term: 'dashboards worden niet gebruikt', aliases: ['dashboard adoption', 'BI adoptie faalt'], personas: ['CEO', 'CIO', 'Data-manager'], theme: 'adoption-change', priority: 3, sources: ['LinkedIn', 'Reddit'] },
  { term: 'data literacy', aliases: ['data geletterdheid', 'data skills training'], personas: ['CEO', 'CIO'], theme: 'adoption-change', priority: 2, sources: ['LinkedIn', 'Google'] },
  { term: 'KPI dashboard design', aliases: ['KPI framework', 'executive dashboard'], personas: ['CEO', 'Data-manager'], theme: 'adoption-change', priority: 2, sources: ['LinkedIn', 'Google'] },

  // ─── Procesverbetering / LSS ────────────────────────────────────────
  { term: 'Lean Six Sigma BI', aliases: ['LSS Power BI', 'DMAIC dashboards'], personas: ['CEO', 'Data-manager'], theme: 'procesverbetering', priority: 2, sources: ['LinkedIn', 'Google'] },
  { term: 'DSO verkorten', aliases: ['days sales outstanding', 'debiteuren dashboard'], personas: ['CEO', 'Data-manager'], theme: 'procesverbetering', priority: 1, sources: ['LinkedIn', 'Google'] },
  { term: 'finance automation', aliases: ['finance rapportage automatiseren', 'CFO dashboard'], personas: ['CEO', 'Data-manager'], theme: 'procesverbetering', priority: 2, sources: ['LinkedIn', 'Google'] },
];

export const ALL_PERSONAS: Persona[] = ['CIO', 'CEO', 'IT-manager', 'Data-manager', 'PBI-dev'];
export const ALL_THEMES: Theme[] = [
  'architectuur', 'governance', 'kosten-licenties', 'migratie-fabric',
  'ai-copilot', 'performance', 'dax-modellering', 'security-rls',
  'procesverbetering', 'embedded-saas', 'adoption-change',
];
