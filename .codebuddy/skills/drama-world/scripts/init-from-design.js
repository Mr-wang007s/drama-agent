#!/usr/bin/env node
/**
 * init-from-design.js — 从设计文档一键生成故事项目骨架
 *
 * 从一份 Markdown 设计文档中提取：
 *   - 故事元信息（标题、题材、卖点）
 *   - 世界观（物理层/势力/时间线）
 *   - 角色清单（按 S/A/B/C 分级）
 *
 * 生成：
 *   stories/<name>/
 *     ├── .story.json
 *     ├── story-seed.yaml
 *     ├── world/ (bible.md, state.json, timeline.md)
 *     └── agents/ (占位 + C-CLASS-INDEX.yaml)
 *
 * 然后配合 character-pack.yaml + import-characters.js 填充角色。
 *
 * 用法：
 *   node scripts/init-from-design.js --name jiu-ge --from docs/xxx-design.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--name') args.name = argv[++i];
    else if (a === '--from') args.from = argv[++i];
    else if (a === '--force') args.force = true;
  }
  return args;
}

// 从 markdown 中提取指定标题下的正文片段
function extractSection(markdown, titlePatterns) {
  const lines = markdown.split('\n');
  for (const pattern of titlePatterns) {
    const regex = new RegExp(`^#{1,4}\\s+.*${pattern}.*$`, 'i');
    let i = lines.findIndex((l) => regex.test(l));
    if (i === -1) continue;
    const startLevel = (lines[i].match(/^#+/) || [''])[0].length;
    const section = [];
    for (let j = i + 1; j < lines.length; j++) {
      const headMatch = lines[j].match(/^(#+)\s/);
      if (headMatch && headMatch[1].length <= startLevel) break;
      section.push(lines[j]);
    }
    return section.join('\n').trim();
  }
  return '';
}

function extractTitle(markdown) {
  const m = markdown.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '未命名';
}

// 尝试从设计文档中提取势力列表（粗略）
function extractFactions(markdown) {
  const section = extractSection(markdown, ['势力', '派系', '阵营', 'factions']);
  if (!section) return [];
  const factions = [];
  // 匹配类似 "**九歌司**" 或 "- 九歌司：..." 的条目
  const lines = section.split('\n');
  for (const line of lines) {
    const m = line.match(/^[-*]\s+\*?\*?([^：:*\n]{2,20})\*?\*?\s*[：:]/)
         || line.match(/^\*\*([^*]{2,20})\*\*/);
    if (m) {
      factions.push(m[1].trim());
    }
  }
  return [...new Set(factions)];
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.name || !args.from) {
    console.error('用法: init-from-design.js --name <story-name> --from <design.md>');
    process.exit(1);
  }

  const designPath = path.resolve(args.from);
  if (!fs.existsSync(designPath)) {
    console.error(`❌ 设计文档不存在: ${designPath}`);
    process.exit(1);
  }

  const storyRoot = path.join(ROOT, 'stories', args.name);
  if (fs.existsSync(storyRoot) && !args.force) {
    console.error(`❌ 故事已存在: ${storyRoot}  (加 --force 覆盖)`);
    process.exit(1);
  }

  const markdown = fs.readFileSync(designPath, 'utf8');
  const title = extractTitle(markdown);
  const worldView = extractSection(markdown, ['世界观', 'world']);
  const timelineSec = extractSection(markdown, ['时间线', 'timeline', '历史']);
  const factions = extractFactions(markdown);

  console.log('=== 从设计文档初始化故事 ===');
  console.log(`  标题: ${title}`);
  console.log(`  势力: ${factions.length > 0 ? factions.join('/') : '（未检测到）'}`);
  console.log(`  目标: stories/${args.name}/\n`);

  // 创建目录
  fs.mkdirSync(path.join(storyRoot, 'world'), { recursive: true });
  fs.mkdirSync(path.join(storyRoot, 'agents'), { recursive: true });
  fs.mkdirSync(path.join(storyRoot, 'episodes'), { recursive: true });

  // .story.json
  fs.writeFileSync(
    path.join(storyRoot, '.story.json'),
    JSON.stringify({
      id: args.name,
      title,
      genre: '未定义',
      seedSource: path.relative(storyRoot, designPath),
      createdAt: new Date().toISOString().slice(0, 10),
    }, null, 2),
    'utf8'
  );

  // world/bible.md
  const bibleContent = `# ${title} · 世界观圣经\n\n` +
    `> 从设计文档自动生成：${path.basename(designPath)}\n\n` +
    (worldView ? `## 世界观\n\n${worldView}\n\n` : '## 世界观\n\n*（待补充）*\n\n');
  fs.writeFileSync(path.join(storyRoot, 'world', 'bible.md'), bibleContent, 'utf8');

  // world/state.json
  const state = {
    story_id: args.name,
    title,
    current_episode: null,
    current_scene: null,
    time_period: '故事起点',
    global_tension: 0.3,
    factions: factions.reduce((acc, name, i) => {
      acc[`f_${i + 1}`] = { name, status: '活跃', tension: 0.3 };
      return acc;
    }, {}),
    agent_roster: { S: [], A_count: 0, B_count: 0, C_count: 0 },
    active_agents: [],
    unresolved_threads: [],
    carry_over: [],
  };
  fs.writeFileSync(
    path.join(storyRoot, 'world', 'state.json'),
    JSON.stringify(state, null, 2),
    'utf8'
  );

  // world/timeline.md
  const timelineContent = `# ${title} · 时间线\n\n` +
    (timelineSec || '*（待补充）*') + '\n';
  fs.writeFileSync(path.join(storyRoot, 'world', 'timeline.md'), timelineContent, 'utf8');

  // agents/C-CLASS-INDEX.yaml（占位）
  const indexContent = `meta:\n  story: ${args.name}\n  tier: C\n  version: "4.0"\n  updated_at: ${new Date().toISOString().slice(0, 10)}\n\ncharacters: []\n`;
  fs.writeFileSync(
    path.join(storyRoot, 'agents', 'C-CLASS-INDEX.yaml'),
    indexContent,
    'utf8'
  );

  // agents/README.md 提示下一步
  const readme = `# ${title} · 角色目录\n\n## 下一步\n\n1. 编辑 character-pack.yaml，按 S/A/B/C 分级定义角色\n2. 运行: \`node scripts/import-characters.js --story ${args.name} --from character-pack.yaml\`\n\n目录命名规则: \`<tier>_<id>/\`  (如 s_lin-mo, a_shen-qingyuan)\n`;
  fs.writeFileSync(path.join(storyRoot, 'agents', 'README.md'), readme, 'utf8');

  console.log('✅ 初始化完成');
  console.log(`\n目录: ${storyRoot}`);
  console.log('\n下一步:');
  console.log(`  1. 编辑角色 pack（参考 .codebuddy/skills/drama-world/templates/character-pack.yaml）`);
  console.log(`  2. 运行: node scripts/import-characters.js --story ${args.name} --from <pack.yaml>`);
}

main();
