# 🚀 快速启动指南

> 5 分钟开始你的第一个 Story Engine 故事项目

---

## 前置条件

- ✅ 在 CodeBuddy IDE 中打开本项目
- ✅ 确保 `.codebuddy/skills/` 下 11 个 Skill 都已加载
  - 方法：打开 CodeBuddy 设置 → Skills → 查看项目级 Skills 列表

如果 Skills 没有自动加载，重启 CodeBuddy IDE 或新建对话。

---

## 方式一：手动步骤（推荐新手）

### 第 1 步：创建项目目录

```bash
cp -r projects/_template projects/my-first-story
```

### 第 2 步：打开 Craft 或 Plan 模式

在 CodeBuddy 对话框，选择 **Craft 模式**（推荐）或 **Plan 模式**。

### 第 3 步：启动创作

输入第一句话：

```
@creative-intent 我想写一个短篇：一个能听见死人说话的邮差。
请把结果存到 projects/my-first-story/intent.json
```

Story Engine 会开始引导你完成 10 步工作流。

---

## 方式二：一句话启动（进阶）

```
我想用 Story Engine 写一个短篇，核心种子是"<你的一句话 idea>"。
请按照 docs/workflow.md 的 10 步工作流引导我，
从 @creative-intent 开始，逐步调用各个 Skill。
项目目录用 projects/<项目名>/。
```

AI 会自动创建项目目录并按顺序调用所有 Skill。

---

## 方式三：极简尝试（仅体验核心环节）

如果只想快速体验，可以跳过可选步骤：

```
creative-intent → screenwriter → casting-director →
director → table-read → editor
```

约 30 分钟可产出一个 3000-5000 字的短稿。

---

## 11 个 Skill 快速索引

| Skill | 用途 | 何时用 |
|-------|------|--------|
| `@creative-intent` | 采集创作意图 | **必须第一步** |
| `@producer` | 确认项目边界 | 采集完意图 |
| `@screenwriter` | 给 3 个大纲方向 | Spec 定了 |
| `@story-consultant` | 第二意见审大纲 | 可选 |
| `@casting-director` | 捏角色 Agent | 大纲定了 |
| `@script-supervisor` | 连贯性守护 | 贯穿演绎 |
| `@director` | 调度演绎 | 角色立了 |
| `@table-read` | 角色朗读反馈 | 每场演完 |
| `@rewrite-loop` | 多轮重写 | 所有场演完 |
| `@script-doctor` | 四遍阅读诊断 | 重写后（可选）|
| `@editor` | 最终组装 | 所有 final 就绪 |

---

## 常见问题

### Q1：为什么每个 Skill 都让我做选择？
**A**：这是 Story Engine 的核心哲学——你是 Boss，AI 是伙伴。
查看 [engine-creed.md](../.codebuddy/rules/engine-creed.md) 了解更多。

### Q2：AI 一直在"问问题"，不写内容怎么办？
**A**：这是设计。前 3-4 步是"倾听和确认"，真正的生成从 `@director` 才开始。
如果你觉得问得太多，在 `@creative-intent` 的 Q5 选 **quiet 模式**。

### Q3：我不喜欢 Screenwriter 给的 3 个方向，怎么办？
**A**：直接说"都不是，我想要第四种"或描述你想要的方向。
Screenwriter 不会坚持原方案。

### Q4：可以跳过某些 Skill 吗？
**A**：可以。可选的有：`story-consultant`、`rewrite-loop`、`script-doctor`。
但 `creative-intent` 是必须的——它决定了所有后续 Skill 的约束。

### Q5：我的"刻意反规则"设计会不会被 AI"修正"？
**A**：**绝对不会**。只要你在 `intent.json` 的 `intentionalDeviations` 或 `sacredElements` 中标明，所有 Skill 都**永不触碰**。
这是 [engine-creed.md 信条 #3](../.codebuddy/rules/engine-creed.md) 的硬约束。

### Q6：AI 的反馈让我觉得被打扰，怎么调整？
**A**：在 `@creative-intent` 的 Q5 选：
- **quiet**：AI 只在你问时说话
- **active**：AI 主动建议（默认）
- **wild**：AI 频繁抛灵感

### Q7：我写一半想停下来，明天再继续？
**A**：完全可以。所有 Skill 的产出都在 `projects/<项目名>/` 里。
明天打开 CodeBuddy，输入：
```
我想继续 projects/<项目名> 的创作，现在到哪一步了？
```
AI 会读取项目状态并告诉你。

---

## 下一步

- 📖 阅读 [完整工作流文档](./workflow.md)
- 🎭 了解 [引擎信条](../.codebuddy/rules/engine-creed.md)
- 📐 查看 [项目规划文档](../plan.md)

---

**祝你创作愉快。**
