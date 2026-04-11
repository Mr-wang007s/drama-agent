### DramaAgent v3 — Agent 角色说明

本项目的 Agent 分为两类：**居民 Agent**（有身份的角色）和**系统 Agent**（Skill 提供的能力）。

---

### 居民 Agent（agents/ 目录）

每个居民 Agent 拥有独立身份，在模拟中以 Team Member 被 spawn：

| Agent | 身份 | SOUL | 交互风格 |
|-------|------|------|----------|
| **lin-qi** | 林七 · 舞台监督 | 先观察再行动 | observer-first |
| **su-yao** | 苏遥 · 回归主演 | 温柔外壳下带锋利反问 | cautious |
| **gao-ming** | 高鸣 · 调查记者 | 快准追问 | direct |

Agent 的行为由 SOUL.yaml（身份）+ MEMORY.md（记忆）+ RULES.md（红线）共同驱动。

---

### 系统 Agent / Skills

| Skill | 角色 | 说明 |
|-------|------|------|
| **drama-harness** | 工程守护者 | 初始化/归档/快照/校验/记忆管理 |
| **drama-world** | 世界引擎 | 上下文组装/世界更新/场景构建 |
| **drama-director** | 世界管理者 | 在模拟中施压/推进时间/注入事件 |
| **drama-screenplay** | 剧本编辑 | 从交互记录编译为剧本格式 |
| **drama-novel** | 小说改编者 | 从交互记录改写为小说格式 |

---

### Team Agent 编排

```
drama:sim ep04
  → team_create("drama-ep04")
  → spawn world-manager (drama-director)
  → spawn lin-qi (SOUL + MEMORY + RULES + 场景上下文)
  → spawn su-yao
  → spawn gao-ming
  → 自由 send_message 交互
  → scene_end → shutdown_request → team_delete
  → drama-screenplay compile
  → drama-harness wrap
```
