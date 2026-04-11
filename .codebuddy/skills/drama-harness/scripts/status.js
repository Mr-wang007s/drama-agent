/**
 * drama-harness/scripts/status.js — 状态查询
 *
 * 世界状态 + Agent 状态 + 记忆摘要。
 */

import fs from 'node:fs';
import path from 'node:path';
import { getPaths, exists, readJson, readText } from './lib.js';

export function getWorldStatus() {
  const paths = getPaths();
  const state = readJson(path.join(paths.worldDir, 'state.json'), {});
  return {
    title: state.title || '未命名',
    currentEpisode: state.currentEpisode || 'none',
    wrappedEpisodes: (state.wrappedEpisodes || []).length,
    carryOvers: (state.carryOvers || []).length,
    updatedAt: state.updatedAt || 'unknown',
  };
}

export function getAgentStatus(agentId) {
  const paths = getPaths();
  const agentDir = path.join(paths.agentsDir, agentId);
  if (!exists(agentDir)) return null;

  const soulFile = path.join(agentDir, 'SOUL.yaml');
  const memFile = path.join(agentDir, 'MEMORY.md');
  const soul = readText(soulFile);
  const memory = readText(memFile);

  // 简单 YAML 解析
  const name = soul.match(/^name:\s*(.+)$/m)?.[1] || agentId;
  const status = soul.match(/^status:\s*(.+)$/m)?.[1] || 'unknown';
  const emotion = soul.match(/^emotion_state:\s*(.+)$/m)?.[1] || 'unknown';
  const capacity = parseInt(soul.match(/^memory_capacity:\s*(\d+)$/m)?.[1] || '2000', 10);

  return {
    id: agentId,
    name,
    status,
    emotion,
    memoryUsed: memory.length,
    memoryCapacity: capacity,
    memoryUsage: `${Math.round((memory.length / capacity) * 100)}%`,
  };
}

export function getAllAgentStatus() {
  const paths = getPaths();
  if (!exists(paths.agentsDir)) return [];
  return fs.readdirSync(paths.agentsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && exists(path.join(paths.agentsDir, e.name, 'SOUL.yaml')))
    .map((e) => getAgentStatus(e.name))
    .filter(Boolean);
}

export function getEpisodeStatus(episodeId) {
  const paths = getPaths();
  const episodeDir = path.join(paths.episodesDir, episodeId);
  const metaFile = path.join(episodeDir, '.session.json');
  if (!exists(metaFile)) return null;
  return readJson(metaFile);
}

export async function main(argv) {
  const episodeId = argv[0];

  if (!episodeId) {
    // 全局状态
    const world = getWorldStatus();
    console.log(`世界：${world.title}`);
    console.log(`当前集：${world.currentEpisode}`);
    console.log(`已归档：${world.wrappedEpisodes} 集`);
    console.log(`Carry-over：${world.carryOvers} 个`);
    console.log('');

    const agents = getAllAgentStatus();
    for (const a of agents) {
      console.log(`Agent ${a.name} | ${a.status} | ${a.emotion} | 记忆 ${a.memoryUsage}`);
    }
    return;
  }

  // 单集状态
  const ep = getEpisodeStatus(episodeId);
  if (!ep) {
    console.log(`Episode ${episodeId} 不存在`);
    return;
  }
  console.log(`Episode：${ep.id}`);
  console.log(`标题：${ep.title}`);
  console.log(`状态：${ep.status}`);
  console.log(`Agent：${(ep.agents || []).join(', ')}`);
  console.log(`Skill：${(ep.skills || []).join(', ')}`);
}
