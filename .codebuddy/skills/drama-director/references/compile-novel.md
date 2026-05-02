# 小说编译规范

> 从 Agent 交互记录（Phase 3 产出）改写为第三人称叙事文本。Phase 3 的默认编译格式。
> 本文件的硬约束已迁移至 `craft/prose.md`，此处保留编译工艺的操作规范。

---

## 核心输入

- `episodes/<ep-id>/runtime/interactions.jsonl` — Agent 交互记录（Phase 3 Team 演绎产出）
- `agents/*/SOUL.yaml` — 角色身份（用于内心描写和叙事视角）
- `episodes/<ep-id>/beat-sheet.md` — 编剧骨架（指导编译节奏）

## 输出

写入 `episodes/<ep-id>/output/novel.md`

---

## 编译原则

- 忠于交互记录中的事件和对话
- 将对话整合进叙事节奏（不是逐条翻译）
- 增加环境描写（灯光、声音、温度、空间关系）
- 内心独白自然融入叙事，不使用机械化标记
- 可以调整对话节奏（合并、省略、改写为间接引语）
- **不新增交互记录中没有的关键事件**
- 结尾加入余韵段落

---

## 文风目标（详见 `craft/prose.md`）

写出来的东西要像**一个有风格的人类作者**写的：

1. **句式长短交错**：长句铺垫 + 短句炸点（详见 prose.md 第七节·长短句节奏）
2. **段落有呼吸**：叙事段落 3-6 句为主体，对话段落短
3. **少解释多留白**：让行为本身说明（详见 prose.md 第五节·留白艺术）
4. **具体胜过抽象**：身体动作替代心理描写（详见 prose.md 第四节·身体诗学）
5. **拒绝对称美学**：现实不对称（详见 prose.md 第一节·对偶句 A4 约束）
6. **内心戏融入动作**：想法、动作、对话交织

---

## 硬约束总览（详见 `craft/prose.md` 第一节）

### 🔴 A 级（AI 味门控阻断）

- A1：破折号 `——` ≤ 5
- A2：正文禁用 `**加粗**`
- A3：正文禁用 `## 标题`
- A4：对偶句"不是 X，是 Y" ≤ 3
- A5：前集回指零伪造（必须 grep 原文）
- A6：正文零 EPxx 元标记泄漏

### 🟡 B 级（Critic/责编 Warning）

- B1：单集字数 6500-8500
- B2：单词独段 ≤ 5 处
- B3：三连排比 ≤ 2 处
- B4：不做 Over-Connect
- B5：视角不越界

### 🟢 C 级（责编扣分项）

- C1：读者替接话 ≥ 1 处
- C2：沉默比发言主动 ≥ 2 处
- C3：钩子回收 ≥ 2 个
- C4：角色语言 Jaccard < 0.25（责编定性判断）
- C5：句式黑名单 10 条（C5.1-C5.10）

---

## 格式标准

```
标题格式：
  # 第{中文数字}章 · {标题}
  （不用 EPxx · 标题。用中文数字章号）

场景分隔：
  用一个空行即可。
  如果是大跨度切换（时空跳跃），用三个居中星号：
                          ＊ ＊ ＊

段落规范：
  - 叙事段落：3-6句，100-250字
  - 对话密集段：每人一段
  - 内心戏：直接写进叙事，不加标记
  - 避免超过 300 字的大段落

对话格式：
  中文双引号""包裹
  连续对话超过 4 轮时必须插入动作/环境描写
  不要每句都"XX说"——用动作标签替代

内心独白格式：
  ❌ *斜体独立段落*
  ❌ [inner_thought] 标记
  ✅ 融入叙事视角
  ✅ 自由间接引语

禁止出现：
  - Markdown 格式标记（##、**加粗**、---分隔线）
  - 技术性标签（[inner_thought]、[action] 等）
  - Emoji
  - "EP06 · 完" 之类的元标记
```

---

## 编译流程

### Step 1：从 interactions.jsonl 提取结构化数据

可用辅助脚本：`scripts/compile-novel.js`

### Step 2：按 beat-sheet 节奏重组

- 按场景顺序排列
- 每个场景内按 beat 分段
- 对话整合为叙事节奏

### Step 3：去标记 + 文风润色

- 移除所有 `[action]` / `[inner_thought]` 标记
- 内心独白融入叙事
- 添加环境描写
- 调整长短句节奏

### Step 4：自检（文学顾问执行，详见 prose.md 第十节）

对照硬约束清单（A/B/C 级）自检。

---

## 自动化门控（Phase 5）

编译完成后，进入 Phase 5 的机械门控：

```bash
# 1. 编译前清理
node .codebuddy/skills/drama-director/scripts/pre-compile-clean.js \
     --story <name> --episode <ep-id>

# 2. AI 味硬门控
node .codebuddy/skills/drama-critic/scripts/check-ai-taste.js \
     --story <name> --episode <ep-id>
```

- EXIT=0 → 合格，进入读者代表终审
- EXIT=1 → 不合格，返回 Phase 4 由责编再审（最多 2 轮）
- 2 轮后仍不过 → 标注遗留问题继续推进

---

## 编译脚本

`scripts/compile-novel.js` — 辅助工具，从 interactions.jsonl 提取结构化数据。

详细的文学工艺指导见 `craft/prose.md`。
