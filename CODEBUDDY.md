### `CODEBUDDY.md`

这个仓库用于把 `DramaAgent v3.2` 计划落成一个可维护的项目骨架。

### 你应该先理解的事实

- **`dramaspec/series-bible.md`** 是系列层总设定。
- **`dramaspec/characters/*.yaml`** 是角色 canon。
- **`dramaspec/episodes/<episode-id>/`** 是单集工作单元，映射 OpenSpec change。
- **`.codebuddy/commands/drama/*.md`** 是项目级命令入口。
- **`harness/hooks/hooks.json` + `scripts/hooks/*`** 是 hooks 资产，不要把 hook 逻辑写死在命令文档里。

### 常用命令

```bash
npm run drama -- status
npm run drama -- new ep02-shadow-price --title "影价"
npm run drama -- brief ep02-shadow-price
npm run drama -- run ep02-shadow-price
npm run drama -- scene ep02-shadow-price S02
npm run drama -- check ep02-shadow-price
npm run drama -- wrap ep02-shadow-price
npm run drama -- roll ep02-shadow-price --to latest
```

### 代码与数据不变量

- `feature_list.json` 只记录本集待兑现的剧情 feature、悬念与埋点。
- `scene-manifest.json` 是本集场景编排真相源。
- `check-report.md` 是验收输出，不应手工伪造“已通过”。
- `wrap-report.md` 负责把本集结论回写到 `series-state.json`。
- 快照保存在 `dramaspec/.snapshots/<episode-id>/`，回滚只对单集生效。

### 修改建议

- **改规格**：优先改模板与 `dramaspec` 示例。
- **改行为**：优先改 `src/cli.js`。
- **改 prompt**：优先改 `.codebuddy/commands` 与 `.codebuddy/skills`。
- **改自动化**：优先改 `scripts/hooks` 与 `harness/hooks/hooks.json`。

### 验证要求

每次改动后，至少考虑：

- `npm test`
- `npm run validate:characters`
- `npm run detect:stagnation`

### 不要做的事

- 不要把运行时结果直接写回 `series-bible.md`。
- 不要跳过 `check` 直接 `wrap`。
- 不要在没有快照的情况下覆盖单集目录。
- 不要让角色卡字段名和校验脚本脱节。
