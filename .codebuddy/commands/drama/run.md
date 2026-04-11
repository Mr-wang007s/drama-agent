---
name: drama:run
description: 生成导演运行包，准备单集或场景级演绎
---

### 用法

```bash
node ./bin/drama-agent.js run <episode-id>
node ./bin/drama-agent.js run <episode-id> --scene S02
```

### 目标

- 基于 `scene-manifest.json` 生成导演运行包。
- 写入 `runtime/runs/<timestamp>/director-brief.md`、`scene-queue.json`、`team-plan.json`。
- 更新单集状态到 `running`。

### 运行后检查

- 核对 run pack 是否只包含本次要跑的 scene。
- 若发现 scene acceptance 不完整，应先回到 brief/check 阶段补规格。
