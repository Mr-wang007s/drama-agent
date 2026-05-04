---
description: |
  Error 级门控失败（check-ai-taste / validate-beat-sheet / validate-episode-artifacts / validate-doc-size 等）的根因分诊规则。
  核心命题：Error 不是"内容写错了"，而是"写出 Error 的那条生产路径走错了"。
  遇到 Error 先做二分诊（内容 vs 生产流程），生产流程问题必须改引擎（skill + rules + subagent prompt），而不是反复改内容。
globs: "**/*.md,**/*.js,**/*.yaml,**/*.json"
alwaysApply: true
---

### 门控 Error 分诊与引擎优化规则（反反复改内容）

当任一自动化门控脚本返回 Error 级失败时，**禁止直接进入"改内容—重跑—再改"循环**。必须先做根因分诊，把 Error 归到两类之一，再按对应路径处置。

> 这条规则的立规动机：ep08 实战中出现连环反复修订（破折号 19→8→再超 · 字数 5217→补到 5617 · 配额 5 个 error 级批量改小）· 每一次"改内容再重跑"都是一次 token 浪费 · 且没有减少下集复发的概率。

---

#### 一、Error 两分诊

所有门控 Error 必须先归类到下列两类之一：

| 类别 | 定义 | 处置方向 |
|---|---|---|
| **C 类 · 内容错**（Content Error）| 本次生成的**具体内容**偏离了设计（人物违 SOUL / 情节违 canon / 事实错误 / 用户主观不满意）| 改本次内容 |
| **E 类 · 引擎错**（Engine Error）| **本次生成路径**走错了——prompt 没约束好、模板没硬编码限值、subagent 没加载必要 craft、脚本没前置拦截——同样的路径跑下一集会**再次触发同一个 Error** | 改 skill / rules / subagent / template · 不优先改本次内容 |

---

#### 二、分诊判据（必须逐条过）

遇到 Error 时，按顺序回答下列问题。**任意一条答"是"即判 E 类**：

1. 这个 Error 是**量化硬指标**（字数 / 破折号数 / 配额 / 覆盖率）超限吗？
2. 本项目以前集/同类产物有没有**反复踩过同一 Error**？（翻前集 wrap-report / git log）
3. 如果不改 prompt / 模板 / 脚本，下一集按相同路径生成会**再次触发**这个 Error 吗？
4. 触发 Error 的产物是由某个 **spawn prompt / template / subagent** 生成的吗？（即"入口可定位"）
5. 修内容的成本（token + 时间）比修引擎高吗？

**任一答"是" → E 类 → 先改引擎**。

全部答"否" → C 类 → 改本次内容。

---

#### 三、C 类处置

- 走"最小改动"原则（详见 `minimal-edit.md`）· 定点改本次内容
- 改完立即重跑对应门控 · 一次通过即止
- 在本集 wrap-report 的"本集流程债务"节记一行（便于后续复盘是否高频复发）

---

#### 四、E 类处置（核心 · 反反复改内容）

**E 类禁止反复改本次内容** · 按以下三步处置：

##### 步骤 1 · 回溯入口

从 Error 反查触发这条产物的**生成入口**：

| Error 来源 | 生成入口 |
|---|---|
| novel.md 超破折号 / 超加粗 / EPxx 泄漏 | `drama-director/SKILL.md` 的 Phase 3 编译段 + `references/compile-novel.md` + 编译时主 agent/编剧 persona 的 prompt |
| novel.md 字数偏离 position 区间 | `drama-director/references/workflow.md` Phase 3 字数预检 + `craft/prose.md` B1 |
| beat-sheet.md 字段缺失 / 超配额 | `drama-director/templates/beat-sheet.template.md` + `references/workflow.md` Phase 2.1/2.4 |
| agent-audit-log.md / beats-*.md 超配额 | `drama-director/references/workflow.md` Phase 2.3 · 角色 spawn prompt + `drama-character.md` subagent 定义 |
| reader-verdict.md / reader-preview.md 超配额 | `drama-reader.md` subagent 定义 + Phase 5/2.2 spawn prompt |
| editor-review.md 超配额 / 违反反流水账四禁 | `drama-editor.md` persona 加载手册 + `craft/editing.md` |
| SKILL.md / rules 超体积 | `doc-sync.md` 上限表 + `validate-doc-size.js` 配额配置 |

##### 步骤 2 · 改引擎（二选一或兼做）

**a. 前置硬编码限值**：把 Error 对应的量化硬线写进 spawn prompt 的第一段或 template 的开头。例：

```
❌ 旧 prompt：你是连载读者·做 EP08 终审盲评。
✅ 新 prompt：你是连载读者·做 EP08 终审盲评。
   产出 reader-verdict.md · **中文字 ≤ 1500 硬上限** · 超量自行精简后再交付 · 不允许主 agent 事后修。
```

**b. 加前置校验阻断**：在生成入口之前（template 骨架 / 脚本流程）加拦截，不等生成完再发现超量。例：

- Phase 3 编译前强制走 `check-ai-taste.js` 的"编译预检"（已有 v4.1 Step 3.4）
- Phase 2.3 每个 drama-character spawn 回信前自检字数 ≤ 400

##### 步骤 3 · 引擎改完后再碰内容

- 引擎（skill / rule / subagent / template）提交后 · 对本次已产生的超量内容**做一次最小精简到达标**（而不是反复精修）
- 在 wrap-report 里显式标注："E 类 Error · 已改 `<引擎文件>` · 下集不再复发"
- 如果引擎改动超出 `minimal-edit.md` 的量化硬线（>3 文件 / >50 行），先列清单让用户确认

---

#### 五、联动 doc-sync

改引擎（E 类处置 · 步骤 2）必然触发 `doc-sync.md` 的同步链路。典型传播表：

| 改的引擎 | 必须同步 |
|---|---|
| spawn prompt（workflow.md Phase N）| workflow.md + 对应 Phase 示例 + team-roster.md 对应 role 卡片 |
| subagent frontmatter / tools | `.codebuddy/agents/<agent>.md` + team-roster.md subagent_file 字段 + CODEBUDDY Subagent 架构节 |
| template 骨架 | 对应 SKILL.md 的 templates 清单（若是结构性变更）+ CODEBUDDY 相应节 |
| 校验脚本配额值 | 脚本源码 + doc-sync.md "核心文档体积上限"节 + 本规则分诊判据表 |

---

#### 六、常见 E 类模式登记（供 director 复盘参考）

| 症状 | E 类还是 C 类 | 根因入口 | 典型改法 |
|---|---|---|---|
| novel 破折号超量 · 每集都超 | E | compile-novel.md + 编译 prompt 没硬编码 | prompt 第一段加"破折号 ≤8 · 默认不用" |
| novel 字数下限不足 | E（高频）/ C（偶发）| compile-novel.md + position 区间未在 prompt 前置 | prompt 按 position 前置字数下限 + 跑预检脚本 |
| beats-*.md 超 400 | E | Phase 2.3 个人 beat 摘要生成模板未约束 | 模板头部硬编码"≤400 · 不含其他角色 secret" |
| agent-audit-log 超 1500 | E | Phase 2.3 汇总时没要求每角色 ≤375 字 | workflow Phase 2.3.4 汇总段加"每角色 3 段要点·各 ≤125 字" |
| editor-review 超 1200 | C（里程碑集偶溢）/ E（常态超）| 责编 persona 加载手册 | C 警告 · 多次复发转 E · 改加载手册加压缩指令 |
| reader-verdict 超 1500 | C（9.0+ 里程碑集）/ E（常态超）| drama-reader subagent prompt | 同上 |
| beat-sheet 超 2500 | E | Phase 2.4 编剧改稿 prompt 没压缩指令 | prompt 加"v0 全文不保留 · 种子 ≤30 字 · 环境描写挪 novel" |

---

#### 七、反面模式（明令禁止）

以下行为在 Error 出现时**禁止**：

- ❌ 直接用 sed / 正则批量删超量字符（如一次删 15 个破折号）· 不反查 prompt
- ❌ "先删再补" / "先补再删" 回拉式改内容
- ❌ 一集内同一 Error 反复跑门控 > 2 次 · 仍不改引擎
- ❌ 在 wrap-report 把 E 类 Error 记为 C 类"内容疏漏" · 掩盖复发风险
- ❌ 内容已改达标就不回头改引擎 · 把 E 类改成 C 类处置

---

#### 八、触发时机

本规则在以下时刻自动触发：

- 任一 `validate-*.js` 脚本 EXIT≠0
- `check-ai-taste.js` 返回 Error 级
- 用户显式说"又超了 / 怎么又 / 反复"等高频复发提示
- wrap-report 某条"本集流程债务"与前集记录重复（>=2 集连续同一 Error）

触发后主 agent 必须先做二分诊 · 不允许跳过。

---

#### 九、落盘自检清单

引擎改完 · 提交前自检：

```
□ 已定位 Error 的生成入口文件
□ 已在入口 prompt / template / script 前置硬约束（文字可追溯）
□ 同步 doc-sync.md 要求的下游文档（SKILL.md / CODEBUDDY / team-roster 等）
□ wrap-report 标注 "E 类 Error · 已改 <文件> · 下集不再复发"
□ 本次超量内容已做最小精简到达标（一次通过 · 不反复）
□ 未触发 minimal-edit.md 的量化硬线（>3 文件 / >50 行）· 否则已让用户确认
```
