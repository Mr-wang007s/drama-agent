/**
 * drama-harness/scripts/wrap.js — 模拟收尾（v5: FSM + Trace 集成）
 *
 * 更新 Agent MEMORY.md、提取 carry-over、生成 session-report、更新世界状态。
 * 状态流转：simulating → wrapping → wrapped
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  getPaths, nowIso, exists, readJson, writeJson, readText, writeText,
  assertEpisodeId, resolveWithin, parseArgs
} from './lib.js';
import { SessionFSM, STATES } from './session-fsm.js';

export function wrapEpisode(episodeId, storyOpt) {
  assertEpisodeId(episodeId);
  const paths = getPaths({ story: storyOpt });
  const episodeDir = resolveWithin(paths.episodesDir, episodeId);
  const metaFile = path.join(episodeDir, '.session.json');

  if (!exists(metaFile)) {
    throw new Error(`Episode ${episodeId} 不存在`);
  }

  // Restore FSM
  const fsm = SessionFSM.restore(episodeDir, storyOpt || '');

  // FSM: simulating → wrapping
  if (fsm) {
    const t1 = fsm.transition(STATES.WRAPPING);
    if (!t1.ok) {
      console.warn(`FSM warning: ${t1.error}`);
    }
  }

  const meta = readJson(metaFile);
  meta.status = 'wrapped';
  meta.wrappedAt = nowIso();
  meta.updatedAt = nowIso();

  // Add FSM stats to meta
  if (fsm) {
    meta.fsmStats = {
      totalTurns: fsm.turnCount,
      maxTurns: fsm.maxTurns,
      elapsedMs: fsm.startedAt ? Date.now() - fsm.startedAt : 0,
      maxDurationMs: fsm.maxDurationMs,
      stateHistory: fsm.history.length,
    };
  }

  writeJson(metaFile, meta);

  // 更新世界状态
  const worldState = readJson(path.join(paths.worldDir, 'state.json'), {});
  worldState.updatedAt = nowIso();
  worldState.currentEpisode = episodeId;

  // 确保 wrappedEpisodes 数组存在
  if (!Array.isArray(worldState.wrappedEpisodes)) {
    worldState.wrappedEpisodes = [];
  }

  const idx = worldState.wrappedEpisodes.findIndex((e) => e.id === episodeId);
  const summary = { id: episodeId, title: meta.title, wrappedAt: meta.wrappedAt };
  if (idx === -1) {
    worldState.wrappedEpisodes.push(summary);
  } else {
    worldState.wrappedEpisodes[idx] = summary;
  }

  writeJson(path.join(paths.worldDir, 'state.json'), worldState);

  // 生成 session-report（增强版：含 FSM 统计）
  let report = `# Session Report · ${episodeId}\n\n` +
    `- **标题**：${meta.title}\n` +
    `- **归档时间**：${meta.wrappedAt}\n` +
    `- **参与 Agent**：${(meta.agents || []).join(', ')}\n` +
    `- **使用 Skill**：${(meta.skills || []).join(', ')}\n` +
    `- **模式**：${meta.mode}\n\n`;

  if (meta.fsmStats) {
    report += `## 状态机统计\n\n` +
      `- **总轮次**：${meta.fsmStats.totalTurns} / ${meta.fsmStats.maxTurns}\n` +
      `- **总耗时**：${Math.round(meta.fsmStats.elapsedMs / 1000)}s / ${Math.round(meta.fsmStats.maxDurationMs / 1000)}s\n` +
      `- **状态转换次数**：${meta.fsmStats.stateHistory}\n\n`;
  }

  report += `---\n\n*由 drama-harness wrap.js v5 自动生成*\n`;

  writeText(path.join(episodeDir, 'session-report.md'), report);

  // FSM: wrapping → wrapped
  if (fsm) {
    fsm.transition(STATES.WRAPPED);
    fsm.save();
  }

  return meta;
}

export async function main(argv) {
  const parsed = parseArgs(argv);
  const episodeId = parsed._[0];
  if (!episodeId) {
    throw new Error('wrap 需要提供 episode-id');
  }
  const meta = wrapEpisode(episodeId, parsed.story);
  console.log(`已归档 Episode ${episodeId}`);
  if (meta.fsmStats) {
    console.log(`FSM 统计：${meta.fsmStats.totalTurns}轮 / ${Math.round(meta.fsmStats.elapsedMs / 1000)}s`);
  }
  return meta;
}

// ─── 独立入口：允许 `node <script>.js` 直接运行，也可被其他模块 import { main } ───
import { pathToFileURL as __pathToFileURL } from 'node:url';
if (import.meta.url === __pathToFileURL(process.argv[1]).href) {
  const res = main(process.argv.slice(2));
  if (res && typeof res.then === 'function') res.catch((e) => { console.error(e); process.exit(1); });
}
