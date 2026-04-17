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
- 用户说"评审"/"打分"等时 → 加载 `drama-critic`（也可由 director 转发）

#### 生成流水线（必须完整执行）

```
Phase 1: 规划（选角带导演意识 + 创建四件套）
Phase 2: 导演（Team 委托 world-manager / 直写 + SOUL 对照）
Phase 3: 编译（novel.md / screenplay.md）
Phase 4: 评审（drama-critic，不可跳过）
Phase 5: 收尾（MEMORY + state + timeline + carry-over）
```

#### Critic 不可跳过原则

> GAN 架构核心：Generator（Director）和 Evaluator（Critic）必须分离。
> 每次生成后必须输出 `critic-report.md`。
> 🔴 Error 级别问题必须向用户标红提示。

#### Canon 保护

- `world/bible.md` 和 `agents/*/SOUL.yaml` 核心字段（id/name/archetype/trauma/motivation）为写保护
- 可更新字段：emotion.current、known_facts、relationships.trust、MEMORY.md、state.json、timeline.md
