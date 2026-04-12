#!/usr/bin/env node

/**
 * drama-agent CLI v5 — Monorepo 大仓版
 *
 * 路由到 drama-harness/scripts/ 中的对应脚本。
 * 所有业务逻辑在 Skills 中，这里只做参数分发。
 *
 * 全局参数：
 *   --story <name>   指定操作哪个故事子项目（stories/<name>/）
 *   --name <name>    init 时指定新故事名称
 */

const SKILLS_BASE = '.codebuddy/skills';

const ROUTES = {
  init: `${SKILLS_BASE}/drama-harness/scripts/story-init.js`,
  sim: `${SKILLS_BASE}/drama-harness/scripts/init.js`,
  status: `${SKILLS_BASE}/drama-harness/scripts/status.js`,
  recall: `${SKILLS_BASE}/drama-harness/scripts/memory.js`,
  roll: `${SKILLS_BASE}/drama-harness/scripts/snapshot.js`,
  validate: `${SKILLS_BASE}/drama-harness/scripts/validate.js`,
};

// 从 argv 中提取全局参数（--story / --name），返回清理后的 argv
function extractGlobalArgs(argv) {
  const globals = {};
  const cleaned = [];

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--story' && argv[i + 1]) {
      globals.story = argv[++i];
    } else if (argv[i] === '--name' && argv[i + 1]) {
      globals.name = argv[++i];
    } else {
      cleaned.push(argv[i]);
    }
  }

  return { globals, cleaned };
}

async function run() {
  const command = process.argv[2];
  const rawArgs = process.argv.slice(3);
  const { globals, cleaned } = extractGlobalArgs(rawArgs);

  if (!command || command === 'help' || command === '--help') {
    console.log(`
DramaAgent v5 — AI 叙事引擎（Monorepo 大仓版）

用法：
  drama-agent <command> [--story <name>] [options]

全局参数：
  --story <name>    指定操作哪个故事（stories/<name>/）
  --name <name>     init 时指定新故事名称

命令：
  init              初始化一个新故事子项目
                    --name my-story --preset mystery
                    --name my-story --from seed.yaml

  sim <ep-id>       启动模拟 Session
                    --story my-story --title "标题"
                    --agents a,b,c --skill screenplay

  status [ep-id]    查看状态（无 --story 时列出所有故事）

  recall <agent>    查询 Agent 记忆
                    --story my-story --search "关键词"

  roll <ep-id>      快照回滚
                    --story my-story --to latest

  validate          校验 Agent（SOUL/MEMORY/RULES）
                    --story my-story
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
    // 将全局参数注入到 argv 中供子命令使用
    // 子命令通过 parseArgs 或自行解析获取 --story / --name
    const argsWithGlobals = [...cleaned];
    if (globals.story) argsWithGlobals.push('--story', globals.story);
    if (globals.name) argsWithGlobals.push('--name', globals.name);
    await mod.main(argsWithGlobals);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}

run();
