### 正文写作硬约束索引（drama-director 必遵）

本规则是**硬约束索引层**。详细的写作方法论（含理论出处、样本、反例）已沉淀到：

- `.codebuddy/skills/drama-director/references/craft/prose.md` — 语言学（A/B/C 级约束详细定义 + 破防戏 R1-R5 + 意象系统）
- `.codebuddy/skills/drama-director/references/craft/characterology.md` — 人物学（身体诗学 + 创伤链）
- `.codebuddy/skills/drama-director/references/craft/dialogue.md` — 对话学（语言指纹 + 潜台词）
- `.codebuddy/skills/drama-director/references/craft/mystery.md` — 悬疑学（三铁律深化）

本文件只保留**被 `check-ai-taste.js` 自动检测**或**被责编强制打分**的硬约束清单。

---

#### 🔴 A 级硬约束（违反 = AI 味门控 Error 阻断）

脚本 `check-ai-taste.js` EXIT=1 时必定因为违反以下任一条。详细规范与实操样例见 `craft/prose.md` 第一节。

| 编号 | 约束 | 硬上限 |
|---|---|---|
| A1 | 破折号 `——` | ≤ 8（脚本）/ 自律 ≤ 5 |
| A2 | `**加粗**` 正文禁用 | 0 |
| A3 | `## 二级/三级标题` 正文禁用 | 0 |
| A4 | "不是 X，是 Y" 对偶句 | ≤ 3/集 |
| A5 | 前集连续性零伪造（台词/具体动作必须 grep 原文可查） | 0 |
| A6 | 正文 EPxx/Episode X 元标记泄漏 | 0 |

**A5 特例**：人物的"身体印象 / 感觉"（例如"林墨对这张侧脸有印象"）不受 A5 约束——那是作者可自由扩写的角色内部经验，不是回指具体台词。

**A6 替换表**（工程语言 → 角色语言）：

| ❌ 正文禁用 | ✅ 角色语言 |
|---|---|
| EP01 那天 | 那天 / 从病院出来那天 / 三月十四号那天 |
| EP02 凌晨 | 工地夜那天凌晨 / 前天凌晨 |
| EP04 那晚 | 昨晚 / 回京那晚 |
| 章节标题 EP06 · 名 | 第六章 · 名 |

---

#### 🟡 B 级软约束（违反 = 责编扣分 Warning）

| 编号 | 约束 | 上限/下限 |
|---|---|---|
| B1 | 单集字数 | 6500-8500（硬下限 6000） |
| B2 | 单词独段 | ≤ 5 处/集 |
| B3 | 三连排比 | ≤ 2 处/集 |
| B4 | Over-Connect（作者替读者接线） | ≤ 5 处/集 |
| B5 | 视角越界（使用 MEMORY 之外信息）| 0 |

---

#### 🟢 C 级正向约束（违反 = 责编 + 读者代表扣分）

| 编号 | 约束 | 下限 |
|---|---|---|
| C1 | 读者替接话（留白瞬间）| ≥ 1 处/集 |
| C2 | 沉默比发言主动 | ≥ 2 处/集 |
| C3 | 钩子回收权重（A 级 ×2，B 级 ×1）| ≥ 2/集 |
| C4 | 角色语言 Jaccard | < 0.25（责编定性判断，见 `dialogue.md`） |

#### 🟢 C5 句式黑名单（check-ai-taste.js C5.1-C5.10）

| 编号 | 模式 | 级别 | 上限 |
|---|---|---|---|
| C5.1 | "他/她知道……" 开头段 | warning | 3/集 |
| C5.2 | "这一刻，……" | warning | 2/集 |
| C5.3 | "仿佛/好像/就像……一样" 明喻堆叠 | warning | 4/集 |
| C5.4 | "某种（说不清的/莫名的）……" | error | 2/集 |
| C5.5 | "他不知道为什么……" | warning | 2/集 |
| C5.6 | "心里（涌起/升起/浮起）一股……" | error | 1/集 |
| C5.7 | "时间（仿佛/好像）（停止/静止）了" | error | 0/集 |
| C5.8 | "（深深地/重重地）吸了一口气" | warning | 2/集 |
| C5.9 | "眼眶（微微/不由自主地）泛红" | error | 1/集 |
| C5.10 | "嘴角（微微/不自觉地）上扬" | error | 1/集 |

---

#### 🔺 悬疑三铁律（悬疑/犯罪类故事每集必满足）

适用于 `.story.json` 中 `genre` 含 `mystery` / `thriller` / `crime` 的故事。

详细规范见 `craft/mystery.md` 第二节。

| 铁律 | 要求 |
|---|---|
| 1 · 判断错 | ≥ 1 处（影响后续情节的合理推断被证伪）|
| 2 · 第三方物理反应 | ≥ 1 处（通过物品/声音/NPC 间接传递信息）|
| 3 · A 级钩子 | ≥ 1（每 2 集释放 1 个新 A 级，奇数集推荐）|

---

#### 💥 破防戏五铁律（角色情绪崩溃场景适用）

当 beat-sheet 标记某场景为"破防戏/breakdown"时，该场景必须满足全部 5 条。详细规范与完整样例见 `craft/prose.md` 第二节。

| 铁律 | 要求 |
|---|---|
| R1 | 前 200 字过度平静 |
| R2 | 触发物 ≤ 5 字 |
| R3 | 第一个动作不是情绪动作（不能哭/怒/吼） |
| R4 | 无关者目击（≥ 1 句） |
| R5 | 清醒字数 ≥ 2× 崩溃字数 |

---

#### 📋 Director 必做清单（Phase 1 → Phase 6）

**Phase 1 · 选角定调**
- [ ] 读 state.json / carry_over / 前集 wrap-report
- [ ] 读本集出场角色的 SOUL + MEMORY
- [ ] 选角（S/A/B/C 混编）+ 定基调（一句话）
- [ ] 产出 `episode-brief.md`

**Phase 2 · 编剧开盘**
- [ ] spawn 编剧 + 悬疑顾问（悬疑类故事）
- [ ] 编剧内嵌 8 问自检（详见 `craft/conflict.md` 第九节）
- [ ] 编剧**grep 前集 novel.md**——凡回指必取原文证据
- [ ] 产出 `### 前集事实核对清单` 块写入 beat-sheet
- [ ] 跑 `validate-beat-sheet.js` 通过

**Phase 3 · 大 Team 演绎**
- [ ] team_create + spawn 表演指导 + 世界管家 + 所有角色
- [ ] 表演指导 9 问激活每个角色
- [ ] 世界管家按 beat-sheet 注入事件
- [ ] 每 Beat 至少 3 层（事件+身体反应+内心观察）
- [ ] 每场景至少 2 个慢镜头
- [ ] 编译 novel.md 草稿（`compile-novel.js`）

**Phase 4 · 责编内审**
- [ ] spawn 责编（加载 editing + prose + dialogue）
- [ ] 责编执行 7 步 SOP（详见 `craft/editing.md` 第二节）
- [ ] 产出 `editor-review.md`（打分 + 5 视角 + 根因 + 修订指令）
- [ ] 按需 spawn 文学顾问执行修订
- [ ] 不用 `EPxx` 作为正文时间锚点（用"昨晚"/"前天"/"那天"等角色语言）
- [ ] 章节标题用"第{中文数字}章 · 名"，不用"EPxx · 名"

**Phase 5 · AI 味门控 + 读者终审**
- [ ] 跑 `pre-compile-clean.js`（批量清理）
- [ ] 跑 `check-ai-taste.js`，必须 EXIT=0
- [ ] Director 手动自查 EPxx 泄漏：
  ```bash
  grep -En "(EP|ep|Episode|episode) ?[0-9]" stories/<name>/episodes/<ep-id>/output/novel.md
  ```
  应为空。
- [ ] spawn 读者代表做终审，打分 ≥ 7.0

**Phase 6 · Wrap**
- [ ] 调 `world.memory` 写入（按 tier 上限）
- [ ] 调 `world.update-world` 更新 state + timeline
- [ ] 责编更新 `world/hooks-ledger.md`
- [ ] 文学顾问更新 `world/imagery-ledger.md`
- [ ] 调 `world.wrap` 产出 `wrap-report.md`
- [ ] MEMORY 容量自检：S ≤ 2000 / A ≤ 1200 / B ≤ 600（接近 90% 时归档旧条目）

---

#### 🛠 工具入口

| 场景 | 命令 |
|---|---|
| 校验 | `node .codebuddy/skills/drama-world/scripts/validate.js --story <name>` |
| 创建快照 | `node .codebuddy/skills/drama-world/scripts/snapshot.js create <ep> --story <name>` |
| 回滚 | `node .codebuddy/skills/drama-world/scripts/snapshot.js rollback <ep> --story <name>` |
| 初始化 ep | `node .codebuddy/skills/drama-world/scripts/init.js <ep> --story <name>` |
| 验证 beat-sheet | `node .codebuddy/skills/drama-director/scripts/validate-beat-sheet.js --story <name> --episode <ep>` |
| 编译小说 | `node .codebuddy/skills/drama-director/scripts/compile-novel.js --story <name> --episode <ep>` |
| 编译前清理 | `node .codebuddy/skills/drama-director/scripts/pre-compile-clean.js --story <name> --episode <ep>` |
| AI 味门控 | `node .codebuddy/skills/drama-critic/scripts/check-ai-taste.js --story <name> --episode <ep>` |

---

#### 实战验证基线

A 级约束的具体阈值（破折号 ≤5、对偶句 ≤3 等）来源于早期连续多集的穿帮修订数据，经 `check-ai-taste.js` 固化为硬门控。详细案例与样例归档在 `craft/prose.md` 的陷阱汇总节。

违反 A 级约束须在本轮修订解决（门控阻断），违反 B 级约束须在责编报告中列为 Warning 并给出修订建议。

---

#### 与详细知识库的映射

| 硬约束 | 详细知识源 |
|---|---|
| A1-A6 约束 + 句式黑名单 C5.1-C5.10 | `craft/prose.md` 第一节 |
| 破防戏 R1-R5 | `craft/prose.md` 第二节 |
| 意象系统 | `craft/prose.md` 第三节 |
| 身体诗学 | `craft/prose.md` 第四节 + `craft/characterology.md` 第五节 |
| 留白艺术 | `craft/prose.md` 第五节 |
| Over-Connect 反例 | `craft/prose.md` 第六节 |
| 长短句节奏 | `craft/prose.md` 第七节 |
| 对话 Jaccard 替代 | `craft/dialogue.md` 第六节 |
| 悬疑三铁律深化 | `craft/mystery.md` 第二节 |
| 编剧 8 问自检 | `craft/conflict.md` 第九节 |
| 责编 7 步 SOP | `craft/editing.md` 第二节 |

> 本文件仅保留"硬门控清单"。所有教学性内容（原理、样本、反例、改写示范）已迁入 craft/ 下对应文件。
