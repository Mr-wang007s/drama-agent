---
name: drama:init
description: 初始化一个新故事项目——从种子文件或题材预设创建完整的世界观 + 角色 + 初始状态
---

### 用法

```bash
# 从种子文件初始化
drama-agent init --from my-story-seed.yaml

# 从题材预设快速启动
drama-agent init --preset mystery
drama-agent init --preset fantasy
drama-agent init --preset scifi
drama-agent init --preset romance

# 交互式创建（引导填写核心字段）
drama-agent init --interactive

# 指定输出目录（默认当前目录）
drama-agent init --from seed.yaml --output ./my-story
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `--from` | string | 二选一 | 种子文件路径（.yaml） |
| `--preset` | string | 二选一 | 题材预设（mystery/fantasy/scifi/romance） |
| `--interactive` | flag | 可选 | 交互式引导创建 |
| `--output` | string | 可选 | 输出目录，默认当前目录 |
| `--force` | flag | 可选 | 覆盖已存在的文件 |

### 自动执行流程

1. **检测环境**
   - 检查 world/、agents/ 是否已存在
   - 若存在且未指定 --force → 提示"已初始化，请使用 drama:status 查看"

2. **读取种子文件/预设**
   - --from：解析用户提供的 story-seed.yaml
   - --preset：从 templates/presets/{preset}.yaml 加载预设
   - --interactive：引导用户回答 5 个核心问题后生成种子

3. **生成世界文件**（drama-harness/scripts/story-init.js）
   ```
   world/
     ├── bible.md      ← 从 seed.world 生成
     ├── state.json    ← 从 seed.initial_state 生成
     └── timeline.md   ← 初始化为空
   ```

4. **生成角色文件**
   ```
   agents/
     ├── {agent-id}/
     │   ├── SOUL.yaml   ← 从 seed.agents[n] 生成（SOUL v4.0 三层结构）
     │   ├── MEMORY.md   ← 初始化为空
     │   └── RULES.md    ← 从 templates/rules.md 生成
     └── ...
   ```

5. **初始化 episodes 目录**
   ```
   episodes/
     └── .gitkeep
   ```

6. **输出初始化报告**
   ```
   ✅ 故事初始化完成！

   📖 故事: {{title}}
   🎭 题材: {{genre}}
   🌍 世界: world/bible.md ({{core_settings.length}} 条核心设定)
   👥 角色: {{agents.length}} 个

   下一步:
     1. 查看状态: drama-agent status
     2. 开始模拟: drama-agent sim ep01 --title "第一集标题" --agents {{agent_ids}}
   ```

### 种子文件格式

种子文件采用 SOUL v4.0 三层结构定义角色（身份层 → 心理层 → 表演层）。

详见 `templates/story-seed.yaml` 模板。

### 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `ALREADY_INITIALIZED` | world/ 或 agents/ 已存在 | 使用 --force 覆盖，或切换到新分支 |
| `SEED_NOT_FOUND` | 指定的种子文件不存在 | 检查路径 |
| `PRESET_NOT_FOUND` | 指定的预设不存在 | 使用可用预设: mystery/fantasy/scifi/romance |
| `INVALID_SEED` | 种子文件格式错误 | 检查 YAML 语法和必填字段 |

### 与其他命令的关系

- `drama:init` 必须在 `drama:sim` 之前执行
- `drama:status` 会检测初始化状态
- `drama:create-character` 可在初始化后添加新角色
