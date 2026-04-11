### 项目目标

`drama-agent` 是一个 **AI Agent 身份模拟平台**——给 Agent 赋予身份、记忆、人格，让它们在共享世界中自由交互演绎。

### 关键工程约束

- **Agent = 目录**：`agents/<agent-id>/` 下的 SOUL.yaml + MEMORY.md + RULES.md 是 Agent 的全部身份。
- **世界 = world/**：`world/bible.md` + `world/state.json` + `world/timeline.md` 是共享世界状态。
- **Skill = 能力**：`.codebuddy/skills/` 下的每个 Skill 是一种独立能力。
- **Canon 保护**：`world/bible.md` 和 `agents/*/SOUL.yaml` 的核心身份字段受写保护。
- **有界记忆**：每个 Agent 的 MEMORY.md 有 ~2000 字符容量上限。

### 常用命令

```bash
npm run drama -- sim ep04 --title "暗流" --agents lin-qi,su-yao,gao-ming --skill screenplay
npm run drama -- status
npm run drama -- recall lin-qi
npm run drama -- roll ep04 --to latest
npm run drama -- validate
```

### 目录职责

- **`agents/`**：Agent 居民（SOUL + MEMORY + RULES）
- **`world/`**：世界状态（bible + state + timeline）
- **`episodes/`**：模拟产出（按集归档）
- **`.codebuddy/skills/`**：Skill 能力层（harness/world/director/screenplay/novel）
- **`.codebuddy/commands/drama/`**：命令入口（sim/status/recall/roll）
- **`scripts/hooks/`**：生命周期钩子（不动）
- **`templates/`**：初始化模板

### 修改建议

- **改 Agent**：修改 `agents/*/SOUL.yaml` 或 `RULES.md`
- **改世界**：修改 `world/bible.md` 或 `world/state.json`
- **改能力**：修改 `.codebuddy/skills/*/SKILL.md` 或 `scripts/`
- **改命令**：修改 `.codebuddy/commands/drama/*.md`

### 验证要求

```bash
npm run drama -- validate
```

### 不要做的事

- 不要直接修改 Agent 的 MEMORY.md（由 Harness wrap 时统一写入）
- 不要在没有快照的情况下覆盖 world/ 目录
- 不要让 Agent SOUL.yaml 的核心身份字段（id/desire/fear/secret）随意变动
