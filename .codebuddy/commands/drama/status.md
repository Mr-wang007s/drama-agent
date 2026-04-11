---
name: drama:status
description: 查看世界状态、Agent 状态、记忆摘要
---

### 用法

```bash
# 查看全局状态（世界 + 所有 Agent）
drama-agent status

# 查看单集状态
drama-agent status <ep-id>
```

### 输出内容

- 世界标题、当前集、已归档集数、carry-over 数量
- 每个 Agent 的状态、情绪、记忆使用率
- 单集的参与 Agent、使用 Skill、模拟模式

### 实现

调用 `drama-harness/scripts/status.js`。
