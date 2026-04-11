# DramaAgent — 产品需求文档（PRD）

> **版本**：v2.0  
> **日期**：2026-04-11  
> **分支**：`feat/multi-agent`  
> **状态**：架构升级——从手工管线到 Multi-Agent 自动演绎  
> **仓库**：`D:\codespace\drama-agent`

---

## 变更记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-04-11 | 初版 PRD，DramaSpec + Harness + Multi-Agent 三层公式 |
| **v2.0** | **2026-04-11** | **架构简化为 Harness + Multi-Agent；Multi-Agent 基于 WorkBuddy team agent 实现；砍掉 DramaSpec 重型规格流程** |

---

## 1. 产品概述

### 1.1 一句话定义

DramaAgent 是一个基于 **Harness + Multi-Agent** 的连载剧情自动生产系统——用户提供系列设定和角色卡，多个 AI Agent 以剧组协作的方式自主演绎出完整剧本。

### 1.2 产品愿景

**一条命令，一集剧本。** 用户只需准备好世界观和角色，剩下的交给 Agent 剧组——导演分场、角色演戏、旁白润色、质量验收，全自动完成。

### 1.3 核心公式（v2.0 更新）

```
DramaAgent = Harness（工程层） + Multi-Agent（执行层）
```

v1.0 → v2.0 的关键变化：

| 维度 | v1.0 | v2.0 |
|------|------|------|
| 规格层 | DramaSpec 手工填充 brief/beat/spec | **Agent 自动生成**，人类只审不写 |
| 工程层 | CLI 八命令 + 校验脚本 | **Harness 简化**：保留状态管理和 canon 保护，砍掉冗余流程 |
| 执行层 | 人工/单 Agent 包办 | **WorkBuddy Team Agent**：导演/角色/旁白/质量四角色并行协作 |

---

## 2. 背景与动机

### 2.1 v1.0 的问题

v1.0 MVP 验证了工程管线的可行性，但暴露了一个根本问题：

> **管线通了，但管线里跑的是手工内容，不是 Agent 产出。**

具体表现：
- 八命令 CLI 流程繁琐（new → brief → run → scene → check → wrap），每步都需要人工填充
- DramaSpec 四件套（brief/beat/spec/tasks）大量模板化文本，投入产出比低
- 没有真正的 Multi-Agent 协作——单 Agent 包办了导演、角色、旁白、质量所有职责

### 2.2 v2.0 的核心洞察

**让 Agent 做 Agent 擅长的事，让工程做工程擅长的事。**

- **Harness 负责**：状态管理、canon 保护、快照回滚、carry-over 传递、质量校验
- **Agent 负责**：分场、写对话、演冲突、润文笔——这些本来就是 LLM 最擅长的事

### 2.3 技术选型变更

| ADR | v1.0 决策 | v2.0 变更 | 理由 |
|-----|----------|----------|------|
| ADR-001 | 三层架构（导演/角色/叙事） | **保留，但映射为 Team Agent 角色** | 每层 = 一个 WorkBuddy team member |
| ADR-002 | CodeBuddy CLI 执行环境 | **保留 Harness，升级执行为 WorkBuddy Team** | 利用 WorkBuddy 原生 subagent/team 能力 |
| ADR-003 | 自实现 DramaSpec | **简化为轻量数据层** | 砍掉四件套模板流程，只保留结构化数据 |
| ADR-005 | — | **新增：WorkBuddy Team Agent 作为 Multi-Agent 基座** | 原生支持 send_message、异步并行、持久化历史 |

---

## 3. 架构设计（v2.0）

### 3.1 双层架构

```
┌──────────────────────────────────────────────────────────────┐
│                     Harness（工程层）                          │
│                                                              │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Canon   │  │ 状态机    │  │ 快照     │  │ Carry-   │     │
│  │ 保护    │  │ 管理     │  │ 回滚     │  │ Over     │     │
│  └─────────┘  └──────────┘  └──────────┘  └──────────┘     │
├──────────────────────────────────────────────────────────────┤
│                  Multi-Agent（执行层）                         │
│              基于 WorkBuddy Team Agent                        │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 导演     │  │ 角色-林七 │  │ 角色-苏遥 │  │ 角色-高鸣 │    │
│  │ Director │  │ LinQi    │  │ SuYao    │  │ GaoMing  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │            │
│       └──────── send_message 互相通信 ──────────┘            │
│                                                              │
│  ┌──────────┐  ┌──────────┐                                  │
│  │ 旁白     │  │ 质量官    │                                  │
│  │ Narrator │  │ Quality  │                                  │
│  └──────────┘  └──────────┘                                  │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 WorkBuddy Team Agent 映射

每个剧组角色 = 一个 WorkBuddy team member：

| 角色 | Team Member Name | prompt 来源 | 职责 |
|------|-----------------|-------------|------|
| **导演** | `director` | `.codebuddy/skills/drama-director/SKILL.md` | 读取 series-bible + carry-over，输出场景编排（几场戏、每场的 goal/conflict） |
| **角色-林七** | `lin-qi` | `dramaspec/characters/lin-qi.yaml` | 根据导演指令 + 角色卡，以林七的视角演绎对话和行动 |
| **角色-苏遥** | `su-yao` | `dramaspec/characters/su-yao.yaml` | 同上，苏遥视角 |
| **角色-高鸣** | `gao-ming` | `dramaspec/characters/gao-ming.yaml` | 同上，高鸣视角 |
| **旁白** | `narrator` | `.codebuddy/skills/drama-narrator/SKILL.md` | 把角色们的对话和事件整合为文学化的可阅读文本 |
| **质量官** | `quality` | `.codebuddy/skills/drama-quality/SKILL.md` | 对照 canon、角色一致性、连续性进行验收 |

### 3.3 一集的自动生产流程

```
用户: /drama:play ep03-xxx --title "标题" --logline "一句话"
  │
  ▼
┌─────────────────────────────────────────────┐
│ 1. Harness 初始化                            │
│    - 创建 episode 目录                       │
│    - 读取 series-state.json（carry-over）    │
│    - 读取所有角色卡                           │
│    - 创建 WorkBuddy Team: "drama-ep03"       │
└────────────────┬────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────┐
│ 2. 导演 Agent 分场                           │
│    spawn director →                          │
│    输入: series-bible + carry-over + logline │
│    输出: scene_plan（几场戏、每场 goal）      │
│    → broadcast scene_plan 给所有成员          │
└────────────────┬────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────┐
│ 3. 角色 Agent 演绎（逐场）                    │
│    对每个 scene:                              │
│      spawn lin-qi, su-yao, gao-ming →        │
│      角色之间通过 send_message 即兴对话       │
│      导演可随时 send_message 介入调整         │
│    输出: 每场的对话记录 → 写入 runtime/       │
└────────────────┬────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────┐
│ 4. 旁白 Agent 整合                           │
│    spawn narrator →                          │
│    输入: 所有场景对话记录                     │
│    输出: narrative.md（完整可读剧本）         │
└────────────────┬────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────┐
│ 5. 质量 Agent 验收                           │
│    spawn quality →                           │
│    检查: 角色一致性 + carry-over 兑现 +      │
│          悬念连续性 + 剧情逻辑               │
│    输出: check-report.md（PASS/FAIL）        │
│    如果 FAIL → 回退给导演修正               │
└────────────────┬────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────┐
│ 6. Harness 归档                              │
│    - 写入 wrap-report.md                     │
│    - 提取 carry-over → series-state.json     │
│    - 快照保存                                │
│    - 删除 team                               │
└─────────────────────────────────────────────┘
```

### 3.4 简化后的命令

v2.0 只需 **3 个核心命令**（替代原来的 8 个）：

| 命令 | 用途 | 说明 |
|------|------|------|
| `drama-agent play <ep-id>` | **一键生产** | 创建 → 导演分场 → 角色演绎 → 旁白整合 → 质量验收 → 归档，全自动 |
| `drama-agent status [ep-id]` | 查看进度 | 保留原有功能 |
| `drama-agent roll <ep-id>` | 快照回滚 | 保留原有功能 |

原来的 `new/brief/run/scene/check/wrap` 六个命令合并为一个 `play`。用户仍然可以在 `play` 过程中被提示审阅（可选），但默认是全自动。

### 3.5 数据层简化

```
dramaspec/
├── series-bible.md          # 用户维护：世界观 + 硬约束
├── series-state.json        # Harness 自动维护
├── characters/              # 用户维护：角色卡
│   ├── lin-qi.yaml
│   ├── su-yao.yaml
│   └── gao-ming.yaml
├── episodes/
│   └── <episode-id>/
│       ├── .dramaspec.json  # Harness 自动生成：元数据
│       ├── scene-plan.json  # 导演 Agent 生成：场景编排
│       ├── scenes/          # 角色 Agent 生成：每场对话记录
│       │   ├── S01.md
│       │   ├── S02.md
│       │   └── ...
│       ├── narrative.md     # 旁白 Agent 生成：完整剧本
│       ├── check-report.md  # 质量 Agent 生成：验收报告
│       ├── wrap-report.md   # Harness 生成：归档报告
│       └── feature_list.json# 质量 Agent 提取：悬念追踪
└── .snapshots/              # Harness 自动维护
```

与 v1.0 对比——**砍掉的**：
- ~~episode-brief.md~~（导演 Agent 直接分场，不需要人工填写的 brief）
- ~~beat-sheet.md~~（节拍内化在导演 Agent 的 prompt 中）
- ~~specs/story-contract/spec.md~~（验收标准内化在质量 Agent 的 prompt 中）
- ~~tasks.md~~（不再有 7 步手动任务清单）
- ~~runtime/runs/~~（不再有"运行包"概念，Agent 直接产出到 scenes/）

---

## 4. Multi-Agent 详细设计

### 4.1 Team 生命周期

```javascript
// 伪代码：play 命令的核心逻辑

async function play(episodeId, options) {
  // 1. Harness 初始化
  const episode = harness.createEpisode(episodeId, options);
  const context = harness.buildContext(); // series-bible + characters + carry-overs

  // 2. 创建 Team
  team_create({ team_name: `drama-${episodeId}` });

  // 3. 导演分场
  task({
    name: "director",
    team_name: `drama-${episodeId}`,
    prompt: buildDirectorPrompt(context, options),
    // 导演完成后 broadcast scene_plan 给团队
  });

  // 4. 等导演完成，逐场调度角色演绎
  for (const scene of scenePlan) {
    // 并行 spawn 参与该场的角色
    for (const characterId of scene.characters) {
      task({
        name: characterId,
        team_name: `drama-${episodeId}`,
        prompt: buildCharacterPrompt(character, scene),
      });
    }
    // 角色之间通过 send_message 即兴对话
    // 导演可以 send_message 介入
  }

  // 5. 旁白整合
  task({
    name: "narrator",
    team_name: `drama-${episodeId}`,
    prompt: buildNarratorPrompt(allSceneOutputs),
  });

  // 6. 质量验收
  task({
    name: "quality",
    team_name: `drama-${episodeId}`,
    prompt: buildQualityPrompt(narrative, context),
  });

  // 7. Harness 归档
  harness.wrap(episodeId);
  team_delete();
}
```

### 4.2 Agent 间通信协议

所有 Agent 通过 WorkBuddy 的 `send_message` 工具通信：

| 消息类型 | 发送方 | 接收方 | 内容 |
|----------|--------|--------|------|
| `scene_plan` | director | broadcast | 场景编排 JSON |
| `scene_start` | director | 参与角色 | 某场开始，给出 goal/conflict |
| `dialogue` | 角色A | 角色B | 角色间的对话行动 |
| `direction` | director | 任意角色 | 导演介入调整 |
| `scene_end` | director | broadcast | 某场结束信号 |
| `narrative_draft` | narrator | quality | 完整剧本初稿 |
| `review_result` | quality | director | PASS / FAIL + 修改建议 |

### 4.3 角色 Agent 的 Prompt 结构

每个角色 Agent 收到的 prompt 由三部分构成：

```
1. 角色卡（YAML → 自然语言）
   你是林七。你的核心欲望是……你最恐惧的是……你的秘密是……

2. 场景指令（来自导演）
   当前场景：后台交易
   目标：高鸣向你提出用监控碎片换录像带
   你的处境：你确实有那盘录像，但你不知道高鸣怎么知道的

3. 行为约束（来自 Harness Rules）
   - 不要主动揭示你的秘密，除非被逼到绝路
   - 不要跳出角色，用第一人称行动和对话
   - 你的回复格式：【行动描述】+ "对话内容"
```

### 4.4 导演 Agent 的控制机制

导演不只是分场，还在演绎过程中**实时调控**：

- **节奏控制**：如果角色对话拖沓，导演 send_message 加压（"时间紧迫，有人来了"）
- **信息释放**：在合适时机指示某角色暴露秘密
- **场景转换**：判断当前场景 goal 是否达成，发出 scene_end 信号
- **紧急叫停**：如果角色严重 OOC（out of character），导演可以要求重演

---

## 5. 功能需求（v2.0）

### 5.1 v1.0 保留功能

| # | 功能 | 说明 |
|---|------|------|
| F1 | 状态管理 | episode 生命周期管理 |
| F3 | 快照与回滚 | 自动快照 + roll 回滚 |
| F5 | 跨集连载 | carry-over 自动沉淀与继承 |
| F6 | 角色卡校验 | 8 必填字段校验 |
| F8 | Canon 保护 | series-bible 和角色卡的写保护 |
| F9 | 安全防护 | 路径遍历 + 输入校验 |

### 5.2 v2.0 新增功能

| # | 功能 | 优先级 | 说明 |
|---|------|--------|------|
| **F20** | **`play` 一键生产命令** | P0 | 一条命令走完：初始化 → 导演分场 → 角色演绎 → 旁白整合 → 质量验收 → 归档 |
| **F21** | **WorkBuddy Team 调度** | P0 | 利用 `team_create` / `task` / `send_message` / `team_delete` 管理 Agent 生命周期 |
| **F22** | **导演 Agent** | P0 | 读取 series-bible + carry-over，输出 scene_plan，实时调控演绎节奏 |
| **F23** | **角色 Agent** | P0 | 每个角色 = 一个 team member，基于角色卡自主演绎对话 |
| **F24** | **角色间对话** | P0 | 角色通过 `send_message` 互相对话，产出真实的多方交锋 |
| **F25** | **旁白 Agent** | P1 | 整合所有场景对话为连贯的文学化剧本 |
| **F26** | **质量 Agent** | P1 | 自动验收：角色一致性、carry-over 兑现、剧情逻辑、连续性 |
| **F27** | **FAIL 重演回路** | P2 | 质量验收不通过时，自动回退给导演修正特定场景 |

### 5.3 v1.0 砍掉/简化的功能

| 原功能 | 处置 | 理由 |
|--------|------|------|
| `new` 命令 | 合并入 `play` | 不再需要单独创建 |
| `brief` 命令 | 砍掉 | 导演 Agent 自动分场 |
| `run` 命令 | 合并入 `play` | 不再有"运行包"概念 |
| `scene` 命令 | 砍掉 | 重演由质量 Agent 触发 |
| `check` 命令 | 内化到质量 Agent | 不再手动触发 |
| `wrap` 命令 | 合并入 `play` | 自动归档 |
| episode-brief.md | 砍掉 | 导演 prompt 内化 |
| beat-sheet.md | 砍掉 | 导演 prompt 内化 |
| tasks.md | 砍掉 | 没有手动任务了 |
| spec.md | 砍掉 | 质量 Agent prompt 内化 |

---

## 6. Harness 保留职责

v2.0 的 Harness 更薄、更聚焦：

| 职责 | 实现 |
|------|------|
| **Episode 初始化** | 创建目录、生成 .dramaspec.json |
| **Context 组装** | 读取 series-bible + characters + carry-overs，组装为 Agent 可用的上下文 |
| **Team 编排** | 调用 WorkBuddy team_create，按流程 spawn 各 Agent |
| **产出收集** | 收集各 Agent 的 scene 输出、narrative、check-report |
| **状态流转** | 管理 draft → playing → reviewing → wrapped |
| **归档** | 提取 carry-over、更新 series-state.json、保存快照 |
| **Canon 保护** | 防止 Agent 修改 series-bible 和角色卡 |
| **回滚** | roll 命令支持恢复到任意快照 |

---

## 7. 实现计划

### 7.1 阶段划分

| 阶段 | 目标 | 交付物 |
|------|------|--------|
| **Phase 1：导演 + 旁白** | 导演 Agent 分场 → 旁白直接写剧本（跳过角色演绎） | 单 Agent 串行版 `play` 命令 |
| **Phase 2：角色演绎** | 角色 Agent 上线，多角色通过 send_message 互动 | Team Agent 并行版 |
| **Phase 3：质量回路** | 质量 Agent 验收 + FAIL 重演 | 完整闭环 |

### 7.2 Phase 1 最小可行方案

Phase 1 可以不用 team agent，只用 **subagent（同步 Task）** 串行调度：

```
play ep03
  → Task(director): 输出 scene_plan.json
  → Task(narrator): 读取 scene_plan + context → 输出 narrative.md
  → Harness: 自动 wrap
```

这样最快能跑通，验证效果后再升级到 Phase 2 的 team agent 多角色演绎。

### 7.3 Phase 2 完整方案

用 WorkBuddy **Team Agent**（异步并行）：

```
play ep03
  → team_create("drama-ep03")
  → Task(director, team): 分场 → broadcast scene_plan
  → 对每场: Task(lin-qi, team) + Task(su-yao, team) + Task(gao-ming, team)
      角色间 send_message 对话
  → Task(narrator, team): 整合
  → Task(quality, team): 验收
  → team_delete()
```

---

## 8. 项目现状（更新）

### 8.1 已有资产可复用

| 资产 | 复用方式 |
|------|----------|
| `dramaspec/series-bible.md` | 直接作为导演 Agent 的输入 |
| `dramaspec/characters/*.yaml` | 直接作为角色 Agent 的 prompt 来源 |
| `dramaspec/series-state.json` | 直接用于 carry-over 管理 |
| `.codebuddy/skills/drama-director/SKILL.md` | 作为导演 Agent 的 system prompt |
| `.codebuddy/skills/drama-character/SKILL.md` | 作为角色 Agent 的行为准则 |
| `.codebuddy/skills/drama-narrator/SKILL.md` | 作为旁白 Agent 的改写准则 |
| `.codebuddy/skills/drama-quality/SKILL.md` | 作为质量 Agent 的验收准则 |
| `.codebuddy/rules/canon-guardrails.md` | 保护 canon 文件 |
| `scripts/validate-character.js` | 角色卡校验 |
| `scripts/detect-stagnation.js` | 卡滞检测 |

### 8.2 需要新建/修改

| 文件 | 动作 | 说明 |
|------|------|------|
| `src/play.js` | 新建 | `play` 命令核心逻辑：Team 编排 + Harness 归档 |
| `src/agents/director.js` | 新建 | 导演 prompt 构建器 |
| `src/agents/character.js` | 新建 | 角色 prompt 构建器（读取 YAML） |
| `src/agents/narrator.js` | 新建 | 旁白 prompt 构建器 |
| `src/agents/quality.js` | 新建 | 质量验收 prompt 构建器 |
| `src/cli.js` | 修改 | 添加 `play` 命令，保留 `status`/`roll` |

---

## 9. 里程碑（更新）

| 里程碑 | 目标 | 状态 |
|--------|------|------|
| M0 — 可行性调研 | ADR 决策、架构确认 | ✅ 已完成 |
| M1 — 项目计划 | v1→v3.2 五版迭代 | ✅ 已完成 |
| M2 — MVP 骨架 | CLI 八命令、Harness 资产 | ✅ 已完成 |
| M3 — 功能验证 | ep01/ep02 走通 | ✅ 已完成 |
| **M4 — Multi-Agent Phase 1** | **导演 + 旁白 subagent 串行版 `play`** | 🔜 当前目标 |
| M5 — Multi-Agent Phase 2 | Team Agent 多角色并行演绎 | 📋 规划中 |
| M6 — 质量回路 | FAIL 自动重演 | 📋 规划中 |
| M7 — 连载验证 | 至少 5 集连续生产 | 📋 规划中 |

---

## 10. 风险与缓解（更新）

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Agent 对话发散失控 | 角色跑题、生成冗余内容 | 导演 Agent 实时调控 + 每场设 max_turns 限制 |
| send_message 延迟/丢失 | 角色间对话断裂 | 每场结束后导演收集汇总，保证完整性 |
| 角色 OOC | 角色行为与角色卡不一致 | 质量 Agent 逐场验收 + 角色 prompt 中强化 canon |
| Team Agent 资源消耗 | 多 Agent 并行导致 token 开销大 | Phase 1 先用 subagent 串行验证，Phase 2 再升级 |
| 连载上下文过长 | 多集累积后超出窗口 | 每集只传递 series-state.json 摘要 + 上一集 wrap-report |

---

## 附录

### A. 命令速查（v2.0）

| 命令 | 用法 | 说明 |
|------|------|------|
| `play` | `drama-agent play <ep-id> --title X --logline Y` | 一键生产：初始化 → Agent 演绎 → 归档 |
| `status` | `drama-agent status [ep-id]` | 查看系列/单集进度 |
| `roll` | `drama-agent roll <ep-id> --to latest` | 快照回滚 |

### B. WorkBuddy API 映射

| WorkBuddy 能力 | DramaAgent 用途 |
|---------------|-----------------|
| `team_create` | 为每集创建一个剧组 team |
| `task` (with name + team_name) | spawn 导演/角色/旁白/质量 agent |
| `send_message` (message) | 角色间对话、导演指令 |
| `send_message` (broadcast) | 导演广播场景计划 |
| `send_message` (shutdown_request) | 结束某个 agent |
| `team_delete` | 归档后清理 team |

### C. 角色卡字段（不变）

```yaml
id:             # 唯一标识
name:           # 角色名
archetype:      # 原型定位
desire:         # 核心欲望
fear:           # 核心恐惧
secret:         # 隐藏秘密
voice:          # 说话风格
status:         # active / inactive / retired
relationships:  # 关系列表
```

---

*v2.0 核心变化：从"手工填模板 + 单 Agent 包办"到"Harness 编排 + Multi-Agent 自主演绎"。管线只管状态，创作交给 Agent。*
