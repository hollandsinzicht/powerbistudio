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
// TV-screen hoofdje met 2 dot-eyes, witte achtergrond). Variatie zit in
// body-kleur + prop dat de specialisatie uitbeeldt.
// Stijl: zie buildTeamAvatarPrompt in src/lib/image-generator.ts
// (TrySoro / Icons8 3D / Linear).
const agents = [
  {
    // Paars robotje met bar-chart → architectuur / stacked blocks
    agentId: 'atlas',
    subject:
      'a chubby matte claymorphic robot with a soft light-purple body (#A78BFA / lavender) and a white TV-screen face with two black dot eyes. It holds up one hand with a floating glowing 3D bar chart with 4 ascending golden/amber bars and small sparkle particles around it. The other arm rests along the body. Pose suggests an architect presenting stacked data building-blocks',
  },
  {
    // Blauw robotje met laptop → readiness scanner / inspecting code
    agentId: 'nova',
    subject:
      'a chubby matte claymorphic robot with a soft light-blue body (#93C5FD / sky blue) and a white TV-screen face with two black dot eyes. It is holding a small 3D laptop in front of it with both small arms, the laptop screen showing colorful horizontal code-stripe lines in magenta, yellow, and green (NO readable text). Pose suggests a friendly scout inspecting and measuring a system',
  },
  {
    // Groen robotje met gloeilamp → formula assistant / idea generator
    agentId: 'ada',
    subject:
      'a chubby matte claymorphic robot with a soft mint-green body (#A7F3D0 / light mint) and a white TV-screen face with two black dot eyes. It raises one small hand holding a glowing 3D lightbulb with warm amber light and small sparkle particles around it. The other arm rests along the body. Pose suggests a helpful assistant offering a bright idea',
  },
  {
    // Oranje robotje met checklist → auditor
    agentId: 'lex',
    subject:
      'a chubby matte claymorphic robot with a soft warm-orange body (#FDBA74) and a white TV-screen face with two black dot eyes. It is holding a small 3D clipboard with a checklist in one arm — the clipboard shows 3 horizontal gray lines next to green checkmarks (NO readable text). The other arm rests along the body. Pose suggests a careful auditor completing a review',
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
