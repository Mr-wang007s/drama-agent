---
name: drama:recall
description: 查询 Agent 记忆、搜索历史交互
---

### 用法

```bash
# 查看 Agent 当前活跃记忆
drama-agent recall <agent-id>

# 搜索 Agent 所有记忆（含归档）
drama-agent recall <agent-id> --search "关键词"

# 查看全局时间线
drama-agent recall --timeline
```

### 输出内容

- Agent 活跃记忆（MEMORY.md 内容 + 容量使用率）
- 搜索结果（匹配的活跃记忆和归档记忆）
- 全局时间线（world/timeline.md）

### 实现

调用 `drama-harness/scripts/memory.js`。
