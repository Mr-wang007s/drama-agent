#!/usr/bin/env node
/**
 * imagery-ledger.js — 意象诗学台账管理
 *
 * 追踪故事核心意象的三阶段推进（引入→挑战→完成）。
 *
 * 用法：
 *   node scripts/imagery-ledger.js --story <name> --status       # 查看意象状态
 *   node scripts/imagery-ledger.js --story <name> --episode <ep> # 本集意象审计
 *
 * 退出码：
 *   0 = 正常
 *   2 = 参数错误
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--story') args.story = argv[++i];
    else if (a === '--episode') args.episode = argv[++i];
    else if (a === '--status') args.status = true;
  }
  return args;
}

function parseLedger(text) {
  const images = [];
  const lines = text.split('\n');
  const tableStart = lines.findIndex(l => /^\|.*意象.*阶段/i.test(l) || /^\|.*编号.*名称/i.test(l));
  if (tableStart === -1) return images;

  for (let i = tableStart + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) break;
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length >= 3) {
      images.push({
        id: cells[0],
        name: cells[1],
        stage: cells[2],           // 引入/挑战/完成
        lastEp: cells[3] || '',
        description: cells[4] || '',
      });
    }
  }
  return images;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.story) {
    console.error('用法: imagery-ledger.js --story <name> [--status|--episode <ep>]');
    process.exit(2);
  }

  const ledgerPath = path.join(ROOT, 'stories', args.story, 'world', 'imagery-ledger.md');

  if (!fs.existsSync(ledgerPath)) {
    console.log(`⚠️  imagery-ledger.md 不存在: ${ledgerPath}`);
    console.log('建议创建：每个故事 6-10 个核心意象。');
    process.exit(0);
  }

  const text = fs.readFileSync(ledgerPath, 'utf8');
  const images = parseLedger(text);

  console.log(`\n=== 意象台账状态（${args.story}）===\n`);
  console.log(`核心意象数: ${images.length}`);
  console.log('');

  const stages = { '引入': [], '挑战': [], '完成': [] };
  for (const img of images) {
    const s = img.stage || '未知';
    if (stages[s]) stages[s].push(img);
    else stages['引入'].push(img);
  }

  console.log(`引入阶段: ${stages['引入'].length} 个`);
  stages['引入'].forEach(i => console.log(`  - ${i.id} ${i.name}`));
  console.log(`挑战阶段: ${stages['挑战'].length} 个`);
  stages['挑战'].forEach(i => console.log(`  - ${i.id} ${i.name}`));
  console.log(`完成阶段: ${stages['完成'].length} 个`);
  stages['完成'].forEach(i => console.log(`  - ${i.id} ${i.name}`));

  if (args.episode) {
    console.log(`\n建议本集（${args.episode}）激活 2-3 个意象（不能全部同时在场）。`);
  }

  process.exit(0);
}

main();
