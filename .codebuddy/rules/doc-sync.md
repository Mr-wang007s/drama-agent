---
description: |
  全项目文档与能力载体（SKILL.md / rules）的一致性同步规则。
  任何代码、Skill、规则、脚本或目录结构的结构性变更，都必须把相关文档（PRD / README / AGENTS / CODEBUDDY / SKILL.md / rules）同步到最新状态。
globs: "**/*.md,**/*.js,**/*.yaml,**/*.json,package.json"
alwaysApply: true
---

### 文档同步规则

当代码 / Skill / 规则 / 脚本 / 目录结构发生结构性变更时，必须同步更新下方列出的核心文档集，保持事实源与索引层的一致性。

---

#### 核心文档集

| 文档 | 路径 | 更新内容 |
|---|---|---|
| **PRD** | `docs/PRD.md` | 版本号、功能描述、架构图、目录结构、实施状态 |
| **README** | `README.md` | 项目介绍、快速开始、目录结构 |
| **AGENTS** | `AGENTS.md` | Agent 目录说明、分级约定、SOUL/MEMORY 格式 |
| **CODEBUDDY** | `CODEBUDDY.md` | 项目目标、工程约束、Skill 架构、Subagent 架构、规则索引表 |
| **SKILL.md** | `.codebuddy/skills/<skill>/SKILL.md` | 能力描述、触发词、references 清单、scripts 清单、subagent 映射 |
| **Rules** | `.codebuddy/rules/*.md` | 规则内容、跨规则交叉引用、触发词边界 |
| **Subagents** ✨ v3 | `.codebuddy/agents/<agent>.md` | subagent frontmatter（name/description/tools/model）+ 身份锁定 + 加载 craft 清单 |

> SKILL.md 与 rules 本身也是"核心文档"的一部分：它们既是能力/约束的实现载体，也是被 CODEBUDDY.md / PRD 引用的上游事实源。对它们的任何结构性变更都必须沿下表向下游传播。

---

#### 触发同步的操作

| 变更类型 | 必须更新 |
|---|---|
| 新增/删除/修改 Skill（`.codebuddy/skills/<skill>/`） | 对应 `SKILL.md`（触发词 + references + scripts 清单）、CODEBUDDY（Skill 架构 + 修改建议 + 对话触发词表）、PRD、README（若涉及入口能力） |
| 修改 Skill 触发词 / description | 对应 `SKILL.md` 头部、CODEBUDDY 的"对话 → Skill → 行动"表、`drama-orchestration.md` 的触发词边界节 |
| 新增/删除/修改规则（`.codebuddy/rules/*.md`） | CODEBUDDY（规则索引表）、其他 rules 中引用该规则的交叉链接、PRD（若属于硬约束变更） |
| 规则之间交叉引用变更（如 writing-craft ↔ drama-orchestration） | 所有涉及规则的引用段落必须同步更新，避免"孤岛引用" |
| 新增/删除/修改 references（`.codebuddy/skills/*/references/`） | 对应 `SKILL.md` 的 references 清单、CODEBUDDY（若涉及架构层） |
| 新增/删除脚本（`.codebuddy/skills/*/scripts/`） | 对应 `SKILL.md`、相关 rules 中的"工具入口"表、PRD（如涉及工作流） |
| ✨ 新增/删除/修改 subagent（`.codebuddy/agents/*.md`）v3 | 对应 `SKILL.md`（Team 模式 快速参考）、`team-roster.md`（subagent_file 字段）、CODEBUDDY（Subagent 架构节）、workflow.md（Phase N spawn 指令） |
| ✨ 改 subagent 的 tools 权限或 frontmatter v3 | subagent 文件本身 + team-roster.md 对应 role 卡片 + workflow.md 相关 Phase 的 task() 参数 |
| 目录结构变更（`stories/` / `examples/` / `skills/*/templates/`） | README、AGENTS、CODEBUDDY 的目录结构部分 |
| Agent 分级/命名规范变更 | AGENTS、CODEBUDDY（关键工程约束）、`harness-memory.md` / `episode-workflow.md` |
| 版本发布 | `package.json`、PRD 版本号、README badge |

---

#### 核心文档体积上限（v4.1 新增 · 唯一事实源）

为防止 SKILL.md 入口文件 / rules 约束源文件体积失控膨胀（吃 token · 降低可读性），施加**差异化硬上限**：

| 文档类别 | 路径 | 行数上限 | 中文字上限 | 级别 | 理由 |
|---|---|---:|---:|---|---|
| **SKILL.md** | `.codebuddy/skills/*/SKILL.md` | **150** | **800** | **error** | 入口文件 · 每次触发 Skill 加载 · 膨胀直接吃 token |
| **Rules** | `.codebuddy/rules/*.md` | **250** | **1800** | **warning** | 约束源 · 可能天然详尽 · 仅防失控 |
| references/craft/* | `.codebuddy/skills/*/references/craft/*.md` | 不约束 | 不约束 | — | 专业教材 · 按需加载 |
| references/workflow.md / team-roster.md | 同上 | 不约束 | 不约束 | — | 按需加载 |
| templates/* | `.codebuddy/skills/*/templates/*` | 不约束 | 不约束 | — | 模板骨架 · 按文件自身用途决定 |

**机械门控**：

```bash
node .codebuddy/skills/drama-world/scripts/validate-doc-size.js
```

- EXIT=0 = 全部通过（含 rules warning · 非 --strict）
- EXIT=1 = SKILL.md 有 error 级超量 · 或 --strict 模式下任意超量
- 支持 `--json` / `--strict` / `--path <glob>`

**瘦身指引**（SKILL.md 超量时）：

1. 把重复内容下沉到 `references/`（craft / workflow / team-roster）· 用一句话 + 引用链接代替
2. 合并重复的章节（如 Domain B 能力表 + 完整映射表 二选一）
3. 删除"为什么保留"/"历史变更"等元叙述冗余
4. 压缩示例（输出样例用一行描述 · 具体格式放 references）

**瘦身指引**（rules 超量时）：

1. 交叉引用其他 rules（`详见 xxx.md 第 N 节`）· 不复述
2. 详细规则定义下沉到对应 Skill 的 `references/` · rules 只留索引表
3. 历史变更日志外溢到专门文件（如 `pro-advisory-notes.md`）

**更新上限值**：必须同时更新两处——本文件的上表 + `validate-doc-size.js` 中的 `DOC_CATEGORIES` 配额配置。两处不一致将导致规则与实际门控脱节。

---

#### 更新原则

- **一致性**：同一概念在 PRD / README / AGENTS / CODEBUDDY / SKILL.md / rules 六处的描述必须一致。
- **事实源唯一**：SKILL.md 与 rules 是能力/约束的事实源，CODEBUDDY 与 PRD 是对事实源的索引——先改事实源，再改索引。
- **增量更新**：只改受影响的章节，不重写整个文档。
- **先代码后文档**：先完成代码/规则/Skill 变更，再更新文档。
- **版本同步**：`package.json` / PRD / README 中的版本号必须一致。
- **交叉引用闭环**：若 A 规则提到 B 规则的某节，B 被改动时必须回头检查 A 的引用是否仍然准确。

---

#### 变更落盘前自检清单

```
□ CODEBUDDY.md 的"项目规则"索引表与 .codebuddy/rules/ 实际文件一致
□ CODEBUDDY.md 的"Skill 架构"与 .codebuddy/skills/ 实际结构一致
□ CODEBUDDY.md 的"Subagent 架构"与 .codebuddy/agents/ 实际文件一致 ✨ v3
□ CODEBUDDY.md 的"对话 → Skill → 行动"触发词表与各 SKILL.md 的 description 一致
□ 每个 SKILL.md 的 references 清单与 .codebuddy/skills/<skill>/references/ 实际文件一致
□ 每个 SKILL.md 的 scripts 清单与 .codebuddy/skills/<skill>/scripts/ 实际文件一致
□ 每个 subagent 的 tools 权限与它实际调用的能力一致（如有 Write 才能写 md）✨ v3
□ team-roster.md 的 subagent_file 字段与 .codebuddy/agents/ 实际存在的文件一致 ✨ v3
□ workflow.md 的 Phase N 中 task() 调用的 subagent_name 与实际 subagent 名一致 ✨ v3
□ .codebuddy/rules/ 内部交叉引用（如 writing-craft ↔ drama-orchestration）均指向现存章节
□ README.md / AGENTS.md 的目录结构与 stories/<name>/ 实际约定一致
□ docs/PRD.md（若存在）的功能描述与当前实现一致
□ package.json 版本号与 README badge、PRD 版本一致
□ validate-doc-size.js EXIT=0（SKILL.md 和 rules 体积达标 · v4.1 新增）
```

> 若 `docs/PRD.md` 不存在，跳过该项即可，不强制创建。
