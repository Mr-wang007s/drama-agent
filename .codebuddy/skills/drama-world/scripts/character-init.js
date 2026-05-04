/**
 * drama-world/scripts/character-init.js — 角色创建
 *
 * 支持多种创建方式：
 * - 对话式交互创建（回答 5 个核心问题）
 * - 从简介生成（AI 扩展）
 * - 从原型启发（选择角色原型 + 题材）
 * - 从小说/剧本提取（解析已有文本）
 *
 * 用法：
 *   node character-init.js --interactive
 *   node character-init.js --from-brief "一个因童年火灾失去母亲的舞台监督"
 *   node character-init.js --archetype "反英雄" --genre mystery
 *   node character-init.js --from-text novel.txt --extract "主角"
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  getPaths, nowIso, ensureDir, exists, readText, writeText,
  assertAgentId, resolveWithin
} from './lib.js';

// ─── 角色原型库 ───

const ARCHETYPES = {
  hero: {
    name: '英雄',
    description: '勇敢面对挑战，保护他人',
    defaultOcean: { O: 55, C: 65, E: 60, A: 55, N: 40 },
    typicalTraits: ['勇敢', '正义感', '牺牲精神'],
  },
  antihero: {
    name: '反英雄',
    description: '有缺陷但最终做正确事情的主角',
    defaultOcean: { O: 60, C: 45, E: 45, A: 35, N: 55 },
    typicalTraits: ['愤世嫉俗', '道德灰色', '内心挣扎'],
  },
  mentor: {
    name: '导师',
    description: '引导主角成长的智者',
    defaultOcean: { O: 70, C: 60, E: 45, A: 65, N: 35 },
    typicalTraits: ['智慧', '耐心', '神秘过去'],
  },
  shadow: {
    name: '阴影',
    description: '主角的对立面或暗面投射',
    defaultOcean: { O: 55, C: 50, E: 50, A: 30, N: 60 },
    typicalTraits: ['威胁性', '镜像关系', '揭示真相'],
  },
  trickster: {
    name: '捣蛋鬼',
    description: '打破规则，带来混乱和改变',
    defaultOcean: { O: 75, C: 30, E: 70, A: 45, N: 45 },
    typicalTraits: ['机智', '不可预测', '喜剧效果'],
  },
  shapeshifter: {
    name: '变形者',
    description: '立场不明，让人猜不透',
    defaultOcean: { O: 65, C: 55, E: 55, A: 40, N: 50 },
    typicalTraits: ['神秘', '双面性', '制造悬念'],
  },
  herald: {
    name: '使者',
    description: '带来改变的消息或挑战',
    defaultOcean: { O: 50, C: 55, E: 55, A: 50, N: 45 },
    typicalTraits: ['触发事件', '信息传递', '催化剂'],
  },
  guardian: {
    name: '守护者',
    description: '守卫重要事物或通道的角色',
    defaultOcean: { O: 40, C: 70, E: 35, A: 55, N: 40 },
    typicalTraits: ['忠诚', '考验他人', '保护职责'],
  },
};

// ─── 压力反应模式 ───

const STRESS_RESPONSES = {
  fight: {
    name: '战斗',
    description: '面对威胁时倾向对抗、反击',
    indicators: ['攻击性增强', '声音提高', '肢体紧张'],
  },
  flight: {
    name: '逃跑',
    description: '面对威胁时倾向回避、离开',
    indicators: ['转移话题', '身体后退', '寻找出口'],
  },
  freeze: {
    name: '僵住',
    description: '面对威胁时倾向停滞、麻木',
    indicators: ['沉默', '目光空洞', '反应迟缓'],
  },
  fawn: {
    name: '讨好',
    description: '面对威胁时倾向顺从、取悦',
    indicators: ['过度道歉', '立场摇摆', '放弃边界'],
  },
};

// ─── 生成角色 ID ───

function generateAgentId(name) {
  // 如果是中文名，转为拼音首字母或直接用
  const id = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
    .slice(0, 20);

  // 如果全是中文，加上前缀
  if (/^[\u4e00-\u9fa5]+$/.test(id)) {
    return `char-${Date.now().toString(36)}`;
  }

  return id || `char-${Date.now().toString(36)}`;
}

// ─── 创建角色目录和文件 ───

function createCharacterFiles(agentId, characterData, paths) {
  const agentDir = resolveWithin(paths.agentsDir, agentId);

  if (exists(agentDir)) {
    throw new Error(`角色 ${agentId} 已存在`);
  }

  ensureDir(agentDir);

  // 生成 SOUL.yaml
  const soul = generateSoulYaml(characterData);
  writeText(path.join(agentDir, 'SOUL.yaml'), soul);

  // 生成 MEMORY.md
  const memory = generateMemoryMd(characterData);
  writeText(path.join(agentDir, 'MEMORY.md'), memory);

  // 生成 RULES.md
  const rules = generateRulesMd(characterData);
  writeText(path.join(agentDir, 'RULES.md'), rules);

  return agentDir;
}

// ─── 生成 SOUL.yaml (v4.0) ───

function generateSoulYaml(data) {
  let yaml = `# === ${data.name} · Agent 身份文件 (SOUL v4.0) ===\n\n`;

  // Layer 1: 身份层
  yaml += `# ━━━━━━ Layer 1: 身份层 (Identity) ━━━━━━\n`;
  yaml += `id: ${data.id}\n`;
  yaml += `name: ${data.name}\n`;
  yaml += `archetype: ${data.archetype || '待定'}\n`;
  yaml += `role: ${data.role || '待定'}\n`;
  yaml += `status: active\n\n`;

  // Layer 2: 心理层
  yaml += `# ━━━━━━ Layer 2: 心理层 (Psychology) ━━━━━━\n\n`;

  // OCEAN
  yaml += `# OCEAN 人格模型 (25-75 量表，避免极端值)\n`;
  yaml += `ocean:\n`;
  yaml += `  openness: ${data.ocean?.O || 50}          # 开放性\n`;
  yaml += `  conscientiousness: ${data.ocean?.C || 50}  # 尽责性\n`;
  yaml += `  extraversion: ${data.ocean?.E || 50}      # 外向性\n`;
  yaml += `  agreeableness: ${data.ocean?.A || 50}     # 宜人性\n`;
  yaml += `  neuroticism: ${data.ocean?.N || 50}       # 神经质\n\n`;

  // 创伤链
  yaml += `# Ghost-Wound-Lie-Shield 创伤链\n`;
  yaml += `trauma:\n`;
  yaml += `  ghost: "${data.ghost || ''}"\n`;
  yaml += `  wound: "${data.wound || ''}"\n`;
  yaml += `  lie: "${data.lie || ''}"\n`;
  yaml += `  shield: "${data.shield || ''}"\n\n`;

  // 动机
  yaml += `# Want vs Need 双轴动机\n`;
  yaml += `motivation:\n`;
  yaml += `  want: "${data.want || ''}"\n`;
  yaml += `  need: "${data.need || ''}"\n`;
  yaml += `  fear: "${data.fear || ''}"\n`;
  yaml += `  secret: "${data.secret || ''}"\n\n`;

  // Layer 3: 表演层
  yaml += `# ━━━━━━ Layer 3: 表演层 (Performance) ━━━━━━\n\n`;

  // 语言模式
  yaml += `# 语言模式\n`;
  yaml += `voice:\n`;
  yaml += `  tone: "${data.voice?.tone || ''}"\n`;
  yaml += `  rhythm: "${data.voice?.rhythm || ''}"\n`;
  yaml += `  quirks:\n`;
  if (data.voice?.quirks?.length) {
    for (const q of data.voice.quirks) {
      yaml += `    - "${q}"\n`;
    }
  } else {
    yaml += `    - ""\n`;
  }
  yaml += `  vocabulary: "${data.voice?.vocabulary || ''}"\n\n`;

  // 情绪
  yaml += `# 情绪状态机\n`;
  yaml += `emotion:\n`;
  yaml += `  default: ${data.emotion?.default || 'neutral'}\n`;
  yaml += `  current: ${data.emotion?.default || 'neutral'}\n`;
  yaml += `  triggers:\n`;
  if (data.emotion?.triggers?.length) {
    for (const t of data.emotion.triggers) {
      yaml += `    - stimulus: "${t.stimulus}"\n`;
      yaml += `      response: "${t.response}"\n`;
    }
  } else {
    yaml += `    - stimulus: ""\n`;
    yaml += `      response: ""\n`;
  }
  yaml += `\n`;

  // 压力反应
  yaml += `# 4F 压力反应模式\n`;
  yaml += `stress_response:\n`;
  yaml += `  primary: ${data.stressResponse?.primary || 'freeze'}\n`;
  yaml += `  fight: "${data.stressResponse?.fight || ''}"\n`;
  yaml += `  flight: "${data.stressResponse?.flight || ''}"\n`;
  yaml += `  freeze: "${data.stressResponse?.freeze || ''}"\n`;
  yaml += `  fawn: "${data.stressResponse?.fawn || ''}"\n\n`;

  // 示例
  yaml += `# 典型行为示例 (few-shot)\n`;
  yaml += `examples:\n`;
  if (data.examples?.length) {
    for (const ex of data.examples) {
      yaml += `  - situation: "${ex.situation}"\n`;
      yaml += `    action: "${ex.action}"\n`;
      yaml += `    inner_thought: "${ex.inner_thought}"\n`;
    }
  } else {
    yaml += `  - situation: ""\n`;
    yaml += `    action: ""\n`;
    yaml += `    inner_thought: ""\n`;
  }
  yaml += `\n`;

  // 关系
  yaml += `# ━━━━━━ 关系网络 ━━━━━━\n`;
  yaml += `relationships: []\n\n`;

  // 弧线
  yaml += `# ━━━━━━ 角色弧线 ━━━━━━\n`;
  yaml += `arc:\n`;
  yaml += `  starting_point: "${data.arc?.starting_point || ''}"\n`;
  yaml += `  potential_growth: "${data.arc?.potential_growth || ''}"\n`;
  yaml += `  season_arc: "${data.arc?.season_arc || ''}"\n`;

  return yaml;
}

// ─── 生成 MEMORY.md ───

function generateMemoryMd(data) {
  let md = `# ${data.name} 的记忆\n\n`;
  md += `> 容量上限：~2000 字符 | 由 Harness wrap 时统一更新\n\n`;
  md += `## 已知事实\n\n`;
  md += `- 故事刚刚开始\n\n`;
  md += `## 重要经历\n\n`;
  md += `（暂无）\n\n`;
  md += `## 情感印记\n\n`;
  md += `（暂无）\n`;
  return md;
}

// ─── 生成 RULES.md ───

function generateRulesMd(data) {
  let md = `# ${data.name} 的行为红线\n\n`;
  md += `> 这些规则不可逾越，即使在极端压力下也必须遵守\n\n`;
  md += `## 绝对禁止\n\n`;
  md += `- **不主动泄露秘密**：${data.secret ? `"${data.secret}"` : '个人秘密'} 除非被直接戳穿证据\n`;
  md += `- **不打破人格**：保持 SOUL 中定义的人格特征一致性\n`;
  md += `- **不读心**：不能知道其他角色未明确表达的想法\n`;
  md += `- **不穿越**：只能基于当前时间点的已知信息行动\n\n`;
  md += `## 可以但谨慎\n\n`;
  md += `- 在极度信任时可以暗示秘密的存在（但不明说内容）\n`;
  md += `- 可以撒谎，但要符合角色性格和当前处境\n`;
  md += `- 可以改变立场，但需要合理的情节触发\n`;
  return md;
}

// ─── 从简介生成角色模板 ───

export function generateFromBrief(brief) {
  // 返回一个需要 AI 填充的模板结构
  return {
    _prompt: `请基于以下角色简介，生成完整的 SOUL v4.0 角色定义：

角色简介：${brief}

请回答以下问题来完成角色定义：

1. **基础信息**
   - 角色 ID（英文小写，用连字符分隔）：
   - 角色姓名：
   - 角色原型（英雄/反英雄/导师/阴影/捣蛋鬼/变形者/使者/守护者）：
   - 故事角色定位：

2. **五个核心问题**
   - Want（外在目标）——这个角色最想要什么？
   - Fear（最深恐惧）——这个角色最害怕什么？
   - Secret（秘密）——这个角色有什么不可告人的秘密？
   - Ghost（创伤事件）——童年/过去发生过什么创伤事件？
   - Lie（错误认知）——因此 TA 相信了什么错误的道理？

3. **OCEAN 人格（25-75 量表）**
   - O 开放性：
   - C 尽责性：
   - E 外向性：
   - A 宜人性：
   - N 神经质：

4. **语言特色**
   - 语气风格：
   - 口头禅或语言习惯：

5. **压力反应**
   - 主要模式（fight/flight/freeze/fawn）：
   - 具体表现：

请以 JSON 格式返回完整的角色数据。`,
    brief,
    createdAt: nowIso(),
  };
}

// ─── 从原型生成角色模板 ───

export function generateFromArchetype(archetypeName, genre) {
  const archetype = ARCHETYPES[archetypeName.toLowerCase()];
  if (!archetype) {
    const available = Object.keys(ARCHETYPES).join(', ');
    throw new Error(`未知原型 "${archetypeName}"。可用原型：${available}`);
  }

  return {
    archetype: archetype.name,
    archetypeDescription: archetype.description,
    ocean: archetype.defaultOcean,
    typicalTraits: archetype.typicalTraits,
    genre: genre || '通用',
    _prompt: `请基于 "${archetype.name}" 原型和 "${genre || '通用'}" 题材，创建一个完整的角色。

原型特征：
- 描述：${archetype.description}
- 典型特质：${archetype.typicalTraits.join('、')}
- 默认 OCEAN：O=${archetype.defaultOcean.O}, C=${archetype.defaultOcean.C}, E=${archetype.defaultOcean.E}, A=${archetype.defaultOcean.A}, N=${archetype.defaultOcean.N}

请创建完整的角色定义，包括：
1. 姓名和背景故事
2. 五个核心问题（Want/Fear/Secret/Ghost/Lie）
3. 微调后的 OCEAN 数值
4. 语言风格和口头禅
5. 压力反应模式`,
    createdAt: nowIso(),
  };
}

// ─── 交互式创建引导 ───

export function getInteractiveQuestions() {
  return [
    {
      id: 'name',
      question: '🎭 角色叫什么名字？',
      required: true,
    },
    {
      id: 'role',
      question: '📌 这个角色在故事中的定位是什么？（如：主角、反派、导师、配角）',
      required: true,
    },
    {
      id: 'want',
      question: '⭐ Want — 这个角色最想要什么？（外在目标）',
      required: true,
    },
    {
      id: 'fear',
      question: '😨 Fear — 这个角色最害怕什么？（最深恐惧）',
      required: true,
    },
    {
      id: 'secret',
      question: '🤫 Secret — 这个角色有什么不可告人的秘密？',
      required: true,
    },
    {
      id: 'ghost',
      question: '👻 Ghost — 童年/过去发生过什么创伤事件？',
      required: false,
    },
    {
      id: 'lie',
      question: '💔 Lie — 因此 TA 相信了什么错误的道理？',
      required: false,
    },
  ];
}

// ─── 主函数 ───

export function characterInit(options = {}) {
  const paths = getPaths();

  // 检查故事是否已初始化
  if (!exists(paths.agentsDir)) {
    throw new Error('故事未初始化。请先运行 drama init。');
  }

  if (options.interactive) {
    // 返回交互式问题列表供 AI/用户填写
    return {
      mode: 'interactive',
      questions: getInteractiveQuestions(),
      archetypes: ARCHETYPES,
      stressResponses: STRESS_RESPONSES,
    };
  }

  if (options.fromBrief) {
    // 从简介生成模板
    return generateFromBrief(options.fromBrief);
  }

  if (options.archetype) {
    // 从原型生成模板
    return generateFromArchetype(options.archetype, options.genre);
  }

  if (options.data) {
    // 直接使用提供的数据创建角色
    const data = typeof options.data === 'string' ? JSON.parse(options.data) : options.data;

    if (!data.id && data.name) {
      data.id = generateAgentId(data.name);
    }

    assertAgentId(data.id);

    const agentDir = createCharacterFiles(data.id, data, paths);

    console.log(`✅ 角色创建成功：${data.name} (${data.id})`);
    console.log(`   目录：${agentDir}`);

    return {
      agentId: data.id,
      agentDir,
      data,
    };
  }

  // 默认返回帮助信息
  return {
    mode: 'help',
    usage: `
角色创建命令用法：

1. 交互式创建（推荐）
   npm run drama -- create-character --interactive

2. 从简介生成
   npm run drama -- create-character --from-brief "一个因童年火灾失去母亲的舞台监督"

3. 从原型启发
   npm run drama -- create-character --archetype 反英雄 --genre mystery

可用原型：${Object.keys(ARCHETYPES).join(', ')}
`,
    archetypes: ARCHETYPES,
    stressResponses: STRESS_RESPONSES,
  };
}

// ─── CLI 入口 ───

export async function main(argv) {
  const options = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--interactive') {
      options.interactive = true;
    } else if (arg === '--from-brief' && argv[i + 1]) {
      options.fromBrief = argv[++i];
    } else if (arg === '--archetype' && argv[i + 1]) {
      options.archetype = argv[++i];
    } else if (arg === '--genre' && argv[i + 1]) {
      options.genre = argv[++i];
    } else if (arg === '--data' && argv[i + 1]) {
      options.data = argv[++i];
    }
  }

  return characterInit(options);
}

// ─── 导出辅助函数供其他模块使用 ───

export {
  ARCHETYPES,
  STRESS_RESPONSES,
  generateAgentId,
  createCharacterFiles,
  generateSoulYaml,
  generateMemoryMd,
  generateRulesMd,
};
