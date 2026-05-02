---
description: |
  Plan 执行完成后的文档同步规则。
  确保代码变更与 DramaAgent 的核心文档（PRD / README / AGENTS / CODEBUDDY）保持一致。
globs: "**/*.md,**/*.js,**/*.yaml,**/*.json,package.json"
alwaysApply: true
---

### Plan 文档同步规则

当执行 Plan 中的任务涉及结构性变更时，必须同步更新核心文档以保持一致性。

---

#### 核心文档集

| 文档 | 路径 | 更新内容 |
|---|---|---|
| **PRD** | `docs/PRD.md` | 版本号、功能描述、架构图、目录结构、实施状态 |
| **README** | `README.md` | 项目介绍、快速开始、目录结构 |
| **AGENTS** | `AGENTS.md` | Agent 目录说明、分级约定、SOUL/MEMORY 格式 |
| **CODEBUDDY** | `CODEBUDDY.md` | 项目目标、工程约束、Skill 架构、规则索引表 |

---

#### 触发同步的操作

| 变更类型 | 必须更新 |
|---|---|
| 新增/删除/修改 Skill（`.codebuddy/skills/`） | CODEBUDDY（Skill 架构 + 修改建议）、PRD |
| 新增/删除/修改规则（`.codebuddy/rules/`） | CODEBUDDY（规则索引表） |
| 新增/删除脚本（`.codebuddy/skills/*/scripts/`） | 对应 SKILL.md、PRD（如涉及工作流） |
| 目录结构变更（`stories/` / `templates/` / `examples/`） | README、AGENTS、CODEBUDDY 的目录结构部分 |
| Agent 分级/命名规范变更 | AGENTS、CODEBUDDY（关键工程约束） |
| 版本发布 | `package.json`、PRD 版本号、README badge |

---

#### 更新原则

- **一致性**：同一概念在四个文档中的描述必须一致。
- **增量更新**：只改受影响的章节，不重写整个文档。
- **先代码后文档**：先完成代码/规则变更，再更新文档。
- **版本同步**：`package.json` / PRD / README 中的版本号必须一致。

---

#### Plan 完成前自检清单

```
□ CODEBUDDY.md 的"项目规则"索引表与 .codebuddy/rules/ 实际文件一致
□ CODEBUDDY.md 的"Skill 架构"与 .codebuddy/skills/ 实际结构一致
□ README.md / AGENTS.md 的目录结构与 stories/<name>/ 实际约定一致
□ docs/PRD.md（若存在）的功能描述与当前实现一致
□ package.json 版本号与 README badge、PRD 版本一致
```

> 若 `docs/PRD.md` 不存在，跳过该项即可，不强制创建。
