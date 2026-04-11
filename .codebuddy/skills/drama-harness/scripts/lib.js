/**
 * drama-harness/scripts/lib.js — 共享工具库
 *
 * 所有 Skill 脚本通过 import { ... } from '../../drama-harness/scripts/lib.js' 使用。
 * 从 src/cli.js 迁移全部通用工具函数。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── 路径常量工厂 ───

export function getPaths(workspaceRoot = process.cwd()) {
  const packageRoot = path.resolve(__dirname, '..', '..', '..', '..');
  return {
    packageRoot,
    workspaceRoot,
    worldDir: path.join(workspaceRoot, 'world'),
    agentsDir: path.join(workspaceRoot, 'agents'),
    episodesDir: path.join(workspaceRoot, 'episodes'),
    snapshotRoot: path.join(workspaceRoot, '.snapshots'),
    templatesDir: path.join(packageRoot, 'templates'),
    // 兼容旧版
    dramaspecDir: path.join(workspaceRoot, 'dramaspec'),
    legacyEpisodesDir: path.join(workspaceRoot, 'dramaspec', 'episodes'),
    legacyCharactersDir: path.join(workspaceRoot, 'dramaspec', 'characters'),
  };
}

// ─── 时间工具 ───

export function nowIso() {
  return new Date().toISOString();
}

export function stamp() {
  return nowIso().replace(/[:.]/g, '-');
}

// ─── 文件工具 ───

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function exists(filePath) {
  return fs.existsSync(filePath);
}

export function readText(filePath, fallback = '') {
  if (!exists(filePath)) return fallback;
  return fs.readFileSync(filePath, 'utf8');
}

export function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

export function readJson(filePath, fallback = null) {
  if (!exists(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function writeJson(filePath, value) {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

// ─── 安全工具 ───

export function resolveWithin(root, ...parts) {
  const absoluteRoot = path.resolve(root);
  const target = path.resolve(absoluteRoot, ...parts);
  const relative = path.relative(absoluteRoot, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('路径越界');
  }
  return target;
}

// ─── 校验工具 ───

export function assertEpisodeId(episodeId) {
  if (!/^ep\d{2}(?:[-_][a-z0-9]+(?:[-_][a-z0-9]+)*)?$/i.test(episodeId)) {
    throw new Error(`非法 episode-id：${episodeId}`);
  }
}

export function assertAgentId(agentId) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/i.test(agentId)) {
    throw new Error(`非法 agent-id：${agentId}`);
  }
}

// ─── 参数解析 ───

export function parseArgs(argv) {
  const parsed = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      parsed._.push(token);
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    i++;
  }
  return parsed;
}
