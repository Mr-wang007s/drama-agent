# Agent 间交互协议

## 消息类型

| 类型 | 发送方 | 接收方 | 说明 |
|------|--------|--------|------|
| `scene_context` | world-manager | broadcast | 场景初始上下文（地点/时间/在场人物/已知情况） |
| `event` | world-manager | 指定 Agent | 外部事件注入（"有人敲门"/"收到短信"） |
| `time_skip` | world-manager | broadcast | 时间推进（"两小时后——"） |
| `pressure` | world-manager | 指定 Agent | 施压（"你听到走廊有脚步声"） |
| `dialogue` | Agent A | Agent B / broadcast | 角色间对话 |
| `action` | Agent | broadcast | 角色行动描述 |
| `inner` | Agent | main（仅记录） | 内心独白（其他 Agent 不可见） |
| `scene_end` | world-manager | broadcast | 场景结束信号 |

## 时间推进规则

- 只有**世界管理者**可以推进时间。Agent 不可自行跳转时间。
- 时间推进通过 `time_skip` 消息实现，包含新的时间点和场景变化。
- 每次 time_skip 后，世界管理者应更新在场人物和地点状态。

## OOC 检测标准

Agent 出现以下行为视为 Out of Character：

1. **信息越界**：使用了 MEMORY.md 和 known_facts 中未包含的信息
2. **风格偏移**：说话风格与 SOUL.yaml 的 voice 字段严重不符
3. **秘密泄露**：在没有被逼到绝境的情况下主动揭示 secret
4. **元评论**：跳出角色用第三人称或对剧情进行元分析
5. **读心**：直接知道其他 Agent 的内心想法而非从行为推断

## 世界管理者介入时机

1. Agent 对话陷入循环（连续 3 轮没有新信息或情绪变化）
2. 所有 carry-over 在场景进行到一半时仍未被触及
3. Agent 严重 OOC 需要纠正
4. 当前场景的叙事目标已达成，需要推进到下一场景
5. 需要注入外部事件以打破僵局

## 场景结束条件

世界管理者在以下条件满足时发出 `scene_end`：

- 至少一个 carry-over 有实质推进
- 至少一组角色关系发生可记录变化
- 当前场景的核心冲突已经浮现（不要求解决）
