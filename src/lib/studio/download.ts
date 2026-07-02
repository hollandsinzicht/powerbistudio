// Client-helper: vraagt de export-route om een artefact (md of pdf) en start de
// download in de browser. Bestandsnaam komt uit de Content-Disposition-header.

export type ExportSource = 'project' | 'portfolio';
export type ExportFormat = 'md' | 'pdf';

export async function exportArtifact(
    source: ExportSource,
    id: string,
    kind: string,
    format: ExportFormat
): Promise<void> {
    const res = await fetch('/api/studio/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, id, kind, format }),
    });
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? 'Download mislukte.');
    }

    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename="([^"]+)"/);
    const filename = match?.[1] ?? `${kind}.${format}`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
