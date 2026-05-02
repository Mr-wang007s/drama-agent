---
description: |
  DramaAgent 单集工作流约束：所有故事共同遵守的集制作流程与产物规范。
  通用规则——路径一律使用 `stories/<name>/` 占位符，不绑定任何具体故事。
globs: "stories/**/episodes/**"
alwaysApply: true
---

### 单集工作流规则（跨故事通用）

本规则定义**所有故事**（`stories/<name>/`）共同遵守的集制作约定。具体故事名（如各个子目录名）仅作内部验证样本，不在本规则中引用。

---

#### 集目录位置

- 每一集必须位于：`stories/<name>/episodes/<ep-id>/`
- `<ep-id>` 推荐命名：`ep01-<slug>` / `ep02-<slug>` ...（两位数序号 + 短横线 + 英文 slug）
- 跨故事引用禁止：`stories/A/` 下的任何文件**不得**引用 `stories/B/` 下的 agent / world / episodes

---

#### 每集必需件（四件套）

生成流水线完成后，`stories/<name>/episodes/<ep-id>/` 下必须存在：

| 文件 | 作用 | 生命周期 |
|---|---|---|
| `episode-brief.md` | 本集目标 / 核心冲突 / 出场角色 / 字数预算 | Phase 1 规划阶段产出 |
| `beat-sheet.md` | 分场景节拍表 + 字数/行数预算 + **前集事实核对清单** | Phase 1 规划阶段产出 |
| `output/novel.md` | 本集正文（小说形态） | Phase 2~3 产出，Phase 3 清理 |
| `wrap-report.md` | 本集落幕总结 + 回写 state / MEMORY 的依据 | Phase 5 收尾产出 |

可选但推荐：

- `output/critic-report.md`：drama-critic 评审输出（Phase 4 产出，Error 级必修订）

---

#### 运行态文件（不入 canon）

下列文件为引擎运行态，**不属于 canon**，允许随时覆盖：

- `.fsm-state.json` / `.session.json`：流水线 FSM 状态
- `runtime/`：中间产物目录（临时 prompt / debug log / 对话快照）
- `*.tmp.md` / `*.draft.md`：草稿态

禁止把上述内容回写到：`world/bible.md`、`world/state.json`、`agents/**/SOUL.yaml` 的核心字段。

---

#### 流水线硬约束

1. **规划前快照**：任何覆盖式操作（如重新 init / 重写 brief）必须先调用
   ```
   node .codebuddy/skills/drama-world/scripts/snapshot.js create <ep-id> --story <name>
   ```
2. **Phase 3.1 门控**：`check-ai-taste.js` 必须 `EXIT=0` 才能进入 Phase 4（详见 `writing-craft.md`）
3. **Phase 4 不可跳过**：每次生成后必须输出 `critic-report.md`（详见 `drama-orchestration.md`）
4. **wrap 前必须完成 check**：`wrap-report.md` 只能在 critic 无 Error 后生成

---

#### 命名规范

| 对象 | 规范 | 示例 |
|---|---|---|
| 故事目录 | `stories/<kebab-case-name>/` | `stories/my-story/` |
| 集目录 | `<ep-id>`：`ep<两位数>-<slug>` | `ep01-opening` |
| Agent 目录 | `<tier>_<agent-id>`（`s_`/`a_`/`b_`）| `s_protagonist-liu` |
| Agent id 字段 | 与目录名去前缀后一致 | `protagonist-liu` |

---

#### 产物写入位置（只写不改）

| 产物 | 写入路径 | 允许谁写 |
|---|---|---|
| 正文 | `stories/<name>/episodes/<ep-id>/output/novel.md` | drama-director |
| Critic 报告 | `stories/<name>/episodes/<ep-id>/output/critic-report.md` | drama-critic |
| 集收尾 | `stories/<name>/episodes/<ep-id>/wrap-report.md` | drama-director (Phase 5) |
| 世界状态 | `stories/<name>/world/state.json` | drama-director (Phase 5 wrap) |
| 时间线 | `stories/<name>/world/timeline.md` | drama-director (Phase 5 wrap) |
| Agent 记忆 | `stories/<name>/agents/**/MEMORY.md` | drama-director (Phase 5 wrap) |

> 其它 Skill / 脚本如需写入，必须说明理由并先做快照。
