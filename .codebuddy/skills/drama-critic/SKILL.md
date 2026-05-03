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
> 你只做一件事：跑 `check-ai-taste.js` · 返回 EXIT=0 或 EXIT=1。

---

## 职责

**唯一职责**：运行 `check-ai-taste.js` · 检测 A 级硬约束违反。

创作评估、打分、改进建议等职责全部归 drama-director 责编（加载 `craft/editing.md`）。

---

## 意图识别

| 用户意图 | 触发词 | 动作 |
|---|---|---|
| 检查 AI 味 | 查 AI 味、检查文风、check style、AI 味检测 | 运行 `check-ai-taste.js` |
| 自动门控 | （被 drama-director Phase 5 调用）| 同上 |

---

## 检测项（A 级硬约束）

| 规则 | 说明 | 级别 | 上限 |
|---|---|---|---|
| A1 破折号 | `——` 滥用 | error | ≤ 8 |
| A2 加粗 | `**...**` 正文禁用 | error | 0 |
| A3 标题 | `## / ###` 正文禁用 | error | 0 |
| A4 对偶句 | "不是 X，是 Y" | warning | ≤ 3 |
| A5 前集伪造 | 回指台词但前集 grep 不到 | error | 0 |
| A6 EPxx 泄漏 | 正文含 "EP01/EP02/..." | error | 0 |
| A7 章节内分节 | "一/二/三"/"（一）"/"Part 1" 独立段 | error | 0 |
| A8 `＊ ＊ ＊` 滥用 | 场景分隔线 | warning | ≤ 1 |
| C5.1-C5.10 | 10 条句式黑名单 | error/warning | 见 prose.md |

详细规则定义与修订建议见 `drama-director/references/craft/prose.md`。

---

## 调用方式

```bash
node .codebuddy/skills/drama-critic/scripts/check-ai-taste.js \
     --file stories/<name>/episodes/<ep-id>/output/novel.md
```

### 退出码

- **EXIT=0**：所有规则通过
- **EXIT=1**：至少一条 error 违反（阻断 Phase 5 · 回 Phase 4 修订）
- **EXIT=2**：参数错误

### 输出

脚本在 stderr 输出违反清单 · 每条标 规则 id + 行号 + 原文摘抄 · 末尾 SUMMARY 给 errors/warnings/exit 计数。

---

## 与 drama-director 的协作

```
drama-director Phase 5:
  Step 5.1: pre-compile-clean.js      （批量清理破折号/加粗/标题）
  Step 5.2: check-ai-taste.js         （AI 味硬门控）
    ├─ EXIT=0 → 进入终审读者 TEAM
    └─ EXIT=1 → 回 Phase 4 责编修订（最多 2 轮）
```

---

## Scripts

| 脚本 | 用途 |
|---|---|
| `scripts/check-ai-taste.js` | A 级硬约束 + C5.1-C5.10 句式黑名单机械检测 |

---

## 架构定位

Critic 是"一把手术刀"——做一件事 · 做得极致可靠。

GAN 架构核心：机械门控必须独立于创作者。这是 Critic 作为独立 Skill 存在的唯一理由。
