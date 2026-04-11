### Agent Play Plan · ep03-broken-mirror

- **标题**：碎镜
- **Team**：drama-ep03-broken-mirror
- **创建时间**：2026-04-11T12:48:23.707Z
- **Carry-overs**：F-06: 旧排练录像被截掉的 30 秒里拍到了什么？; F-07: 匿名委托人声称拥有'更好的筹码'，目的和身份未明。
- **角色**：高鸣、林七、苏遥
- **场景数**：4

### 执行流程

1. **director** — 导演分场 + 写导演指令
2. **characters** — 角色群按导演指令演绎 4 场戏
3. **narrator** — 旁白整合为完整叙事
4. **quality** — 质量验收
5. **harness** — 若 PASS → wrap；若 FAIL → 回到 step 1 修正

### Agent 角色

- **director**（phase 1）：读取 episode-brief 和 beat-sheet，为每个场景生成导演指令（director-notes.md）...
- **characters**（phase 2）：读取角色卡和导演指令，按 scene-manifest 顺序为每个场景演绎角色对话和行动。每个角色严格基于自己的 des...
- **narrator**（phase 3）：读取所有场景文件（runtime/scenes/S*.md），整合为一篇完整的叙事文本（narrative.md）。忠于...
- **quality**（phase 4）：对照 spec.md 的 must/should-not、scene acceptance、carry-over 兑现情...
