# DramaAgent v6.1 — 通用 AI 叙事引擎（三 Team 循环增强）

> 给 Agent 身份、记忆、人格，让它们在共享世界中自由演绎。
> **核心工作方式**：用户用自然语言对话，Skill 识别意图后由主 Agent 执行。
> **v6.1 核心升级**：三 Team 循环增强 GAN 架构（演绎 Team → 读者 Team → 专家 Team → 修订 → 回评）。

## v6.1 的变化（三 Team 循环增强）

- **直写模式废止**：任何场景强制 Team 模式（独幕演 = 最小合法 Team：1 Agent + world-manager）
- **Phase 1.5 Writing-Coach**：8 问预检 + 6 条硬打回判定，beat-sheet 不达标不入 Phase 2
- **读者 Team（Phase 4.5）**：4 画像并行打分，均分 <7.0 硬阻断
- **专家 Team（Phase 4.6）**：4 专业顾问并行诊断（读者均分 <8.0 或每 3 集强制触发）
- **Director 仲裁 + 定向修订 + 回评环（Phase 4.7-4.9）**：GAN 迭代 ≤2 轮
- **Phase 6 系列复盘**：每 3 集读者+专家联合长评 → pro-advisory-notes 沉淀
- **C 级正向约束**：C1 读者替接话 / C2 沉默比发言主动 / C3 钩子回收 / C4 Jaccard / C5 十条黑名单
- **悬疑三铁律 + 破防戏五铁律**：类型写作硬约束落地
- **意象诗学账本 + 钩子审计台账**：跨集追踪闭环
- **SOUL v4.0 五字段扩展**：unique_markers / blacklist_cross / body_signature / breakdown_budget / silence_quota

## 快速开始

**你不需要记任何命令**。用自然语言告诉主 Agent 你想做什么即可：

| 你说 | 触发的 Skill |
|------|-------------|
| "我想基于考古悬疑做个新小说" | `drama-world` → 三专家头脑风暴 → 设计文档 |
| "从这份设计文档初始化新故事" | `drama-world` → `init-from-design` |
| "丰富一下角色" | `drama-world` → 设计角色 → `import-characters` → `sync-roster` |
| "续写" / "生成下一集" | `drama-director` → 三 Team 循环增强流水线（Phase 1-6） |
| "查下 EP06 的 AI 味" | `drama-critic` → `check-ai-taste`（含 C5.1-C5.10） |
| "评审" / "打分" | `drama-critic` → 6 维度评审（含读者吸引力 25%） |
| "把 xiao-zhao 升级为 A 级" | `drama-world` → `retier` |
| "状态" | `drama-world` → `status` |

## 核心概念

### Agent = SOUL + MEMORY

每个 Agent 是 `stories/<name>/agents/<tier>_<agent-id>/` 目录下的一组文件：

- **SOUL.yaml** — 我是谁（SOUL v4.0 三层结构 + tier 分级 + 五字段扩展）
- **MEMORY.md** — 我经历了什么（按 tier 有上限：S=2000 / A=1200 / B=600 字符）

目录前缀 `s_` / `a_` / `b_` 强制标识级别；C 级角色合并在 `C-CLASS-INDEX.yaml`。

### World = bible + state + timeline + ledgers

`stories/<name>/world/` 维护共享世界状态：

- **bible.md** — 世界观和硬约束（canon 保护）
- **state.json** — 全局状态（派系、神墟、roster）
- **timeline.md** — 事件时间线
- **imagery-ledger.md** — 意象诗学账本（引入→挑战→完成三阶段追踪）
- **hooks-ledger.md** — 钩子审计台账（A/B/C 分级 + 回收期审计）

### 四角 Skill 架构

```
.codebuddy/skills/
├── drama-world/          # 世界引擎（筹备 + 角色 + 状态 + 工程守护）
│   ├── SKILL.md
│   ├── references/       # brainstorm-sop / character-spec / canon-rules / interaction-protocol
│   └── scripts/          # 18 个工具脚本
├── drama-director/       # 导演 Owner（三 Team 循环增强编排 + 多 Agent Team + 编译）
│   ├── SKILL.md
│   ├── references/       # workflow-episode / team-protocol / reader-panel-protocol
│   │                     # expert-panel-protocol / coach-questions / compile-novel / compile-screenplay
│   └── scripts/          # 10 个工具脚本（含 reader-panel / expert-panel / dialogue-jaccard 等）
├── drama-critic/         # 独立评审（GAN Evaluator，6 维度含读者吸引力 25%）
│   ├── SKILL.md
│   └── scripts/          # check-ai-taste.js（22 条规则含 C5.1-C5.10）+ evaluate.js
└── writing-coach/        # 内部辅助（Phase 1.5 预检，不暴露触发词）
    └── SKILL.md          # 8 问 + 6 条打回判定
```

### 三 Team 循环增强（GAN 架构）

```
Phase 1 规划 → Phase 1.5 Writing-Coach 预检
  → Phase 2 强制 Team 演绎
  → Phase 3.0 编译前清理 → Phase 3.1 AI 味门控 → Phase 3.2 辅助门控
  → Phase 4 Critic 评审
  → Phase 4.5 读者 Team（4 画像并行，均分<7.0 阻断）
  → Phase 4.6 专家 Team（均分<8.0 触发 / 每 3 集强制）
  → Phase 4.7 Director 仲裁 → Phase 4.8 定向修订 → Phase 4.9 回评（≤2 轮）
  → Phase 5 收尾 → Phase 6 系列复盘（每 3 集）
```

## 目录结构

```
drama-agent/
├── .codebuddy/
│   ├── skills/             # 四角 Skill 架构（drama-world / director / critic / writing-coach）
│   ├── rules/              # 六项硬约束规则（drama-orchestration / writing-craft / episode-workflow
│   │                       #   harness-memory / pro-advisory-notes / doc-sync）
│   └── commands/drama/     # 历史命令描述（保留作参考）
├── templates/              # 初始化模板（SOUL v4.0 + beat-sheet-v2 + character-pack + preset）
├── stories/                # 故事子项目目录
│   ├── jiu-ge/
│   │   ├── .story.json
│   │   ├── world/          # bible + state + timeline + imagery-ledger + hooks-ledger
│   │   ├── agents/
│   │   │   ├── s_lin-mo/
│   │   │   ├── s_shen-yanzhi/
│   │   │   ├── s_zhou-wenyuan/
│   │   │   ├── s_shen-qingyuan/
│   │   │   ├── s_lu-jiu/
│   │   │   ├── C-CLASS-INDEX.yaml
│   │   │   └── CHARACTER-INDEX.md
│   │   └── episodes/      # 六件套（brief / beat-sheet / novel / critic-report / reader-panel-report / wrap-report）
│   └── naruto/
├── examples/               # 样板归档
├── docs/                   # 设计文档归档
└── tests/
```

## 开发者备忘

- **脚本可独立运行**：`node .codebuddy/skills/drama-world/scripts/<script>.js --story <name> ...`
- **脚本也可被 import**：`import { main } from '.../scripts/status.js'` 然后 `main(argv)`
- **不要重新引入 CLI 路由层**：对话触发才是正道
- **加新能力优先复用现有 Skill**，实在绕不开再新建
- **直写模式已废止**：所有场景必须通过 Team 模式（独幕演为最小合法 Team）
- **读者 Team 不可跳过**：每集必须经过 4 画像打分，均分 <7.0 硬阻断

## 文档

- [AGENTS.md](AGENTS.md) — Agent 系统说明 + SOUL v4.0 格式文档 + 四角 Skill 架构
- [CODEBUDDY.md](CODEBUDDY.md) — 项目约束 + 触发词映射表 + 规则索引
