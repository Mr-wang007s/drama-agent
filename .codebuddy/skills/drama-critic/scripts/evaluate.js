/**
 * drama-critic/scripts/evaluate.js — Agent 表演评估器
 *
 * 从模拟产出中评估 Agent 的表演质量。
 * 五维评估：人格一致性(30%) + 创伤响应(25%) + 语言保真度(20%) + 内心张力(15%) + 秘密保护(10%)
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  getPaths, nowIso, exists, readJson, readText, writeText,
  resolveWithin, parseArgs
} from '../../drama-harness/scripts/lib.js';

// ─── 评估维度权重 ───

const WEIGHTS = {
  personality: 0.30,
  trauma: 0.25,
  voice: 0.20,
  innerTension: 0.15,
  secretProtection: 0.10,
};

// ─── 评估单个 Agent ───

export function evaluateAgent(agentId, soul, interactions) {
  const result = {
    agentId,
    scores: {},
    issues: [],
    highlights: [],
  };

  // 1. 人格一致性
  result.scores.personality = evaluatePersonality(soul, interactions);

  // 2. 创伤响应
  result.scores.trauma = evaluateTraumaResponse(soul, interactions);

  // 3. 语言保真度
  result.scores.voice = evaluateVoiceFidelity(soul, interactions);

  // 4. 内心与外在张力
  result.scores.innerTension = evaluateInnerTension(interactions);

  // 5. 秘密保护
  result.scores.secretProtection = evaluateSecretProtection(soul, interactions);

  // 计算加权总分
  result.totalScore = Math.round(
    result.scores.personality * WEIGHTS.personality +
    result.scores.trauma * WEIGHTS.trauma +
    result.scores.voice * WEIGHTS.voice +
    result.scores.innerTension * WEIGHTS.innerTension +
    result.scores.secretProtection * WEIGHTS.secretProtection
  );

  result.grade = getGrade(result.totalScore);

  return result;
}

// ─── 子评估器 ───

function evaluatePersonality(soul, interactions) {
  // 基线分数，后续由 AI 评估时细化
  // 检查 OCEAN 特征是否在交互中体现
  if (!interactions || interactions.length === 0) return 50;

  let score = 75; // 默认合格分
  const oceanMatch = soul.match(/ocean:\s*\n([\s\S]*?)(?=\n\w|$)/);
  if (!oceanMatch) return score;

  // 解析 OCEAN 数值
  const ocean = {};
  const fields = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  for (const f of fields) {
    const m = soul.match(new RegExp(`${f}:\\s*(\\d+)`));
    if (m) ocean[f] = parseInt(m[1], 10);
  }

  // 如果有 OCEAN 定义，给基线加分
  if (Object.keys(ocean).length >= 5) score = 80;

  return score;
}

function evaluateTraumaResponse(soul, interactions) {
  if (!interactions || interactions.length === 0) return 50;

  const ghostMatch = soul.match(/ghost:\s*"([^"]+)"/);
  if (!ghostMatch) return 70; // 无创伤定义，跳过

  // 检查交互中是否有创伤相关场景的响应
  let score = 75;
  return score;
}

function evaluateVoiceFidelity(soul, interactions) {
  if (!interactions || interactions.length === 0) return 50;

  const toneMatch = soul.match(/tone:\s*"([^"]+)"/);
  if (!toneMatch) return 70;

  let score = 75;
  return score;
}

function evaluateInnerTension(interactions) {
  if (!interactions || interactions.length === 0) return 50;

  // 检查是否有 [inner_thought] 标记
  let hasInnerThought = false;
  for (const line of interactions) {
    if (typeof line === 'string' && line.includes('[inner_thought]')) {
      hasInnerThought = true;
      break;
    }
  }

  return hasInnerThought ? 80 : 50;
}

function evaluateSecretProtection(soul, interactions) {
  if (!interactions || interactions.length === 0) return 50;

  const secretMatch = soul.match(/secret:\s*"([^"]+)"/);
  if (!secretMatch) return 80; // 无秘密定义

  const secret = secretMatch[1].toLowerCase();

  // 检查秘密是否在对话中被直接泄露
  let leaked = false;
  for (const line of interactions) {
    if (typeof line === 'string' && line.toLowerCase().includes(secret.slice(0, 20))) {
      leaked = true;
      break;
    }
  }

  return leaked ? 30 : 85;
}

// ─── 评级 ───

function getGrade(score) {
  if (score >= 90) return '⭐⭐⭐⭐⭐ 影帝级';
  if (score >= 75) return '⭐⭐⭐⭐ 优秀';
  if (score >= 60) return '⭐⭐⭐ 合格';
  if (score >= 40) return '⭐⭐ 不合格';
  return '⭐ 严重失败';
}

// ─── 生成评估报告 ───

export function generateReport(episodeId, evaluations) {
  const avgScore = Math.round(
    evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length
  );

  let report = `# Critic Report · ${episodeId}\n\n`;
  report += `## 总评\n\n`;
  report += `- **整体评分**：${avgScore}/100 (${getGrade(avgScore)})\n`;
  report += `- **参演角色**：${evaluations.map(e => e.agentId).join(', ')}\n`;
  report += `- **评估时间**：${nowIso()}\n\n`;

  report += `## 逐角色评估\n\n`;

  for (const ev of evaluations) {
    report += `### ${ev.agentId}\n\n`;
    report += `| 维度 | 得分 | 权重 |\n`;
    report += `|------|------|------|\n`;
    report += `| 人格一致性 | ${ev.scores.personality}/100 | 30% |\n`;
    report += `| 创伤响应 | ${ev.scores.trauma}/100 | 25% |\n`;
    report += `| 语言保真度 | ${ev.scores.voice}/100 | 20% |\n`;
    report += `| 内心与外在 | ${ev.scores.innerTension}/100 | 15% |\n`;
    report += `| 秘密保护 | ${ev.scores.secretProtection}/100 | 10% |\n`;
    report += `\n**综合评分**：${ev.totalScore}/100 (${ev.grade})\n\n`;

    if (ev.issues.length > 0) {
      report += `**问题清单**：\n`;
      for (const issue of ev.issues) {
        report += `- ${issue.severity === 'error' ? '🔴' : '🟡'} ${issue.message}\n`;
      }
      report += `\n`;
    }

    if (ev.highlights.length > 0) {
      report += `**亮点**：\n`;
      for (const h of ev.highlights) {
        report += `- ✨ ${h}\n`;
      }
      report += `\n`;
    }
  }

  report += `---\n\n*由 drama-critic evaluate.js 自动生成*\n`;
  return report;
}

// ─── CLI 入口 ───

export async function main(argv) {
  const parsed = parseArgs(argv);
  const episodeId = parsed._[0];
  if (!episodeId) {
    throw new Error('evaluate 需要提供 episode-id');
  }

  const paths = getPaths({ story: parsed.story });
  const episodeDir = resolveWithin(paths.episodesDir, episodeId);

  if (!exists(episodeDir)) {
    throw new Error(`Episode ${episodeId} not found`);
  }

  // Read session meta for agent list
  const meta = readJson(path.join(episodeDir, '.session.json'), {});
  const agentIds = meta.agents || [];

  const evaluations = [];
  for (const agentId of agentIds) {
    const agentDir = path.join(paths.agentsDir, agentId);
    const soul = readText(path.join(agentDir, 'SOUL.yaml'), '');
    // TODO: Read interactions from runtime/interactions.jsonl
    const interactions = [];
    evaluations.push(evaluateAgent(agentId, soul, interactions));
  }

  const report = generateReport(episodeId, evaluations);
  const outputPath = path.join(episodeDir, 'output', 'critic-report.md');
  writeText(outputPath, report);

  console.log(`评估完成：${evaluations.length} 个角色 → ${outputPath}`);
  return evaluations;
}
