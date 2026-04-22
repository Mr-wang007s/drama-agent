/**
 * drama-harness/scripts/story-init.js — 故事级初始化（Monorepo 大仓版）
 *
 * 在 stories/<name>/ 下初始化完整的故事子项目：
 * - .story.json (故事元数据)
 * - world/ (bible.md + state.json + timeline.md)
 * - agents/<agent-id>/ (SOUL.yaml + MEMORY.md + RULES.md)
 * - episodes/
 *
 * 用法：
 *   node story-init.js --name my-story --preset mystery
 *   node story-init.js --name my-story --from my-story-seed.yaml
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  getPaths, nowIso, ensureDir, exists, readText, writeText,
  readJson, writeJson, resolveWithin, assertStoryName
} from './lib.js';

// ─── YAML 简易解析器 ───
// 注：生产环境建议用 js-yaml，这里为避免依赖使用简化实现

function parseYaml(text) {
  // 简易 YAML 解析：支持基本的键值对和数组
  // 对于复杂结构，建议后续引入 js-yaml
  const lines = text.split('\n');
  const result = {};
  let currentPath = [];
  let currentIndent = 0;

  for (let line of lines) {
    // 跳过空行和注释
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    const content = line.trim();

    // 处理数组项
    if (content.startsWith('- ')) {
      const value = content.slice(2).trim();
      // 简化处理：直接作为字符串
      continue;
    }

    // 处理键值对
    const colonIndex = content.indexOf(':');
    if (colonIndex > 0) {
      const key = content.slice(0, colonIndex).trim();
      const value = content.slice(colonIndex + 1).trim();

      if (value) {
        // 移除引号
        const cleanValue = value.replace(/^["']|["']$/g, '');
        result[key] = cleanValue;
      }
    }
  }

  return result;
}

function stringifyYaml(obj, indent = 0) {
  let result = '';
  const prefix = '  '.repeat(indent);

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      result += `${prefix}${key}:\n`;
    } else if (Array.isArray(value)) {
      result += `${prefix}${key}:\n`;
      for (const item of value) {
        if (typeof item === 'object') {
          result += `${prefix}  -\n`;
          result += stringifyYaml(item, indent + 2);
        } else {
          result += `${prefix}  - ${JSON.stringify(item)}\n`;
        }
      }
    } else if (typeof value === 'object') {
      result += `${prefix}${key}:\n`;
      result += stringifyYaml(value, indent + 1);
    } else if (typeof value === 'string' && (value.includes(':') || value.includes('#') || value.includes('\n'))) {
      result += `${prefix}${key}: "${value.replace(/"/g, '\\"')}"\n`;
    } else {
      result += `${prefix}${key}: ${value}\n`;
    }
  }

  return result;
}

// ─── 读取种子文件 ───

function loadSeedFile(seedPath) {
  if (!exists(seedPath)) {
    throw new Error(`种子文件不存在：${seedPath}`);
  }
  const content = readText(seedPath);
  // 使用简易解析或直接返回原文本供后续处理
  return { content, path: seedPath };
}

// ─── 从预设加载种子 ───

function loadPreset(presetName, paths) {
  const presetPath = path.join(paths.templatesDir, 'presets', `${presetName}.yaml`);
  if (!exists(presetPath)) {
    const available = fs.readdirSync(path.join(paths.templatesDir, 'presets'))
      .filter(f => f.endsWith('.yaml'))
      .map(f => f.replace('.yaml', ''));
    throw new Error(`预设 "${presetName}" 不存在。可用预设：${available.join(', ')}`);
  }
  return loadSeedFile(presetPath);
}

// ─── 初始化世界 ───

function initWorld(worldConfig, paths) {
  const worldDir = paths.worldDir;
  ensureDir(worldDir);

  // 生成 bible.md
  const bibleTemplate = readText(path.join(paths.templatesDir, 'bible.md'), '');
  let bibleContent = `# ${worldConfig.title || '故事世界观'}\n\n`;
  bibleContent += `> ${worldConfig.logline || '故事梗概'}\n\n`;
  bibleContent += `## 题材\n${worldConfig.genre || '待定'}\n\n`;
  bibleContent += `## 主题\n${worldConfig.theme || '待定'}\n\n`;
  bibleContent += `## 核心设定\n\n`;
  if (worldConfig.bible?.core_settings) {
    for (const setting of worldConfig.bible.core_settings) {
      bibleContent += `- ${setting}\n`;
    }
  }
  bibleContent += `\n## 长线悬念\n\n`;
  if (worldConfig.bible?.long_term_mysteries) {
    for (const mystery of worldConfig.bible.long_term_mysteries) {
      bibleContent += `- ${mystery}\n`;
    }
  }
  bibleContent += `\n## 地点\n\n`;
  if (worldConfig.bible?.locations) {
    for (const loc of worldConfig.bible.locations) {
      bibleContent += `- ${loc}\n`;
    }
  }
  bibleContent += `\n## 叙事准则\n\n`;
  if (worldConfig.bible?.narrative_guidelines) {
    for (const guide of worldConfig.bible.narrative_guidelines) {
      bibleContent += `- ${guide}\n`;
    }
  }

  writeText(path.join(worldDir, 'bible.md'), bibleContent);

  // 生成 state.json
  const stateTemplate = readJson(path.join(paths.templatesDir, 'state.json'), {});
  const state = {
    ...stateTemplate,
    meta: {
      storyTitle: worldConfig.title || '',
      genre: worldConfig.genre || '',
      version: '4.0',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    current: {
      episode: null,
      scene: null,
      timeInStory: worldConfig.bible?.time_rules || 'Day 1',
      location: worldConfig.bible?.locations?.[0] || '未知地点',
    },
    carryOver: [],
    globalFlags: {},
  };
  writeJson(path.join(worldDir, 'state.json'), state);

  // 生成 timeline.md
  let timeline = `# 故事时间线\n\n`;
  timeline += `> 记录故事中发生的关键事件\n\n`;
  timeline += `## 时间线\n\n`;
  timeline += `| 时间 | 事件 | 涉及角色 | 集数 |\n`;
  timeline += `|------|------|----------|------|\n`;
  timeline += `| ${nowIso().split('T')[0]} | 故事初始化 | - | - |\n`;

  writeText(path.join(worldDir, 'timeline.md'), timeline);

  return worldDir;
}

// ─── 初始化单个 Agent ───

function initAgent(agentConfig, paths) {
  const agentId = agentConfig.identity?.id || agentConfig.id;
  if (!agentId) {
    throw new Error('Agent 配置缺少 id 字段');
  }

  const agentDir = resolveWithin(paths.agentsDir, agentId);
  ensureDir(agentDir);

  // 生成 SOUL.yaml (v4.0 格式)
  const soul = generateSoulV4(agentConfig);
  writeText(path.join(agentDir, 'SOUL.yaml'), soul);

  // 生成 MEMORY.md
  const memory = generateMemory(agentConfig);
  writeText(path.join(agentDir, 'MEMORY.md'), memory);

  // 生成 RULES.md
  const rules = generateRules(agentConfig);
  writeText(path.join(agentDir, 'RULES.md'), rules);

  return agentId;
}

// ─── 生成 SOUL v4.0 ───

function generateSoulV4(config) {
  const identity = config.identity || {};
  const psychology = config.psychology || {};
  const performance = config.performance || {};
  const relationships = config.relationships || [];
  const arc = config.arc || {};

  let soul = `# === ${identity.name || identity.id} · Agent 身份文件 (SOUL v4.0) ===\n\n`;

  // Layer 1: 身份层
  soul += `# ━━━━━━ Layer 1: 身份层 (Identity) ━━━━━━\n`;
  soul += `id: ${identity.id || 'unnamed'}\n`;
  soul += `name: ${identity.name || '未命名'}\n`;
  soul += `archetype: ${identity.archetype || '待定'}\n`;
  soul += `role: ${identity.role || '待定'}\n`;
  soul += `status: active\n\n`;

  // Layer 2: 心理层
  soul += `# ━━━━━━ Layer 2: 心理层 (Psychology) ━━━━━━\n\n`;

  // OCEAN 人格
  soul += `# OCEAN 人格模型 (25-75 量表，避免极端值)\n`;
  const ocean = psychology.ocean || {};
  soul += `ocean:\n`;
  soul += `  openness: ${ocean.openness || 50}          # 开放性：好奇心、创造力、接受新事物\n`;
  soul += `  conscientiousness: ${ocean.conscientiousness || 50}  # 尽责性：自律、组织性、可靠\n`;
  soul += `  extraversion: ${ocean.extraversion || 50}      # 外向性：社交能力、精力、积极情绪\n`;
  soul += `  agreeableness: ${ocean.agreeableness || 50}     # 宜人性：信任、合作、同理心\n`;
  soul += `  neuroticism: ${ocean.neuroticism || 50}       # 神经质：情绪波动、焦虑、脆弱\n\n`;

  // 创伤链
  soul += `# Ghost-Wound-Lie-Shield 创伤链\n`;
  const trauma = psychology.trauma || {};
  soul += `trauma:\n`;
  soul += `  ghost: "${trauma.ghost || ''}"\n`;
  soul += `  wound: "${trauma.wound || ''}"\n`;
  soul += `  lie: "${trauma.lie || ''}"\n`;
  soul += `  shield: "${trauma.shield || ''}"\n\n`;

  // 动机双轴
  soul += `# Want vs Need 双轴动机\n`;
  const motivation = psychology.motivation || {};
  soul += `motivation:\n`;
  soul += `  want: "${motivation.want || ''}"\n`;
  soul += `  need: "${motivation.need || ''}"\n`;
  soul += `  fear: "${motivation.fear || ''}"\n`;
  soul += `  secret: "${motivation.secret || ''}"\n\n`;

  // Layer 3: 表演层
  soul += `# ━━━━━━ Layer 3: 表演层 (Performance) ━━━━━━\n\n`;

  // 语言模式
  soul += `# 语言模式\n`;
  const voice = performance.voice || {};
  soul += `voice:\n`;
  soul += `  tone: "${voice.tone || ''}"\n`;
  soul += `  rhythm: "${voice.rhythm || ''}"\n`;
  soul += `  quirks:\n`;
  if (voice.quirks?.length) {
    for (const quirk of voice.quirks) {
      soul += `    - "${quirk}"\n`;
    }
  } else {
    soul += `    - ""\n`;
  }
  soul += `  vocabulary: "${voice.vocabulary || ''}"\n\n`;

  // 情绪状态机
  soul += `# 情绪状态机\n`;
  const emotion = performance.emotion || {};
  soul += `emotion:\n`;
  soul += `  default: ${emotion.default || 'neutral'}\n`;
  soul += `  current: ${emotion.default || 'neutral'}\n`;
  soul += `  triggers:\n`;
  if (emotion.triggers?.length) {
    for (const trigger of emotion.triggers) {
      soul += `    - stimulus: "${trigger.stimulus || ''}"\n`;
      soul += `      response: "${trigger.response || ''}"\n`;
    }
  } else {
    soul += `    - stimulus: ""\n`;
    soul += `      response: ""\n`;
  }
  soul += `\n`;

  // 压力反应
  soul += `# 4F 压力反应模式\n`;
  const stress = performance.stress_response || {};
  soul += `stress_response:\n`;
  soul += `  primary: ${stress.primary || 'freeze'}\n`;
  soul += `  fight: "${stress.fight || ''}"\n`;
  soul += `  flight: "${stress.flight || ''}"\n`;
  soul += `  freeze: "${stress.freeze || ''}"\n`;
  soul += `  fawn: "${stress.fawn || ''}"\n\n`;

  // 典型行为示例
  soul += `# 典型行为示例 (few-shot)\n`;
  soul += `examples:\n`;
  if (performance.examples?.length) {
    for (const ex of performance.examples) {
      soul += `  - situation: "${ex.situation || ''}"\n`;
      soul += `    action: "${ex.action || ''}"\n`;
      soul += `    inner_thought: "${ex.inner_thought || ''}"\n`;
    }
  } else {
    soul += `  - situation: ""\n`;
    soul += `    action: ""\n`;
    soul += `    inner_thought: ""\n`;
  }
  soul += `\n`;

  // 关系
  soul += `# ━━━━━━ 关系网络 ━━━━━━\n`;
  soul += `relationships:\n`;
  if (relationships.length) {
    for (const rel of relationships) {
      soul += `  - target: ${rel.target || ''}\n`;
      soul += `    type: "${rel.type || ''}"\n`;
      soul += `    trust: ${rel.trust ?? 0.5}\n`;
      soul += `    history: "${rel.history || ''}"\n`;
      soul += `    tension: "${rel.tension || ''}"\n`;
    }
  } else {
    soul += `  []\n`;
  }
  soul += `\n`;

  // 角色弧线
  soul += `# ━━━━━━ 角色弧线 ━━━━━━\n`;
  soul += `arc:\n`;
  soul += `  starting_point: "${arc.starting_point || ''}"\n`;
  soul += `  potential_growth: "${arc.potential_growth || ''}"\n`;
  soul += `  season_arc: "${arc.season_arc || ''}"\n`;

  return soul;
}

// ─── 生成 MEMORY.md ───

function generateMemory(config) {
  const name = config.identity?.name || config.id || '角色';
  let memory = `# ${name} 的记忆\n\n`;
  memory += `> 容量上限：~2000 字符 | 由 Harness wrap 时统一更新\n\n`;
  memory += `## 已知事实\n\n`;
  memory += `- 故事刚刚开始\n\n`;
  memory += `## 重要经历\n\n`;
  memory += `（暂无）\n\n`;
  memory += `## 情感印记\n\n`;
  memory += `（暂无）\n`;
  return memory;
}

// ─── 生成 RULES.md ───

function generateRules(config) {
  const name = config.identity?.name || config.id || '角色';
  const secret = config.psychology?.motivation?.secret || '';

  let rules = `# ${name} 的行为红线\n\n`;
  rules += `> 这些规则不可逾越，即使在极端压力下也必须遵守\n\n`;
  rules += `## 绝对禁止\n\n`;
  rules += `- **不主动泄露秘密**：${secret ? `"${secret}"` : '个人秘密'} 除非被直接戳穿证据\n`;
  rules += `- **不打破人格**：保持 SOUL 中定义的人格特征一致性\n`;
  rules += `- **不读心**：不能知道其他角色未明确表达的想法\n`;
  rules += `- **不穿越**：只能基于当前时间点的已知信息行动\n\n`;
  rules += `## 可以但谨慎\n\n`;
  rules += `- 在极度信任时可以暗示秘密的存在（但不明说内容）\n`;
  rules += `- 可以撒谎，但要符合角色性格和当前处境\n`;
  rules += `- 可以改变立场，但需要合理的情节触发\n`;
  return rules;
}

// ─── 主函数 ───

export function storyInit(options = {}) {
  if (!options.name) {
    throw new Error('必须指定故事名称：--name <story-name>');
  }
  assertStoryName(options.name);

  const packageRoot = path.resolve(
    path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/i, '$1')),
    '..', '..', '..', '..'
  );
  const storiesDir = path.join(packageRoot, 'stories');
  const storyRoot = resolveWithin(storiesDir, options.name);

  // 检查是否已初始化
  if (exists(storyRoot) && !options.force) {
    throw new Error(`故事 "${options.name}" 已存在（${storyRoot}）。使用 --force 强制覆盖。`);
  }

  // 使用 getPaths 但指向新故事目录
  const paths = getPaths({ story: options.name });

  let seedContent;
  let seedSource;

  if (options.preset) {
    const preset = loadPreset(options.preset, paths);
    seedContent = preset.content;
    seedSource = `preset:${options.preset}`;
  } else if (options.from) {
    const seed = loadSeedFile(options.from);
    seedContent = seed.content;
    seedSource = `file:${options.from}`;
  } else {
    const templatePath = path.join(paths.templatesDir, 'story-seed.yaml');
    if (!exists(templatePath)) {
      throw new Error('未找到 story-seed.yaml 模板。请使用 --preset 或 --from 参数。');
    }
    seedContent = readText(templatePath);
    seedSource = 'template:story-seed.yaml';
  }

  // 解析种子文件
  const worldConfig = extractWorldConfig(seedContent);
  const agentConfigs = extractAgentConfigs(seedContent);

  // 确保 stories/ 目录存在
  ensureDir(storiesDir);

  // 初始化世界
  console.log(`📌 初始化故事 "${options.name}"...`);
  initWorld(worldConfig, paths);

  // 初始化 Agents
  ensureDir(paths.agentsDir);
  const createdAgents = [];
  for (const agentConfig of agentConfigs) {
    console.log(`🎭 创建角色：${agentConfig.identity?.name || agentConfig.identity?.id}...`);
    const agentId = initAgent(agentConfig, paths);
    createdAgents.push(agentId);
  }

  // 创建 episodes 目录
  ensureDir(paths.episodesDir);

  // 生成 .story.json 元数据
  const storyMeta = {
    title: worldConfig.title || options.name,
    genre: worldConfig.genre || '',
    logline: worldConfig.logline || '',
    seedSource,
    createdAt: nowIso(),
    version: '5.0',
  };
  writeJson(path.join(storyRoot, '.story.json'), storyMeta);

  const result = {
    name: options.name,
    source: seedSource,
    storyRoot,
    worldDir: paths.worldDir,
    agentsDir: paths.agentsDir,
    agents: createdAgents,
    createdAt: nowIso(),
  };

  console.log(`\n✅ 故事 "${options.name}" 初始化完成！`);
  console.log(`   目录：${storyRoot}`);
  console.log(`   来源：${seedSource}`);
  console.log(`   角色：${createdAgents.join(', ') || '（无）'}`);
  console.log(`\n下一步：`);
  console.log(`   drama-agent create-character --story ${options.name} --interactive`);
  console.log(`   drama-agent sim ep01 --story ${options.name} --title "第一集"`);

  return result;
}

// ─── 从种子文件提取世界配置（简化实现） ───

function extractWorldConfig(yamlContent) {
  const config = {
    title: '',
    genre: '',
    logline: '',
    theme: '',
    bible: {
      core_settings: [],
      long_term_mysteries: [],
      locations: [],
      narrative_guidelines: [],
      time_rules: '',
    },
  };

  // 正则提取关键字段
  const titleMatch = yamlContent.match(/title:\s*["']?([^"'\n]+)["']?/);
  if (titleMatch) config.title = titleMatch[1].trim();

  const genreMatch = yamlContent.match(/genre:\s*["']?([^"'\n]+)["']?/);
  if (genreMatch) config.genre = genreMatch[1].trim();

  const loglineMatch = yamlContent.match(/logline:\s*["']?([^"'\n]+)["']?/);
  if (loglineMatch) config.logline = loglineMatch[1].trim();

  const themeMatch = yamlContent.match(/theme:\s*["']?([^"'\n]+)["']?/);
  if (themeMatch) config.theme = themeMatch[1].trim();

  // 提取数组字段
  const coreSettingsMatch = yamlContent.match(/core_settings:\s*\n((?:\s+-[^\n]+\n?)+)/);
  if (coreSettingsMatch) {
    config.bible.core_settings = coreSettingsMatch[1]
      .split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.replace(/^\s*-\s*["']?|["']?\s*$/g, '').trim());
  }

  const mysteriesMatch = yamlContent.match(/long_term_mysteries:\s*\n((?:\s+-[^\n]+\n?)+)/);
  if (mysteriesMatch) {
    config.bible.long_term_mysteries = mysteriesMatch[1]
      .split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.replace(/^\s*-\s*["']?|["']?\s*$/g, '').trim());
  }

  const locationsMatch = yamlContent.match(/locations:\s*\n((?:\s+-[^\n]+\n?)+)/);
  if (locationsMatch) {
    config.bible.locations = locationsMatch[1]
      .split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.replace(/^\s*-\s*["']?|["']?\s*$/g, '').trim());
  }

  const guidelinesMatch = yamlContent.match(/narrative_guidelines:\s*\n((?:\s+-[^\n]+\n?)+)/);
  if (guidelinesMatch) {
    config.bible.narrative_guidelines = guidelinesMatch[1]
      .split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.replace(/^\s*-\s*["']?|["']?\s*$/g, '').trim());
  }

  return config;
}

// ─── 从种子文件提取角色配置（简化实现） ───

function extractAgentConfigs(yamlContent) {
  const agents = [];

  // 使用正则找到 agents 块
  const agentsMatch = yamlContent.match(/agents:\s*\n([\s\S]*?)(?=\n[a-z]+:|$)/i);
  if (!agentsMatch) return agents;

  const agentsBlock = agentsMatch[1];

  // 按 "- identity:" 或 "  - id:" 分割角色
  const agentBlocks = agentsBlock.split(/\n\s*-\s*(?=identity:|id:)/);

  for (const block of agentBlocks) {
    if (!block.trim()) continue;

    const agent = {
      identity: {},
      psychology: { ocean: {}, trauma: {}, motivation: {} },
      performance: { voice: {}, emotion: {}, stress_response: {}, examples: [] },
      relationships: [],
      arc: {},
    };

    // 提取身份
    const idMatch = block.match(/id:\s*["']?([^"'\n]+)["']?/);
    if (idMatch) agent.identity.id = idMatch[1].trim();

    const nameMatch = block.match(/name:\s*["']?([^"'\n]+)["']?/);
    if (nameMatch) agent.identity.name = nameMatch[1].trim();

    const archetypeMatch = block.match(/archetype:\s*["']?([^"'\n]+)["']?/);
    if (archetypeMatch) agent.identity.archetype = archetypeMatch[1].trim();

    const roleMatch = block.match(/role:\s*["']?([^"'\n]+)["']?/);
    if (roleMatch) agent.identity.role = roleMatch[1].trim();

    // 提取 OCEAN
    const oMatch = block.match(/openness:\s*(\d+)/);
    if (oMatch) agent.psychology.ocean.openness = parseInt(oMatch[1]);

    const cMatch = block.match(/conscientiousness:\s*(\d+)/);
    if (cMatch) agent.psychology.ocean.conscientiousness = parseInt(cMatch[1]);

    const eMatch = block.match(/extraversion:\s*(\d+)/);
    if (eMatch) agent.psychology.ocean.extraversion = parseInt(eMatch[1]);

    const aMatch = block.match(/agreeableness:\s*(\d+)/);
    if (aMatch) agent.psychology.ocean.agreeableness = parseInt(aMatch[1]);

    const nMatch = block.match(/neuroticism:\s*(\d+)/);
    if (nMatch) agent.psychology.ocean.neuroticism = parseInt(nMatch[1]);

    // 提取创伤链
    const ghostMatch = block.match(/ghost:\s*["']([^"']+)["']/);
    if (ghostMatch) agent.psychology.trauma.ghost = ghostMatch[1];

    const woundMatch = block.match(/wound:\s*["']([^"']+)["']/);
    if (woundMatch) agent.psychology.trauma.wound = woundMatch[1];

    const lieMatch = block.match(/lie:\s*["']([^"']+)["']/);
    if (lieMatch) agent.psychology.trauma.lie = lieMatch[1];

    const shieldMatch = block.match(/shield:\s*["']([^"']+)["']/);
    if (shieldMatch) agent.psychology.trauma.shield = shieldMatch[1];

    // 提取动机
    const wantMatch = block.match(/want:\s*["']([^"']+)["']/);
    if (wantMatch) agent.psychology.motivation.want = wantMatch[1];

    const needMatch = block.match(/need:\s*["']([^"']+)["']/);
    if (needMatch) agent.psychology.motivation.need = needMatch[1];

    const fearMatch = block.match(/fear:\s*["']([^"']+)["']/);
    if (fearMatch) agent.psychology.motivation.fear = fearMatch[1];

    const secretMatch = block.match(/secret:\s*["']([^"']+)["']/);
    if (secretMatch) agent.psychology.motivation.secret = secretMatch[1];

    // 提取语言模式
    const toneMatch = block.match(/tone:\s*["']([^"']+)["']/);
    if (toneMatch) agent.performance.voice.tone = toneMatch[1];

    const rhythmMatch = block.match(/rhythm:\s*["']([^"']+)["']/);
    if (rhythmMatch) agent.performance.voice.rhythm = rhythmMatch[1];

    const vocabMatch = block.match(/vocabulary:\s*["']([^"']+)["']/);
    if (vocabMatch) agent.performance.voice.vocabulary = vocabMatch[1];

    // 提取情绪
    const defaultEmotionMatch = block.match(/default:\s*["']?([^"'\n]+)["']?/);
    if (defaultEmotionMatch) agent.performance.emotion.default = defaultEmotionMatch[1].trim();

    // 提取压力反应
    const primaryMatch = block.match(/primary:\s*["']?([^"'\n]+)["']?/);
    if (primaryMatch) agent.performance.stress_response.primary = primaryMatch[1].trim();

    if (agent.identity.id) {
      agents.push(agent);
    }
  }

  return agents;
}

// ─── CLI 入口 ───

export async function main(argv) {
  const options = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--name' && argv[i + 1]) {
      options.name = argv[++i];
    } else if (arg === '--preset' && argv[i + 1]) {
      options.preset = argv[++i];
    } else if (arg === '--from' && argv[i + 1]) {
      options.from = argv[++i];
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--interactive') {
      options.interactive = true;
    }
  }

  return storyInit(options);
}

// ─── 独立入口：允许 `node <script>.js` 直接运行，也可被其他模块 import { main } ───
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const res = main(process.argv.slice(2));
  if (res && typeof res.then === 'function') res.catch((e) => { console.error(e); process.exit(1); });
}
