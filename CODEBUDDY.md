### 项目目标

`drama-agent` 是一个 **通用 AI 叙事引擎**——给 Agent 赋予身份、记忆、人格，让它们在共享世界中自由交互演绎。采用 **Monorepo 大仓架构**，引擎代码在根目录，每个故事作为独立子项目在 `stories/` 下。

### 关键工程约束

- **Agent = 目录**：`stories/<name>/agents/<tier>_<agent-id>/` 下的 SOUL.yaml + MEMORY.md 是 Agent 的全部身份。
- **分级约定**：所有 agent 目录必须以 `s_` / `a_` / `b_` 开头（C 级合并到 `C-CLASS-INDEX.yaml`）。
- **SOUL v4.0 三层结构**：身份层 → 心理层（OCEAN + 创伤链）→ 表演层
- **故事 = stories/<name>/**：每个子目录是一个独立故事，包含 world/ + agents/ + episodes/
- **三角架构**：`.codebuddy/skills/` 下仅 3 个 Skill（drama-world / drama-director / drama-critic）
- **Canon 保护**：world/bible.md 和 agents/*/SOUL.yaml 的核心身份字段受写保护。
- **有界记忆**：每个 Agent 的 MEMORY.md 按 tier 有容量上限（S: 2000 / A: 1200 / B: 600 字符）。
- **对话驱动**：所有能力通过自然对话触发 Skill，由主 Agent 识别意图后执行。
- **轻 Skill + 重 Reference**：SKILL.md 保持精简骨架（~150-200 行），详细规范在 references/ 子目录按需加载。

### 工作方式：对话 → Skill → 行动

用户用自然语言说话，主 Agent 识别意图触发对应 Skill：

| 用户意图 | 触发词 | 触发 Skill |
|---------|--------|-----------|
| 头脑风暴新故事 | "打造新小说"、"参考XX做故事"、"头脑风暴" | `drama-world` |
| 初始化故事 | "初始化故事"、"新故事"、"从设计文档建项目" | `drama-world` |
| 批量角色建档 | "丰富角色"、"批量创建角色"、"加载所有 agent" | `drama-world` |
| 单角色深度创建 | "创建一个 XX 角色" | `drama-world` |
| 角色分级管理 | "升级角色"、"按分级加前缀" | `drama-world` |
| 查看状态/回滚 | "状态"、"回滚"、"快照" | `drama-world` |
| 校验角色 | "校验角色"、"check agents" | `drama-world` |
| 生成新一集 | "续写"、"继续"、"下一集"、"生成" | `drama-director` |
| 评审作品 | "评审"、"评估"、"打分" | `drama-critic` |
| AI 味检查 | "查 AI 味"、"检查文风" | `drama-critic` |

Skill 内部按需调用 `.codebuddy/skills/<skill>/scripts/` 下的工具脚本。

### 目录职责

- **`templates/`**：初始化模板（SOUL v4.0 四级分档 + character-pack + story-seed + presets）
- **`stories/`**：故事子项目目录（每个子目录是一个独立故事）
- **`examples/`**：样板归档（保留 red-curtain 的原始副本）
- **`.codebuddy/skills/`**：Skill 能力层（三角架构：world / director / critic），所有工具脚本归属在各 Skill 的 `scripts/` 子目录

### Skill 架构

```
.codebuddy/skills/
├── drama-world/          # 世界引擎（筹备 + 角色 + 状态 + 工程守护）
│   ├── SKILL.md          # 精简骨架
│   ├── references/       # 详细规范（brainstorm-sop / character-spec / canon-rules / interaction-protocol）
│   └── scripts/          # 18 个工具脚本
├── drama-director/       # 导演 Owner（Workflow 编排 + 多 Agent Team + 编译）
│   ├── SKILL.md          # 精简骨架
│   ├── references/       # 详细规范（workflow-episode / compile-novel / compile-screenplay / team-protocol）
│   └── scripts/          # compile-novel.js + compile-screenplay.js
└── drama-critic/         # 独立评审（GAN Evaluator）
    ├── SKILL.md
    └── scripts/          # check-ai-taste.js + evaluate.js
```

### 故事子项目结构

```
stories/<name>/
├── .story.json              # 故事元数据（title/genre/seedSource）
├── agents/                  # Agent 居民（SOUL + MEMORY + RULES）
├── world/                   # 世界状态（bible + state + timeline）
└── episodes/                # 模拟产出（按集归档）
```

### 修改建议

- **改模板**：修改 `templates/*.yaml` 或 `templates/presets/*.yaml`
- **改能力**：修改 `.codebuddy/skills/*/SKILL.md` 或 `.codebuddy/skills/*/scripts/*.js`
- **加触发词**：修改 Skill 头部的 `description` 字段
- **改故事内容**：修改 `stories/<name>/agents/*/SOUL.yaml` 或 `world/`
- **改写作硬约束**：修改 `.codebuddy/rules/writing-craft.md`（A/B 级约束）

### 项目规则（Always-Applied Rules）

所有 `.codebuddy/rules/*.md` 会在对话开始时注入为硬约束：

| 规则 | 作用域 |
|---|---|
| `drama-orchestration.md` | 三角 Skill 流水线编排（触发词 / Phase 顺序 / Critic 不可跳过 / Canon 保护） |
| `writing-craft.md` | novel.md 正文写作硬约束（A 级 = Error 门控、B 级 = Warning） |
| `episode-workflow.md` | 单集四件套（brief / beat-sheet / novel / wrap-report）工作流与命名规范 |
| `harness-memory.md` | `world/` 状态层与 Agent MEMORY 有界机制、跨故事隔离 |
| `doc-sync.md` | 代码 / Skill / 规则 / 脚本变更后的核心文档（PRD/README/AGENTS/CODEBUDDY/SKILL.md/rules）同步规则 |

### 验证方式

在对话中说"校验角色"、"check agents"即可触发 drama-world 的 validate 脚本。
如需手工测试脚本，可直接 `node .codebuddy/skills/drama-world/scripts/validate.js --story <name>`。

### 不要做的事

- 不要直接修改 Agent 的 MEMORY.md（由 wrap 时统一写入）
- 不要在没有快照的情况下覆盖 stories/ 下的目录
- 不要让 Agent SOUL.yaml 的核心身份字段（id/trauma/motivation）随意变动
