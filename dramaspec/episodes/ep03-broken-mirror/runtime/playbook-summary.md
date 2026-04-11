# Playbook · ep03-broken-mirror

- **标题**：碎镜
- **模式**：🚀 Team Agent 并行（M5）
- **Team**：drama-ep03-broken-mirror
- **创建时间**：2026-04-11T13:04:40.070Z
- **Carry-overs**：F-06: 旧排练录像被截掉的 30 秒里拍到了什么？; F-07: 匿名委托人声称拥有'更好的筹码'，目的和身份未明。
- **角色**：高鸣、林七、苏遥
- **场景数**：4

## 执行流程

### Step 1: director

- **描述**：导演分场 + 写导演指令
- **Skill**：drama-director
- **输出**：`director-notes.md`

### Step 2: characters (等待 step 1)

- **描述**：角色群按导演指令演绎场景
- **Skill**：drama-character
- **输出**：`S01.md`, `S02.md`, `S03.md`, `S04.md`

### Step 3: narrator (等待 step 2)

- **描述**：旁白整合为完整叙事
- **Skill**：drama-narrator
- **输出**：`narrative.md`

### Step 4: quality (等待 step 3)

- **描述**：质量验收
- **Skill**：drama-quality
- **输出**：`check-report.md`

## Team 模式执行指令

```
1. team_create({ team_name: "drama-ep03-broken-mirror" })
2. Spawn each agent as a team member. Agents in the same phase can run in parallel.
3. Send shutdown_request to all agents, then team_delete().
4. 若 PASS: Run: node ./bin/drama-agent.js wrap ep03-broken-mirror
```

## 快速执行（金手指调度器）

```bash
# 生成各步 prompt
node ./bin/drama-agent.js play ep03-broken-mirror --execute
```

---

*由 play.js v2.0 自动生成*