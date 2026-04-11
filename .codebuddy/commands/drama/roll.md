---
name: drama:roll
description: 从快照回滚单集状态
---

### 用法

```bash
node ./bin/drama-agent.js roll <episode-id>
node ./bin/drama-agent.js roll <episode-id> --to <snapshot-timestamp>
```

### 规则

- 回滚前会先给当前单集再做一份安全快照。
- 回滚只影响当前单集目录，不影响整个系列。
- 回滚后应重新执行 `status` 与 `check` 确认结果。
