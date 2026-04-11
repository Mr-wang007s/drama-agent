---
description: DramaSpec 工作流规则，约束单集的创建、运行、验收与归档
globs: "**"
alwaysApply: true
---

### DramaSpec 工作流规则

- 单集目录必须位于 `dramaspec/episodes/<episode-id>/`。
- 每集必须维护四件套：`episode-brief.md`、`beat-sheet.md`、`specs/story-contract/spec.md`、`tasks.md`。
- `run` 前必须存在 `scene-manifest.json` 与 `feature_list.json`。
- `wrap` 前必须先完成 `check`，并确保没有阻断项。
- 任何覆盖式操作都应先做快照。
- 运行产物写入 `runtime/`，不要覆盖规格文件。
