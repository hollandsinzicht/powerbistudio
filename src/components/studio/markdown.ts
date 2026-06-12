// Lichtgewicht markdown→HTML voor studio-output (AI-samenvatting en chat).
// Regelgebaseerd: codeblokken, tabellen, koppen, lijsten, scheidingslijnen en
// alinea's. Eerst wordt álles HTML-escaped (neutraliseert script/HTML in
// model-output of via prompt-injection), daarna pas opmaak toegepast.

const ESCAPE_MAP: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

// Inline-opmaak binnen een al ge-escapete regel: bold, italic, inline code.
function inline(text: string): string {
    return text
        .replace(/`([^`\n]+)`/g, '<code class="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded text-[#1E3A5F]">$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--color-neutral-900)]">$1</strong>')
        .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
}

const TABLE_SEPARATOR = /^\|[\s\-:|]+\|$/;

function isTableRow(line: string): boolean {
    return line.startsWith('|') && line.slice(1).includes('|');
}

function splitRow(line: string): string[] {
    return line
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim());
}

function renderTable(rows: string[]): string {
    const header = splitRow(rows[0]);
    const bodyRows = rows.slice(TABLE_SEPARATOR.test(rows[1] ?? '') ? 2 : 1);
    const th = header
        .map((h) => `<th class="text-left font-semibold text-[var(--color-neutral-900)] px-3 py-1.5 border-b border-[var(--color-neutral-200)]">${inline(h)}</th>`)
        .join('');
    const trs = bodyRows
        .map((r) => {
            const tds = splitRow(r)
                .map((c) => `<td class="px-3 py-1.5 border-b border-[var(--color-neutral-100)] align-top">${inline(c)}</td>`)
                .join('');
            return `<tr>${tds}</tr>`;
        })
        .join('');
    return `<div class="my-3 overflow-x-auto"><table class="text-sm w-full border-collapse"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`;
}

export function renderStudioMarkdown(text: string): string {
    const lines = escapeHtml(text.replace(/\r\n/g, '\n')).split('\n');
    const out: string[] = [];

    let codeLines: string[] | null = null;
    let listItems: string[] = [];
    let listOrdered = false;
    let paragraph: string[] = [];

    const flushParagraph = () => {
        if (paragraph.length) {
            out.push(`<p class="my-2">${paragraph.map(inline).join('<br/>')}</p>`);
            paragraph = [];
        }
    };
    const flushList = () => {
        if (listItems.length) {
            const tag = listOrdered ? 'ol' : 'ul';
            const cls = listOrdered ? 'list-decimal' : 'list-disc';
            out.push(`<${tag} class="${cls} ml-5 my-2 space-y-1">${listItems.join('')}</${tag}>`);
            listItems = [];
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // codeblokken (```dax … ```)
        if (trimmed.startsWith('```')) {
            flushParagraph();
            flushList();
            if (codeLines === null) {
                codeLines = [];
            } else {
                out.push(
                    `<div class="my-3 bg-gray-50 p-3 rounded-lg font-mono text-xs border border-[var(--color-neutral-200)] overflow-x-auto text-[#1E3A5F]"><pre><code>${codeLines.join('\n')}</code></pre></div>`
                );
                codeLines = null;
            }
            continue;
        }
        if (codeLines !== null) {
            codeLines.push(line);
            continue;
        }

        // tabellen: opeenvolgende |-regels verzamelen
        if (isTableRow(trimmed)) {
            flushParagraph();
            flushList();
            const tableRows = [trimmed];
            while (i + 1 < lines.length && isTableRow(lines[i + 1].trim())) {
                tableRows.push(lines[++i].trim());
            }
            out.push(renderTable(tableRows));
            continue;
        }

        if (!trimmed) {
            flushParagraph();
            flushList();
            continue;
        }

        if (/^-{3,}$/.test(trimmed)) {
            flushParagraph();
            flushList();
            out.push('<hr class="my-4 border-[var(--color-neutral-200)]"/>');
            continue;
        }

        let m = trimmed.match(/^(#{2,4})\s+(.*)$/);
        if (m) {
            flushParagraph();
            flushList();
            const cls =
                m[1].length === 2
                    ? 'font-semibold text-[var(--color-primary-900)] mt-5 mb-1.5'
                    : 'font-semibold text-[var(--color-neutral-900)] mt-4 mb-1';
            out.push(`<h4 class="${cls}">${inline(m[2])}</h4>`);
            continue;
        }

        m = trimmed.match(/^[-*]\s+(.*)$/);
        if (m) {
            flushParagraph();
            if (listItems.length && listOrdered) flushList();
            listOrdered = false;
            listItems.push(`<li>${inline(m[1])}</li>`);
            continue;
        }
        m = trimmed.match(/^\d+\.\s+(.*)$/);
        if (m) {
            flushParagraph();
            if (listItems.length && !listOrdered) flushList();
            listOrdered = true;
            listItems.push(`<li>${inline(m[1])}</li>`);
            continue;
        }

        flushList();
        paragraph.push(trimmed);
    }

    // onafgesloten codeblok (bv. tijdens streaming): toon als code
    if (codeLines !== null) {
        out.push(
            `<div class="my-3 bg-gray-50 p-3 rounded-lg font-mono text-xs border border-[var(--color-neutral-200)] overflow-x-auto text-[#1E3A5F]"><pre><code>${codeLines.join('\n')}</code></pre></div>`
        );
    }
    flushParagraph();
    flushList();

    return out.join('');
}
