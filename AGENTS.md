### 项目目标

`drama-agent` 是一个面向 **连载剧情生产** 的工程骨架。它把可行性计划中的三层架构落成代码与配置资产：

- **导演层**：控制集级目标、节拍、冲突升级与验收。
- **角色层**：维护角色卡、关系、秘密、动机与情绪。
- **叙事层**：将事件流整理为可发布文本或拍摄说明。

### 关键工程约束

- **单集 = 一个 DramaSpec 单元**：目录固定为 `dramaspec/episodes/<episode-id>/`。
- **四件套必须存在**：`episode-brief.md`、`beat-sheet.md`、`specs/story-contract/spec.md`、`tasks.md`。
- **角色卡是 canon**：`dramaspec/characters/*.yaml` 与 `dramaspec/series-bible.md` 属于系列常量。
- **运行产物不覆盖规格**：`runtime/` 下的运行包、检查报告、回放计划不能替代规范文件。
- **任何变更先快照**：`brief`、`run`、`scene`、`wrap`、`roll` 都应依赖快照。

### 推荐工作流

```text
/drama:new
  → /drama:brief
  → 人工审 brief / beat / spec
  → /drama:run
  → /drama:check
  → /drama:scene（按需重演）
  → /drama:wrap
```

### 目录职责

- **`.codebuddy/commands/drama/`**：项目级 `/drama:*` 命令提示。
- **`.codebuddy/rules/`**：DramaSpec 工作流、canon 护栏、记忆约束。
- **`.codebuddy/skills/`**：导演、角色、叙事、质量四类技能。
- **`scripts/hooks/`**：Session/Tool 事件脚本。
- **`dramaspec/`**：系列知识库与单集规范。
- **`src/cli.js`**：CLI 真正的行为实现。

### 修改时优先遵守

1. 先保持 `dramaspec` 与 `.codebuddy` 资产一致。
2. 优先补充规格和校验，而不是直接增加魔法行为。
3. 如果要扩展命令，优先扩展已有 `new/brief/run/check/wrap/status/roll` 的数据结构。
4. 任何自动化都应能落地为文件：报告、清单、快照、状态。
