---
name: drama-harness
description: DramaAgent 工程层——保证模拟世界的可控性、可靠性、可组合性、持久性、可观测性。支持故事初始化和角色创建。
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
| `story-init.js` | **[NEW]** 故事级初始化：从种子文件创建 world/ + agents/ | `drama init` |
| `character-init.js` | **[NEW]** 角色创建：从简介/原型/文本生成 SOUL v4.0 | `drama create-character` |
| `validate-character.js` | **[NEW]** 角色校验器：人格漂移/创伤绕过/秘密泄露检测 | `drama validate` |
| `init.js` | 模拟初始化：创建 episode 目录 + 快照 + 设状态 | `drama sim` |
| `wrap.js` | 模拟收尾：更新记忆 + 提取 carry-over + 报告 | `drama sim`（自动） |
| `snapshot.js` | 快照创建/列出/回滚 | `drama roll` |
| `status.js` | 世界 + Agent + 记忆状态查询 | `drama status` |
| `validate.js` | SOUL.yaml 校验 + MEMORY 容量检查 | `drama sim`（前置） |
| `memory.js` | 记忆工具：add/replace/remove + 归档 | `drama recall` |

---

## 故事初始化 (`story-init.js`)

从种子文件或预设模板初始化完整的故事基座：

```bash
# 从预设初始化
npm run drama -- init --preset mystery

# 从种子文件初始化
npm run drama -- init --from my-story-seed.yaml

# 强制覆盖已有故事
npm run drama -- init --preset mystery --force
```

**可用预设**：mystery（悬疑）、fantasy（奇幻）、scifi（科幻）、romance（言情）

**初始化产出**：
- `world/bible.md` — 世界观
- `world/state.json` — 世界状态
- `world/timeline.md` — 时间线
- `agents/<id>/SOUL.yaml` — 角色身份
- `agents/<id>/MEMORY.md` — 角色记忆
- `agents/<id>/RULES.md` — 角色红线

---

## 角色创建 (`character-init.js`)

支持多种创建方式：

```bash
# 交互式创建（推荐）
npm run drama -- create-character --interactive

# 从简介生成
npm run drama -- create-character --from-brief "一个因童年火灾失去母亲的舞台监督"

# 从原型启发
npm run drama -- create-character --archetype 反英雄 --genre mystery
```

**可用原型**：hero（英雄）、antihero（反英雄）、mentor（导师）、shadow（阴影）、trickster（捣蛋鬼）、shapeshifter（变形者）、herald（使者）、guardian（守护者）

---

## 角色校验 (`validate-character.js`)

检测角色定义的完整性和一致性：

```bash
# 校验所有角色
npm run drama -- validate

# 校验指定角色
npm run drama -- validate lin-qi

# 严格模式
npm run drama -- validate --strict
```

**校验项目**：
1. 结构完整性：SOUL v4.0 必需字段检查
2. OCEAN 数值范围：25-75 推荐范围
3. 创伤链完整性：Ghost-Wound-Lie-Shield 逻辑链
4. 秘密泄露风险：MEMORY 中不应出现的信息
5. 表演层完整性：语言模式、情绪触发器、压力反应

---

### Canon 保护范围

以下文件受到写保护，Agent 不可修改：

- `world/bible.md`
- `agents/*/SOUL.yaml`（核心字段：id/name/archetype/trauma/motivation）

以下字段可由 Harness 在 wrap 时更新：

- `agents/*/SOUL.yaml` 的 `emotion.current`、`known_facts`、`relationships[].trust`
- `agents/*/MEMORY.md`（有界写入）
- `world/state.json`（全局状态）
- `world/timeline.md`（事件追加）

### 与其他 Skill 的集成

- **drama-world** 调用 `lib.js` 中的工具函数
- **drama-screenplay / drama-novel** 在 wrap 阶段被调用
- **drama-director** 在 sim 期间作为世界管理者运行，支持内心独白机制
