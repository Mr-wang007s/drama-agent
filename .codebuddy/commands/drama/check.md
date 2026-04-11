---
name: drama:check
description: 生成单集 check-report 并汇总阻断项
---

### 用法

```bash
node ./bin/drama-agent.js check <episode-id>
```

### 检查内容

- 四件套和关键 JSON 是否齐全。
- `tasks.md` 中是否仍有未完成任务。
- `scene-manifest.json` 的 `goal / conflict / acceptance` 是否完整。
- 角色 canon 是否存在。

### 输出

写入 `check-report.md`，并向用户清楚区分：

- **阻断项**：必须处理后才能 wrap
- **提醒项**：可暂缓，但应记录
