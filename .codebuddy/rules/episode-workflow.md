### 单集工作流规则（跨故事通用）

本规则定义**所有故事**（`stories/<name>/`）共同遵守的集制作约定。具体故事名仅作内部验证样本，不在本规则中引用。

---

#### 集目录位置

- 每一集必须位于：`stories/<name>/episodes/<ep-id>/`
- `<ep-id>` 推荐命名：`ep01-<slug>` / `ep02-<slug>` ...（两位数序号 + 短横线 + 英文 slug）
- 跨故事引用禁止：`stories/A/` 下的任何文件**不得**引用 `stories/B/` 下的 agent / world / episodes

---

#### 每集必需件（六件套 · 新架构）

生成流水线完成后，`stories/<name>/episodes/<ep-id>/` 下必须存在：

| 文件 | 作用 | 生命周期 |
|---|---|---|
| `episode-brief.md` | 导演选角定调 + 本集任务交代 | Phase 1 产出 |
| `beat-sheet.md` | 编剧骨架（场景节拍 v3 + 三层动机 + 8 问自检 + 前集事实核对清单） | Phase 2 产出 |
| `output/novel.md` | 本集正文（小说形态） | Phase 3~5 产出（迭代） |
| `output/editor-review.md` | 责编 7 步 SOP 报告（5 视角 + 根因 + 修订指令） | Phase 4 产出（必需） |
| `output/reader-verdict.md` | 读者代表终审（会追下一集吗 + 1-10 分 + 3 理由） | Phase 5 产出（必需） |
| `wrap-report.md` | 本集落幕总结 + 回写 state / MEMORY 的依据 | Phase 6 收尾产出 |

可选（运行态/按需触发）：

- `runtime/interactions.jsonl`：Phase 3 Agent 交互记录（中间产物）
- `runtime/mystery-advisor-notes.md`：悬疑类故事 Phase 2 悬疑顾问意见
- `runtime/revision-log.md`：Phase 4 多轮修订时的定向 diff 记录
- `runtime/team-log.md`：Team spawn 序列记录（调试用）

---

#### 运行态文件（不入 canon）

下列文件为引擎运行态，**不属于 canon**，允许随时覆盖：

- `.fsm-state.json` / `.session.json`：流水线 FSM 状态
- `runtime/`：中间产物目录（临时 prompt / debug log / 对话快照）
- `*.tmp.md` / `*.draft.md`：草稿态

禁止把上述内容回写到：`world/bible.md`、`world/state.json`、`agents/**/SOUL.yaml` 的核心字段。

---

#### 流水线硬约束

1. **规划前快照**：任何覆盖式操作必须先调用
   ```
   node .codebuddy/skills/drama-world/scripts/snapshot.js create <ep-id> --story <name>
   ```

2. **Phase 2 编剧自检**：beat-sheet 的 8 问必须全部回答（内嵌在 beat-sheet 顶部的 `writer_self_check` 块）。6 条红线任中 1 条 → 编剧自己重写 beat-sheet。

3. **Phase 2 脚本门控**：`validate-beat-sheet.js` 必须通过（字数 ≥ 6000、8 问答案存在、三层动机完整）。

4. **Phase 4 不可跳过**：每次生成后必须输出 `editor-review.md`（责编 7 步 SOP）。详见 `drama-orchestration.md`。

5. **Phase 5 AI 味门控**：`check-ai-taste.js` 必须 `EXIT=0` 才能进入读者代表终审。

6. **Phase 5 读者代表不可跳过**：必须产出 `reader-verdict.md`，打分 < 7.0 按理由分流（情节问题回 Phase 2，语言问题回 Phase 4）。

7. **迭代上限**：Phase 4-5 循环最多 2 轮，第 3 轮 Director 强裁记录理由。

8. **wrap 前必须完成 check**：`wrap-report.md` 只能在责编打分 ≥ 7.0 且读者代表打分 ≥ 7.0 后生成（或已达 2 轮上限强行通过并标注）。

9. **直写模式已废止**：任何场景必须使用 Team 模式（最小 = 独幕演 1 Agent + 世界管家 + 表演指导）。

10. **EPxx 泄漏硬阻断**：`check-ai-taste.js` 的 A6 规则是 error 级，正文出现任何 `EP01/EP02/.../Episode 3` 立即阻断。详见 `writing-craft.md`。

---

#### 命名规范

| 对象 | 规范 | 示例 |
|---|---|---|
| 故事目录 | `stories/<kebab-case-name>/` | `stories/my-story/` |
| 集目录 | `<ep-id>`：`ep<两位数>-<slug>` | `ep01-opening` |
| Agent 目录 | `<tier>_<agent-id>`（`s_`/`a_`/`b_`）| `s_protagonist-liu` |
| Agent id 字段 | 与目录名去前缀后一致 | `protagonist-liu` |
| 章节标题（novel.md 内） | `# 第{中文数字}章 · {标题}` | `# 第一章 · 特赦` |

---

#### 产物写入位置（只写不改）

| 产物 | 写入路径 | 允许谁写 |
|---|---|---|
| 正文 | `stories/<name>/episodes/<ep-id>/output/novel.md` | drama-director（Phase 3 编译 + Phase 4 修订） |
| 责编报告 | `stories/<name>/episodes/<ep-id>/output/editor-review.md` | 责编 Agent（Phase 4） |
| 读者终审 | `stories/<name>/episodes/<ep-id>/output/reader-verdict.md` | 读者代表 Agent（Phase 5） |
| 修订记录 | `stories/<name>/episodes/<ep-id>/runtime/revision-log.md` | 文学顾问 Agent（Phase 4 多轮修订时） |
| 悬疑笔记 | `stories/<name>/episodes/<ep-id>/runtime/mystery-advisor-notes.md` | 悬疑顾问 Agent（Phase 2，悬疑类故事） |
| 集收尾 | `stories/<name>/episodes/<ep-id>/wrap-report.md` | drama-director（Phase 6） |
| 世界状态 | `stories/<name>/world/state.json` | drama-director（Phase 6 wrap，调 world.update-world） |
| 时间线 | `stories/<name>/world/timeline.md` | drama-director（Phase 6 wrap，调 world.update-world） |
| Agent 记忆 | `stories/<name>/agents/**/MEMORY.md` | drama-director（Phase 6 wrap，调 world.memory） |
| 钩子台账 | `stories/<name>/world/hooks-ledger.md` | 责编（Phase 4 wrap 前手工维护） |
| 意象台账 | `stories/<name>/world/imagery-ledger.md` | 文学顾问（Phase 4 wrap 前手工维护） |

> 其它 Skill / 脚本如需写入，必须说明理由并先做快照。
> **hooks-ledger 和 imagery-ledger 改为手工维护**——旧架构的自动化脚本已废弃，由班子成员在 Phase 4 末手动更新。

---

#### 与旧架构的主要变化

| 维度 | 旧架构 | 新架构 |
|---|---|---|
| Phase 数 | 10（含 1.5、4.5-4.9） | 6（线性） |
| 评审 Agent 数 | 9（4 读者 + 4 专家 + 1 Critic） | 2（责编 + 读者代表）+ 1 脚本（check-ai-taste） |
| 必需件 | 六件套含 reader-panel-report + critic-report | 六件套含 editor-review + reader-verdict |
| 写作知识 | 分散在 writing-craft.md + pro-advisory-notes.md | 沉淀在 `drama-director/references/craft/` 下 7 个文件 |
| 台账维护 | 脚本自动（hooks-ledger.js / imagery-ledger.js） | 班子手工（责编 + 文学顾问） |
| Token 预算 | ~62K/集 | ~41K/集（-34%，创作占比 24% → 67%） |
