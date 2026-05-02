#!/usr/bin/env node
/**
 * hooks-ledger.js — 钩子审计台账管理
 *
 * 管理故事级别的钩子台账（hooks-ledger.md），追踪 A/B/C 级钩子的
 * 释放、推进、回收状态。
 *
 * 用法：
 *   node scripts/hooks-ledger.js --story <name> --status          # 查看当前状态
 *   node scripts/hooks-ledger.js --story <name> --check           # 检查过期钩子
 *   node scripts/hooks-ledger.js --story <name> --episode <ep>    # 本集钩子审计
 *
 * 退出码：
 *   0 = 正常
 *   1 = 有 A 级钩子超期未回收（>5集）
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
    else if (a === '--check') args.check = true;
  }
  return args;
}

function parseLedger(text) {
  const hooks = [];
  const lines = text.split('\n');
  // Simple table parser: | ID | 级别 | 内容 | 释放集 | 状态 | 回收集 |
  const tableStart = lines.findIndex(l => /^\|.*ID.*级别/i.test(l));
  if (tableStart === -1) return hooks;

  for (let i = tableStart + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) break;
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length >= 5) {
      hooks.push({
        id: cells[0],
        level: cells[1],
        content: cells[2],
        released: cells[3],
        status: cells[4],
        recovered: cells[5] || '',
      });
    }
  }
  return hooks;
}

function checkOverdue(hooks, currentEp) {
  const epNum = parseInt((currentEp || '').match(/\d+/)?.[0] || '99', 10);
  const overdue = [];
  for (const h of hooks) {
    if (h.level === 'A' && h.status !== '已回收' && h.status !== '已关闭') {
      const releasedNum = parseInt((h.released || '').match(/\d+/)?.[0] || '0', 10);
      if (epNum - releasedNum > 5) {
        overdue.push(h);
      }
    }
  }
  return overdue;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.story) {
    console.error('用法: hooks-ledger.js --story <name> [--status|--check|--episode <ep>]');
    process.exit(2);
  }

  const ledgerPath = path.join(ROOT, 'stories', args.story, 'world', 'hooks-ledger.md');

  if (!fs.existsSync(ledgerPath)) {
    console.log(`⚠️  hooks-ledger.md 不存在: ${ledgerPath}`);
    console.log('建议运行 drama-world 初始化或手动创建。');
    process.exit(0);
  }

  const text = fs.readFileSync(ledgerPath, 'utf8');
  const hooks = parseLedger(text);

  if (args.status) {
    console.log(`\n=== 钩子台账状态（${args.story}）===\n`);
    const aHooks = hooks.filter(h => h.level === 'A');
    const bHooks = hooks.filter(h => h.level === 'B');
    const cHooks = hooks.filter(h => h.level === 'C');
    console.log(`A 级: ${aHooks.length} 个（活跃: ${aHooks.filter(h => h.status !== '已回收').length}）`);
    console.log(`B 级: ${bHooks.length} 个（活跃: ${bHooks.filter(h => h.status !== '已回收').length}）`);
    console.log(`C 级: ${cHooks.length} 个（活跃: ${cHooks.filter(h => h.status !== '已回收').length}）`);
    process.exit(0);
  }

  if (args.check || args.episode) {
    const overdue = checkOverdue(hooks, args.episode || 'ep99');
    if (overdue.length > 0) {
      console.log(`\n🔴 以下 A 级钩子超 5 集未回收：\n`);
      overdue.forEach(h => {
        console.log(`  ${h.id}（${h.level}）: ${h.content} — 释放于 ${h.released}`);
      });
      process.exit(1);
    } else {
      console.log('✅ 无超期 A 级钩子');
      process.exit(0);
    }
  }
}

main();
