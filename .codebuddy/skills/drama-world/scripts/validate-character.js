/**
 * drama-world/scripts/validate-character.js — 角色校验器 (v4.0)
 *
 * 校验功能：
 * 1. 结构完整性：SOUL v4.0 必需字段检查
 * 2. 人格漂移检测：OCEAN 数值是否在合理范围
 * 3. 创伤链完整性：Ghost-Wound-Lie-Shield 逻辑链检查
 * 4. 秘密泄露风险：检查 MEMORY 中是否出现了不应知道的信息
 * 5. 语言一致性：检查示例是否符合定义的语言模式
 *
 * 用法：
 *   node validate-character.js                    # 校验所有角色
 *   node validate-character.js lin-qi             # 校验指定角色
 *   node validate-character.js --strict           # 严格模式
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  getPaths, exists, readText, readJson
} from './lib.js';

// ─── 校验级别 ───

const SEVERITY = {
  ERROR: 'error',     // 必须修复
  WARNING: 'warning', // 建议修复
  INFO: 'info',       // 提示信息
};

// ─── SOUL v4.0 必需字段 ───

const REQUIRED_FIELDS = {
  // Layer 1: 身份层
  identity: ['id:', 'name:', 'archetype:', 'status:'],
  // Layer 2: 心理层
  psychology: ['ocean:', 'trauma:', 'motivation:'],
  // Layer 3: 表演层
  performance: ['voice:', 'emotion:', 'stress_response:'],
};

const OCEAN_FIELDS = ['openness:', 'conscientiousness:', 'extraversion:', 'agreeableness:', 'neuroticism:'];
const TRAUMA_FIELDS = ['ghost:', 'wound:', 'lie:', 'shield:'];
const MOTIVATION_FIELDS = ['want:', 'need:', 'fear:', 'secret:'];

// ─── 校验单个角色 ───

function validateAgent(agentId, paths, options = {}) {
  const issues = [];
  const agentDir = path.join(paths.agentsDir, agentId);

  // 检查目录存在
  if (!exists(agentDir)) {
    issues.push({
      severity: SEVERITY.ERROR,
      field: 'directory',
      message: `角色目录不存在：${agentDir}`,
    });
    return { agentId, issues, valid: false };
  }

  // 检查必需文件
  const soulPath = path.join(agentDir, 'SOUL.yaml');
  const memoryPath = path.join(agentDir, 'MEMORY.md');
  const rulesPath = path.join(agentDir, 'RULES.md');

  if (!exists(soulPath)) {
    issues.push({
      severity: SEVERITY.ERROR,
      field: 'SOUL.yaml',
      message: '缺少 SOUL.yaml 文件',
    });
  }

  if (!exists(memoryPath)) {
    issues.push({
      severity: SEVERITY.WARNING,
      field: 'MEMORY.md',
      message: '缺少 MEMORY.md 文件',
    });
  }

  if (!exists(rulesPath)) {
    issues.push({
      severity: SEVERITY.WARNING,
      field: 'RULES.md',
      message: '缺少 RULES.md 文件',
    });
  }

  // 如果 SOUL.yaml 存在，进行详细校验
  if (exists(soulPath)) {
    const soulContent = readText(soulPath);
    issues.push(...validateSoulStructure(soulContent, options));
    issues.push(...validateOceanValues(soulContent, options));
    issues.push(...validateTraumaChain(soulContent, options));
    issues.push(...validatePerformance(soulContent, options));

    // 如果 MEMORY.md 存在，检查秘密泄露
    if (exists(memoryPath)) {
      const memoryContent = readText(memoryPath);
      issues.push(...validateSecretLeakage(soulContent, memoryContent, options));
    }
  }

  const hasErrors = issues.some(i => i.severity === SEVERITY.ERROR);
  const hasWarnings = issues.some(i => i.severity === SEVERITY.WARNING);

  return {
    agentId,
    issues,
    valid: !hasErrors,
    warnings: hasWarnings,
  };
}

// ─── 校验 SOUL 结构完整性 ───

function validateSoulStructure(content, options = {}) {
  const issues = [];

  // 检查身份层字段
  for (const field of REQUIRED_FIELDS.identity) {
    if (!content.includes(field)) {
      issues.push({
        severity: SEVERITY.ERROR,
        field: 'identity',
        message: `缺少身份层字段：${field}`,
      });
    }
  }

  // 检查心理层字段
  for (const field of REQUIRED_FIELDS.psychology) {
    if (!content.includes(field)) {
      issues.push({
        severity: SEVERITY.ERROR,
        field: 'psychology',
        message: `缺少心理层字段：${field}`,
      });
    }
  }

  // 检查表演层字段
  for (const field of REQUIRED_FIELDS.performance) {
    if (!content.includes(field)) {
      issues.push({
        severity: options.strict ? SEVERITY.ERROR : SEVERITY.WARNING,
        field: 'performance',
        message: `缺少表演层字段：${field}`,
      });
    }
  }

  // 检查 OCEAN 子字段
  for (const field of OCEAN_FIELDS) {
    if (!content.includes(field)) {
      issues.push({
        severity: SEVERITY.WARNING,
        field: 'ocean',
        message: `缺少 OCEAN 字段：${field}`,
      });
    }
  }

  // 检查创伤链子字段
  for (const field of TRAUMA_FIELDS) {
    if (!content.includes(field)) {
      issues.push({
        severity: SEVERITY.WARNING,
        field: 'trauma',
        message: `缺少创伤链字段：${field}`,
      });
    }
  }

  // 检查动机子字段
  for (const field of MOTIVATION_FIELDS) {
    if (!content.includes(field)) {
      issues.push({
        severity: SEVERITY.WARNING,
        field: 'motivation',
        message: `缺少动机字段：${field}`,
      });
    }
  }

  return issues;
}

// ─── 校验 OCEAN 数值范围 ───

function validateOceanValues(content, options = {}) {
  const issues = [];

  const oceanFields = [
    { name: 'openness', label: '开放性' },
    { name: 'conscientiousness', label: '尽责性' },
    { name: 'extraversion', label: '外向性' },
    { name: 'agreeableness', label: '宜人性' },
    { name: 'neuroticism', label: '神经质' },
  ];

  for (const { name, label } of oceanFields) {
    const match = content.match(new RegExp(`${name}:\\s*(\\d+)`));
    if (match) {
      const value = parseInt(match[1]);

      // 检查是否在有效范围内
      if (value < 0 || value > 100) {
        issues.push({
          severity: SEVERITY.ERROR,
          field: `ocean.${name}`,
          message: `${label} 数值超出范围 (${value})，应在 0-100 之间`,
        });
      }

      // 检查是否使用了极端值（不推荐）
      if (value < 10 || value > 90) {
        issues.push({
          severity: SEVERITY.WARNING,
          field: `ocean.${name}`,
          message: `${label} 使用了极端值 (${value})，建议使用 25-75 范围以获得更真实的人格`,
        });
      }

      // 严格模式：检查是否在推荐范围
      if (options.strict && (value < 25 || value > 75)) {
        issues.push({
          severity: SEVERITY.INFO,
          field: `ocean.${name}`,
          message: `${label} 值 (${value}) 不在推荐范围 25-75 内`,
        });
      }
    }
  }

  return issues;
}

// ─── 校验创伤链完整性 ───

function validateTraumaChain(content, options = {}) {
  const issues = [];

  // 提取创伤链字段
  const ghostMatch = content.match(/ghost:\s*["']([^"']+)["']/);
  const woundMatch = content.match(/wound:\s*["']([^"']+)["']/);
  const lieMatch = content.match(/lie:\s*["']([^"']+)["']/);
  const shieldMatch = content.match(/shield:\s*["']([^"']+)["']/);

  const ghost = ghostMatch ? ghostMatch[1].trim() : '';
  const wound = woundMatch ? woundMatch[1].trim() : '';
  const lie = lieMatch ? lieMatch[1].trim() : '';
  const shield = shieldMatch ? shieldMatch[1].trim() : '';

  // 检查逻辑链完整性
  // 如果有 Ghost，应该有 Wound
  if (ghost && !wound) {
    issues.push({
      severity: SEVERITY.WARNING,
      field: 'trauma',
      message: '有 Ghost（创伤事件）但没有 Wound（心理痛苦），创伤链不完整',
    });
  }

  // 如果有 Wound，应该有 Lie
  if (wound && !lie) {
    issues.push({
      severity: SEVERITY.WARNING,
      field: 'trauma',
      message: '有 Wound（心理痛苦）但没有 Lie（错误认知），创伤链不完整',
    });
  }

  // 如果有 Lie，最好有 Shield
  if (lie && !shield) {
    issues.push({
      severity: SEVERITY.INFO,
      field: 'trauma',
      message: '有 Lie（错误认知）但没有 Shield（防御机制），建议补充',
    });
  }

  // 检查是否全部为空
  if (!ghost && !wound && !lie && !shield) {
    issues.push({
      severity: options.strict ? SEVERITY.WARNING : SEVERITY.INFO,
      field: 'trauma',
      message: '创伤链完全为空，角色可能缺乏心理深度',
    });
  }

  return issues;
}

// ─── 校验表演层 ───

function validatePerformance(content, options = {}) {
  const issues = [];

  // 检查 stress_response 的 primary 是否有效
  const primaryMatch = content.match(/primary:\s*["']?([^"'\n]+)["']?/);
  if (primaryMatch) {
    const primary = primaryMatch[1].trim().toLowerCase();
    const validResponses = ['fight', 'flight', 'freeze', 'fawn'];
    if (!validResponses.includes(primary)) {
      issues.push({
        severity: SEVERITY.WARNING,
        field: 'stress_response',
        message: `主要压力反应 "${primary}" 不是标准的 4F 模式（fight/flight/freeze/fawn）`,
      });
    }
  }

  // 检查是否有示例
  if (!content.includes('examples:')) {
    issues.push({
      severity: SEVERITY.INFO,
      field: 'examples',
      message: '没有定义典型行为示例（few-shot），可能影响表演一致性',
    });
  } else {
    // 检查示例数量
    const exampleMatches = content.match(/situation:/g);
    const exampleCount = exampleMatches ? exampleMatches.length : 0;
    if (exampleCount < 3) {
      issues.push({
        severity: SEVERITY.INFO,
        field: 'examples',
        message: `只有 ${exampleCount} 个行为示例，建议提供 3-5 个`,
      });
    }
  }

  // 检查语言模式
  const toneMatch = content.match(/tone:\s*["']([^"']+)["']/);
  if (!toneMatch || !toneMatch[1].trim()) {
    issues.push({
      severity: SEVERITY.INFO,
      field: 'voice.tone',
      message: '没有定义语气风格（tone），可能影响语言一致性',
    });
  }

  return issues;
}

// ─── 校验秘密泄露 ───

function validateSecretLeakage(soulContent, memoryContent, options = {}) {
  const issues = [];

  // 提取秘密
  const secretMatch = soulContent.match(/secret:\s*["']([^"']+)["']/);
  if (!secretMatch) return issues;

  const secret = secretMatch[1].trim();
  if (!secret) return issues;

  // 提取秘密中的关键词
  const keywords = secret
    .split(/[，,。、；;：:\s]+/)
    .filter(w => w.length >= 2)
    .slice(0, 5); // 取前 5 个关键词

  // 检查 MEMORY 中是否包含这些关键词
  for (const keyword of keywords) {
    if (memoryContent.includes(keyword)) {
      issues.push({
        severity: SEVERITY.WARNING,
        field: 'secret',
        message: `MEMORY 中包含秘密相关的关键词 "${keyword}"，可能存在泄露风险`,
      });
    }
  }

  return issues;
}

// ─── 校验所有角色 ───

function validateAllAgents(paths, options = {}) {
  const agentsDir = paths.agentsDir;

  if (!exists(agentsDir)) {
    return {
      valid: false,
      message: '故事未初始化（agents/ 目录不存在）',
      results: [],
    };
  }

  const agents = fs.readdirSync(agentsDir).filter(f => {
    const stat = fs.statSync(path.join(agentsDir, f));
    return stat.isDirectory() && !f.startsWith('.');
  });

  if (agents.length === 0) {
    return {
      valid: true,
      message: '没有找到任何角色',
      results: [],
    };
  }

  const results = agents.map(agentId => validateAgent(agentId, paths, options));

  const allValid = results.every(r => r.valid);
  const hasWarnings = results.some(r => r.warnings);

  return {
    valid: allValid,
    hasWarnings,
    message: allValid
      ? (hasWarnings ? '所有角色校验通过（有警告）' : '所有角色校验通过')
      : '部分角色校验失败',
    results,
  };
}

// ─── 主函数 ───

export function validateCharacter(agentIdOrOptions = {}) {
  const paths = getPaths();

  // 处理参数
  let options = {};
  let targetAgentId = null;

  if (typeof agentIdOrOptions === 'string') {
    targetAgentId = agentIdOrOptions;
  } else {
    options = agentIdOrOptions;
    targetAgentId = options.agentId;
  }

  if (targetAgentId) {
    // 校验单个角色
    return validateAgent(targetAgentId, paths, options);
  } else {
    // 校验所有角色
    return validateAllAgents(paths, options);
  }
}

// ─── CLI 入口 ───

export async function main(argv) {
  const options = {};
  let agentId = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--strict') {
      options.strict = true;
    } else if (!arg.startsWith('-')) {
      agentId = arg;
    }
  }

  if (agentId) {
    options.agentId = agentId;
  }

  const result = validateCharacter(options);

  // 打印结果
  if (result.results) {
    // 多角色结果
    console.log(`\n📋 角色校验报告\n`);
    console.log(`   总计：${result.results.length} 个角色`);
    console.log(`   状态：${result.message}\n`);

    for (const r of result.results) {
      const icon = r.valid ? (r.warnings ? '⚠️' : '✅') : '❌';
      console.log(`${icon} ${r.agentId}`);

      if (r.issues.length > 0) {
        for (const issue of r.issues) {
          const prefix = issue.severity === 'error' ? '   ❌' :
                        issue.severity === 'warning' ? '   ⚠️' : '   ℹ️';
          console.log(`${prefix} [${issue.field}] ${issue.message}`);
        }
      }
    }
  } else {
    // 单角色结果
    const icon = result.valid ? (result.warnings ? '⚠️' : '✅') : '❌';
    console.log(`\n${icon} ${result.agentId}`);

    if (result.issues.length > 0) {
      for (const issue of result.issues) {
        const prefix = issue.severity === 'error' ? '   ❌' :
                      issue.severity === 'warning' ? '   ⚠️' : '   ℹ️';
        console.log(`${prefix} [${issue.field}] ${issue.message}`);
      }
    }
  }

  // 返回结果供其他模块使用
  return result;
}

// ─── 导出 ───

export {
  validateAgent,
  validateAllAgents,
  validateSoulStructure,
  validateOceanValues,
  validateTraumaChain,
  validatePerformance,
  validateSecretLeakage,
  SEVERITY,
  REQUIRED_FIELDS,
};
