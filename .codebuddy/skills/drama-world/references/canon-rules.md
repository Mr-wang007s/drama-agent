# Canon 保护规则

## 写保护范围

以下文件/字段受到 Canon 保护，不可被 Agent 或流水线随意修改：

### 完全写保护
- `world/bible.md` — 世界观圣经，只能通过明确的"世界观修订"操作更新

### SOUL.yaml 核心字段（写保护）
- `id` — 角色唯一标识
- `name` — 角色名
- `tier` — 分级
- `archetype` — 原型
- `trauma.ghost` — 创伤事件
- `trauma.wound` — 心理痛苦
- `trauma.lie` — 错误认知
- `trauma.shield` — 防御机制
- `motivation.want` — 外在目标
- `motivation.need` — 内在需求
- `motivation.fear` — 最深恐惧
- `motivation.secret` — 不可告人的秘密

---

## 可更新字段

以下字段允许在 wrap 时由流水线更新：

| 字段 | 更新时机 | 约束 |
|------|---------|------|
| `emotion.current` | 每集 wrap | 反映当前情绪状态 |
| `known_facts` | 每集 wrap | 角色新获知的事实 |
| `relationships[].trust` | 每集 wrap | 信任值变化 |
| `status` | 剧情需要时 | active/inactive/retired |
| MEMORY.md | 每集 wrap | 按 tier 容量上限 |
| world/state.json | 每集 wrap | 全局状态 |
| world/timeline.md | 每集 wrap | 事件追加 |

---

## MEMORY 有界写入规则

| Tier | 容量上限 | 归档策略 |
|------|---------|---------|
| S 级 | 2000 字符 | 超容时归档最早条目到 `memory-archive/<ep-id>.md` |
| A 级 | 1200 字符 | 同上 |
| B 级 | 600 字符 | 同上 |
| C 级 | 无独立 MEMORY | 信息记录在 state.json 中 |

### 写入格式
```markdown
## 近期事件

- [EP01] 事件描述（简洁，一句话）
- [EP02] ...

## 运行时状态更新

- 当前境界/等级变化
- 心理变化摘要
```

### 容量检查流程
1. 计算新内容 + 现有内容的总字符数
2. 如果超过 tier 上限 → 调用 `memory.js` 的 archiveMemory 归档旧条目
3. 归档后重试写入
4. 仍然超过 → 报错，要求手工合并/精简

---

## 修改 Canon 的正确流程

当确实需要修改 Canon（世界观修订、角色弧线重置等）：

1. **说明原因**：在 commit message 或 wrap-report 中解释为什么要修改
2. **先记录**：将变更记入 `wrap-report.md` 或 `feature_list.json`
3. **用户确认**：获得用户明确同意后再执行
4. **做快照**：修改前创建 snapshot 保底

---

## 红线清单

- ❌ 不要把临时 run 结果、草稿台词、未验收结论直接写进 Canon
- ❌ 不要在没有快照的情况下覆盖 stories/ 下的目录
- ❌ 不要让 Agent 在模拟中修改自己的 SOUL.yaml
- ❌ 不要让 MEMORY.md 无限增长（必须遵守容量上限）
