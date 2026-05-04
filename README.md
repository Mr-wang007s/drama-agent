# Story Engine

> **AI Agent 驱动的艺术创作伙伴**
> 让一个人也能拥有一个电影剧组的创作能力

---

## 🎭 项目定位

Story Engine 不是一个"按按钮生成故事"的工具，而是一个由 AI 电影剧组组成的**创作伙伴**：

- 像一个**能在凌晨 3 点陪你吵剧本的编剧搭档**
- 像一个**读完草稿沉默半小时才开口的剧本医生**
- 像一群**能演出你笔下每个角色的即兴演员**

## 🎯 核心哲学

1. **天才放大器，而非平均值生成器** —— 保护用户的反规则创作
2. **格式塔诊断，而非规则匹配** —— 四遍阅读法的整体感知
3. **创作流程的呼吸感，而非流水线** —— Rewrite Loop + Table Read

## 🏗️ 项目结构

本项目基于 CodeBuddy IDE 的 Skills 体系搭建：

```
story-engine/
├── .codebuddy/
│   ├── rules/                      # 引擎信条（always apply）
│   │   └── engine-creed.md
│   └── skills/                     # 11 个创作剧组 Skill
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
├── projects/                       # 每个故事一个项目
│   └── _template/                  # 项目模板
├── docs/
│   └── workflow.md                 # 完整工作流说明
├── CODEBUDDY.md                    # 给 AI 的项目导览
├── plan.md                         # 项目规划文档
└── README.md
```

## 🚀 快速开始

### 1. 在 CodeBuddy IDE 中打开项目
Skills 会自动加载到 `.codebuddy/skills/`。

### 2. 启动第一个故事项目
在对话框中输入：

```
@creative-intent 我想写一个短篇：一个能听见死人说话的邮差
```

### 3. 跟随 10 步工作流
引擎会依次引导你：
1. 采集创作意图 (CreativeIntent)
2. Producer 对话式确认边界
3. Screenwriter 提议 3 个大纲方向
4. 协同打磨大纲
5. CastingDirector 生成角色 Agent
6. Director 调度第一场演绎
7. **TableRead** 角色朗读反馈 ⭐
8. 用户决策点
9. （可选）**RewriteLoop** 多轮重写
10. （可选）**ScriptDoctor** 四遍阅读诊断

## 📚 文档

- [项目规划 plan.md](./plan.md) —— 完整设计文档
- [工作流详解 docs/workflow.md](./docs/workflow.md)
- [引擎信条 .codebuddy/rules/engine-creed.md](./.codebuddy/rules/engine-creed.md)

## 🎬 引擎信条

> 1. We augment, we never replace.
> 2. The user's will is sacred.
> 3. Marked "intentional" means untouchable.
> 4. We amplify genius, not average taste.
> 5. End with questions, not verdicts.
> 6. Creation breathes; we don't pipeline it.
> 7. Characters aren't puppets, they're partners.
> 8. Great stories break rules; we protect the breaking.

---

**版本**：v2.0 MVP
**状态**：开发中
