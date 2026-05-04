# 项目模板

新建故事项目时，请复制本目录为 `projects/<你的项目名>`，然后按顺序填入各个阶段产出的文件。

## 预期目录结构

```
projects/<项目名>/
├── intent.json                      # Step 1: creative-intent 产出
├── spec.md                          # Step 2: producer 产出
├── outline.md                       # Step 3-4: screenwriter 产出
├── consultant-notes.md              # Step 4.5: story-consultant 产出（可选）
├── editor-preview.md                # Step 5: editor 阶段 1（可选）
├── agents/                          # Step 6: casting-director 产出
│   ├── <角色名-1>.json
│   ├── <角色名-2>.json
│   └── _relationships.md            # 关系网（可选）
├── continuity/                      # script-supervisor 产出
│   ├── precheck.md                  # 预标
│   ├── log.md                       # 演绎时追加
│   └── editor-briefing.md           # 事后汇总
├── scenes/                          # Step 7-9: director + table-read 产出
│   ├── scene-01.raw.md              # director 原始演绎
│   ├── scene-01.read.md             # table-read 朗读报告
│   ├── scene-01.final.md            # 用户决策后的定稿
│   └── ...
├── rewrites/                        # rewrite-loop 产出（可选）
│   ├── round-1-bone.md
│   ├── round-2-flesh.md
│   └── round-3-breath.md
├── doctor-notes.md                  # script-doctor 四遍阅读报告（可选）
├── checkpoints/                     # 用户决策历史
│   └── <timestamp>.md
└── out/                             # 最终产物
    ├── final-story.md               # editor 最终组装
    └── final-story.meta.md          # 创作元信息
```

## 使用方式

1. 复制本目录：`cp -r projects/_template projects/<你的项目名>`
2. 在 CodeBuddy IDE 对话框输入：`@creative-intent 我想写一个...`
3. 跟随引擎引导逐步推进

本模板只是结构参考。实际创建时，各个 Skill 会按需生成对应文件。
