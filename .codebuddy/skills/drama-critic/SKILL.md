---
name: drama-critic
description: |
  AI 味机械门控——Phase 5 的确定性硬门控执行者。
  仅做一件事：运行 check-ai-taste.js 检测正文是否违反 A 级硬约束（破折号/加粗/标题/EPxx 泄漏/C5.1-C5.10 句式黑名单）。
  当用户要求"查 AI 味"、"检查文风"时直接触发。
  被 drama-director 的 Phase 5 自动调用作为硬门控。
globs:
  - "stories/**"
  - "episodes/**"
---

# Drama Critic — AI 味机械门控

> 你是机械门控。你不做创作评估——**那是责编的工作（在 drama-director 的 Phase 4）**。
> 你只做一件事：跑 `check-ai-taste.js`，返回 EXIT=0 或 EXIT=1。

---

## 职责定位（新架构下的瘦身）

在重构前，Critic 承担了 6 维度创作评估 + AI 味检测。
重构后，创作评估职责**全部移交给责编**（加载 `drama-director/references/craft/editing.md`）。

Critic 现在的唯一职责：

**运行 `check-ai-taste.js`，检测 A 级硬约束违反**。

---

## 为什么保留独立 Skill

即使职责瘦身，Critic 仍需独立存在的原因：

1. **GAN 架构核心保证**：机械门控必须独立于创作者
2. **脚本所有者**：`check-ai-taste.js` 的维护归属明确
3. **可独立触发**：用户可直接说"查 AI 味"触发此 Skill（不走完整流水线）

---

## 意图识别

| 用户意图 | 触发词 | 动作 |
|---|---|---|
| 检查 AI 味 | 查 AI 味、检查文风、check style、AI 味检测 | 运行 `check-ai-taste.js` |
| 自动门控 | （被 drama-director Phase 5 调用） | 同上 |

---

## 检测项（A 级硬约束）

| 规则 | 说明 | 级别 | 上限 |
|---|---|---|---|
| A1 破折号 | `——` 滥用 | error | ≤ 8（硬上限） |
| A2 加粗 | `**...**` 正文禁用 | error | 0 |
| A3 标题 | `## / ###` 正文禁用 | error | 0 |
| A4 对偶句 | "不是 X，是 Y" | warning | ≤ 3 |
| A5 前集伪造 | 回指台词但前集 grep 不到 | error | 0 |
| A6 EPxx 泄漏 | 正文含 "EP01/EP02/..." | error | 0 |
| C5.1 | "他/她知道……" 开头段 | warning | ≤ 3 |
| C5.2 | "这一刻，……" | warning | ≤ 2 |
| C5.3 | "仿佛/好像/就像……一样" 堆叠 | warning | ≤ 4 |
| C5.4 | "某种（说不清的/莫名的）……" | error | ≤ 2 |
| C5.5 | "他不知道为什么……" | warning | ≤ 2 |
| C5.6 | "心里（涌起/升起/浮起）一股……" | error | ≤ 1 |
| C5.7 | "时间（仿佛/好像）（停止/静止）了" | error | 0 |
| C5.8 | "（深深地/重重地）吸了一口气" | warning | ≤ 2 |
| C5.9 | "眼眶（微微/不由自主地）泛红" | error | ≤ 1 |
| C5.10 | "嘴角（微微/不自觉地）上扬" | error | ≤ 1 |

详细规则定义与修订建议见 `drama-director/references/craft/prose.md` 第一节。

---

## 调用方式

### 命令行（Phase 5 自动 + 用户手动）

```bash
node .codebuddy/skills/drama-critic/scripts/check-ai-taste.js \
     --story <name> --episode <ep-id>
```

### 退出码

- **EXIT=0**：所有规则通过
- **EXIT=1**：至少一条 error 违反（阻断 Phase 5，回 Phase 4 修订）
- **EXIT=2**：参数错误

### 输出

脚本在 stderr 输出违反清单，格式：

```
❌ A1: 破折号 `——` 出现 12 次（上限 8）
  - L234: "他看着她——那双眼睛他认识。"
  - L445: "不是冷——是麻。"
  ...

⚠ A4: 对偶句 "不是 X，是 Y" 出现 5 次（上限 3）
  - ...

❌ A6: EPxx 元标记泄漏 3 处
  - L123: "...EP02 凌晨..."
  ...

SUMMARY:
  - errors: 2
  - warnings: 1
  - exit: 1
```

---

## 与 drama-director 的协作

```
drama-director Phase 5:
  Step 5.1: pre-compile-clean.js  （批量清理破折号/加粗/标题）
  Step 5.2: drama-critic 的 check-ai-taste.js  （硬门控）
    ├─ EXIT=0 → 进入读者代表终审
    └─ EXIT=1 → 回 Phase 4 责编修订（最多 2 轮）
```

---

## 不做的事（已移交）

以下职责**已全部移交给 drama-director 的责编**：

- ❌ 6 维度创作评估（人格一致性/创伤响应/语言保真度/内心外在张力/秘密保护/读者吸引力）
- ❌ 角色 SOUL 合规审查
- ❌ 创伤链触发合理性判断
- ❌ 秘密保护审查
- ❌ 打分（1-100）
- ❌ 改进建议
- ❌ critic-report.md 产出

**这些职责现在由责编在 Phase 4 执行**——责编加载 `editing.md + prose.md + dialogue.md`，通过 7 步 SOP 给出 `editor-review.md`。

---

## Scripts

| 脚本 | 用途 |
|---|---|
| `check-ai-taste.js` | A 级硬约束 + C5.1-C5.10 句式黑名单机械检测 |

---

## 历史变更

- **重构前**（旧架构）：Critic 承担 6 维度评审 + AI 味门控 + series 复盘
- **重构后**（新架构）：Critic **仅** 承担 AI 味门控。其他职责移交给 drama-director 的专业班子（编剧/责编/文学顾问）

精简后的 Critic 是"一把手术刀"——做一件事，做得极致可靠。
