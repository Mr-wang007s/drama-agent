---
description: |
  DramaAgent 编排规则：当用户发出叙事生成或评审请求时，必须按照完整流水线执行。
  确保 drama-director 的原则和 drama-critic 的评审不被跳过。
globs: "stories/**"
alwaysApply: true
---

### DramaAgent 编排规则

#### 叙事生成流程（必须完整执行）

当用户说"续写"、"继续"、"下一集"、"生成"、"模拟"、"推进剧情"等时：

1. **加载 `drama-orchestrator`** — 识别意图，确定参数
2. **Harness init** — 创建 episode 目录，快照状态
3. **Director 原则** — 加载 `drama-director`，确保：
   - 每个角色对照 SOUL.yaml 的 OCEAN + trauma + motivation
   - 内心独白体现 ghost/wound/lie/shield 创伤链
   - 对话匹配 voice.tone/rhythm/quirks
   - 秘密不被不合理泄露
   - trust 值影响关系亲密度表现
4. **内容编译** — 输出 novel.md 或 screenplay.md
5. **Critic 评审（不可跳过）** — 加载 `drama-critic`，五维评估，输出 critic-report.md
6. **Harness wrap** — 更新 MEMORY、state.json、timeline.md、carry-over

#### 评审请求

当用户说"评审"、"评估"、"打分"、"review"时：
- 直接加载 `drama-critic`，对最新一集执行独立评估

#### Critic 不可跳过原则

> 这是 GAN 架构的核心约束：Generator 和 Evaluator 必须分离且都执行。
> 每次生成新一集后，必须输出 `critic-report.md`。
> 如有 🔴 Error 级别问题，必须在回复中向用户标红提示。
