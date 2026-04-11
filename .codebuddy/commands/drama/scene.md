---
name: drama:scene
description: 针对单一场景生成重演计划
---

### 用法

```bash
node ./bin/drama-agent.js scene <episode-id> <scene-id>
```

### 目标

- 仅对一个场景生成 run pack。
- 写入 `runtime/scenes/<scene-id>/replay-plan.md`。
- 适用于 `/drama:check` 不通过后的局部重演。
