# DramaAgent v6 能力升级说明

> v6 的核心是**在现有 Skill 上迭代**，不是堆更多工具。所有批量化能力都归属到对应 Skill 下的 `scripts/`，
> 通过自然对话触发 Skill，由主 Agent 识别意图后调用。CLI 命令作为**可选后备**保留。

## 架构原则

```
用户自然对话 → Skill 识别意图 → 主 Agent 执行流程（可能调脚本）
                  ↓
              不是：用户 → 命令行 → 脚本
```

## 归属总览

| 能力 | 归属 Skill | 脚本位置 |
|------|-----------|---------|
| 故事初始化（从种子） | drama-harness | `story-init.js` |
| **故事初始化（从设计文档）** | drama-harness | `init-from-design.js` |
| 单角色深度创建 | drama-harness | `character-init.js` |
| **批量角色导入** | drama-harness | `import-characters.js` |
| **分级管理（前缀/升降级）** | drama-harness | `retier.js` |
| **Roster 同步 + 使用度分析** | drama-harness | `sync-roster.js` |
| 角色校验 | drama-harness | `validate-character.js` |
| 快照/回滚 | drama-harness | `snapshot.js` |
| **AI 味量化检测** | drama-critic | `check-ai-taste.js` |
| 人格五维评估 | drama-critic | `evaluate.js` |
| 头脑风暴编排 | drama-brainstorm | （纯 Skill，无脚本） |

粗体标注的是 v6 新增。

## 对话驱动工作流

### 场景 1：从零打造新故事

```
用户："我想基于考古悬疑做一个新小说"
↓
[drama-brainstorm 触发]
三专家并行 → 整合 → docs/xxx-design.md
↓
用户："开工"
↓
[drama-harness 触发，自动连续动作]
1. init-from-design --from docs/xxx-design.md
   → 生成 stories/xxx/ 骨架
2. 基于设计文档生成 character-pack.yaml
3. import-characters --from character-pack.yaml
   → 批量创建所有 S/A/B/C 级角色，目录自动加前缀
4. sync-roster
   → 更新 state.json + CHARACTER-INDEX.md
5. 报告："80 人就位，可以开始 EP01"
```

### 场景 2：续写（含 AI 味门控）

```
用户："续写"
↓
[drama-director 触发]
Phase 1: 规划 → Phase 2: 导演 → Phase 3: 编译 novel.md
Phase 4: 评审
  ↓
  [drama-critic 触发]
  → check-ai-taste.js 量化检查
  → 有 Error 返回 Director 返工
  → 无 Error 继续五维人格评估
  → 写 critic-report.md
Phase 5: wrap
```

### 场景 3：丰富现有故事的角色

```
用户："角色太少，丰富一下"
↓
[drama-harness 触发]
1. 读取 world/bible.md + 现有角色
2. 设计补充清单（按 S/A/B/C 分级）
3. 生成 pack.yaml
4. import-characters + sync-roster
```

### 场景 4：检查文风

```
用户："EP06 的 AI 味太重，帮我查"
↓
[drama-critic 触发]
→ check-ai-taste.js --episode ep06
→ 输出量化报告 + 问题定位
→ （可选）Director 按报告返工
```

## 分级标准

| 级别 | 数量 | 模板 | 字段要求 | 目录 |
|------|------|------|---------|------|
| **S** | 5-8 | `templates/soul-s.yaml` | 完整 OCEAN + trauma 四要素 + motivation 四要素 + voice(3 quirks) + 3 triggers + 4F + 3 examples + ≥2 relationships + arc | `s_<id>/` |
| **A** | 10-15 | `templates/soul-a.yaml` | 完整（略简）+ 2 examples | `a_<id>/` |
| **B** | 20-30 | `templates/soul-b.yaml` | 核心 OCEAN + trauma(ghost/wound) + want/fear + voice 基础 | `b_<id>/` |
| **C** | 30-50 | `templates/c-class-index.yaml` | 极简标签 + 一句话 | 合并在 `C-CLASS-INDEX.yaml` |

**长篇（150-200 万字）推荐总数 65-100 人。**

**MEMORY 容量**：S=2000 / A=1200 / B=600 字符。

## 目录命名约定

所有 agent 目录**必须**以 `<tier>_` 开头：

```
agents/
├── s_lin-mo/              ← S 级主角
├── s_shen-yanzhi/
├── a_bai-lu/              ← A 级
├── b_feng-yu/             ← B 级
├── C-CLASS-INDEX.yaml     ← C 级合并
└── CHARACTER-INDEX.md     ← sync-roster 自动生成
```

迁移老目录：

```bash
npm run drama -- retier --story <name> --apply-prefix --dry-run  # 预览
npm run drama -- retier --story <name> --apply-prefix            # 执行
```

## CLI 命令参考（仅作后备）

> 正常工作流是对话式的，不需要记命令。以下命令主要用于：脚本集成、CI、快速测试。

| 命令 | 作用 |
|------|------|
| `drama init-from-design --name <x> --from <design.md>` | 从设计文档生成骨架 |
| `drama import-characters --story <x> --from <pack>` | 批量导入角色 |
| `drama retier --story <x> --apply-prefix` | 批量加前缀 |
| `drama retier --story <x> --id <y> --from b --to a` | 单角色升降级 |
| `drama sync-roster --story <x> [--check-usage]` | 同步 roster + 使用度分析 |
| `drama check-style --story <x> --episode <ep>` | AI 味量化检测 |

所有命令加 `--dry-run`（适用的）可先预览。

## 与旧 v5 工作流的关系

- **v5 命令全部保留**（init / sim / status / recall / roll / validate / create-character）
- **v6 只在现有 Skill 上加料**：drama-harness 多了 4 个工具，drama-critic 多了 1 个
- **drama-brainstorm 是 v5 遗留**（本次对话前已存在），继续使用

## 不要做的事

- ❌ 不要为了加能力而新建 Skill。能加到现有 Skill 的就加（比如 AI 味检测放 critic，批量角色放 harness）
- ❌ 不要期望用户记 CLI 命令。正常流程应该是"用户说人话 → Skill 触发 → Agent 完成"
- ❌ 不要把工具脚本放 `scripts/` 顶级目录。归属到对应 Skill 的 `scripts/` 下
