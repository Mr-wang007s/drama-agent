---
description: |
  DramaAgent 世界状态层与记忆层约束。
  防止运行态数据污染 canon、防止 MEMORY 无节制膨胀、防止 state 被非 wrap 路径偷偷改写。
globs: "stories/**/world/**,stories/**/agents/**/MEMORY.md,stories/**/agents/**/MEMORY-archive.md"
alwaysApply: true
---

### 世界状态与记忆规则（跨故事通用）

本规则作用于所有故事（`stories/<name>/`）的 `world/` 目录和 Agent 的 `MEMORY.md` 文件。路径一律使用 `<name>` 占位符。

---

#### 状态层（`stories/<name>/world/`）

| 文件 | 角色 | 谁可以写 |
|---|---|---|
| `bible.md` | 世界圣经（canon） | 仅 `drama-world` 维护流程，需显式说明原因 |
| `state.json` | 跨集世界状态（天气 / 时间 / 势力值 / 已解锁线索） | `drama-director` 的 Phase 5 wrap |
| `timeline.md` | 事件时间线 | `drama-director` 的 Phase 5 wrap |

**硬约束**

- `state.json` **只能**在 Phase 5 wrap 或明确的 `drama-world` 系列维护操作中更新。
- 禁止在 Phase 1-4 的任何中间产物里改写 `state.json`。
- `bible.md` 属于 canon（详见 `drama-orchestration.md` Canon 保护节）。

---

#### 记忆层（Agent MEMORY）

每个 Agent 的 `stories/<name>/agents/<tier>_<agent-id>/MEMORY.md` 有**按分级的硬容量上限**：

| Tier | 目录前缀 | 容量上限（中文字符）|
|---|---|---:|
| S | `s_` | 2000 |
| A | `a_` | 1200 |
| B | `b_` | 600 |
| C | 合并至 `C-CLASS-INDEX.yaml` | — |

**写入规则**

- MEMORY.md 仅由 `drama-director` 的 Phase 5 统一写入，不允许中间阶段临时写入。
- 每条记忆必须带 `[EPxx]` 集标签，便于后续归档。
- 接近容量 90% 时，必须将 3 集之前的 `[EPxx]` 条目迁移到同目录下 `MEMORY-archive.md`。
- `MEMORY-archive.md` 不计入容量上限，但仍需保持结构化（按集分块）。

---

#### 运行态数据（不得回写状态/记忆层）

下列运行态文件严禁回写到 `world/` 或 `MEMORY.md`：

- `stories/<name>/episodes/<ep-id>/.fsm-state.json`
- `stories/<name>/episodes/<ep-id>/.session.json`
- `stories/<name>/episodes/<ep-id>/runtime/**`
- hooks / scripts 产生的 debug log

如需持久化调试信息，写到独立日志路径（例如 `stories/<name>/episodes/<ep-id>/runtime/log-*.md`）。

---

#### 跨故事隔离

- `stories/A/` 下的 state / MEMORY / bible **严禁**引用 `stories/B/` 下的任何文件。
- 公共模板放在 `.codebuddy/skills/<skill>/templates/` 或 `examples/`，不放在具体故事目录内。
