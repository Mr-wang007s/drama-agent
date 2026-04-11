/**
 * drama-harness/scripts/wrap.js — 模拟收尾
 *
 * 更新 Agent MEMORY.md、提取 carry-over、生成 session-report、更新世界状态。
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  getPaths, nowIso, exists, readJson, writeJson, readText, writeText,
  assertEpisodeId, resolveWithin
} from './lib.js';

export function wrapEpisode(episodeId) {
  assertEpisodeId(episodeId);
  const paths = getPaths();
  const episodeDir = resolveWithin(paths.episodesDir, episodeId);
  const metaFile = path.join(episodeDir, '.session.json');

  if (!exists(metaFile)) {
    throw new Error(`Episode ${episodeId} 不存在`);
  }

  const meta = readJson(metaFile);
  meta.status = 'wrapped';
  meta.wrappedAt = nowIso();
  meta.updatedAt = nowIso();
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

  // 生成 session-report
  const report = `# Session Report · ${episodeId}\n\n` +
    `- **标题**：${meta.title}\n` +
    `- **归档时间**：${meta.wrappedAt}\n` +
    `- **参与 Agent**：${(meta.agents || []).join(', ')}\n` +
    `- **使用 Skill**：${(meta.skills || []).join(', ')}\n` +
    `- **模式**：${meta.mode}\n\n` +
    `---\n\n*由 drama-harness wrap.js 自动生成*\n`;

  writeText(path.join(episodeDir, 'session-report.md'), report);

  return meta;
}

export async function main(argv) {
  const episodeId = argv[0];
  if (!episodeId) {
    throw new Error('wrap 需要提供 episode-id');
  }
  const meta = wrapEpisode(episodeId);
  console.log(`已归档 Episode ${episodeId}`);
  return meta;
}
