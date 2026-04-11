### `drama-agent`

一个基于 **DramaSpec + Harness** 的多 Agent 剧情生产项目骨架，目标不是“直接写完整剧本”，而是把 **系列设定、角色卡、单集规格、场景队列、校验报告、归档状态** 放进同一个可持续迭代的工程里。

### 项目特点

- **DramaSpec 映射**：把 `OpenSpec` 的 change 工作流映射到“单集生产”。
- **Harness 资产齐全**：包含命令提示、rules、skills、hooks、校验脚本。
- **可运行 CLI**：支持 `new / brief / run / scene / check / wrap / status / roll` 八个命令。
- **可持续连载**：自带 `series-bible`、角色卡、系列状态、单集归档与快照回滚。
- **内置样例集**：仓库附带 `ep01-red-curtain`，方便直接查看一集从创建到 wrap 的落地形态。


### 目录概览

```text
.codebuddy/
  commands/drama/        # /drama:* 项目级命令
  rules/                 # DramaSpec 规则与护栏
  skills/                # 导演、角色、旁白、质量技能
bin/
  drama-agent.js         # CLI 入口
src/
  cli.js                 # 命令实现
scripts/
  hooks/                 # Harness hooks 脚本
  validate-character.js  # 角色卡校验
  detect-stagnation.js   # 卡滞检测
templates/               # 单集与系列模板
dramaspec/
  series-bible.md        # 系列圣经
  characters/            # 角色 YAML
  episodes/              # 单集目录
```

### 快速开始

```bash
npm run drama -- status
npm run drama -- new ep02-shadow-price --title "影价" --logline "导演想要一集围绕交易与背叛的中段集" --premise "一次交易失控后，主角必须在保全盟友与保全真相之间二选一"

npm run drama -- brief ep02-shadow-price
npm run drama -- run ep02-shadow-price
npm run drama -- check ep02-shadow-price
npm run drama -- wrap ep02-shadow-price
```

### 八个命令

- **`new`**：创建单集目录与四件套初稿。
- **`brief`**：补齐或重建单集规格文件。
- **`run`**：生成导演运行包与 scene 队列。
- **`scene`**：针对某一 scene 生成重演计划。
- **`check`**：产出 `check-report.md`。
- **`wrap`**：写入 `wrap-report.md`，同步系列状态。
- **`status`**：查看系列或单集进度。
- **`roll`**：从快照恢复单集状态。

### 设计原则

- **先养角色，再长剧情**：角色卡、关系网、情绪状态优先于台词拼接。
- **导演不代写台词**：导演负责节拍、冲突、限制与验收。
- **叙事层独立**：角色演绎与最终文学化改写解耦。
- **一切可追踪**：任何单集都应具备 brief、beat、spec、tasks、scene-manifest、check-report、wrap-report。

### 运行校验

```bash
npm test
npm run validate:characters
npm run detect:stagnation
npm run verify
```

### 下一步建议

1. 补写 `dramaspec/series-bible.md` 与角色卡。
2. 用 `/drama:new` 或 CLI 新建下一集。
3. 把 `harness/hooks/hooks.json` 合并到你自己的 CodeBuddy hooks 配置中。
