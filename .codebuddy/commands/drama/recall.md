---
name: drama:recall
description: 查询 Agent 记忆、搜索历史交互
---

### 用法

```bash
# 查看 Agent 当前活跃记忆
drama-agent recall <agent-id> --story fog-manor

# 搜索 Agent 所有记忆（含归档）
drama-agent recall <agent-id> --story fog-manor --search "关键词"

# 查看全局时间线
drama-agent recall --story fog-manor --timeline
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `<agent-id>` | string | 必填 | Agent ID |
| `--story` | string | 推荐 | 故事名称 |
| `--search` | string | 可选 | 搜索关键词 |
| `--timeline` | flag | 可选 | 查看全局时间线 |

### 实现

调用 `drama-world/scripts/memory.js`。
