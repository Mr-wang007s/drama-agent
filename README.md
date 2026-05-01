# DramaAgent v6 — 通用 AI 叙事引擎（Skill 对话驱动）

> 给 Agent 身份、记忆、人格，让它们在共享世界中自由演绎。
> **核心工作方式**：用户用自然语言对话，Skill 识别意图后由主 Agent 执行。

## v6 的变化

- **彻底移除 CLI 路由层**（删除 `bin/`）——所有能力通过对话触发 Skill
- **Skill 自治**：每个 Skill 自带 `scripts/` 子目录，包含该能力所需的工具脚本
- **角色分级体系**：S/A/B/C 四级，目录前缀强约束，适配长篇连载
- **AI 味自动检测**：Critic 的客观质量门控
- **三专家头脑风暴**：`drama-world` Skill 并行调度世界观/角色/商业视角

## 快速开始

**你不需要记任何命令**。用自然语言告诉主 Agent 你想做什么即可：

| 你说 | 触发的 Skill |
|------|-------------|
| "我想基于考古悬疑做个新小说" | `drama-world` → 三专家头脑风暴 → 设计文档 |
| "从这份设计文档初始化新故事" | `drama-world` → `init-from-design` |
| "丰富一下角色" | `drama-world` → 设计角色 → `import-characters` → `sync-roster` |
| "续写" / "生成下一集" | `drama-director` → 规划/导演/编译/评审/收尾 |
| "查下 EP06 的 AI 味" | `drama-critic` → `check-ai-taste` |
| "把 xiao-zhao 升级为 A 级" | `drama-world` → `retier` |
| "状态" | `drama-world` → `status` |

## 核心概念

### Agent = SOUL + MEMORY

每个 Agent 是 `stories/<name>/agents/<tier>_<agent-id>/` 目录下的一组文件：

- **SOUL.yaml** — 我是谁（SOUL v4.0 三层结构 + tier 分级）
- **MEMORY.md** — 我经历了什么（按 tier 有上限：S=2000 / A=1200 / B=600 字符）

目录前缀 `s_` / `a_` / `b_` 强制标识级别；C 级角色合并在 `C-CLASS-INDEX.yaml`。

### World = bible + state + timeline

`stories/<name>/world/` 维护共享世界状态：

- **bible.md** — 世界观和硬约束
- **state.json** — 全局状态（派系、神墟、roster）
- **timeline.md** — 事件时间线

### Skill 架构

```
.codebuddy/skills/
├── drama-world/       ← 头脑风暴编排（纯对话）
├── drama-world/          ← 工程层（初始化/校验/快照/批量角色）
│   └── scripts/
├── drama-world/            ← 世界引擎（上下文组装）
├── drama-director/         ← 导演（生成流水线编排）
├── drama-critic/           ← 评审（五维人格 + AI 味门控）
│   └── scripts/
├── drama-director/            ← 小说格式编译
└── drama-director/       ← 剧本格式编译
```

## 目录结构

```
drama-agent/
├── .codebuddy/
│   ├── skills/             # 所有能力 Skill（每个 Skill 含 SKILL.md + 可选 scripts/）
│   └── commands/drama/     # 历史命令描述（保留作参考）
├── templates/              # 初始化模板（SOUL 四级 + character-pack + preset）
├── stories/                # 故事子项目目录
│   ├── jiu-ge/
│   │   ├── .story.json
│   │   ├── world/
│   │   ├── agents/
│   │   │   ├── s_lin-mo/
│   │   │   ├── a_shen-qingyuan/
│   │   │   ├── b_feng-yu/
│   │   │   ├── C-CLASS-INDEX.yaml
│   │   │   └── CHARACTER-INDEX.md
│   │   └── episodes/
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

## 文档

- [AGENTS.md](AGENTS.md) — Agent 系统说明 + SOUL v4.0 格式文档
- [CODEBUDDY.md](CODEBUDDY.md) — 项目约束 + 触发词映射表
