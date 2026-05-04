# Story Engine 完整工作流

> 10 步从"一句话 idea"到"完整短篇"的创作旅程

---

## 总览

```
[Step 1] @creative-intent   ← 先倾听
    ↓
[Step 2] @producer          ← 朋友式确认边界
    ↓
[Step 3] @screenwriter      ← 3 个方向 + 协同打磨
    ↓
[Step 4] @story-consultant  ← （可选）第二意见
    ↓
[Step 5] @casting-director  ← 一个个捏角色
    ↓
[Step 6] @script-supervisor ← Pre-check 预标
    ↓
[Step 7] @director          ← 只给开场
    ↓
[Step 8] @table-read  ⭐    ← 角色朗读（灵魂环节）
    ↓
[Checkpoint] 用户决策点     ← 永远是 Boss
    ↓
（所有场次完成后）
    ↓
[Step 9] @rewrite-loop  ⭐  ← Bone/Flesh/Breath
    ↓
[Step 10] @script-doctor ⭐ ← 四遍阅读
    ↓
@editor                    ← 最终组装
    ↓
🎉 out/final-story.md
```

---

## 详细流程

### Step 1：采集创作意图

**命令**：`@creative-intent`

**你会被问到**：
1. 核心种子（一句话）
2. 致敬参照系
3. 刻意反常规的设计
4. 神圣元素（绝对不改）
5. 希望 AI 扮演的伙伴模式

**产出**：`intent.json`

**关键**：你的所有"刻意为之"和"神圣元素"会被**永久保护**，引擎永不触碰。

---

### Step 2：朋友式确认边界

**命令**：`@producer`

**你会被聊到**：
- 大概长度
- 叙事视角
- 情绪基调
- 目标读者

**产出**：`spec.md`

**关键**：Producer 不设限，只探问。允许"还没想好"。

---

### Step 3：3 个方向的大纲

**命令**：`@screenwriter`

**流程**：
1. Screenwriter 给出 **3 个差异明显的方向**
2. 你选一个（或要求第四种）
3. **一句一句聊**出最终大纲

**产出**：`outline.md`

**关键**：永远不给"唯一大纲"。你拒绝所有方向是正常的。

---

### Step 4：第二意见（可选）

**命令**：`@story-consultant`

**你会得到**：
- 3 个结构性观察（每个都允许"你是刻意的"豁免）
- 不下判决，不改大纲

**产出**：`consultant-notes.md`

**关键**：可跳过。如果你对大纲很有把握，直接进 Step 5。

---

### Step 5：捏角色

**命令**：`@casting-director`

**流程**：
1. 从大纲提取角色清单
2. **一次一个角色**，给 2-3 个候选版本
3. 你选一个或混搭或自捏
4. 每个角色建模为：
   - **SOUL**（原型/欲望/创伤/价值观/矛盾）
   - **MEMORY**（长期+场景记忆）
   - **STYLE**（说话方式/口头禅/肢体）
   - **ARC**（起点 → 终点）
   - **guardrails**（不会做/不会说的事）

**产出**：`agents/<角色名>.json`

---

### Step 6：连贯性预标

**命令**：`@script-supervisor`（Pre-check 阶段）

**场记会扫描**：
- 人物状态风险（道具/服装/身体标记）
- 时间线风险
- 地理连贯性

**产出**：`continuity/precheck.md`

**关键**：场记只记录不修改。它是时间胶囊。

---

### Step 7：演绎第一场

**命令**：`@director`

**流程**：
1. 你选一场戏
2. Director 搭建"场景舱"（环境/参与者/初始处境/冲突种子）
3. **只给 1-2 个开场动作**
4. 多个角色 Agent 按各自 SOUL **自由即兴** 3-5 轮
5. Director 收场（戏是"打开的"，不是"关闭的"）

**产出**：`scenes/scene-<NN>.raw.md`

**关键**：Director 不写台词。相信角色。

---

### Step 8：角色朗读（⭐ 灵魂环节）

**命令**：`@table-read`

**流程**：
1. 选朗读模式（literal / emotional / subtextual / improvised）
2. 每个角色以**演员视角**朗读自己的台词
3. 标注 ✅ / ⚠️ / ❌
4. 可能给出**即兴改写版本**
5. 可能出现**即兴彩蛋**（角色加戏）

**产出**：`scenes/scene-<NN>.read.md`

**关键**：**作者读自己的台词永远觉得挺好，让角色自己读才知道立不立得住。**

---

### Checkpoint：用户决策点

每个 TableRead 后**强制暂停**：

```
1. ✅ 全部采纳 → 生成 final.md
2. 🎨 部分采纳
3. 💡 只采纳即兴彩蛋
4. ❌ 都不采纳 → raw 就是 final
5. 🔄 重读一遍（换 mode）
6. ☕ 先放着
```

**产出**：`scenes/scene-<NN>.final.md`（如果采纳）

**关键**：你永远是 Boss。

---

### Step 9：多轮重写（⭐ 可选）

**命令**：`@rewrite-loop`

**三遍结构**：

#### 🦴 Round 1：Bone Pass（骨架）
- 结构是否成立？
- 可能改动：增/删/合/序场次

#### 💪 Round 2：Flesh Pass（血肉）
- 人物是否立住？
- 可能改动：对白 + 内心 + 动机

#### 🌊 Round 3：Breath Pass（呼吸）
- 节奏和情绪曲线
- 可能改动：段落长短 + 留白 + 语感

#### 🔮 Round 4：Soul Pass（灵魂，可选）
- 只对话不改字
- 问你三个问题，你自问自答

**关键**：每遍之间**默认不连续执行**。建议冷却（Flesh 隔 1 小时，Breath 隔 1 天）。

**产出**：`rewrites/round-*.md`

---

### Step 10：格式塔诊断（⭐ 可选）

**命令**：`@script-doctor`

**四遍阅读法**：

#### Pass 1：Surface（表层）
- 只记录"读完的感觉"，不分析

#### Pass 2：Structure（结构）
- 情绪温度曲线 / 张力曲线 / 主题反复

#### Pass 3：Character（人物）
- 每个角色的情感轨迹 / 弧光完成度

#### Pass 4：Diagnosis（诊断）
- 对比 Pass 1 和 Pass 2/3 的"违和感"
- 最多 5 个观察
- **每个观察都以疑问句结尾**
- **允许"你是刻意的"豁免**

**产出**：`doctor-notes.md`

**关键**：医生"读三遍不说话，第四遍才开口"。

---

### 最终组装：Editor

**命令**：`@editor`（Post-production 阶段）

**流程**：
1. 读取所有 `scene-*.final.md`
2. 按**叙事顺序**（非故事时间）组装
3. **设计过渡**（直切/桥梁/时间标记/渐变）
4. 生成最终稿 + 元信息

**产出**：
- `out/final-story.md` 🎉
- `out/final-story.meta.md`

---

## 灵活的工作流

上面是"完整流程"，但实际创作不必按部就班：

### 最短流程（15 分钟出短稿）
```
creative-intent → producer → screenwriter →
casting-director → director → table-read → editor
```

### 中等流程（加质量关）
```
最短流程 + story-consultant + rewrite-loop（只 Bone）
```

### 完整流程（最高质量）
```
所有 10 步 + 3 遍 rewrite + 四遍阅读
```

---

## 关键原则（写给用户）

1. **你永远是 Boss**：每个 Checkpoint 都可以推翻、重做、暂停
2. **呼吸感很重要**：不要一口气跑完，放一放再回来
3. **反规则要标明**：在 intent.json 里标明的"刻意为之"会被保护
4. **允许"还没想好"**：任何 Skill 都接受空答案
5. **角色会反驳你**：这是功能不是 bug

---

## 结尾

> **当你关掉 CodeBuddy 时，应该觉得"今天写得真爽"，而不是"AI 帮我写完了"。**

这是 Story Engine 的终极目标。
