---
name: drama:status
description: 查看状态——无参数列出所有故事，指定 --story 显示故事详情
---

### 用法

```bash
# 列出所有故事子项目
drama-agent status

# 查看某个故事的全局状态
drama-agent status --story fog-manor

# 查看某集状态
drama-agent status ep01 --story fog-manor
```

### 输出内容

**无参数**：列出 `stories/` 下所有故事子项目（名称、标题、题材）

**--story**：
- 世界标题、当前集、已归档集数、carry-over 数量
- 每个 Agent 的状态、情绪、记忆使用率

**--story + ep-id**：
- 单集的参与 Agent、使用 Skill、模拟模式

### 实现

调用 `drama-world/scripts/status.js`。
