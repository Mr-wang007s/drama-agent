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

  // 4. 字数预算（按 position 分级门槛）
  //    position 从 yaml 的 position 字段或正文"## 集位置"一行读取
  //    没声明 position → 按"推进集"中位值处理
  const budgetV2 = (text.match(/字数预算\*{0,2}[：:]\s*(\d+)/g) || [])
    .map(m => parseInt(m.match(/\d+/)[0], 10));
  const budgetV3 = (text.match(/budget_chars\s*[：:]\s*(\d+)/g) || [])
    .map(m => parseInt(m.match(/\d+/)[0], 10));
  const wordBudgetTotal = (text.match(/word_budget\s*[：:]\s*(\d+)/) || [])[1];
  const totalBudgetV2 = budgetV2.reduce((a, b) => a + b, 0);
  const totalBudgetV3 = budgetV3.reduce((a, b) => a + b, 0);
  const wordBudgetNum = parseInt(wordBudgetTotal || '0', 10);
  const totalBudget = Math.max(totalBudgetV2, totalBudgetV3, wordBudgetNum);

  // position 分级门槛表
  const BUDGET_TABLE = {
    '爆发集':   { min: 6500, max: 8500 },
    '揭示集':   { min: 6500, max: 8500 },
    '转折集':   { min: 5500, max: 7500 },
    '推进集':   { min: 5500, max: 7500 },
    '沉淀集':   { min: 4000, max: 6000 },
    '过渡集':   { min: 3000, max: 4500 },
  };
  const DEFAULT_POSITION = '推进集';
  const positionMatch = text.match(/position\s*[：:]\s*["']?(爆发集|揭示集|转折集|推进集|沉淀集|过渡集)["']?/);
  const declaredPosition = positionMatch ? positionMatch[1] : null;
  const position = declaredPosition || DEFAULT_POSITION;
  const { min: minBudget, max: maxBudget } = BUDGET_TABLE[position];
  const positionHint = declaredPosition
    ? `position=${position}`
    : `⚠️ 未声明 position，按默认"${DEFAULT_POSITION}"处理（建议在 yaml 或正文"## 集位置"显式声明）`;

  checks.push({
    id: 'position_declared',
    name: 'position 声明',
    passed: !!declaredPosition,
    hint: declaredPosition
      ? `✓ position=${position}（允许区间 ${minBudget}-${maxBudget}）`
      : `⚠️ 建议在 beat-sheet yaml 元数据中显式声明 position（爆发集/揭示集/转折集/推进集/沉淀集/过渡集）。未声明时按"${DEFAULT_POSITION}"中位值校验。`,
  });

  checks.push({
    id: 'word_budget',
    name: `总字数 ≥${minBudget}（${position}）`,
    passed: totalBudget >= minBudget,
    hint: `当前预算总和: ${totalBudget} · ${positionHint}`,
  });

  // 字数偏高软警告（不阻断）
  if (totalBudget > maxBudget) {
    checks.push({
      id: 'word_budget_upper',
      name: `总字数 ≤${maxBudget}（${position}软上限）`,
      passed: true,
      hint: `⚠️ 字数 ${totalBudget} 超过 ${position} 软上限 ${maxBudget}，非错误但建议压缩`,
    });
  }

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

  // 9 (v3.1 新增 · 软约束). 场景叙事重量标注（scene_weight）
  //    三项：irreversible_action / new_info_for_reader / state_change
  //    不填齐全不阻断，但给出警告（流水账预防）
  const sceneWeightHits = (text.match(/scene_weight\s*[：:]/g) || []).length;
  const sceneCountForWeight = Math.max(
    (text.match(/###\s*场景\s*\d/g) || []).length,
    (text.match(/##\s*Scene\s*\d/gi) || []).length
  );
  const irreversibleHits = (text.match(/irreversible_action\s*[：:]/g) || []).length;
  const newInfoHits = (text.match(/new_info_for_reader\s*[：:]/g) || []).length;
  const stateChangeHits = (text.match(/state_change\s*[：:]/g) || []).length;
  const weightCoverage = sceneCountForWeight > 0
    ? Math.min(irreversibleHits, newInfoHits, stateChangeHits) / sceneCountForWeight
    : 0;
  if (sceneCountForWeight > 0) {
    const passed = weightCoverage >= 0.8;  // 允许 1-2 场没填（过渡场）
    checks.push({
      id: 'scene_weight',
      name: `场景叙事重量标注（scene_weight ≥ 80%）`,
      passed,
      hint: passed
        ? `✓ 覆盖率 ${Math.round(weightCoverage * 100)}%（${Math.min(irreversibleHits, newInfoHits, stateChangeHits)}/${sceneCountForWeight} 场）`
        : `⚠️ 叙事重量标注覆盖率 ${Math.round(weightCoverage * 100)}% 偏低。每场需填 irreversible_action + new_info_for_reader + state_change 三项。缺项将导致 Phase 4 出现"字数补白"流水账。详见 craft/narrative-weight.md。`,
    });
  }

  // 10 (v4 新增 · 软约束). agent_voices 字段（Phase 2.3 writers-room 产出回流）
  //    旧集（v3 及更早）无此字段 · 缺失只 warning 不 error · 保证向后兼容
  const hasAgentVoices = /agent_voices\s*[：:]/i.test(text);
  const versionMatch = text.match(/^\s*version\s*[：:]\s*["']?(v[0-9]+)["']?/m);
  const declaredVersion = versionMatch ? versionMatch[1] : null;
  const architectureMatch = text.match(/architecture\s*[：:]\s*["']?([a-z0-9-]+)["']?/i);
  const declaredArchitecture = architectureMatch ? architectureMatch[1] : null;
  const isV4Architecture = declaredArchitecture && declaredArchitecture.includes('v4');

  checks.push({
    id: 'agent_voices',
    name: `agent_voices 字段（v4 writers-room 产出）`,
    passed: hasAgentVoices,
    hint: hasAgentVoices
      ? `✓ agent_voices 存在 · Phase 2.3 角色审骨架意见已回流`
      : isV4Architecture
        ? `⚠️ 声明 architecture=v4 但缺失 agent_voices · 建议补齐 Phase 2.3 产出`
        : `⚠️ 未检测到 agent_voices 字段（v4 新增 · v3 及旧集可忽略 · EP06+ 建议补齐）`,
  });

  // 11 (v4 新增 · 软约束). reader_preview_notes 字段（Phase 2.2 预读者产出回流）
  const hasReaderPreviewNotes = /reader_preview_notes\s*[：:]/i.test(text);
  checks.push({
    id: 'reader_preview_notes',
    name: `reader_preview_notes 字段（v4 预读者盲测回流）`,
    passed: hasReaderPreviewNotes,
    hint: hasReaderPreviewNotes
      ? `✓ reader_preview_notes 存在 · Phase 2.2 预读者预测已回流`
      : isV4Architecture
        ? `⚠️ 声明 architecture=v4 但缺失 reader_preview_notes · 建议补齐 Phase 2.2 产出`
        : `⚠️ 未检测到 reader_preview_notes 字段（v4 新增 · v3 及旧集可忽略 · EP06+ 建议补齐）`,
  });

  // 软约束 id 列表——不通过仅警告，不阻断
  const SOFT_CHECKS = new Set([
    'position_declared',
    'word_budget_upper',
    'scene_weight',
    'agent_voices',            // v4 新增软约束
    'reader_preview_notes',    // v4 新增软约束
  ]);
  const errors = checks.filter(c => !c.passed && !SOFT_CHECKS.has(c.id));
  const warnings = checks.filter(c => !c.passed && SOFT_CHECKS.has(c.id));
  return { checks, errors, warnings, passed: errors.length === 0 };
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

  const SOFT_CHECKS = new Set([
    'position_declared',
    'word_budget_upper',
    'scene_weight',
    'agent_voices',
    'reader_preview_notes',
  ]);
  for (const c of result.checks) {
    const icon = c.passed ? '✅' : (SOFT_CHECKS.has(c.id) ? '⚠️ ' : '❌');
    console.log(`${icon} ${c.name} — ${c.hint}`);
  }

  if (result.warnings && result.warnings.length > 0) {
    console.log(`\n⚠️  ${result.warnings.length} 项软约束警告（不阻断，建议优化）`);
  }

  if (result.passed) {
    console.log('\n✅ Beat-Sheet 校验通过');
    process.exit(0);
  } else {
    console.log(`\n❌ 校验失败：${result.errors.length} 项硬约束不通过`);
    process.exit(1);
  }
}

main();
