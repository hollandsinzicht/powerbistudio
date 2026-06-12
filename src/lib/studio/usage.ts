import { supabase } from '@/lib/supabase';

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
