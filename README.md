# DramaAgent v3 — AI Agent 身份模拟平台

> 给 Agent 身份，让它们在世界中自由演绎。

## 快速开始

```bash
# 查看世界和 Agent 状态
npm run drama -- status

# 启动一次模拟
npm run drama -- sim ep04 --title "暗流" --agents lin-qi,su-yao,gao-ming --skill screenplay

# 查询 Agent 记忆
npm run drama -- recall lin-qi
npm run drama -- recall lin-qi --search "录像带"

# 快照回滚
npm run drama -- roll ep04 --to latest

# 校验所有 Agent
npm run drama -- validate
```

## 核心概念

### Agent = SOUL + MEMORY + RULES

每个 Agent 是 `agents/<agent-id>/` 目录下的一组文件：

- **SOUL.yaml** — 我是谁（身份、欲望、恐惧、秘密、说话风格）
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
agents/                   # Agent 居民
  lin-qi/SOUL.yaml
  lin-qi/MEMORY.md
  lin-qi/RULES.md
world/                    # 世界状态
  bible.md
  state.json
  timeline.md
episodes/                 # 模拟产出
.codebuddy/skills/        # Skill 能力层
  drama-harness/          # 工程层
  drama-world/            # 世界引擎
  drama-director/         # 世界管理者
  drama-screenplay/       # 剧本 Skill
  drama-novel/            # 小说 Skill
```

## 文档

- [PRD v3.0](docs/PRD.md) — 完整产品需求文档
