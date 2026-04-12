---
name: drama:create-character
description: 创建一个新角色——支持多种创建方式，确保每个角色都有「影帝实力」
---

### 用法

```bash
# 交互式创建（回答 5 个核心问题）
drama-agent create-character --interactive

# 从简介生成（AI 扩展）
drama-agent create-character --from-brief "一个因童年火灾失去母亲的舞台监督，表面冷静但内心充满愧疚"

# 从原型启发
drama-agent create-character --archetype "反英雄" --genre "悬疑"

# 从小说/剧本提取
drama-agent create-character --extract-from novel.txt --character-name "林七"

# 指定角色 ID
drama-agent create-character --id "my-character" --interactive
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `--interactive` | flag | 四选一 | 交互式引导创建 |
| `--from-brief` | string | 四选一 | 从简介生成（AI 扩展） |
| `--archetype` | string | 四选一 | 从原型启发（需配合 --genre） |
| `--extract-from` | string | 四选一 | 从文本提取（需配合 --character-name） |
| `--id` | string | 可选 | 角色 ID，默认从名字生成 |
| `--genre` | string | 可选 | 题材（配合 --archetype 使用） |
| `--character-name` | string | 可选 | 角色名（配合 --extract-from 使用） |

### 创建模式详解

#### 1. 交互式创建（推荐）

引导用户回答「影帝角色 5 问」：

```
🎭 角色创建向导 — SOUL v4.0

Step 1/5: 这个角色最想要什么？(Want)
> 保护剧场不被关闭，查清火灾真相

Step 2/5: 这个角色最害怕什么？(Fear)
> 被认定为当年的共犯，或发现真相比想象的更糟

Step 3/5: 这个角色有什么不可告人的秘密？(Secret)
> 她偷偷保存了一卷从火场带出的旧排练录像

Step 4/5: 童年/过去发生过什么创伤事件？(Ghost)
> 十五年前的剧场火灾，她在后台听到求救声却没有冲进去

Step 5/5: 因此 TA 相信了什么错误的道理？(Lie)
> 只要我守住这个地方，就能弥补当年的过错

---
🧠 AI 正在生成完整的 SOUL v4.0 角色文件...
```

然后 AI 自动补全：
- OCEAN 人格数值
- Wound（从 Ghost 推导）
- Shield（从 Lie 推导）
- Need（Want 的反面或深层需求）
- 语言模式和口头禅
- 情绪触发器
- 压力反应模式
- 3 个典型行为范例

#### 2. 从简介生成

```bash
drama-agent create-character --from-brief "一个孤僻的天才黑客，曾经是大公司高管，因揭露公司丑闻被全行业封杀"
```

AI 会：
1. 解析简介中的关键信息
2. 推导创伤链（Ghost → Wound → Lie → Shield）
3. 生成 OCEAN 人格数值
4. 补全表演层细节

#### 3. 从原型启发

```bash
drama-agent create-character --archetype "导师" --genre "奇幻"
```

AI 会：
1. 加载原型模板（导师的常见特征）
2. 结合题材调整设定
3. 生成符合原型但有独特创伤的角色

#### 4. 从文本提取

```bash
drama-agent create-character --extract-from my-novel.txt --character-name "林七"
```

AI 会：
1. 在文本中搜索角色出场
2. 分析对话风格、行为模式
3. 推断心理特征
4. 生成 SOUL v4.0 文件

### 自动执行流程

1. **检测环境**
   - 确保 agents/ 目录存在
   - 检查角色 ID 是否已存在

2. **收集输入**
   - 根据创建模式收集必要信息

3. **AI 生成**（drama-harness/scripts/character-init.js）
   - 使用 SOUL v4.0 三层结构生成角色
   - 确保心理层的一致性（Ghost → Wound → Lie → Shield 链条合理）
   - 生成表演层的 few-shot 示例

4. **写入文件**
   ```
   agents/{id}/
     ├── SOUL.yaml    ← SOUL v4.0 完整结构
     ├── MEMORY.md    ← 初始化为空
     └── RULES.md     ← 从模板生成
   ```

5. **角色校验**（drama-harness/scripts/validate-character.js）
   - 检查 OCEAN 数值是否在合理范围
   - 检查创伤链是否逻辑一致
   - 检查 few-shot 示例是否符合人格

6. **输出报告**
   ```
   ✅ 角色创建完成！

   🎭 林七 (lin-qi)
   ├── 原型: 不可靠见证者 / 守护者
   ├── 角色定位: 舞台监督 / 调查者
   │
   ├── 🧠 心理层
   │   ├── OCEAN: O=45 C=72 E=32 A=38 N=58
   │   ├── Ghost: 十五年前的剧场火灾...
   │   ├── Wound: 幸存者愧疚
   │   ├── Lie: 只要我守住这个地方...
   │   └── Shield: 用忙碌和秩序感隔绝情绪
   │
   └── 🎬 表演层
       ├── 语气: 冷静、克制
       ├── 口头禅: "……"、"你确定？"
       └── 压力反应: Fight=用事实反击 | Freeze=沉默、眼神空洞

   📁 文件位置: agents/lin-qi/

   下一步:
     1. 查看角色: cat agents/lin-qi/SOUL.yaml
     2. 编辑调整: 手动修改 SOUL.yaml
     3. 开始模拟: drama-agent sim ep01 --agents lin-qi,other-agent
   ```

### 影帝角色校验标准

创建的角色会自动通过以下校验：

| 检查项 | 标准 | 严重程度 |
|--------|------|----------|
| OCEAN 范围 | 所有数值在 25-75 之间 | Warning |
| 创伤链一致性 | Ghost → Wound → Lie 逻辑连贯 | Error |
| Want vs Need | Want 和 Need 应有张力 | Warning |
| 语言示例 | 至少 3 个 few-shot 示例 | Error |
| 压力反应 | 4F 至少填写 2 项 | Warning |

### 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `NOT_INITIALIZED` | 故事未初始化 | 先运行 drama:init |
| `ID_EXISTS` | 角色 ID 已存在 | 使用不同的 --id |
| `INVALID_ARCHETYPE` | 无效的原型 | 使用可用原型 |
| `FILE_NOT_FOUND` | --extract-from 文件不存在 | 检查文件路径 |
| `CHARACTER_NOT_FOUND` | 在文本中找不到指定角色 | 检查 --character-name |
