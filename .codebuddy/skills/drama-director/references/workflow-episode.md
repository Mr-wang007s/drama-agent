# Workflow: 剧集生成流水线

> Director 的五阶段流水线详细定义。每个 Phase 标注类型、可用能力、前馈/反馈控制、失败策略。
> 采用 Harness Engineering 理念：确定性节点机械执行，灵活节点 LLM 自主决策。

---

## 执行前检查

Director 加载时先检测断点：

```
1. 查找当前故事的 episodes/*/.fsm-state.json
2. 如有未完成 episode（state ≠ idle/wrapped）→ 询问用户是否继续
3. 继续 → read episode-brief + beat-sheet → 从断点 Phase 恢复
4. 不继续 → 正常响应新请求
```

---

## Phase 1: 规划

| 属性 | 值 |
|------|---|
| **类型** | 混合（确定性门控 + 灵活创作） |
| **可用能力** | World.校验能力 / World.快照能力 / World.上下文构建 |
| **FSM 状态** | idle → initializing → context-ready |

### 步骤

1. **Pre-flight 校验**（确定性）
   - 调用 World 的**校验能力**（validate.js）检查参演角色 SOUL 完整性
   - 失败策略：阻断 + 报告缺失字段 + 建议修复命令

2. **保底快照**（确定性）
   - 调用 World 的**快照能力**（snapshot.js）备份当前 episode + world + MEMORY
   - 失败策略：warn 但不阻断（快照失败不影响生成，但丧失回滚能力）

3. **上下文组装**（确定性）
   - 调用 World 的**上下文构建能力**（build-context.js）读取世界状态 + 角色档案
   - 产出 context 对象供后续 Phase 使用

4. **选角 + Beat-Sheet**（灵活）
   - 根据上下文选择本集参演角色
   - 创作 beat-sheet（场景骨架 + 关键触发点）
   - 门控：beat-sheet 必须存在才能进入 Phase 2

### Checkpoint

- beat-sheet.md 已写入 episode 目录
- 参演角色 SOUL 校验通过
- 快照已创建（warn 级：不阻断）

---

## Phase 2: 导演（多 Agent Team 核心）

| 属性 | 值 |
|------|---|
| **类型** | 灵活（LLM + Agent 自主交互） |
| **可用能力** | World.场景构建 / Team 工具（team_create/spawn/send_message/team_delete） |
| **FSM 状态** | context-ready → simulating |

### Team 模式（默认，角色 > 2 人）

```
1. team_create（创建团队）
2. spawn world-manager（世界管理者——导演的代理人）
3. spawn agents（每个参演角色一个 Agent）
4. Agent 自由交互（world-manager 负责施压/事件注入/内心独白引导）
5. 场景结束条件满足 → team_delete
```

### 直写模式（降级，角色 ≤ 2 人或用户要求"快速"）

Director 直接以全知视角写作交互内容。

### 导演施压原则

- **不替 Agent 说话**——给世界压力，Agent 自己决定怎么反应
- **不规定具体行动**——可以说"有人来了"，不能说"他吓了一跳"
- **不编造 Agent 不可能知道的信息**——每个 Agent 只知道它 MEMORY/known_facts 中的内容
- **事件注入**：外部事件（电话响、有人来、天气变化）驱动场景推进

### 防死循环

- Team 模式下建议设置 max_turns 防止无限交互
- 如果 Agent 交互陷入重复/客套循环，world-manager 应注入打破性事件
- FSM tick() 记录轮次，超限时自动结束 Phase 2

### Checkpoint

- interactions 覆盖了 beat-sheet 标注的所有触发点
- 交互记录已保存

---

## Phase 3: 编译

| 属性 | 值 |
|------|---|
| **类型** | 混合（灵活编译 + 确定性门控） |
| **可用能力** | compile-novel.js / compile-screenplay.js / Critic.AI味检测 |
| **FSM 状态** | simulating（保持） |

### 步骤

1. **内容编译**（灵活）
   - 默认：调用 compile-novel.js 或按 references/compile-novel.md 规范手工编译
   - 可选：compile-screenplay.js 编译剧本格式
   - 编译时遵循去 AI 味规范

2. **AI 味检测**（确定性门控）
   - 调用 Critic 的 `check-ai-taste.js` 检测产出文本
   - 退出码 0 → 通过，进入 Phase 4
   - 退出码 1 → 按量化问题清单自动修订
   - **失败策略**：最多修订 3 轮。3 轮后仍不过 → 标注问题继续推进（不永远阻断）

### Checkpoint

- novel.md / screenplay.md 已产出
- check-ai-taste 通过（或标注了遗留问题）

---

## Phase 4: 评审

| 属性 | 值 |
|------|---|
| **类型** | 确定性（必须执行，不可跳过） |
| **可用能力** | 独立 Task Agent（加载 drama-critic Skill） |
| **FSM 状态** | simulating（保持） |

### 步骤

1. spawn 独立 Task Agent，加载 `drama-critic` Skill
2. Critic 独立评估本集产出（novel/screenplay + interactions）
3. 产出 `critic-report.md` 写入 episode/output/

### 评审标准

- 人格一致性：角色行为是否匹配 SOUL.yaml
- 创伤链兑现：beat-sheet 中的心理触发点是否被自然表现
- 信息合规：Agent 是否使用了不该知道的信息
- 文学质量：叙事张力、节奏、留白

### 失败策略

- 🔴 Error 级问题 → 向用户标红提示，建议修订
- 🟡 Warning 级 → 记录但不阻断
- 🟢 Info 级 → 仅记录

### Checkpoint

- critic-report.md 已产出
- 无 Error 级问题（有则提示用户）

---

## Phase 5: 收尾

| 属性 | 值 |
|------|---|
| **类型** | 确定性（机械执行） |
| **可用能力** | World.记忆写入 / World.收尾能力 / World.世界更新 |
| **FSM 状态** | simulating → wrapping → wrapped |

### 步骤

1. **MEMORY 写入**（确定性）
   - 调用 World 的**记忆写入能力**（memory.js）
   - 按 tier 上限写入（S:2000 / A:1200 / B:600 字符）
   - 超容量时自动归档旧条目

2. **世界状态更新**（确定性）
   - 调用 World 的**世界更新能力**（update-world.js）
   - 更新 state.json + timeline.md

3. **Session 收尾**（确定性）
   - 调用 World 的**收尾能力**（wrap.js）
   - 产出 session-report + 更新元数据

4. **FSM 归位**
   - FSM transition → wrapped → idle
   - 持久化最终状态

### Checkpoint

- MEMORY 各角色均未超容量
- state.json + timeline.md 已更新
- session-report 已产出

---

## 能力引用映射

Director 通过"能力名"引用 World 的工具。具体脚本路径查阅 `drama-world/SKILL.md` 的能力映射表。

| 能力名 | 对应脚本 | 用途 |
|--------|---------|------|
| World.校验能力 | validate.js | Pre-flight 检查角色完整性 |
| World.快照能力 | snapshot.js | 保底备份 + 回滚 |
| World.上下文构建 | build-context.js | 组装世界/角色上下文 |
| World.场景构建 | build-scene.js | 构建单场景上下文 |
| World.记忆写入 | memory.js | 有界记忆管理 |
| World.世界更新 | update-world.js | state + timeline 更新 |
| World.收尾能力 | wrap.js | Session 收尾 + 报告 |
| World.状态查询 | status.js | 三层状态检查 |

---

## Harness 设计原则

本 Workflow 融入 Harness Engineering 理念，但务实定位：

- **确定性节点**（validate/snapshot/check-ai-taste/wrap）：应当执行，脚本 exit code 提供可靠反馈
- **灵活节点**（选角/beat-sheet/Team 交互/编译文学性）：LLM 自主发挥
- **FSM**：状态追踪 + 断点恢复数据源，非强制约束。忘了调也不会阻断
- **Checkpoint**：每个 Phase 结束的自检清单，建议完成后对照确认
- **唯一硬门控**：check-ai-taste.js 的 exit code（LLM 可直接观察到 exit:0/1）
