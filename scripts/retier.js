#!/usr/bin/env node
/**
 * retier.js — 角色分级重命名工具（通用版）
 *
 * 把 agent 目录按 tier 加上前缀（或批量升降级），
 * 同时自动更新所有文件中的引用。
 *
 * 用法:
 *   # 批量加前缀（根据每个 SOUL.yaml 的 tier 字段或 --tier-map 参数）
 *   node scripts/retier.js --story jiu-ge --apply-prefix
 *
 *   # 单个角色升降级
 *   node scripts/retier.js --story jiu-ge --id xiao-zhao --from b --to a
 *
 *   # 显示计划但不执行（dry-run）
 *   node scripts/retier.js --story jiu-ge --apply-prefix --dry-run
 *
 *   # 从 tier-map.yaml 文件批量定义
 *   node scripts/retier.js --story jiu-ge --from-map tier-map.yaml
 *
 * tier-map.yaml 示例：
 *   S: [lin-mo, shen-yanzhi]
 *   A: [qin-li, ...]
 *   B: [liu-sanbian, ...]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ═══════════════════════════════════════════════════════════════
//  参数解析
// ═══════════════════════════════════════════════════════════════
function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--story') args.story = argv[++i];
    else if (a === '--apply-prefix') args.applyPrefix = true;
    else if (a === '--id') args.id = argv[++i];
    else if (a === '--from') args.from = argv[++i];
    else if (a === '--to') args.to = argv[++i];
    else if (a === '--from-map') args.fromMap = argv[++i];
    else if (a === '--dry-run') args.dryRun = true;
  }
  return args;
}

// ═══════════════════════════════════════════════════════════════
//  从 SOUL.yaml 读取 tier
// ═══════════════════════════════════════════════════════════════
function readTierFromSoul(soulPath) {
  try {
    const content = fs.readFileSync(soulPath, 'utf8');
    // 简单匹配 tier: 字段（不依赖 yaml 解析库）
    const m = content.match(/^\s*tier:\s*([A-Za-z])\s*$/m);
    return m ? m[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
//  从 --from-map 文件读取分级映射
// ═══════════════════════════════════════════════════════════════
function readTierMapFile(mapPath) {
  const content = fs.readFileSync(mapPath, 'utf8');
  const map = { S: [], A: [], B: [] };
  let currentTier = null;
  for (const line of content.split('\n')) {
    const mTier = line.match(/^([SABsab]):\s*(\[(.+)\])?/);
    if (mTier) {
      currentTier = mTier[1].toUpperCase();
      if (!map[currentTier]) map[currentTier] = [];
      if (mTier[3]) {
        map[currentTier].push(...mTier[3].split(',').map((s) => s.trim()));
      }
      continue;
    }
    const mItem = line.match(/^\s+-\s+(.+)$/);
    if (mItem && currentTier) {
      map[currentTier].push(mItem[1].trim());
    }
  }
  return map;
}

// ═══════════════════════════════════════════════════════════════
//  主流程
// ═══════════════════════════════════════════════════════════════
function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.story) {
    console.error('❌ 必须指定 --story <name>');
    process.exit(1);
  }

  const storyRoot = path.join(ROOT, 'stories', args.story);
  const agentsDir = path.join(storyRoot, 'agents');
  if (!fs.existsSync(agentsDir)) {
    console.error(`❌ 故事 ${args.story} 不存在：${agentsDir}`);
    process.exit(1);
  }

  // 构建 旧id → 新id 映射
  const idMap = {};

  if (args.id && args.from && args.to) {
    // 单个角色迁移
    const oldPrefix = args.from.toLowerCase();
    const newPrefix = args.to.toLowerCase();
    const oldId = args.id.startsWith(`${oldPrefix}_`) ? args.id : `${oldPrefix}_${args.id}`;
    const bareName = oldId.replace(/^[a-z]_/, '');
    idMap[oldId] = `${newPrefix}_${bareName}`;
  } else if (args.applyPrefix) {
    // 扫描所有 agent 目录，按 SOUL.yaml 中的 tier 加前缀
    const entries = fs.readdirSync(agentsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory());
    for (const entry of entries) {
      const id = entry.name;
      if (/^[sabc]_/.test(id)) continue; // 已有前缀
      const soul = path.join(agentsDir, id, 'SOUL.yaml');
      if (!fs.existsSync(soul)) continue;
      const tier = readTierFromSoul(soul);
      if (!tier) {
        console.warn(`  ⚠️  ${id} 未定义 tier，跳过`);
        continue;
      }
      idMap[id] = `${tier}_${id}`;
    }
  } else if (args.fromMap) {
    // 从 map 文件定义
    const tierMap = readTierMapFile(path.resolve(args.fromMap));
    for (const [tier, list] of Object.entries(tierMap)) {
      for (const oldId of list) {
        idMap[oldId] = `${tier.toLowerCase()}_${oldId}`;
      }
    }
  } else {
    console.error('❌ 必须指定 --apply-prefix、--from-map 或 --id + --from + --to');
    process.exit(1);
  }

  const ids = Object.keys(idMap);
  if (ids.length === 0) {
    console.log('✅ 无需迁移');
    return;
  }

  console.log('=== 迁移计划 ===');
  for (const [oldId, newId] of Object.entries(idMap)) {
    console.log(`  ${oldId}  →  ${newId}`);
  }
  console.log(`\n总计 ${ids.length} 个目录\n`);

  if (args.dryRun) {
    console.log('🧪 Dry-run 模式，不执行实际操作');
    return;
  }

  // Step 1: 重命名目录
  console.log('=== Step 1: 重命名目录 ===');
  let renamedCount = 0;
  for (const [oldId, newId] of Object.entries(idMap)) {
    const oldPath = path.join(agentsDir, oldId);
    const newPath = path.join(agentsDir, newId);
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

  // 2a. 所有 agent 目录下的 SOUL.yaml / MEMORY.md / RULES.md
  const allAgentDirs = fs.readdirSync(agentsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(agentsDir, e.name));
  for (const dir of allAgentDirs) {
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.yaml') || f.endsWith('.md')) {
        filesToUpdate.push(path.join(dir, f));
      }
    }
  }

  // 2b. agents 目录下的索引文件
  for (const f of fs.readdirSync(agentsDir)) {
    const p = path.join(agentsDir, f);
    if (fs.statSync(p).isFile() && (f.endsWith('.yaml') || f.endsWith('.md') || f.endsWith('.json'))) {
      filesToUpdate.push(p);
    }
  }

  // 2c. world/ 目录
  const worldDir = path.join(storyRoot, 'world');
  if (fs.existsSync(worldDir)) {
    for (const f of fs.readdirSync(worldDir)) {
      const p = path.join(worldDir, f);
      if (fs.statSync(p).isFile()) {
        filesToUpdate.push(p);
      }
    }
  }

  // 2d. 故事根目录元数据
  for (const f of ['.story.json', 'story-seed.yaml']) {
    const p = path.join(storyRoot, f);
    if (fs.existsSync(p)) filesToUpdate.push(p);
  }

  // 2e. episodes/ 下所有文件（防止已有剧本引用旧 id）
  const episodesDir = path.join(storyRoot, 'episodes');
  if (fs.existsSync(episodesDir)) {
    const walk = (dir) => {
      for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir, f);
        const stat = fs.statSync(p);
        if (stat.isDirectory()) walk(p);
        else if (f.endsWith('.md') || f.endsWith('.yaml') || f.endsWith('.json')) {
          filesToUpdate.push(p);
        }
      }
    };
    walk(episodesDir);
  }

  // 按 id 长度从长到短排序，避免短 id 误替换长 id
  const sortedOldIds = Object.keys(idMap).sort((a, b) => b.length - a.length);

  let updatedFileCount = 0;
  let totalReplacements = 0;
  for (const file of filesToUpdate) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    let fileReplacements = 0;

    for (const oldId of sortedOldIds) {
      const newId = idMap[oldId];
      const escaped = oldId.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
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
      console.log(`  ✅ ${path.relative(storyRoot, file)}  (${fileReplacements} 处)`);
    }
  }

  console.log(`\n  总计：${updatedFileCount} 个文件更新，${totalReplacements} 处替换\n`);
  console.log('=== ✅ 迁移完成 ===');
  console.log(`请运行 \`node bin/drama-agent.js status --story ${args.story}\` 验证`);
}

main();
