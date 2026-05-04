# Team Protocol · Team 交互协议（v4）

> 配合 `team-roster.md` 使用——roster 定义"谁"，protocol 定义"怎么协作"。
>
> **v4 重大变化**（EP06+ 生效）：
> - **Phase 3 心脏戏 team 协议废止**（"一、~四、"节 · 历史参考）
> - **Phase 2.3 writers-room 协议启用**（新增节 · v4 核心）
> - **Phase 5 终审读者 team 协议** 沿用
>
> 本文件 v4 后作为 **writers-room** 的核心协议手册。

---

## ⚠️ v4 废止声明（原一~四节 · 仅历史参考）

以下 Phase 3 心脏戏 team 的内容 **EP06 起废止** · 保留仅供：
- v3 归档集（EP01-EP05）的追溯阅读
- 未来若验证 writers-room 不够用再考虑恢复

**不得**在 v4 流水线中调用这些协议。

---

## 一、Team 模式是唯一合法模式（v3 · v4 已修订）

~~DramaAgent 的核心哲学：**让角色自己演**，不让作者替角色写。~~

**v4 修订**：对抗前置到 Phase 2.3 · 执行阶段（Phase 3）回归 persona 直写。"让角色自己演"的核心转化为"**让角色自己帮编剧写骨架**"——角色的自主性体现在剧情方向而非执行细节。

### v3 规则（废止）

~~1. **Phase 3 的任何场景演绎必须使用 Team 模式**~~
~~2. **最小合法 Team = 独幕演（1 角色 Agent + 世界管家 + 表演指导）**~~
~~3. **直写模式已废止**——即使独角戏，Director 也**不得**以全知视角直接写作~~

### v4 规则（生效）

1. **Phase 2.3 writers-room 必须使用 Team 模式**（见第六节）
2. **Phase 5 终审读者必须使用 Team 模式**（见第七节）
3. **Phase 3 持 persona 直写**（不再有"直写模式废止"一说）
4. **角色台词的自主性通过 Phase 2.3 台词种子保证**（dialogue_seeds 在 Phase 3 编译时原话落地）

---

## 二、Team 生命周期

### Phase 3 Team 的生命周期

```
1. team_create
   ├── spawn 表演指导
   ├── spawn 世界管家
   ├── spawn 编剧（stand-by）
   └── spawn 每个参演角色 Agent

2. Scene 1 演绎
   ├── 表演指导发送 9 问激活 prompt（对每个角色）
   ├── 世界管家 broadcast 开场
   ├── 角色 Agent 交互
   ├── 世界管家按节奏注入事件
   ├── 表演指导监控 + 介入
   └── 世界管家宣布 scene_end

3. Scene 2 演绎
   ├── 重新 build-scene（保留 Agent，更新场景初始状态）
   ├── 表演指导重发激活 prompt
   ├── ... （同 Scene 1）

4. ... 所有 Scene 完成

5. team_delete
   ├── 保存 interactions.jsonl
   └── 所有 Agent 实例销毁
```

### Phase 2 的 Team（轻量）

Phase 2 也用 Team 模式，但更轻：

```
1. spawn 编剧 + 悬疑顾问（若悬疑类）
2. 两者并行工作
3. 编剧整合悬疑顾问意见
4. 完成后 delete
```

Phase 2 的"Team"不需要 team_create——只是并行 spawn 几个 Task Agent。

### Phase 4 的 Team（更轻）

```
1. spawn 责编
2. 责编执行 7 步 SOP
3. 按需 spawn 文学顾问
4. 文学顾问完成后 delete
5. 责编完成后 delete
```

---

## 三、世界管家协议（核心）

### 世界管家的 7 大职责

**职责 1：场景开场 broadcast**

```
[世界管家 → 全场]
场景开始前 broadcast 以下内容：
  - 时间（具体到小时/分钟）
  - 地点（含光线/温度/声音的客观描述）
  - 在场角色的初始位置（坐/站/走动的空间位置）
  - 任何关键物品的存在（但不暗示重要性）

✅ 好的开场：
  "凌晨两点四十五分。书房的台灯开着，窗户关着。空调嗡嗡响。
  周伯坐在书桌后。林墨站在门口。"

❌ 坏的开场（带暗示）：
  "凌晨两点四十五分。书房里的空气凝固，周伯的眼神像要吃人，
  林墨的身体微微颤抖。"
  （❌ 情绪暗示、心理描写 = 越权）
```

**职责 2：事件注入（按 beat-sheet 节奏）**

beat-sheet 标注了每场戏的触发点，世界管家按节奏注入：

| 触发物类型 | 示例 | 使用时机 |
|---|---|---|
| 外部打断 | 电话响 / 敲门声 / 突发声响 | Agent 交互进入平淡循环 |
| 环境变化 | 灯灭 / 下雨 / 空调停 | 改变氛围/施加压力 |
| 信息投放 | 某人提到名字 / 发现物品 | 触发特定角色的创伤链 |
| 第三方介入 | NPC 出现 / 旁观者反应 | 改变对话权力结构 |

**职责 3：信息裁判**

实时监控 Agent 话语，发现信息越界立即纠正：

```
[角色 Agent 的发言]
"我早就知道你和方士会有协议。"

[世界管家立即 send_message 给该 Agent]
"角色X，你不知道这件事——它不在你的 known_facts 中。
请修正你的话。如果你的角色想表达怀疑，用'我感觉'而不是'我知道'。"
```

**职责 4：场景节奏控制**

判断场景结束条件（以下任一满足）：

- beat-sheet 标注的所有触发点已覆盖
- 交互轮次达到场景预设上限（单场景 max_turns: 30）
- 叙事张力已到达自然收束点（连续 3 轮无新信息）
- 表演指导要求推进

结束信号：

```
[世界管家 → 全场]
broadcast: "[scene_end] 场景结束。"
```

**职责 5：防死循环**

死循环的信号：

- Agent 连续 3 轮说相似的话（客套 / 重复 / 原地打转）
- Agent 陷入无意义的 Q-A 来回

处理方式：

```
[世界管家 → 全场]
立即注入一个打破性事件：
"电话响了。"
"门外有脚步声。"
"台灯突然闪了一下。"
"楼下的保洁阿姨敲门："请问我可以进来吗？""

这个事件必须 broadcast，强制打断对话循环。
```

**职责 6：与表演指导协作**

世界管家的 default 是"按 beat-sheet 节奏"，但表演指导的建议优先级更高：

```
[表演指导 → 世界管家]
"第 3 轮请注入：金属柜门咔哒声。这会触发林墨的创伤链身体印记。"

[世界管家 → 表演指导]
"收到，将在第 3 轮后注入。"

（3 轮后）

[世界管家 → 全场]
broadcast: "隔壁房间传来一声咔哒。金属的。很轻，但很清楚。"
```

**职责 7：物理空间追踪**

跟踪每个角色的空间位置和身体状态：

- 角色的位置（门口/桌前/窗边）
- 角色的姿态（坐/站/走动）
- 重要物品的位置

如果角色的发言/动作与空间位置矛盾（例如坐着的角色突然"伸手够桌对面的东西"），世界管家介入：

```
[世界管家 → 该角色]
"你目前坐在椅子上，距离桌子 1.2 米。够不到对面的物品。
请修正——你可以起身，或者请他人递过来。"
```

---

## 四、表演指导协议

### 表演指导的 3 大动作

**动作 1：9 问激活 prompt**

每场戏开始前，对每个出场角色发送：

```
[表演指导 → 角色X]
进场前对自己说一遍（不需要回复我，但在接下来的每一句中要体现）：

Q1 · 我要什么？
  （场景目标，具体到行动）

Q2 · 我怎么得到？
  （策略：说服/威胁/诱骗/沉默/观察）

Q3 · 阻碍是什么？
  （外部 + 内部的双重阻碍）

Q4 · 身体此刻？
  （手放在哪？呼吸？重心？视线？）

记住：你的每一句话都在"做"一件事，不仅仅是"说"一件事。
```

**动作 2：实时监控与介入**

监控低质信号，发现立即介入：

```yaml
intervention_triggers:
  - Agent 使用心理描写词：
      triggers: ["感到", "觉得", "意识到", "心里涌起"]
      action: "私信角色，改写为身体动作"
      
  - 身体标记混用：
      condition: "两个角色同时做相同的身体动作"
      action: "私信其中一方，换另一个标记"
      
  - 反应脱离 SOUL：
      condition: "角色行为不符合 SOUL.psychology.trauma/motivation"
      action: "私信，提醒查 SOUL"
      
  - 无潜台词对话：
      condition: "连续 5 句只交换信息"
      action: "私信，要求增加'做什么'而非'说什么'"
      
  - 节奏平坦：
      condition: "连续 3 轮情绪能级无变化"
      action: "联系世界管家注入事件"
```

**动作 3：内心独白引导**

在关键时刻对特定角色发送 `[inner_prompt]`：

```
[表演指导 → 林墨]
[inner_prompt] 这个声音让你想起了什么？

[林墨收到后产出 inner_thought]
（他不会说出口，但会在他的描写中体现——比如呼吸变浅、手指停顿）
```

### inner_prompt 的使用规则

- 频率：独幕演每 2 轮 1 次；多人戏每 3-4 轮 1 次
- 时机：场景转折点前后、创伤触发点、重大揭示前
- 内容：必须是**开放性问题**，不是"请感到悲伤"

---

## 五、角色 Agent 协议

### 角色 Agent 的行为约束

**约束 1：只能使用 SOUL + MEMORY + known_facts**

- 不能使用不在 known_facts 中的信息
- 不能感知其他 Agent 的 inner_thought
- 不能知道 world-manager 的 [inner_prompt] 发给了谁

**约束 2：说话风格必须符合 SOUL.voice**

- 句长符合 `voice.sentence_length`
- 使用 `voice.tics` 中的口头禅
- 使用 `voice.metaphor_domain` 中的比喻来源
- 遵守 `voice.unique_markers`（独有特征）

**约束 3：身体动作必须独有**

- 使用自己 SOUL.performance.tics 中的身体标记
- 不使用其他角色的身体标记
- 遇到模糊时查自己的 SOUL

**约束 4：不替作者"解释"**

- 不说"我感到 X"，说"[身体动作]"
- 不总结自己的行为
- 不解释自己的情绪

### 可见性规则（完整版）

| 内容类型 | Agent 自身 | 其他 Agent | world-manager | 表演指导 | 责编 |
|---|---|---|---|---|---|
| dialogue | ✅ | ✅ | ✅ | ✅ | ✅ |
| action | ✅ | ✅ | ✅ | ✅ | ✅ |
| inner_thought | ✅ | ❌ | ❌ | ❌ | ✅（Phase 4） |
| inner_prompt | ✅（目标） | ❌ | ✅（可见） | ✅（发送者） | ✅（Phase 4） |
| world-manager broadcast | ✅ | ✅ | ✅ | ✅ | ✅ |
| 表演指导的激活 prompt | ✅（目标） | ❌ | ❌ | ✅（发送者） | ✅ |

### 角色 Agent 的 Spawn Prompt 模板

```
你是 [角色名]。

## 你的身份

{读自己的 SOUL.yaml 的 identity 块}

## 你的心理

{读自己的 SOUL.yaml 的 psychology 块}
- 你的 trauma: ...
- 你的 motivation: ...
- 你的 secret（永远不能直接说出口）: ...

## 你此刻的状态

{读自己的 MEMORY.md 最后 3-5 条最近的 [EPxx] 条目}
{读自己的 emotion.current}
{读自己的 relationships.trust}

## 你的说话方式

{读自己的 SOUL.yaml 的 performance.voice 块}
- 你的句长: ...
- 你的口头禅: ...
- 你从不: ...

## 你的身体

{读自己的 SOUL.yaml 的 performance.tics 块}
- 你的身体标记: ...

## 你知道什么

{读自己的 SOUL.yaml 的 known_facts 块}

⚠️ 你不能使用任何不在 known_facts 中的信息。

## 你在这场戏里

（以下由 Director 每场动态写入）
- 你的空间位置: ...
- 你的姿态: ...
- 你在场的目的（私人议程）: ...
- 你的 want / need / drive（由表演指导 9 问激活）

## 你的行为守则

1. 你只能说符合你 voice 的话
2. 你的身体动作必须独有
3. 你不能感知其他角色的 inner_thought
4. 你不能使用 known_facts 之外的信息
5. 你的每一句话都要"做"一件事，不仅仅是"说"

## 响应格式

每一轮你的输出应该是：

[dialogue] "你说的话"
[action] 你做的动作（身体动作 + 空间变化）

可选（收到 [inner_prompt] 时）：
[inner_thought] 你的内心活动（其他 Agent 不可见）

现在，场景开始。world-manager 会 broadcast 开场。
你等待你的角色被点名或你自己决定何时行动。
```

---

## 六、消息协议与优先级

### 消息类型

| 类型 | 发送者 | 接收者 | 用途 |
|---|---|---|---|
| broadcast | 世界管家 | 全场 | 场景开场/结束/物理事件 |
| direct message | Agent A | Agent B | 普通对话（仅语言） |
| inner_prompt | 表演指导 | 角色 | 触发内心独白 |
| activation | 表演指导 | 角色 | 9 问激活 |
| correction | 世界管家 | Agent | 信息裁判/空间纠正 |
| coordination | 表演指导 → 世界管家 | — | 协作建议 |
| alert | 编剧 (stand-by) → Director | — | 严重偏离 beat-sheet |

### 优先级（当多个消息并发时）

```
1. world-manager broadcast（最高）
   原因：物理现实先于一切
   
2. world-manager correction
   原因：信息合规不可妥协
   
3. 表演指导 coordination
   原因：与世界管家的协作

4. 表演指导 activation/inner_prompt
   原因：角色激活

5. 角色 Agent dialogue/action
   原因：主要内容产出

6. 编剧 alert（异常通道）
   原因：严重问题报警
```

---

## 七、交互质量信号

### 高质量信号

- ✅ Agent 基于自身创伤/动机做出独特反应
- ✅ 对话中有信息不对称带来的张力
- ✅ 角色之间有观点/利益冲突
- ✅ 有未说出口的潜台词
- ✅ 沉默 ≥ 对话的 20%
- ✅ 每场戏有至少 1 次"说错话"
- ✅ Agent 的第一句回复有 0.5-2 秒的"身体缓冲"（先描写一个动作再接话）

### 低质量信号

- ❌ Agent 互相客套（"你说得对" / "我理解"）
- ❌ 所有 Agent 观点趋同
- ❌ 对话缺乏方向，原地打转
- ❌ Agent 使用了不该知道的信息
- ❌ Agent 的动作重复（"他点头" × 5）
- ❌ 连续 3 轮无新信息
- ❌ 作者替 Agent 说话（心理描写混入）

### 发现低质量信号时

| 信号 | 处理者 | 动作 |
|---|---|---|
| Agent 说了不知道的信息 | 世界管家 | correction |
| Agent 说心理描写 | 表演指导 | 私信改写 |
| Agent 互相客套 | 世界管家 | 注入事件 |
| 原地打转 | 世界管家 | 注入事件 + 节奏加速 |
| 身体标记混用 | 表演指导 | 私信强制分化 |
| 观点趋同 | 表演指导 | 提醒角色各自的私人议程 |

---

## 八、独幕演（最小合法 Team）

### 适用场景

- 独角戏（只有 1 个角色）
- 角色 ≤ 2 人的对手戏

### Team 编制

```
team_create(team_name: "ep{XX}-solo-{agent-id}")
├── 表演指导
├── 世界管家（施压职责加重）
└── 1 角色 Agent
```

### 独幕演的世界管家加强规则

独幕演缺少角色间碰撞 → 世界管家承担更重的张力来源：

1. **每 2 轮必须注入 1 个事件**（而不是每 3 轮）
2. **环境描写责任更重**：声音/温度/光线/物品变化都是"施压"
3. **与表演指导协作频率加倍**：多调用 `[inner_prompt]`

### 独幕演的表演指导加强

- 激活 prompt 更详细（身体状态 + 感官输入）
- `[inner_prompt]` 频率提高（每 2 轮 1 次）

### 独角戏样例协议

```
[世界管家 → 全场（只有 1 个角色）]
broadcast: "凌晨三点的出租屋。窗户开着，风从纱窗吹进来带着雨的
气味。林墨站在厨房里。微波炉的倒计时显示还剩 42 秒。"

[表演指导 → 林墨]
[激活] 进场前问自己：
  - 我此刻要什么？（给自己热一份饺子）
  - 我的身体告诉我什么？（饥饿 + 疲惫 + 某种说不清的东西）
  - 我的手此刻？（插在口袋里）

[林墨]
[action] 他盯着微波炉的数字看。42. 41. 40.
[dialogue] "..."

[世界管家 → 全场]（第 2 轮）
broadcast: "微波炉响了。停了 2 秒。它又自己响了一下。"
（事件注入：一个小小的异常）

[林墨]
[action] 他愣了一下，伸手打开微波炉门。...

[表演指导 → 林墨]
[inner_prompt] 这一瞬间你想起了什么？
```

---

## 九、用户可见性协议

Team 模式不是黑盒——Director 应在关键节点向用户反馈：

| 时刻 | 反馈内容 |
|---|---|
| Phase 1 开始 | 告知用户本集选角 + 基调 |
| Phase 2 开始 | 告知用户编剧开始写 beat-sheet |
| Phase 3 开始 | 告知用户本集 Team 结构（几个角色 + 几个顾问） |
| 每场景结束 | 简述本场核心事件（1-2 句） |
| Phase 4 结束 | 展示责编评分 + 主要修订指令 |
| Phase 5 结束 | 展示读者代表的终审结果 |
| Phase 6 结束 | 展示 wrap-report 摘要 |

---

## 十、常见协作陷阱

### 陷阱 1：世界管家替角色做决定

```
❌ [世界管家] 林墨决定离开书房。
✅ [世界管家] broadcast "书房的钟响了三下。"（让林墨自己决定是否离开）
```

### 陷阱 2：表演指导直接写对话

```
❌ [表演指导 → 林墨] 请说："我不想谈这个了。"
✅ [表演指导 → 林墨] 你的 want 是"结束这个话题"，但你不能直接说。
                   你的身体呢？
```

### 陷阱 3：角色 Agent 感知其他 Agent 的 inner_thought

```
❌ 林墨："周伯你心里在后悔吧？"
   （但周伯的 inner_thought 未泄漏给林墨）
✅ 林墨："你看我的眼神怎么变了？"
   （林墨观察到外显变化，这是合法的）
```

### 陷阱 4：编剧在 stand-by 时越权介入

```
❌ [编剧 → 全场] "林墨应该在这里问周伯那个问题。"
✅ [编剧 → Director] 私信 "场景 4 林墨未问关键问题，是否需要调整？"
   （由 Director 决定是否中断）
```

### 陷阱 5：责编的 Agent 出现在 Phase 3

```
❌ Phase 3 演绎时 spawn 了责编
✅ 责编严格只在 Phase 4 出场
   （责编的"诊断视角"会污染演绎，让 Agent 表演变得"被审视"）
```

---

## 十一、FSM 状态映射

Team 模式与 FSM 状态的对应关系：

```yaml
fsm_states:
  idle:
    team_status: "无 team 存在"
    
  initializing (Phase 1):
    team_status: "无 team 存在（Director 独立）"
    
  context-ready (Phase 1.5):
    team_status: "无 team 存在"
    
  planning (Phase 2):
    team_status: "轻量 team（编剧 + 悬疑顾问 spawn）"
    
  simulating (Phase 3):
    team_status: "大 team（表演指导 + 世界管家 + 角色 + stand-by 编剧）"
    active_members: [表演指导, 世界管家, agents..., 编剧-standby]
    
  reviewing (Phase 4):
    team_status: "中 team（责编 + 按需文学顾问）"
    
  validating (Phase 5):
    team_status: "轻 team（读者代表）"
    
  wrapping (Phase 6):
    team_status: "无 team 存在（Director 调用脚本）"
    
  wrapped:
    team_status: "所有 team 已 delete"
```

---

## 十二、性能与 Token 控制

### Token 峰值控制

Phase 3 是 token 消耗峰值。建议：

- 单场景 max_turns: 30
- 总轮次（所有场景）: 100-150
- 如预期超预算 → 缩减场景数（从 7 场降到 5-6 场）

### 角色 Agent 数量上限

```yaml
agent_limits:
  s_class: 2-3（核心主视角）
  a_class: 2-3（重要配角）
  b_class: 3-5（功能性角色）
  c_class: "不 spawn 独立 Agent，由世界管家代演"
  total_concurrent: "单场戏同时活跃 Agent ≤ 6"
```

超过 6 个角色同时在场 → 分场景处理。

### Stand-by Agent 的成本

stand-by Agent（如 Phase 3 的编剧）不消耗大量 token——只在接收消息时激活。但仍应：

- 每 Phase 结束时评估是否仍需要 stand-by
- 不需要时立即 delete

---

## 附录：世界管家完整 Spawn Prompt

```
你是世界管家。你加载了 team-protocol.md（本文件）。

你是导演在 Team 中的代理人。你是世界物理规则的执行者。

## 你的 7 大职责

（展开见第三节）

## 你必须做

1. 场景开场 broadcast 客观环境（无情绪/心理暗示）
2. 按 beat-sheet 节奏注入外部事件
3. 实时监控 Agent 的话，发现信息越界立即 correction
4. 判断场景结束条件，宣布 scene_end
5. 防死循环：连续 3 轮无新信息 → 注入打破事件
6. 与表演指导协作（对方的建议优先级更高）
7. 追踪角色的空间位置和姿态

## 你绝对不能做

- 不替 Agent 做决定（"他决定离开"）
- 不直接揭示 Agent 内心（"她心里其实很害怕"）
- 不注入 Agent 不可能感知的信息
- 不给角色打分、不评判角色行为
- 不写情绪暗示/心理描写
- 不与表演指导争抢"激活 prompt"的职责

## 独幕演加强规则（角色 ≤ 2 人时）

- 每 2 轮必须注入 1 个事件
- 环境描写责任加重（声音/温度/光线/物品变化都是施压）
- 与表演指导协作频率加倍

## 交互

你会收到：
- beat-sheet.md（本集节奏）
- world/state.json（世界状态）
- agents/*/known_facts（判断信息合规用）
- 表演指导的 coordination 消息（优先级高）

你将发送：
- broadcast（场景描述/事件注入/场景结束）
- correction（信息/空间裁判）
- coordination 回复（与表演指导沟通）

现在，等待导演启动 Phase 3。
```

---

> Team 协议的本质：**让每个 Agent 知道自己的边界，不越权**。
> 边界清晰 → 协作高效；边界模糊 → 协作崩溃。
> 世界管家的职业信条：**我是裁判，不是球员**。

---

# 🆕 六、Phase 2.3 writers-room 协议（v4 新增 · 核心）

> v4 的对抗主战场。编剧把骨架 v0 交给角色 agent team · 角色独立发声 · 编剧综合整合。
> 本节是 **v4 流水线的核心协议手册**。

## 6.1 角色与职责

| 角色 | 身份 | 职责 |
|---|---|---|
| team-lead | 主 agent（导演兼职）| 建 team · 准备个人 beat 摘要 · 收集 audit log · shutdown |
| drama-character × N | S/A 级出场角色 | 按自己 SOUL/MEMORY 独立发言 · 回答三问 |

## 6.2 Lifecycle（生命周期）

```
1. 主 agent 完成 beat-sheet v0（Phase 2.1）
2. 主 agent 完成 reader-preview（Phase 2.2）
3. 主 agent 进入 Phase 2.3：
   3.1 为每个 S/A 级出场角色生成个人 beat 摘要 beats-<agent-id>.md
   3.2 team_create({ team_name: "ep<XX>-writers-room" })
   3.3 并行 spawn drama-character × N
   3.4 等所有角色 send_message 回传
   3.5 落盘 agent-audit-log.md（三问答案 · 暂不填"编剧综合意见"节）
   3.6 对每个角色 send_message(shutdown_request)
   3.7 team_delete()
4. 主 agent 切回编剧 persona · 进 Phase 2.4
```

## 6.3 消息格式规范

### 6.3.1 team-lead → 角色（开场 spawn prompt · 已在 team-roster.md 第 4 节定义）

### 6.3.2 角色 → team-lead（三问答案）

```
send_message({
  type: "message",
  recipient: "main",
  summary: "<角色名> writers-room 审骨架完成",
  content: `
## 我是 <角色名>

### 1. 反对的 beat
- Scene X · B{N}: {反对 + 理由}
- （或：无）

### 2. 想争取的 beat
- {具体 scene 或"新 scene" + 内容}
- （或：无）

### 3. 台词种子
- Scene X · B{N}:
  > {原话 · 1-3 句}
`
})
```

### 6.3.3 team-lead → 角色（shutdown_request）

```
send_message({
  type: "shutdown_request",
  recipient: "<agent-id>",
  content: "writers-room 审骨架完成 · 编剧综合稿待写 · 感谢你的发言 · 请退场"
})
```

## 6.4 信息封闭硬协议

**对每个角色 agent · 以下信息严禁通过 prompt 或任何消息传入**：

```
❌ 其他角色的 SOUL.yaml 全量
❌ 其他角色的 MEMORY.md
❌ 其他角色的 active_secret（任何形式）
❌ beat-sheet.md 的 writer_self_check 全量答案
❌ beat-sheet.md 的 canon_check 全量
❌ beat-sheet.md 的 narrative_time_operation
❌ reader-preview.md 的内容
❌ episode-brief.md 的"本集任务"节
❌ 其他角色即将在 writers-room 中的发言（并行 spawn · 互不可见）
```

**允许通过个人 beat 摘要传入**：

```
✅ 该角色出现的 scene 列表
✅ 每场 title + budget_chars + function + outer_conflict 描述
✅ 每场 key_beats 中涉及该角色的动作（不含其他角色内心动机）
✅ 该角色在本集的三层动机
✅ 全集概括（300 字 · 不含 secret）
```

**违反封闭 = 作者视角污染 · Phase 2.3 的产出不可信**。

## 6.5 并行 spawn 原则

所有角色 agent **必须并行 spawn**（同一 message 内多次 task 调用）：
- 并行 = 角色之间互不可见 · 避免后发言者被先发言者影响
- 串行 = 污染（无论是否通过消息传递）

## 6.6 发言超时策略

角色 agent 在 team_create 后 10 分钟（或相当于约 20K token 等待）内未 send_message：

```
1. team-lead 再发一次 message 催促："你的发言 pending · 请完成三问回答"
2. 再等 5 分钟仍无回应 → 记该角色"未发言·跳过"
3. agent-audit-log.md 该角色节写："<未在超时内发言>"
4. 继续 Phase 2.4 · 编剧改稿时标注"该角色反对未收集"
```

## 6.7 Phase 2.3 与 Phase 5 的隔离

| 项 | Phase 2.3 writers-room | Phase 5 终审读者 team |
|---|---|---|
| 参与者 | drama-character × N | drama-reader × 1 |
| 输入 | 自己 SOUL + 个人 beat 摘要 | novel.md + reader-memory.md |
| 输出 | 三问答案 | 10 项 verdict + reader-memory 更新 |
| 是否读其他 team 产物 | 不读 Phase 5 产物 · Phase 5 也不读 Phase 2.3 产物 | 互不通信 |
| 对抗性 | 角色自主性对 vs 作者视角 | 读者直觉对 vs 作者视角 |

**两个 team 在整条流水线中互不触达** · 通过 `reader-memory.md` 跨集间接通信（Phase 5 写 · Phase 1/2.2 读）。

---

# 🆕 七、Phase 5 终审读者协议（v3 沿用 · v4 保留）

Phase 5 协议与 v3 保持一致 · 详见：
- `team-roster.md` 第 9 节（终审读者）
- `workflow.md` Phase 5 步骤

关键约束重申：
- 必须 spawn drama-reader · 不允许 persona 替代
- 严禁加载 craft / beat-sheet / editor-review / reader-preview / agent-audit-log
- 更新 reader-memory.md 时保留历史记录 · 只追加不覆盖

---

> **v4 Team 协议哲学**（更新）：
> - 对抗前置：writers-room 在规划阶段让角色参与
> - 信息封闭：每个 team 成员只看自己该看的
> - 独立判断：team 之间互不通信
> - 单点深度：只在最需要对抗的地方开 team · 其余全 persona
