---
name: drama:wrap
description: 归档单集并把跨集状态回写到系列层
---

### 用法

```bash
node ./bin/drama-agent.js wrap <episode-id>
```

### 规则

- 先执行 `check`，确保没有阻断项。
- `wrap` 会更新 `dramaspec/series-state.json`。
- 未兑现的 feature 会变成 carry-over。
- 成功后应生成 `wrap-report.md`。

### 成功标准

- 单集状态变为 `wrapped`
- `series-state.json` 中的 `currentEpisode` 指向当前单集
- carry-over 明确可追踪
