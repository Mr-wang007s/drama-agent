### DramaAgent v7.0 — Agent 角色说明（豪华 8 人班子架构）

本项目的 Agent 分为两类：**居民 Agent**（有身份的角色，stories/ 下）和**班子 Agent**（Skill 提供的创作角色，每集按需 spawn）。

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
| `unique_markers` | 角色语言指纹标记（≥3 个），用于责编定性 Jaccard 判断 |
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

### 三角 Skill 架构

| Skill | 角色 | 说明 |
|-------|------|------|
| **drama-world** | 世界引擎 | 筹备入口 + 头脑风暴 + 角色创建/管理 + 初始化 + 校验 + 世界状态维护 + 快照/回滚 |
| **drama-director** | 导演 Owner | 6 阶段流水线唯一控制者 + 8 人班子编排 + 内容编译 |
| **drama-critic** | AI 味机械门控 | 仅运行 `check-ai-taste.js`，其他评审职责已移交责编 |

触发词分割（不重叠）：
- **drama-world**：头脑风暴/新故事/创建角色/初始化/选角/校验/状态/回滚/快照/分级/丰富角色/批量导入
- **drama-director**：续写/继续/生成下一集/模拟/跑一集/推进剧情/写新一集
- **drama-critic**：查 AI 味/检查文风

---

### 豪华 8 人班子 Agent（drama-director 每集按需 spawn）

| 班子 Agent | 类型 | 出场 Phase | 加载的 craft 文件 | 核心职责 |
|---|---|---|---|---|
| **导演**（主 Agent） | 主 | 全程 | workflow + roster | 选角、定基调、仲裁 |
| **编剧** | Task Agent | Phase 2 | conflict + scene-design + mystery | 写 beat-sheet v3（含 8 问自检） |
| **悬疑顾问** | Task Agent | Phase 2, 4 | mystery | 三铁律 + 钩子经济 + 线索三明治 |
| **表演指导** | Task Agent | Phase 3 | characterology + dialogue | 9 问激活角色 + 监控演绎质量 |
| **世界管家** | Task Agent | Phase 3 | team-protocol | 事件注入 + 信息裁判 + 场景节奏 |
| **责编** | Task Agent | Phase 4 | editing + prose + dialogue | 7 步 SOP 内审（吸收原 9 评审） |
| **文学顾问** | Task Agent | Phase 4（按需） | prose | 反 Over-Connect + 节奏润色 |
| **读者代表** | Task Agent | Phase 5 | **不加载 craft** | 终审"会不会追下一集" |

**按需加载原则**：每个班子成员只加载自己领域的 craft/ 文件，不全量加载。
**读者代表特例**：不加载任何 craft，保持纯直觉，防止异化为第二个责编。

详细定义见 `drama-director/references/team-roster.md`。

---

### 6 阶段创作流水线

```
用户说"续写" → drama-director 加载
  → Phase 1: 导演独立选角定调（读 context + 选角 + 基调 + 快照）
  → Phase 2: 创作班子开盘（编剧 + 悬疑顾问协作写 beat-sheet v3）
  → Phase 3: 大 Team 演绎（表演指导 + 世界管家 + 所有角色 Agent）
  → Phase 4: 责编内审 + 文学顾问润色（7 步 SOP，迭代 ≤ 2 轮）
  → Phase 5: AI 味门控 + 读者代表终审（check-ai-taste EXIT=0 + 读者 ≥ 7.0）
  → Phase 6: Wrap 收尾（调用 drama-world 能力 + 更新 hooks/imagery ledgers）
```

详细定义见 `drama-director/references/workflow.md`。

---

### 责编吸收原 9 评审的原理

旧架构：4 读者 + 4 专家 + 1 Critic = 9 个评审 Agent（每集 ~27K token）
新架构：1 责编 + 1 读者代表 + Critic 脚本门控（每集 ~7K token，节省 74%）

责编在 `craft/editing.md` 的"多元思考训练"下，一人模拟 5 种视角：

| 视角 | 对应的原 Agent |
|---|---|
| 网文读者（节奏党） | 原 4 读者之张哥 |
| 文学编辑（质感派） | 原 4 读者之林小姐 |
| 出版编辑（商业） | 原 4 读者之老周 |
| 资深剧作家（结构） | 原 4 专家之老陈 |
| 写作教练（角色对话） | 原 4 专家之 K 教练 |

**四专家的方法论**已全部迁入 `craft/` 下对应文件（conflict / mystery / prose / dialogue），成为责编和班子成员的"活知识"而非"TODO 清单"。

---

### 单集六件套（每集必需产出）

```
stories/<name>/episodes/<ep-id>/
├── episode-brief.md          # Phase 1 导演产出
├── beat-sheet.md             # Phase 2 编剧产出（含 8 问自检）
├── output/
│   ├── novel.md              # Phase 3-5 正文
│   ├── editor-review.md      # Phase 4 责编产出
│   └── reader-verdict.md     # Phase 5 读者代表产出
└── wrap-report.md            # Phase 6 导演收尾
```

可选运行态产出：
- `runtime/interactions.jsonl` — Phase 3 Agent 交互记录
- `runtime/mystery-advisor-notes.md` — 悬疑类故事 Phase 2 顾问意见
- `runtime/revision-log.md` — Phase 4 多轮修订时的 diff 记录

---

### 与旧架构的主要变化

| 维度 | 旧架构（v6.1） | 新架构（v7.0） |
|---|---|---|
| Skill 数 | 4（含 writing-coach） | 3（writing-coach 废弃） |
| Phase 数 | 10（含 1.5、4.5-4.9） | 6（线性） |
| 评审 Agent 数 | 9 | 2 + 1 脚本 |
| 班子 Agent 数 | 1-2 | 7（Phase 3 峰值） |
| Token/集 | ~62K | ~41K（-34%） |
| 创作占比 | 24% | 67% |
| 写作知识 | 散落在 rules | 沉淀在 `craft/` 7 文件 |
| 台账维护 | 脚本自动 | 班子手工 |
