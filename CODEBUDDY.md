# CODEBUDDY.md

本文件帮助 CodeBuddy AI 理解 Story Engine 项目的结构与工作流。

## 项目定位

**Story Engine** 是一个基于 CodeBuddy Skills 体系搭建的 AI 艺术创作伙伴。它模拟一个电影剧组的工作流来帮助用户创作长篇故事——但核心定位不是"生成器"，而是"伙伴"。

## 项目关键信息

- **语言**：TypeScript（未来可能引入的执行层）+ Markdown（当前 Skill 配置）
- **运行载体**：CodeBuddy IDE 的 Skills 体系
- **工作目录**：`projects/<项目名>/`（每个故事一个独立项目）

## 目录结构

```
.
├── .codebuddy/
│   ├── rules/
│   │   └── engine-creed.md         # 引擎信条（always apply，最高约束）
│   └── skills/                     # 11 个 Skill
│       ├── creative-intent/        # L0 意志层
│       ├── producer/               # L1 共创层
│       ├── screenwriter/
│       ├── story-consultant/
│       ├── casting-director/       # L2 演绎层
│       ├── director/
│       ├── script-supervisor/
│       ├── table-read/             # L3 反思层 ⭐
│       ├── rewrite-loop/           # ⭐
│       ├── editor/
│       └── script-doctor/          # L4 诊断层 ⭐
├── projects/
│   └── _template/                  # 新项目目录模板
├── docs/
│   └── workflow.md                 # 完整 10 步工作流
├── plan.md                         # 项目规划文档（核心）
└── README.md
```

## 11 个 Skill 的调用顺序

```
creative-intent        # 先倾听：采集创作意图
       ↓
producer               # 朋友式确认边界
       ↓
screenwriter           # 给 3 个大纲方向 → 协同打磨
       ↓
story-consultant       # （可选）第二意见审大纲
       ↓
casting-director       # 一个个捏角色（SOUL+MEMORY+STYLE+ARC）
       ↓
script-supervisor      # Pre-check：预标连贯性风险点
       ↓
director               # 只给开场，让角色 Agent 即兴演绎
       ↓
table-read  ⭐         # 角色自己朗读反馈（v2 灵魂环节）
       ↓
[用户 Checkpoint]      # 每一场都要用户拍板
       ↓
（所有场次完成后）
       ↓
rewrite-loop  ⭐       # Bone / Flesh / Breath 三遍重写
       ↓
script-doctor  ⭐      # 四遍阅读法，提问不下判决
       ↓
editor                 # 贯穿全程，最终组装
```

## 三大设计哲学（引擎信条）

所有 Skill 必须遵守 `.codebuddy/rules/engine-creed.md`：

1. **天才放大器，非平均值生成器** —— 保护用户的反规则创作
2. **格式塔诊断，非规则匹配** —— 四遍阅读法
3. **呼吸感创作流程，非流水线** —— 允许暂停、非线性

## 关键约定

### intent.json 是最高约束

每个 `projects/<项目名>/intent.json` 中的 `intentionalDeviations` 和 `sacredElements` 字段，**所有 Skill 永不修复**。

### 所有 Skill 是建议者不是决策者

- 永远给 ≥ 2 个选项
- 永远以疑问句结尾
- 永远把决策权还给用户

### 角色 Agent 是独立实体

`projects/<项目名>/agents/<角色名>.json` 中定义的 SOUL + MEMORY + STYLE + ARC + guardrails 必须被尊重。角色可以"拒绝"剧本中违反 SOUL 的行为。

## 新建一个故事项目的步骤

1. 在 `projects/` 下创建新目录（建议复制 `_template`）
2. 用户在对话框调用 `@creative-intent` 开始采集意图
3. 跟随 Skill 链条逐步推进
4. 最终产出在 `projects/<项目名>/out/final-story.md`

## 开发状态

- ✅ 11 个 Skill 已完成 SKILL.md 定义
- ✅ 引擎信条已固化为 always-apply 规则
- 🚧 项目模板与 Demo 故事（邮差）进行中
- 🔜 可选的 TypeScript 执行层（用于 Agent 状态管理）

## 不要做的事

1. ❌ 不要在 Skill 的 SKILL.md 里加入"自动修复"逻辑
2. ❌ 不要跳过用户 Checkpoint
3. ❌ 不要在 `intent.json` 的 `sacredElements` 上做任何修改
4. ❌ 不要让 Skill 之间直接串行执行——每一步都要用户参与
5. ❌ 不要让 AI 的输出"很 AI"（平均、通顺、无个性）

## 参考文档

- [plan.md](./plan.md) —— 完整项目规划
- [docs/workflow.md](./docs/workflow.md) —— 10 步工作流详解
- [.codebuddy/rules/engine-creed.md](./.codebuddy/rules/engine-creed.md) —— 引擎信条
