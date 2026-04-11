---
description: 保护系列圣经和角色卡这类 canon 文件，避免被运行期内容污染
globs: "dramaspec/series-bible.md,dramaspec/characters/**/*.yaml"
alwaysApply: true
---

### Canon Guardrails

- `dramaspec/series-bible.md` 与 `dramaspec/characters/*.yaml` 属于系列常量层。
- 修改 canon 时必须说明原因：世界观修订、角色弧线重置、关系改写等。
- 不要把临时 run 结果、草稿台词、未验收结论直接写进 canon。
- 如果单集发现新的长期设定，应先记入 `feature_list.json` 或 `wrap-report.md`，再决定是否回写 canon。
