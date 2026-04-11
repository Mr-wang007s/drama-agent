---
name: drama:roll
description: 快照回滚——恢复世界状态 + Agent 记忆到指定时间点
---

### 用法

```bash
# 回滚到最近快照
drama-agent roll <ep-id>
drama-agent roll <ep-id> --to latest

# 回滚到指定快照
drama-agent roll <ep-id> --to <snapshot-timestamp>
```

### 规则

- 回滚前会自动创建安全快照
- 回滚范围：Episode 目录 + 世界状态 + Agent 记忆
- 回滚后应执行 `status` 确认状态

### 实现

调用 `drama-harness/scripts/snapshot.js`。
