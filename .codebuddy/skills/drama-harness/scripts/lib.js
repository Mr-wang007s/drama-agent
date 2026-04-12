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

// ─── 路径常量工厂（Monorepo 大仓版） ───

/**
 * 从 cwd 自动检测当前所在的故事目录。
 * 如果 cwd 位于 packageRoot/stories/<name>/... 下，返回故事名；否则返回 null。
 */
export function detectStory(cwd = process.cwd(), packageRoot = path.resolve(__dirname, '..', '..', '..', '..')) {
  const storiesDir = path.join(packageRoot, 'stories');
  const rel = path.relative(storiesDir, cwd);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  const firstSegment = rel.split(path.sep)[0];
  if (!firstSegment || firstSegment === '.') return null;
  return firstSegment;
}

/**
 * 列出 stories/ 下所有故事子项目。
 * 读取每个子目录的 .story.json 元数据。
 */
export function listStories(packageRoot = path.resolve(__dirname, '..', '..', '..', '..')) {
  const storiesDir = path.join(packageRoot, 'stories');
  if (!fs.existsSync(storiesDir)) return [];
  return fs.readdirSync(storiesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => {
      const metaPath = path.join(storiesDir, d.name, '.story.json');
      const meta = fs.existsSync(metaPath)
        ? JSON.parse(fs.readFileSync(metaPath, 'utf8'))
        : {};
      return { name: d.name, title: meta.title || d.name, genre: meta.genre || '', ...meta };
    });
}

/**
 * 校验故事名称合法性
 */
export function assertStoryName(name) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error(`非法故事名称：${name}（只允许小写字母、数字和连字符，如 fog-manor）`);
  }
}

/**
 * getPaths — Monorepo 路径工厂
 *
 * @param {object|string} options - 选项对象，或向后兼容的 workspaceRoot 字符串
 * @param {string} [options.story] - 故事名称，如 "fog-manor"
 * @returns 所有路径常量
 */
export function getPaths(options = {}) {
  const packageRoot = path.resolve(__dirname, '..', '..', '..', '..');
  const storiesDir = path.join(packageRoot, 'stories');

  // 向后兼容：旧版传入字符串作为 workspaceRoot
  if (typeof options === 'string') {
    const cwd = options;
    const detected = detectStory(cwd, packageRoot);
    if (detected) {
      options = { story: detected };
    } else {
      // 纯向后兼容模式：cwd 不在 stories/ 下，回退旧行为
      return {
        packageRoot, storyName: null, storyRoot: cwd, storiesDir,
        worldDir: path.join(cwd, 'world'),
        agentsDir: path.join(cwd, 'agents'),
        episodesDir: path.join(cwd, 'episodes'),
        snapshotRoot: path.join(cwd, '.snapshots'),
        templatesDir: path.join(packageRoot, 'templates'),
        dramaspecDir: path.join(cwd, 'dramaspec'),
        legacyEpisodesDir: path.join(cwd, 'dramaspec', 'episodes'),
        legacyCharactersDir: path.join(cwd, 'dramaspec', 'characters'),
      };
    }
  }

  const storyName = options.story || detectStory(process.cwd(), packageRoot);
  const storyRoot = storyName
    ? resolveWithin(storiesDir, storyName)
    : process.cwd();

  return {
    packageRoot,
    storyName,
    storyRoot,
    storiesDir,
    worldDir: path.join(storyRoot, 'world'),
    agentsDir: path.join(storyRoot, 'agents'),
    episodesDir: path.join(storyRoot, 'episodes'),
    snapshotRoot: path.join(storyRoot, '.snapshots'),
    templatesDir: path.join(packageRoot, 'templates'),
    // 兼容旧版（deprecated）
    dramaspecDir: path.join(storyRoot, 'dramaspec'),
    legacyEpisodesDir: path.join(storyRoot, 'dramaspec', 'episodes'),
    legacyCharactersDir: path.join(storyRoot, 'dramaspec', 'characters'),
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
