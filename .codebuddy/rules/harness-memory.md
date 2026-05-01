---
description: 约束 Drama World 的状态层与记忆层，避免运行态和规范态混写
globs: "**"
alwaysApply: true
---

### World State & Memory Rule

- `scene-manifest.json` 是本集场景编排真相源。
- `feature_list.json` 记录本集未兑现悬念和剧情 feature。
- `check-report.md` 是验收输出，不是规范本身。
- `wrap-report.md` 是跨集状态回写入口。
- `series-state.json` 只能在 wrap 或明确的系列维护操作中更新。
- hooks 产生的日志、事件、提醒都应写到 `runtime/` 或独立日志文件。
