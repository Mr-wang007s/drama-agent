---
name: drama:sim
description: 启动一次模拟 Session——Agent 在世界中自由交互演绎
---

### 用法

```bash
# 启动模拟（team 模式，Agent 自由交互）
drama-agent sim <ep-id> --title "标题" --logline "一句话" --agents lin-qi,su-yao,gao-ming --skill screenplay

# 串行模式（调试用）
drama-agent sim <ep-id> --mode serial --agents lin-qi,su-yao

# 指定多个内容 Skill
drama-agent sim <ep-id> --skill screenplay,novel --agents lin-qi,su-yao,gao-ming
```

### 自动执行流程

0. **环境检测**（前置检查）
   - 检查 world/ 和 agents/ 是否存在
   - 若不存在 → 提示"请先运行 drama init 初始化故事"并中止
   - 检查指定的 --agents 是否都已创建

1. **Harness 初始化**（drama-harness/scripts/init.js）
   - 若 Episode 不存在 → 自动创建
   - 快照当前世界状态 + Agent 记忆
   - 状态 → simulating

2. **世界引擎组装上下文**（drama-world/scripts/build-context.js）
   - 读取 world/ + agents/*/ → 构建每个 Agent 的 prompt

3. **场景构建**（drama-world/scripts/build-scene.js）
   - 根据 carry-over + 世界状态生成场景初始提示

4. **Agent 自由交互**（Team Agent）
   ```
   team_create("drama-{ep-id}")
     → spawn world-manager (drama-director skill)
     → spawn 各 Agent (SOUL + MEMORY + RULES + 场景上下文)
     → 自由 send_message 交互
     → world-manager 施压 / 推进 / 注入事件
     → scene_end → shutdown_request → team_delete
   ```

5. **内容 Skill 整合**
   - drama-screenplay: 编译为剧本格式
   - drama-novel: 改写为小说格式

6. **Harness 收尾**（drama-harness/scripts/wrap.js）
   - 更新 Agent MEMORY.md（有界写入）
   - 提取 carry-over → world/state.json
   - 更新 world/timeline.md
   - 生成 session-report.md
   - 状态 → wrapped
