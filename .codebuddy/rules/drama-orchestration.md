---
description: |
  DramaAgent 编排规则：叙事生成和评审的流程约束。
  确保 drama-director 的导演原则和 drama-critic 的评审不被跳过。
globs: "stories/**"
alwaysApply: true
---

### DramaAgent 编排规则

#### 唯一入口

- `drama-director` 是叙事生成的**唯一入口 Skill**
- 用户说"续写"/"继续"/"生成"等时 → 加载 `drama-director`
- 用户说"评审"/"打分"等时 → 加载 `drama-critic`

#### 触发词边界（不重叠）

- **drama-world**：头脑风暴/新故事/创建角色/初始化/选角/校验/状态/回滚/快照/分级/丰富角色
- **drama-director**：续写/继续/生成下一集/模拟/跑一集/推进剧情/写新一集
- **drama-critic**：评审/评估/打分/检查表演/查AI味/检查文风

> Director 不"转发"意图给其他 Skill。如果用户在 Director 加载后提出管理类请求，告知用户使用对应触发词。

#### 生成流水线（必须完整执行）

```
Phase 1: 规划（校验 + 快照 + 选角 + beat-sheet，含"前集事实核对清单"）
Phase 2: 导演（Team 模式：多 Agent 自由交互；或直写模式）
Phase 3.0: 编译前清理（pre-compile-clean.js 批量消除破折号/加粗/标题）
Phase 3.1: AI 味门控（check-ai-taste.js 必须 EXIT=0）
Phase 4: 评审（独立 drama-critic Task Agent，prompt 含连续性核对指令，不可跳过）
Phase 5: 收尾（MEMORY 有界写入 + state + timeline + wrap-report）
```

> 正文写作的硬约束详见 `.codebuddy/rules/writing-craft.md`（A/B 级约束 + Director 必做清单 + 常见陷阱示例）。

#### Critic 不可跳过原则

> GAN 架构核心：Generator（Director）和 Evaluator（Critic）必须分离。
> 每次生成后必须输出 `critic-report.md`。
> 🔴 Error 级别问题必须向用户标红提示。

#### Canon 保护

- `world/bible.md` 和 `agents/*/SOUL.yaml` 核心字段（id/name/archetype/trauma/motivation）为写保护
- 可更新字段：emotion.current、known_facts、relationships.trust、MEMORY.md、state.json、timeline.md
