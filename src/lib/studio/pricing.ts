// Prijsraming voor Claude-verbruik in Studio. Het model is claude-sonnet-4-6.
// Tarieven in USD per miljoen tokens (Sonnet-tier). Verifieer/actualiseer via de
// claude-api skill; pas ze hier op één plek aan.
//
// LET OP: dit is een bovengrens. De chat gebruikt prompt caching (cache-reads
// zijn ~10% van het inputtarief), dus de echte kosten liggen lager. Bewust
// conservatief: liever iets overschatten dan de klant verrassen.

export const USD_PER_MTOK_INPUT = 3;
export const USD_PER_MTOK_OUTPUT = 15;
export const USD_TO_EUR = 0.92;

/** Geschatte kosten in euro voor een gegeven aantal in-/output-tokens. */
export function estimateCostEur(inputTokens: number, outputTokens: number): number {
    const usd =
        (inputTokens / 1_000_000) * USD_PER_MTOK_INPUT +
        (outputTokens / 1_000_000) * USD_PER_MTOK_OUTPUT;
    return usd * USD_TO_EUR;
}
