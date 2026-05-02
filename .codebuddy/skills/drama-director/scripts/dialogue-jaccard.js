#!/usr/bin/env node
/**
 * dialogue-jaccard.js — 角色对话 Jaccard 相似度检测（C4 约束）
 *
 * 计算任意两个 S 级角色对话高频词的 Jaccard 相似度。
 * 超过 0.25 即 warning，建议修订。
 *
 * 用法：
 *   node scripts/dialogue-jaccard.js --story <name> --episode <ep-id>
 *   node scripts/dialogue-jaccard.js --file path/to/novel.md --characters "林墨,沈砚之,周文渊"
 *
 * 退出码：
 *   0 = 所有角色对 Jaccard < 0.25
 *   1 = 有角色对 Jaccard ≥ 0.25
 *   2 = 参数错误
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

// 中文停用词（简化版）
const STOP_WORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
  '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
  '自己', '这', '他', '她', '它', '们', '那', '些', '什么', '把', '被', '从',
  '让', '能', '吗', '呢', '吧', '啊', '哦', '嗯', '对', '还', '过', '来', '里',
  '地', '得', '个', '为', '这个', '那个', '没', '又', '但', '而', '如果',
]);

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--story') args.story = argv[++i];
    else if (a === '--episode') args.episode = argv[++i];
    else if (a === '--file') args.file = argv[++i];
    else if (a === '--characters') args.characters = argv[++i];
    else if (a === '--threshold') args.threshold = parseFloat(argv[++i]);
    else if (a === '--json') args.json = true;
  }
  return args;
}

function resolveFile(args) {
  if (args.file) return path.resolve(args.file);
  if (args.story && args.episode) {
    return path.join(ROOT, 'stories', args.story, 'episodes', args.episode, 'output', 'novel.md');
  }
  return null;
}

// 简单中文分词（按字 bigram）
function tokenize(text) {
  const tokens = [];
  const chars = text.replace(/[^\u4e00-\u9fa5]/g, '');
  for (let i = 0; i < chars.length - 1; i++) {
    const bigram = chars[i] + chars[i + 1];
    if (!STOP_WORDS.has(bigram)) {
      tokens.push(bigram);
    }
  }
  return tokens;
}

function getTopN(tokens, n = 20) {
  const freq = {};
  tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
  return new Set(
    Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k]) => k)
  );
}

function jaccard(setA, setB) {
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

// 简单对话提取（基于引号）
function extractDialogue(text, characterName) {
  const dialogues = [];
  // 匹配角色名后跟的对话
  const patterns = [
    new RegExp(`${characterName}[^"]*"([^"]+)"`, 'g'),
    new RegExp(`${characterName}[^"]*"([^"]+)"`, 'g'),
    new RegExp(`${characterName}[^「]*「([^」]+)」`, 'g'),
  ];
  for (const p of patterns) {
    let m;
    while ((m = p.exec(text)) !== null) {
      dialogues.push(m[1]);
    }
  }
  return dialogues.join('');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const threshold = args.threshold || 0.25;
  const file = resolveFile(args);

  if (!file) {
    console.error('用法: dialogue-jaccard.js --story <name> --episode <ep-id>');
    console.error('     或 dialogue-jaccard.js --file <novel.md> --characters "A,B,C"');
    process.exit(2);
  }
  if (!fs.existsSync(file)) {
    console.error(`❌ 文件不存在: ${file}`);
    process.exit(2);
  }

  const text = fs.readFileSync(file, 'utf8');

  // 获取角色列表
  let characters;
  if (args.characters) {
    characters = args.characters.split(',').map(c => c.trim());
  } else {
    // 尝试从 story 的 agents 目录读取 S 级角色
    if (args.story) {
      const agentsDir = path.join(ROOT, 'stories', args.story, 'agents');
      if (fs.existsSync(agentsDir)) {
        characters = fs.readdirSync(agentsDir)
          .filter(d => d.startsWith('s_'))
          .map(d => {
            const soulPath = path.join(agentsDir, d, 'SOUL.yaml');
            if (fs.existsSync(soulPath)) {
              const soul = fs.readFileSync(soulPath, 'utf8');
              const nameMatch = soul.match(/name:\s*(.+)/);
              return nameMatch ? nameMatch[1].trim() : null;
            }
            return null;
          })
          .filter(Boolean);
      }
    }
    if (!characters || characters.length < 2) {
      console.error('无法确定角色列表。请用 --characters "角色A,角色B" 指定。');
      process.exit(2);
    }
  }

  console.log(`\n=== 对话 Jaccard 相似度检测 ===\n`);
  console.log(`文件: ${path.relative(ROOT, file)}`);
  console.log(`角色: ${characters.join(', ')}`);
  console.log(`阈值: ${threshold}\n`);

  // 提取每个角色的对话并计算 top-20
  const charSets = {};
  for (const c of characters) {
    const dialogue = extractDialogue(text, c);
    const tokens = tokenize(dialogue);
    charSets[c] = { tokens: tokens.length, topN: getTopN(tokens, 20) };
  }

  // 计算所有角色对的 Jaccard
  let hasViolation = false;
  const pairs = [];
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      const a = characters[i];
      const b = characters[j];
      const j_score = jaccard(charSets[a].topN, charSets[b].topN);
      const passed = j_score < threshold;
      if (!passed) hasViolation = true;
      pairs.push({ a, b, jaccard: Math.round(j_score * 1000) / 1000, passed });
    }
  }

  console.log('角色对'.padEnd(20) + 'Jaccard'.padStart(8) + '  状态');
  console.log('─'.repeat(36));
  for (const p of pairs) {
    const icon = p.passed ? '✅' : '❌';
    console.log(`${p.a} vs ${p.b}`.padEnd(20) + String(p.jaccard).padStart(8) + `  ${icon}`);
  }

  if (hasViolation) {
    console.log(`\n❌ 有角色对 Jaccard ≥ ${threshold}，建议修订角色语言差异度。`);
    process.exit(1);
  } else {
    console.log(`\n✅ 所有角色对 Jaccard < ${threshold}`);
    process.exit(0);
  }
}

main();
