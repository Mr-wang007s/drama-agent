/**
 * drama-world/scripts/update-world.js — 世界状态更新
 *
 * 从模拟产出中提取事件，更新 world/state.json 和 world/timeline.md。
 */

import path from 'node:path';
import {
  getPaths, nowIso, readJson, writeJson, readText, writeText
} from '../../drama-harness/scripts/lib.js';

export function updateWorldState(episodeId, events = [], newCarryOvers = []) {
  const paths = getPaths();

  // 更新 state.json
  const stateFile = path.join(paths.worldDir, 'state.json');
  const state = readJson(stateFile, {});

  state.updatedAt = nowIso();

  // 追加全局事件
  if (!Array.isArray(state.globalEvents)) state.globalEvents = [];
  for (const event of events) {
    state.globalEvents.push({ episode: episodeId, event });
  }

  // 更新 carry-overs
  if (newCarryOvers.length > 0) {
    state.carryOvers = newCarryOvers;
  }

  writeJson(stateFile, state);

  // 追加 timeline.md
  if (events.length > 0) {
    const timelineFile = path.join(paths.worldDir, 'timeline.md');
    const current = readText(timelineFile, '');
    const title = episodeId.replace(/^ep\d+-?/, '').replace(/-/g, ' ') || episodeId;
    const newSection = `\n## ${episodeId.toUpperCase()} — ${title}\n\n` +
      events.map((e) => `- ${e}`).join('\n') + '\n';

    writeText(timelineFile, current + newSection);
  }

  return state;
}

export async function main(argv) {
  const episodeId = argv[0];
  if (!episodeId) {
    throw new Error('update-world 需要提供 episode-id');
  }
  console.log(`请通过 API 调用 updateWorldState('${episodeId}', events, carryOvers) 更新世界状态。`);
}
