/**
 * drama-world/scripts/init.js — 模拟初始化（v5: FSM 集成）
 *
 * 创建 episode 目录、快照当前状态、通过状态机管理生命周期。
 * 状态流转：idle → initializing → context-ready
 */

import path from 'node:path';
import {
  getPaths, nowIso, ensureDir, exists, readJson, writeJson, writeText,
  assertEpisodeId, resolveWithin, parseArgs
} from './lib.js';
import { SessionFSM, STATES } from './session-fsm.js';

export function initEpisode(episodeId, options = {}) {
  assertEpisodeId(episodeId);
  const paths = getPaths({ story: options.story });
  const episodeDir = resolveWithin(paths.episodesDir, episodeId);

  if (exists(episodeDir) && !options.force) {
    throw new Error(`Episode ${episodeId} 已存在`);
  }

  // 创建状态机
  const fsm = new SessionFSM(episodeId, options.story || '', {
    maxTurns: options.maxTurns ?? 50,
    maxDurationMs: options.maxDurationMs ?? 30 * 60 * 1000,
  });

  // idle → initializing
  const t1 = fsm.transition(STATES.INITIALIZING);
  if (!t1.ok) throw new Error(t1.error);

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
    status: 'initializing',
    mode: options.mode || 'team',
    maxTurns: options.maxTurns ?? 50,
    maxDurationMs: options.maxDurationMs ?? 30 * 60 * 1000,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  writeJson(path.join(episodeDir, '.session.json'), meta);

  // 更新世界状态
  const worldState = readJson(path.join(paths.worldDir, 'state.json'), {});
  worldState.currentEpisode = episodeId;
  worldState.updatedAt = nowIso();
  writeJson(path.join(paths.worldDir, 'state.json'), worldState);

  // initializing → context-ready (preconditions auto-checked)
  const t2 = fsm.transition(STATES.CONTEXT_READY, {
    episodeDir,
    agents: options.agents || [],
  });
  if (!t2.ok) throw new Error(t2.error);

  // Persist FSM state
  fsm.save();

  return { meta, episodeDir, fsm };
}

// CLI 入口
export async function main(argv) {
  const parsed = parseArgs(argv);
  const episodeId = parsed._[0];
  if (!episodeId) {
    throw new Error('sim 需要提供 episode-id');
  }
  const options = {
    story: parsed.story,
    title: parsed.title,
    logline: parsed.logline,
    agents: parsed.agents ? (typeof parsed.agents === 'string' ? parsed.agents.split(',') : parsed.agents) : [],
    skills: parsed.skill ? (typeof parsed.skill === 'string' ? parsed.skill.split(',') : parsed.skill) : ['screenplay'],
    mode: parsed.mode,
    force: parsed.force === true,
    maxTurns: parsed['max-turns'] ? parseInt(parsed['max-turns'], 10) : 50,
    maxDurationMs: parsed['max-duration'] ? parseInt(parsed['max-duration'], 10) * 60 * 1000 : 30 * 60 * 1000,
  };
  const { meta, episodeDir, fsm } = initEpisode(episodeId, options);
  console.log(`已初始化 Episode ${episodeId} → ${episodeDir}`);
  console.log(`状态机：${fsm.state} | 最大轮次：${fsm.maxTurns} | 最大时长：${Math.round(fsm.maxDurationMs / 60000)}min`);
  return meta;
}

// ─── 独立入口：允许 `node <script>.js` 直接运行，也可被其他模块 import { main } ───
import { pathToFileURL as __pathToFileURL } from 'node:url';
if (import.meta.url === __pathToFileURL(process.argv[1]).href) {
  const res = main(process.argv.slice(2));
  if (res && typeof res.then === 'function') res.catch((e) => { console.error(e); process.exit(1); });
}
