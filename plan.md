# Story Engine v2.0 —— 项目规划文档

> **AI Agent 驱动的艺术创作伙伴**
> 让一个人也能拥有一个电影剧组的创作能力

---

## 📑 目录

1. [项目愿景](#一项目愿景)
2. [三大设计哲学](#二三大设计哲学)
3. [引擎信条](#三引擎信条engine-creed)
4. [Skill 矩阵](#四skill-矩阵)
5. [角色 Agent 设计](#五角色-agent-设计)
6. [核心机制详解](#六核心机制详解)
7. [MVP 工作流](#七mvp-工作流跑通小说故事)
8. [技术架构](#八技术架构)
9. [目录结构](#九项目目录结构)
10. [路线图](#十路线图与里程碑)
11. [成功指标](#十一成功指标)
12. [风险与应对](#十二风险与应对)

---

## 一、项目愿景

### 🎭 核心定位

> **Story Engine 不是一个"按按钮生成故事"的工具，而是一个由 AI 电影剧组组成的"创作伙伴"。**

它**不替代**创作者，而是**陪伴**创作者：
- 像一个**能在凌晨 3 点陪你吵剧本的编剧搭档**
- 像一个**读完草稿沉默半小时才开口的剧本医生**
- 像一群**能演出你笔下每个角色的即兴演员**

**最终目标**：让一个人也能拥有一个电影剧组的创作能力。

### 🎯 用户画像

- **核心用户**：独立小说作者、编剧、互动叙事设计师、剧本杀作者
- **使用场景**：创作长篇故事时，需要一个"懂行的伙伴"对话、碰撞、反思
- **付费动机**：不是为"AI 写的故事"付费，是为"和 AI 一起写的体验"付费

### 🎬 首期产物

- **形态**：小说/长篇故事（文字）
- **长度**：MVP 阶段聚焦 5000–10000 字短篇
- **体验**：用户感到"AI 是伙伴，不是工具"

---

## 二、三大设计哲学

### 哲学一：**天才放大器，而非平均值生成器** 🔥

**问题回应**：防止"过度工程化扼杀创作"（如《记忆碎片》的倒叙、《罗拉快跑》的循环不应被"修复"）。

**设计原则**：
1. **用户意志优先（User Intent First）**：所有 Skill 都是建议者，不是决策者
2. **反规则保护（Anti-Rule Protection）**：用户标记为"刻意为之"的部分，引擎**永不修复**
3. **风格守护（Style Guardian）**：识别并保护用户独特的创作指纹

### 哲学二：**格式塔诊断，而非规则匹配** 🧠

**问题回应**：真正的剧本医生依赖"对整体结构的格式塔感知"，不是规则触发。

**设计原则**：
- 模拟"读三遍不说话，第四遍才开口"的整体感知
- 对比"整体感 vs 局部事实"找违和感
- 提建议不下判决，永远以问号结尾

### 哲学三：**创作流程的呼吸感，而非流水线** 🌊

**问题回应**：创作是非线性、呼吸式的——写 → 读 → 改 → 放下 → 再读。

**设计原则**：
- 新增 **Rewrite Loop**：多轮重写（Bone/Flesh/Breath 三遍）
- 新增 **Table Read**：让角色 Agent 朗读，测试"立不立得住"
- 用户决策点贯穿全程，随时可暂停、推翻、自改

---

## 三、引擎信条（Engine Creed）

这份信条是**硬编码**在引擎里的最高行为准则，所有 Skill 在初始化时必须读取：

```markdown
1. 🎭 We augment, we never replace.
   我们增强，从不取代。

2. 👤 The user's will is sacred.
   用户的意志是神圣的。

3. 🚫 Marked "intentional" means untouchable.
   标记为"刻意为之"的，永不修复。

4. 🎨 We amplify genius, not average taste.
   我们放大天才，不求取平均。

5. ❓ End with questions, not verdicts.
   用问题结尾，不下判决。

6. 🌊 Creation breathes; we don't pipeline it.
   创作是呼吸，不是流水线。

7. 🎪 Characters aren't puppets, they're partners.
   角色不是傀儡，是伙伴。

8. 📖 Great stories break rules; we protect the breaking.
   伟大故事都违反规则；我们保护这种违反。
```

---

## 四、Skill 矩阵

### 📋 五层架构

```
┌─────────────────────────────────────────────────────────────┐
│  L0 意志层（User's Will）⭐ 核心层                           │
│  └─ CreativeIntent：用户创作意图、反规则声明、神圣元素       │
├─────────────────────────────────────────────────────────────┤
│  L1 共创层（Co-Creation）                                    │
│  ├─ Producer         制片人：对话式确认边界，不设限          │
│  ├─ Screenwriter     编剧：提议结构、草拟文本（可拒绝）      │
│  └─ StoryConsultant  故事顾问：结构建议（建议而非命令）      │
├─────────────────────────────────────────────────────────────┤
│  L2 演绎层（Performance）                                    │
│  ├─ CastingDirector  选角导演：生成角色 Agent                │
│  ├─ Director         导演：调度演绎（可被用户覆盖）          │
│  └─ ScriptSupervisor 场记：只记录不修复（除非用户要求）      │
├─────────────────────────────────────────────────────────────┤
│  L3 反思层（Reflection）⭐ 新增                              │
│  ├─ TableRead        冷读师：角色朗读文本，反馈"立不立"       │
│  ├─ RewriteLoop      重写循环：多轮迭代（非线性）             │
│  └─ Editor           剪辑师：叙事节奏建议（贯穿全程）         │
├─────────────────────────────────────────────────────────────┤
│  L4 诊断层（Diagnosis）⭐ 重构                               │
│  └─ ScriptDoctor     剧本医生：四遍阅读法，整体感诊断         │
└─────────────────────────────────────────────────────────────┘
```

### 📝 每个 Skill 的职责速览

| Skill | 核心职责 | 输入 | 输出 | 关键约束 |
|-------|---------|------|------|---------|
| **CreativeIntent** | 采集用户意图 | 用户对话 | Intent 对象 | 写入所有后续 Skill 的 system prompt |
| **Producer** | 对话式确认边界 | Intent | ProjectSpec | 不设限，只探问 |
| **Screenwriter** | 提议大纲/文本 | Spec+Intent | 3 个方向的提议 | 永远给多选项，不给唯一解 |
| **StoryConsultant** | 结构建议 | 大纲草稿 | 观察与疑问 | 建议不强制 |
| **CastingDirector** | 生成角色 Agent | 人物需求 | 多个版本的角色 | 一个一个聊，不批量生成 |
| **Director** | 调度角色演绎 | 场景+角色 | 原始演绎文本 | 只给开场不给结局 |
| **ScriptSupervisor** | 连贯性记录 | 演绎结果 | Continuity Log | 只记录，不自动修复 |
| **TableRead** ⭐ | 角色朗读测试 | 剧本段落 | 演员反馈+即兴 | 角色视角，不是作者视角 |
| **RewriteLoop** ⭐ | 多轮重写 | 定稿+轮次 | 本轮重写版本 | 强制"冷却期" |
| **Editor** | 叙事架构师 | 全程素材 | 节奏建议 | 贯穿全程，非末端 |
| **ScriptDoctor** ⭐ | 格式塔诊断 | 完整文本 | 观察与疑问 | 四遍阅读法，永远提问 |

---

## 五、角色 Agent 设计

### 🎭 四维人格模型

```typescript
interface CharacterAgent {
  // 1. SOUL - 人格内核（不可变）
  soul: {
    archetype: string;          // 原型（英雄/导师/骗徒...）
    desire: string;             // 核心欲望
    wound: string;              // 心理创伤
    values: string[];           // 价值观
    contradiction: string;      // 内在矛盾（弧光起点）
  };

  // 2. MEMORY - 记忆系统（动态更新）
  memory: {
    longTerm: VectorStore;                // 人物小传、前史
    episodic: SceneMemory[];              // 每场戏的经历
    relational: Map<string, Relation>;    // 与其他角色的关系
    emotional: EmotionState;              // 当前情绪
  };

  // 3. STYLE - 表达风格（半固定）
  style: {
    speechPattern: string;      // 说话方式
    catchphrase: string[];      // 口头禅
    bodyLanguage: string;       // 肢体习惯
  };

  // 4. ARC - 人物弧光（随剧情演变）
  arc: {
    startState: string;
    targetState: string;
    currentProgress: number;    // 0-1
  };
}
```

### 🎪 关键能力：四种模式

每个角色 Agent 可以切换四种工作模式：

| 模式 | 用途 | 触发时机 |
|------|------|---------|
| **Perform**（演绎） | 按 SOUL 即兴演一场戏 | Director 调度时 |
| **Read**（朗读） | 以演员身份朗读自己的台词 | TableRead 环节 |
| **Improvise**（即兴） | 给出"我会这样说"的版本 | TableRead 触发 |
| **Reflect**（反思） | 评价"这场戏像不像我" | 用户主动询问时 |

---

## 六、核心机制详解

### 6.1 CreativeIntent —— L0 意志层 ⭐

引擎的**第一件事不是生成，而是倾听**。

```typescript
interface CreativeIntent {
  // 核心种子
  seed: string;                 // "一个能听见死人说话的邮差"

  // 致敬参照系
  inspirations: {
    reference: string;          // "《百年孤独》"
    aspect: string;             // "氛围"
    degree: 'hint' | 'moderate' | 'strong';
  }[];

  // 刻意反常规（永不修复）
  intentionalDeviations: {
    structural: string[];       // "非线性、倒叙、循环"
    character: string[];        // "全员反派、主角不说话"
    stylistic: string[];        // "意识流、极简"
  };

  // 神圣元素（绝对不改）
  sacredElements: string[];     // "结尾必须主角独自离开"

  // 伙伴模式
  companionMode:
    | 'quiet'      // 安静陪伴（只在要求时发言）
    | 'active'     // 积极碰撞（主动建议）
    | 'wild';      // 疯狂灵感（不断抛新想法）
}
```

**关键行为**：
- 所有后续 Skill 启动前必读此对象
- 凡标记 `intentional` 或 `sacred` 的，**直接跳过修复逻辑**
- 用户可随时更新，引擎实时响应

### 6.2 Rewrite Loop —— 多轮重写 ⭐

模拟"写完放一放，再回来改"的创作节奏：

```
Round 1: Bone Pass（骨架）
  焦点：结构是否成立？
  输出：可能大改（增删场次）

Round 2: Flesh Pass（血肉）
  焦点：人物是否立住？
  输出：重点改对白和内心

Round 3: Breath Pass（呼吸）
  焦点：节奏和情绪曲线
  输出：调整段落长度、语感、留白

（可选）Round 4: Soul Pass（灵魂）
  焦点：这是我想说的吗？
  只能由用户自己完成，AI 只陪伴提问
```

**关键设计**：每轮之间默认**不连续执行**，强制"冷却期"，鼓励用户真的放一放。

### 6.3 Table Read —— 冷读环节 ⭐

让角色 Agent 朗读文本，测试"台词立不立得住"：

```typescript
interface TableReadSession {
  input: ScriptChunk;
  participants: CharacterAgent[];
  mode: 'literal' | 'emotional' | 'subtextual' | 'improvised';

  output: {
    // 角色视角反馈
    actorFeedback: {
      character: string;
      line: string;
      issue: string;          // "不像我会说的话"
      suggestion?: string;
    }[];

    // 情绪曲线
    emotionalFlow: {
      scene: string;
      curve: EmotionPoint[];
      feels: 'natural' | 'forced' | 'flat';
    };

    // 即兴彩蛋
    improvisations: {
      original: string;
      improvised: string;     // 角色即兴版本
      reason: string;         // 为什么这样改
    }[];
  };
}
```

**核心价值**：作者读自己台词永远觉得"挺好"，让**角色自己**读才知道立不立得住。

### 6.4 ScriptDoctor —— 四遍阅读法 ⭐

模拟真实剧本医生的**整体感知**模式：

```
Pass 1: Surface Pass（表层阅读）
  └─ 只记录"读完的感觉"（压抑/轻盈/躁动）
     不分析。

Pass 2: Structure Pass（结构阅读）
  └─ 关注骨架：节奏曲线、重心分布、呼吸感
     不评判。

Pass 3: Character Pass（人物阅读）
  └─ 跟踪每个角色的情感轨迹
     看内在逻辑是否自洽。

Pass 4: Diagnosis Pass（诊断阅读）
  └─ 对比三遍印象，找"违和感"
     产出"观察 + 疑问"，永不下判决。
```

**示例输出**：
```
💭 第一遍整体感是"凉意"，但结尾突然变暖——
   这是你想要的转折，还是收束不够？

💭 老陈从第 3 段开始变得话多——
   这是他在打开，还是作者着急了？

💭 "酱油放在灶台左边"出现了 3 次——
   这是意象的回响，还是无意识重复？
```

**永远以问题结尾，把判断权还给作者**。

### 6.5 用户决策点（Checkpoint）

每个关键节点**强制暂停**，摊开给用户决策：

```
📋 场景 X 完成，你的选择：
1. ✅ 采纳，继续下一场
2. 🔄 重演（换情绪基调）
3. ✍️ 我自己改
4. 💡 采纳角色即兴
5. 🎭 换角色配置
6. ☕ 先歇会儿
```

**用户永远是 Boss**。

---

## 七、MVP 工作流：跑通小说故事

### 🎯 MVP 目标

跑通一个**短篇小说**的完整流程，验证"AI 是伙伴而非工具"的体验。

- **输入**：用户一句话 idea + CreativeIntent
- **输出**：5000–10000 字短篇小说
- **Demo 故事**：《一个能听见死人说话的邮差》

### 🚀 10 步执行流程

```
Step 1: CreativeIntent 采集
   └─ 引擎"倾听"：种子/致敬/反规则/神圣元素/伙伴模式

Step 2: Producer 对话式开场
   └─ 朋友式聊天确认边界（长度/视角/基调）

Step 3: Screenwriter 提议 3 个大纲方向
   └─ 治愈系 / 悬疑系 / 荒诞系，用户挑或提第四种

Step 4: 协同打磨大纲（非线性）
   └─ 一句一句聊出来，用户主导节奏

Step 5: CastingDirector 一个一个生成角色
   └─ 每个角色给多版本，用户选或捏新的
   └─ 完整建模 SOUL + MEMORY + STYLE + ARC

Step 6: Director 调度演绎第一场
   └─ 只给开场，让角色 Agent 自由互动 3-5 轮
   └─ 输出原始演绎文本（素材，不是定稿）

Step 7: TableRead 冷读 ⭐ 灵魂环节
   └─ 角色自己读，反馈"像不像我"
   └─ 可能给出即兴彩蛋版本

Step 8: 用户决策点
   └─ 摊开所有选项，用户拍板

Step 9: （可选）RewriteLoop 多轮迭代
   └─ Bone / Flesh / Breath 三遍重写

Step 10: （可选）ScriptDoctor 四遍阅读
   └─ 格式塔诊断，提问不下判决
```

### 🎬 MVP 示例交互（Step 1-3）

```markdown
【Step 1: Intent】
✨ 欢迎，我是你的创作伙伴。
开始前让我了解你：

1. 核心种子？
   > "一个能听见死人说话的邮差"

2. 想致敬的作品？
   > "《百年孤独》的氛围 + 《邮差》的温暖"

3. 有"一定要这样写"的坚持吗？
   > 结构上：非线性，但不倒叙
   > 风格上：留白多

4. "绝对不能改"的神圣元素？
   > "结尾主角独自离开"

5. 今天希望我扮演什么样的伙伴？
   > 积极碰撞者

---

【Step 2: Producer】
"听起来温柔又略带魔幻。聊几个问题：
- 大概长度？短篇/中篇/长篇
- 主视角？邮差 / 旁观者 / 多视角
- 读完希望读者：微笑 / 流泪 / 沉思

不急，边写边决定也行。"

> 短篇 / 邮差 / 微笑带一点酸

---

【Step 3: Screenwriter 给 3 个方向】

【方向 A：治愈系】
邮差帮每个死者完成最后心愿，第五个死者是他自己...

【方向 B：悬疑系】
邮差开始听到一个还没死的人的声音...

【方向 C：荒诞系】
死者们组成了读信俱乐部，邮差被迫成为会长...

你选一个？还是我们聊第四种？

> 我选 A，但不想让主角死，太俗
> 让他发现自己其实是唯一活着的人

"啊！这个反转有意思。那整个故事基调要重新调..."
```

---

## 八、技术架构

### 🛠️ 技术栈（MVP）

| 层 | 选型 | 理由 |
|----|------|------|
| 语言 | TypeScript | 类型安全，与用户规范一致 |
| 运行时 | Node.js 20+ | 稳定，生态成熟 |
| LLM | Claude 3.5+ / GPT-4o | 长上下文、指令跟随 |
| Agent 框架 | 自研轻量层 | 避免 LangChain 等重框架的束缚 |
| 向量库 | Chroma / LanceDB | 本地优先，便于调试 |
| 状态管理 | 文件系统 + JSON | 可版本化、可审计 |
| CLI 交互 | Inquirer / Ink | 对话式体验 |
| 测试 | Vitest | 快速、TS 原生支持 |

### 🏗️ 核心模块

```typescript
// 引擎内核
interface StoryEngine {
  creed: EngineCreed;              // 硬编码信条
  intent: CreativeIntent;          // 用户意图
  skills: Map<string, Skill>;      // 所有 Skill
  projects: ProjectManager;        // 项目管理
  checkpoints: CheckpointSystem;   // 用户决策点
}

// Skill 统一接口
interface Skill {
  name: string;
  mode: 'advisor' | 'executor';    // 默认 advisor
  run(ctx: SkillContext): Promise<SkillOutput>;
  canBeOverriddenByUser: true;     // 强制 true
}
```

---

## 九、项目目录结构

```
story-engine/
├── config/
│   ├── engine.creed.md               ⭐ 硬编码信条
│   └── safety.config.ts              # 安全边界
│
├── skills/                           # L0-L4 Skill
│   ├── creative-intent/
│   │   ├── prompt.md
│   │   ├── schema.ts
│   │   └── collector.ts
│   ├── producer/
│   ├── screenwriter/
│   ├── story-consultant/
│   ├── casting-director/
│   ├── director/
│   ├── script-supervisor/
│   ├── table-read/                   ⭐ 新增
│   ├── rewrite-loop/                 ⭐ 新增
│   ├── editor/
│   └── script-doctor/                ⭐ 四遍阅读法
│
├── core/
│   ├── creative-intent/              ⭐ L0 意志层
│   │   ├── intent-collector.ts
│   │   ├── sacred-protector.ts       # 神圣元素保护
│   │   └── style-fingerprint.ts      # 风格指纹
│   │
│   ├── character-agent/              # 角色 Agent 内核
│   │   ├── soul.ts
│   │   ├── memory.ts
│   │   ├── style.ts
│   │   ├── arc.ts
│   │   └── modes.ts                  # 四种工作模式
│   │
│   ├── team-agent/                   # 多 Agent 调度
│   │   └── director-orchestrator.ts
│   │
│   ├── checkpoint/                   ⭐ 用户决策点
│   │   └── user-decision.ts
│   │
│   └── memory-system/                # 统一记忆层
│       ├── vector-store.ts
│       └── relation-graph.ts
│
├── projects/                         # 每个"故事项目"
│   └── project-001/
│       ├── intent.json               ⭐ 用户创作意图
│       ├── spec.md                   # Producer 产出
│       ├── outline.md                # 大纲
│       ├── agents/                   # 角色 Agent 快照
│       │   ├── protagonist.json
│       │   └── supporting/
│       ├── scenes/
│       │   ├── scene-01.raw.md       # 原始演绎
│       │   ├── scene-01.read.md      # TableRead 反馈
│       │   └── scene-01.final.md     # 用户定稿
│       ├── rewrites/                 ⭐ 多轮迭代
│       │   ├── bone-pass.md
│       │   ├── flesh-pass.md
│       │   └── breath-pass.md
│       ├── doctor-notes.md           ⭐ 四遍阅读报告
│       ├── checkpoints/              # 用户决策记录
│       └── out/
│           └── final-story.md
│
├── tests/
│   └── e2e/
│       └── postman-story.test.ts     # 邮差故事 E2E
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 十、路线图与里程碑

### 🗓️ 第一周：引擎灵魂

| Day | 任务 | 交付物 |
|-----|------|--------|
| 1-2 | 写引擎信条 + CreativeIntent 采集器 | `engine.creed.md` + `intent-collector.ts` |
| 3-4 | Producer + Screenwriter（对话式） | 跑通"一句话 → 3 个大纲方向" |
| 5-6 | CastingDirector + 角色 Agent 四维建模 | 生成第一个会即兴的角色 |
| 7 | Director + 第一场演绎 | 跑通一场戏的完整演绎 |

### 🗓️ 第二周：灵魂环节

| Day | 任务 | 交付物 |
|-----|------|--------|
| 8-10 | TableRead 冷读实现 | 角色能朗读并给反馈 |
| 11-12 | Checkpoint 用户决策点 | 每个节点可暂停/推翻 |
| 13-14 | 端到端 Demo：《邮差》开篇 | 跑通 Step 1-8 |

### 🗓️ 第三周：完整闭环

| Day | 任务 | 交付物 |
|-----|------|--------|
| 15-17 | RewriteLoop 三遍重写 | Bone/Flesh/Breath 三轮 |
| 18-20 | ScriptDoctor 四遍阅读法 | 格式塔诊断报告 |
| 21 | 完整流程联调 | 5000 字短篇跑通 |

### 🗓️ 第四周：打磨 + Demo

| Day | 任务 | 交付物 |
|-----|------|--------|
| 22-25 | 《邮差》完整 Demo | 10000 字短篇 + 创作日志 |
| 26-27 | CLI 体验优化 | 对话式交互打磨 |
| 28 | 第一版对外展示 | Product Spec + Demo 视频 |

### 🚀 后续版本

- **v2.1**：StoryConsultant + Editor 前置化
- **v2.2**：ScriptSupervisor 三阶段化
- **v3.0**：作者模式（Auteur Mode）——关闭大部分修复
- **v3.1**：跨项目经验沉淀（不修改引擎，只沉淀"lessons"）
- **v4.0**：Web UI + 多人协作

---

## 十一、成功指标

### 🎯 MVP 成功标准

**不是**故事质量分，**而是**用户体验指标：

| 指标 | 目标值 | 测量方式 |
|------|--------|---------|
| **共创愉悦度** | ≥ 8/10 | 用户完成后主观打分 |
| **用户主导感** | ≥ 80% | "我感觉这是我的作品"占比 |
| **意图保真度** | ≥ 90% | 反规则声明被保护的比例 |
| **即兴命中率** | ≥ 30% | TableRead 即兴被采纳比例 |
| **决策点参与度** | 100% | 用户必须在每个 checkpoint 做决定 |
| **完成率** | ≥ 70% | 开始项目后完成到最终产出的比例 |

### 🚫 反指标（要避免的）

- ❌ 用户觉得"AI 帮我写完了"（应该是"我们一起写"）
- ❌ 用户一路按回车（说明没有真正的决策点）
- ❌ 输出故事读起来"很 AI"（平均值，缺失作者指纹）
- ❌ 反规则声明被"修复"（违反核心哲学）

---

## 十二、风险与应对

### ⚠️ 主要风险

| 风险 | 可能性 | 影响 | 应对 |
|------|-------|------|------|
| **用户嫌交互太多，想一键生成** | 高 | 高 | 提供"快速模式"但默认不开；教育用户"慢即是快" |
| **角色 Agent 跑偏，OOC 严重** | 中 | 高 | SOUL 作为 system prompt 硬约束；Memory 定期回顾 |
| **Token 成本过高** | 高 | 中 | 分阶段调用，非必要 Skill 延迟加载；本地缓存 |
| **ScriptDoctor 四遍阅读给不出有价值的洞察** | 中 | 中 | 人工标注黄金样本 + Few-shot；允许用户跳过 |
| **TableRead 即兴质量低** | 中 | 中 | 角色 SOUL 必须足够具体；多版本取最优 |
| **用户创作意图被引擎"稀释"** | 中 | 致命 | Sacred 元素作为 hard constraint；每次生成前验证 |

### 🛡️ 安全边界

```typescript
// safety.config.ts
export const SafetyRules = {
  // 永不修改的用户声明
  immutableIntent: ['sacred', 'intentionalDeviation'],

  // 引擎自我修改的限制（暂时禁用）
  selfImprovement: {
    enabled: false,              // MVP 阶段禁用
    requiresHumanApproval: true, // 后续开启时必须人工审核
  },

  // 每个 checkpoint 必须用户确认
  forceUserDecision: true,

  // 角色 Agent 不能违反 SOUL
  characterOOCDetection: {
    enabled: true,
    action: 'warn',              // 只警告不自动修正
  },
};
```

---

## 📌 附录：关键术语表

| 术语 | 解释 |
|------|------|
| **SOUL** | 角色的人格内核（原型/欲望/创伤/价值观/矛盾），不可变 |
| **MEMORY** | 角色的记忆系统（长期/短期/关系/情绪），动态更新 |
| **STYLE** | 角色的表达风格（说话/口头禅/肢体），半固定 |
| **ARC** | 人物弧光，从 startState 到 targetState 的演变 |
| **CreativeIntent** | 用户的创作意图对象，L0 层最高约束 |
| **Sacred Element** | 用户标记为"绝对不改"的元素，引擎永不修复 |
| **Intentional Deviation** | 用户标记为"刻意反常规"的设计，引擎永不修复 |
| **Checkpoint** | 用户决策点，关键节点强制暂停 |
| **Gestalt Pass** | 格式塔阅读，关注整体感而非规则匹配 |
| **Improvisation** | 角色 Agent 的即兴发挥，可能给作者惊喜 |

---

## 🎬 结语

> **这份规划的核心不是"做出多强的 AI 故事生成器"，而是"做出能让创作者爱上共创的伙伴"。**

Story Engine 的最终检验标准只有一条：

> **当用户关掉电脑时，应该觉得"今天写得真爽"，而不是"AI 帮我写完了"。**

---

**文档版本**：v2.0
**创建日期**：2026-05-04
**状态**：待启动 MVP

---

## 📋 立即可启动的下一步

- [ ] 创建项目仓库骨架（目录结构 + package.json）
- [ ] 写第一版 `engine.creed.md`
- [ ] 实现 `intent-collector.ts`（Day 1-2）
- [ ] 设计 Demo 故事《邮差》的 Intent JSON
- [ ] Producer + Screenwriter prompt 原型
