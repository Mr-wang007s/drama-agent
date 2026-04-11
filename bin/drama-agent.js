#!/usr/bin/env node

/**
 * drama-agent CLI — 极简路由壳
 *
 * 路由到 drama-harness/scripts/ 中的对应脚本。
 * 所有业务逻辑在 Skills 中，这里只做参数分发。
 */

const command = process.argv[2];
const args = process.argv.slice(3);

const SKILLS_BASE = '.codebuddy/skills';

const ROUTES = {
  sim: `${SKILLS_BASE}/drama-harness/scripts/init.js`,
  status: `${SKILLS_BASE}/drama-harness/scripts/status.js`,
  recall: `${SKILLS_BASE}/drama-harness/scripts/memory.js`,
  roll: `${SKILLS_BASE}/drama-harness/scripts/snapshot.js`,
  validate: `${SKILLS_BASE}/drama-harness/scripts/validate.js`,
};

async function run() {
  if (!command || command === 'help' || command === '--help') {
    console.log(`
DramaAgent v3 — AI Agent 身份模拟平台

用法：
  drama-agent <command> [options]

命令：
  sim <ep-id>     启动模拟 Session
                  --title "标题" --logline "一句话"
                  --agents lin-qi,su-yao,gao-ming
                  --skill screenplay
                  --mode team|serial

  status [ep-id]  查看世界/Agent/Episode 状态

  recall <agent>  查询 Agent 记忆
                  --search "关键词"
                  --timeline

  roll <ep-id>    快照回滚
                  --to latest|<timestamp>

  validate        校验所有 Agent（SOUL/MEMORY/RULES）
`);
    return;
  }

  const scriptPath = ROUTES[command];
  if (!scriptPath) {
    console.error(`未知命令：${command}`);
    process.exitCode = 1;
    return;
  }

  try {
    const mod = await import(`../${scriptPath}`);
    await mod.main(args);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}

run();
