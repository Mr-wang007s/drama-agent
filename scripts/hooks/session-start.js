import fs from 'node:fs';
import path from 'node:path';

const stateFile = path.join(process.cwd(), 'dramaspec', 'series-state.json');
if (!fs.existsSync(stateFile)) {
  process.exit(0);
}

const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
console.error(`[DramaAgent SessionStart] currentEpisode=${state.currentEpisode ?? 'none'}`);
console.error(`[DramaAgent SessionStart] carryOvers=${(state.carryOvers || []).length}`);
