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

  // v6: 批量化工具全部归属到对应 Skill（与架构哲学一致）
  'import-characters': `${SKILLS_BASE}/drama-harness/scripts/import-characters.js`,
  retier: `${SKILLS_BASE}/drama-harness/scripts/retier.js`,
  'sync-roster': `${SKILLS_BASE}/drama-harness/scripts/sync-roster.js`,
  'init-from-design': `${SKILLS_BASE}/drama-harness/scripts/init-from-design.js`,
  'check-style': `${SKILLS_BASE}/drama-critic/scripts/check-ai-taste.js`,
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
DramaAgent v6 — AI 叙事引擎（Monorepo 大仓版）

用法：
  drama-agent <command> [--story <name>] [options]

全局参数：
  --story <name>    指定操作哪个故事（stories/<name>/）
  --name <name>     init 时指定新故事名称

━━━ 核心命令 ━━━

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

━━━ 批量化工具（v6 新增）━━━

  init-from-design  从设计文档一键生成故事骨架
                    --name my-story --from docs/design.md

  import-characters 批量导入角色（pack.yaml → S/A/B/C 分级）
                    --story my-story --from pack.yaml

  retier            按 tier 字段给 agent 目录加前缀 / 单个升降级
                    --story my-story --apply-prefix
                    --story my-story --id xxx --from b --to a

  sync-roster       同步 state.json + 重建 CHARACTER-INDEX
                    --story my-story [--check-usage]

  check-style       AI 味自动检测（破折号/对偶/标签等）
                    --story my-story --episode ep01
                    --file path/to/novel.md
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
    // v6 新工具用子进程方式（自解析 process.argv），旧工具用 import(main) 方式
    const V6_TOOLS = new Set(['import-characters', 'retier', 'sync-roster', 'init-from-design', 'check-style']);
    const isNewTool = V6_TOOLS.has(command);
    if (isNewTool) {
      const { spawn } = await import('child_process');
      const { resolve, dirname } = await import('path');
      const { fileURLToPath } = await import('url');
      const __filename = fileURLToPath(import.meta.url);
      const rootDir = resolve(dirname(__filename), '..');
      const scriptAbs = resolve(rootDir, scriptPath);

      const argsWithGlobals = [...cleaned];
      if (globals.story) argsWithGlobals.push('--story', globals.story);
      if (globals.name) argsWithGlobals.push('--name', globals.name);

      await new Promise((res, rej) => {
        const child = spawn(process.execPath, [scriptAbs, ...argsWithGlobals], {
          stdio: 'inherit',
          cwd: rootDir,
        });
        child.on('exit', (code) => (code === 0 ? res() : rej(new Error(`exit ${code}`))));
        child.on('error', rej);
      });
    } else {
      const mod = await import(`../${scriptPath}`);
      const argsWithGlobals = [...cleaned];
      if (globals.story) argsWithGlobals.push('--story', globals.story);
      if (globals.name) argsWithGlobals.push('--name', globals.name);
      await mod.main(argsWithGlobals);
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}

run();
