/**
 * Eenmalig script voor het genereren van de team-avatars (ADA & LEX)
 * via Freepik Mystic. Schrijft PNG-bestanden naar /public/team/.
 *
 * Gebruik:
 *   FREEPIK_API_KEY=... npx tsx scripts/generate-team-avatars.ts
 *
 * Prompts kun je hier iteren tot beide avatars duidelijk AI-esthetiek
 * hebben (geen menselijke gezichten).
 */

import { config } from 'dotenv';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateTeamAvatar } from '../src/lib/image-generator';

config({ path: '.env.local' });
config({ path: '.env' });

const OUT_DIR = join(process.cwd(), 'public', 'team');

// Elke agent deelt dezelfde claymorphic body-anatomy (kleine chubby robot,
// TV-screen hoofdje met 2 dot-eyes). Variatie zit in body-kleur + prop dat
// de specialisatie uitbeeldt. Stijl: zie buildTeamAvatarPrompt in
// src/lib/image-generator.ts — TrySoro / Icons8 3D / Linear.
const agents = [
  {
    agentId: 'atlas',
    subject:
      'a chubby matte claymorphic robot with a slate-navy body (deep blue #1E3A5F) and subtle warm bronze/gold (#B8963E) accent panel on its chest. It is holding up a small floating 3D blueprint model — abstract stacked geometric blocks or mini-building shapes glowing softly in warm amber/gold. The other arm rests relaxed along the body. Pose suggests an architect presenting a design',
  },
  {
    agentId: 'nova',
    subject:
      'a chubby matte claymorphic robot with a teal-green body (#0F6E56) and subtle warm gold (#B8963E) accent panel on its chest. It is holding a small 3D compass or radar-scanner device with soft glowing rings radiating outward in gold. The other arm points gently at the device. Pose suggests a friendly scout measuring readiness',
  },
  {
    agentId: 'ada',
    subject:
      'a chubby matte claymorphic robot with a deep navy-blue body (#1E3A5F) and a warm amber/gold (#F59E0B) accent panel on its chest. It is holding up a small floating holographic card or tablet showing abstract colorful geometric blocks (representing a formula, NO text or numbers visible). The other arm rests relaxed. Pose suggests a helpful formula-assistant',
  },
  {
    agentId: 'lex',
    subject:
      'a chubby matte claymorphic robot with a purple body (#534AB7) and a warm orange (#D85A30) accent panel on its chest. It is holding a large rounded magnifying glass in one arm, inspecting something invisible in front of it. A small floating 3D checklist card hovers near its other shoulder (abstract colored lines and dots, NO text). Pose suggests a careful auditor at work',
  },
];

async function main() {
  console.log('[TEAM AVATARS] starting generation via Freepik Mystic...');

  for (const agent of agents) {
    console.log(`\n[${agent.agentId.toUpperCase()}] generating...`);
    const buf = await generateTeamAvatar(agent);

    if (!buf) {
      console.error(`[${agent.agentId.toUpperCase()}] FAILED — geen afbeelding ontvangen`);
      continue;
    }

    const outPath = join(OUT_DIR, `${agent.agentId}.png`);
    writeFileSync(outPath, buf);
    console.log(`[${agent.agentId.toUpperCase()}] saved → ${outPath}`);
  }

  console.log('\n[TEAM AVATARS] done. Review public/team/ada.png and public/team/lex.png.');
  console.log('Als output niet goed voelt, pas prompts aan in scripts/generate-team-avatars.ts en run opnieuw.');
}

main().catch((err) => {
  console.error('[TEAM AVATARS] fatal:', err);
  process.exit(1);
});
