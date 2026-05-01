#!/usr/bin/env node
/**
 * sync-roster.js — 扫描 agents/ 目录，自动同步 roster 到 state.json 并重建 CHARACTER-INDEX.md
 *
 * 用法：
 *   node scripts/sync-roster.js --story jiu-ge
 *   node scripts/sync-roster.js --story jiu-ge --check-usage   # 额外扫描 episodes 输出，给出升降级建议
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
    if (a === '--story') args.story = argv[++i];
    else if (a === '--check-usage') args.checkUsage = true;
  }
  return args;
}

function readYamlField(text, key) {
  // 支持两种格式：
  //   tier: B                  （分行）
  //   { tier: B, name: xx }    （flow-style）
  const blockRegex = new RegExp(`^\\s*${key}:\\s*([^\\n{},]+)$`, 'm');
  const flowRegex = new RegExp(`[{,]\\s*${key}:\\s*([^,}]+?)(?=[,}])`);
  let m = text.match(blockRegex) || text.match(flowRegex);
  if (!m) return null;
  return m[1].trim().replace(/^["']|["']$/g, '');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.story) {
    console.error('用法: sync-roster.js --story <name> [--check-usage]');
    process.exit(1);
  }

  const storyRoot = path.join(ROOT, 'stories', args.story);
  const agentsDir = path.join(storyRoot, 'agents');
  const statePath = path.join(storyRoot, 'world', 'state.json');

  if (!fs.existsSync(agentsDir)) {
    console.error(`❌ ${agentsDir} 不存在`);
    process.exit(1);
  }

  // 扫描所有 agent 目录
  const tiers = { S: [], A: [], B: [] };
  const allAgents = [];

  for (const entry of fs.readdirSync(agentsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dirName = entry.name;
    const soulPath = path.join(agentsDir, dirName, 'SOUL.yaml');
    if (!fs.existsSync(soulPath)) continue;

    const content = fs.readFileSync(soulPath, 'utf8');
    const tier = (readYamlField(content, 'tier') || '').toUpperCase();
    const id = readYamlField(content, 'id') || dirName;
    const name = readYamlField(content, 'name') || dirName;
    const archetype = readYamlField(content, 'archetype') || '';
    const status = readYamlField(content, 'status') || 'active';

    if (tiers[tier]) tiers[tier].push({ dirName, id, name, archetype, status });
    allAgents.push({ tier, dirName, id, name, archetype, status });
  }

  // 扫描 C 级
  let cCount = 0;
  const cIndexPath = path.join(agentsDir, 'C-CLASS-INDEX.yaml');
  if (fs.existsSync(cIndexPath)) {
    const cContent = fs.readFileSync(cIndexPath, 'utf8');
    cCount = (cContent.match(/^\s+-\s+id:\s+/gm) || []).length;
  }

  console.log('=== Agent Roster 同步 ===');
  console.log(`  S级: ${tiers.S.length}`);
  console.log(`  A级: ${tiers.A.length}`);
  console.log(`  B级: ${tiers.B.length}`);
  console.log(`  C级: ${cCount}`);
  console.log(`  总计: ${tiers.S.length + tiers.A.length + tiers.B.length + cCount}\n`);

  // 更新 state.json
  if (fs.existsSync(statePath)) {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    state.agent_roster = {
      S: tiers.S.map((a) => a.dirName),
      A_count: tiers.A.length,
      B_count: tiers.B.length,
      C_count: cCount,
    };
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n', 'utf8');
    console.log('  ✅ state.json 的 agent_roster 已更新');
  }

  // 重建 CHARACTER-INDEX.md
  const indexLines = [`# ${args.story} · 角色索引`, '', '> 由 sync-roster.js 自动生成，请勿手工编辑', ''];
  for (const tier of ['S', 'A', 'B']) {
    if (tiers[tier].length === 0) continue;
    indexLines.push(`## ${tier} 级（${tiers[tier].length} 人）`, '');
    for (const a of tiers[tier]) {
      indexLines.push(`- **${a.name}** (\`${a.dirName}\`) — ${a.archetype}${a.status !== 'active' ? `  *[${a.status}]*` : ''}`);
    }
    indexLines.push('');
  }
  if (cCount > 0) {
    indexLines.push(`## C 级（${cCount} 人）`, '', `详见 [C-CLASS-INDEX.yaml](./C-CLASS-INDEX.yaml)`, '');
  }
  fs.writeFileSync(
    path.join(agentsDir, 'CHARACTER-INDEX.md'),
    indexLines.join('\n'),
    'utf8'
  );
  console.log('  ✅ CHARACTER-INDEX.md 已重建');

  // check-usage：扫描 episodes 下的出场统计
  if (args.checkUsage) {
    const episodesDir = path.join(storyRoot, 'episodes');
    if (!fs.existsSync(episodesDir)) {
      console.log('\n（无 episodes 目录，跳过使用度分析）');
      return;
    }

    const usage = {};
    const walk = (dir) => {
      for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir, f);
        const stat = fs.statSync(p);
        if (stat.isDirectory()) walk(p);
        else if (f === 'novel.md' || f === 'screenplay.md') {
          const text = fs.readFileSync(p, 'utf8');
          for (const a of allAgents) {
            // 用角色名计数（更贴近真实出场）
            if (!a.name) continue;
            const matches = text.match(new RegExp(a.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'));
            if (matches) {
              usage[a.dirName] = (usage[a.dirName] || 0) + matches.length;
            }
          }
        }
      }
    };
    walk(episodesDir);

    console.log('\n=== 角色使用度分析 ===');
    const suggestions = [];
    for (const a of allAgents) {
      const count = usage[a.dirName] || 0;
      // 升级建议：B 级出场 > 30 次 → 建议升 A
      if (a.tier === 'B' && count > 30) {
        suggestions.push(`  💡 ${a.dirName} 出场 ${count} 次，建议升级为 A 级`);
      }
      // 降级建议：S/A 级出场 = 0（且 episodes 非空）→ 建议降级
      if ((a.tier === 'S' || a.tier === 'A') && count === 0) {
        suggestions.push(`  💤 ${a.dirName} (${a.tier}) 零出场，考虑降级或删除`);
      }
    }
    if (suggestions.length > 0) {
      console.log(suggestions.join('\n'));
      console.log('\n用 retier 命令执行: node scripts/retier.js --story <name> --id <id> --from b --to a');
    } else {
      console.log('  ✅ 当前分级分布合理');
    }
  }
}

main();
