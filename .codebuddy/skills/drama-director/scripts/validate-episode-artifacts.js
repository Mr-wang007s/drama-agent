#!/usr/bin/env node
/**
 * validate-episode-artifacts.js — 整集非 novel 产物字数配额硬门控
 *
 * 用途：
 *   Phase 5 → Phase 6 之间强制调用 · EXIT=0 才允许进 wrap
 *   核心原则：novel.md 是核心产出 · 其余所有产物都是为 novel 服务的 · 总量 ≤ 1.5× ~ 2× novel
 *
 * 字数配额（唯一事实源：workflow.md "## 非 novel 产物字数配额"）：
 *   error 级（超量阻断）：
 *     episode-brief.md            ≤ 1500
 *     beat-sheet.md               ≤ 2500
 *     runtime/reader-preview.md   ≤ 800
 *     runtime/agent-audit-log.md  ≤ 1500
 *     runtime/beats-*.md（每文件）≤ 400
 *   warning 级（超量允许但需在 wrap-report 注明）：
 *     output/editor-review.md     ≤ 1200
 *     output/reader-verdict.md    ≤ 1500
 *     wrap-report.md              ≤ 1200
 *
 * 用法：
 *   node validate-episode-artifacts.js --story <name>                  # 校验 currentEpisode（读 state.json）
 *   node validate-episode-artifacts.js --story <name> --episode <id>   # 校验指定集
 *   node validate-episode-artifacts.js --story <name> --json           # JSON 输出
 *   node validate-episode-artifacts.js --story <name> --strict         # warning 也算 FAIL
 *
 * 退出码：
 *   0 = 全部通过（含 warning 级超量 · 非 --strict 模式）
 *   1 = 至少一个 error 级超量 · 或 --strict 模式下任意超量
 *   2 = 参数错误 / 故事或集不存在
 *
 * 向后兼容：
 *   只校验当前指定集 · 历史集（ep02/03/04/05-v1-backup 等）不扫描
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

// ============ 配额表（唯一事实源） ============
const ARTIFACT_QUOTAS = [
  { name: 'episode-brief.md',             relPath: 'episode-brief.md',                limit: 1500, level: 'error' },
  { name: 'beat-sheet.md',                relPath: 'beat-sheet.md',                   limit: 2500, level: 'error' },
  { name: 'runtime/reader-preview.md',    relPath: 'runtime/reader-preview.md',       limit: 800,  level: 'error' },
  { name: 'runtime/agent-audit-log.md',   relPath: 'runtime/agent-audit-log.md',      limit: 1500, level: 'error' },
  { name: 'output/editor-review.md',      relPath: 'output/editor-review.md',         limit: 1200, level: 'warning' },
  { name: 'output/reader-verdict.md',     relPath: 'output/reader-verdict.md',        limit: 1500, level: 'warning' },
  { name: 'wrap-report.md',               relPath: 'wrap-report.md',                  limit: 1200, level: 'warning' },
];

// glob 型配额（每文件独立上限）
const GLOB_QUOTAS = [
  { name: 'runtime/beats-*.md',           glob:    /^runtime\/beats-.+\.md$/,         limit: 400,  level: 'error' },
];

// ============ 工具函数 ============
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--story') args.story = argv[++i];
    else if (a === '--episode') args.episode = argv[++i];
    else if (a === '--json') args.json = true;
    else if (a === '--strict') args.strict = true;
  }
  return args;
}

function countChineseChars(text) {
  return (text.match(/[\u4e00-\u9fff]/g) || []).length;
}

function resolveEpisodeId(story, explicitEpisode) {
  if (explicitEpisode) return explicitEpisode;
  const statePath = path.join(ROOT, 'stories', story, 'world', 'state.json');
  if (!fs.existsSync(statePath)) return null;
  try {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    return state.currentEpisode || null;
  } catch {
    return null;
  }
}

function listBeatsFiles(episodeDir) {
  const runtimeDir = path.join(episodeDir, 'runtime');
  if (!fs.existsSync(runtimeDir)) return [];
  return fs.readdirSync(runtimeDir)
    .filter(f => /^beats-.+\.md$/.test(f))
    .map(f => ({
      name: `runtime/${f}`,
      relPath: `runtime/${f}`,
      fullPath: path.join(runtimeDir, f),
    }));
}

// ============ 核心校验 ============
function validateArtifacts(story, episode) {
  const episodeDir = path.join(ROOT, 'stories', story, 'episodes', episode);
  if (!fs.existsSync(episodeDir)) {
    return { error: `episode 目录不存在: stories/${story}/episodes/${episode}` };
  }

  const results = [];

  // 固定产物
  for (const quota of ARTIFACT_QUOTAS) {
    const fullPath = path.join(episodeDir, quota.relPath);
    const exists = fs.existsSync(fullPath);
    let words = 0;
    if (exists) {
      const text = fs.readFileSync(fullPath, 'utf8');
      words = countChineseChars(text);
    }
    const overLimit = words > quota.limit;
    results.push({
      name: quota.name,
      path: `stories/${story}/episodes/${episode}/${quota.relPath}`,
      exists,
      words,
      limit: quota.limit,
      level: quota.level,
      status: !exists ? 'MISSING' : overLimit ? (quota.level === 'error' ? 'FAIL' : 'WARN') : 'OK',
    });
  }

  // glob 型产物（每个 beats-*.md 独立校验）
  for (const glob of GLOB_QUOTAS) {
    const files = listBeatsFiles(episodeDir);
    if (files.length === 0) {
      results.push({
        name: glob.name,
        path: `stories/${story}/episodes/${episode}/runtime/`,
        exists: false,
        words: 0,
        limit: glob.limit,
        level: glob.level,
        status: 'MISSING',
      });
      continue;
    }
    for (const file of files) {
      const text = fs.readFileSync(file.fullPath, 'utf8');
      const words = countChineseChars(text);
      const overLimit = words > glob.limit;
      results.push({
        name: file.name,
        path: `stories/${story}/episodes/${episode}/${file.relPath}`,
        exists: true,
        words,
        limit: glob.limit,
        level: glob.level,
        status: overLimit ? (glob.level === 'error' ? 'FAIL' : 'WARN') : 'OK',
      });
    }
  }

  // 统计
  const totalWords = results.filter(r => r.exists).reduce((sum, r) => sum + r.words, 0);
  const fails = results.filter(r => r.status === 'FAIL');
  const warns = results.filter(r => r.status === 'WARN');
  const missings = results.filter(r => r.status === 'MISSING');

  // novel 字数参考（不强制存在 · Phase 2/3 之前还没有）
  const novelPath = path.join(episodeDir, 'output', 'novel.md');
  let novelWords = 0;
  if (fs.existsSync(novelPath)) {
    novelWords = countChineseChars(fs.readFileSync(novelPath, 'utf8'));
  }
  const ratio = novelWords > 0 ? (totalWords / novelWords).toFixed(2) : null;

  return {
    story,
    episode,
    artifacts: results,
    summary: {
      totalWords,
      novelWords,
      ratio,                   // 非 novel 总量 / novel 字数
      fails: fails.length,
      warns: warns.length,
      missings: missings.length,
      passed: fails.length === 0,
    },
  };
}

// ============ 输出 ============
function printHuman(result, strict) {
  if (result.error) {
    console.error(`❌ ${result.error}`);
    return;
  }

  console.log(`\n=== Episode Artifacts 字数配额校验 ===\n`);
  console.log(`Story:   ${result.story}`);
  console.log(`Episode: ${result.episode}\n`);

  const ICON = { OK: '✅', WARN: '⚠️ ', FAIL: '❌', MISSING: '⚪' };
  const nameWidth = Math.max(...result.artifacts.map(a => a.name.length), 25);
  for (const a of result.artifacts) {
    const icon = ICON[a.status] || '?';
    const wordStr = a.exists ? `${String(a.words).padStart(4)}` : '  --';
    const limitStr = String(a.limit).padStart(4);
    const pct = a.exists ? ` (${Math.round((a.words / a.limit) * 100)}%)` : '';
    const levelTag = a.level === 'error' ? '[error]' : '[warn] ';
    console.log(`${icon} ${levelTag} ${a.name.padEnd(nameWidth)} ${wordStr} / ${limitStr}${pct}`);
  }

  console.log('');
  console.log(`非 novel 总量：${result.summary.totalWords} 字`);
  if (result.summary.novelWords > 0) {
    console.log(`novel.md:      ${result.summary.novelWords} 字`);
    console.log(`配比（非核心/novel）：${result.summary.ratio}× ${result.summary.ratio <= 2.0 ? '✅ 达标 (≤2.0×)' : '⚠️ 超过 2.0× 目标'}`);
  } else {
    console.log(`novel.md:      未生成（Phase 3 之前正常）`);
  }

  const strictFail = strict && (result.summary.fails > 0 || result.summary.warns > 0);
  const normalFail = result.summary.fails > 0;

  if (normalFail) {
    console.log(`\n❌ 配额校验失败：${result.summary.fails} 个 error 级超量`);
    console.log(`   必须精简到配额内才能进 Phase 6 wrap · 详见 workflow.md "## 非 novel 产物字数配额"`);
  } else if (strictFail) {
    console.log(`\n❌ --strict 模式下失败：${result.summary.warns} 个 warning 级超量`);
  } else if (result.summary.warns > 0) {
    console.log(`\n⚠️  ${result.summary.warns} 个 warning 级超量（允许继续 · 但建议在 wrap-report 注明原因）`);
  } else {
    console.log(`\n✅ 所有配额通过`);
  }

  if (result.summary.missings > 0) {
    console.log(`\n⚪ ${result.summary.missings} 个产物未生成（Phase 进度原因 · 非错误）`);
  }
}

// ============ 主流程 ============
function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.story) {
    console.error('用法: validate-episode-artifacts.js --story <name> [--episode <id>] [--json] [--strict]');
    process.exit(2);
  }

  const storyDir = path.join(ROOT, 'stories', args.story);
  if (!fs.existsSync(storyDir)) {
    console.error(`❌ 故事不存在: stories/${args.story}`);
    process.exit(2);
  }

  const episode = resolveEpisodeId(args.story, args.episode);
  if (!episode) {
    console.error(`❌ 无法确定 episode：请显式指定 --episode <id> · 或在 state.json 中设置 currentEpisode`);
    process.exit(2);
  }

  const result = validateArtifacts(args.story, episode);

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHuman(result, args.strict);
  }

  if (result.error) process.exit(2);

  const strictFail = args.strict && (result.summary.fails > 0 || result.summary.warns > 0);
  const normalFail = result.summary.fails > 0;

  process.exit((normalFail || strictFail) ? 1 : 0);
}

main();
