### DramaAgent 编排规则

#### 唯一入口

- `drama-director` 是叙事生成的**唯一入口 Skill**
- 用户说"续写"/"继续"/"生成"等时 → 加载 `drama-director`
- 用户说"查 AI 味"/"检查文风"等时 → 加载 `drama-critic`（仅机械门控）

#### 触发词边界（不重叠）

- **drama-world**：头脑风暴/新故事/创建角色/初始化/选角/校验/状态/回滚/快照/分级/丰富角色
- **drama-director**：续写/继续/生成下一集/模拟/跑一集/推进剧情/写新一集
- **drama-critic**：查 AI 味/检查文风（仅 AI 味机械门控）

> Director 不"转发"意图给其他 Skill。如果用户在 Director 加载后提出管理类请求，告知用户使用对应触发词。

#### 6 阶段创作流水线（豪华 8 人班子）

```
Phase 1: 导演独立选角定调（读 context + 选角 + 基调 + 快照 + init）
Phase 2: 创作班子开盘（编剧 + 悬疑顾问协作 → beat-sheet v3，含 8 问自检）
Phase 3: 大 Team 演绎（表演指导 + 世界管家 + 所有角色 Agent）
Phase 4: 责编内审 + 文学顾问润色（7 步 SOP，迭代 ≤ 2 轮）
Phase 5: AI 味门控 + 读者终审（check-ai-taste EXIT=0 + 读者代表 ≥ 7.0）
Phase 6: Wrap 收尾（调用 drama-world 能力 + 更新 hooks/imagery ledgers）
```

> ⚠️ **旧架构已废止**：Phase 1.5 预检 + Phase 4.5-4.9 三 Team 循环（读者 Team + 专家 Team + 仲裁 + 修订 + 回评）全部合并进责编的 7 步 SOP。
> 正文写作的硬约束详见 `.codebuddy/rules/writing-craft.md`（硬约束索引）+ `drama-director/references/craft/prose.md`（详细规范）。

#### 8 人创作班子编制

| 成员 | 类型 | 出场阶段 | 加载的 craft 文件 | 职责 |
|---|---|---|---|---|
| **导演**（主 Agent） | 主 | 全程 | workflow + roster | 选角、定基调、仲裁 |
| **编剧** | Task Agent | Phase 2 | conflict + scene-design + mystery | 写 beat-sheet v3（含 8 问自检） |
| **悬疑顾问** | Task Agent | Phase 2, 4 | mystery | 三铁律 + 钩子经济 + 线索三明治 |
| **表演指导** | Task Agent | Phase 3 | characterology + dialogue | 9 问激活 + 监控演绎质量 |
| **世界管家** | Task Agent | Phase 3 | team-protocol | 事件注入 + 信息裁判 + 场景节奏 |
| **责编** | Task Agent | Phase 4 | editing + prose + dialogue | 7 步 SOP 内审（吸收原 9 评审） |
| **文学顾问** | Task Agent | Phase 4（按需） | prose | 反 Over-Connect + 节奏润色 |
| **读者代表** | Task Agent | Phase 5 | **不加载** | 终审"会不会追下一集" |

详细定义见 `drama-director/references/team-roster.md`。

#### 责编吸收原 9 评审的原理

旧架构：4 读者 + 4 专家 + 1 Critic = 9 个评审 Agent
新架构：1 责编（多元视角）+ 1 读者代表（直觉）+ Critic 脚本门控

责编在 `editing.md` 第三节"多元思考"训练下，一人模拟 5 种视角：
- 网文读者（节奏党）
- 文学编辑（质感派）
- 出版编辑（商业）
- 资深剧作家（结构）
- 写作教练（角色对话）

Token 消耗：27K/集（旧）→ 7K/集（新），节省 74%。

#### 仲裁优先级

- 读者感受 > 专家技巧 > 原教条规则
- Phase 4 责编给出修订指令后，若文学顾问与责编分歧 → 责编裁决
- 若责编与编剧分歧（涉及 beat-sheet 回退）→ 导演裁决
- 迭代上限 2 轮（第 3 轮 Director 强行裁决并记录理由写入 wrap-report）

#### 责编不可跳过原则

> GAN 架构核心：Generator（创作班子）和 Evaluator（责编）必须分离。
> 每次生成后必须输出 `editor-review.md`。
> 🔴 critical/high 级别问题必须向用户标红提示。
> drama-critic 是工程合规检查（机械门控）；责编是创作合规检查（7 步 SOP）；读者代表是体验满意度（终审）。三者互补不替代。

#### AI 味门控不可跳过原则

> Phase 5 的 `check-ai-taste.js` EXIT=0 是**硬门控**——无论责编打多高分，脚本不过就阻断。
> 这是唯一的"脚本可靠反馈"门控（参考 Harness Engineering 理念）。

#### 读者代表不可跳过原则

> Phase 5 的读者代表做"会不会追下一集"的直觉终审。
> 读者代表**不加载任何 craft 文件**——保持纯直觉，防止异化为第二个责编。
> 打分 < 7.0 → 按理由分流（情节问题回 Phase 2，语言问题回 Phase 4）。

#### Canon 保护

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
