# DramaAgent v7.0 — 通用 AI 叙事引擎（豪华 8 人班子架构）

> 给 Agent 身份、记忆、人格，让它们在共享世界中自由演绎。
> **核心工作方式**：用户用自然语言对话，Skill 识别意图后由主 Agent 指挥专业班子执行。
> **v7.0 核心升级**：从"导演一人扛全流程"的单点重架构，重构为"豪华 8 人创作班子协同演绎"。
>
> **🆕 2026-05-03 · director 架构 v4 单点深度 Team 重构**：对抗前置到 Phase 2（编剧 team + 角色 writers-room + 预读者）· Phase 3-4 全 persona · Phase 5 终审读者 team 保留 · 详见 `CODEBUDDY.md` 的"创作班子编制（v4 · 9 位）"节和 `.codebuddy/rules/pro-advisory-notes.md` 2026-05-03 条目。

---

## v7.0 的变化（豪华班子重构）

核心理念：**Token 预算回归创作**。评审环节从 40% 压缩到 15%，创作环节从 24% 提升到 67%。

**架构级变化**：
- **废弃 writing-coach Skill**：Phase 1.5 预检并入编剧的 beat-sheet 内嵌 8 问自检
- **drama-critic 大幅瘦身**：仅保留 AI 味机械门控，6 维度创作评审职责移交责编
- **drama-director 彻底重构**：
  - 新 6 阶段线性流水线（废弃旧版 4.5-4.9 三 Team 循环）
  - 8 人豪华班子（导演+编剧+责编+表演指导+文学顾问+悬疑顾问+读者代表+世界管家）
  - `references/` 双层设计：A 层协议 + B 层 `craft/` 专业知识（7 大领域）

**评审级变化**：
- **责编吸收原 9 评审**：4 读者 + 4 专家 + Critic 评审 → 1 责编用多元视角模拟（节省 74% token）
- **读者代表只做终审**：Phase 5 的"会不会追下一集"直觉判断，不加载任何 craft

**知识库级变化**：
- **7 大专业知识文件**：人物学/冲突学/场景学/对话学/悬疑学/语言学/编辑学（每文件 300-600 行，有出处+样本+反例）
- **台账手工维护**：hooks-ledger.md 和 imagery-ledger.md 由责编+文学顾问手工维护，删除旧版自动化脚本

## 快速开始

**你不需要记任何命令**。用自然语言告诉主 Agent 你想做什么即可：

| 你说 | 触发的 Skill |
|------|-------------|
| "我想基于考古悬疑做个新小说" | `drama-world` → 三视角头脑风暴 → 设计文档 |
| "从这份设计文档初始化新故事" | `drama-world` → `init-from-design` |
| "丰富一下角色" | `drama-world` → 设计角色 → `import-characters` → `sync-roster` |
| "续写" / "生成下一集" | `drama-director` → 8 人班子 6 阶段流水线 |
| "查下 EP06 的 AI 味" | `drama-critic` → `check-ai-taste` |
| "把 xiao-zhao 升级为 A 级" | `drama-world` → `retier` |
| "状态" | `drama-world` → `status` |

## 核心概念

### Agent = SOUL + MEMORY

每个居民 Agent 是 `stories/<name>/agents/<tier>_<agent-id>/` 目录下的一组文件：

- **SOUL.yaml** — 我是谁（SOUL v4.0 三层结构 + tier 分级 + 五字段扩展）
- **MEMORY.md** — 我经历了什么（按 tier 有上限：S=2000 / A=1200 / B=600 字符）

目录前缀 `s_` / `a_` / `b_` 强制标识级别；C 级角色合并在 `C-CLASS-INDEX.yaml`。

### World = bible + state + timeline + ledgers

`stories/<name>/world/` 维护共享世界状态：

- **bible.md** — 世界观和硬约束（canon 保护）
- **state.json** — 全局状态（派系、神墟、roster）
- **timeline.md** — 事件时间线
- **imagery-ledger.md** — 意象系统台账（引入→挑战→完成三阶段追踪，由文学顾问手工维护）
- **hooks-ledger.md** — 钩子经济台账（A/B/C 分级 + 回收周期，由责编手工维护）

### 三角 Skill 架构

```
.codebuddy/skills/
├── drama-world/          # 世界引擎（筹备 + 角色 + 状态 + 工程守护）
│   ├── SKILL.md
│   ├── references/       # brainstorm-sop / character-spec / canon-rules / interaction-protocol
│   └── scripts/          # 18 个工具脚本
│
├── drama-director/       # 导演 Owner（8 人班子 + 6 阶段流水线 + 编译）
│   ├── SKILL.md          # 精简骨架（150 行）
│   ├── references/
│   │   ├── workflow.md           # 6 阶段流水线
│   │   ├── team-roster.md        # 8 人班子卡片 + spawn prompt 蓝本
│   │   ├── team-protocol.md      # Team 交互协议
│   │   ├── compile-novel.md
│   │   ├── compile-screenplay.md
│   │   └── craft/                # 7 大专业知识文件（"有灵魂"的事实源）
│   │       ├── characterology.md # 人物学
│   │       ├── conflict.md       # 冲突学
│   │       ├── scene-design.md   # 场景学
│   │       ├── dialogue.md       # 对话学
│   │       ├── mystery.md        # 悬疑学
│   │       ├── prose.md          # 语言学
│   │       └── editing.md        # 编辑学
│   └── scripts/          # 4 个基建脚本（compile-novel / compile-screenplay / pre-compile-clean / validate-beat-sheet）
│
└── drama-critic/         # AI 味机械门控（仅 check-ai-taste.js）
    ├── SKILL.md
    └── scripts/          # check-ai-taste.js（A 级硬约束 + C5.1-C5.10 句式黑名单）
```

### 8 人创作班子

| 成员 | 类型 | 出场 Phase | 加载的 craft | 核心职责 |
|---|---|---|---|---|
| 导演（主 Agent） | 主 | 全程 | workflow + roster | 选角、定基调、仲裁 |
| 编剧 | Task | Phase 2 | conflict + scene-design + mystery | 写 beat-sheet v3 |
| 悬疑顾问 | Task | Phase 2, 4 | mystery | 三铁律 + 钩子经济 |
| 表演指导 | Task | Phase 3 | characterology + dialogue | 9 问激活 + 监控 |
| 世界管家 | Task | Phase 3 | team-protocol | 事件注入 + 信息裁判 |
| 责编 | Task | Phase 4 | editing + prose + dialogue | 7 步 SOP 内审 |
| 文学顾问 | Task | Phase 4（按需） | prose | 反 Over-Connect + 润色 |
| 读者代表 | Task | Phase 5 | **不加载** | 终审直觉 |

### 6 阶段创作流水线

```
Phase 1: 导演独立选角定调
  → Phase 2: 创作班子开盘（编剧 + 悬疑顾问）
  → Phase 3: 大 Team 演绎（表演指导 + 世界管家 + 所有角色）
  → Phase 4: 责编内审 + 文学顾问润色（≤ 2 轮迭代）
  → Phase 5: AI 味门控 + 读者代表终审
  → Phase 6: Wrap 收尾
```

## 目录结构

```
drama-agent/
├── .codebuddy/
│   ├── skills/             # 三角 Skill 架构（drama-world / director / critic）
│   ├── rules/              # 六项硬约束规则
│   │   ├── drama-orchestration.md   # 流水线编排 + 8 人班子
│   │   ├── writing-craft.md         # 正文硬约束索引（指向 craft/）
│   │   ├── episode-workflow.md      # 单集六件套工作流
│   │   ├── harness-memory.md        # 状态层 + 有界记忆
│   │   ├── pro-advisory-notes.md    # 历史沉淀日志
│   │   └── doc-sync.md              # 文档同步规则
│   └── commands/drama/     # 历史命令描述（保留作参考）
├── templates/              # 初始化模板（SOUL v4.0 + beat-sheet + character-pack + preset）
├── stories/                # 故事子项目目录
│   ├── jiu-ge/
│   │   ├── .story.json
│   │   ├── world/          # bible + state + timeline + imagery-ledger + hooks-ledger
│   │   ├── agents/         # S/A/B 分级 + C-CLASS-INDEX
│   │   └── episodes/       # 六件套：brief + beat-sheet + novel + editor-review + reader-verdict + wrap-report
│   └── naruto/
├── examples/               # 样板归档
├── docs/                   # 设计文档归档
└── tests/
```

## 新六件套（每集必需产出）

```
stories/<name>/episodes/<ep-id>/
├── episode-brief.md          # Phase 1：导演选角定调
├── beat-sheet.md             # Phase 2：编剧骨架（含 8 问自检）
├── output/
│   ├── novel.md              # Phase 3-5：正文（迭代产出）
│   ├── editor-review.md      # Phase 4：责编 7 步 SOP 报告
│   └── reader-verdict.md     # Phase 5：读者代表终审
└── wrap-report.md            # Phase 6：集收尾总结
```

## 开发者备忘

- **脚本可独立运行**：`node .codebuddy/skills/drama-world/scripts/<script>.js --story <name> ...`
- **脚本也可被 import**：`import { main } from '.../scripts/status.js'` 然后 `main(argv)`
- **不要重新引入 CLI 路由层**：对话触发才是正道
- **加新能力优先复用现有 Skill**，实在绕不开再新建
- **直写模式已废止**：所有场景必须通过 Team 模式（独幕演为最小合法 Team）
- **责编不可跳过**：每集必须经过 Phase 4 责编内审，产出 editor-review.md
- **读者代表不加载 craft**：保持纯直觉，防止异化

## 知识库按需加载原则

8 人班子的 context 开销通过"按需加载"控制：

```
导演:          workflow(10K) + roster(5K) = ~15K 常驻
编剧:          conflict(15K) + scene(10K) + mystery(15K) = ~40K
悬疑顾问:      mystery(15K) = ~15K
表演指导:      characterology(15K) + dialogue(15K) = ~30K
世界管家:      protocol(8K) = ~8K
责编:          editing(15K) + prose(20K) + dialogue(15K) = ~50K
文学顾问:      prose(20K) = ~20K
读者代表:      0 craft（纯直觉）
```

每个成员只加载自己领域的知识——Token 预算与专业深度的平衡。

## 文档

- [AGENTS.md](AGENTS.md) — Agent 系统说明 + SOUL v4.0 格式 + 8 人班子角色
- [CODEBUDDY.md](CODEBUDDY.md) — 项目约束 + 触发词映射表 + 规则索引

## 灵魂

> 好的叙事引擎不是"更好的作者"，是"让每个 Agent 知道自己该做什么"。
> 导演统筹、编剧骨架、悬疑顾问专项、表演指导激活、世界管家物理、责编质检、文学顾问润色、读者代表直觉。
> 当 8 个人各司其职时，整体能力 > 任何一个人单打独斗 × 2。
