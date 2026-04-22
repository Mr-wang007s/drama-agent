#!/usr/bin/env node
/**
 * 《九歌》Agent 目录批量加前缀迁移脚本
 *
 * 规则：
 *   - S级 → s_<id>
 *   - A级 → a_<id>
 *   - B级 → b_<id>
 *   - C级保持在 C-CLASS-INDEX.yaml 中（不变）
 *
 * 操作：
 *   1. 读取 CHARACTER-INDEX.md 解析分级
 *   2. 重命名目录
 *   3. 更新所有 SOUL.yaml 内 identity.id
 *   4. 替换所有文件中对旧 id 的引用（包括 state.json / index 文件 / relationships.target）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..', 'stories', 'jiu-ge');
const AGENTS_DIR = path.join(ROOT, 'agents');
const WORLD_DIR = path.join(ROOT, 'world');

// 分级映射表（手工定义，确保精确）
const TIER_MAP = {
  S: [
    'lin-mo', 'shen-yanzhi', 'lu-jiu', 'shen-qingyuan',
    'a-yiguli', 'zhou-wenyuan', 'the-gentleman', 'qu-lingjun',
  ],
  A: [
    'qin-li', 'gu-wanqing', 'su-lao', 'pei-yuanzhou', 'chen-huaiyu',
    'fang-yingwu', 'meng-po', 'yu-jin', 'wu-jiu-niang', 'gui-tong',
    'the-high-priest', 'bai-lu', 'tan-zhenhua', 'jian-wen', 'inoue-ayane',
  ],
  B: [
    'liu-sanbian', 'feng-yu', 'su-wan', 'lao-yuan', 'fang-jing',
    'ding-jie', 'xiao-zhao', 'sang-sang', 'yao-chen', 'gui-shu',
    'jiu-zhi', 'qing-sao', 'tie-sheng', 'qi-qi', 'she-tong',
    'ku-po', 'red-bishop', 'lin-chuqing', 'san-yan', 'bee-swarm',
    'lin-shiming', 'lin-mu-mother', 'li-muba', 'zhang-prof', 'wang-fu',
  ],
};

// 生成 旧id → 新id 的映射
const idMap = {};
for (const [tier, list] of Object.entries(TIER_MAP)) {
  for (const oldId of list) {
    idMap[oldId] = `${tier.toLowerCase()}_${oldId}`;
  }
}

console.log('=== 迁移映射表 ===');
console.log(`S级 ${TIER_MAP.S.length} 个，A级 ${TIER_MAP.A.length} 个，B级 ${TIER_MAP.B.length} 个`);
console.log(`总计 ${Object.keys(idMap).length} 个目录将被重命名\n`);

// Step 1: 重命名目录
console.log('=== Step 1: 重命名目录 ===');
let renamedCount = 0;
for (const [oldId, newId] of Object.entries(idMap)) {
  const oldPath = path.join(AGENTS_DIR, oldId);
  const newPath = path.join(AGENTS_DIR, newId);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    renamedCount++;
  } else {
    console.warn(`  ⚠️  未找到目录: ${oldId}`);
  }
}
console.log(`  ✅ 已重命名 ${renamedCount} 个目录\n`);

// Step 2: 收集所有需要替换引用的文件
console.log('=== Step 2: 更新文件内引用 ===');
const filesToUpdate = [];

// 2a. 所有新目录下的 SOUL.yaml 和 MEMORY.md
for (const newId of Object.values(idMap)) {
  const dir = path.join(AGENTS_DIR, newId);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.yaml') || f.endsWith('.md')) {
      filesToUpdate.push(path.join(dir, f));
    }
  }
}

// 2b. 索引文件
const indexFiles = [
  path.join(AGENTS_DIR, 'CHARACTER-INDEX.md'),
  path.join(AGENTS_DIR, 'C-CLASS-INDEX.yaml'),
];
for (const f of indexFiles) {
  if (fs.existsSync(f)) filesToUpdate.push(f);
}

// 2c. 世界观文件
for (const f of ['state.json', 'bible.md', 'timeline.md']) {
  const p = path.join(WORLD_DIR, f);
  if (fs.existsSync(p)) filesToUpdate.push(p);
}

// 2d. 故事根目录元数据
for (const f of ['.story.json', 'story-seed.yaml']) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) filesToUpdate.push(p);
}

// 按 id 长度从长到短排序，避免短 id 误替换（例如 lin-mo 先于 lin-chuqing 被替换会破坏后者）
const sortedOldIds = Object.keys(idMap).sort((a, b) => b.length - a.length);

let updatedFileCount = 0;
let totalReplacements = 0;

for (const file of filesToUpdate) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  let fileReplacements = 0;

  for (const oldId of sortedOldIds) {
    const newId = idMap[oldId];
    // 用词边界匹配：确保 lin-mo 不会匹配到 lin-mo-mother 的开头
    // 使用否定后继：旧id 后不能跟 - 或 字母数字（因为 id 自身就含 -）
    // 更安全的方案：匹配 [引号 / 冒号后空格 / 方括号 / 空格] 包围的 oldId
    const escaped = oldId.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    // 匹配边界：前后必须是 非字母/非数字/非下划线/非-  的字符（或字符串边界）
    const regex = new RegExp(`(^|[^\\w-])${escaped}(?![\\w-])`, 'g');
    content = content.replace(regex, (match, prefix) => {
      fileReplacements++;
      return prefix + newId;
    });
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedFileCount++;
    totalReplacements += fileReplacements;
    console.log(`  ✅ ${path.relative(ROOT, file)}  (${fileReplacements} 处)`);
  }
}

console.log(`\n  总计：${updatedFileCount} 个文件更新，${totalReplacements} 处替换\n`);

console.log('=== ✅ 迁移完成 ===');
console.log('请运行 `node bin/drama-agent.js status --story jiu-ge` 验证');
