#!/usr/bin/env node
/**
 * reader-panel.js — 读者 Team 调度器（Phase 4.5）
 *
 * 并行 spawn 4 个读者画像 Task Agent，收集打分和反馈，汇总均分。
 *
 * 用法：
 *   node scripts/reader-panel.js --story <name> --episode <ep-id>
 *   node scripts/reader-panel.js --file path/to/novel.md --output path/to/report.md
 *
 * 退出码：
 *   0 = 均分 ≥ 7.0（通过）
 *   1 = 均分 < 7.0（硬阻断）
 *   2 = 参数错误
 *
 * 注意：此脚本为 Director 流水线调度使用，实际读者 Agent 由 Director
 * 通过 CodeBuddy Task 工具 spawn。本脚本主要提供：
 * - 读者画像 prompt 模板生成
 * - 报告格式校验
 * - 均分计算与门控判定
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

// 读者画像定义
const READERS = [
  {
    id: 'zhang-ge',
    name: '张哥',
    profile: '网文老书虫（男35）',
    focus: '节奏/爽感/钩子密度',
    bias: '偏严（-0.5~-1）',
  },
  {
    id: 'xiao-yue',
    name: '小悦',
    profile: '通勤追更党（女26）',
    focus: '角色萌点/CP张力/情绪共鸣',
    bias: '偏感性（+0.5）',
  },
  {
    id: 'lin-xiaojie',
    name: '林小姐',
    profile: '文学质感派（女32）',
    focus: '语言/意象/留白/不做Over-Connect',
    bias: '稳定客观',
  },
  {
    id: 'lao-zhou',
    name: '老周',
    profile: '出版编辑（男48）',
    focus: '结构完整/市场性/翻页欲',
    bias: '商业眼光',
  },
];

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--story') args.story = argv[++i];
    else if (a === '--episode') args.episode = argv[++i];
    else if (a === '--file') args.file = argv[++i];
    else if (a === '--output') args.output = argv[++i];
    else if (a === '--scores') args.scores = argv[++i]; // JSON: [7.5, 8.0, 7.0, 6.5]
  }
  return args;
}

function resolveNovelFile(args) {
  if (args.file) return path.resolve(args.file);
  if (args.story && args.episode) {
    return path.join(ROOT, 'stories', args.story, 'episodes', args.episode, 'output', 'novel.md');
  }
  return null;
}

function resolveOutputFile(args) {
  if (args.output) return path.resolve(args.output);
  if (args.story && args.episode) {
    return path.join(ROOT, 'stories', args.story, 'episodes', args.episode, 'output', 'reader-panel-report.md');
  }
  return null;
}

function calculateGate(scores) {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((s, x) => s + (x - avg) ** 2, 0) / scores.length;
  let gate;
  if (avg >= 8.0) gate = 'PASS_DIRECT';       // 直接通过
  else if (avg >= 7.0) gate = 'TRIGGER_EXPERT'; // 触发专家
  else gate = 'BLOCK';                          // 硬阻断

  return { avg: Math.round(avg * 100) / 100, variance: Math.round(variance * 100) / 100, gate };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  // 如果提供了 --scores，直接做门控计算
  if (args.scores) {
    const scores = JSON.parse(args.scores);
    const result = calculateGate(scores);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.gate === 'BLOCK' ? 1 : 0);
  }

  const novelFile = resolveNovelFile(args);
  if (!novelFile) {
    console.error('用法: reader-panel.js --story <name> --episode <ep-id>');
    console.error('     或 reader-panel.js --file <novel.md> --output <report.md>');
    console.error('     或 reader-panel.js --scores "[7.5,8.0,7.0,6.5]"');
    process.exit(2);
  }

  if (!fs.existsSync(novelFile)) {
    console.error(`❌ 文件不存在: ${novelFile}`);
    process.exit(2);
  }

  // 输出读者画像配置（供 Director spawn 时使用）
  console.log('\n=== 读者 Team 配置 ===\n');
  console.log(`小说文件: ${path.relative(ROOT, novelFile)}`);
  console.log(`报告输出: ${resolveOutputFile(args) ? path.relative(ROOT, resolveOutputFile(args)) : '(需指定)'}`);
  console.log('\n读者画像：');
  READERS.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.name}（${r.profile}）— 关注：${r.focus} — 偏向：${r.bias}`);
  });
  console.log('\n门控规则：');
  console.log('  均分 ≥ 8.0 → PASS_DIRECT（跳过专家）');
  console.log('  7.0 ≤ 均分 < 8.0 → TRIGGER_EXPERT（触发专家团）');
  console.log('  均分 < 7.0 → BLOCK（硬阻断，必须修订）');
  console.log('\n请 Director 通过 Task 工具 spawn 4 个读者 Agent 并收集打分。');
  console.log('收集完成后调用: reader-panel.js --scores "[x,x,x,x]" 做门控判定。');
}

main();
