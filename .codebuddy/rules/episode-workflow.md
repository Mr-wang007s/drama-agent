### 单集工作流规则（跨故事通用 · v4）

本规则定义**所有故事**（`stories/<name>/`）共同遵守的集制作约定。具体故事名仅作内部验证样本，不在本规则中引用。

---

#### 集目录位置

- 每一集必须位于：`stories/<name>/episodes/<ep-id>/`
- `<ep-id>` 推荐命名：`ep01-<slug>` / `ep02-<slug>` ...（两位数序号 + 短横线 + 英文 slug）
- 跨故事引用禁止：`stories/A/` 下的任何文件**不得**引用 `stories/B/` 下的 agent / world / episodes

---

#### 每集必需件（六件套 · v4）

生成流水线完成后，`stories/<name>/episodes/<ep-id>/` 下必须存在：

| 文件 | 作用 | 生命周期 | 字数上限（v4.1）|
|---|---|---|---:|
| `episode-brief.md` | 导演选角定调 + writers-room 成员 + reader-memory 硬需求映射 | Phase 1 产出 | **1500 · error** |
| `beat-sheet.md` | 编剧骨架 v1（scene_weight 三项 + agent_voices + reader_preview_notes + 核心一句话 + 情绪弧线 + 8 问自检）| Phase 2.4 产出 | **2500 · error** |
| `output/novel.md` | 本集正文（小说形态） | Phase 3-4 产出（迭代） | position 区间（非 quota）|
| `output/editor-review.md` | 责编 persona 8 步 SOP 报告（含 Step 5.5 诊断前置 · 反流水账四禁） | Phase 4 产出（必需） | **1200 · warning** |
| `output/reader-verdict.md` | 终审读者 team 盲评（10 项 + 下集硬需求） | Phase 5 产出（必需） | **1500 · warning** |
| `wrap-report.md` | 本集落幕总结（含 v4 架构数据）+ 回写 state / MEMORY 的依据 | Phase 6 收尾产出 | **1200 · warning** |

v4 新增可选运行态产物：

- **`runtime/reader-preview.md`** · **v4 新增**：Phase 2.2 预读者 persona 盲测骨架的追更预测（无评分）· 上限 **800 · error**
- **`runtime/agent-audit-log.md`** · **v4 新增**：Phase 2.3 writers-room 各角色独立发言记录（反对 + 争取 + 台词种子 + 编剧综合意见）· 上限 **1500 · error**
- **`runtime/beats-<agent-id>.md`** · **v4 新增**：Phase 2.3 每个 writers-room 成员的个人 beat 摘要（信息封闭用 · 只含该角色出现的场）· 上限 **400 · error**（每文件独立计算）

其他可选：
- `runtime/mystery-advisor-notes.md`：悬疑类故事 Phase 2.1 悬疑顾问意见
- `runtime/performance-briefing.md`：Phase 3 前表演指导 9 问激活 checklist（v4 可选）
- `runtime/revision-log.md`：Phase 4 多轮修订 diff 记录
- **`runtime/architecture-notes.md`**（v4.1 新增 · 非六件套 · 不计入配额）：架构级复盘（架构首跑 / 实验记录 / token 实测等元数据）· 按需创建 · 软上限 ~800 字

跨集：
- `stories/<name>/runtime/reader-memory.md`：终审读者跨集连载感积累（Phase 2.2 预读者**读** · Phase 5 终审读者**写**）

**⚠️ 字数配额唯一事实源**：workflow.md "## 非 novel 产物字数配额"节。所有 8 产物配额由 `validate-episode-artifacts.js` 在 Phase 5 → 6 之间强制门控。详见下方硬约束第 14 条。

---

#### 运行态文件（不入 canon）

下列文件为引擎运行态，**不属于 canon**，允许随时覆盖：

- `.fsm-state.json` / `.session.json`（含 v4 新字段 `sub_phase`）：流水线 FSM 状态
- `runtime/`：中间产物目录（临时 prompt / debug log / 对话快照 / v4 新增的 reader-preview / agent-audit-log / beats-* ）
- `*.tmp.md` / `*.draft.md`：草稿态

禁止把上述内容回写到：`world/bible.md`、`world/state.json`、`agents/**/SOUL.yaml` 的核心字段。

---

#### 流水线硬约束（v4）

1. **规划前快照**：任何覆盖式操作必须先调用
   ```
   node .codebuddy/skills/drama-world/scripts/snapshot.js create <ep-id> --story <name>
   ```

2. **Phase 2.1 编剧自检**：beat-sheet v0 的 8 问必须全部回答（内嵌在 beat-sheet 顶部的 `writer_self_check` 块）。6 条红线任中 1 条 → 编剧自己重写。

3. **Phase 2.2 预读者不打分**：`reader-preview.md` 只给追更冲动预测 + 弃文风险 · **禁止**给具体评分（评分是 Phase 5 终审读者的活）。

4. **Phase 2.3 writers-room TEAM 必须**：S/A 级出场角色必须 spawn `drama-character` × N · 并行发言 · 信息封闭（见 drama-orchestration.md "Phase 2.3 信息封闭"节）· 严禁 persona 分饰多角。

5. **Phase 2.4 编剧综合意见**：`agent-audit-log.md` 必须有"编剧综合意见"节 · 每条角色 objection 都有采纳或不采纳 + 理由。

6. **Phase 2.5 脚本门控**：`validate-beat-sheet.js` 必须通过（字数按 position 分级、8 问答案存在、三层动机、scene_weight ≥80%）。v4 新增 `agent_voices` / `reader_preview_notes` 软约束（缺失 warning 不阻断 · 保证 v3 旧集兼容）。

7. **Phase 3 回 persona 直写**：v4 废止 Phase 3 心脏戏 team · 主 agent/编剧 persona 按 beat-sheet 顺序编译。角色台词从 `agent_voices.dialogue_seeds` 原话落地或轻微润色。

8. **Phase 4 责编 persona**：v4 责编降级为主 agent persona 加载 `craft/editing.md`。每次生成后必须输出 `editor-review.md`（反流水账四禁硬约束继承）。

9. **Phase 5 AI 味门控**：`check-ai-taste.js` 必须 `EXIT=0` 才能进入终审读者。

10. **Phase 5 终审读者 TEAM 必须**：必须 spawn `drama-reader` · 严禁加载 craft / beat-sheet / editor-review / brief / wrap-report / **reader-preview.md** / **agent-audit-log.md**（两读者互不通信）。

11. **迭代上限**：
    - Phase 2.3 writers-room 默认 1 轮 · reader_score - preview 分差 ≤-1.5 时下集升 2 轮
    - Phase 4 修订 ≤ 2 轮
    - Phase 4-5 循环 ≤ 2 轮

12. **wrap 前必须完成 check**：`wrap-report.md` 只能在责编打分 ≥ 7.0 且终审读者打分 ≥ 7.0 后生成（或已达上限强行通过并标注）。`wrappedEpisodes[].architecture` 必须标记 `director-v4-deep-team`。

13. **EPxx 泄漏硬阻断**：`check-ai-taste.js` 的 A6 规则是 error 级 · 正文出现任何 `EP01/EP02/.../Episode 3` 立即阻断。详见 `writing-craft.md`。

14. **Artifacts 配额门控**（v4.1 新增 · Phase 5 → 6 之间硬门控）：进 Phase 6 wrap 之前必须跑：
    ```
    node .codebuddy/skills/drama-director/scripts/validate-episode-artifacts.js --story <name>
    ```
    **EXIT=0** 才允许进 Phase 6。error 级超量（brief / beat-sheet / reader-preview / agent-audit-log / beats-*）直接阻断；warning 级超量（editor-review / reader-verdict / wrap-report）允许继续但必须在 wrap-report 注明超量原因。配额表见 workflow.md "## 非 novel 产物字数配额"节。

---

#### 命名规范

| 对象 | 规范 | 示例 |
|---|---|---|
| 故事目录 | `stories/<kebab-case-name>/` | `stories/my-story/` |
| 集目录 | `<ep-id>`：`ep<两位数>-<slug>` | `ep01-opening` |
| Agent 目录 | `<tier>_<agent-id>`（`s_`/`a_`/`b_`）| `s_protagonist-liu` |
| Agent id 字段 | 与目录名去前缀后一致 | `protagonist-liu` |
| Team 名（v4）| `ep<XX>-writers-room`（Phase 2.3）· `ep<XX>-reader`（Phase 5）| `ep06-writers-room` |
| 章节标题（novel.md 内） | `# 第{中文数字}章 · {标题}` | `# 第一章 · 特赦` |

---

#### 产物写入位置（v4 · 只写不改）

| 产物 | 写入路径 | 允许谁写 |
|---|---|---|
| 正文 | `stories/<name>/episodes/<ep-id>/output/novel.md` | drama-director persona（Phase 3 编译 + Phase 4 修订） |
| 责编报告 | `stories/<name>/episodes/<ep-id>/output/editor-review.md` | 责编 persona（Phase 4 · v4 降级） |
| 终审读者 | `stories/<name>/episodes/<ep-id>/output/reader-verdict.md` | `drama-reader` team（Phase 5） |
| **预读者 preview** | `stories/<name>/episodes/<ep-id>/runtime/reader-preview.md` | 预读者 persona（Phase 2.2 · **v4 新增**） |
| **writers-room audit** | `stories/<name>/episodes/<ep-id>/runtime/agent-audit-log.md` | Phase 2.3 `drama-character` × N 回传 · team-lead 落盘（**v4 新增**） |
| **个人 beat 摘要** | `stories/<name>/episodes/<ep-id>/runtime/beats-<agent-id>.md` | team-lead（Phase 2.3 预生成 · **v4 新增**） |
| 悬疑笔记 | `stories/<name>/episodes/<ep-id>/runtime/mystery-advisor-notes.md` | 悬疑顾问 persona（Phase 2.1）|
| 表演 briefing | `stories/<name>/episodes/<ep-id>/runtime/performance-briefing.md` | 表演指导 persona（Phase 3 · 可选）|
| 修订记录 | `stories/<name>/episodes/<ep-id>/runtime/revision-log.md` | 文学顾问 persona（Phase 4 多轮修订时）|
| 集收尾 | `stories/<name>/episodes/<ep-id>/wrap-report.md` | drama-director（Phase 6） |
| 世界状态 | `stories/<name>/world/state.json` | drama-director（Phase 6 wrap）|
| 时间线 | `stories/<name>/world/timeline.md` | drama-director（Phase 6 wrap）|
| Agent 记忆 | `stories/<name>/agents/**/MEMORY.md` | drama-director（Phase 6 wrap）|
| 钩子台账 | `stories/<name>/world/hooks-ledger.md` | 责编 persona（Phase 6 wrap 前）|
| 意象台账 | `stories/<name>/world/imagery-ledger.md` | 文学顾问 persona（Phase 6 wrap 前）|
| **跨集 reader-memory** | `stories/<name>/runtime/reader-memory.md` | `drama-reader` team（Phase 5 追加 · 不覆盖历史）|

> 其它 Skill / 脚本如需写入，必须说明理由并先做快照。

---

#### v3 → v4 主要变化

| 维度 | v3 | **v4** |
|---|---|---|
| Phase 数 | 6（线性）| 6（Phase 2 内部分裂为 2.1-2.5）|
| TEAM 位 | 3（Phase 3 心脏戏 + Phase 4 责编 + Phase 5 读者）| **2**（Phase 2.3 writers-room + Phase 5 终审读者）|
| 对抗位置 | Phase 3-5 分散 | **Phase 2 集中**（对抗前置）|
| 预读者 | 无 | **Phase 2.2 persona 新增**（闭环 reader-memory）|
| 新增运行态 | team-play-log.md | **reader-preview.md / agent-audit-log.md / beats-*.md** |
| 心脏戏 team | 必须 | **废止**（回 persona）|
| 责编 team | 必须 | **persona**（降级）|
| beat-sheet 新字段 | scene_weight + 核心一句话 + 情绪弧线 | + **agent_voices** + **reader_preview_notes** |
| architecture 标记 | `director-v3-team` / `director-v3-hybrid` | `director-v4-deep-team` |
| 迭代规则 | 固定 | Phase 2.3 根据 reader-preview 分差动态 1-2 轮 |
| Token/集 | ~41K | ~40K（接近 · 但对抗前置 ROI 更高）|
