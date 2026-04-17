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

const agents = [
  {
    agentId: 'ada',
    subject:
      'ADA, a friendly DAX-formula assistant robot. The robot has a rounded blue-navy body with warm amber/gold accents on its chest panel or antennas. It is holding or projecting a small floating holographic screen that shows abstract colored blocks and geometric shapes representing a formula (NO actual text or letters on the screen). Its expression is curious and helpful',
    gradient: 'deep navy (#1E3A5F) in the upper-left to warm amber (#F59E0B) in the lower-right',
  },
  {
    agentId: 'lex',
    subject:
      'LEX, a friendly model-auditor robot with a rounded purple body and warm orange accents on its chest panel or antennas. It is holding a large magnifying glass in one of its arms, carefully inspecting something. A tiny checklist-looking tablet floats near its other arm (NO actual text on the tablet). Its expression is attentive and thorough',
    gradient: 'deep purple (#534AB7) in the upper-left to warm orange (#D85A30) in the lower-right',
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
