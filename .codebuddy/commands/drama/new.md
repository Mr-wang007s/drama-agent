---
name: drama:new
description: 新建一集目录并初始化 DramaSpec 四件套
---

### 用法

根据用户描述，推断或确认：

- `episode-id`（建议形如 `ep02-shadow-price`）
- 标题
- logline
- 所属 arc

然后执行：

```bash
node ./bin/drama-agent.js new <episode-id> --title "<标题>" --logline "<一句话梗概>" --arc "<篇章>"
```

### 完成后

1. 读取新建单集下的 `.dramaspec.json` 与四件套。
2. 向用户说明单集已创建成功。
3. 推荐下一步使用 `/drama:brief` 细化规格。
