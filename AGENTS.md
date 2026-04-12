### DramaAgent v5 — Agent 角色说明（Monorepo 大仓版）

本项目的 Agent 分为两类：**居民 Agent**（有身份的角色）和**系统 Agent**（Skill 提供的能力）。

---

### 居民 Agent（stories/<name>/agents/ 目录）

每个故事子项目下的 `agents/` 目录包含该故事的所有角色。

每个居民 Agent 拥有独立身份，采用 **SOUL v4.0 三层结构**：

```
┌─────────────────────────────────────────┐
│  Layer 3: 表演层 (Performance)          │
│  语言模式 + 情绪触发器 + 压力反应       │
│  + 3-5 个 few-shot 示例                 │
├─────────────────────────────────────────┤
│  Layer 2: 心理层 (Psychology)           │
│  OCEAN 数值 + Ghost-Wound-Lie-Shield    │
│  + Want vs Need 双轴动机                │
├─────────────────────────────────────────┤
│  Layer 1: 身份层 (Identity)             │
│  id + name + archetype + role           │
└─────────────────────────────────────────┘
```

Agent 的行为由 SOUL.yaml（身份）+ MEMORY.md（记忆）+ RULES.md（红线）共同驱动。

---

### SOUL v4.0 核心字段

| 层 | 字段 | 说明 |
|----|------|------|
| **身份层** | id, name, archetype, role | 基础身份和故事定位 |
| **心理层** | ocean (O/C/E/A/N 25-75) | Big Five 人格模型，防止人格漂移 |
| | trauma.ghost | 过去的创伤事件 |
| | trauma.wound | 由此产生的心理痛苦 |
| | trauma.lie | 因此相信的错误世界观 |
| | trauma.shield | 保护自己的防御机制 |
| | motivation.want | 外在目标（角色以为自己想要的） |
| | motivation.need | 内在需求（角色真正需要的） |
| | motivation.fear | 最深的恐惧 |
| | motivation.secret | 不可告人的秘密 |
| **表演层** | voice (tone, rhythm, quirks, vocabulary) | 语言模式 |
| | emotion (default, triggers) | 情绪状态机 |
| | stress_response (fight, flight, freeze, fawn) | 4F 压力反应 |
| | examples [{situation, action, inner_thought}] | few-shot 示例 |

---

### 创建角色的 5 个核心问题

1. **Want** — 这个角色最想要什么？
2. **Fear** — 这个角色最害怕什么？
3. **Secret** — 这个角色有什么不可告人的秘密？
4. **Ghost** — 童年/过去发生过什么创伤事件？
5. **Lie** — 因此 TA 相信了什么错误的道理？

---

### 系统 Agent / Skills

| Skill | 角色 | 说明 |
|-------|------|------|
| **drama-harness** | 工程守护者 | 初始化/归档/快照/校验/记忆管理/角色创建 |
| **drama-world** | 世界引擎 | 上下文组装/世界更新/场景构建 |
| **drama-director** | 世界管理者 | 在模拟中施压/推进时间/注入事件/内心独白机制 |
| **drama-screenplay** | 剧本编辑 | 从交互记录编译为剧本格式 |
| **drama-novel** | 小说改编者 | 从交互记录改写为小说格式 |

---

### Team Agent 编排

```
drama:sim ep01 --story fog-manor
  → 检查 stories/fog-manor/world/ 和 stories/fog-manor/agents/ 是否存在
  → team_create("drama-ep01")
  → spawn world-manager (drama-director)
  → spawn agent-a (SOUL + MEMORY + RULES + 场景上下文)
  → spawn agent-b
  → 自由 send_message 交互
  → scene_end → shutdown_request → team_delete
  → drama-screenplay compile
  → drama-harness wrap
```
