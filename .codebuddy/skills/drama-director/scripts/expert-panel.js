#!/usr/bin/env node
/**
 * expert-panel.js — 专家 Team 调度器（Phase 4.6）
 *
 * 并行 spawn 4 个专家顾问 Task Agent，收集诊断和处方。
 *
 * 用法：
 *   node scripts/expert-panel.js --story <name> --episode <ep-id>
 *   node scripts/expert-panel.js --check-trigger --episode-number <N> --reader-avg <X.X>
 *
 * 退出码：
 *   0 = 正常（无硬门控）
 *   2 = 参数错误
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

const EXPERTS = [
  {
    id: 'lao-chen',
    name: '老陈',
    profile: '资深编剧',
    specialty: '结构/节奏/反转/反派线',
    style: '直接犀利',
  },
  {
    id: 'q-laoshi',
    name: 'Q老师',
    profile: '悬疑小说家',
    specialty: '诡计/线索/信息差/钩子',
    style: '技术流',
  },
  {
    id: 'xu-jiaoshou',
    name: '许教授',
    profile: '文学教授',
    specialty: '意象/语言/身体诗学/留白',
    style: '学术但实操',
  },
  {
    id: 'k-jiaolian',
    name: 'K教练',
    profile: '写作教练',
    specialty: '角色语言/对话/破防/沉默',
    style: '手把手示范',
  },
];

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--story') args.story = argv[++i];
    else if (a === '--episode') args.episode = argv[++i];
    else if (a === '--check-trigger') args.checkTrigger = true;
    else if (a === '--episode-number') args.episodeNumber = parseInt(argv[++i], 10);
    else if (a === '--reader-avg') args.readerAvg = parseFloat(argv[++i]);
  }
  return args;
}

function shouldTrigger(episodeNumber, readerAvg) {
  // 触发条件：读者均分 <8.0 或每 3 集强制
  if (readerAvg < 8.0) return { trigger: true, reason: `读者均分 ${readerAvg} < 8.0` };
  if (episodeNumber % 3 === 0) return { trigger: true, reason: `第 ${episodeNumber} 集，每 3 集强制触发` };
  return { trigger: false, reason: `读者均分 ${readerAvg} ≥ 8.0 且非 3 集强制点` };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  // 触发条件检查模式
  if (args.checkTrigger) {
    if (args.episodeNumber === undefined || args.readerAvg === undefined) {
      console.error('用法: expert-panel.js --check-trigger --episode-number <N> --reader-avg <X.X>');
      process.exit(2);
    }
    const result = shouldTrigger(args.episodeNumber, args.readerAvg);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  // 配置输出模式
  if (!args.story || !args.episode) {
    console.error('用法: expert-panel.js --story <name> --episode <ep-id>');
    console.error('     或 expert-panel.js --check-trigger --episode-number <N> --reader-avg <X.X>');
    process.exit(2);
  }

  const novelFile = path.join(ROOT, 'stories', args.story, 'episodes', args.episode, 'output', 'novel.md');
  const readerReport = path.join(ROOT, 'stories', args.story, 'episodes', args.episode, 'output', 'reader-panel-report.md');

  console.log('\n=== 专家 Team 配置 ===\n');
  console.log(`小说文件: ${path.relative(ROOT, novelFile)}`);
  console.log(`读者报告: ${path.relative(ROOT, readerReport)}`);
  console.log(`输出路径: stories/${args.story}/episodes/${args.episode}/output/expert-panel-report.md`);
  console.log('\n专家画像：');
  EXPERTS.forEach((e, i) => {
    console.log(`  ${i + 1}. ${e.name}（${e.profile}）— 专长：${e.specialty} — 风格：${e.style}`);
  });
  console.log('\n调度说明：');
  console.log('  Director 通过 Task 工具并行 spawn 4 个专家 Agent。');
  console.log('  每人需读取 novel.md + reader-panel-report.md。');
  console.log('  输出：诊断清单 + 处方清单 + 最高优先级修订建议。');
}

main();
