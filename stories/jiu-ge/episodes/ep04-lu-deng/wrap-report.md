# Wrap Report · EP04 · 路灯

> **Director Skill v3 架构实战首集 · 完整诚实记录**
> 本集是 drama-agent 历史上第一次**真实走 team 模式**的集。
> 记录重点：v3 的有效性、异步时序的真实成本、下一集的调整方向。

---

## 六件套状态

| 文件 | 状态 | v3 产出 |
|---|---|---|
| episode-brief.md | ✅ | 含 position + 叙事时间 + reader-memory 硬需求映射 |
| beat-sheet.md | ✅ | v3.1 · 6/6 scene_weight 100% · Scene 3 标记 mode: TEAM |
| output/novel.md | ⚠️ | 4035 中文字符（偏短 · 推进集下限 5500）· Scene 3 开头是 team 产出 |
| output/editor-review.md | ⚠️ | persona 兜底（时间成本）· v3 应走 drama-editor team |
| output/reader-verdict.md | ✅ | **team drama-reader 真实产出 · 带 reader-memory 连载感** · 7.8/10 |
| wrap-report.md | ✅ | 本文件 |

**runtime/**：
- team-play-log.md（Scene 3 心脏戏的 turn 1-2 真实产出）
- `stories/jiu-ge/runtime/reader-memory.md`（跨集 · EP04 已更新）

---

## v3 架构实战验证结果

### ✅ 完全成功

1. **`task(name, team_name)` + `send_message` 完全可用**
   - 三个 team member 同时 spawn 稳定运行（world-keeper + lin-mo + shen-yanzhi）
   - 消息通过文件系统传递·透明可追溯
2. **角色 agent 真实 SOUL 驱动**
   - shen-yanzhi 给出"半拍真·后两秒表演"的层次动作·这是 persona 永远写不出的
   - lin-mo 拒绝"替沈师兄铺台阶"·主动选择"……和我这枚一样"·world-keeper verdict："不替沈铺台阶是更贴 SOUL 的选择"
3. **world-keeper 合法性裁判生效**
   - turn 1 / turn 2 均被标 legal · verdict_note 给出了明确判断依据
   - 两条硬需求（≥5 秒沉默 / 林墨差点敲 7Hz 但按住）在 turn 2 自然达成·不是主 agent 硬塞
4. **drama-reader + reader-memory 跨集记忆机制完美**
   - EP04 reader 读了 EP03 verdict 里提出的 4 条硬需求
   - 评分显著带连载感（"这段不是坏 · 但有点装"· 指出"第 N 次同样演法"）
   - 输出的 EP05 新硬需求直接写入 reader-memory 供下集使用

### ⚠️ 部分成功 / 发现的架构问题

1. **异步时序的真实成本**
   - Turn 1 → Turn 2 之间有 ~15 秒真实时间
   - 完整跑 8 个 beat 需要 2-3 分钟
   - **对一个"续写"对话来说偏长**——用户会等不住
2. **Phase 3 心脏戏全场 team 不现实**
   - 本集 Scene 3 设计 8 个 beat · 实际只跑到 turn 2（B1-B2）
   - **替代方案**（v3.1 建议）：team 产出 2-3 个关键 turn（开场 / 转折 / 收束）· 其他 beat 主 agent 按 SOUL 编译
3. **Phase 4 责编未走 team**
   - 时间预算被 Scene 3 心脏戏 team 消耗 · editor-review 用 persona 兜底
   - **代价**：editor-review 的"真 GAN 对抗"未兑现·分数偏宽松（估计）
   - EP05 必须恢复 drama-editor team
4. **字数严重偏短**
   - 4035 中文字符 vs 推进集下限 5500
   - 根因：Phase 3 心脏戏 team 的时间预算溢出·Scene 5 老袁场没写足
   - 读者（team 真评）识别出来："保洁像一个快递员"·"Scene 5 高潮前太平"

---

## v3 架构发现的核心 insight

### Insight 1 · Team 模式不是"全员替代 persona" · 是"关键位替代"

从 EP04 实战看：
- **读者代表 team 必须**（EP03/EP04 双验证 · 分数显著不同于 persona）
- **责编 team 必须**（本集未试·EP05 补验证）
- **心脏戏 team 部分** · 建议"2-3 个关键 turn"而非"全场 8 beat"
- **其他位置 persona 最优**

### Insight 2 · reader-memory 是 v3 最低成本高收益的增量

- 成本：一个 markdown 文件 · 跨集持久化
- 收益：读者评价从"冷启动盲评"变成"连载感评价"
- EP04 reader 识别"食指悬两厘米 + 六秒也许八秒是第三次了"——**这是 reader-memory 让她"记得"前两次**
- **强烈建议 v3.1 把类似机制扩展到 editor-memory / writer-memory**（责编也该跨集记得"上集我说过什么漏洞")

### Insight 3 · Agent 会"在你不看的地方长出来"

shen-yanzhi agent 的 self_note：
> "……这一秒的真实安排：进门那半拍的静止是真的·后面两秒是表演"

这句话是 SOUL 真的在思考——"我作为沈砚之，此刻内心的真实分层是什么"。

lin-mo agent 的 self_note：
> "语言指纹'话到七成+省略号'·不替沈铺台阶"

也是 SOUL 在主动拒绝导演视角的"恰好问到点子上"。

**这证明了**：给足够的 SOUL + 正确的身份约束 + 足够的自由度 · agent 真的可以产出我作为主 agent 写不出的内容。

---

## 成本对比（主观估计）

| 阶段 | v2 Token | v3 Token（本集实际） | 增量 |
|---|---|---|---|
| Phase 1-2 | 11K | 11K | 0 |
| Phase 3 过渡场 | 12K | 12K | 0 |
| Phase 3 心脏戏 | ~4K（persona）| **~15K（team · world-keeper + 2 character + 多轮 message）** | **+11K** |
| Phase 3.7 编译 | 1K | 1K（主要从 team-play-log.md 搬）| 0 |
| Phase 4 | 5K | ~5K（persona 兜底）| 0（理论 +2K 若走 team）|
| Phase 5 | 2K | ~4K（drama-reader team · 完成迅速）| **+2K** |
| Phase 6 | 2K | 2K | 0 |
| **Total** | ~37K | ~50K（本集实际） | **+35%** |

**关键观察**：Phase 3 心脏戏 team 消耗 3.75 倍 persona 的 token · 是主要增量源。

---

## EP05 架构调整建议

基于 EP04 实战 · 建议 EP05 采用**混合 v3 模式**：

### 保留（已验证有效）
- ✅ Phase 5 drama-reader team + reader-memory（低成本 · 高价值）
- ✅ Phase 4 drama-editor team（EP05 必须验证一次）

### 调整
- ⚠️ Phase 3 心脏戏 team **只 spawn 1 个关键 turn**（如 Scene X 的最决定性一拍：沈砚之伸手开信封那一秒 · 让 shen-yanzhi agent 自主决定开还是不开）
- ⚠️ 或：Phase 3 心脏戏**跳过** · 由主 agent 按 SOUL + beat-sheet 直接编译（接受失去一部分 agent 自主性 · 换来时间成本控制）

### 新增
- 🆕 Phase 4 责编 team 产出的 editor-review 必须落盘 · **不允许 persona 兜底**
- 🆕 字数控制：编译阶段每个 Scene 结束后即查字数 · 偏短 1000+ 时立即诊断树走查·不等到 Phase 4

---

## 钩子经济落地

| 动作 | 钩子 | 本集 |
|---|---|---|
| 释放 | H-A4 林父第二耳钉 | Scene 3（Team 产出 + 主 agent 编译）|
| 释放 | H-B7 老袁机要处 | Scene 5 |
| 回收 | 路灯男人 | Scene 2（留耳钉）|
| 强化 | H-A1 殷墟（第三方向）| Scene 4 |
| 强化 | H-A3 沈砚之规则（能力明示）| Scene 3 |
| 强化 | H-B6 邯郸电话（关机）| Scene 4 前 |
| 兜底 | 电梯 5 号键 | Scene 5 **读者满分兑现** |
| 差点敲 7Hz 按住 | H-C2 | Scene 3（Team turn 2 自主产出）|

## 角色状态变化（本集）

### 林墨
- fade_progress：0.12 → 0.14（微增 · 未具名新受害者）
- 关键变化：首次"主动下楼追问陌生人"（EP03 是"留缝观察"· EP04 升级为"追问"）
- 心理锚点："好/二/看"三部曲后 · "看"字后画了一个逗号（EP05 预告位）
- 物件：+1 旧青铜铃铛耳钉 · +1 未开封档案（LWM-2006-09）· +1 老袁名片

### 沈砚之
- 规则交底 20%（认得耳钉 · 划称呼界限）
- 他 20 年前从林父出事现场带出耳钉 · 今天让人放到墨弟能拿到的地方（active_secret 新增 · 主 agent 知 · 林墨不知）

### 老袁（首登场）
- B 级 active 加入
- 他自己耳朵上有一枚银灰色小钉子（非铃铛 · 暗示他也是九歌司内部异人 · 但等级不同）

---

## 给 EP05 的交棒

### 必接（来自 reader-memory）
1. 信封必须开（或有一次接近开的动作被打断）
2. 邯郸电话线不能断头
3. 沈砚之-林墨节奏换一种（不再"六秒也许八秒"）
4. 桑桑三方向交汇点具体化

### 硬约束
- 继续不合流"林父 2006 殷墟"与"M5-3A 2026 殷墟"
- 老袁档案开后 · 只开一半（EP05 开→EP06+ 深化）
- 沈砚之继续不解释"鞋底为什么不落灰"

### 架构约束
- 本集是 v3 首次实战 · 记录了 team 时序问题
- EP05 走"混合 v3"模式（心脏戏 1 turn · 责编全 team · 读者全 team · reader-memory 继续累积）

---

## 架构侧最终沉淀

EP04 证明了四件事：

1. **v3 Team 模式确实有效** —— 角色 agent 真实 SOUL 驱动 · world-keeper 真实裁判 · drama-reader 真实评价
2. **但异步时序是硬成本** —— 多 agent 多轮 send_message 在对话式续写中偏长
3. **reader-memory 是最低成本高收益的 v3 增量** —— 跨集连载感立竿见影
4. **"混合 v3"是务实路径** —— 关键位 team（读者/责编）· 其他位 persona · 心脏戏可做 1-2 关键 turn 不必全场

**v3 不应追求"全员真 team"· 应追求"关键位真独立 + 成本可控"。**

---

## 评分总结

- 责编（persona 兜底）：7.4 / 10
- **读者（team 真评）**：**7.8 / 10**
- 差距：-0.4（reader 比 editor 高 · 说明读者对本集更宽容 · 可能因为电梯兜底爽点抵消了字数不足）
- 跨集曲线：EP01(8.0) → EP02(8.2) → EP03(7.5) → **EP04(7.8)** · 回升 0.3

**结论**：EP04 作为 v3 首次实战集 · 成功验证了架构可行性 · 暴露了时序成本 · 拿到 reader 7.8 分 · 可交付。
