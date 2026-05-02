#!/usr/bin/env node
/**
 * validate-beat-sheet.js — Beat-Sheet v2/v3 硬指标校验
 *
 * 支持 v2（中文"### 场景 N"）和 v3（英文"## Scene N" + yaml budget_chars）两种格式。
 *
 * 用法：
 *   node scripts/validate-beat-sheet.js --story <name> --episode <ep-id>
 *   node scripts/validate-beat-sheet.js --file path/to/beat-sheet.md
 *
 * 退出码：
 *   0 = 校验通过
 *   1 = 校验失败
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
    else if (a === '--file') args.file = argv[++i];
    else if (a === '--json') args.json = true;
  }
  return args;
}

function resolveFile(args) {
  if (args.file) return path.resolve(args.file);
  if (args.story && args.episode) {
    return path.join(ROOT, 'stories', args.story, 'episodes', args.episode, 'beat-sheet.md');
  }
  return null;
}

function validate(text) {
  const checks = [];

  // 1. 核心一句话存在
  const hasCoreLine = /核心一句话|一句话.*冲突|🎬 核心一句话/i.test(text);
  checks.push({ id: 'core_conflict', name: '核心一句话', passed: hasCoreLine, hint: 'beat-sheet 必须包含核心冲突一句话描述' });

  // 2. 情绪弧线
  const hasEmotionArc = /情绪弧线|起点.*终点|情绪.*[→→]|emotion_arc/i.test(text);
  checks.push({ id: 'emotion_arc', name: '情绪弧线', passed: hasEmotionArc, hint: '必须标注情绪起点和终点' });

  // 3. 至少 2 个场景（兼容 v2 "### 场景 N" 和 v3 "## Scene N" 两种头）
  const sceneCountV2 = (text.match(/###\s*场景\s*\d/g) || []).length;
  const sceneCountV3 = (text.match(/##\s*Scene\s*\d/gi) || []).length;
  const sceneCount = Math.max(sceneCountV2, sceneCountV3);
  checks.push({ id: 'scene_count', name: '场景数 ≥2', passed: sceneCount >= 2, hint: `当前场景数: ${sceneCount}` });

  // 4. 字数预算（兼容 v2 "字数预算：1200" 和 v3 yaml "budget_chars: 1200"）
  //    v3 允许"短推进集"（≥4000）——只需导演在 yaml 显式写明 short_episode: true 或 word_budget 明确
  const budgetV2 = (text.match(/字数预算\*{0,2}[：:]\s*(\d+)/g) || [])
    .map(m => parseInt(m.match(/\d+/)[0], 10));
  const budgetV3 = (text.match(/budget_chars\s*[：:]\s*(\d+)/g) || [])
    .map(m => parseInt(m.match(/\d+/)[0], 10));
  const wordBudgetTotal = (text.match(/word_budget\s*[：:]\s*(\d+)/) || [])[1];
  const totalBudgetV2 = budgetV2.reduce((a, b) => a + b, 0);
  const totalBudgetV3 = budgetV3.reduce((a, b) => a + b, 0);
  const wordBudgetNum = parseInt(wordBudgetTotal || '0', 10);
  const totalBudget = Math.max(totalBudgetV2, totalBudgetV3, wordBudgetNum);
  // 开篇集 / 爆发集 ≥6000；推进集 / 沉淀集允许 ≥4000（必须在 yaml 声明 position）
  const isShortEpisode = /position\s*[：:]\s*["']?(推进集|沉淀集|过渡集)/.test(text);
  const minBudget = isShortEpisode ? 4000 : 6000;
  checks.push({
    id: 'word_budget',
    name: `总字数 ≥${minBudget}${isShortEpisode ? '（推进/沉淀集豁免）' : ''}`,
    passed: totalBudget >= minBudget,
    hint: `当前预算总和: ${totalBudget}`,
  });

  // 5. 前集事实核对清单（兼容 v3 canon_check）
  const hasFactCheck = /前集事实核对|事实核对清单|canon_check/i.test(text);
  checks.push({ id: 'fact_checklist', name: '前集事实核对清单', passed: hasFactCheck, hint: '必须包含前集事实核对清单' });

  // 6. 冲突字段（兼容 v3 outer_conflict / inner_conflict）
  const hasConflict = /冲突.*\|/gm.test(text)
    || /\*\*冲突\*\*/gm.test(text)
    || /outer_conflict|inner_conflict|冲突设计/.test(text);
  checks.push({ id: 'conflict_field', name: '每场景冲突字段', passed: hasConflict, hint: '每个场景应有"冲突"维度' });

  // 7. 钩子经济（兼容 v3 H-A1 / H-B1 / H-C1 格式）
  const hasHooks = /钩子经济|回收.*释放|H-?[A-Z]?\d+|q4_hooks/i.test(text);
  checks.push({ id: 'hooks', name: '钩子经济', passed: hasHooks, hint: '必须标注回收和释放的钩子' });

  // 8 (v3 新增). 编剧 8 问自检块
  const hasWriterCheck = /writer_self_check|编剧 ?8 ?问自检|## ✅ 编剧/.test(text);
  checks.push({ id: 'writer_self_check', name: '编剧 8 问自检', passed: hasWriterCheck, hint: 'v3 必须包含 writer_self_check 块' });

  const errors = checks.filter(c => !c.passed);
  return { checks, errors, passed: errors.length === 0 };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = resolveFile(args);
  if (!file) {
    console.error('用法: validate-beat-sheet.js --story <name> --episode <ep-id>');
    process.exit(2);
  }
  if (!fs.existsSync(file)) {
    console.error(`❌ 文件不存在: ${file}`);
    process.exit(2);
  }

  const text = fs.readFileSync(file, 'utf8');
  const result = validate(text);

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.passed ? 0 : 1);
  }

  console.log('\n=== Beat-Sheet 校验报告 ===\n');
  console.log(`文件: ${path.relative(ROOT, file)}\n`);

  for (const c of result.checks) {
    const icon = c.passed ? '✅' : '❌';
    console.log(`${icon} ${c.name} — ${c.hint}`);
  }

  if (result.passed) {
    console.log('\n✅ Beat-Sheet 校验通过');
    process.exit(0);
  } else {
    console.log(`\n❌ 校验失败：${result.errors.length} 项不通过`);
    process.exit(1);
  }
}

main();
