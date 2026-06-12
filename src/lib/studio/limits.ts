// Beta-limieten voor Studio. Eén plek, zodat fase 2 (betaalde plannen) dit
// alleen hoeft te vervangen door een plan-lookup per gebruiker.

export const MAX_PROJECTS = 2;
export const MAX_CHAT_MESSAGES_PER_MONTH = 50;
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

// Schema-markdown groter dan dit wordt ingekort vóór de LLM-context
// (kostenplafond; ~400 KB ≈ 100K tokens).
export const MAX_SCHEMA_CONTEXT_BYTES = 400 * 1024;

export const ALLOWED_UPLOAD_EXTENSIONS = ['.pbit', '.bim', '.json', '.tmdl', '.zip'];

export const STORAGE_BUCKET = 'pbi-models';

export function fileExtension(filename: string): string {
    const idx = filename.lastIndexOf('.');
    return idx >= 0 ? filename.slice(idx).toLowerCase() : '';
}

export function isAllowedUpload(filename: string): boolean {
    return ALLOWED_UPLOAD_EXTENSIONS.includes(fileExtension(filename));
}
