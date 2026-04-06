/**
 * Eenmalig seed-script: vult de Supabase nurture_emails tabel
 * met de 4 sequences (20 emails totaal) uit nurture-sequences.ts
 *
 * Gebruik: npx tsx scripts/seed-nurture.ts
 *
 * Vereist: NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten in .env.local staan');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Importeer de sequences (kopie van src/lib/nurture-sequences.ts inhoud)
// We importeren het direct via dynamic import zodat we niet afhankelijk zijn
// van Next.js path aliassen in dit script
async function main() {
  const { NURTURE_SEQUENCES } = await import('../src/lib/nurture-sequences.js').catch(async () => {
    return await import('../src/lib/nurture-sequences.ts' as string);
  });

  let inserted = 0;
  let updated = 0;

  for (const [vertical, emails] of Object.entries(NURTURE_SEQUENCES)) {
    for (const email of emails as Array<{ sequenceNumber: number; subject: string; bodyHtml: string; delayDays: number }>) {
      // Check of deze al bestaat
      const { data: existing } = await supabase
        .from('nurture_emails')
        .select('id')
        .eq('vertical', vertical)
        .eq('sequence_number', email.sequenceNumber)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('nurture_emails')
          .update({
            subject: email.subject,
            body_html: email.bodyHtml,
            delay_days: email.delayDays,
          })
          .eq('id', existing.id);
        if (error) {
          console.error(`Fout bij update ${vertical}/${email.sequenceNumber}:`, error.message);
        } else {
          console.log(`Updated: ${vertical}/${email.sequenceNumber} — ${email.subject}`);
          updated++;
        }
      } else {
        const { error } = await supabase.from('nurture_emails').insert({
          vertical,
          sequence_number: email.sequenceNumber,
          subject: email.subject,
          body_html: email.bodyHtml,
          delay_days: email.delayDays,
        });
        if (error) {
          console.error(`Fout bij insert ${vertical}/${email.sequenceNumber}:`, error.message);
        } else {
          console.log(`Inserted: ${vertical}/${email.sequenceNumber} — ${email.subject}`);
          inserted++;
        }
      }
    }
  }

  console.log(`\nResultaat: ${inserted} nieuw, ${updated} bijgewerkt`);
}

main().catch(console.error);
