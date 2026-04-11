/**
 * drama-harness/scripts/validate.js — 校验
 *
 * SOUL.yaml 字段校验、MEMORY.md 容量检查、RULES.md 格式检查。
 * 迁移自 scripts/validate-character.js 并扩展。
 */

import fs from 'node:fs';
import path from 'node:path';
import { getPaths, exists, readText } from './lib.js';

const REQUIRED_SOUL_FIELDS = ['id:', 'name:', 'archetype:', 'desire:', 'fear:', 'secret:', 'voice:', 'status:'];
const VALID_STATUSES = ['active', 'inactive', 'retired'];

export function validateAgent(agentId) {
  const paths = getPaths();
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

export function validateAllAgents() {
  const paths = getPaths();
  if (!exists(paths.agentsDir)) return ['agents/ 目录不存在'];

  const agents = fs.readdirSync(paths.agentsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory());

  if (agents.length === 0) return ['未找到任何 Agent'];

  const allIssues = [];
  for (const agent of agents) {
    allIssues.push(...validateAgent(agent.name));
  }
  return allIssues;
}

export async function main() {
  const issues = validateAllAgents();
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
