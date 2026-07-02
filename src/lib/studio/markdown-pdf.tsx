import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';

// Pragmatische markdown→PDF: dekt wat onze gegenereerde documenten gebruiken
// (koppen #/##/###, opsommingen, codeblokken, **vet** en `code`). Geen volledige
// markdown-spec — tabellen e.d. worden als platte tekst weergegeven.

const styles = StyleSheet.create({
    page: { paddingTop: 54, paddingBottom: 54, paddingHorizontal: 48, fontSize: 10, color: '#1f2937', lineHeight: 1.5, fontFamily: 'Helvetica' },
    header: { marginBottom: 18, paddingBottom: 10, borderBottom: '1 solid #e5e7eb' },
    brand: { fontSize: 9, color: '#6b7280', fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
    title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#0f2540', marginTop: 6 },
    date: { fontSize: 8, color: '#9ca3af', marginTop: 3 },
    h1: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#0f2540', marginTop: 14, marginBottom: 5 },
    h2: { fontSize: 12.5, fontFamily: 'Helvetica-Bold', color: '#0f2540', marginTop: 12, marginBottom: 4 },
    h3: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#25507a', marginTop: 9, marginBottom: 3 },
    para: { marginBottom: 5 },
    bullet: { flexDirection: 'row', marginBottom: 2, paddingLeft: 6 },
    bulletDot: { width: 10 },
    bulletText: { flex: 1 },
    bold: { fontFamily: 'Helvetica-Bold' },
    codeInline: { fontFamily: 'Courier', backgroundColor: '#f3f4f6', color: '#1e3a5f' },
    codeBlock: { fontFamily: 'Courier', fontSize: 8.5, backgroundColor: '#f8fafc', color: '#334155', padding: 8, marginBottom: 6, borderRadius: 3 },
    footer: { position: 'absolute', bottom: 28, left: 48, right: 48, fontSize: 8, color: '#9ca3af', textAlign: 'center' },
});

function inline(text: string): React.ReactNode[] {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p !== '');
    return parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) return <Text key={i} style={styles.bold}>{p.slice(2, -2)}</Text>;
        if (p.startsWith('`') && p.endsWith('`')) return <Text key={i} style={styles.codeInline}>{p.slice(1, -1)}</Text>;
        return <Text key={i}>{p}</Text>;
    });
}

function renderBlocks(markdown: string): React.ReactNode[] {
    const lines = markdown.replace(/\r\n/g, '\n').split('\n');
    const out: React.ReactNode[] = [];
    let code: string[] | null = null;
    let key = 0;

    for (const raw of lines) {
        const line = raw;
        const fence = line.trim().startsWith('```');

        if (code !== null) {
            if (fence) {
                out.push(<Text key={key++} style={styles.codeBlock}>{code.join('\n')}</Text>);
                code = null;
            } else {
                code.push(line);
            }
            continue;
        }
        if (fence) {
            code = [];
            continue;
        }

        const t = line.trim();
        if (!t) continue;

        if (t.startsWith('### ')) out.push(<Text key={key++} style={styles.h3}>{inline(t.slice(4))}</Text>);
        else if (t.startsWith('## ')) out.push(<Text key={key++} style={styles.h2}>{inline(t.slice(3))}</Text>);
        else if (t.startsWith('# ')) out.push(<Text key={key++} style={styles.h1}>{inline(t.slice(2))}</Text>);
        else if (t.startsWith('- ') || t.startsWith('* ')) {
            out.push(
                <View key={key++} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{inline(t.slice(2))}</Text>
                </View>
            );
        } else {
            out.push(<Text key={key++} style={styles.para}>{inline(t)}</Text>);
        }
    }
    if (code !== null) out.push(<Text key={key++} style={styles.codeBlock}>{code.join('\n')}</Text>);
    return out;
}

export function markdownPdfDocument(title: string, markdown: string) {
    const datum = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
    return (
        <Document title={title} author="PowerBIStudio.nl">
            <Page size="A4" style={styles.page}>
                <View style={styles.header} fixed>
                    <Text style={styles.brand}>POWERBISTUDIO.NL</Text>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.date}>Gegenereerd op {datum}</Text>
                </View>
                {renderBlocks(markdown)}
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
