# Workflow: 剧集生成流水线（三 Team 循环增强）

> Director 的完整流水线详细定义。Phase 1-6 含循环增强环（4.5-4.9）。
> 采用 Harness Engineering 理念：确定性节点机械执行，灵活节点 LLM 自主决策。
> 核心升级：从线性"生成→评审→收尾"变为"生成→读者→专家→修订→回评"的 GAN 对抗环。

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

## Phase 1.5: Writing-Coach 预检

| 属性 | 值 |
|------|---|
| **类型** | 确定性（8 问必须全部通过） |
| **可用能力** | references/coach-questions.md |
| **FSM 状态** | context-ready（保持） |

### 步骤

1. **8 问审问**
   Director 对 beat-sheet 自问 8 个问题（详见 `references/coach-questions.md`）：
   - Q1: 本集核心冲突是什么？能一句话说清吗？
   - Q2: 主视角角色这一集的情绪起点和终点分别是什么？
   - Q3: 哪个场景是"爽点"——读者读到会兴奋/紧张/感动？
   - Q4: 本集回收了哪些前集钩子？释放了哪些新钩子？
   - Q5: 有破防戏吗？满足 R1-R5 五铁律吗？
   - Q6: 悬疑三铁律（判断错/第三方物理/A级钩子）能满足吗？
   - Q7: 每个出场角色的"私人议程"是什么？
   - Q8: 如果你是读者，读完这集会想立刻看下一集吗？为什么？

2. **6 条打回判定**（任中 1 条 → 回 Phase 1 修订 beat-sheet）
   - ❌ Q1 说不清一句话核心冲突
   - ❌ Q3 无法指出明确爽点
   - ❌ Q4 回收钩子 = 0
   - ❌ Q6 悬疑三铁律一条都不满足（悬疑类故事）
   - ❌ Q8 回答为"不会"或模棱两可
   - ❌ beat-sheet 字数预算总和 < 6000 中文字符

### 失败策略

- 打回后 Director 重写 beat-sheet 再次过预检
- 最多 2 轮预检（第 3 轮强行通过但在 wrap-report 中标注"预检勉强通过"）

---

## Phase 2: 导演（多 Agent Team 核心）

| 属性 | 值 |
|------|---|
| **类型** | 灵活（LLM + Agent 自主交互） |
| **可用能力** | World.场景构建 / Team 工具（team_create/spawn/send_message/team_delete） |
| **FSM 状态** | context-ready → simulating |

### Team 模式（唯一合法模式 · 回合制）

```
1. team_create（创建团队）
2. spawn world-manager（世界管理者——导演的代理人，唯一调度者）
3. spawn agents（每个参演角色一个 Agent，按 references/team-protocol.md 的 Agent Prompt 模板）
4. 回合制交互：world-manager 按"A → B → A → B"交替 @ 角色；每个 Agent 每回合只输出 1 个 beat（≤ 150 字）
5. 每 3 回合 world-manager 注入 1 个外部事件
6. 场景结束条件满足 → team_delete
7. interactions 保存到 episodes/<ep-id>/runtime/interactions.jsonl
```

> ⚠️ **回合制是 Team 模式的硬约束**。如果 Agent 在一次 reply 里输出完整场景，就退化为"独白拼图"不是"剧场"。详见 `references/team-protocol.md` 的"回合制交互协议"。

### 独幕演（最小合法 Team，角色 ≤ 2 人时）

角色 ≤ 2 人时仍使用 Team 模式，仅 spawn 1 Agent + world-manager。
world-manager 承担更重的施压职责（因为缺少角色间碰撞），但仍走**回合制**：Agent 每回合输出 1 个 beat，world-manager 每回合注入环境变化。

⚠️ **直写模式已废止**。Director 不再以全知视角直写——即使独角戏也必须通过 Agent + world-manager 的 Team 交互生成。

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
   - 🔴 **第三人称硬约束**：novel.md 必须是第三人称戏剧白描，Agent 的第一人称交互记录只能作为素材熔合，不能直接拼接（详见 compile-novel.md 的"硬约束 · 第三人称叙事视角"）

2. **AI 味检测 + 叙事视角检测**（确定性门控）
   - 调用 Critic 的 `check-ai-taste.js` 检测产出文本（破折号/独占段/C5 句式黑名单 + C6 第一人称叙述泄漏）
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

## Phase 4.5: 读者 Team（硬门控）

| 属性 | 值 |
|------|---|
| **类型** | 确定性（每集必跑，不可跳过） |
| **可用能力** | scripts/reader-panel.js / references/reader-panel-protocol.md |
| **FSM 状态** | simulating（保持） |

### 4 读者画像

| 画像 | 身份 | 关注点 | 打分风格 |
|------|------|--------|---------|
| 张哥 | 网文老书虫（男35） | 节奏/爽感/钩子密度 | 严苛（偏低 0.5-1 分） |
| 小悦 | 通勤追更党（女26） | 角色萌点/CP 张力/情绪共鸣 | 感性（偏高 0.5 分） |
| 林小姐 | 文学质感派（女32） | 语言/意象/留白/不做 Over-Connect | 稳定（几乎不偏） |
| 老周 | 出版编辑（男48） | 结构完整/市场性/是否想翻下一页 | 商业眼光（关注"卖不卖得动"） |

### 步骤

1. spawn 4 个 reader Task Agent（并行，max_turns: 10）
2. 每人独立阅读 novel.md + critic-report 摘要
3. 每人输出：打分（1-10）+ 3 条具体吐槽 + 2 条修订建议
4. 汇总均分

### 门控逻辑

- **均分 ≥ 8.0** → 直接进入 Phase 5（跳过 4.6-4.9）
- **7.0 ≤ 均分 < 8.0** → 触发 Phase 4.6 专家 Team
- **均分 < 7.0** → **硬阻断**，必须触发 Phase 4.6 → 4.7 → 4.8 → 4.9 修订环

### 输出

- `output/reader-panel-report.md`

---

## Phase 4.6: 专家 Team（按需触发）

| 属性 | 值 |
|------|---|
| **类型** | 按需（读者均分 <8.0 时触发 / 每 3 集强制触发 1 次） |
| **可用能力** | scripts/expert-panel.js / references/expert-panel-protocol.md |
| **FSM 状态** | simulating（保持） |

### 4 专家画像

| 画像 | 身份 | 专长 | 诊断风格 |
|------|------|------|---------|
| 老陈 | 资深编剧 | 结构/节奏/反转/反派线 | 直接犀利 |
| Q老师 | 悬疑小说家 | 诡计/线索/信息差/钩子 | 技术流 |
| 许教授 | 文学教授 | 意象/语言/身体诗学/留白 | 学术但实操 |
| K教练 | 写作教练 | 角色语言/对话/破防/沉默 | 手把手示范 |

### 步骤

1. spawn 4 个 expert Task Agent（并行，max_turns: 12）
2. 每人读 novel.md + reader-panel-report.md（知道读者的不满）
3. 每人输出：诊断（聚焦读者共识问题）+ 具体修改处方（含行号/段落定位）
4. 汇总冲突点

### 触发条件

- 读者均分 < 8.0（on-demand）
- 每 3 集强制触发 1 次（即使读者满意，确保长期方向不偏）
- 可被用户手动触发（"请专家看看"）

### 输出

- `output/expert-panel-report.md`

---

## Phase 4.7: Director 仲裁

| 属性 | 值 |
|------|---|
| **类型** | 确定性（有冲突必须裁决） |
| **FSM 状态** | simulating（保持） |

### 步骤

1. 读取 reader-panel-report.md + expert-panel-report.md
2. 识别"读者共识"（≥3 人一致的吐槽）与"专家共识"（≥3 人一致的处方）
3. 处理冲突（读者说好但专家说不好 → 读者体验优先）
4. 产出**修订指令清单**（每条指令含：问题描述 + 目标效果 + 建议改法 + 优先级）

### 仲裁优先级

```
读者共识（3+人一致） > 专家共识（3+人一致） > 单人极端意见
```

体验问题优先（"不好看"）> 技巧问题（"技术不规范"）

### 输出

- 修订指令清单（内存传递给 Phase 4.8，不单独落盘）

---

## Phase 4.8: 定向修订 Team

| 属性 | 值 |
|------|---|
| **类型** | 灵活（按指令改写正文） |
| **FSM 状态** | simulating（保持） |

### 步骤

1. 读取修订指令清单
2. 对每条指令 spawn 修订 Agent（或 Director 自行执行小修）
3. 修订 Agent 只改指定段落，保持其余文本不变
4. 产出修订后的 novel.md（覆盖原文件）
5. 记录修订 diff 摘要

### 约束

- 只改"共识必修"的问题，不做超范围润色
- 修订后必须重新过 Phase 3.1（check-ai-taste）确保不引入新问题
- 每轮修订改动量 ≤ 原文 30%（防止大改失控）

### 输出

- 更新后的 `output/novel.md`
- `output/revision-log.md`（修订记录）

---

## Phase 4.9: 回评（迭代环）

| 属性 | 值 |
|------|---|
| **类型** | 确定性（返回 Phase 3.1 重跑） |
| **FSM 状态** | simulating（保持） |

### 流程

```
修订后 novel.md → Phase 3.1 check-ai-taste
                → Phase 3.2 辅助门控
                → Phase 4 Critic 复评
                → Phase 4.5 读者 Team 复评
                → 判断：
                    均分 ≥ 7.0 → Phase 5
                    均分 < 7.0 且轮次 < 2 → 再走 4.6-4.8
                    均分 < 7.0 且轮次 = 2 → Director 强裁，进 Phase 5，wrap-report 标注
```

### 迭代上限

- **最多 2 轮**完整循环（4.5 → 4.6 → 4.7 → 4.8 → 回到 4.5）
- 第 3 轮 Director 强行裁决，记录理由写入 wrap-report
- 理由格式：`[FORCED] 读者均分 X.X，2 轮修订后仍未达标。Director 判定：{裁决理由}`

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

## Phase 6: 系列复盘（每 3 集触发）

| 属性 | 值 |
|------|---|
| **类型** | 按需（每 3 集触发 1 次 / 用户手动触发） |
| **可用能力** | scripts/series-retrospect.js |
| **FSM 状态** | wrapped → idle |

### 触发条件

- 当前集序号 % 3 === 0（如 EP03, EP06, EP09…）
- 或用户显式要求"系列回顾"/"复盘"

### 步骤

1. 回顾最近 3 集的 critic-report + reader-panel-report + expert-panel-report
2. spawn 读者 Team + 专家 Team 做"联合长评"（跨集视角）
3. 识别系列级问题（如节奏越来越慢 / 某角色弧线停滞 / 钩子积压未回收）
4. 产出长期建议，增量更新 `.codebuddy/rules/pro-advisory-notes.md` 的"待执行建议"
5. 更新 hooks-ledger.md + imagery-ledger.md 的全局状态

### 输出

- `pro-advisory-notes.md` 增量更新
- `series-retrospect-ep{XX}.md` 归档到当前集的 output/ 目录

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
