/**
 * drama-harness/scripts/status.js — 状态查询（Monorepo 大仓版）
 *
 * 无 --story 时列出所有故事子项目摘要。
 * 指定 --story 时显示该故事的世界状态 + Agent 状态 + 记忆摘要。
 */

import fs from 'node:fs';
import path from 'node:path';
import { getPaths, listStories, exists, readJson, readText, parseArgs } from './lib.js';

export function getWorldStatus(storyOpt) {
  const paths = getPaths({ story: storyOpt });
  const state = readJson(path.join(paths.worldDir, 'state.json'), {});
  return {
    title: state.title || state.meta?.storyTitle || '未命名',
    currentEpisode: state.currentEpisode || state.current?.episode || 'none',
    wrappedEpisodes: (state.wrappedEpisodes || []).length,
    carryOvers: (state.carryOvers || state.carryOver || []).length,
    updatedAt: state.updatedAt || state.meta?.updatedAt || 'unknown',
  };
}

export function getAgentStatus(agentId, storyOpt) {
  const paths = getPaths({ story: storyOpt });
  const agentDir = path.join(paths.agentsDir, agentId);
  if (!exists(agentDir)) return null;

  const soulFile = path.join(agentDir, 'SOUL.yaml');
  const memFile = path.join(agentDir, 'MEMORY.md');
  const soul = readText(soulFile);
  const memory = readText(memFile);

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

export function getAllAgentStatus(storyOpt) {
  const paths = getPaths({ story: storyOpt });
  if (!exists(paths.agentsDir)) return [];
  return fs.readdirSync(paths.agentsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && exists(path.join(paths.agentsDir, e.name, 'SOUL.yaml')))
    .map((e) => getAgentStatus(e.name, storyOpt))
    .filter(Boolean);
}

export function getEpisodeStatus(episodeId, storyOpt) {
  const paths = getPaths({ story: storyOpt });
  const episodeDir = path.join(paths.episodesDir, episodeId);
  const metaFile = path.join(episodeDir, '.session.json');
  if (!exists(metaFile)) return null;
  return readJson(metaFile);
}

export async function main(argv) {
  const parsed = parseArgs(argv);
  const storyOpt = parsed.story;
  const episodeId = parsed._[0];

  // 无 --story：列出所有故事子项目
  if (!storyOpt && !episodeId) {
    const stories = listStories();
    if (stories.length === 0) {
      console.log('尚无故事子项目。使用 drama-agent init --name <name> 创建。');
      return;
    }
    console.log(`共 ${stories.length} 个故事：\n`);
    for (const s of stories) {
      const genre = s.genre ? ` [${s.genre}]` : '';
      console.log(`  📖 ${s.name} — ${s.title}${genre}`);
    }
    console.log('\n使用 --story <name> 查看故事详情。');
    return;
  }

  // 有 --story 无 episodeId：显示故事全局状态
  if (!episodeId) {
    const world = getWorldStatus(storyOpt);
    console.log(`故事：${world.title} (${storyOpt})`);
    console.log(`当前集：${world.currentEpisode}`);
    console.log(`已归档：${world.wrappedEpisodes} 集`);
    console.log(`Carry-over：${world.carryOvers} 个`);
    console.log('');

    const agents = getAllAgentStatus(storyOpt);
    for (const a of agents) {
      console.log(`Agent ${a.name} | ${a.status} | ${a.emotion} | 记忆 ${a.memoryUsage}`);
    }
    return;
  }

  // 单集状态
  const ep = getEpisodeStatus(episodeId, storyOpt);
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
