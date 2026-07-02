import { supabase } from '@/lib/supabase';
import { estimateCostEur } from './pricing';

export type UsageKind = 'analysis' | 'chat' | 'deliverable' | 'portfolio';

export interface UsageBucket {
    actions: number;
    inputTokens: number;
    outputTokens: number;
    costEur: number;
}

export interface UsageEvent {
    kind: UsageKind;
    projectId: string | null;
    inputTokens: number;
    outputTokens: number;
    costEur: number;
    createdAt: string;
}

export interface UsageSummary {
    total: UsageBucket;
    month: UsageBucket;
    byKind: Array<{ kind: UsageKind } & UsageBucket>;
    recent: UsageEvent[];
}

const EMPTY = (): UsageBucket => ({ actions: 0, inputTokens: 0, outputTokens: 0, costEur: 0 });

function add(bucket: UsageBucket, input: number, output: number): void {
    bucket.actions += 1;
    bucket.inputTokens += input;
    bucket.outputTokens += output;
    bucket.costEur += estimateCostEur(input, output);
}

/**
 * Verbruiksoverzicht voor één gebruiker: totaal, deze maand, per soort en de
 * recente acties. Kosten zijn een raming (zie pricing.ts). Event-sourced uit
 * studio_usage, dus historisch volledig — ook na project-delete.
 */
export async function usageSummary(userId: string, recentLimit = 25): Promise<UsageSummary> {
    const { data, error } = await supabase
        .from('studio_usage')
        .select('kind, project_id, input_tokens, output_tokens, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('studio usage: summary failed', error.message);
        return { total: EMPTY(), month: EMPTY(), byKind: [], recent: [] };
    }

    const now = new Date();
    const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);

    const total = EMPTY();
    const month = EMPTY();
    const byKind = new Map<UsageKind, UsageBucket>();
    const recent: UsageEvent[] = [];

    for (const row of data ?? []) {
        const kind = row.kind as UsageKind;
        const input = row.input_tokens ?? 0;
        const output = row.output_tokens ?? 0;

        add(total, input, output);
        if (new Date(row.created_at).getTime() >= monthStart) add(month, input, output);

        const bucket = byKind.get(kind) ?? EMPTY();
        add(bucket, input, output);
        byKind.set(kind, bucket);

        if (recent.length < recentLimit) {
            recent.push({
                kind,
                projectId: row.project_id,
                inputTokens: input,
                outputTokens: output,
                costEur: estimateCostEur(input, output),
                createdAt: row.created_at,
            });
        }
    }

    return {
        total,
        month,
        byKind: [...byKind.entries()].map(([kind, b]) => ({ kind, ...b })),
        recent,
    };
}

/** Aantal gestelde chatvragen (user-berichten) in de huidige kalendermaand. */
export async function monthlyMessageCount(userId: string): Promise<number> {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const { count, error } = await supabase
        .from('studio_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('role', 'user')
        .gte('created_at', monthStart);
    if (error) {
        console.error('studio usage: count failed', error.message);
        // Fail-closed zou gebruikers bij een storing buitensluiten; de limiet
        // is een kostenrem, geen security-grens — dus fail-open.
        return 0;
    }
    return count ?? 0;
}
