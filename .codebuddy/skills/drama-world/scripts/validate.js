/**
 * drama-world/scripts/validate.js — 全量校验（SOUL v4.0 + tier-aware）
 *
 * 分级校验策略：
 *   - S 级（主角/核心）: 完整 v4.0 — emotion/stress_response/examples 必填
 *   - A 级（配角）:     精简 — 只要 identity/psychology/voice
 *   - B 级（龙套/集体）: 最小 — 只要 identity (允许紧凑集体 Agent)
 *
 * 严重级别：
 *   - ERROR：阻断 Director 流水线（本 tier 必需字段缺失 / 越界）
 *   - WARNING：不阻断，记录提醒
 *   - INFO：参考信息（仅 --verbose 显示）
 *
 * 作为 Director Phase 1 Pre-flight 门控：仅 ERROR 计入 exit code 1。
 */

import fs from 'node:fs';
import path from 'node:path';
import { getPaths, exists, readText, parseArgs } from './lib.js';

const SEVERITY = { ERROR: 'error', WARNING: 'warning', INFO: 'info' };

// ─── 按 tier 的必填/推荐字段 ───
const TIER_REQUIREMENTS = {
  S: {
    required: ['id:', 'name:', 'archetype:', 'status:', 'ocean:', 'trauma:', 'motivation:', 'voice:', 'emotion:', 'stress_response:'],
    recommended: ['openness:', 'conscientiousness:', 'ghost:', 'wound:', 'lie:', 'want:', 'need:', 'fear:', 'examples:'],
    memoryCapacity: 2000,
  },
  A: {
    required: ['id:', 'name:', 'archetype:', 'status:', 'motivation:', 'voice:'],
    recommended: ['ocean:', 'trauma:', 'emotion:', 'stress_response:'],
    memoryCapacity: 1200,
  },
  B: {
    required: ['id:', 'name:', 'archetype:', 'status:'],
    recommended: ['voice:', 'motivation:'],
    memoryCapacity: 600,
  },
};

const VALID_STATUSES = ['active', 'inactive', 'retired', 'dormant', 'semi-dormant', 'sealed', 'deceased'];

function hasField(content, field) {
  // 行首 OR 紧凑对象内 "{ field" — 兼容 YAML flow style
  const f = field.replace(':', '');
  const pattern = new RegExp(`(^|\\n|{|,)\\s*${f}\\s*:`, 'm');
  return pattern.test(content);
}

function inferTier(agentId, content) {
  // 优先从目录前缀推断
  const m = agentId.match(/^([sabc])_/i);
  if (m) return m[1].toUpperCase();
  // 退化：从 content 读 tier 字段
  const tierMatch = content.match(/tier:\s*([SABCsabc])/);
  if (tierMatch) return tierMatch[1].toUpperCase();
  return 'B'; // 默认最宽松
}

export function validateAgent(agentId, storyOpt) {
  const paths = getPaths({ story: storyOpt });
  const agentDir = path.join(paths.agentsDir, agentId);
  const issues = [];

  const soulFile = path.join(agentDir, 'SOUL.yaml');
  if (!exists(soulFile)) {
    issues.push({ severity: SEVERITY.ERROR, msg: `${agentId}: 缺少 SOUL.yaml` });
    return issues;
  }

  const content = readText(soulFile);
  const tier = inferTier(agentId, content);
  const req = TIER_REQUIREMENTS[tier] || TIER_REQUIREMENTS.B;

  // 必填字段 → ERROR
  for (const field of req.required) {
    if (!hasField(content, field)) {
      issues.push({ severity: SEVERITY.ERROR, msg: `[${tier}] ${agentId}/SOUL.yaml 缺少必需字段 ${field}` });
    }
  }

  // 推荐字段 → WARNING
  for (const field of req.recommended) {
    if (!hasField(content, field)) {
      issues.push({ severity: SEVERITY.WARNING, msg: `[${tier}] ${agentId}/SOUL.yaml 缺少推荐字段 ${field}` });
    }
  }

  // status 合法性（只在有 status 字段时检查）
  if (hasField(content, 'status:')) {
    const statusMatch = content.match(/status:\s*([a-z-]+)/);
    if (statusMatch && !VALID_STATUSES.includes(statusMatch[1])) {
      issues.push({ severity: SEVERITY.ERROR, msg: `${agentId}/SOUL.yaml status "${statusMatch[1]}" 不合法（应为 ${VALID_STATUSES.join('/')}）` });
    }
  }

  // OCEAN 数值越界（若存在）
  for (const f of ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']) {
    const m = content.match(new RegExp(`${f}:\\s*(\\d+)`));
    if (m) {
      const v = parseInt(m[1], 10);
      if (v < 0 || v > 100) {
        issues.push({ severity: SEVERITY.ERROR, msg: `${agentId}/SOUL.yaml ocean.${f} 越界 (${v})` });
      }
    }
  }

  // MEMORY.md 容量 → 存在即检查
  const memFile = path.join(agentDir, 'MEMORY.md');
  if (exists(memFile)) {
    const mem = readText(memFile);
    const capMatch = content.match(/memory_capacity:\s*(\d+)/);
    const cap = capMatch ? parseInt(capMatch[1], 10) : req.memoryCapacity;
    if (mem.length > cap) {
      issues.push({ severity: SEVERITY.ERROR, msg: `${agentId}/MEMORY.md 超容 (${mem.length}/${cap})` });
    }
  } else {
    issues.push({ severity: SEVERITY.INFO, msg: `${agentId}: 无 MEMORY.md（运行时按需创建）` });
  }

  // RULES.md 缺失 → INFO
  const rulesFile = path.join(agentDir, 'RULES.md');
  if (!exists(rulesFile)) {
    issues.push({ severity: SEVERITY.INFO, msg: `${agentId}: 无 RULES.md（可选）` });
  }

  return issues;
}

export function validateAllAgents(storyOpt) {
  const paths = getPaths({ story: storyOpt });
  if (!exists(paths.agentsDir)) return [{ severity: SEVERITY.ERROR, msg: 'agents/ 目录不存在' }];

  const entries = fs.readdirSync(paths.agentsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'));

  if (entries.length === 0) return [{ severity: SEVERITY.ERROR, msg: '未找到任何 Agent' }];

  const allIssues = [];
  for (const agent of entries) {
    allIssues.push(...validateAgent(agent.name, storyOpt));
  }
  return allIssues;
}

export async function main(argv) {
  const parsed = parseArgs(argv);
  const issues = validateAllAgents(parsed.story);
  const verbose = argv.includes('--verbose') || argv.includes('-v');

  const errors = issues.filter((i) => i.severity === SEVERITY.ERROR);
  const warnings = issues.filter((i) => i.severity === SEVERITY.WARNING);
  const infos = issues.filter((i) => i.severity === SEVERITY.INFO);

  if (errors.length > 0) {
    console.error(`\n❌ ${errors.length} 个 ERROR：`);
    for (const e of errors) console.error(`   - ${e.msg}`);
  }
  if (warnings.length > 0 && verbose) {
    console.warn(`\n⚠️  ${warnings.length} 个 WARNING：`);
    for (const w of warnings.slice(0, 30)) console.warn(`   - ${w.msg}`);
    if (warnings.length > 30) console.warn(`   ...（另 ${warnings.length - 30} 条，--verbose 全量）`);
  } else if (warnings.length > 0) {
    console.warn(`\n⚠️  ${warnings.length} 个 WARNING（用 --verbose 查看详情）`);
  }
  if (infos.length > 0 && verbose) {
    console.log(`\nℹ️  ${infos.length} 个 INFO：`);
    for (const i of infos.slice(0, 20)) console.log(`   - ${i.msg}`);
  }

  if (errors.length === 0) {
    console.log(`\n✅ 校验通过（errors:0, warnings:${warnings.length}, infos:${infos.length}）`);
    process.exitCode = 0;
  } else {
    console.error(`\n❌ 校验失败：${errors.length} errors`);
    process.exitCode = 1;
  }
}

// ─── 独立入口 ───
import { pathToFileURL as __pathToFileURL } from 'node:url';
if (import.meta.url === __pathToFileURL(process.argv[1]).href) {
  const res = main(process.argv.slice(2));
  if (res && typeof res.then === 'function') res.catch((e) => { console.error(e); process.exit(1); });
}
