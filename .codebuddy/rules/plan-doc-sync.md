### Plan Documentation Sync Rule

当执行计划（Plan）中的任务时，必须同步更新以下文档以保持一致性：

#### 必须同步的文档

| 文档 | 路径 | 更新内容 |
|------|------|----------|
| **PRD** | `docs/PRD.md` | 版本号、功能描述、架构图、目录结构、命令说明、实施状态 |
| **README** | `README.md` | 项目介绍、快速开始、命令列表、目录结构 |
| **AGENTS** | `AGENTS.md` | Agent 目录说明、创建/管理方式、格式规范 |
| **CODEBUDDY** | `CODEBUDDY.md` | 项目目标、工程约束、常用命令、目录职责、修改建议 |

#### 触发条件

以下操作后必须检查并更新上述文档：

1. **新增/删除/修改命令**（.codebuddy/commands/）→ 更新 README 命令列表、PRD 命令说明、CODEBUDDY 常用命令
2. **新增/删除/修改 Skill**（.codebuddy/skills/）→ 更新 PRD 架构图、CODEBUDDY 目录职责
3. **新增/删除/修改脚本**（scripts/）→ 更新 PRD 技术实现
4. **目录结构变更**（新增/移动/删除目录）→ 更新所有四个文档的目录结构部分
5. **核心功能变更**（初始化流程、模拟流程等）→ 更新 PRD 功能描述、README 快速开始
6. **Agent 管理方式变更** → 更新 AGENTS.md
7. **版本发布** → 更新 package.json 版本号、PRD 版本号、README badge

#### 更新原则

- **保持一致性**：四个文档中描述同一概念的内容必须一致
- **先代码后文档**：先完成代码实现，再更新文档
- **增量更新**：只更新受影响的章节，不重写整个文档
- **版本同步**：package.json、PRD、README 中的版本号必须一致

#### 检查清单

每次 Plan 任务完成后，执行以下检查：

```
□ docs/PRD.md 的功能描述与实际实现一致
□ README.md 的命令列表与 .codebuddy/commands/ 一致
□ AGENTS.md 的说明与当前 agents/ 管理方式一致
□ CODEBUDDY.md 的目录职责与实际目录结构一致
□ 四个文档中的版本号一致
□ 四个文档中的架构描述无冲突
```
