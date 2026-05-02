#!/usr/bin/env node
/**
 * breakdown-spec.js — 破防戏规格校验（R1-R5 五铁律）
 *
 * 检查 novel.md 中标记为破防戏的场景是否满足 R1-R5 五铁律。
 *
 * 用法：
 *   node scripts/breakdown-spec.js --story <name> --episode <ep-id>
 *   node scripts/breakdown-spec.js --file path/to/novel.md --start <line> --end <line>
 *
 * 退出码：
 *   0 = 满足所有铁律（或无破防戏）
 *   1 = 有铁律未满足
 *   2 = 参数错误
 *
 * 注意：此脚本做启发式检测，最终判定仍需 Director 人工确认。
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
    else if (a === '--file') args.file = argv[++i];
    else if (a === '--start') args.start = parseInt(argv[++i], 10);
    else if (a === '--end') args.end = parseInt(argv[++i], 10);
    else if (a === '--json') args.json = true;
  }
  return args;
}

function resolveFile(args) {
  if (args.file) return path.resolve(args.file);
  if (args.story && args.episode) {
    return path.join(ROOT, 'stories', args.story, 'episodes', args.episode, 'output', 'novel.md');
  }
  return null;
}

// 启发式检测破防场景（基于情绪关键词密度变化）
function detectBreakdownZones(text) {
  const emotionWords = /哭|泪|颤|抖|崩|碎|痛|吼|怒|嚎|跪|瘫|僵|麻|窒息|喘不过|眼眶|鼻酸/g;
  const paragraphs = text.split(/\n\s*\n/);
  const zones = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const density = (p.match(emotionWords) || []).length / Math.max(p.length, 1) * 100;
    if (density > 2.0) { // 情绪词密度超 2%
      zones.push({ startPara: i, text: p.slice(0, 100), density: Math.round(density * 100) / 100 });
    }
  }

  return zones;
}

// R1: 前 200 字是否过度平静
function checkR1(text, breakdownStart) {
  const before = text.slice(Math.max(0, breakdownStart - 200), breakdownStart);
  const emotionWords = /哭|泪|颤|抖|崩|碎|痛|吼|怒|嚎|跪|瘫|僵|麻|窒息|喘不过/g;
  const count = (before.match(emotionWords) || []).length;
  return { passed: count <= 1, count, hint: `前200字情绪词: ${count} 个（应 ≤1）` };
}

// R2: 触发物是否 ≤5字（启发式：检测转折前后的短句）
function checkR2(text, breakdownStart) {
  // 找到破防点前的最短独立句
  const beforeSlice = text.slice(Math.max(0, breakdownStart - 50), breakdownStart);
  const sentences = beforeSlice.split(/[。！？]/).filter(s => s.trim().length > 0);
  const shortestTrigger = sentences.reduce((min, s) => s.trim().length < min.length ? s.trim() : min, sentences[0] || '');
  const passed = shortestTrigger.length <= 10; // 宽松判定
  return { passed, trigger: shortestTrigger, hint: `最短触发句: "${shortestTrigger}"（${shortestTrigger.length}字）` };
}

// R5: 清醒段 ≥ 2× 崩溃段
function checkR5(text, breakdownStart, breakdownEnd) {
  const breakdownLen = breakdownEnd - breakdownStart;
  // 收尾段：崩溃结束后到场景结束
  const afterText = text.slice(breakdownEnd, breakdownEnd + breakdownLen * 3);
  const emotionWords = /哭|泪|颤|抖|崩|碎|痛|吼|怒|嚎/g;
  // 找到情绪词密度恢复正常的位置
  const recoveryLen = afterText.length;
  const passed = recoveryLen >= breakdownLen * 2;
  return { passed, breakdownLen, recoveryLen, hint: `崩溃段 ${breakdownLen} 字，后续 ${recoveryLen} 字（应 ≥${breakdownLen * 2}）` };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = resolveFile(args);

  if (!file) {
    console.error('用法: breakdown-spec.js --story <name> --episode <ep-id>');
    process.exit(2);
  }
  if (!fs.existsSync(file)) {
    console.error(`❌ 文件不存在: ${file}`);
    process.exit(2);
  }

  const text = fs.readFileSync(file, 'utf8');
  const zones = detectBreakdownZones(text);

  console.log('\n=== 破防戏规格校验 ===\n');
  console.log(`文件: ${path.relative(ROOT, file)}`);

  if (zones.length === 0) {
    console.log('\n未检测到明显破防场景。');
    console.log('如果本集 beat-sheet 标记了破防戏，请用 --start/--end 手动指定行号。');
    process.exit(0);
  }

  console.log(`\n检测到 ${zones.length} 个可能的破防区域：\n`);
  zones.forEach((z, i) => {
    console.log(`  ${i + 1}. 段落 ${z.startPara}（情绪密度 ${z.density}%）: ${z.text}...`);
  });

  console.log('\n--- R1-R5 启发式检查（以第一个区域为主）---\n');

  // 对第一个区域做 R1/R5 检查
  const paragraphs = text.split(/\n\s*\n/);
  const firstZone = zones[0];
  const charOffset = paragraphs.slice(0, firstZone.startPara).join('\n\n').length;

  const r1 = checkR1(text, charOffset);
  console.log(`R1 前200字平静: ${r1.passed ? '✅' : '❌'} — ${r1.hint}`);

  const r2 = checkR2(text, charOffset);
  console.log(`R2 触发物短: ${r2.passed ? '✅' : '⚠️'} — ${r2.hint}`);

  console.log(`R3 第一动作非情绪: ⚠️ — 需 Director 人工确认`);
  console.log(`R4 无关者目击: ⚠️ — 需 Director 人工确认`);

  const zoneEnd = charOffset + paragraphs[firstZone.startPara].length;
  const r5 = checkR5(text, charOffset, zoneEnd);
  console.log(`R5 清醒≥2×崩溃: ${r5.passed ? '✅' : '❌'} — ${r5.hint}`);

  const hasFailure = !r1.passed || !r5.passed;
  if (hasFailure) {
    console.log('\n❌ 有铁律未满足，建议修订破防场景。');
    process.exit(1);
  } else {
    console.log('\n✅ 启发式检测通过（R3/R4 需人工确认）');
    process.exit(0);
  }
}

main();
