### 项目目标

`drama-agent` 是一个 **通用 AI 叙事引擎**——给 Agent 赋予身份、记忆、人格，让它们在共享世界中自由交互演绎。采用 **Monorepo 大仓架构**，引擎代码在根目录，每个故事作为独立子项目在 `stories/` 下。

### 关键工程约束

- **Agent = 目录**：`stories/<name>/agents/<agent-id>/` 下的 SOUL.yaml + MEMORY.md + RULES.md 是 Agent 的全部身份。
- **SOUL v4.0 三层结构**：身份层 → 心理层（OCEAN + 创伤链）→ 表演层
- **故事 = stories/<name>/**：每个子目录是一个独立故事，包含 world/ + agents/ + episodes/
- **Skill = 能力**：`.codebuddy/skills/` 下的每个 Skill 是一种独立能力。
- **Canon 保护**：world/bible.md 和 agents/*/SOUL.yaml 的核心身份字段受写保护。
- **有界记忆**：每个 Agent 的 MEMORY.md 有 ~2000 字符容量上限。
- **大仓 = 目录约定 + 路径参数化**：所有命令通过 `--story <name>` 参数指定操作哪个故事。

### 常用命令

```bash
# 初始化新故事
npm run drama -- init --name my-story --preset mystery
npm run drama -- init --name my-story --from my-seed.yaml

# 创建角色
npm run drama -- create-character --story my-story --interactive
npm run drama -- create-character --story my-story --from-brief "角色简介"

# 模拟
npm run drama -- sim ep01 --story my-story --title "第一集" --agents a,b,c --skill screenplay

# 查看状态（列出所有故事）
npm run drama -- status

# 查看故事状态
npm run drama -- status --story my-story

# 查询记忆
npm run drama -- recall agent-a --story my-story

# 快照回滚
npm run drama -- roll ep01 --story my-story --to latest

# 校验
npm run drama -- validate --story my-story
```

### 目录职责

- **`templates/`**：初始化模板（SOUL v4.0 + story-seed + presets）
- **`stories/`**：故事子项目目录（每个子目录是一个独立故事）
- **`examples/`**：样板归档（保留 red-curtain 的原始副本）
- **`.codebuddy/skills/`**：Skill 能力层（harness/world/director/screenplay/novel）
- **`.codebuddy/commands/drama/`**：命令入口（init/sim/create-character/status/recall/roll）
- **`scripts/hooks/`**：生命周期钩子

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
- **改能力**：修改 `.codebuddy/skills/*/SKILL.md` 或 `scripts/`
- **改命令**：修改 `.codebuddy/commands/drama/*.md`
- **改故事内容**：修改 `stories/<name>/agents/*/SOUL.yaml` 或 `world/`

### 验证要求

```bash
npm run drama -- validate --story my-story
```

### 不要做的事

- 不要直接修改 Agent 的 MEMORY.md（由 Harness wrap 时统一写入）
- 不要在没有快照的情况下覆盖 stories/ 下的目录
- 不要让 Agent SOUL.yaml 的核心身份字段（id/trauma/motivation）随意变动
