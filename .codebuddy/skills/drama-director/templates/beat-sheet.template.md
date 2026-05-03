<!-- template: v2-slim · limit: 2500 中文字 -->
<!-- 用途：编剧 persona 产出的场次骨架 · v1 版 · 为 novel.md 编译直接服务 -->

# Beat Sheet · EP{XX} · v1

### 🎬 核心一句话（核心冲突）

**{一句话 ≤ 80 字 · 本集外部冲突 + 内部冲突凝练}**

### 冲突设计（外部 · 内部 · 潜层）

| Scene | 外部冲突 | 内部 | 潜层 |
|---|---|---|---|
| 1 | ... | ... | ... |
| 2 | ... | ... | ... |
| ... | ... | ... | ... |

---

## Scene 1 · {场名} · {budget_chars: 800}

**scene_weight**: { cause: ..., change: ..., reveal: ... }（三项各 ≤ 30 字）

**key_beats**（≤ 8 条 · 每条 ≤ 40 字）:
- B1: ...
- B2: ...
- ...

**agent_voices**:
- `{agent-id}`: { dialogue_seeds: ["≤30字台词 1", "≤30字台词 2"] }

**canon_check**: { bible_ref: ..., conflicts: none }

---

## Scene 2 · {场名} · {budget_chars: ...}

（同上结构）

---

（Scene 3-7 同上 · 本模板省略）

---

## reader_preview_notes（Phase 2.2 吸收 · ≤ 200 字）

- {建议 1 → 已采纳到 Scene X B Y}
- {建议 2 → 已采纳到 ...}
- {风险 1 → 编剧回应 ...}

## writers-room 吸收要点（Phase 2.3 → 2.4 · ≤ 300 字）

| 角色 | 关键反对/争取 | 采纳落地 |
|---|---|---|
| lin-mo | {反对 B3 无意识} | 改为主动承接 Scene 5 B8 |
| shen-yanzhi | {白絮季节错} | 改鞋面水痕 Scene 3 B10 |
| ... | ... | ... |

## diff from v0（可选 · ≤ 200 字）

- Scene 5: 无意识接过 → 主动承接
- Scene 7: 第四字"接"→"候"
- ...

---

<!-- 🚫 禁止出现：
  - v0 全文保留（只留 v1 + diff 要点）
  - SOUL 字段复述（SOUL 在 agents/ 下）
  - 场景环境文学描写（那是 novel.md 编译时展开的）
  - dialogue_seeds 超 30 字（台词种子必须是"种子"· 扩展在 novel）
  - 复述 reader-memory 的上集回顾（引用 ID 即可）
-->
