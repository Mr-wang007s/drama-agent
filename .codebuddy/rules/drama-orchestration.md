---
description: |
  DramaAgent 编排规则：叙事生成和评审的流程约束。
  确保 drama-director 的导演原则和 drama-critic 的评审不被跳过。
globs: "stories/**"
alwaysApply: true
---

### DramaAgent 编排规则

#### 唯一入口

- `drama-director` 是叙事生成的**唯一入口 Skill**
- 用户说"续写"/"继续"/"生成"等时 → 加载 `drama-director`
- 用户说"评审"/"打分"等时 → 加载 `drama-critic`

#### 触发词边界（不重叠）

- **drama-world**：头脑风暴/新故事/创建角色/初始化/选角/校验/状态/回滚/快照/分级/丰富角色
- **drama-director**：续写/继续/生成下一集/模拟/跑一集/推进剧情/写新一集
- **drama-critic**：评审/评估/打分/检查表演/查AI味/检查文风

> Director 不"转发"意图给其他 Skill。如果用户在 Director 加载后提出管理类请求，告知用户使用对应触发词。

#### 生成流水线（三 Team 循环增强·必须完整执行）

```
Phase 1:   规划（校验 + 快照 + 选角 + beat-sheet v2，含悬疑三铁律 + 前集事实核对清单）
Phase 1.5: Writing-Coach 预检（8 问审问 + 6 条打回判定，不通过则回 Phase 1 修订 beat-sheet）
Phase 2:   导演（强制 Team 模式：多 Agent 自由交互，最小合法 Team = 独幕演 1Agent + world-manager）
Phase 3.0: 编译前清理（pre-compile-clean.js 批量消除破折号/加粗/标题）
Phase 3.1: AI 味门控（check-ai-taste.js 含 C5.1-C5.10 必须 EXIT=0）
Phase 3.2: 辅助门控（dialogue-jaccard + imagery-ledger + hooks-ledger + breakdown-spec）
Phase 4:   评审（独立 drama-critic Task Agent，6 维度含读者吸引力 25%，不可跳过）
Phase 4.5: 读者 Team（4 画像并行打分，均分 <7.0 阻断，均分 ≥8.0 直接通过）
Phase 4.6: 专家 Team（4 顾问并行诊断，当读者均分 <8.0 时触发 / 每 3 集强制触发 1 次）
Phase 4.7: Director 仲裁（读者 vs 专家报告冲突裁决，产出修订指令清单）
Phase 4.8: 定向修订 Team（spawn 修订 Agent 按指令清单改写正文）
Phase 4.9: 回评（返回 Phase 3.1 重跑 → Phase 4.5 读者复查，≤2 轮迭代，第 3 轮 Director 强裁）
Phase 5:   收尾（MEMORY 有界写入 + state + timeline + wrap-report）
Phase 6:   系列复盘（每 3 集触发，读者+专家联合长评 → pro-advisory-notes 沉淀）
```

> ⚠️ **直写模式已废止**。角色 ≤2 人时使用"独幕演"（1 Agent + world-manager），仍为合法 Team。
> 正文写作的硬约束详见 `.codebuddy/rules/writing-craft.md`（A/B/C 级约束 + 悬疑三铁律 + 破防戏 R1-R5）。

#### 仲裁优先级

- 读者共识（≥3 人一致）> 专家共识（≥3 人一致）> 单人极端意见
- 迭代上限 2 轮（第 3 轮 Director 强行裁决并记录理由写入 wrap-report）
- 读者 vs 专家冲突时：读者体验优先（"好不好看"胜于"技巧是否规范"）

#### 读者 Team 不可跳过原则

> 三 Team 循环增强核心：演绎 Team（Generator）、读者 Team（Evaluator-1）、专家 Team（Evaluator-2）三者形成 GAN 对抗。
> 每次生成后**必须**经过读者 Team 打分。均分 <7.0 为硬阻断，不得绕过。
> 专家 Team 按需触发（读者均分 <8.0 或每 3 集强制），不可完全跳过。

#### Critic 不可跳过原则

> GAN 架构核心：Generator（Director）和 Evaluator（Critic）必须分离。
> 每次生成后必须输出 `critic-report.md`。
> 🔴 Error 级别问题必须向用户标红提示。
> drama-critic 是工程合规检查（Phase 4），读者 Team 是体验满意度检查（Phase 4.5），两者互补不替代。

#### Canon 保护

Canon 层 = 系列常量层，所有故事（`stories/<name>/`）共同遵守：

**写保护文件**

- `stories/<name>/world/bible.md`（世界圣经）
- `stories/<name>/agents/**/SOUL.yaml` 的核心身份字段：`id` / `name` / `archetype` / `trauma` / `motivation` / `secret`

**可更新字段**（非 canon）

- SOUL.yaml 内：`emotion.current` / `known_facts` / `relationships.trust`
- 文件级：`MEMORY.md` / `world/state.json` / `world/timeline.md`

**修改 canon 的原则**

- 修改 canon 字段时必须显式说明原因：世界观修订 / 角色弧线重置 / 关系改写。
- 不得将临时 run 结果、草稿台词、未经 Critic 验收的结论直接写进 canon。
- 单集新发现的长期设定应先入 `wrap-report.md`，在下一次 `drama-world` 维护操作中再决定是否回写 canon。
- 任何 canon 改动前必须先调用 `snapshot.js create` 做快照。
