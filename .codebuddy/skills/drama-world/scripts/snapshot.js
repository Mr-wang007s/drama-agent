/**
 * drama-world/scripts/snapshot.js — 快照与回滚
 *
 * 迁移自 cli.js snapshotEpisode / listSnapshots / commandRoll。
 * 扩展为支持世界状态 + Agent 记忆的完整快照。
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  getPaths, stamp, ensureDir, exists, readJson,
  assertEpisodeId, resolveWithin, parseArgs
} from './lib.js';

export function createSnapshot(episodeId, storyOpt) {
  assertEpisodeId(episodeId);
  const paths = getPaths({ story: storyOpt });
  const tag = stamp();
  const snapshotDir = path.join(paths.snapshotRoot, episodeId, tag);
  ensureDir(path.dirname(snapshotDir));

  // 快照 episode 目录
  const episodeDir = resolveWithin(paths.episodesDir, episodeId);
  if (exists(episodeDir)) {
    fs.cpSync(episodeDir, path.join(snapshotDir, 'episode'), { recursive: true });
  }

  // 快照世界状态
  if (exists(paths.worldDir)) {
    fs.cpSync(paths.worldDir, path.join(snapshotDir, 'world'), { recursive: true });
  }

  // 快照 Agent 记忆（只快照 MEMORY.md，不快照 SOUL.yaml）
  if (exists(paths.agentsDir)) {
    const agents = fs.readdirSync(paths.agentsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory());
    for (const agent of agents) {
      const memFile = path.join(paths.agentsDir, agent.name, 'MEMORY.md');
      if (exists(memFile)) {
        const dest = path.join(snapshotDir, 'agents', agent.name, 'MEMORY.md');
        ensureDir(path.dirname(dest));
        fs.copyFileSync(memFile, dest);
      }
    }
  }

  return snapshotDir;
}

export function listSnapshots(episodeId, storyOpt) {
  assertEpisodeId(episodeId);
  const paths = getPaths({ story: storyOpt });
  const snapshotDir = resolveWithin(paths.snapshotRoot, episodeId);
  if (!exists(snapshotDir)) return [];
  return fs.readdirSync(snapshotDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

export function rollbackTo(episodeId, target = 'latest', storyOpt) {
  assertEpisodeId(episodeId);
  const snapshots = listSnapshots(episodeId, storyOpt);
  if (snapshots.length === 0) {
    throw new Error(`Episode ${episodeId} 没有可用快照`);
  }

  const selected = target === 'latest' ? snapshots[snapshots.length - 1] : target;
  if (!snapshots.includes(selected)) {
    throw new Error(`非法快照：${selected}`);
  }

  const paths = getPaths({ story: storyOpt });
  const source = resolveWithin(paths.snapshotRoot, episodeId, selected);

  // 先做安全快照
  createSnapshot(episodeId, storyOpt);

  // 恢复 episode
  const episodeSource = path.join(source, 'episode');
  const episodeDest = resolveWithin(paths.episodesDir, episodeId);
  if (exists(episodeSource)) {
    fs.rmSync(episodeDest, { recursive: true, force: true });
    fs.cpSync(episodeSource, episodeDest, { recursive: true });
  }

  // 恢复世界状态
  const worldSource = path.join(source, 'world');
  if (exists(worldSource)) {
    fs.cpSync(worldSource, paths.worldDir, { recursive: true });
  }

  // 恢复 Agent 记忆
  const agentsSource = path.join(source, 'agents');
  if (exists(agentsSource)) {
    const agents = fs.readdirSync(agentsSource, { withFileTypes: true })
      .filter((e) => e.isDirectory());
    for (const agent of agents) {
      const memSrc = path.join(agentsSource, agent.name, 'MEMORY.md');
      const memDest = path.join(paths.agentsDir, agent.name, 'MEMORY.md');
      if (exists(memSrc)) {
        fs.copyFileSync(memSrc, memDest);
      }
    }
  }

  return selected;
}

export async function main(argv) {
  const parsed = parseArgs(argv);
  // 子命令：create <ep> / rollback <ep> / 默认（向后兼容）= rollback
  const sub = parsed._[0];
  const knownSubs = ['create', 'rollback', 'roll', 'list'];
  let action, episodeId;
  if (knownSubs.includes(sub)) {
    action = sub === 'roll' ? 'rollback' : sub;
    episodeId = parsed._[1];
  } else {
    action = 'rollback';
    episodeId = parsed._[0];
  }
  if (!episodeId && action !== 'list') {
    throw new Error(`${action} 需要提供 episode-id`);
  }

  if (action === 'create') {
    const dir = createSnapshot(episodeId, parsed.story);
    console.log(`已创建快照：${dir}`);
    return dir;
  }
  if (action === 'list') {
    const list = listSnapshots(parsed._[1], parsed.story);
    console.log(JSON.stringify(list, null, 2));
    return list;
  }
  // rollback
  const target = parsed.to || 'latest';
  const selected = rollbackTo(episodeId, target, parsed.story);
  console.log(`已将 ${episodeId} 回滚到快照 ${selected}`);
  return selected;
}

// ─── 独立入口：允许 `node <script>.js` 直接运行，也可被其他模块 import { main } ───
import { pathToFileURL as __pathToFileURL } from 'node:url';
if (import.meta.url === __pathToFileURL(process.argv[1]).href) {
  const res = main(process.argv.slice(2));
  if (res && typeof res.then === 'function') res.catch((e) => { console.error(e); process.exit(1); });
}
