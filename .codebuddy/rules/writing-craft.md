---
description: |
  DramaAgent 正文写作规范：实战沉淀的硬约束（A 级门控 + B 级 Warning）。
  在 Phase 2 开写 novel.md 之前必读，Phase 3 门控前必自检。
  违反这些规则会直接触发 check-ai-taste Error 或 Critic 穿帮 Error。
globs: "stories/**/episodes/**/output/novel.md,stories/**/episodes/**/beat-sheet.md,stories/**/episodes/**/episode-brief.md"
alwaysApply: true
---

### 正文写作硬约束（drama-director 必遵）

基于实战复盘沉淀的硬约束：A 级 = AI 味门控 Error 阻断，B 级 = Critic Warning 扣分。所有故事（`stories/<name>/`）通用。

---

#### 🔴 A 级硬约束（违反 = AI 味门控 Error）

**A1 · 破折号 `——` 全篇目标 ≤5**
- 硬上限 8（脚本上限），自律目标 **≤5**，写作时**默认不用**。
- 想表达"进一步说明"时，改句号另起；想表达"对偶"时，改逗号陈述。
- 仅允许在对话被打断情境中使用：`"我不是……"——他停下来，看我。`
- Phase 3.0 **必跑** `node .codebuddy/skills/drama-director/scripts/pre-compile-clean.js --story <name> --episode <ep>` 批量清理。

**A2 · `**加粗**` 正文禁用**
- novel.md 正文一律不用 Markdown 加粗。读者需要重音时，改用句子结构（短句独立成段）。
- beat-sheet / critic-report / wrap-report 等非正文文件可用加粗。

**A3 · `## 二级/三级标题` 正文禁用**
- novel.md 用段落编号（中文一/二/三/四）或一个空行换场，不使用 Markdown 标题。
- 目录标题（`# 第 X 章 · 标题`）允许一个，其余禁止。

**A4 · "不是 X，是 Y" 对偶句 ≤3 处/集**
- 该句式密集会形成节奏单调。想用时优先扩展为**具象描述**：
  - ❌ `不是冷，是麻` → ✅ `不是冷。是那种"我身体记得但我脑子不配合"的麻`

**A5 · 前集连续性零伪造**
- 任何回指前集的**台词、场景细节、具体动作**必须能在前集 `novel.md` 里 grep 到原文。
- 写 beat-sheet 时要回指前集，必须先：
  ```
  grep -n "关键词" stories/<story>/episodes/ep*/output/novel.md
  ```
- beat-sheet 末尾**必填**"前集事实核对清单"块，列：回指内容 + 前集 ep-id + 原文行号。
- 人物的**身体印象 / 感觉**（"林墨对这张侧脸有印象"）不受此约束——那是 Director 可自由扩写的角色内部经验。

---

#### 🟡 B 级软约束（违反 = Critic Warning）

**B1 · 单集字数目标 6500-8500 中文字符**
- 硬下限 **6000 中文字符**（check-ai-taste 字数字段不阻断，但 Critic 扣"文学质量"分）。
- 每场景在 beat-sheet 预算**字数 + 行数**双指标：
  ```
  场景 1 · 标题 · 1800 字 / 45-55 段
  ```
- 每个 Beat 最少写 **3 层**：事件 + 角色身体反应 + 角色内心观察。
- 每场景至少 **2 个慢镜头**：一件物品的细节 / 一段无事件的静默。
- Director 的本能是"事件完成即换场"，必须主动扩写感官铺陈。

**B2 · 单词独段 ≤5 处/集**
- 独占一行的短句（≤8 字、无句号）是强节奏符号，密度超 5 则成风格癖好。

**B3 · 三连排比 ≤2 处/集**
- "A 的 B，C 的 D，E 的 F" 结构。

**B4 · 不做 Over-Connect（作者替读者接线）**
- 任何跨集伏笔的回声只铺**一次**，**不解释**。
- ❌ "陈教授说了一个'往'字。这是父亲梦里'往下还有一层'的前半截。"
- ✅ "陈教授说了一个'往'字。林墨点头，他不让自己把下半截在脑子里接出来。"
- 用角色的**身体反应**代替认知串联（样板：EP04 耳钉发烫）。

**B5 · 信息合规：视角不越界**
- 主视角人物不能使用他 `SOUL.known_facts + MEMORY.md` 之外的信息。
- S 级角色的 `secret` 字段在卷内合约期内**绝对不泄露**给读者（哪怕是第三人称叙述的旁白）。
- 例：周文渊卷一内不能让读者看见他的 `inner_thought`——只能有行为异常让读者起疑。

---

#### 📋 Director 必做清单（Phase 1 → Phase 5）

**Phase 1.4 上下文装载**
- [ ] 读 state.json / carry_over / 前集 wrap-report
- [ ] 读本集出场角色的 SOUL + MEMORY
- [ ] **grep 前集 novel.md**，凡回指必取原文证据
- [ ] 产出 `### 前集事实核对清单` 块写入 beat-sheet

**Phase 1.6 beat-sheet**
- [ ] 每场景标注 `字数 / 行数` 双预算
- [ ] 每场景标注"创伤链触发目标"（对应 SOUL.trauma 字段）
- [ ] 末尾含"前集事实核对清单"

**Phase 2 开写前自查**
- [ ] 破折号自律目标 ≤5（预算在心里先扣死）
- [ ] 每 Beat 至少 3 层（事件+反应+观察）
- [ ] 每场景至少 2 个慢镜头

**Phase 3.0 编译后先跑清理脚本**
```
node .codebuddy/skills/drama-director/scripts/pre-compile-clean.js \
     --story <name> --episode <ep-id>
```

**Phase 3.1 AI 味门控**
```
node .codebuddy/skills/drama-critic/scripts/check-ai-taste.js \
     --story <name> --episode <ep-id>
```
必须 EXIT=0 才能进入 Phase 4。

**Phase 4 Critic 调用时 prompt 必须含**
- "核查本集所有跨集引用的原文依据"
- "判断信息合规：主视角是否使用了 MEMORY 之外的信息"
- "判断 S 级角色 secret 有无泄露"

**Phase 5.5 MEMORY 容量自检**
- S 级 memory_capacity = 2000，A 级 = 1200，B 级 = 600
- 接近 90% 时应将 3 集之前的 `[EPxx]` 条目归档到 `MEMORY-archive.md`

---

#### 🛠 工具入口

| 场景 | 命令 |
|---|---|
| 校验 | `node .codebuddy/skills/drama-world/scripts/validate.js --story <name>` |
| 创建快照 | `node .codebuddy/skills/drama-world/scripts/snapshot.js create <ep> --story <name>` |
| 回滚 | `node .codebuddy/skills/drama-world/scripts/snapshot.js rollback <ep> --story <name>` |
| 初始化 ep | `node .codebuddy/skills/drama-world/scripts/init.js <ep> --story <name>` |
| 编译前清理 | `node .codebuddy/skills/drama-director/scripts/pre-compile-clean.js --story <name> --episode <ep>` |
| AI 味门控 | `node .codebuddy/skills/drama-critic/scripts/check-ai-taste.js --story <name> --episode <ep>` |

---

#### 实战验证基线

A 级约束的具体阈值（破折号 ≤5、对偶句 ≤3 等）来源于早期连续多集的穿帮修订数据，经 `check-ai-taste.js` 固化为硬门控。详细案例与数据归档在各故事的 `episodes/<ep-id>/wrap-report.md` 中，可在需要调参时回溯查阅。

违反 A 级约束须在本轮修订解决（门控阻断），违反 B 级约束须在 Critic 报告中列为 Warning 并给出修订建议。

---

#### 附录：常见陷阱示例

**陷阱 1：破折号滥用根因**

破折号是 AI 写手的本能，因为它是表达"进一步说明"的最快符号。EP02 首稿 24 个 —— 不是粗心，是直觉。自律方法：写到"想用 ——"的瞬间，先问"这里是对话被打断吗？"不是则换逗号或句号。

**陷阱 2：字数不达标根因**（Beat → 段落转化率不足）

Director 倾向于"事件完成即换场"。一个 Beat 写 80-150 字就收尾，但其实需要 200-350 字。差别：

```
❌ 80 字版：
他看见镜子里的自己。脸没老。他害怕了。

✅ 250 字版：
他看镜子。镜子里的他看了三秒。他发现一个事情：他的脸和三年前没有太大差别。
病院三年没有把他的脸磨老。他的皱纹没有多。他的发际线没有后退。他的眼袋
没有更深。他的脸没老。他盯着镜子。他第一次今晚真正地害怕。他转过头不
看镜子。
```

多出的 170 字不是注水——是**身体反应 + 内心观察 + 重复确认**三层。

**陷阱 3：对偶句的"具象化冗余"替代**

```
❌ 对偶型：
不是冷，是麻。

✅ 具象扩张：
不是冷。是那种"我身体记得但我脑子不配合"的麻。就像有人在他的骨头
里敲了一下，敲得很浅，但敲出了回声。
```

后者既避开了对偶句计数，又把一个抽象判断落到读者能感同身受的身体经验上。

**陷阱 4：Over-Connect 样例对比**

```
❌ 作者替读者接线：
陈教授说了一个"往"字。这是父亲梦里"往下还有一层"的前半截。

✅ 让读者自己串：
陈教授说了一个"往"字。林墨点头，他不让自己把那个字的下一半在脑子
里接出来。
```

后者的优势：林墨的克制本身就是读者的线索。读者会在 1-2 秒后自己想起父亲那句话——这个"想起"的瞬间就是阅读的快感。

**陷阱 5：前集伪造台词（EP04 真实 Error）**

```
❌ EP04 首稿（Critic 抓出）：
那天凌晨周文渊叫他在警戒线外五百米停车的时候，他抬手扶过后颈，
说过一句话："上周单独遇到一件麻烦事留下的。"

// 但 EP01 原文里司机从未说过这句话。

✅ 修订后：
这道伤是新的，结痂的颜色还偏红。前天夜里送他去殷墟的那位司机就有
这样一张侧脸。那天他坐在后排，后视镜里那双偶尔瞥过来的眼睛他记得。
```

差别：修订后只用了 EP01 里**真实存在的**"后视镜里偶尔瞥过来的眼神"作为锚点，没有编造台词。这是 A5 约束的核心——**身体印象可以自由扩写，具体台词必须有原文依据**。

**陷阱 6：字数/节奏数据可直接作为后续集的校准基准**

| 场景类型 | 参考字数 | 参考段数 |
|---|---:|---:|
| 独角戏（无对话） | 5000-5800 | 120-140 |
| 一对一对话 | 2000-2400 | 50-60 |
| 短对话 + 长独白 | 1700-2000 | 40-55 |
| 多人场景 | 1500-1800 | 40-50 |

写 beat-sheet 场景预算时直接查这个表。
