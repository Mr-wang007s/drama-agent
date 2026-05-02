### DramaAgent v6.1 — Agent 角色说明（三 Team 循环增强架构）

本项目的 Agent 分为两类：**居民 Agent**（有身份的角色）和**系统 Agent**（Skill 提供的能力）。

---

### 居民 Agent（stories/<name>/agents/ 目录）

每个故事子项目下的 `agents/` 目录包含该故事的所有角色。

每个居民 Agent 拥有独立身份，采用 **SOUL v4.0 三层结构 + 五字段扩展**：

```
┌─────────────────────────────────────────┐
│  Layer 3: 表演层 (Performance)          │
│  语言模式 + 情绪触发器 + 压力反应       │
│  + 3-5 个 few-shot 示例                 │
│  + unique_markers / body_signature      │
├─────────────────────────────────────────┤
│  Layer 2: 心理层 (Psychology)           │
│  OCEAN 数值 + Ghost-Wound-Lie-Shield    │
│  + Want vs Need 双轴动机                │
│  + breakdown_budget / silence_quota     │
├─────────────────────────────────────────┤
│  Layer 1: 身份层 (Identity)             │
│  id + name + archetype + role           │
│  + blacklist_cross                      │
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

**v6.1 五字段扩展**（可选，S/A 级推荐填写）：

| 字段 | 说明 |
|------|------|
| `unique_markers` | 角色语言指纹标记（≥3 个），用于 Jaccard 检测 |
| `blacklist_cross` | 独有称呼保护列表，其他角色绝对不能使用 |
| `body_signature` | 专属身体动作（≥2 个），替代心理描写的外化标记 |
| `breakdown_budget` | 每季破防戏额度（防过度消耗） |
| `silence_quota` | 每场景最低沉默段落数 |

---

### 分级约定

| Tier | 目录前缀 | MEMORY 上限 | 适用场景 |
|------|---------|----------:|---------|
| S | `s_` | 2000 字符 | 主角 + 核心配角（全局视角） |
| A | `a_` | 1200 字符 | 重要配角（单卷弧线） |
| B | `b_` | 600 字符 | 次要角色（场景级出场） |
| C | 合并至 `C-CLASS-INDEX.yaml` | — | 路人/功能性 NPC |

---

### 创建角色的 5 个核心问题

1. **Want** — 这个角色最想要什么？
2. **Fear** — 这个角色最害怕什么？
3. **Secret** — 这个角色有什么不可告人的秘密？
4. **Ghost** — 童年/过去发生过什么创伤事件？
5. **Lie** — 因此 TA 相信了什么错误的道理？

---

### 系统 Agent / Skills（四角架构）

| Skill | 角色 | 说明 |
|-------|------|------|
| **drama-world** | 世界引擎 | 筹备入口 + 头脑风暴 + 角色创建/管理 + 初始化 + 校验 + 世界状态维护 + 快照/回滚 |
| **drama-director** | 导演 Owner | 三 Team 循环增强唯一控制者 + Workflow 编排 + 多 Agent Team + 内容编译 |
| **drama-critic** | 独立评审 | GAN Evaluator + 6 维度人格评审（含读者吸引力 25%）+ AI 味门控 |
| **writing-coach** | 内部辅助 | Phase 1.5 预检（8 问 + 6 条打回判定），仅由 Director 内部调用 |

触发词分割（不重叠）：
- **drama-world**：头脑风暴/新故事/创建角色/初始化/选角/校验/状态/回滚/快照/分级/丰富角色/批量导入
- **drama-director**：续写/继续/生成下一集/模拟/跑一集/推进剧情/写新一集
- **drama-critic**：评审/评估/打分/检查表演/查AI味/检查文风
- **writing-coach**：（无用户触发词，仅 Director 内部调用）

---

### 三 Team 循环增强编排

```
用户说"续写" → drama-director 加载
  → Phase 1:   规划（校验 + 快照 + 选角 + beat-sheet v2）
  → Phase 1.5: Writing-Coach 预检（8 问 + 6 条打回）
  → Phase 2:   强制 Team 演绎（独幕演 = 最小合法 Team: 1 Agent + world-manager）
  → Phase 3.0: 编译前清理（pre-compile-clean.js）
  → Phase 3.1: AI 味门控（check-ai-taste.js 含 C5.1-C5.10）
  → Phase 3.2: 辅助门控（dialogue-jaccard + imagery-ledger + hooks-ledger + breakdown-spec）
  → Phase 4:   Critic 评审（6 维度含读者吸引力 25%）
  → Phase 4.5: 读者 Team（4 画像并行打分，均分 <7.0 阻断）
  → Phase 4.6: 专家 Team（读者均分 <8.0 时触发 / 每 3 集强制触发 1 次）
  → Phase 4.7: Director 仲裁（读者 vs 专家报告冲突裁决）
  → Phase 4.8: 定向修订 Team（spawn 修订 Agent 按指令改写正文）
  → Phase 4.9: 回评（返回 3.1 重跑 → 读者复查，≤2 轮迭代）
  → Phase 5:   收尾（MEMORY 有界写入 + state + timeline + wrap-report）
  → Phase 6:   系列复盘（每 3 集触发，读者+专家联合长评 → pro-advisory-notes）
```

#### 三 Team 设计

| Team | 角色组成 | 触发条件 | 输出 |
|------|---------|---------|------|
| 演绎 Team | world-manager + N 角色 Agent | 每集必跑（Phase 2） | runtime 交互记录 |
| 读者 Team | 张哥/小悦/林小姐/老周（4 画像） | 每集必跑（Phase 4.5） | reader-panel-report.md |
| 专家 Team | 老陈/Q老师/许教授/K教练（4 顾问） | 读者均分<8.0 或每 3 集强制 | expert-panel-report.md |

#### 仲裁优先级

- 读者共识（≥3 人一致）> 专家共识（≥3 人一致）> 单人极端意见
- 迭代上限 2 轮，第 3 轮 Director 强行裁决并记录理由
