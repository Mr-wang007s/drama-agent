# 多 Agent Team 协议

> 多 Agent Team 演绎是 DramaAgent 的核心模式。本文档定义 Team 的组建、交互、结束规则。

---

## 核心理念

> 多 Agent 演绎控制内容走向——让剧情更丰富，人物更立体。
> Director 不写内容，Director 创造压力；Agent 在压力下自然反应，碰撞出故事。

---

## 角色定义

### world-manager（世界管理者）

Director 在 Team 中的代理人。职责：

1. **事件注入**：向场景注入外部事件（电话、来人、天气、意外）
2. **施压引导**：当 Agent 交互平淡时制造冲突/紧张感
3. **内心独白引导**：在关键时刻向特定 Agent 发送 `[inner_prompt]` 触发内心活动
4. **场景节奏控制**：判断何时一个场景该结束，推进到下一场景
5. **信息裁判**：确保 Agent 不使用超出其 known_facts 的信息

### Agent（角色）

每个参演角色一个 Agent 实例。行为约束：

- 只能使用自己 SOUL.yaml 中定义的 voice/tics/patterns 说话
- 只能基于自己的 MEMORY.md + known_facts 做出反应
- 不能感知其他 Agent 的 [inner_thought]
- 内心独白 [inner_thought] 对 world-manager 不可见，仅 Critic 在评审时可看到

---

## Team 生命周期

### 1. 组建

```
team_create(team_name: "ep{XX}-scene{N}")
├── spawn world-manager（mode: "bypassPermissions"）
│   prompt: 场景设定 + beat-sheet 中本场景的目标 + 参演角色摘要
├── spawn agent-1（mode: "acceptEdits"）
│   prompt: SOUL 简要 + 本场景的 known_facts + 场景初始状态
├── spawn agent-2
│   ...
└── spawn agent-N
```

### 2. 交互循环

```
world-manager → broadcast: 场景开场描述
agent-1 → message: 反应/对话/行动
agent-2 → message: 反应/对话/行动
world-manager → message: 事件注入（如需要）
...循环...
world-manager → broadcast: 场景结束信号
```

### 3. 结束条件

以下任一满足时 world-manager 应结束场景：

- beat-sheet 中标注的所有触发点已覆盖
- 交互轮次达到场景预设上限
- 叙事张力已到达自然收束点
- Agent 交互陷入重复循环（连续 3 轮无新信息）

### 4. 清理

```
team_delete → 所有 Agent 实例销毁
interactions 保存到 episodes/<ep-id>/runtime/
```

---

## 用户可见性协议

Team 模式不是黑盒。Director 应在关键节点向用户反馈：

| 时刻 | 反馈内容 |
|------|---------|
| Phase 2 开始前 | 告知用户选了哪些角色、场景数量 |
| 每场景结束 | 简述场景核心事件（1-2 句） |
| Phase 2 全部结束 | 展示交互摘要（各角色关键决策点） |

---

## 施压策略

### 事件注入类型

| 类型 | 示例 | 适用时机 |
|------|------|---------|
| **外部打断** | 电话响、有人敲门、突发声响 | Agent 交互进入平淡循环 |
| **环境变化** | 灯灭了、开始下雨、时间紧迫 | 需要改变氛围/施加压力 |
| **信息投放** | 某人提到一个名字、发现一件物品 | 需要触发特定角色的创伤链 |
| **第三方介入** | 新角色出现、旁观者反应 | 需要改变对话权力结构 |

### 施压红线

- ❌ 不替 Agent 做决定（"他决定离开"）
- ❌ 不直接揭示 Agent 内心（"她心里其实很害怕"）
- ❌ 不注入 Agent 不可能感知的信息
- ✅ 可以制造物理环境变化
- ✅ 可以让 NPC 说出关键信息
- ✅ 可以通过 [inner_prompt] 触发角色自省

---

## 内心独白机制

### [inner_prompt]

world-manager 可以向特定 Agent 发送内心提示：

```
send_message(recipient: "agent-lin-mo", content: "[inner_prompt] 这个声音让你想起了什么？")
```

Agent 收到后应产出 [inner_thought] 内容（仅在最终编译时可见，不影响其他 Agent）。

### 可见性规则

| 内容类型 | Agent 自身 | 其他 Agent | world-manager | Critic |
|---------|-----------|-----------|--------------|--------|
| dialogue | ✅ | ✅ | ✅ | ✅ |
| action | ✅ | ✅ | ✅ | ✅ |
| inner_thought | ✅ | ❌ | ❌ | ✅ |
| inner_prompt | ✅（目标） | ❌ | ✅（发送者） | ✅ |

---

## 质量保证

### 交互质量信号

- ✅ Agent 基于自身创伤/动机做出独特反应
- ✅ 对话中有信息不对称带来的张力
- ✅ 角色之间有观点/利益冲突
- ✅ 有未说出口的潜台词（通过行为暗示）

### 低质量信号

- ❌ Agent 互相客套（"你说得对""我理解"）
- ❌ 所有 Agent 观点趋同
- ❌ 对话缺乏方向，原地打转
- ❌ Agent 使用了不该知道的信息

---

## 与 Workflow 的关系

- Phase 2 的 Team 模式产出 → 作为 Phase 3 编译的输入
- 交互记录格式：每条包含 `{agent, type, content, timestamp}`
- world-manager 的 broadcast 不计入"角色对话"，只作为场景描述
