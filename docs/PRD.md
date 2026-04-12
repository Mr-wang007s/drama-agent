# DramaAgent — 产品需求文档（PRD）

> **版本**：v4.0  
> **日期**：2026-04-11  
> **分支**：`feat/multi-agent`  
> **状态**：引擎通用化 + 影帝级角色系统  
> **仓库**：`D:\codespace\drama-agent`

---

## 变更记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-04-11 | 初版 PRD，DramaSpec + Harness + Multi-Agent 三层公式 |
| v2.0 | 2026-04-11 | 架构简化为 Harness + Multi-Agent；砍掉 DramaSpec 重型规格流程 |
| v3.0 | 2026-04-11 | 根本性重定义：从"剧本生产工具"转型为"AI Agent 身份模拟平台"；引入 Agent Identity System + World Engine + Skill Content Library + Harness Engineering 四层架构 |
| **v4.0** | **2026-04-11** | **引擎通用化**：master 分支 = 纯引擎，故事在分支上生成；**影帝级角色系统**：SOUL v4.0 三层结构（身份层 → 心理层 → 表演层）、OCEAN 人格模型、Ghost-Wound-Lie-Shield 创伤链、内心独白机制、角色校验器；新增 `drama init` 和 `drama create-character` 命令 |

---

## 1. 产品概述

### 1.1 一句话定义

DramaAgent 是一个 **AI Agent 身份模拟平台**——给 Agent 赋予身份、记忆、人格，让它们在共享世界中自由交互演绎，像 AI 小镇的居民一样自主行动。

### 1.2 产品愿景

**Agent 不是工具，是角色。** 每个 Agent 拥有独立身份（SOUL）、持久记忆（MEMORY）、行为红线（RULES），在世界观约束下自由交互。Skill 定义输出格式（剧本、小说、互动叙事），Harness 保证一切可控、可靠、可观测。

### 1.3 核心公式（v3.0）

```
DramaAgent = Agent Identity + World Engine + Skill Library + Harness Engineering
```

v2.0 → v3.0 的关键变化：

| 维度 | v2.0 | v3.0 |
|------|------|------|
| Agent 定位 | 剧组角色（导演/角色/旁白/质量官） | **有身份的居民**（SOUL + MEMORY + RULES） |
| 交互模式 | 固定流水线（导演→角色→旁白→质量） | **自由交互**（Agent 之间 send_message 即兴对话） |
| 内容输出 | 只能输出剧本 | **可插拔 Skill**（剧本/小说/互动叙事/...） |
| 记忆 | 无持久记忆，每集从零开始 | **有界持久记忆**（跨集累积，参考 Hermes/OpenClaw） |
| 世界管理 | series-state.json 只记 carry-over | **世界引擎**（时间线 + 全局事件 + Agent 关系图） |
| 工程层 | 单体 CLI + src/ | **Skill 体系**（所有能力 = Skill，无 src/） |

### 1.4 设计哲学

参考三个系统的核心理念：

| 参考系统 | 借鉴点 |
|----------|--------|
| **斯坦福 AI 小镇** | Agent 行为由身份驱动，不是脚本驱动；记忆流 + 反思 + 计划 |
| **Hermes Agent** | 有界持久记忆（MEMORY.md ~2000字符）；自主技能创建；闭环学习 |
| **OpenClaw** | 五文件体系（SOUL/MEMORY/AGENTS/TOOLS/HEARTBEAT）；纯事实记忆原则 |
| **Anthropic Harness** | Generator vs Evaluator 分离；结构化上下文移交；反馈循环驱动 |
| **Multi-Agent Harness 四层** | 知识供给 / 执行编排 / 风险门控 / 治理运营 解耦 |

---

## 2. 背景与动机

### 2.1 v2.0 的问题

v2.0 验证了 Multi-Agent 协作的可行性，但暴露了两个根本局限：

> **Agent 没有身份，只有工位。**

1. **固定流水线思维**：导演→角色→旁白→质量，是工厂流水线，不是真正的自主交互
2. **无记忆、无成长**：每一集 Agent 从零开始，上一集的经历不影响这一集的行为
3. **内容形式单一**：只能输出剧本格式，无法产出小说、互动叙事等其他形式
4. **代码与能力耦合**：所有逻辑在 `src/cli.js`（824行），通用性差，无法被 Skill 体系消费

### 2.2 v3.0 的核心洞察

**让 Agent 成为角色，而不是扮演角色。**

- **身份驱动行为**：Agent 的每一个行动由其 SOUL（欲望/恐惧/秘密）和 MEMORY（经历过什么）共同决定
- **记忆塑造人格**：经历过的事件会改变 Agent 的信任度、情绪状态、已知信息
- **世界约束自由**：世界引擎提供时间、空间、事件约束，但不规定 Agent 的具体行为
- **Skill 决定表现**：同一次模拟，装备剧本 Skill 输出剧本，装备小说 Skill 输出小说

### 2.3 技术选型（v3.0）

| ADR | v2.0 决策 | v3.0 变更 | 理由 |
|-----|----------|----------|------|
| ADR-001 | 导演/角色/叙事三层 | **Agent Identity System** | 从角色职能转为身份系统 |
| ADR-002 | src/cli.js 单体 | **纯 Skill 体系** | 砍掉 src/，所有能力 = Skill（SKILL.md + scripts/ + references/） |
| ADR-003 | 无持久记忆 | **有界持久记忆** | 参考 Hermes MEMORY.md，~2000 字符上限，跨集持久 |
| ADR-004 | series-state.json | **World Engine** | 升级为完整世界状态（时间线 + 事件 + 关系图） |
| ADR-005 | 只输出剧本 | **可插拔 Content Skill** | Skill 定义输出格式，不绑死剧本 |
| ADR-006 | 固定四步流水线 | **自由交互 + Harness 门控** | Agent 自主对话，Harness 保证可控 |

---

## 3. 架构设计（v3.0）

### 3.1 四层架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    Harness Engineering                           │
│          可控性 · 可靠性 · 可组合性 · 持久性 · 可观测性           │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Canon    │  │ 快照     │  │ 门控     │  │ 事件日志     │   │
│  │ 保护     │  │ 回滚     │  │ 层       │  │ + Trace      │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                     World Engine                                │
│              世界观 · 时间线 · 全局事件 · 场景构建                │
│                                                                 │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────────┐    │
│  │ world/       │  │ 场景上下文   │  │ carry-over         │    │
│  │ bible.md     │  │ 组装器      │  │ 管理               │    │
│  │ state.json   │  │             │  │                    │    │
│  │ timeline.md  │  │             │  │                    │    │
│  └──────────────┘  └─────────────┘  └────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                   Agent Identity Layer                           │
│              每个 Agent = SOUL + MEMORY + RULES                  │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐           │
│  │ agents/     │  │ agents/     │  │ agents/      │           │
│  │ lin-qi/     │  │ su-yao/     │  │ gao-ming/    │           │
│  │  SOUL.yaml  │  │  SOUL.yaml  │  │  SOUL.yaml   │           │
│  │  MEMORY.md  │  │  MEMORY.md  │  │  MEMORY.md   │           │
│  │  RULES.md   │  │  RULES.md   │  │  RULES.md    │           │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘           │
│         │                │                │                     │
│         └──── send_message 自由交互 ───────┘                    │
├─────────────────────────────────────────────────────────────────┤
│                   Skill Content Library                          │
│              可插拔内容输出（同一模拟可装备多种 Skill）            │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ screenplay   │  │ novel        │  │ interactive  │  ...     │
│  │ 剧本格式     │  │ 小说格式     │  │ 互动叙事     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Agent 身份系统

每个 Agent 是 `agents/<agent-id>/` 目录下的一组声明式文件：

| 文件 | 定位 | 参考 | 说明 |
|------|------|------|------|
| **SOUL.yaml** | 我是谁 | OpenClaw SOUL.md | 名字、原型、欲望、恐惧、秘密、说话风格、关系、情绪状态 |
| **MEMORY.md** | 我经历了什么 | Hermes MEMORY.md + OpenClaw MEMORY.md | 纯事实记忆，有界容量 ~2000 字符，按时间戳，跨集持久 |
| **RULES.md** | 我的行为边界 | OpenClaw AGENTS.md | 不可逾越的红线、身份一致性约束、交互规范 |

**SOUL.yaml 结构**（从现有 character YAML 超集扩展）：

```yaml
# --- 身份核心（保留原字段） ---
id: lin-qi
name: 林七
archetype: 舞台监督 / 不可靠见证者
desire: 保护剧场不被关闭，同时查清旧火灾的真相
fear: 自己当年的沉默会被认定为共犯
secret: 她偷偷保存了一卷从火场带出的旧排练录像
voice: 冷静、短句、习惯先观察再开口
status: active

# --- 可变状态（每次模拟后可更新） ---
emotion_default: guarded
emotion_state: guarded        # 当前情绪，由世界引擎更新

# --- 关系（增加量化信任度） ---
relationships:
  - target: su-yao
    type: 旧搭档 / 互相试探
    trust: 0.3                # 信任度 0~1
    summary: 她信不过苏遥突然回归的真正目的

# --- v3.0 新增 ---
memory_capacity: 2000         # MEMORY.md 字符上限
interaction_style: observer-first  # 交互偏好
known_facts: []               # 已知事实索引（世界引擎维护）
```

**MEMORY.md 设计原则**（参考 OpenClaw + Hermes）：

| 规则 | 说明 |
|------|------|
| **只记事实** | "EP02 高鸣知道了我有录像带"，不记规则（规则在 RULES.md） |
| **有界容量** | ~2000 字符上限，满载时合并旧条目 |
| **时间戳** | 每条记录必须带 Episode 标记 |
| **分区结构** | 关键事件 / 关系变化 / 未解之谜 |
| **淘汰归档** | 被淘汰的记忆移入 `memory-archive/{episode}.md`，可搜索但不自动加载 |

### 3.3 世界引擎（World Engine）

维护共享世界状态，不规定 Agent 行为，只提供约束和上下文：

```
world/
├── bible.md          # 世界观（从 series-bible.md 升级）
│                     # 题材、核心设定、长线问题、叙事准则
├── state.json        # 世界状态（从 series-state.json 升级）
│                     # 当前 episode、carry-overs、Agent 关系图、
│                     # 已发生的全局事件、地点状态
└── timeline.md       # 事件时间线（世界引擎自动维护）
                      # 跨集累积的所有关键事件记录
```

**世界引擎职责**：

| 职责 | 说明 |
|------|------|
| **上下文组装** | 为每个 Agent 组装 prompt：SOUL + MEMORY + 世界状态 + 当前场景 |
| **场景构建** | 根据世界状态和 carry-over 生成场景提示（目标/冲突/约束） |
| **时间推进** | 在模拟中通过 send_message 推进时间、注入外部事件 |
| **状态更新** | 模拟结束后从交互记录中提取事件，更新 state.json + timeline.md |
| **carry-over** | 提取未解悬念，传递给下一集 |

### 3.4 Skill 内容库（可插拔）

Skill 定义的是**内容输出格式**，不是角色职能：

| Skill | 输出 | 说明 |
|-------|------|------|
| **drama-screenplay** | `output/screenplay.md` | 从交互记录提取对话和行动，编排为剧本格式 |
| **drama-novel** | `output/novel.md` | 从交互记录改写为第三人称叙事文本 |
| **drama-interactive** | `output/interactive.json` | 从交互记录提取分支选择和后果 |

同一次模拟可以装备多个 Skill，产出多种格式。新 Skill 可由用户自定义或社区贡献。

### 3.5 Harness Engineering（五大保证）

| 保证 | 实现 |
|------|------|
| **可控性** | Canon 保护（SOUL.yaml + bible.md 写保护）；Agent 行为门控（RULES.md 执行）；OOC 检测 |
| **可靠性** | 世界状态快照 + 回滚；错误恢复；状态持久化 |
| **可组合性** | Agent 动态加入/退出模拟；Skill 热插拔；世界可扩展 |
| **持久性** | Agent MEMORY.md 跨集持久化；经验沉淀；世界时间线累积 |
| **可观测性** | 全链路事件日志（tool-events.jsonl）；Agent 交互 trace；session-report.md；记忆变更审计 |

### 3.6 一次模拟的完整流程

```
用户: drama:sim ep04 --title "暗流" --agents lin-qi,su-yao,gao-ming --skill screenplay

  │
  ▼
┌─────────────────────────────────────────────────────┐
│ 1. Harness 初始化                                    │
│    drama-harness/scripts/init.js                     │
│    - 创建 episodes/ep04/ 目录                       │
│    - 快照当前世界状态 + Agent 记忆                   │
│    - 状态 → simulating                              │
└──────────────────┬──────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────┐
│ 2. 世界引擎组装上下文                                │
│    drama-world/scripts/build-context.js              │
│    - 读取 world/bible.md + world/state.json          │
│    - 读取每个 Agent 的 SOUL.yaml + MEMORY.md         │
│    - 读取 carry-overs（跨集悬念）                    │
│    - 输出: 每个 Agent 的完整 prompt context           │
└──────────────────┬──────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────┐
│ 3. Agent 自由交互                                    │
│    team_create("drama-ep04")                         │
│    spawn lin-qi (SOUL + MEMORY + 场景上下文)         │
│    spawn su-yao                                      │
│    spawn gao-ming                                    │
│    spawn world-manager (导演视角，推进时间/注入事件)  │
│                                                     │
│    Agent 之间 send_message 自由对话                  │
│    世界管理者通过 send_message 施压/推进/介入         │
│    ⚠️ 不是固定步骤——Agent 自主决定说什么、做什么      │
└──────────────────┬──────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────┐
│ 4. 内容 Skill 整合                                   │
│    drama-screenplay/scripts/compile.js               │
│    - 从交互记录提取对话和行动                        │
│    - 按剧本格式编排                                  │
│    - 输出 episodes/ep04/output/screenplay.md         │
└──────────────────┬──────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────┐
│ 5. Harness 收尾                                      │
│    drama-harness/scripts/wrap.js                     │
│    - 更新每个 Agent 的 MEMORY.md（有界写入）         │
│    - 提取 carry-over → world/state.json              │
│    - 更新 world/timeline.md（追加本集事件）          │
│    - 生成 episodes/ep04/session-report.md            │
│    - 状态 → wrapped                                  │
│    - 删除 team                                       │
└─────────────────────────────────────────────────────┘
```

---

## 4. Agent 交互设计

### 4.1 身份驱动 vs 脚本驱动

| 维度 | v2.0 脚本驱动 | v3.0 身份驱动 |
|------|-------------|-------------|
| 行为来源 | 导演给指令，角色执行 | Agent 根据 SOUL + MEMORY 自主决定 |
| 对话发起 | 导演规定"谁先说" | Agent 自己判断"我现在该不该说" |
| 信息管控 | 导演控制"什么时候揭示" | Agent 的 known_facts 决定"我知道什么" |
| 冲突产生 | 导演设定"谁和谁冲突" | desire + fear + relationships 自然碰撞 |

### 4.2 Agent Prompt 结构

每个 Agent 被 spawn 时收到的 prompt 由四部分构成：

```
1. 身份（来自 SOUL.yaml）
   你是林七。你的核心欲望是保护剧场不被关闭……
   你最恐惧的是……你的秘密是……
   你说话的风格是……

2. 记忆（来自 MEMORY.md）
   你记得的事情：
   - EP02 高鸣知道了你有录像带
   - EP03 苏遥看到监控画面时反应异常
   你还不知道：谁入侵了投影系统

3. 当前处境（来自世界引擎）
   现在是 EP04 开场。剧场后台。
   高鸣没有出现——他收到匿名消息后离开了。
   苏遥正在检查投影设备。你独自站在幕布后面。

4. 行为约束（来自 RULES.md）
   - 不要主动揭示你的秘密，除非被逼到绝境
   - 不要跳出角色，始终用第一人称
   - 你的回复格式：【行动描述】+ "对话内容" + *内心独白*
```

### 4.3 世界管理者（替代 v2.0 的"导演"）

世界管理者不是流水线第一步，而是模拟中**持续存在的压力源**：

| 手段 | 说明 |
|------|------|
| **时间推进** | "一小时后——" 跳转时间，改变场景 |
| **事件注入** | "有人在后门放了一个信封" → Agent 自主决定如何反应 |
| **压力施加** | "远处传来消防车的警笛" → 增加紧迫感 |
| **信息释放** | 让某个 Agent 收到新线索（通过 send_message 定向发送） |
| **场景判断** | 判断当前场景是否达成目标，决定是否推进到下一个场景 |

世界管理者**不**做的事：
- 不替 Agent 说话
- 不规定 Agent 的具体行动
- 不强制对话顺序

### 4.4 通信协议

Agent 之间和世界管理者使用 `send_message` 通信：

| 消息类型 | 发送方 | 接收方 | 内容 |
|----------|--------|--------|------|
| `scene_context` | world-manager | broadcast | 场景初始上下文 |
| `event` | world-manager | 指定 Agent | 外部事件注入 |
| `time_skip` | world-manager | broadcast | 时间推进通知 |
| `dialogue` | Agent A | Agent B / broadcast | 角色间自由对话 |
| `action` | Agent | broadcast | 角色行动描述 |
| `scene_end` | world-manager | broadcast | 场景结束信号 |

---

## 5. 记忆系统设计

### 5.1 三层记忆模型

```
┌────────────────────────────────────────┐
│ Layer 1: Active Memory (MEMORY.md)     │
│ 容量: ~2000 字符                       │
│ 加载: 每次模拟自动注入 prompt          │
│ 更新: 模拟结束后由 Harness 写入        │
│ 内容: 最近/最重要的事实                │
├────────────────────────────────────────┤
│ Layer 2: Archive (memory-archive/)     │
│ 容量: 无限                             │
│ 加载: 按需搜索，不自动注入             │
│ 内容: 从 Active Memory 淘汰的旧记忆    │
├────────────────────────────────────────┤
│ Layer 3: World Timeline (timeline.md)  │
│ 容量: 无限                             │
│ 加载: 世界引擎按需摘要注入             │
│ 内容: 全局事件视角的客观记录           │
└────────────────────────────────────────┘
```

### 5.2 记忆写入规则

| 规则 | 说明 | 参考 |
|------|------|------|
| **只记事实** | "高鸣知道了我有录像带"，不记 "以后要小心高鸣" | OpenClaw |
| **必须带时间戳** | 每条记录标记 Episode ID | Hermes |
| **有界管理** | 超出 ~2000 字符时，合并/淘汰旧条目 | Hermes |
| **淘汰归档** | 被淘汰的记忆移入 `memory-archive/` | OpenClaw |
| **分区结构** | 关键事件 / 关系变化 / 未解之谜 | 自定义 |
| **Harness 写入** | Agent 不直接修改 MEMORY.md，由 Harness wrap 时统一写入 | 安全考虑 |

### 5.3 记忆查询

`drama:recall` 命令支持查询 Agent 记忆：

```bash
# 查看林七当前活跃记忆
drama-agent recall lin-qi

# 搜索林七所有记忆（含归档）中关于"录像带"的记录
drama-agent recall lin-qi --search "录像带"

# 查看全局时间线
drama-agent recall --timeline
```

---

## 6. Skill 体系设计

### 6.1 Skill 目录

| Skill | 类型 | 说明 |
|-------|------|------|
| **drama-harness** | 工程 | Harness 五大保证的实现：初始化/归档/快照/状态/校验/记忆管理 |
| **drama-world** | 引擎 | 世界引擎：上下文组装/世界更新/场景构建/交互协议 |
| **drama-director** | 管理 | 世界管理者视角：在模拟中施压/推进/注入事件（不是流水线步骤） |
| **drama-screenplay** | 内容 | 剧本格式输出：从交互记录编译为标准剧本 |
| **drama-novel** | 内容 | 小说格式输出：从交互记录改写为第三人称叙事 |

### 6.2 Skill 标准结构

每个 Skill 遵循 CodeBuddy Skill 标准：

```
skill-name/
├── SKILL.md              ← 核心文件（角色定义 + 行为规范）
├── scripts/              ← 可执行脚本
│   ├── lib.js           ← 共享工具库（harness 提供）
│   └── *.js             ← 功能脚本
└── references/           ← 参考文档
    └── *.md             ← 协议/规范/模板
```

### 6.3 drama-harness Skill（工程层）

```
drama-harness/
├── SKILL.md              ← Harness 工程规范
└── scripts/
    ├── lib.js            ← 共享工具库：路径常量、文件读写、安全校验
    ├── init.js           ← 模拟初始化：创建 episode + 快照 + 设状态
    ├── wrap.js           ← 模拟收尾：更新记忆 + 提取 carry-over + 报告
    ├── snapshot.js       ← 快照/回滚：世界状态 + Agent 记忆
    ├── status.js         ← 状态查询：世界 + Agent + 记忆摘要
    ├── validate.js       ← 校验：SOUL.yaml 字段 + MEMORY 容量 + RULES 格式
    └── memory.js         ← 记忆工具：add/replace/remove + 容量检查 + 归档
```

### 6.4 drama-world Skill（世界引擎）

```
drama-world/
├── SKILL.md              ← 世界引擎运行规范
├── scripts/
│   ├── build-context.js  ← 上下文组装：world/ + agents/*/ → Agent prompt
│   ├── update-world.js   ← 世界更新：从交互记录提取事件 → state.json + timeline.md
│   └── build-scene.js    ← 场景构建：根据 carry-over + 世界状态生成场景提示
└── references/
    └── interaction-protocol.md  ← 交互协议：消息类型 + 时间推进 + OOC 标准
```

---

## 7. 命令设计

### 7.1 四个核心命令

| 命令 | 用法 | 说明 |
|------|------|------|
| **sim** | `drama-agent sim <ep-id> [options]` | 启动模拟 Session |
| **status** | `drama-agent status [ep-id]` | 查看世界/Agent 状态 |
| **recall** | `drama-agent recall <agent-id> [--search X]` | 查询 Agent 记忆 |
| **roll** | `drama-agent roll <ep-id> [--to T]` | 快照回滚 |

### 7.2 sim 命令参数

```bash
drama-agent sim ep04 \
  --title "暗流" \
  --logline "高鸣的匿名委托人浮出水面" \
  --agents lin-qi,su-yao,gao-ming \
  --skill screenplay \
  --mode team          # serial（串行调试）| team（并行交互）
```

### 7.3 v2.0 命令迁移

| v2.0 命令 | v3.0 处置 |
|-----------|----------|
| `play` | → `sim`（重新定义） |
| `status` | 保留，扩展为世界 + Agent 双视角 |
| `roll` | 保留，扩展为支持世界状态回滚 |
| `new` | 合并入 `sim`（自动初始化） |
| `brief` | 删除（世界引擎自动构建场景） |
| `run` | 删除（合并入 `sim`） |
| `scene` | 删除（世界管理者自主推进场景） |
| `check` | 删除（Harness 门控层持续监控） |
| `wrap` | 删除（`sim` 自动归档） |

---

## 8. 数据层设计

### 8.1 目录结构

```
drama-agent/
├── world/                    # 世界状态（世界引擎维护）
│   ├── bible.md              # 世界观
│   ├── state.json            # 全局状态
│   └── timeline.md           # 事件时间线
│
├── agents/                   # Agent 居民（身份系统）
│   ├── lin-qi/
│   │   ├── SOUL.yaml         # 身份
│   │   ├── MEMORY.md         # 活跃记忆
│   │   ├── RULES.md          # 行为红线
│   │   └── memory-archive/   # 记忆归档
│   ├── su-yao/
│   └── gao-ming/
│
├── episodes/                 # 模拟产出（按集归档）
│   └── ep04/
│       ├── .session.json     # 模拟元数据
│       ├── runtime/          # 运行时交互记录
│       │   └── interactions.jsonl
│       ├── output/           # 内容产出
│       │   ├── screenplay.md # 剧本 Skill 产出
│       │   └── novel.md      # 小说 Skill 产出
│       ├── session-report.md # Harness 报告
│       └── wrap-report.md    # 归档报告
│
├── dramaspec/                # [兼容] 旧版数据
│   ├── episodes/ep01~03/     # 历史产出保留
│   └── .snapshots/           # 快照目录
│
├── .codebuddy/skills/        # Skill 能力层
│   ├── drama-harness/
│   ├── drama-world/
│   ├── drama-director/
│   ├── drama-screenplay/
│   └── drama-novel/
│
├── .codebuddy/commands/drama/ # 命令入口
│   ├── sim.md
│   ├── status.md
│   ├── recall.md
│   └── roll.md
│
├── templates/                # 初始化模板
│   ├── series-bible.md       # 世界观模板
│   ├── soul.yaml             # Agent SOUL 模板
│   ├── memory.md             # Agent MEMORY 模板
│   └── rules.md              # Agent RULES 模板
│
├── harness/hooks/            # 生命周期钩子（不动）
├── scripts/hooks/            # Hook 脚本（不动）
├── scripts/validate-character.js  # → 迁移到 drama-harness
└── scripts/detect-stagnation.js   # → 迁移到 drama-harness
```

### 8.2 与 v2.0 对比

| 维度 | v2.0 | v3.0 |
|------|------|------|
| 角色存储 | `dramaspec/characters/*.yaml` | `agents/*/SOUL.yaml` |
| 世界状态 | `dramaspec/series-state.json` | `world/state.json + timeline.md` |
| 世界观 | `dramaspec/series-bible.md` | `world/bible.md` |
| 记忆 | 无 | `agents/*/MEMORY.md + memory-archive/` |
| 行为规则 | Skill SKILL.md 中内嵌 | `agents/*/RULES.md` |
| 产出位置 | `dramaspec/episodes/ep-xx/narrative.md` | `episodes/ep-xx/output/*.md` |
| 逻辑代码 | `src/cli.js + src/play.js + src/agents/` | `.codebuddy/skills/*/scripts/` |

---

## 9. 实现计划

### 9.1 阶段划分

| 阶段 | 目标 | 交付物 |
|------|------|--------|
| **Phase 1: 身份 + 世界** | Agent 身份系统 + 世界引擎基座 | SOUL/MEMORY/RULES 文件体系 + world/ 目录 + harness/world Skill |
| **Phase 2: 自由交互** | Agent 自主对话 + 世界管理者介入 | sim 命令 + team agent 自由交互模式 |
| **Phase 3: 内容 Skill** | 剧本/小说 Skill 可插拔输出 | screenplay/novel Skill + compile 脚本 |
| **Phase 4: 记忆进化** | 跨集记忆累积 + 记忆搜索 + 记忆归档 | recall 命令 + memory.js + memory-archive/ |
| **Phase 5: 连载验证** | 至少 5 集连续模拟，验证记忆和世界状态的连贯性 | ep04~ep08 完整产出 |

### 9.2 里程碑

| 里程碑 | 目标 | 状态 |
|--------|------|------|
| M0 — 可行性调研 | ADR 决策、架构确认 | ✅ 已完成 |
| M1 — 项目计划 | v1→v3 三版迭代 | ✅ 已完成 |
| M2 — MVP 骨架 | CLI 八命令、Harness 资产 | ✅ 已完成 |
| M3 — 功能验证 | ep01/ep02 走通 | ✅ 已完成 |
| M4 — Multi-Agent Phase 1 | 导演 + 旁白 subagent 串行 | ✅ 已完成 |
| M5 — Multi-Agent Phase 2 | Team Agent 多角色并行 | ✅ 已完成 |
| **M6 — 身份模拟平台** | **Agent Identity + World Engine + Skill Library** | 🔨 构建中 |
| M7 — 记忆进化 | 跨集记忆 + recall 命令 | 📋 规划中 |
| M8 — 连载验证 | 5+ 集连续模拟 | 📋 规划中 |

---

## 10. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Agent 对话发散失控 | 自由交互导致跑题 | 世界管理者施压 + Harness 门控（max_turns / OOC 检测） |
| 记忆污染 | 错误事实写入 MEMORY.md | Harness wrap 时统一写入（Agent 不直接改记忆） |
| 记忆膨胀 | 多集后记忆超出有界容量 | ~2000 字符硬限 + 合并淘汰机制 + 归档搜索 |
| 角色 OOC | Agent 行为与 SOUL 不一致 | RULES.md 约束 + 世界管理者监控 + 交互 trace 审计 |
| 世界状态不一致 | 并行 Agent 对世界状态有矛盾认知 | 世界引擎统一维护 state.json，Agent 只读 |
| Skill 输出质量不稳 | 从自由交互编译为结构化内容有损 | 内容 Skill 的 compile 脚本持续迭代 + 参考文档 |
| 连载上下文过长 | 多集后世界状态和记忆超出窗口 | 有界记忆 + 摘要注入 + timeline 按需截取 |

---

## 附录

### A. 命令速查（v3.0）

```bash
# 启动模拟
drama-agent sim ep04 --title "暗流" --agents lin-qi,su-yao,gao-ming --skill screenplay

# 查看世界状态
drama-agent status

# 查看单集状态
drama-agent status ep04

# 查询 Agent 记忆
drama-agent recall lin-qi
drama-agent recall lin-qi --search "录像带"
drama-agent recall --timeline

# 快照回滚
drama-agent roll ep04 --to latest
```

### B. SOUL.yaml 完整字段

```yaml
# --- 身份核心 ---
id:                 # 唯一标识（kebab-case）
name:               # 角色名
archetype:          # 原型定位
desire:             # 核心欲望
fear:               # 核心恐惧
secret:             # 隐藏秘密
voice:              # 说话风格
status:             # active / inactive / retired

# --- 情绪 ---
emotion_default:    # 默认情绪基线
emotion_state:      # 当前情绪（可变）

# --- 关系 ---
relationships:
  - target:         # 对方 agent-id
    type:           # 关系类型
    trust:          # 信任度 0~1
    summary:        # 关系描述

# --- v3.0 新增 ---
memory_capacity:    # MEMORY.md 字符上限（默认 2000）
interaction_style:  # 交互偏好（observer-first / direct / cautious / impulsive）
known_facts: []     # 已知事实索引

# --- 备注 ---
notes:
  surface:          # 外在表现
  fracture:         # 脆弱点
  season_arc:       # 赛季弧线
```

### C. 与参考系统的映射

| DramaAgent v3 | 斯坦福 AI 小镇 | Hermes Agent | OpenClaw |
|---------------|---------------|-------------|----------|
| SOUL.yaml | Agent 身份描述 | — | SOUL.md |
| MEMORY.md | 记忆流 (Memory Stream) | MEMORY.md (~2200 chars) | MEMORY.md |
| RULES.md | — | — | AGENTS.md |
| world/state.json | 环境状态 | — | — |
| world/timeline.md | 记忆流(全局视角) | Session Search | — |
| memory-archive/ | 长期记忆 | Session Search (SQLite) | — |
| drama-harness | — | Config + Safety | TOOLS.md |
| drama-world | 环境模拟器 | — | HEARTBEAT.md |

---

*v3.0 核心变化：从"固定流水线的剧本生产工具"到"给 Agent 身份，让它们在世界中自由演绎"。Agent 不是工具，是角色。*
