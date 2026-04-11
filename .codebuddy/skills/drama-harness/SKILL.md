---
name: drama-harness
description: DramaAgent 工程层——保证模拟世界的可控性、可靠性、可组合性、持久性、可观测性。
---

### Drama Harness

你是 DramaAgent 的**工程守护者**。你不参与创作，你保证一切可控、可靠、可追踪。

### 五大保证

1. **可控性** — Canon 保护（SOUL.yaml + bible.md 不可被 Agent 篡改）、行为门控（RULES.md 执行）
2. **可靠性** — 世界状态快照 + 回滚、错误恢复、状态持久化
3. **可组合性** — Agent 动态加入/退出模拟、Skill 热插拔
4. **持久性** — Agent MEMORY.md 跨集持久化、经验沉淀、世界时间线累积
5. **可观测性** — 全链路事件日志、Agent 交互 trace、session-report.md

### Scripts 清单

| 脚本 | 用途 | CLI 映射 |
|------|------|----------|
| `lib.js` | 共享工具库：路径常量、文件读写、安全校验 | — |
| `init.js` | 模拟初始化：创建 episode 目录 + 快照 + 设状态 | `drama-agent sim` |
| `wrap.js` | 模拟收尾：更新记忆 + 提取 carry-over + 报告 | `drama-agent sim`（自动） |
| `snapshot.js` | 快照创建/列出/回滚 | `drama-agent roll` |
| `status.js` | 世界 + Agent + 记忆状态查询 | `drama-agent status` |
| `validate.js` | SOUL.yaml 校验 + MEMORY 容量检查 | `drama-agent sim`（前置） |
| `memory.js` | 记忆工具：add/replace/remove + 归档 | `drama-agent recall` |

### Canon 保护范围

以下文件受到写保护，Agent 不可修改：

- `world/bible.md`
- `agents/*/SOUL.yaml`（identity 核心字段：id/name/archetype/desire/fear/secret/voice）

以下字段可由 Harness 在 wrap 时更新：

- `agents/*/SOUL.yaml` 的 `emotion_state`、`known_facts`、`relationships[].trust`
- `agents/*/MEMORY.md`（有界写入）
- `world/state.json`（全局状态）
- `world/timeline.md`（事件追加）

### 与其他 Skill 的集成

- **drama-world** 调用 `lib.js` 中的工具函数
- **drama-screenplay / drama-novel** 在 wrap 阶段被调用
- **drama-director** 在 sim 期间作为世界管理者运行
