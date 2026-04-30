/**
 * Pure utilities voor pillar-gidsen: TOC-extractie en heading-id-injectie.
 * Geen IO. Wordt server-side aangeroepen op de pillar-detailpagina.
 */

/**
 * Slugify een heading-tekst tot een URL-vriendelijke anchor-id.
 * Lower-case, accenten weg, alleen [a-z0-9-], max 80 chars.
 */
export function slugifyHeading(input: string): string {
    return input
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80)
}

export interface TocEntry {
    id: string
    text: string
    level: 2 | 3
}

const HEADING_RE = /<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi

/** Strip HTML-tags binnen heading-content, decoderen blijft beperkt tot &amp;/&nbsp;. */
function stripInnerTags(html: string): string {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * Loop door de HTML-content en bouw een TOC van alle H2/H3-koppen.
 * Dedupliceert id's (-2, -3, ... suffix) zodat dubbele kopnamen niet
 * naar dezelfde anchor verwijzen.
 */
export function extractToc(html: string): TocEntry[] {
    const entries: TocEntry[] = []
    const used = new Map<string, number>()

    for (const match of html.matchAll(HEADING_RE)) {
        const level = Number(match[1]) as 2 | 3
        const text = stripInnerTags(match[2])
        if (!text) continue

        const base = slugifyHeading(text) || `sectie-${entries.length + 1}`
        const count = used.get(base) ?? 0
        used.set(base, count + 1)
        const id = count === 0 ? base : `${base}-${count + 1}`

        entries.push({ id, text, level })
    }

    return entries
}

/**
 * Vervang elke <h2>/<h3> in de HTML door dezelfde tag mét een id-attribuut
 * gebaseerd op de overeenkomstige TocEntry. Bestaande id-attributen worden
 * gerespecteerd: zo'n heading wordt ongemoeid gelaten.
 *
 * De volgorde van entries moet exact overeenkomen met de volgorde van de
 * heading-tags in `html` (wat extractToc al garandeert).
 */
export function injectHeadingIds(html: string, entries: TocEntry[]): string {
    let i = 0
    return html.replace(HEADING_RE, (full, level: string, inner: string) => {
        const entry = entries[i++]
        if (!entry) return full
        // Heeft de heading al een id? Laat dan de hele tag staan.
        if (/\sid\s*=/.test(full.split('>')[0])) return full
        return `<h${level} id="${entry.id}">${inner}</h${level}>`
    })
}
