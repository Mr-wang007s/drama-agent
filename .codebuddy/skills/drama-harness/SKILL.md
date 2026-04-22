---
name: drama-harness
description: |
  DramaAgent 工程层——保证模拟世界的可控性、可靠性、可组合性、持久性、可观测性。
  支持故事初始化、角色创建、分级管理、roster 同步、从设计文档一键搭建。
  当用户说"初始化故事"、"创建角色"、"新故事"、"丰富角色"、"批量导入角色"、"扩展角色群"、
  "加载所有 agent"、"把所有角色建档"、"按分级创建角色"、
  "回滚"、"快照"、"查看状态"、"更新索引"、"从设计文档建项目"、"升级角色分级"、
  "按分级加前缀"、"重命名角色目录" 时触发。
  在生成新一集时，harness 负责 init（创建目录+快照）和 wrap（更新记忆+carry-over+状态）。
globs:
  - "stories/**"
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
| `story-init.js` | 故事级初始化：从种子文件创建 world/ + agents/ | `drama init` |
| `init-from-design.js` | **[v6]** 从设计文档 Markdown 一键生成故事骨架 | `drama init-from-design` |
| `character-init.js` | 角色创建：从简介/原型/文本生成 SOUL v4.0 | `drama create-character` |
| `import-characters.js` | **[v6]** 批量导入：pack.yaml → S/A/B/C 四级角色 | `drama import-characters` |
| `retier.js` | **[v6]** 分级管理：批量加前缀 / 单角色升降级 | `drama retier` |
| `sync-roster.js` | **[v6]** 扫描 agents/ 自动同步 state + 重建索引 | `drama sync-roster` |
| `validate-character.js` | 角色校验器：人格漂移/创伤绕过/秘密泄露检测 | `drama validate` |
| `init.js` | 模拟初始化：创建 episode 目录 + 快照 + 设状态 | `drama sim` |
| `wrap.js` | 模拟收尾：更新记忆 + 提取 carry-over + 报告 | `drama sim`（自动） |
| `snapshot.js` | 快照创建/列出/回滚 | `drama roll` |
| `status.js` | 世界 + Agent + 记忆状态查询 | `drama status` |
| `validate.js` | SOUL.yaml 校验 + MEMORY 容量检查 | `drama sim`（前置） |
| `memory.js` | 记忆工具：add/replace/remove + 归档 | `drama recall` |

---

## 核心工程约束

### 分级体系（v6 强制）

所有 agent 目录**必须**以 `<tier>_` 开头：

| 级别 | 推荐数量 | 目录形式 | 字段要求 | 模板 |
|------|---------|---------|---------|------|
| **S 级** | 5-8 | `s_<id>/` | 完整 v4.0 + arc + ≥2 关系 + 3 examples | `templates/soul-s.yaml` |
| **A 级** | 10-15 | `a_<id>/` | 完整 v4.0（略简）+ 2 examples | `templates/soul-a.yaml` |
| **B 级** | 20-30 | `b_<id>/` | 核心 OCEAN + trauma(ghost/wound) + want/fear | `templates/soul-b.yaml` |
| **C 级** | 30-50 | 合并在 `C-CLASS-INDEX.yaml` | id + name + tag + one_liner + quirk | `templates/c-class-index.yaml` |

长篇小说（150-200 万字）推荐总数 **65-100 人**。

**MEMORY 容量按 tier 上限**：S=2000 / A=1200 / B=600 字符。

---

## 故事初始化 — 两种入口

### A. 从种子文件/预设初始化 (`story-init.js`)

```bash
# 从预设初始化
npm run drama -- init --name my-story --preset mystery

# 从种子文件初始化
npm run drama -- init --name my-story --from my-story-seed.yaml
```

### B. 从设计文档初始化 (`init-from-design.js`) — **推荐**

当用户已有设计文档（通常由 `drama-brainstorm` 产出）：

```bash
npm run drama -- init-from-design --name my-story --from docs/my-story-design.md
```

自动从 markdown 提取：
- 标题（第一个 `#`）
- 世界观章节 → `world/bible.md`
- 时间线章节 → `world/timeline.md`
- 势力清单（粗略） → `world/state.json.factions`

产出：
```
stories/<name>/
├── .story.json
├── world/ (bible.md + state.json + timeline.md)
├── agents/C-CLASS-INDEX.yaml  ← 占位
├── agents/README.md           ← 提示下一步
└── episodes/                  ← 空
```

**下一步**：用 `import-characters` 填充角色。

---

## 角色体系 — 三种粒度

### 1. 单个角色深度创建 (`character-init.js`)

```bash
# 交互式（回答 5 问）
npm run drama -- create-character --story my-story --interactive

# 从简介生成
npm run drama -- create-character --story my-story --from-brief "角色简介..."

# 从原型启发
npm run drama -- create-character --story my-story --archetype 反英雄 --genre mystery
```

**适用**：为主角/关键反派精心雕琢一个 S 级角色。

### 2. 批量导入 (`import-characters.js`) — **v6 新增**

```bash
# Dry-run 预览
npm run drama -- import-characters --story my-story --from pack.yaml --dry-run

# 实际导入
npm run drama -- import-characters --story my-story --from pack.yaml
```

**pack.yaml 格式**（参考 `templates/character-pack.yaml`）：

```yaml
S:
  - id: lin-mo
    name: 林墨
    archetype: 落难觉醒者
    role: 主角
    ocean: [70, 60, 45, 50, 65]
    trauma:
      ghost: 被误诊关进精神病院三年
      wound: 对被相信有饥渴
      lie: 只有无可辩驳的证据才能保护我
      shield: 用极度理性包裹自己
    motivation: { want: ..., need: ..., fear: ..., secret: ... }
    voice: { tone: ..., quirks: [...], vocabulary: ... }
    # ... stress_response / examples / relationships / arc
A:
  - id: shen-qingyuan
    # ... 略简字段
B:
  - id: liu-sanbian
    # ... 核心字段
C:
  - id: example-npc
    name: 老护工
    tag: [场景, 路人]
    quirk: 说话总带"哎哟"
```

**自动行为**：
- S/A/B 级 → 创建 `<tier>_<id>/` 目录 + SOUL.yaml + MEMORY.md
- C 级 → 追加到 `C-CLASS-INDEX.yaml`
- 目录命名**自动加前缀**（不需要在 pack 里写）
- id 冲突/同名则跳过并警告
- 导入后**应自动调用 `sync-roster`** 更新索引

**适用**：新故事初始化后的批量建档、已有故事的群像扩展。

### 3. 自然对话中"丰富角色"

当用户说"丰富角色"、"扩展角色群"、"加载所有 agent"时：

1. 读取 `world/bible.md` + 已有 agent 目录
2. 生成角色设计（包含全部 S/A/B/C 建议名单）→ 写入 `docs/<story>-characters.md`
3. 生成对应 `character-pack.yaml`
4. 调用 `import-characters` 落地
5. 调用 `sync-roster` 更新索引

**字段不齐时的推导规则**：

**OCEAN 基于原型**（再 ±10 微调避免模板化）：

| 原型 | O | C | E | A | N |
|------|---|---|---|---|---|
| 冷静理性主角 | 70 | 75 | 40 | 45 | 50 |
| 热血主角 | 70 | 50 | 70 | 65 | 50 |
| 复仇者 | 50 | 70 | 35 | 25 | 65 |
| 智者导师 | 80 | 80 | 50 | 65 | 40 |
| 冷峻反派 | 75 | 85 | 40 | 20 | 45 |
| 疯癫反派 | 85 | 30 | 70 | 15 | 80 |
| 忠诚配角 | 50 | 70 | 55 | 75 | 50 |
| 技术宅 | 80 | 65 | 30 | 50 | 55 |

**创伤链自洽**：Ghost(事件) → Wound(痛苦) → Lie(认知) → Shield(行为)，四要素必须形成逻辑链。

**Voice 推导**：
- 科学家/学者 → 精准 + [敲桌/推眼镜/"理论上"]
- 武士/忍者 → 简短 + [刀柄手势/凝视/单字回应]
- 少年主角 → 热情 + [感叹号密集/大话/挠头]

---

## 分级管理 (`retier.js`) — v6 新增

### A. 给所有目录加分级前缀（一次性）

当从老版本迁移（目录还没有 `s_/a_/b_` 前缀）：

```bash
# 根据每个 SOUL.yaml 的 tier 字段自动加前缀
npm run drama -- retier --story my-story --apply-prefix --dry-run  # 先预览
npm run drama -- retier --story my-story --apply-prefix            # 实际执行
```

安全特性：
- **长 id 优先匹配**：避免 `lin-mo` 破坏 `lin-mo-mother` 的引用
- **词边界正则**：`(^|[^\w-])...(?![\w-])` 确保精确
- **全引用扫描**：SOUL relationships、state.json、CHARACTER-INDEX、所有 episode 文本

### B. 单个角色升降级

当某个配角戏份变多，需要从 B 级升到 A 级：

```bash
npm run drama -- retier --story my-story --id xiao-zhao --from b --to a
```

自动：
1. 重命名目录 `b_xiao-zhao/` → `a_xiao-zhao/`
2. 更新所有引用（SOUL 内部 id、关系、state 等）
3. 提示用户补充 A 级要求的额外字段（examples、stress_response 等）

**降级同理**：`--from a --to b`

---

## Roster 同步 (`sync-roster.js`) — v6 新增

保持 agents/ 目录与 state.json / CHARACTER-INDEX.md 的一致性。

```bash
# 基础同步
npm run drama -- sync-roster --story my-story

# 额外做出场使用度分析
npm run drama -- sync-roster --story my-story --check-usage
```

**自动行为**：
- 扫描所有 `agents/<tier>_*/` 目录
- 读取每个 SOUL.yaml 的 `tier` 字段
- 更新 `world/state.json.agent_roster` = `{ S: [...], A_count, B_count, C_count }`
- 重建 `agents/CHARACTER-INDEX.md`（按分级分组展示）

**使用度分析** (`--check-usage`)：
- 扫描所有 `episodes/**/output/novel.md` + `screenplay.md`
- 按角色名统计出场次数
- 给出建议：
  - B 级出场 > 30 次 → 建议升级为 A
  - S/A 级出场 = 0 → 建议降级或删除

**调用时机**：
- 每次 `import-characters` 后自动调用
- 每次 `retier` 后自动调用
- wrap 阶段可选择性调用

---

## Canon 保护范围

以下文件受到写保护，Agent 不可修改：

- `world/bible.md`
- `agents/*/SOUL.yaml`（核心字段：id/name/tier/archetype/trauma/motivation）

以下字段可由 Harness 在 wrap 时更新：

- `agents/*/SOUL.yaml` 的 `emotion.current`、`known_facts`、`relationships[].trust`
- `agents/*/MEMORY.md`（有界写入，按 tier 容量上限）
- `world/state.json`（全局状态）
- `world/timeline.md`（事件追加）

---

## 对话调用示例

### 场景 A：用户"初始化新故事并加载所有角色"

流程：
1. 确认是否有设计文档。有 → 调用 `init-from-design`；无 → 先引导到 `drama-brainstorm`
2. 解析设计文档中的角色体系
3. 生成 `character-pack.yaml`（所有 S/A/B/C）
4. 调用 `import-characters`
5. 调用 `sync-roster`
6. 报告结果

### 场景 B：用户"批量加前缀"

流程：
1. 检查是否需要前缀（扫描现有目录）
2. 需要 → `retier --apply-prefix --dry-run` 预览
3. 用户确认 → 实际执行
4. 调用 `sync-roster` 更新索引

### 场景 C：用户"某个角色需要升级"

流程：
1. 确认升降级方向
2. `retier --id <id> --from <old> --to <new>`
3. 读取新级别模板要求的额外字段
4. 补齐字段后交给用户审查
5. `sync-roster` 同步

### 与其他 Skill 的集成

- **drama-brainstorm** 产出 → **drama-harness** 落地（init-from-design + import-characters）
- **drama-world** 调用 `lib.js` 中的工具函数
- **drama-screenplay / drama-novel** 在 wrap 阶段被调用
- **drama-director** 在 sim 期间作为世界管理者运行
- **drama-critic** 的 `check-ai-taste` 在 Phase 4 评审时被调用
