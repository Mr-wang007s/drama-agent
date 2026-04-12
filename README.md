# DramaAgent v4 — 通用 AI 叙事引擎

> 给 Agent 身份、记忆、人格，让它们在共享世界中自由演绎。

## 🆕 v4.0 新特性

- **引擎与故事分离**：master = 纯引擎，故事在分支上生成
- **故事初始化命令**：`drama init` 一键创建世界观 + 角色
- **影帝级角色系统**：SOUL v4.0 三层结构（身份层 → 心理层 → 表演层）
- **角色创建命令**：`drama create-character` 多种创建方式
- **题材预设**：悬疑/奇幻/科幻/言情快速启动

## 快速开始

```bash
# 1. 初始化故事（从预设或种子文件）
npm run drama -- init --preset mystery
npm run drama -- init --from my-story-seed.yaml

# 2. 创建角色
npm run drama -- create-character --interactive
npm run drama -- create-character --from-brief "一个因童年火灾失去母亲的舞台监督"

# 3. 查看世界和 Agent 状态
npm run drama -- status

# 4. 启动模拟
npm run drama -- sim ep01 --title "第一集" --agents agent-a,agent-b --skill screenplay

# 5. 查询 Agent 记忆
npm run drama -- recall agent-a
npm run drama -- recall agent-a --search "关键词"

# 6. 快照回滚
npm run drama -- roll ep01 --to latest

# 7. 校验所有 Agent
npm run drama -- validate
```

## 核心概念

### Agent = SOUL + MEMORY + RULES

每个 Agent 是 `agents/<agent-id>/` 目录下的一组文件：

- **SOUL.yaml** — 我是谁（SOUL v4.0 三层结构）
  - 身份层：id, name, archetype, role
  - 心理层：OCEAN 人格 + Ghost-Wound-Lie-Shield 创伤链 + Want/Need
  - 表演层：语言模式 + 情绪触发器 + 压力反应 + few-shot 示例
- **MEMORY.md** — 我经历了什么（有界记忆，~2000字符，跨集持久）
- **RULES.md** — 我的行为红线（不可逾越的约束）

### World = bible + state + timeline

`world/` 目录维护共享世界状态：

- **bible.md** — 世界观和硬约束
- **state.json** — 全局状态（时间、地点、Agent 关系、carry-over）
- **timeline.md** — 事件时间线（跨集累积）

### Skill = 可插拔内容输出

| Skill | 输出 |
|-------|------|
| drama-screenplay | 剧本格式 |
| drama-novel | 小说格式 |

### Harness = 五大保证

可控性 · 可靠性 · 可组合性 · 持久性 · 可观测性

## 目录结构

```
drama-agent/                  # master 分支（纯引擎）
├── .codebuddy/skills/        # Skill 能力层
│   ├── drama-harness/        # 工程层
│   ├── drama-world/          # 世界引擎
│   ├── drama-director/       # 世界管理者
│   ├── drama-screenplay/     # 剧本 Skill
│   └── drama-novel/          # 小说 Skill
├── .codebuddy/commands/drama/ # 命令定义
│   ├── init.md               # 故事初始化
│   ├── create-character.md   # 角色创建
│   ├── sim.md                # 模拟
│   ├── status.md             # 状态查询
│   ├── recall.md             # 记忆查询
│   └── roll.md               # 快照回滚
├── templates/                # 模板
│   ├── soul.yaml             # SOUL v4.0 模板
│   ├── story-seed.yaml       # 故事种子模板
│   └── presets/              # 题材预设
│       ├── mystery.yaml
│       ├── fantasy.yaml
│       ├── scifi.yaml
│       └── romance.yaml
└── examples/                 # 样板故事
    └── red-curtain/          # 红幕剧场样板

# 故事分支上生成的内容
world/                        # 世界状态
agents/                       # Agent 居民
episodes/                     # 模拟产出
```

## 文档

- [PRD v4.0](docs/PRD.md) — 完整产品需求文档
- [AGENTS.md](AGENTS.md) — Agent 角色说明 + SOUL v4.0 格式文档

## 样板参考

`examples/red-curtain/` 包含一个完整的样板故事（红幕剧场），展示了：

- **SOUL v4.0 格式**：三层角色深度结构
- **世界状态管理**：bible + state + timeline
- **故事种子文件**：story-seed.yaml 的完整示例

```bash
# 查看样板结构
ls examples/red-curtain/

# 从样板学习
cat examples/red-curtain/agents/lin-qi/SOUL.yaml
```
