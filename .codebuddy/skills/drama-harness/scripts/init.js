/**
 * drama-harness/scripts/init.js — 模拟初始化
 *
 * 创建 episode 目录、快照当前状态、设状态为 simulating。
 * 合并了原 cli.js 的 commandNew + commandBrief 逻辑。
 */

import path from 'node:path';
import {
  getPaths, nowIso, ensureDir, exists, readJson, writeJson, writeText,
  assertEpisodeId, resolveWithin
} from './lib.js';

export function initEpisode(episodeId, options = {}) {
  assertEpisodeId(episodeId);
  const paths = getPaths();
  const episodeDir = resolveWithin(paths.episodesDir, episodeId);

  if (exists(episodeDir) && !options.force) {
    throw new Error(`Episode ${episodeId} 已存在`);
  }

  // 创建目录结构
  ensureDir(episodeDir);
  ensureDir(path.join(episodeDir, 'runtime'));
  ensureDir(path.join(episodeDir, 'output'));

  // 创建 session 元数据
  const meta = {
    id: episodeId,
    title: options.title || episodeId.replace(/^ep\d+[-_]?/i, '').replace(/[-_]/g, ' ') || episodeId,
    logline: options.logline || '',
    agents: options.agents || [],
    skills: options.skills || ['screenplay'],
    status: 'simulating',
    mode: options.mode || 'team',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  writeJson(path.join(episodeDir, '.session.json'), meta);

  // 更新世界状态
  const worldState = readJson(path.join(paths.worldDir, 'state.json'), {});
  worldState.currentEpisode = episodeId;
  worldState.updatedAt = nowIso();
  writeJson(path.join(paths.worldDir, 'state.json'), worldState);

  return { meta, episodeDir };
}

// CLI 入口
export async function main(argv) {
  const episodeId = argv[0];
  if (!episodeId) {
    throw new Error('init 需要提供 episode-id');
  }
  const options = {};
  for (let i = 1; i < argv.length; i += 2) {
    if (argv[i]?.startsWith('--')) {
      options[argv[i].slice(2)] = argv[i + 1] || true;
    }
  }
  if (options.agents && typeof options.agents === 'string') {
    options.agents = options.agents.split(',');
  }
  const { meta, episodeDir } = initEpisode(episodeId, options);
  console.log(`已初始化 Episode ${episodeId} → ${episodeDir}`);
  return meta;
}
