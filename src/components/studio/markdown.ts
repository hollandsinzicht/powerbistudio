// Lichtgewicht markdown→HTML voor studio-output (AI-samenvatting en chat).
// Zelfde aanpak als de DAX Assistant: eerst alles HTML-escapen (neutraliseert
// script/HTML in model-output of via prompt-injection), daarna pas de
// markdown-markers omzetten.

const ESCAPE_MAP: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

export function renderStudioMarkdown(text: string): string {
    let html = text.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);

    html = html
        .replace(
            /```(?:dax)?\n([\s\S]*?)```/g,
            '<div class="my-3 bg-gray-50 p-3 rounded-lg font-mono text-xs border border-[var(--color-neutral-200)] overflow-x-auto text-[#1E3A5F]"><pre><code>$1</code></pre></div>'
        )
        .replace(/^### (.*)$/gm, '<h4 class="font-semibold text-[var(--color-neutral-900)] mt-4 mb-1">$1</h4>')
        .replace(/^## (.*)$/gm, '<h3 class="font-semibold text-[var(--color-primary-900)] mt-5 mb-1.5">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[var(--color-neutral-900)]">$1</strong>')
        .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
        .replace(/`([^`\n]+)`/g, '<code class="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded text-[#1E3A5F]">$1</code>')
        .replace(/^- (.*)$/gm, '<li class="ml-4 list-disc">$1</li>')
        .replace(/^(\d+)\. (.*)$/gm, '<li class="ml-4 list-decimal">$2</li>');

    return html;
}
