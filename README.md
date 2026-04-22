# DramaAgent v5 — 通用 AI 叙事引擎（Monorepo 大仓版）

> 给 Agent 身份、记忆、人格，让它们在共享世界中自由演绎。

## v5.0 新特性

- **Monorepo 大仓架构**：所有故事作为子项目共存于 `stories/` 目录，无需 Git 分支隔离
- **`drama init --name`**：在大仓中一键创建故事子项目
- **`--story` 全局参数**：所有命令通过 `--story <name>` 指定操作哪个故事
- **多故事并行管理**：不同故事可同时开发，互不干扰
- **影帝级角色系统**：SOUL v4.0 三层结构（身份层 → 心理层 → 表演层）
- **题材预设**：悬疑/奇幻/科幻/言情快速启动

## 快速开始

```bash
# 1. 初始化故事
npm run drama -- init --name my-story --preset mystery
npm run drama -- init --name my-story --from my-story-seed.yaml

# 2. 创建角色
npm run drama -- create-character --story my-story --interactive

# 3. 列出所有故事
npm run drama -- status

# 4. 查看故事状态
npm run drama -- status --story my-story

# 5. 启动模拟
npm run drama -- sim ep01 --story my-story --title "第一集" --agents a,b --skill screenplay

# 6. 查询记忆
npm run drama -- recall agent-a --story my-story

# 7. 快照回滚
npm run drama -- roll ep01 --story my-story --to latest

# 8. 校验
npm run drama -- validate --story my-story
```

## 核心概念

### Agent = SOUL + MEMORY + RULES

每个 Agent 是 `stories/<name>/agents/<agent-id>/` 目录下的一组文件：

- **SOUL.yaml** — 我是谁（SOUL v4.0 三层结构）
- **MEMORY.md** — 我经历了什么（有界记忆，~2000字符）
- **RULES.md** — 我的行为红线

### World = bible + state + timeline

`stories/<name>/world/` 维护共享世界状态：

- **bible.md** — 世界观和硬约束
- **state.json** — 全局状态
- **timeline.md** — 事件时间线

### Skill = 可插拔内容输出

| Skill | 输出 |
|-------|------|
| drama-screenplay | 剧本格式 |
| drama-novel | 小说格式 |

## 目录结构

```
drama-agent/                        # Monorepo 根（引擎）
├── .codebuddy/skills/              # Skill 能力层
│   ├── drama-harness/              # 工程层
│   ├── drama-world/                # 世界引擎
│   ├── drama-director/             # 世界管理者
│   ├── drama-screenplay/           # 剧本 Skill
│   └── drama-novel/                # 小说 Skill
├── .codebuddy/commands/drama/      # 命令定义
├── templates/                      # 模板 + 预设
├── stories/                        # 故事子项目目录
│   ├── fog-manor/                  # 雾中庄园
│   │   ├── .story.json
│   │   ├── agents/
│   │   ├── world/
│   │   └── episodes/
│   └── red-curtain/                # 红幕剧场
│       ├── .story.json
│       ├── agents/
│       └── world/
├── examples/                       # 样板（red-curtain 原始副本）
└── bin/drama-agent.js              # CLI 入口（路由到各 Skill 脚本）
```

## 文档

- [AGENTS.md](AGENTS.md) — Agent 角色说明 + SOUL v4.0 格式文档
