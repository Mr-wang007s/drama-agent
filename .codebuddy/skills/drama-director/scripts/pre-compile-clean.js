#!/usr/bin/env node
/**
 * pre-compile-clean.js
 *
 * Phase 3.0：在跑 check-ai-taste 之前批量清理 AI 味高频问题。
 * 能节省 1-2 轮修订往返。
 *
 * 用法：
 *   node pre-compile-clean.js <novel.md path>
 *   node pre-compile-clean.js --story jiu-ge --episode ep05-li-zi-gao
 *
 * 规则（来自 EP01-EP04 实战沉淀）：
 *   1. 破折号 —— 全部改为 ，（仅在对话行 "..."——，"..." 中保留）
 *   2. **加粗** 全部去掉
 *   3. ## 二级/三级标题（中文数字编号）全部去掉
 *   4. 报告（不自动改）：对偶句计数、三连排比计数
 *
 * 退出码：
 *   0 = 无改动
 *   1 = 有改动（已写回）
 *   2 = 文件不存在
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

function parseArgs(argv) {
  const args = { story: null, episode: null, file: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--story') args.story = argv[++i];
    else if (a === '--episode') args.episode = argv[++i];
    else if (!args.file) args.file = a;
  }
  return args;
}

function resolveFile(args) {
  if (args.file) return path.resolve(args.file);
  if (args.story && args.episode) {
    const repoRoot = path.resolve(url.fileURLToPath(import.meta.url), '..', '..', '..', '..', '..');
    return path.join(repoRoot, 'stories', args.story, 'episodes', args.episode, 'output', 'novel.md');
  }
  console.error('用法: pre-compile-clean.js <novel.md> 或 --story <name> --episode <ep-id>');
  process.exit(2);
}

function clean(content) {
  const stats = { dashes: 0, bolds: 0, headings: 0, dashLines: 0 };

  // 1. 破折号 —— → ，（但对话内 "...——"结尾的保留，通常对话引号内的情境性使用）
  //    保守策略：一律转成逗号，如果对话真需要打断，后期手工调整（实战中几乎不需要）
  content = content.replace(/——/g, (m) => {
    stats.dashes++;
    return '，';
  });

  // 2. **加粗** 全部去掉（正文不应有加粗）
  content = content.replace(/\*\*(.+?)\*\*/g, (_m, inner) => {
    stats.bolds++;
    return inner;
  });

  // 3. ## 中文数字 / 阿拉伯数字小节标题（## 一、## 1. 等）全部去掉
  content = content.replace(/^## [一二三四五六七八九十\d]+[、．.]?\s*.*$\r?\n?/gm, () => {
    stats.headings++;
    return '';
  });

  // 4. 清理连续空行
  content = content.replace(/\r?\n\r?\n\r?\n+/g, '\n\n');

  return { content, stats };
}

function report(content) {
  // 对偶句 "不是X，是Y" / "不是X，而是Y"
  const duals = (content.match(/不是[^\r\n，。]{1,30}[，,](?:是|而是)/g) || []).length;
  // 三连排比 "A的B，C的D，E的F" 粗略
  const paras = content.split(/\r?\n\s*\r?\n/);
  let triads = 0;
  for (const p of paras) {
    if ((p.match(/[，,][^，,。]{2,15}[，,][^，,。]{2,15}[，,]/g) || []).length >= 2) triads++;
  }
  // 单词/短语独占段（≤8 字且无标点）
  let shortParas = 0;
  for (const p of paras) {
    const t = p.trim();
    if (t && t.length <= 8 && !/[。？！；]/.test(t)) shortParas++;
  }
  return { duals, triads, shortParas };
}

function main() {
  const args = parseArgs(process.argv);
  const filePath = resolveFile(args);
  if (!fs.existsSync(filePath)) {
    console.error(`文件不存在：${filePath}`);
    process.exit(2);
  }
  const original = fs.readFileSync(filePath, 'utf8');
  const { content, stats } = clean(original);
  const changed = content !== original;

  console.log('=== pre-compile-clean 报告 ===');
  console.log(`文件: ${filePath}`);
  console.log(`自动清理：`);
  console.log(`  破折号 —— → ，          ${stats.dashes} 处`);
  console.log(`  **加粗** 去除            ${stats.bolds} 处`);
  console.log(`  ## 标题行删除           ${stats.headings} 处`);

  const advisory = report(content);
  console.log(`\n建议自查（不自动改）：`);
  console.log(`  "不是X，是Y" 对偶句      ${advisory.duals} 处（软上限 3）`);
  console.log(`  三连排比段              ${advisory.triads} 处（软上限 2）`);
  console.log(`  单词/短语独占段         ${advisory.shortParas} 处（软上限 5）`);

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\n✅ 已写回（改动生效）`);
    process.exit(1);
  } else {
    console.log(`\n✅ 无需改动`);
    process.exit(0);
  }
}

main();
