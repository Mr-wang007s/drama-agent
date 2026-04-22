### 项目目标

`drama-agent` 是一个 **通用 AI 叙事引擎**——给 Agent 赋予身份、记忆、人格，让它们在共享世界中自由交互演绎。采用 **Monorepo 大仓架构**，引擎代码在根目录，每个故事作为独立子项目在 `stories/` 下。

### 关键工程约束

- **Agent = 目录**：`stories/<name>/agents/<tier>_<agent-id>/` 下的 SOUL.yaml + MEMORY.md 是 Agent 的全部身份。
- **分级约定**：所有 agent 目录必须以 `s_` / `a_` / `b_` 开头（C 级合并到 `C-CLASS-INDEX.yaml`）。分级标准见 `docs/engine-v6-toolchain.md`。
- **SOUL v4.0 三层结构**：身份层 → 心理层（OCEAN + 创伤链）→ 表演层
- **故事 = stories/<name>/**：每个子目录是一个独立故事，包含 world/ + agents/ + episodes/
- **Skill = 能力**：`.codebuddy/skills/` 下的每个 Skill 是一种独立能力。
- **Canon 保护**：world/bible.md 和 agents/*/SOUL.yaml 的核心身份字段受写保护。
- **有界记忆**：每个 Agent 的 MEMORY.md 按 tier 有容量上限（S: 2000 / A: 1200 / B: 600 字符）。
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

### v6 批量化工具（见 docs/engine-v6-toolchain.md）

```bash
# 从设计文档一键生成故事骨架
npm run drama -- init-from-design --name my-story --from docs/design.md

# 批量导入角色（pack.yaml → S/A/B/C 分级，自动加前缀）
npm run drama -- import-characters --story my-story --from pack.yaml

# 按 tier 字段加前缀 / 单个角色升降级
npm run drama -- retier --story my-story --apply-prefix
npm run drama -- retier --story my-story --id xxx --from b --to a

# 同步 roster + 重建 CHARACTER-INDEX
npm run drama -- sync-roster --story my-story --check-usage

# AI 味自动检测（量化 11 项指标）
npm run drama -- check-style --story my-story --episode ep01
```

### 目录职责

- **`templates/`**：初始化模板（SOUL v4.0 四级分档 + character-pack + story-seed + presets）
- **`stories/`**：故事子项目目录（每个子目录是一个独立故事）
- **`examples/`**：样板归档（保留 red-curtain 的原始副本）
- **`.codebuddy/skills/`**：Skill 能力层（harness/world/director/screenplay/novel/brainstorm/critic），所有工具脚本归属在各 Skill 的 `scripts/` 子目录
- **`.codebuddy/commands/drama/`**：命令入口（init/sim/create-character/status/recall/roll）
- **`bin/`**：CLI 入口（`drama-agent.js`，路由到各 Skill 脚本）

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
