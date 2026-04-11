---
name: drama:brief
description: 生成或重建单集 brief、beat-sheet、spec、tasks
---

### 用法

接收一个 `episode-id`，必要时允许 `--force` 覆盖模板文件：

```bash
node ./bin/drama-agent.js brief <episode-id>
node ./bin/drama-agent.js brief <episode-id> --force
```

### 要求

- 先确认单集目录存在。
- 重建前会自动创建快照。
- 生成完成后，应提醒用户人工审查 `episode-brief.md`、`beat-sheet.md`、`specs/story-contract/spec.md`。
