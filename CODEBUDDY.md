### 项目目标

`drama-agent` 是一个 **通用 AI 叙事引擎**——给 Agent 赋予身份、记忆、人格，让它们在共享世界中自由交互演绎。采用 **Monorepo 大仓架构**，引擎代码在根目录，每个故事作为独立子项目在 `stories/` 下。

### 关键工程约束

- **Agent = 目录**：`stories/<name>/agents/<tier>_<agent-id>/` 下的 SOUL.yaml + MEMORY.md 是 Agent 的全部身份。
- **分级约定**：所有 agent 目录必须以 `s_` / `a_` / `b_` 开头（C 级合并到 `C-CLASS-INDEX.yaml`）。
- **SOUL v4.0 三层结构**：身份层 → 心理层（OCEAN + 创伤链）→ 表演层
- **故事 = stories/<name>/**：每个子目录是一个独立故事，包含 world/ + agents/ + episodes/
- **三角架构**：`.codebuddy/skills/` 下 3 个 Skill（drama-world / drama-director / drama-critic）
- **豪华 8 人创作班子**：导演 + 编剧 + 责编 + 表演指导 + 文学顾问 + 悬疑顾问 + 读者代表 + 世界管家
- **6 阶段线性流水线**：选角定调 → 班子开盘 → 大 Team 演绎 → 责编内审 → AI 味门控+读者终审 → Wrap
- **直写模式已废止**：任何场景必须使用 Team 模式（独幕演 = 最小合法 Team）
- **Canon 保护**：world/bible.md 和 agents/*/SOUL.yaml 的核心身份字段受写保护。
- **有界记忆**：每个 Agent 的 MEMORY.md 按 tier 有容量上限（S: 2000 / A: 1200 / B: 600 字符）。
- **对话驱动**：所有能力通过自然对话触发 Skill，由主 Agent 识别意图后执行。
- **轻 Skill + 重 Reference**：SKILL.md 保持精简骨架（~150 行），专业知识在 `references/craft/` 下 7 大领域按需加载。

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
| 生成新一集 | "续写"、"继续"、"下一集"、"生成"、"跑一集" | `drama-director` |
| AI 味检查 | "查 AI 味"、"检查文风" | `drama-critic` |

Skill 内部按需调用 `.codebuddy/skills/<skill>/scripts/` 下的工具脚本，并通过 CodeBuddy Task 工具 spawn 班子成员。

### 目录职责

- **`templates/`**：初始化模板（SOUL v4.0 四级分档 + character-pack + story-seed + presets）
- **`stories/`**：故事子项目目录（每个子目录是一个独立故事）
- **`examples/`**：样板归档
- **`.codebuddy/skills/`**：Skill 能力层（三角架构：world / director / critic），工具脚本归属在各 Skill 的 `scripts/` 子目录

### Skill 架构（三角）

```
.codebuddy/skills/
├── drama-world/          # 世界引擎（筹备 + 角色 + 状态 + 工程守护）
│   ├── SKILL.md          # 精简骨架
│   ├── references/       # brainstorm-sop / character-spec / canon-rules / interaction-protocol
│   └── scripts/          # 18 个工具脚本（能力名映射）
│
├── drama-director/       # 导演 Owner（8 人班子编排 + 6 阶段流水线）
│   ├── SKILL.md          # 精简骨架（150 行）
│   ├── references/
│   │   ├── workflow.md           # 6 阶段流水线详细定义
│   │   ├── team-roster.md        # 8 人班子卡片 + spawn prompt 蓝本 + 加载映射表
│   │   ├── team-protocol.md      # Team 交互协议（世界管家核心）
│   │   ├── compile-novel.md      # 小说编译规范
│   │   ├── compile-screenplay.md # 剧本编译规范
│   │   └── craft/                # 7 大专业知识文件（"有灵魂"的事实源）
│   │       ├── characterology.md # 人物学（Stanislavski/Uta Hagen/创伤链/身体诗学）
│   │       ├── conflict.md       # 冲突学（三幕/Save the Cat/7节点/反相位/编剧 8 问）
│   │       ├── scene-design.md   # 场景学（8 功能分类/迟入早出/转折点/信息差）
│   │       ├── dialogue.md       # 对话学（潜台词 7 层/说错话/沉默/语言指纹）
│   │       ├── mystery.md        # 悬疑学（三铁律深化/线索三明治/钩子经济）
│   │       ├── prose.md          # 语言学（A/B/C 级约束/破防 R1-R5/意象系统）
│   │       └── editing.md        # 编辑学（责编 7 步 SOP/多元视角/修订优先级）
│   └── scripts/          # 4 个基建脚本（compile-novel / compile-screenplay / pre-compile-clean / validate-beat-sheet）
│
└── drama-critic/         # AI 味机械门控（仅 check-ai-taste.js）
    ├── SKILL.md
    └── scripts/          # check-ai-taste.js（A 级硬约束 + C5.1-C5.10 句式黑名单）
```

### 8 人创作班子编制

| 成员 | 类型 | 出场阶段 | 加载的 craft 文件 | 核心职责 |
|---|---|---|---|---|
| **导演**（主 Agent） | 主 | 全程 | workflow + roster | 选角、定基调、仲裁 |
| **编剧** | Task Agent | Phase 2 | conflict + scene-design + mystery | 写 beat-sheet v3（含 8 问自检） |
| **悬疑顾问** | Task Agent | Phase 2, 4 | mystery | 三铁律 + 钩子经济 + 线索三明治 |
| **表演指导** | Task Agent | Phase 3 | characterology + dialogue | 9 问激活 + 监控演绎质量 |
| **世界管家** | Task Agent | Phase 3 | team-protocol | 事件注入 + 信息裁判 + 场景节奏 |
| **责编** | Task Agent | Phase 4 | editing + prose + dialogue | 7 步 SOP 内审（吸收原 9 评审） |
| **文学顾问** | Task Agent | Phase 4（按需） | prose | 反 Over-Connect + 节奏润色 |
| **读者代表** | Task Agent | Phase 5 | **不加载 craft** | 终审"会不会追下一集" |

详细班子卡片见 `drama-director/references/team-roster.md`。

### 6 阶段创作流水线

```
Phase 1: 导演独立选角定调（读 context + 选角 + 基调 + 快照）
Phase 2: 创作班子开盘（编剧 + 悬疑顾问 → beat-sheet v3，含 8 问自检）
Phase 3: 大 Team 演绎（表演指导 + 世界管家 + 所有角色 Agent）
Phase 4: 责编内审 + 文学顾问润色（7 步 SOP，迭代 ≤ 2 轮）
Phase 5: AI 味门控 + 读者终审（check-ai-taste EXIT=0 + 读者代表 ≥ 7.0）
Phase 6: Wrap 收尾（调用 drama-world 能力 + 更新 hooks/imagery ledgers）
```

**Token 预算**：从旧架构的 ~62K/集 降至 ~41K/集（-34%），创作占比从 24% 提升至 67%。

### 故事子项目结构

```
stories/<name>/
├── .story.json              # 故事元数据（title/genre/seedSource）
├── agents/                  # Agent 居民（SOUL + MEMORY + RULES）
├── world/                   # 世界状态（bible + state + timeline + imagery-ledger + hooks-ledger）
└── episodes/                # 单集产出（六件套）
    └── <ep-id>/
        ├── episode-brief.md         # Phase 1 导演产出
        ├── beat-sheet.md            # Phase 2 编剧产出
        ├── output/
        │   ├── novel.md             # Phase 3-5 正文
        │   ├── editor-review.md     # Phase 4 责编产出
        │   └── reader-verdict.md    # Phase 5 读者代表产出
        └── wrap-report.md           # Phase 6 收尾
```

### 修改建议

- **改模板**：修改 `templates/*.yaml` 或 `templates/presets/*.yaml`
- **改流水线**：修改 `.codebuddy/skills/drama-director/references/workflow.md`
- **改班子成员**：修改 `.codebuddy/skills/drama-director/references/team-roster.md`
- **改专业知识**：修改对应的 `.codebuddy/skills/drama-director/references/craft/*.md`
- **改触发词**：修改 Skill 头部的 `description` 字段
- **改故事内容**：修改 `stories/<name>/agents/*/SOUL.yaml` 或 `world/`
- **改硬约束清单**：修改 `.codebuddy/rules/writing-craft.md`（索引层）+ `craft/prose.md`（详细层）

### 项目规则（Always-Applied Rules）

所有 `.codebuddy/rules/*.md` 会在对话开始时注入为硬约束：

| 规则 | 作用域 |
|---|---|
| `drama-orchestration.md` | 三角 Skill 流水线编排（6 阶段 + 8 人班子 + 触发词边界 + Canon 保护） |
| `writing-craft.md` | novel.md 正文硬约束索引（A/B/C 级 + 悬疑三铁律 + 破防戏 R1-R5 → 指向 craft/） |
| `episode-workflow.md` | 单集六件套工作流（brief/beat-sheet/novel/editor-review/reader-verdict/wrap-report） |
| `harness-memory.md` | `world/` 状态层与 Agent MEMORY 有界机制、跨故事隔离 |
| `pro-advisory-notes.md` | 历史沉淀日志（专家方法论已迁入 craft/，本文件改为变更记录） |
| `doc-sync.md` | 代码 / Skill / 规则 / 脚本变更后的核心文档同步规则 |

### 验证方式

在对话中说"校验角色"、"check agents"即可触发 drama-world 的 validate 脚本。
如需手工测试脚本，可直接 `node .codebuddy/skills/drama-world/scripts/validate.js --story <name>`。

### 不要做的事

- 不要直接修改 Agent 的 MEMORY.md（由 wrap 时统一写入）
- 不要在没有快照的情况下覆盖 stories/ 下的目录
- 不要让 Agent SOUL.yaml 的核心身份字段（id/trauma/motivation）随意变动
- 不要让导演"动笔"（导演只做战略决策，创作交给班子）
- 不要让读者代表加载 craft 文件（保持纯直觉）
- 不要跳过 Phase 4 责编内审（GAN 架构核心保证）
