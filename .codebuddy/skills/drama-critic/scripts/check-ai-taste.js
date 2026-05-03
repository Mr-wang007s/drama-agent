#!/usr/bin/env node
/**
 * check-ai-taste.js — AI 味自动检测
 *
 * 对小说文本做量化风格检查，统计典型 AI 味特征。
 * 输出：各项计数 + 合格判定 + 问题定位片段
 *
 * 用法：
 *   node scripts/check-ai-taste.js --story jiu-ge --episode ep01
 *   node scripts/check-ai-taste.js --file path/to/novel.md
 *   node scripts/check-ai-taste.js --file path/to/novel.md --json  # JSON 输出
 *
 * 退出码：
 *   0 = 合格
 *   1 = 不合格
 *   2 = 参数错误
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

// ═══════════════════════════════════════════════════════════════
//  检查规则（基于《神明残留》EP06 优化经验）
// ═══════════════════════════════════════════════════════════════
const RULES = [
  {
    id: 'dashes',
    name: '破折号 "——"',
    pattern: /——/g,
    limit: 8,
    level: 'error',
    hint: '全文不超过 8 处。用逗号/句号/换行代替，仅对话自然打断时使用。',
  },
  {
    id: 'antithesis',
    name: '"不是X，是Y" 对偶句',
    pattern: /不是[^。！？\n，,]{1,15}[，,][\s]*(?:而)?是[^。！？\n]/g,
    limit: 3,
    level: 'error',
    hint: '超过 3 处算滥用。改用具体描写或直接陈述。',
  },
  {
    id: 'single_word_paragraphs',
    name: '单词/短语独占一段',
    pattern: /^[^\n]{1,6}[。！？]\s*$/gm,
    limit: 5,
    level: 'warning',
    hint: '极短段落密集出现是典型 AI 碎片化。高潮处偶用即可。',
  },
  {
    id: 'triple_parallel',
    name: '三连排比',
    pattern: /([^\n。]{2,15})[。，]\s*\1/g,  // 粗略近似：同一短语重复2+次
    limit: 2,
    level: 'warning',
    hint: '"填满了A。填满了B。填满了C。" 类排比全文不超过 2 处。',
  },
  {
    id: 'inner_thought_tag',
    name: '[inner_thought] 技术标签',
    pattern: /\[inner_thought\]|\[action\]|\[dialogue\]/g,
    limit: 0,
    level: 'error',
    hint: '不允许出现任何技术标签，内心戏融入叙事。',
  },
  {
    id: 'markdown_headings',
    name: 'Markdown 二级/三级标题',
    pattern: /^#{2,}\s/gm,
    limit: 0,
    level: 'error',
    hint: '不允许在正文中使用 ## 或 ### 分幕标题。用空行或 ＊ ＊ ＊ 分隔。',
  },
  {
    id: 'chinese_numeral_section',
    name: '章节内数字/符号分节（"一"/"二"/"（一）"/"其一"/"Part 1" 独立段）',
    pattern: /^[\s　]*(?:[一二三四五六七八九十]|其[一二三四五六七八九十]|（[一二三四五六七八九十\d]+）|\([一二三四五六七八九十\d]+\)|[0-9]{1,2}|(?:Part|Scene|Section|Chapter)\s*[0-9A-Za-z一二三四五六七八九十]+)[\s　]*$/gm,
    limit: 0,
    level: 'error',
    hint: '章节内部严禁用独立段"一/二/三"/"其一/其二"/"（一）/（1）"/"1/2"/"Part 1/Scene 1/Section A"分节。这是典型 AI 味"按大纲写"的机器感。用一个空行分隔，场景首句用时间/地点锚（如"10:20。电话响。"）。大跨度时空跳跃用 ＊ ＊ ＊ 且全篇不超过 1 次。详见 prose.md A3 + compile-novel.md 格式标准。',
  },
  {
    id: 'scene_break_star_abuse',
    name: '场景分隔 ＊ ＊ ＊ / *** 滥用',
    pattern: /^[\s　]*(?:＊\s*){2,}[＊]?[\s　]*$|^[\s　]*\*{3,}[\s　]*$/gm,
    limit: 1,
    level: 'warning',
    hint: '＊ ＊ ＊ 全篇只允许 ≤1 次（仅限真正大跨度时空跳跃）。频繁使用 = 破坏沉浸。绝大多数场景切换用一个空行 + 场景首句的时间/地点锚完成。',
  },
  {
    id: 'markdown_hr',
    name: 'Markdown 分隔线 ---',
    pattern: /^---\s*$/gm,
    limit: 2,
    level: 'warning',
    hint: '频繁使用 --- 打断沉浸感。场景切换用空行或 ＊ ＊ ＊（全篇 ≤1 次）。',
  },
  {
    id: 'italic_inner_monologue',
    name: '*斜体* 独立内心独白段',
    pattern: /^\s*\*[^\n*]{5,}\*\s*$/gm,
    limit: 0,
    level: 'error',
    hint: '内心戏不要用 *斜体* 独立段。用自由间接引语融入叙事。',
  },
  {
    id: 'bold_text',
    name: '**加粗** 文本',
    pattern: /\*\*[^\n*]+\*\*/g,
    limit: 0,
    level: 'warning',
    hint: '正文不应使用 **加粗**。',
  },
  {
    id: 'emoji',
    name: 'Emoji',
    pattern: /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]/gu,
    limit: 0,
    level: 'warning',
    hint: '正文中不应出现 Emoji。',
  },
  {
    id: 'meta_markers',
    name: '元标记（"EP01·完" 等）',
    pattern: /(?:EP\d+|第\s*\d+\s*章|Episode\s*\d+)\s*[·—·]\s*完/g,
    limit: 0,
    level: 'warning',
    hint: '不要在正文末尾加 "EP01·完" 之类的元标记。',
  },
  {
    id: 'episode_id_leak',
    name: 'EPxx 集标签泄漏正文',
    pattern: /(?<!\w)(?:EP|ep|Episode|episode)\s*\d{1,3}(?!-)/g,
    limit: 0,
    level: 'error',
    hint: '正文严禁出现 EP01 / ep02 / Episode 3 等集标签。这些是工程层集 ID，不是角色内心语言。林墨的内心时间词是"昨晚"/"前天"/"工地夜那一天"等。章节标题用"第一章"/"第二章"。',
  },
  // ═══════════════════════════════════════════════════════════════
  //  C5 句式黑名单（基于读者 Team + 专家 Team 共识沉淀）
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'c5_1_he_knew',
    name: 'C5.1 "他/她知道……" 开头段',
    pattern: /^[^\n]*?(?:他|她)知道[^。！？\n]{4,}/gm,
    limit: 3,
    level: 'warning',
    hint: '"他知道……" 开头段超 3 处。改为具体行动或感官描写代替认知陈述。',
  },
  {
    id: 'c5_2_this_moment',
    name: 'C5.2 "这一刻，……"',
    pattern: /这一刻[，,]/g,
    limit: 2,
    level: 'warning',
    hint: '"这一刻，" 超 2 处。大部分情况可直接删掉"这一刻，"不影响句意。',
  },
  {
    id: 'c5_3_simile_pile',
    name: 'C5.3 明喻堆叠（仿佛/好像/就像……一样）',
    pattern: /(?:仿佛|好像|就像|如同|宛如)[^。！？\n]{2,20}(?:一样|似的|般)/g,
    limit: 4,
    level: 'warning',
    hint: '明喻堆叠超 4 处。精选 1-2 个有力比喻，其余改为直接描写。',
  },
  {
    id: 'c5_4_vague_certain',
    name: 'C5.4 "某种（说不清的/莫名的）……"',
    pattern: /某种[^。！？\n]{0,4}(?:说不清|莫名|难以名状|无法形容|不可名状)/g,
    limit: 2,
    level: 'error',
    hint: '"某种说不清的……" 是典型 AI 味回避。必须具象化——什么感觉？像什么？在身体哪里？',
  },
  {
    id: 'c5_5_dont_know_why',
    name: 'C5.5 "他不知道为什么……"',
    pattern: /(?:他|她)不知道为什么/g,
    limit: 2,
    level: 'warning',
    hint: '"不知道为什么" 超 2 处。角色可以不知道原因，但作者必须用行为暗示原因。',
  },
  {
    id: 'c5_6_heart_surge',
    name: 'C5.6 "心里（涌起/升起/浮起）一股……"',
    pattern: /心里?(?:涌起|升起|浮起|泛起|腾起)(?:一股|一阵|一种)/g,
    limit: 1,
    level: 'error',
    hint: '"心里涌起一股" 是最常见的 AI 情绪偷懒。改用身体反应：手握紧了/嗓子发干/后背一凉。',
  },
  {
    id: 'c5_7_time_stopped',
    name: 'C5.7 "时间（仿佛/好像）（停止/静止）了"',
    pattern: /时间(?:仿佛|好像|似乎|像是)?(?:停止|静止|凝固|暂停|停滞)/g,
    limit: 0,
    level: 'error',
    hint: '"时间停止了" 是 AI 写作最烂俗比喻。绝对禁止。用具体感知代替：他听见自己的心跳 / 秒针的声音变得很大。',
  },
  {
    id: 'c5_8_deep_breath',
    name: 'C5.8 "（深深地/重重地）吸了一口气"',
    pattern: /(?:深深地?|重重地?|狠狠地?)吸了一口[气氣]/g,
    limit: 2,
    level: 'warning',
    hint: '"深吸一口气" 超 2 处。角色调整状态有更多方式：攥拳/闭眼/舔嘴唇/站直。',
  },
  {
    id: 'c5_9_eyes_red',
    name: 'C5.9 "眼眶（微微/不由自主地）泛红"',
    pattern: /眼眶(?:微微|不由自主地?|不自觉地?)?(?:泛红|发红|湿润|一热)/g,
    limit: 1,
    level: 'error',
    hint: '"眼眶泛红" 超 1 处。这是最廉价的煽情标记。用其他身体反应：吞咽困难 / 鼻腔发酸 / 视线模糊但不是因为泪。',
  },
  {
    id: 'c5_10_lips_curl',
    name: 'C5.10 "嘴角（微微/不自觉地）上扬"',
    pattern: /嘴角(?:微微|不自觉地?|不由自主地?)?(?:上扬|上翘|勾起|扬起)/g,
    limit: 1,
    level: 'error',
    hint: '"嘴角上扬" 超 1 处。笑有一万种写法：眼尾的纹路 / 声音变轻 / 手指松开来。',
  },
];

// ═══════════════════════════════════════════════════════════════
//  辅助：找到每处匹配的上下文片段
// ═══════════════════════════════════════════════════════════════
function findContexts(text, regex, max = 3) {
  const contexts = [];
  let m;
  const reg = new RegExp(regex.source, regex.flags);
  while ((m = reg.exec(text)) !== null && contexts.length < max) {
    const start = Math.max(0, m.index - 20);
    const end = Math.min(text.length, m.index + m[0].length + 20);
    const snippet = text.slice(start, end).replace(/\n/g, '⏎');
    contexts.push(snippet);
    if (m[0].length === 0) reg.lastIndex++;
  }
  return contexts;
}

// ═══════════════════════════════════════════════════════════════
//  辅助：统计基础文本指标
// ═══════════════════════════════════════════════════════════════
function textMetrics(text) {
  const totalChars = text.length;
  const cjkChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
  const avgParaLen = paragraphs.length > 0
    ? Math.round(paragraphs.reduce((s, p) => s + p.length, 0) / paragraphs.length)
    : 0;
  return { totalChars, cjkChars, paragraphCount: paragraphs.length, avgParaLen };
}

// ═══════════════════════════════════════════════════════════════
//  主流程
// ═══════════════════════════════════════════════════════════════
function parseArgs(argv) {
  const args = { json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--story') args.story = argv[++i];
    else if (a === '--episode') args.episode = argv[++i];
    else if (a === '--file') args.file = argv[++i];
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

function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = resolveFile(args);
  if (!file) {
    console.error('用法: check-ai-taste.js --story <name> --episode <ep-id>');
    console.error('     或 check-ai-taste.js --file <path.md>');
    process.exit(2);
  }
  if (!fs.existsSync(file)) {
    console.error(`❌ 文件不存在: ${file}`);
    process.exit(2);
  }

  const text = fs.readFileSync(file, 'utf8');
  const metrics = textMetrics(text);

  // 运行所有规则
  const results = RULES.map((rule) => {
    const matches = text.match(rule.pattern) || [];
    const count = matches.length;
    const passed = count <= rule.limit;
    const contexts = passed ? [] : findContexts(text, rule.pattern, 3);
    return { ...rule, count, passed, contexts };
  });

  const errors = results.filter((r) => !r.passed && r.level === 'error');
  const warnings = results.filter((r) => !r.passed && r.level === 'warning');
  const overallPassed = errors.length === 0;

  if (args.json) {
    console.log(JSON.stringify({ file, metrics, results, overallPassed }, null, 2));
    process.exit(overallPassed ? 0 : 1);
  }

  // 人类可读输出
  console.log('\n=== AI 味检测报告 ===');
  console.log(`文件: ${path.relative(ROOT, file)}`);
  console.log(`总字符: ${metrics.totalChars}   中文字符: ${metrics.cjkChars}`);
  console.log(`段落数: ${metrics.paragraphCount}   平均段长: ${metrics.avgParaLen} 字\n`);

  console.log('检查项'.padEnd(24) + '次数'.padStart(6) + '上限'.padStart(6) + '  状态');
  console.log('─'.repeat(48));
  for (const r of results) {
    const icon = r.passed ? '✅' : r.level === 'error' ? '❌' : '⚠️ ';
    console.log(
      r.name.padEnd(22) + String(r.count).padStart(6) + String(r.limit).padStart(6) + `  ${icon}`
    );
  }

  if (errors.length > 0 || warnings.length > 0) {
    console.log('\n=== 问题详情 ===\n');
    for (const r of [...errors, ...warnings]) {
      const icon = r.level === 'error' ? '❌ ERROR' : '⚠️  WARN';
      console.log(`${icon}  ${r.name}  (${r.count}/${r.limit})`);
      console.log(`  提示: ${r.hint}`);
      if (r.contexts.length > 0) {
        console.log('  样例:');
        r.contexts.forEach((c, i) => console.log(`    [${i + 1}] ...${c}...`));
      }
      console.log('');
    }
  }

  if (overallPassed) {
    console.log('✅ 合格（无 Error 级别问题）');
    if (warnings.length > 0) {
      console.log(`⚠️  有 ${warnings.length} 个 Warning 级别问题，建议优化`);
    }
    process.exit(0);
  } else {
    console.log(`❌ 不合格：${errors.length} 个 Error + ${warnings.length} 个 Warning`);
    process.exit(1);
  }
}

main();
