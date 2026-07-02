import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';

// Markdown → nette PDF. Ondersteunt koppen, alinea's, opsommingen (bullets én
// genummerd), **vet**, `code`, codeblokken, tabellen, blockquotes en scheids-
// lijnen. Doel: leesbare documenten, geen wall-of-code.

const COLORS = {
    ink: '#1f2937',
    navy: '#0f2540',
    blue: '#25507a',
    muted: '#6b7280',
    faint: '#9ca3af',
    line: '#e5e7eb',
    codeBg: '#f6f8fa',
    codeInk: '#334155',
    accent: '#2563eb',
    zebra: '#f9fafb',
    headBg: '#f3f4f6',
};

const styles = StyleSheet.create({
    page: { paddingTop: 54, paddingBottom: 54, paddingHorizontal: 48, fontSize: 10, color: COLORS.ink, lineHeight: 1.5, fontFamily: 'Helvetica' },
    header: { marginBottom: 18, paddingBottom: 10, borderBottom: `1 solid ${COLORS.line}` },
    brand: { fontSize: 9, color: COLORS.muted, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
    title: { fontSize: 19, fontFamily: 'Helvetica-Bold', color: COLORS.navy, marginTop: 6 },
    date: { fontSize: 8, color: COLORS.faint, marginTop: 3 },

    h1: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: COLORS.navy, marginTop: 16, marginBottom: 6 },
    h2: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: COLORS.navy, marginTop: 14, marginBottom: 5, paddingBottom: 3, borderBottom: `1 solid ${COLORS.line}` },
    h3: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: COLORS.blue, marginTop: 10, marginBottom: 4 },

    para: { marginBottom: 6 },
    bold: { fontFamily: 'Helvetica-Bold' },
    italic: { fontFamily: 'Helvetica-Oblique' },
    codeInline: { fontFamily: 'Courier', fontSize: 9, color: '#b02a37' },

    listItem: { flexDirection: 'row', marginBottom: 3, paddingLeft: 4 },
    marker: { width: 16, color: COLORS.accent },
    markerNum: { width: 18, color: COLORS.muted, fontFamily: 'Helvetica-Bold' },
    listText: { flex: 1 },

    codeBlock: { fontFamily: 'Courier', fontSize: 8.5, color: COLORS.codeInk, backgroundColor: COLORS.codeBg, padding: 8, marginBottom: 8, borderLeft: `2 solid ${COLORS.line}` },

    quote: { flexDirection: 'row', marginBottom: 6 },
    quoteBar: { width: 3, backgroundColor: COLORS.line, marginRight: 8 },
    quoteText: { flex: 1, color: COLORS.muted, fontFamily: 'Helvetica-Oblique' },

    hr: { borderBottom: `1 solid ${COLORS.line}`, marginVertical: 10 },

    table: { marginBottom: 10, borderTop: `1 solid ${COLORS.line}`, borderLeft: `1 solid ${COLORS.line}` },
    tr: { flexDirection: 'row' },
    trHead: { backgroundColor: COLORS.headBg },
    trAlt: { backgroundColor: COLORS.zebra },
    cell: { flex: 1, padding: 5, fontSize: 9, borderRight: `1 solid ${COLORS.line}`, borderBottom: `1 solid ${COLORS.line}` },
    cellHead: { fontFamily: 'Helvetica-Bold', color: COLORS.navy },

    footer: { position: 'absolute', bottom: 28, left: 48, right: 48, fontSize: 8, color: COLORS.faint, textAlign: 'center' },
});

// ── Inline (vet, cursief, code) ──────────────────────────────────────────────
function inline(text: string, keyBase = 0): React.ReactNode[] {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|_[^_]+_)/g).filter((p) => p !== '');
    return parts.map((p, i) => {
        const key = `${keyBase}-${i}`;
        if (p.startsWith('**') && p.endsWith('**')) return <Text key={key} style={styles.bold}>{p.slice(2, -2)}</Text>;
        if (p.startsWith('`') && p.endsWith('`')) return <Text key={key} style={styles.codeInline}>{p.slice(1, -1)}</Text>;
        if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <Text key={key} style={styles.italic}>{p.slice(1, -1)}</Text>;
        if (p.startsWith('_') && p.endsWith('_') && p.length > 2) return <Text key={key} style={styles.italic}>{p.slice(1, -1)}</Text>;
        return <Text key={key}>{p}</Text>;
    });
}

// ── Block-parser ─────────────────────────────────────────────────────────────
type Block =
    | { t: 'h'; level: number; text: string }
    | { t: 'p'; text: string }
    | { t: 'ul'; items: string[] }
    | { t: 'ol'; items: string[] }
    | { t: 'code'; text: string }
    | { t: 'quote'; text: string }
    | { t: 'hr' }
    | { t: 'table'; header: string[]; rows: string[][] };

function splitRow(line: string): string[] {
    return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

function isTableSeparator(line: string): boolean {
    if (!line.includes('|') && !line.includes('-')) return false;
    const cells = splitRow(line);
    return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
}

function isTableRow(line: string): boolean {
    return line.includes('|') && splitRow(line).length >= 2;
}

function parseBlocks(markdown: string): Block[] {
    const lines = markdown.replace(/\r\n/g, '\n').split('\n');
    const blocks: Block[] = [];
    let i = 0;

    while (i < lines.length) {
        const raw = lines[i];
        const line = raw.trim();

        // Lege regel
        if (!line) { i++; continue; }

        // Codeblok
        if (line.startsWith('```')) {
            const code: string[] = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                code.push(lines[i]);
                i++;
            }
            i++; // sluitende fence
            blocks.push({ t: 'code', text: code.join('\n') });
            continue;
        }

        // Scheidingslijn
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) { blocks.push({ t: 'hr' }); i++; continue; }

        // Tabel (rij + separator eronder)
        if (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
            const header = splitRow(line);
            i += 2; // header + separator
            const rows: string[][] = [];
            while (i < lines.length && isTableRow(lines[i].trim()) && lines[i].trim()) {
                rows.push(splitRow(lines[i]));
                i++;
            }
            blocks.push({ t: 'table', header, rows });
            continue;
        }

        // Koppen
        const h = line.match(/^(#{1,6})\s+(.*)$/);
        if (h) { blocks.push({ t: 'h', level: h[1].length, text: h[2] }); i++; continue; }

        // Blockquote
        if (line.startsWith('>')) {
            const quote: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith('>')) {
                quote.push(lines[i].trim().replace(/^>\s?/, ''));
                i++;
            }
            blocks.push({ t: 'quote', text: quote.join(' ') });
            continue;
        }

        // Genummerde lijst
        if (/^\d+[.)]\s+/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ''));
                i++;
            }
            blocks.push({ t: 'ol', items });
            continue;
        }

        // Opsomming
        if (/^[-*+]\s+/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^[-*+]\s+/, ''));
                i++;
            }
            blocks.push({ t: 'ul', items });
            continue;
        }

        // Alinea (voeg opeenvolgende gewone regels samen)
        const para: string[] = [line];
        i++;
        while (i < lines.length) {
            const next = lines[i].trim();
            if (!next || next.startsWith('#') || next.startsWith('```') || next.startsWith('>') ||
                /^[-*+]\s+/.test(next) || /^\d+[.)]\s+/.test(next) ||
                /^(-{3,}|\*{3,}|_{3,})$/.test(next) ||
                (isTableRow(next) && i + 1 < lines.length && isTableSeparator(lines[i + 1]))) {
                break;
            }
            para.push(next);
            i++;
        }
        blocks.push({ t: 'p', text: para.join(' ') });
    }

    return blocks;
}

function renderBlock(b: Block, key: number): React.ReactNode {
    switch (b.t) {
        case 'h': {
            const style = b.level <= 1 ? styles.h1 : b.level === 2 ? styles.h2 : styles.h3;
            return <Text key={key} style={style}>{inline(b.text, key)}</Text>;
        }
        case 'p':
            return <Text key={key} style={styles.para}>{inline(b.text, key)}</Text>;
        case 'ul':
            return (
                <View key={key} style={{ marginBottom: 6 }}>
                    {b.items.map((it, j) => (
                        <View key={j} style={styles.listItem}>
                            <Text style={styles.marker}>•</Text>
                            <Text style={styles.listText}>{inline(it, key * 100 + j)}</Text>
                        </View>
                    ))}
                </View>
            );
        case 'ol':
            return (
                <View key={key} style={{ marginBottom: 6 }}>
                    {b.items.map((it, j) => (
                        <View key={j} style={styles.listItem}>
                            <Text style={styles.markerNum}>{j + 1}.</Text>
                            <Text style={styles.listText}>{inline(it, key * 100 + j)}</Text>
                        </View>
                    ))}
                </View>
            );
        case 'code':
            return <Text key={key} style={styles.codeBlock}>{b.text}</Text>;
        case 'quote':
            return (
                <View key={key} style={styles.quote}>
                    <View style={styles.quoteBar} />
                    <Text style={styles.quoteText}>{inline(b.text, key)}</Text>
                </View>
            );
        case 'hr':
            return <View key={key} style={styles.hr} />;
        case 'table':
            return (
                <View key={key} style={styles.table}>
                    <View style={[styles.tr, styles.trHead]}>
                        {b.header.map((c, ci) => (
                            <Text key={ci} style={[styles.cell, styles.cellHead]}>{inline(c, key * 1000 + ci)}</Text>
                        ))}
                    </View>
                    {b.rows.map((r, ri) => (
                        <View key={ri} style={ri % 2 === 1 ? [styles.tr, styles.trAlt] : styles.tr}>
                            {b.header.map((_, ci) => (
                                <Text key={ci} style={styles.cell}>{inline(r[ci] ?? '', key * 1000 + ri * 10 + ci)}</Text>
                            ))}
                        </View>
                    ))}
                </View>
            );
    }
}

export function markdownPdfDocument(title: string, markdown: string) {
    const datum = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
    const blocks = parseBlocks(markdown);
    return (
        <Document title={title} author="PowerBIStudio.nl">
            <Page size="A4" style={styles.page}>
                <View style={styles.header} fixed>
                    <Text style={styles.brand}>POWERBISTUDIO.NL</Text>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.date}>Gegenereerd op {datum}</Text>
                </View>
                {blocks.map((b, i) => renderBlock(b, i))}
                <Text
                    style={styles.footer}
                    render={({ pageNumber, totalPages }) => `PowerBIStudio.nl · ${pageNumber} / ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    );
}

export async function renderMarkdownPdf(title: string, markdown: string): Promise<Buffer> {
    return renderToBuffer(markdownPdfDocument(title, markdown));
}
