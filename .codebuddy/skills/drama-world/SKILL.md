---
name: drama-world
description: |
  世界引擎——筹备阶段唯一入口 + 世界状态维护 + 工程守护。
  触发词：头脑风暴、打造新小说、参考XX做故事、初始化故事、新故事、
  创建角色、丰富角色、批量导入、选角、分级管理、升级角色、
  校验、状态、回滚、快照、从设计文档建项目、同步索引。
  也在剧集流水线中被 Director 通过能力名引用其脚本。
globs:
  - "stories/**"
---

# Drama World — 世界引擎

你是**世界引擎**。不参与角色扮演 · 不替 Agent 做决定。
你维护世界的物理规则：时间在流逝 · 事件有因果 · 信息有边界。

---

## 三域分工

- **Domain A 筹备入口**：用户直接触发的创意和初始化
- **Domain B 世界维护**：被 Director workflow 引用的状态管理
- **Domain C 工程守护**：Canon 保护 / 校验 / 快照 / 状态

---

## Domain A：筹备入口（用户直接触发）

| 动作 | 触发词 | 脚本 / 文件 |
|---|---|---|
| A1 头脑风暴 | 头脑风暴、打造新小说、参考XX做故事 | 详见 `references/brainstorm-sop.md` · 产出 `docs/<slug>-design.md` |
| A2 故事初始化 | 初始化故事、新故事、从设计文档建项目 | `scripts/story-init.js`（种子/预设）· `scripts/init-from-design.js`（设计文档）|
| A3 角色创建/导入/分级 | 创建角色、丰富角色、批量导入、升级角色、分级管理 | 详见 `references/character-spec.md` · `scripts/character-init.js` / `import-characters.js` / `retier.js` |
| A4 选角 | 选角 | 读 `world/state.json` carry_over + `agents/*/SOUL.yaml` · 分析 ghost 触发 |

---

## Domain B：世界维护（被 Director workflow 引用）

Director 通过**能力名**引用以下能力。

| 能力名 | 脚本 | 说明 |
|---|---|---|
| 上下文组装 | `scripts/build-context.js` | 为每个 Agent 构建 prompt（SOUL + MEMORY + 世界状态 + 场景）|
| 场景构建 | `scripts/build-scene.js` | 根据 carry-over 和世界状态生成场景初始条件 |
| 世界更新 | `scripts/update-world.js` | 从产出更新 state.json + timeline.md |
| 模拟收尾 | `scripts/wrap.js` | 更新 MEMORY · 提取 carry-over · 生成 session-report |
| 记忆写入 | `scripts/memory.js` | 有界容量管理（add/replace/remove/archive/search）|
| episode 初始化 | `scripts/init.js` | 创建 episode 目录 + FSM 状态机 |

---

## Domain C：工程守护

| 动作 | 触发词 | 脚本 |
|---|---|---|
| C1 Canon 保护 | （规则层 · 无直接触发）| 详见 `references/canon-rules.md` |
| C2 全量校验 | 校验、check agents | `scripts/validate.js --story <name>` |
| C3 快照/回滚 | 快照、回滚 | `scripts/snapshot.js` |
| C4 状态查询 | 状态、进度 | `scripts/status.js --story <name>` |
| C5 Roster 同步 | 同步索引、更新花名册 | `scripts/sync-roster.js --story <name>` |
| C6 记忆管理 | （内部）| `scripts/memory.js`（S:2000 / A:1200 / B:600 字符）|
| C7 会话状态机 | （内部）| `scripts/session-fsm.js` · 6 态 · 自检+断点恢复 |
| C8 文档体积巡检 | （规则层门控）| `scripts/validate-doc-size.js` |

---

## 不可妥协约束

1. **Canon 保护**：bible.md + SOUL.yaml 核心字段（id/name/tier/archetype/trauma/motivation）写保护
2. **分级强制**：所有 agent 目录必须 `s_` / `a_` / `b_` 前缀（C 级合并到 INDEX）
3. **MEMORY 有界**：wrap 按 tier 上限写入 · 超容先归档到 `memory-archive/`
4. **不编造信息**：每个 Agent 的 prompt 只含它有理由知道的内容
5. **时间推进**：仅由 Director 触发 · World 只执行更新
6. **carry-over**：必须是具体、可追踪的事实问题

---

## 资产目录

- `references/brainstorm-sop.md` · `character-spec.md` · `canon-rules.md`
- `scripts/` · 18 个工具脚本
- `templates/` · 初始化样板（SOUL v4.0 四级 / character-pack / story-seed / presets / state / memory / rules）

---

## 与其他 Skill 的关系

- **drama-director**：Director workflow 通过"能力名"引用 Domain B 脚本
- **drama-critic**：Critic 脚本独立 · 与 World 无直接依赖
- **用户**：Domain A 和 Domain C 由用户自然语言直接触发
