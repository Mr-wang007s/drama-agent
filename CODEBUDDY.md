### 项目目标

`drama-agent` 是一个 **通用 AI 叙事引擎**——给 Agent 赋予身份、记忆、人格，让它们在共享世界中自由交互演绎。采用 **Monorepo 大仓架构**，引擎代码在根目录，每个故事作为独立子项目在 `stories/` 下。

### 关键工程约束

- **Agent = 目录**：`stories/<name>/agents/<tier>_<agent-id>/` 下的 SOUL.yaml + MEMORY.md 是 Agent 的全部身份。
- **分级约定**：所有 agent 目录必须以 `s_` / `a_` / `b_` 开头（C 级合并到 `C-CLASS-INDEX.yaml`）。
- **SOUL v4.0 三层结构**：身份层 → 心理层（OCEAN + 创伤链）→ 表演层
- **故事 = stories/<name>/**：每个子目录是一个独立故事，包含 world/ + agents/ + episodes/
- **三角架构**：`.codebuddy/skills/` 下 3 个 Skill（drama-world / drama-director / drama-critic）
- **Team 模式（v4 单点深度）**：`.codebuddy/agents/` 下 6 个 drama 专用 subagent · v4 只在 2 处 TEAM 必须——Phase 2.3 `drama-character` × N 审骨架 + Phase 5 `drama-reader` 终审盲评
- **创作班子 9 位**（v4）：导演 + 编剧 + 预读者 + 角色 × N + 悬疑顾问 + 表演指导 + 责编 + 文学顾问 + 终审读者
- **6 阶段流水线（Phase 2 内部 5 步）**：选角定调 → Phase 2.1-2.5（编剧起草 → 预读者盲测 → writers-room 审骨架 → 编剧改稿 → 脚本校验）→ persona 编译 → 责编 persona 审 → AI 味门控+终审读者 → Wrap
- **对抗前置**（v4 核心）：对抗集中在 Phase 2（编剧 team + 角色 writers-room + 预读者），Phase 3-4 全 persona
- **Canon 保护**：world/bible.md 和 agents/*/SOUL.yaml 的核心身份字段受写保护。
- **有界记忆**：每个 Agent 的 MEMORY.md 按 tier 有容量上限（S: 2000 / A: 1200 / B: 600 字符）。
- **对话驱动**：所有能力通过自然对话触发 Skill，由主 Agent 识别意图后执行。
- **轻 Skill + 重 Reference**：SKILL.md 保持精简骨架（~180 行），专业知识在 `references/craft/` 下 **8 大领域**按需加载。

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

- **`.codebuddy/skills/<skill>/templates/`**：Skill 专属产出模板（drama-world 下有 SOUL v4.0 四级 / character-pack / story-seed / presets · drama-director 下有 episode-brief / beat-sheet / wrap-report 骨架）
- **`stories/`**：故事子项目目录（每个子目录是一个独立故事）
- **`examples/`**：样板归档
- **`.codebuddy/skills/`**：Skill 能力层（三角架构：world / director / critic），每个 Skill 下有 `references/` + `scripts/` + `templates/`

### Subagent 架构（v4 单点深度 Team）

```
.codebuddy/agents/              # 项目级 subagent
├── drama-editor.md             # v4 降级为 persona 加载手册（不再 spawn · Phase 4 主 agent 切身份）
├── drama-reader.md             # Phase 5 终审读者（TEAM 必须）+ Phase 2.2 预读者（persona · 不 spawn · 加载模式不同）
├── drama-writer.md             # Phase 2.1/2.4 编剧（persona 默认 · 特殊情况 team）
├── drama-character.md          # Phase 2.3 writers-room 审骨架（TEAM 必须 · 岗位从 v3 的 Phase 3 心脏戏转移至此）
├── drama-world-keeper.md       # v4 废止（心脏戏 team 废）· 文件保留供 v3 兼容和历史参考
└── drama-advisor.md            # 顾问通用模板（mystery/prose/performance · persona 为主）
```

每个 subagent 声明 `tools`（权限）· 加载对应的 craft 文件 · 保证身份封闭与独立判断。

v4 相对 v3 的 subagent 用法变化：

| Subagent | v3 用法 | **v4 用法** |
|---|---|---|
| drama-writer | Phase 2 persona / 特殊 team | Phase 2.1 / 2.4 persona（同） |
| drama-character | Phase 3 心脏戏 team | **Phase 2.3 writers-room team**（岗位转移）|
| drama-world-keeper | Phase 3 心脏戏 team 裁判 | **废止**（心脏戏回 persona 直写）|
| drama-editor | Phase 4 team 必须 | **persona 加载手册**（降级）|
| drama-reader | Phase 5 team 必须 | **Phase 5 team 必须**（保留）+ **Phase 2.2 persona 预读者**（加载模式不同）|
| drama-advisor | persona | persona（同）|

### Skill 架构（三角 · v4.1 各 Skill 自管 templates/）

```
.codebuddy/skills/
├── drama-world/          # 世界引擎（筹备 + 角色 + 状态 + 工程守护）
│   ├── SKILL.md          # 精简骨架（93 行 / 641 字 · ≤150/800 硬上限）
│   ├── references/       # brainstorm-sop / character-spec / canon-rules
│   ├── scripts/          # 19 个工具脚本（含新增 validate-doc-size.js）
│   └── templates/        # ✨ v4.1 · soul-s/a/b/base · character / character-pack / c-class-index / story-seed / series-bible / three-act-preset / state / memory / rules + presets/
│
├── drama-director/       # 导演 Owner（9 人班子编排 + 6 阶段流水线）
│   ├── SKILL.md          # 精简骨架（125 行 / 800 字 · ≤150/800 硬上限）
│   ├── references/
│   │   ├── workflow.md           # 6 阶段流水线详细定义 + 非 novel 产物字数配额
│   │   ├── team-roster.md        # 9 人班子卡片 + spawn prompt 蓝本 + 加载映射表
│   │   ├── team-protocol.md      # Team 交互协议
│   │   ├── compile-novel.md      # 小说编译规范
│   │   ├── compile-screenplay.md # 剧本编译规范
│   │   └── craft/                # 8 大专业知识文件（事实源）
│   │       ├── characterology.md / conflict.md / scene-design.md / dialogue.md
│   │       └── mystery.md / prose.md / editing.md / narrative-weight.md
│   ├── scripts/          # 6 个脚本（compile-novel / compile-screenplay / pre-compile-clean / validate-beat-sheet / validate-episode-artifacts · v4.1 新增后者）
│   └── templates/        # ✨ v4.1 · episode-brief / beat-sheet / wrap-report 骨架 + beat-sheet-v2（历史）
│
└── drama-critic/         # AI 味机械门控（仅 check-ai-taste.js）
    ├── SKILL.md          # 精简骨架（99 行 / 432 字）
    └── scripts/          # check-ai-taste.js（A 级硬约束 + C5.1-C5.10 句式黑名单）
```

**文档体积硬上限**（v4.1 新增 · 由 `drama-world/scripts/validate-doc-size.js` 门控）：
- SKILL.md ≤ 150 行 / 800 中文字 · error 级
- rules/*.md ≤ 250 行 / 1800 中文字 · warning 级
- 详见 `.codebuddy/rules/doc-sync.md` "核心文档体积上限"节

### 创作班子编制（v4 · 9 位）

| 成员 | spawn_mode | subagent | 出场阶段 | 加载的 craft 文件 | 核心职责 |
|---|---|---|---|---|---|
| **导演**（主 Agent）| main-agent | — | 全程 | workflow + roster | 选角、定基调、仲裁 |
| **编剧** | persona | `drama-writer` | Phase 2.1, 2.4 | conflict + scene-design + mystery + narrative-weight | 起草 beat-sheet v0 + 吸收反馈改稿 → v1 |
| **预读者**（v4 新）| persona | `drama-reader`（加载模式不同）| Phase 2.2 | **不加载 craft**（只加载 reader-memory）| 盲测骨架 · 追更冲动预测（无评分）|
| **角色 Agent × N**（v4 岗位转移）| **TEAM 必须** | `drama-character` | Phase 2.3 | 自己 SOUL + MEMORY + 个人 beat 摘要 | 审骨架 · 反对/争取/台词种子三问 |
| **悬疑顾问** | persona | `drama-advisor(mystery)` | Phase 2.1, 4 | mystery | 三铁律 + 钩子经济 |
| **表演指导** | persona | `drama-advisor(performance)` | Phase 3（可选）| characterology + dialogue | performance-briefing（可选）|
| **责编**（v4 降级）| persona | `drama-editor`（persona 手册）| Phase 4 | editing + prose + dialogue + narrative-weight | 8 步 SOP · 反流水账四禁 · 文本层 |
| **文学顾问** | persona | `drama-advisor(prose)` | Phase 4（按需）| prose + narrative-weight | 只执行责编 order |
| **终审读者** | **TEAM 必须** | `drama-reader` | Phase 5 | **不加载 craft** | 盲评 · 打分 · 更新 reader-memory |

**v4 反 persona 三条标准**（命中 3/3 必须 Team · 收紧于 v3 的 ≥2）：
1. 身份独立性（与作者视角分离？）
2. 信息封闭性（不该读内部文档？）
3. 对抗性（使命是挑毛病？）

→ v4 只有 Phase 2.3 writers-room + Phase 5 终审读者 3/3 满命中。其余 persona。

详细班子卡片见 `drama-director/references/team-roster.md`。

### 6 阶段流水线（v4）

```
Phase 1: 导演选角定调（读 context + 选角 + 基调 + 快照 + init + reader-memory 硬需求映射）
Phase 2: 创作班子开盘（内部 5 步）
  ├── 2.1 编剧 persona 起草 beat-sheet v0（scene_weight + 8 问 + canon_check）
  ├── 2.2 预读者 persona 盲测骨架 → reader-preview.md（无评分）
  ├── 2.3 writers-room TEAM 审骨架（drama-character × N · 三问：反对/争取/台词种子）
  ├── 2.4 编剧 persona 改稿 → v1（含 agent_voices + reader_preview_notes）
  └── 2.5 validate-beat-sheet 脚本校验（含字数 ≤2500 硬门控 · v4.1）
Phase 3: 演绎编译 novel.md（主 agent / 编剧 persona 直写）
Phase 4: 责编 persona 内审 + 文学顾问 persona 润色（迭代 ≤ 2 轮）
Phase 5: AI 味门控（check-ai-taste EXIT=0）+ 终审读者 TEAM 盲评 ≥ 7.0
        ├── v4.1 新增：validate-episode-artifacts 整集字数配额门控（EXIT=0 才进 Phase 6）
Phase 6: Wrap 收尾（调用 drama-world 能力 + 更新 hooks/imagery ledgers · architecture=director-v4-deep-team）
```

**Token 预算**：v4 ~40K/集（与 v3 ~41K 持平 · 但对抗前置到 Phase 2 · ROI 显著提升 · 创作占比 75%）。v4.1 通过非 novel 产物 61% 精简 · 实测预算降至 **~28K/集**。

### 非 novel 产物字数配额（v4.1 新增 · 硬门控）

novel.md 是核心产出 · 其余所有文件都是为 novel 服务的 · 总量应 ≤ novel 的 1.5× ~ 2×。唯一事实源：`workflow.md "## 非 novel 产物字数配额"` 节。

| 产物 | 上限 | 级别 |
|---|---:|---|
| episode-brief.md | 1500 | error |
| beat-sheet.md | 2500 | error |
| runtime/reader-preview.md | 800 | error |
| runtime/agent-audit-log.md | 1500 | error |
| runtime/beats-*.md（每文件）| 400 | error |
| output/editor-review.md | 1200 | warning |
| output/reader-verdict.md | 1500 | warning |
| wrap-report.md | 1200 | warning |

Phase 5 → 6 之间由 `validate-episode-artifacts.js` 强制门控。架构复盘等元数据外溢到 `runtime/architecture-notes.md`（非六件套 · 不计入配额）。

### 故事子项目结构（v4）

```
stories/<name>/
├── .story.json              # 故事元数据（title/genre/seedSource/architecture_version: v4）
├── agents/                  # Agent 居民（SOUL + MEMORY + RULES）
├── world/                   # 世界状态（bible + state + timeline + imagery-ledger + hooks-ledger）
├── runtime/                 # 跨集运行态
│   └── reader-memory.md     # 终审读者跨集积累（Phase 2.2 读 · Phase 5 写）
└── episodes/                # 单集产出
    └── <ep-id>/
        ├── episode-brief.md         # Phase 1 产出（含 writers-room 成员）· ≤1500 字
        ├── beat-sheet.md            # Phase 2.4 产出（v1 · agent_voices + reader_preview_notes）· ≤2500 字
        ├── runtime/                 # 集内运行态
        │   ├── reader-preview.md    # v4 · Phase 2.2 预读者盲测 · ≤800 字
        │   ├── agent-audit-log.md   # v4 · Phase 2.3 writers-room 发言记录 · ≤1500 字
        │   ├── beats-<agent-id>.md  # v4 · 每个 writers-room 成员的个人 beat 摘要 · ≤400 字/文件
        │   └── architecture-notes.md # v4.1 · 按需创建 · 架构复盘元数据（非六件套 · 不计入配额）
        ├── output/
        │   ├── novel.md             # Phase 3-4 正文（position 区间 · 非 quota）
        │   ├── editor-review.md     # Phase 4 责编 persona 产出 · ≤1200 字（warning）
        │   └── reader-verdict.md    # Phase 5 终审读者 team 产出 · ≤1500 字（warning）
        └── wrap-report.md           # Phase 6 收尾（含 v4 架构数据）· ≤1200 字（warning）
```

### 修改建议

- **改初始化模板**：修改 `.codebuddy/skills/drama-world/templates/*.yaml` 或 `presets/*.yaml`
- **改产出骨架**：修改 `.codebuddy/skills/drama-director/templates/*.template.md`
- **改流水线**：修改 `.codebuddy/skills/drama-director/references/workflow.md`
- **改班子成员**：修改 `.codebuddy/skills/drama-director/references/team-roster.md`
- **改专业知识**：修改对应的 `.codebuddy/skills/drama-director/references/craft/*.md`
- **改触发词**：修改 Skill 头部的 `description` 字段
- **改故事内容**：修改 `stories/<name>/agents/*/SOUL.yaml` 或 `world/`
- **改硬约束清单**：修改 `.codebuddy/rules/writing-craft.md`（索引层）+ `craft/prose.md`（详细层）
- **改文档体积上限**：修改 `.codebuddy/rules/doc-sync.md` "核心文档体积上限"节 + `validate-doc-size.js` 配额配置（两处必须同步）

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
| `minimal-edit.md` | 反膨胀：默认最小改动 · 显式"重构/refactor/plan"才解锁大改 |
| `gate-error-triage.md` | 门控 Error 分诊：C 类（内容错）改内容 · E 类（引擎错）改 skill/rules/subagent · 反反复改内容 |

### 验证方式

在对话中说"校验角色"、"check agents"即可触发 drama-world 的 validate 脚本。
如需手工测试脚本，可直接 `node .codebuddy/skills/drama-world/scripts/validate.js --story <name>`。

### 不要做的事

- 不要直接修改 Agent 的 MEMORY.md（由 wrap 时统一写入）
- 不要在没有快照的情况下覆盖 stories/ 下的目录
- 不要让 Agent SOUL.yaml 的核心身份字段（id/trauma/motivation）随意变动
- 不要让导演"动笔"（导演只做战略决策，创作交给班子 persona/team）
- 不要让 Phase 2.2 预读者或 Phase 5 终审读者加载 craft 文件（保持纯直觉）
- 不要让 Phase 2.2 预读者打分（那是 Phase 5 终审读者的活）
- 不要让 Phase 2.3 writers-room 的角色 agent 看到其他角色的 secret（信息封闭硬约束）
- 不要让 Phase 5 终审读者读 reader-preview.md 或 agent-audit-log.md（两读者互不通信）
- 不要跳过 Phase 4 责编内审（即使 persona 化 · 反流水账四禁继承）
