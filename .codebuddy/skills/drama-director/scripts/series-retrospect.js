#!/usr/bin/env node
/**
 * series-retrospect.js — 系列复盘（Phase 6，每 3 集触发）
 *
 * 回顾最近 3 集的评审报告，识别系列级问题，产出长期建议。
 *
 * 用法：
 *   node scripts/series-retrospect.js --story <name> --episode <ep-id>
 *   node scripts/series-retrospect.js --story <name> --check-trigger --episode-number <N>
 *
 * 退出码：
 *   0 = 正常
 *   2 = 参数错误
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
    else if (a === '--episode') args.episode = argv[++i];
    else if (a === '--check-trigger') args.checkTrigger = true;
    else if (a === '--episode-number') args.episodeNumber = parseInt(argv[++i], 10);
  }
  return args;
}

function shouldTrigger(episodeNumber) {
  return episodeNumber % 3 === 0;
}

function getRecentEpisodes(storyDir, currentEp, count = 3) {
  const epsDir = path.join(storyDir, 'episodes');
  if (!fs.existsSync(epsDir)) return [];

  const allEps = fs.readdirSync(epsDir)
    .filter(d => d.startsWith('ep') && fs.statSync(path.join(epsDir, d)).isDirectory())
    .sort();

  const currentIdx = allEps.indexOf(currentEp);
  if (currentIdx === -1) return allEps.slice(-count);

  const start = Math.max(0, currentIdx - count + 1);
  return allEps.slice(start, currentIdx + 1);
}

function collectReports(storyDir, episodes) {
  const reports = [];
  for (const ep of episodes) {
    const epDir = path.join(storyDir, 'episodes', ep, 'output');
    const report = {
      episode: ep,
      criticReport: null,
      readerReport: null,
      expertReport: null,
    };

    const criticPath = path.join(epDir, 'critic-report.md');
    if (fs.existsSync(criticPath)) report.criticReport = fs.readFileSync(criticPath, 'utf8').slice(0, 500);

    const readerPath = path.join(epDir, 'reader-panel-report.md');
    if (fs.existsSync(readerPath)) report.readerReport = fs.readFileSync(readerPath, 'utf8').slice(0, 500);

    const expertPath = path.join(epDir, 'expert-panel-report.md');
    if (fs.existsSync(expertPath)) report.expertReport = fs.readFileSync(expertPath, 'utf8').slice(0, 500);

    reports.push(report);
  }
  return reports;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.checkTrigger) {
    if (args.episodeNumber === undefined) {
      console.error('用法: series-retrospect.js --check-trigger --episode-number <N>');
      process.exit(2);
    }
    const trigger = shouldTrigger(args.episodeNumber);
    console.log(JSON.stringify({ trigger, episodeNumber: args.episodeNumber, reason: trigger ? '每3集触发' : '非触发点' }));
    process.exit(0);
  }

  if (!args.story || !args.episode) {
    console.error('用法: series-retrospect.js --story <name> --episode <ep-id>');
    console.error('     或 series-retrospect.js --check-trigger --episode-number <N>');
    process.exit(2);
  }

  const storyDir = path.join(ROOT, 'stories', args.story);
  if (!fs.existsSync(storyDir)) {
    console.error(`❌ 故事目录不存在: ${storyDir}`);
    process.exit(2);
  }

  const epNum = parseInt((args.episode || '').match(/\d+/)?.[0] || '0', 10);
  if (!shouldTrigger(epNum)) {
    console.log(`ℹ️  EP${epNum} 不是复盘触发点（每 3 集触发，下次: EP${Math.ceil(epNum / 3) * 3}）`);
    process.exit(0);
  }

  const recentEps = getRecentEpisodes(storyDir, args.episode, 3);
  const reports = collectReports(storyDir, recentEps);

  console.log(`\n=== 系列复盘 · ${args.story} · ${args.episode} ===\n`);
  console.log(`回顾范围: ${recentEps.join(', ')}`);
  console.log('');

  for (const r of reports) {
    console.log(`--- ${r.episode} ---`);
    console.log(`  Critic: ${r.criticReport ? '有' : '无'}`);
    console.log(`  Reader: ${r.readerReport ? '有' : '无'}`);
    console.log(`  Expert: ${r.expertReport ? '有' : '无'}`);
  }

  console.log('\n--- 复盘指引 ---');
  console.log('Director 应在此基础上 spawn 读者 Team + 专家 Team 做联合长评：');
  console.log('1. 跨集视角审视节奏趋势（越来越慢？越来越快？）');
  console.log('2. 角色弧线推进（有角色停滞了吗？）');
  console.log('3. 钩子积压（A 级钩子超 5 集未回收？）');
  console.log('4. 意象推进（哪些意象需要从"引入"推到"挑战"？）');
  console.log('5. 系列级建议沉淀到 .codebuddy/rules/pro-advisory-notes.md');

  const outputFile = path.join(storyDir, 'episodes', args.episode, 'output', `series-retrospect-${args.episode}.md`);
  console.log(`\n输出路径: ${path.relative(ROOT, outputFile)}`);
}

main();
