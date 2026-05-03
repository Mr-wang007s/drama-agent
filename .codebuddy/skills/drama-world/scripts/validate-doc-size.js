#!/usr/bin/env node
/**
 * validate-doc-size.js — 核心文档体积巡检
 *
 * 用途：
 *   对 SKILL.md（入口文件 · 严格上限）和 rules/*.md（约束源 · 合理上限）
 *   做行数 + 中文字数双维度体积校验，预防未来膨胀。
 *
 * 差异化配额（唯一事实源：.codebuddy/rules/doc-sync.md "核心文档体积上限"节）：
 *
 *   .codebuddy/skills/<skill>/SKILL.md
 *     行数 ≤ 150 · 中文字 ≤ 800 · error 级（超量阻断）
 *
 *   .codebuddy/rules/*.md
 *     行数 ≤ 250 · 中文字 ≤ 1800 · warning 级（超量提示 · 不阻断）
 *
 * 不约束（按需加载 · 天然较长）：
 *   references/craft/*.md · references/workflow.md · references/team-roster.md
 *   templates/ 下所有文件
 *
 * 用法：
 *   node validate-doc-size.js                      # 全扫描（默认）
 *   node validate-doc-size.js --json               # JSON 输出
 *   node validate-doc-size.js --strict             # warning 也算 FAIL
 *   node validate-doc-size.js --path <glob>        # 指定路径（用于精准检查）
 *
 * 退出码：
 *   0 = 全部通过（含 warning · 非 --strict 模式）
 *   1 = SKILL.md 有 error 级超量 · 或 --strict 模式下任意超量
 *   2 = 参数错误 / 路径不存在
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

// ============ 配额表（唯一事实源 · 同步于 doc-sync.md） ============
const DOC_CATEGORIES = [
  {
    name: 'SKILL.md（入口文件 · 严格上限）',
    match: (rel) => /^\.codebuddy\/skills\/[^/]+\/SKILL\.md$/.test(rel),
    scanRoot: '.codebuddy/skills',
    maxLines: 150,
    maxChars: 800,
    level: 'error',
  },
  {
    name: 'rules/*.md（约束源 · 合理上限）',
    match: (rel) => /^\.codebuddy\/rules\/[^/]+\.md$/.test(rel),
    scanRoot: '.codebuddy/rules',
    maxLines: 250,
    maxChars: 1800,
    level: 'warning',
  },
];

// ============ 工具函数 ============
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') args.json = true;
    else if (a === '--strict') args.strict = true;
    else if (a === '--path') args.path = argv[++i];
  }
  return args;
}

function countChineseChars(text) {
  return (text.match(/[\u4e00-\u9fff]/g) || []).length;
}

function countLines(text) {
  return text.split('\n').length;
}

function relFromRoot(absPath) {
  return path.relative(ROOT, absPath).split(path.sep).join('/');
}

function walkMdFiles(dirAbs) {
  const out = [];
  if (!fs.existsSync(dirAbs)) return out;
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dirAbs, e.name);
    if (e.isDirectory()) {
      // 不进入 references / scripts / templates
      if (['references', 'scripts', 'templates'].includes(e.name)) continue;
      out.push(...walkMdFiles(full));
    } else if (e.isFile() && e.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

// ============ 核心校验 ============
function validateFile(absPath, category) {
  const text = fs.readFileSync(absPath, 'utf8');
  const lines = countLines(text);
  const chars = countChineseChars(text);
  const overLines = lines > category.maxLines;
  const overChars = chars > category.maxChars;
  const overLimit = overLines || overChars;
  return {
    path: relFromRoot(absPath),
    lines,
    chars,
    maxLines: category.maxLines,
    maxChars: category.maxChars,
    level: category.level,
    status: overLimit ? (category.level === 'error' ? 'FAIL' : 'WARN') : 'OK',
    overLines,
    overChars,
  };
}

function runValidation(filterRel) {
  const results = [];
  for (const cat of DOC_CATEGORIES) {
    const scanDir = path.join(ROOT, cat.scanRoot);
    const files = walkMdFiles(scanDir).filter(f => cat.match(relFromRoot(f)));
    const categoryResults = [];
    for (const f of files) {
      const rel = relFromRoot(f);
      if (filterRel && !rel.includes(filterRel)) continue;
      categoryResults.push(validateFile(f, cat));
    }
    results.push({
      name: cat.name,
      level: cat.level,
      maxLines: cat.maxLines,
      maxChars: cat.maxChars,
      files: categoryResults,
    });
  }
  return results;
}

// ============ 输出 ============
function printHuman(categories, strict) {
  console.log('\n=== 核心文档体积巡检 ===\n');

  const ICON = { OK: '✅', WARN: '⚠️ ', FAIL: '❌' };
  let totalFails = 0;
  let totalWarns = 0;

  for (const cat of categories) {
    console.log(`\n### ${cat.name}`);
    console.log(`    上限：≤${cat.maxLines} 行 · ≤${cat.maxChars} 中文字 · [${cat.level}]\n`);
    if (cat.files.length === 0) {
      console.log('    （无匹配文件）');
      continue;
    }
    const pathWidth = Math.max(...cat.files.map(f => f.path.length));
    for (const f of cat.files) {
      const icon = ICON[f.status];
      const linesMark = f.overLines ? `*${f.lines}*` : `${f.lines}`;
      const charsMark = f.overChars ? `*${f.chars}*` : `${f.chars}`;
      console.log(`    ${icon} ${f.path.padEnd(pathWidth)}  ${String(linesMark).padStart(6)} 行 / ${String(charsMark).padStart(6)} 字`);
      if (f.status === 'FAIL') totalFails++;
      if (f.status === 'WARN') totalWarns++;
    }
  }

  console.log('');
  console.log('（斜体 *n* = 该维度超出上限）\n');

  const strictFail = strict && (totalFails > 0 || totalWarns > 0);

  if (totalFails > 0) {
    console.log(`❌ 失败：${totalFails} 个 SKILL.md error 级超量 · 必须瘦身到上限内`);
    console.log(`   瘦身指引：把重复内容下沉到 references/ · 用一句话 + 引用链接代替`);
  } else if (strictFail) {
    console.log(`❌ --strict 模式下失败：${totalWarns} 个 warning 级超量`);
  } else if (totalWarns > 0) {
    console.log(`⚠️  ${totalWarns} 个 rules/ warning 级超量（允许继续 · 建议按机会精简）`);
  } else {
    console.log('✅ 所有核心文档体积达标');
  }
}

// ============ 主流程 ============
function main() {
  const args = parseArgs(process.argv.slice(2));
  const categories = runValidation(args.path);

  let fails = 0;
  let warns = 0;
  for (const c of categories) {
    for (const f of c.files) {
      if (f.status === 'FAIL') fails++;
      if (f.status === 'WARN') warns++;
    }
  }

  if (args.json) {
    console.log(JSON.stringify({ categories, summary: { fails, warns } }, null, 2));
  } else {
    printHuman(categories, args.strict);
  }

  const strictFail = args.strict && (fails > 0 || warns > 0);
  process.exit((fails > 0 || strictFail) ? 1 : 0);
}

main();
