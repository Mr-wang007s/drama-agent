### 项目目标

`drama-agent` 是一个 **通用 AI 叙事引擎**——给 Agent 赋予身份、记忆、人格，让它们在共享世界中自由交互演绎。master 分支是纯引擎，故事在分支上生成。

### 关键工程约束

- **Agent = 目录**：`agents/<agent-id>/` 下的 SOUL.yaml + MEMORY.md + RULES.md 是 Agent 的全部身份。
- **SOUL v4.0 三层结构**：身份层 → 心理层（OCEAN + 创伤链）→ 表演层
- **世界 = world/**：`world/bible.md` + `world/state.json` + `world/timeline.md` 是共享世界状态。
- **Skill = 能力**：`.codebuddy/skills/` 下的每个 Skill 是一种独立能力。
- **Canon 保护**：`world/bible.md` 和 `agents/*/SOUL.yaml` 的核心身份字段受写保护。
- **有界记忆**：每个 Agent 的 MEMORY.md 有 ~2000 字符容量上限。
- **引擎与故事分离**：master = 纯引擎代码，故事内容在分支上生成。

### 常用命令

```bash
# 初始化故事
npm run drama -- init --preset mystery
npm run drama -- init --from my-story-seed.yaml

# 创建角色
npm run drama -- create-character --interactive
npm run drama -- create-character --from-brief "角色简介"

# 模拟
npm run drama -- sim ep01 --title "第一集" --agents agent-a,agent-b --skill screenplay

# 查看状态
npm run drama -- status

# 查询记忆
npm run drama -- recall agent-a

# 快照回滚
npm run drama -- roll ep01 --to latest

# 校验
npm run drama -- validate
```

### 目录职责

- **`templates/`**：初始化模板（SOUL v4.0 + story-seed + presets）
- **`examples/`**：样板故事归档
- **`.codebuddy/skills/`**：Skill 能力层（harness/world/director/screenplay/novel）
- **`.codebuddy/commands/drama/`**：命令入口（init/create-character/sim/status/recall/roll）
- **`scripts/hooks/`**：生命周期钩子（不动）

### 故事分支上的目录

- **`agents/`**：Agent 居民（SOUL + MEMORY + RULES）
- **`world/`**：世界状态（bible + state + timeline）
- **`episodes/`**：模拟产出（按集归档）

### 修改建议

- **改模板**：修改 `templates/*.yaml` 或 `templates/presets/*.yaml`
- **改能力**：修改 `.codebuddy/skills/*/SKILL.md` 或 `scripts/`
- **改命令**：修改 `.codebuddy/commands/drama/*.md`
- **改 Agent**（故事分支）：修改 `agents/*/SOUL.yaml` 或 `RULES.md`
- **改世界**（故事分支）：修改 `world/bible.md` 或 `world/state.json`

### 验证要求

```bash
npm run drama -- validate
```

### 不要做的事

- 不要直接修改 Agent 的 MEMORY.md（由 Harness wrap 时统一写入）
- 不要在没有快照的情况下覆盖 world/ 目录
- 不要让 Agent SOUL.yaml 的核心身份字段（id/trauma/motivation）随意变动
- 不要在 master 分支上创建 world/、agents/、episodes/ 目录
