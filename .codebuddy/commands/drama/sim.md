---
name: drama:sim
description: 启动一次模拟 Session——Agent 在世界中自由交互演绎
---

### 用法

```bash
# 启动模拟（指定故事 + episode）
drama-agent sim <ep-id> --story fog-manor --title "标题" --agents a,b,c --skill screenplay

# team 模式（默认，Agent 自由交互）
drama-agent sim ep01 --story fog-manor --mode team --agents lin-qi,su-yao,gao-ming

# 串行模式（调试用）
drama-agent sim ep01 --story fog-manor --mode serial --agents lin-qi,su-yao
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `<ep-id>` | string | 必填 | Episode ID（如 ep01） |
| `--story` | string | 推荐 | 故事名称（若 cwd 在 stories/ 下可省略） |
| `--title` | string | 可选 | 本集标题 |
| `--logline` | string | 可选 | 一句话梗概 |
| `--agents` | string | 可选 | 参与角色（逗号分隔） |
| `--skill` | string | 可选 | 内容 Skill（默认 screenplay） |
| `--mode` | string | 可选 | team 或 serial（默认 team） |

### 自动执行流程

1. **环境检测**：检查 `stories/<name>/world/` 和 `stories/<name>/agents/` 是否存在
2. **Harness 初始化**：创建 Episode、快照当前状态
3. **世界引擎组装上下文**：读取 world/ + agents/ 构建 prompt
4. **场景构建**：根据 carry-over + 世界状态生成场景
5. **Agent 自由交互**：Team Agent 模式
6. **Harness 收尾**：更新 MEMORY、提取 carry-over、生成 report

### 实现

调用 `drama-harness/scripts/init.js`，透传 `--story` 参数。
