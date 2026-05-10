/**
 * Berekent leestijd in minuten van een tekst-blok.
 *
 * Gebruikt 220 woorden per minuut — ongeveer NL-leesgemiddelde voor
 * technische content. Strip HTML-tags voordat de woordtelling gebeurt
 * zodat tags zoals <strong> en <code> de count niet vervuilen.
 */
export function readingTime(htmlOrText: string | null | undefined): number {
  if (!htmlOrText) return 1;
  const plainText = htmlOrText.replace(/<[^>]+>/g, ' ');
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 1;
  return Math.max(1, Math.round(words / 220));
}
