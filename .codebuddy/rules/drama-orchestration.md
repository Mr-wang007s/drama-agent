### DramaAgent 编排规则（v4）

#### 唯一入口

- `drama-director` 是叙事生成的**唯一入口 Skill**
- 用户说"续写"/"继续"/"生成"等时 → 加载 `drama-director`
- 用户说"查 AI 味"/"检查文风"等时 → 加载 `drama-critic`（仅机械门控）

#### 触发词边界（不重叠）

- **drama-world**：头脑风暴/新故事/创建角色/初始化/选角/校验/状态/回滚/快照/分级/丰富角色
- **drama-director**：续写/继续/生成下一集/模拟/跑一集/推进剧情/写新一集
- **drama-critic**：查 AI 味/检查文风（仅 AI 味机械门控）

> Director 不"转发"意图给其他 Skill。如果用户在 Director 加载后提出管理类请求，告知用户使用对应触发词。

#### 6 阶段创作流水线（v4 · 单点深度 Team）

```
Phase 1: 导演选角定调                                    [persona]
Phase 2: 创作班子开盘（内部 5 步）
  ├── 2.1 编剧起草 beat-sheet v0                        [persona]
  ├── 2.2 预读者盲测 → reader-preview.md                [persona]
  ├── 2.3 角色 writers-room 审骨架                       [TEAM 必须]
  ├── 2.4 编剧改稿 → beat-sheet v1                       [persona]
  └── 2.5 validate-beat-sheet 机械校验                   [脚本]
Phase 3: 演绎编译 novel.md                              [persona]
Phase 4: 责编内审 + 文学顾问润色                          [persona]
Phase 5: AI 味门控 + 终审读者                            [脚本 + TEAM]
Phase 6: Wrap 收尾                                      [脚本]
```

> **v4 核心变化**：
> - 对抗前置到 Phase 2（编剧 team 起草 → 角色 writers-room 审骨架 → 编剧改稿）
> - Phase 3 心脏戏 team 废止（回 persona 直写）
> - Phase 4 责编降级为 persona（对抗已在 Phase 2 完成）
> - Phase 5 终审读者 team 保留
> - Phase 2.2 预读者是新增闭环（读 reader-memory → 盲测骨架 → 给追更预测）
>
> 正文写作的硬约束详见 `.codebuddy/rules/writing-craft.md`（硬约束索引）+ `drama-director/references/craft/prose.md`（详细规范）。

#### v4 班子编制（创作 9 位）

| 成员 | spawn_mode | 出场阶段 | 加载的 craft 文件 | 职责 |
|---|---|---|---|---|
| **导演**（主 Agent）| main-agent | 全程 | workflow + roster | 选角、定基调、仲裁、断点恢复 |
| **编剧** | persona | Phase 2.1, 2.4 | conflict + scene-design + mystery + narrative-weight | 起草 + 吸收反馈改稿 |
| **预读者** | persona | Phase 2.2 | **不加载 craft**（只加载 reader-memory）| 盲测骨架 · 追更冲动预测（无评分）|
| **角色 Agent × N** | **TEAM 必须** | Phase 2.3 | 自己 SOUL + MEMORY + 个人 beat 摘要 | 审骨架 · 反对/争取/台词种子三问 |
| **悬疑顾问** | persona | Phase 2.1, 4 | mystery | 三铁律 + 钩子经济 |
| **表演指导** | persona | Phase 3（可选）| characterology + dialogue | performance-briefing（可选）|
| **责编** | persona（v4 降级）| Phase 4 | editing + prose + dialogue + narrative-weight | 8 步 SOP · 反流水账四禁 · 文本层审校 |
| **文学顾问** | persona | Phase 4（按需）| prose + narrative-weight | 按 order 润色 · 拒陈设补白 |
| **终审读者** | **TEAM 必须** | Phase 5 | **不加载 craft**（只加载 reader-memory）| 盲评正文 · 打分 · 更新 reader-memory |

详细定义见 `drama-director/references/team-roster.md`。

#### 反 persona 三标准（v4 收敛）

v3 曾把标准用在每个 Phase 是否 team；v4 收敛为"**只在 Phase 2.3 和 Phase 5 必须命中 3/3**"：

1. **身份独立性** — TA 的判断需要与作者视角分离？
2. **信息封闭性** — TA 应看不到某些内部文档？
3. **对抗性** — TA 的作用是挑毛病？

- Phase 2.3 角色审骨架：3/3 满命中 → TEAM 必须
- Phase 5 终审读者：3/3 满命中 → TEAM 必须
- 其余位置命中 ≤1 · persona 足够

> v3 → v4 最大的变化是**放弃"team 遍地开花"**：EP04-EP05 实战验证 Phase 3 心脏戏 team 被绕过、Phase 4 责编 team 分差 +0.3 一致、对抗未差异化。v4 把对抗前置到最便宜也最影响全局的 Phase 2。

#### 仲裁优先级（v4 更新）

- **读者感受 > 专家技巧 > 原教条规则**（不变）
- Phase 2.4 编剧吸收角色 objections 和预读者弃文风险点：
  - 若 canon 允许 · 必须采纳角色反对至少 1 条
  - 不采纳必须给理由写入 agent-audit-log.md 的"编剧综合意见"节
- Phase 4 责编给出 order 后 · 若文学顾问与责编分歧 → 责编裁决（persona 间沟通）
- 若编剧（Phase 2.4）与角色 objections 分歧升级 → 导演裁决
- 迭代上限：
  - Phase 2.3 writers-room 默认 1 轮（v4 新规）· 若 Phase 5 reader-预读者分差 ≤-1.5 · 下集升 2 轮
  - Phase 4 修订 ≤ 2 轮
  - Phase 4-5 循环 ≤ 2 轮

#### 责编不可跳过原则（v4 继承）

> 即使责编降级为 persona · Phase 4 仍不可跳过。
> 每次生成后必须输出 `editor-review.md`。
> 🔴 critical/high 级别问题必须向用户标红提示。
> 反流水账四禁由 persona 责编自律执行 · 等同硬约束。
> drama-critic 是工程合规检查（机械门控）；责编是创作合规检查（8 步 SOP）；终审读者是体验满意度（终审）。三者互补不替代。

#### AI 味门控不可跳过原则（v4 继承）

> Phase 5 的 `check-ai-taste.js` EXIT=0 是**硬门控**——无论责编打多高分，脚本不过就阻断。

#### 终审读者不可跳过原则（v4 继承 · 保留 team）

> Phase 5 的终审读者 **必须 spawn `drama-reader` team**（反 persona 三标准 3/3）。
> 严禁加载 craft / beat-sheet / editor-review / brief / wrap-report。
> **v4 新增**：严禁读 `runtime/reader-preview.md`（Phase 2.2 预读者产出）和 `runtime/agent-audit-log.md`（Phase 2.3 writers-room 产出）—— 两个"读者"互不通信。

#### v4 新增：读者-预读者分差预警

> `reader_score（Phase 5）` 与 `reader_preview（Phase 2.2）` 的"追更冲动预测"（换算为参考分）差值 ≤ -1.5：
> - 说明 Phase 2.2 预读者的判断严重偏离
> - 下一集 Phase 2.3 writers-room 升 2 轮
> - 原因通常是：骨架阶段的 reader-memory 已失效 / 预读者加载的 memory 有遗漏

#### Canon 保护（v4 继承）

Canon 层 = 系列常量层，所有故事（`stories/<name>/`）共同遵守：

**写保护文件**

- `stories/<name>/world/bible.md`（世界圣经）
- `stories/<name>/agents/**/SOUL.yaml` 的核心身份字段：`id` / `name` / `archetype` / `trauma` / `motivation` / `secret`

**可更新字段**（非 canon）

- SOUL.yaml 内：`emotion.current` / `known_facts` / `relationships.trust`
- 文件级：`MEMORY.md` / `world/state.json` / `world/timeline.md` / `world/hooks-ledger.md` / `world/imagery-ledger.md`

**修改 canon 的原则**

- 修改 canon 字段时必须显式说明原因：世界观修订 / 角色弧线重置 / 关系改写。
- 不得将临时 run 结果、草稿台词、未经责编验收的结论直接写进 canon。
- 单集新发现的长期设定应先入 `wrap-report.md`，在下一次 `drama-world` 维护操作中再决定是否回写 canon。
- 任何 canon 改动前必须先调用 `snapshot.js create` 做快照。

#### Phase 2.3 writers-room 信息封闭（v4 新增 · 硬约束）

每个 spawn 的角色 agent 的输入必须严格限制：

**允许**：
- 自己的 SOUL.yaml + MEMORY.md
- 该角色的个人 beat 摘要（`runtime/beats-<agent-id>.md`）

**禁止**：
- 其他角色的 SOUL / MEMORY / active_secret
- beat-sheet.md 全量 · writer_self_check / canon_check 全量
- episode-brief.md · reader-preview.md · agent-audit-log.md（含并行发言者）
- craft/*

违反封闭 = 作者视角污染 · Phase 2.3 产出失效 · 下一集 Phase 2.3 必须重开。
