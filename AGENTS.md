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

### 系统 Agent / Skills（三角架构）

| Skill | 角色 | 说明 |
|-------|------|------|
| **drama-world** | 世界引擎 | 筹备入口 + 头脑风暴 + 角色创建/管理 + 初始化 + 校验 + 世界状态维护 + 快照/回滚 |
| **drama-director** | 导演 Owner | 剧集生成唯一控制者 + Workflow 编排 + 多 Agent Team 核心模式 + 内容编译 |
| **drama-critic** | 独立评审 | GAN Evaluator + 人格一致性评估 + AI 味检测 + 质量门控 |

触发词分割（不重叠）：
- **drama-world**：头脑风暴/新故事/创建角色/初始化/选角/校验/状态/回滚/快照/分级/丰富角色/批量导入
- **drama-director**：续写/继续/生成下一集/模拟/跑一集/推进剧情/写新一集
- **drama-critic**：评审/评估/打分/检查表演/查AI味/检查文风

---

### Team Agent 编排

```
用户说"续写" → drama-director 加载
  → Phase 1: 校验 + 快照 + 选角 + beat-sheet
  → Phase 2: team_create → spawn world-manager + agents → 自由交互 → team_delete
  → Phase 3: 编译 novel.md + check-ai-taste 门控
  → Phase 4: spawn 独立 drama-critic Task Agent → critic-report.md
  → Phase 5: MEMORY 有界写入 + state/timeline 更新 + session 收尾
```
