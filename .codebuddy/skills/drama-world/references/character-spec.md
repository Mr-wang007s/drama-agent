# 角色规范 — SOUL v4.0 分级体系

## 分级体系（强制）

所有 agent 目录**必须**以 `<tier>_` 开头：

| 级别 | 推荐数量 | 目录形式 | 字段要求 | 模板 |
|------|---------|---------|---------|------|
| **S 级** | 5-8 | `s_<id>/` | 完整 v4.0 + arc + ≥2 关系 + 3 examples | `templates/soul-s.yaml` |
| **A 级** | 10-15 | `a_<id>/` | 完整 v4.0（略简）+ 2 examples | `templates/soul-a.yaml` |
| **B 级** | 20-30 | `b_<id>/` | 核心 OCEAN + trauma(ghost/wound) + want/fear | `templates/soul-b.yaml` |
| **C 级** | 30-50 | 合并在 `C-CLASS-INDEX.yaml` | id + name + tag + one_liner + quirk | `templates/c-class-index.yaml` |

长篇小说（150-200 万字）推荐总数 **65-100 人**。

**MEMORY 容量按 tier 上限**：S=2000 / A=1200 / B=600 字符。

---

## OCEAN 原型参考表

基于原型给出基线（再 ±10 微调避免模板化）：

| 原型 | O | C | E | A | N |
|------|---|---|---|---|---|
| 冷静理性主角 | 70 | 75 | 40 | 45 | 50 |
| 热血主角 | 70 | 50 | 70 | 65 | 50 |
| 复仇者 | 50 | 70 | 35 | 25 | 65 |
| 智者导师 | 80 | 80 | 50 | 65 | 40 |
| 冷峻反派 | 75 | 85 | 40 | 20 | 45 |
| 疯癫反派 | 85 | 30 | 70 | 15 | 80 |
| 忠诚配角 | 50 | 70 | 55 | 75 | 50 |
| 技术宅 | 80 | 65 | 30 | 50 | 55 |

---

## 创伤链推导规则

四要素必须形成逻辑链：

```
Ghost（过去的创伤事件）
  → Wound（由此产生的心理痛苦）
    → Lie（因此相信的错误世界观）
      → Shield（保护自己的防御机制）
```

**推导示例**：
- Ghost: 七岁时红衣小孩在井边说了四个字，醒来后全家否认
- Wound: 对"被否认"有本能恐惧，不确定自己是否在现实中
- Lie: 只有无可辩驳的物证才能证明我没疯
- Shield: 极度理性 + 黑色幽默 + 敲七下节奏

---

## Voice 推导规则

根据角色背景推导语言模式：

| 背景 | tone | rhythm | quirks 示例 |
|------|------|--------|------------|
| 科学家/学者 | 精准、克制 | 中等，逗号多 | 推眼镜、"理论上"、敲桌 |
| 武士/忍者 | 简短、冷 | 极短 | 刀柄手势、凝视、单字回应 |
| 少年主角 | 热情、直接 | 快，感叹号多 | 大话、挠头、"绝对没问题" |
| 学术圈老派 | 温厚、书卷气 | 慢，引经据典 | 古籍引用、"你看这个字" |
| 世家子弟 | 淡漠、距离感 | 标准，不快不慢 | 省略主语、"嗯"代替长句 |

---

## pack.yaml 格式

批量导入角色使用的数据格式（参考 `templates/character-pack.yaml`）：

```yaml
S:
  - id: lin-mo
    name: 林墨
    archetype: 落难觉醒者
    role: 主角
    ocean: [70, 60, 45, 50, 65]
    trauma:
      ghost: 被误诊关进精神病院三年
      wound: 对被相信有饥渴
      lie: 只有无可辩驳的证据才能保护我
      shield: 用极度理性包裹自己
    motivation: { want: "...", need: "...", fear: "...", secret: "..." }
    voice: { tone: "...", quirks: ["..."], vocabulary: "..." }
    # stress_response / examples / relationships / arc
A:
  - id: shen-qingyuan
    # ... 略简字段
B:
  - id: liu-sanbian
    # ... 核心字段
C:
  - id: example-npc
    name: 老护工
    tag: [场景, 路人]
    quirk: 说话总带"哎哟"
```

**自动行为**：
- S/A/B 级 → 创建 `<tier>_<id>/` 目录 + SOUL.yaml + MEMORY.md
- C 级 → 追加到 `C-CLASS-INDEX.yaml`
- 目录命名自动加前缀
- id 冲突/同名则跳过并警告
- 导入后应自动调用 `sync-roster` 更新索引

---

## 分级管理 SOP

### 给所有目录加分级前缀（一次性迁移）

```bash
node .codebuddy/skills/drama-world/scripts/retier.js --story my-story --apply-prefix --dry-run
node .codebuddy/skills/drama-world/scripts/retier.js --story my-story --apply-prefix
```

安全特性：长 id 优先匹配、词边界正则、全引用扫描。

### 单角色升降级

```bash
node .codebuddy/skills/drama-world/scripts/retier.js --story my-story --id xiao-zhao --from b --to a
```

自动：重命名目录 → 更新所有引用 → 提示补充额外字段。

---

## 字段不齐时的推导规则

1. **OCEAN**：基于原型表 ±10 微调
2. **创伤链**：Ghost → Wound → Lie → Shield 逻辑链
3. **Voice**：基于背景推导 tone/rhythm/quirks
4. **Need**：通常是 Want 的反面或深层需求
5. **Shield**：从 Lie 推导防御行为模式
