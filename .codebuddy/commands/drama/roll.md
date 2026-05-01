---
name: drama:roll
description: 快照回滚——恢复故事的世界状态 + Agent 记忆到指定时间点
---

### 用法

```bash
# 回滚到最近快照
drama-agent roll <ep-id> --story fog-manor
drama-agent roll <ep-id> --story fog-manor --to latest

# 回滚到指定快照
drama-agent roll <ep-id> --story fog-manor --to <snapshot-timestamp>
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `<ep-id>` | string | 必填 | Episode ID |
| `--story` | string | 推荐 | 故事名称 |
| `--to` | string | 可选 | 快照时间戳或 latest（默认 latest） |

### 规则

- 回滚前会自动创建安全快照
- 回滚范围：Episode 目录 + 世界状态 + Agent 记忆

### 实现

调用 `drama-world/scripts/snapshot.js`。
