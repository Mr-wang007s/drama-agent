/**
 * drama-harness/scripts/validate.js — 校验
 *
 * SOUL.yaml 字段校验、MEMORY.md 容量检查、RULES.md 格式检查。
 * 迁移自 scripts/validate-character.js 并扩展。
 */

import fs from 'node:fs';
import path from 'node:path';
import { getPaths, exists, readText, parseArgs } from './lib.js';

const REQUIRED_SOUL_FIELDS = ['id:', 'name:', 'archetype:', 'desire:', 'fear:', 'secret:', 'voice:', 'status:'];
const VALID_STATUSES = ['active', 'inactive', 'retired'];

export function validateAgent(agentId, storyOpt) {
  const paths = getPaths({ story: storyOpt });
  const agentDir = path.join(paths.agentsDir, agentId);
  const issues = [];

  // SOUL.yaml 校验
  const soulFile = path.join(agentDir, 'SOUL.yaml');
  if (!exists(soulFile)) {
    issues.push(`${agentId}: 缺少 SOUL.yaml`);
  } else {
    const content = readText(soulFile);
    for (const field of REQUIRED_SOUL_FIELDS) {
      if (!content.includes(field)) {
        issues.push(`${agentId}/SOUL.yaml 缺少字段 ${field}`);
      }
    }
    if (!VALID_STATUSES.some((s) => content.includes(`status: ${s}`))) {
      issues.push(`${agentId}/SOUL.yaml 的 status 不合法`);
    }
  }

  // MEMORY.md 容量检查
  const memFile = path.join(agentDir, 'MEMORY.md');
  if (!exists(memFile)) {
    issues.push(`${agentId}: 缺少 MEMORY.md`);
  } else {
    const mem = readText(memFile);
    const soulContent = readText(soulFile);
    const capacity = parseInt(soulContent.match(/^memory_capacity:\s*(\d+)$/m)?.[1] || '2000', 10);
    if (mem.length > capacity) {
      issues.push(`${agentId}/MEMORY.md 超出容量限制 (${mem.length}/${capacity})`);
    }
  }

  // RULES.md 格式检查
  const rulesFile = path.join(agentDir, 'RULES.md');
  if (!exists(rulesFile)) {
    issues.push(`${agentId}: 缺少 RULES.md`);
  }

  return issues;
}

export function validateAllAgents(storyOpt) {
  const paths = getPaths({ story: storyOpt });
  if (!exists(paths.agentsDir)) return ['agents/ 目录不存在'];

  const agents = fs.readdirSync(paths.agentsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory());

  if (agents.length === 0) return ['未找到任何 Agent'];

  const allIssues = [];
  for (const agent of agents) {
    allIssues.push(...validateAgent(agent.name, storyOpt));
  }
  return allIssues;
}

export async function main(argv) {
  const parsed = parseArgs(argv);
  const issues = validateAllAgents(parsed.story);
  if (issues.length > 0) {
    console.error('Agent 校验失败：');
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exitCode = 1;
  } else {
    console.log('所有 Agent 校验通过。');
  }
}

// ─── 独立入口：允许 `node <script>.js` 直接运行，也可被其他模块 import { main } ───
import { pathToFileURL as __pathToFileURL } from 'node:url';
if (import.meta.url === __pathToFileURL(process.argv[1]).href) {
  const res = main(process.argv.slice(2));
  if (res && typeof res.then === 'function') res.catch((e) => { console.error(e); process.exit(1); });
}
