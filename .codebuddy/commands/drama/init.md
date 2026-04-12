---
name: drama:init
description: 在 stories/ 下初始化一个新故事子项目——从种子文件或题材预设创建完整的世界观 + 角色 + 初始状态
---

### 用法

```bash
# 从题材预设快速启动（推荐）
drama-agent init --name my-story --preset mystery
drama-agent init --name my-story --preset fantasy
drama-agent init --name my-story --preset scifi
drama-agent init --name my-story --preset romance

# 从种子文件初始化
drama-agent init --name my-story --from my-story-seed.yaml

# 交互式创建（引导填写核心字段）
drama-agent init --name my-story --interactive

# 强制覆盖已存在的故事
drama-agent init --name my-story --preset mystery --force
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `--name` | string | **必填** | 故事名称（小写字母+连字符，如 fog-manor） |
| `--preset` | string | 二选一 | 题材预设（mystery/fantasy/scifi/romance） |
| `--from` | string | 二选一 | 种子文件路径（.yaml） |
| `--interactive` | flag | 可选 | 交互式引导创建 |
| `--force` | flag | 可选 | 覆盖已存在的故事 |

### 自动执行流程

1. **检测环境**
   - 检查 `stories/<name>/` 是否已存在
   - 若存在且未指定 --force → 提示已存在

2. **读取种子文件/预设**
   - --preset：从 `templates/presets/{preset}.yaml` 加载
   - --from：解析用户提供的 story-seed.yaml
   - --interactive：引导用户回答核心问题后生成种子

3. **生成故事子项目**
   ```
   stories/<name>/
     ├── .story.json    ← 故事元数据
     ├── world/
     │   ├── bible.md   ← 从 seed.world 生成
     │   ├── state.json ← 初始世界状态
     │   └── timeline.md
     ├── agents/
     │   └── {agent-id}/
     │       ├── SOUL.yaml  ← SOUL v4.0 三层结构
     │       ├── MEMORY.md
     │       └── RULES.md
     └── episodes/
   ```

4. **输出初始化报告**

### 与其他命令的关系

- `drama:init` 在 `drama:sim` 之前执行
- `drama:status` 无参数时列出所有故事
- `drama:create-character --story <name>` 可在初始化后添加角色
