#!/usr/bin/env node
/**
 * import-characters.js — 批量导入角色
 *
 * 读取 character-pack.yaml 文件，一次性创建多个角色：
 *   - S/A/B 级：创建独立目录 + SOUL.yaml + MEMORY.md（目录自动加 tier 前缀）
 *   - C 级：合并写入 agents/C-CLASS-INDEX.yaml
 *
 * 用法：
 *   node scripts/import-characters.js --story jiu-ge --from pack.yaml
 *   node scripts/import-characters.js --story jiu-ge --from pack.yaml --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

// 简易 YAML 解析器（只支持本 pack 的结构：层级 + - 列表 + key: value）
// 为避免引入依赖，手写一个最小解析器
function parseYaml(text) {
  const lines = text.split('\n');
  const result = {};
  const stack = [{ indent: -1, obj: result, inList: false, listParent: null }];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.replace(/\s+#.*$/, ''); // 去掉行尾注释
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = rawLine.match(/^(\s*)/)[1].length;
    const trimmed = line.trim();

    // 回退栈
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const top = stack[stack.length - 1];

    // 列表项
    if (trimmed.startsWith('- ')) {
      const itemContent = trimmed.slice(2);
      if (!Array.isArray(top.obj)) {
        // 需要把父字段改为数组
        if (top.parentKey && top.parentObj) {
          if (!Array.isArray(top.parentObj[top.parentKey])) {
            top.parentObj[top.parentKey] = [];
          }
          top.obj = top.parentObj[top.parentKey];
        }
      }
      // 如果列表项是对象（包含 key: value）
      if (/^\w[\w-]*\s*:/.test(itemContent)) {
        const newItem = {};
        top.obj.push(newItem);
        // 同一行的 key: value
        const m = itemContent.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
        if (m) {
          const [, k, v] = m;
          newItem[k] = parseValue(v);
        }
        stack.push({ indent, obj: newItem, inList: true });
      } else {
        // 纯标量列表项
        top.obj.push(parseValue(itemContent));
      }
      continue;
    }

    // key: value
    const m = trimmed.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (m) {
      const [, key, val] = m;
      const parent = top.obj;
      if (val === '' || val === '|') {
        // 新嵌套对象/数组（根据子项决定）
        parent[key] = {};
        stack.push({
          indent,
          obj: parent[key],
          parentKey: key,
          parentObj: parent,
        });
      } else {
        parent[key] = parseValue(val);
      }
    }
  }

  return result;
}

function parseValue(v) {
  v = v.trim();
  if (v === '') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null') return null;
  // 数组字面量
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((s) => parseValue(s));
  }
  // 数字
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  // 带引号字符串
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

// ═══════════════════════════════════════════════════════════════
//  把对象转回 YAML 字符串（简版）
// ═══════════════════════════════════════════════════════════════
function stringifyYaml(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  let out = '';
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === 'object' && item !== null) {
        const keys = Object.keys(item);
        const first = keys[0];
        out += `${pad}- ${first}: ${formatScalar(item[first])}\n`;
        for (let i = 1; i < keys.length; i++) {
          const k = keys[i];
          out += formatKV(pad + '  ', k, item[k], indent + 1);
        }
      } else {
        out += `${pad}- ${formatScalar(item)}\n`;
      }
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [k, v] of Object.entries(obj)) {
      out += formatKV(pad, k, v, indent);
    }
  }
  return out;
}

function formatKV(pad, k, v, indent) {
  if (Array.isArray(v)) {
    // 检查是否简单标量数组
    if (v.every((x) => typeof x !== 'object' || x === null)) {
      return `${pad}${k}: [${v.map(formatScalar).join(', ')}]\n`;
    }
    return `${pad}${k}:\n${stringifyYaml(v, indent + 1)}`;
  }
  if (typeof v === 'object' && v !== null) {
    return `${pad}${k}:\n${stringifyYaml(v, indent + 1)}`;
  }
  return `${pad}${k}: ${formatScalar(v)}\n`;
}

function formatScalar(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'string') {
    if (/[:#{}\[\],&*?|<>=!%@`]/.test(v) || /^\s/.test(v) || /\s$/.test(v)) {
      return `"${v.replace(/"/g, '\\"')}"`;
    }
    return v;
  }
  return String(v);
}

// ═══════════════════════════════════════════════════════════════
//  生成 S/A/B 级 SOUL.yaml
// ═══════════════════════════════════════════════════════════════
function generateSoul(char, tier) {
  const [o = 50, c = 50, e = 50, a = 50, n = 50] = char.ocean || [];
  const now = new Date().toISOString().slice(0, 10);

  const soul = {
    identity: {
      id: `${tier}_${char.id}`,
      name: char.name,
      tier: tier.toUpperCase(),
      archetype: char.archetype || '',
      role: char.role || '',
      status: 'active',
    },
    psychology: {
      ocean: {
        openness: o,
        conscientiousness: c,
        extraversion: e,
        agreeableness: a,
        neuroticism: n,
      },
      trauma: char.trauma || {},
      motivation: char.motivation || {},
    },
    performance: {
      voice: char.voice || { tone: '', quirks: [] },
      emotion: char.emotion || { default: 'neutral', current: 'neutral' },
    },
    relationships: char.relationships || [],
    runtime: {
      known_facts: [],
      memory_capacity: tier === 's' ? 2000 : tier === 'a' ? 1200 : 600,
    },
    meta: {
      version: '4.0',
      tier: tier.toUpperCase(),
      created_at: now,
      updated_at: now,
    },
  };

  // S/A 级补充完整字段
  if (tier === 's' || tier === 'a') {
    if (char.stress_response) soul.performance.stress_response = char.stress_response;
    if (char.examples) soul.performance.examples = char.examples;
  }
  if (tier === 's' && char.arc) {
    soul.arc = char.arc;
  }

  // 当前 emotion 同步为 default
  if (soul.performance.emotion && soul.performance.emotion.default) {
    soul.performance.emotion.current = soul.performance.emotion.default;
  }

  return soul;
}

// ═══════════════════════════════════════════════════════════════
//  生成空的 MEMORY.md
// ═══════════════════════════════════════════════════════════════
function generateMemory(char) {
  return `# ${char.name} · 记忆档案\n\n## 近期事件\n\n*（等待故事推进填充）*\n\n## 关键印象\n\n*（等待故事推进填充）*\n`;
}

// ═══════════════════════════════════════════════════════════════
//  主流程
// ═══════════════════════════════════════════════════════════════
function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--story') args.story = argv[++i];
    else if (a === '--from') args.from = argv[++i];
    else if (a === '--dry-run') args.dryRun = true;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.story || !args.from) {
    console.error('用法: import-characters.js --story <name> --from <pack.yaml> [--dry-run]');
    process.exit(1);
  }

  const storyRoot = path.join(ROOT, 'stories', args.story);
  const agentsDir = path.join(storyRoot, 'agents');
  if (!fs.existsSync(agentsDir)) {
    console.error(`❌ 故事 ${args.story} 不存在`);
    process.exit(1);
  }

  const packPath = path.resolve(args.from);
  if (!fs.existsSync(packPath)) {
    console.error(`❌ pack 文件不存在: ${packPath}`);
    process.exit(1);
  }

  const pack = parseYaml(fs.readFileSync(packPath, 'utf8'));

  const stats = { S: 0, A: 0, B: 0, C: 0, skipped: 0 };

  console.log('=== Character Pack Import ===\n');

  // 处理 S/A/B 级
  for (const tier of ['S', 'A', 'B']) {
    const list = pack[tier] || [];
    for (const char of list) {
      if (!char.id || !char.name) {
        console.warn(`  ⚠️  跳过缺少 id/name 的条目`);
        stats.skipped++;
        continue;
      }
      const tierLower = tier.toLowerCase();
      const dirName = `${tierLower}_${char.id}`;
      const dir = path.join(agentsDir, dirName);

      if (fs.existsSync(dir)) {
        console.warn(`  ⚠️  [${tier}] ${dirName} 已存在，跳过`);
        stats.skipped++;
        continue;
      }

      if (args.dryRun) {
        console.log(`  [DRY] [${tier}] 将创建 agents/${dirName}/`);
        stats[tier]++;
        continue;
      }

      fs.mkdirSync(dir, { recursive: true });
      const soul = generateSoul(char, tierLower);
      fs.writeFileSync(path.join(dir, 'SOUL.yaml'), stringifyYaml(soul), 'utf8');
      fs.writeFileSync(path.join(dir, 'MEMORY.md'), generateMemory(char), 'utf8');
      console.log(`  ✅ [${tier}] agents/${dirName}/`);
      stats[tier]++;
    }
  }

  // 处理 C 级（合并索引）
  const cList = pack.C || [];
  if (cList.length > 0) {
    const indexPath = path.join(agentsDir, 'C-CLASS-INDEX.yaml');
    let indexContent = '';
    if (fs.existsSync(indexPath)) {
      indexContent = fs.readFileSync(indexPath, 'utf8');
    } else {
      indexContent = `meta:\n  story: ${args.story}\n  tier: C\n  version: "4.0"\n  updated_at: ${new Date().toISOString().slice(0, 10)}\n\ncharacters:\n`;
    }

    const appendEntries = [];
    for (const char of cList) {
      if (!char.id || !char.name) {
        stats.skipped++;
        continue;
      }
      if (indexContent.includes(`- id: ${char.id}`)) {
        console.warn(`  ⚠️  [C] ${char.id} 已存在于索引中，跳过`);
        stats.skipped++;
        continue;
      }
      appendEntries.push(char);
      stats.C++;
    }

    if (appendEntries.length > 0 && !args.dryRun) {
      const append = appendEntries
        .map((c) => {
          const parts = [`  - id: ${c.id}`, `    name: ${c.name}`];
          if (c.tag) parts.push(`    tag: [${(c.tag || []).join(', ')}]`);
          if (c.location) parts.push(`    location: ${c.location}`);
          if (c.one_liner) parts.push(`    one_liner: ${c.one_liner}`);
          if (c.quirk) parts.push(`    quirk: ${c.quirk}`);
          parts.push(`    status: active`);
          return parts.join('\n');
        })
        .join('\n');
      fs.writeFileSync(indexPath, indexContent + append + '\n', 'utf8');
      console.log(`  ✅ [C] 追加 ${appendEntries.length} 条到 C-CLASS-INDEX.yaml`);
    } else if (appendEntries.length > 0) {
      console.log(`  [DRY] [C] 将追加 ${appendEntries.length} 条到 C-CLASS-INDEX.yaml`);
    }
  }

  console.log('\n=== 完成 ===');
  console.log(`  S: ${stats.S}   A: ${stats.A}   B: ${stats.B}   C: ${stats.C}   跳过: ${stats.skipped}`);
  console.log(`  总计新建: ${stats.S + stats.A + stats.B + stats.C} 个角色`);
}

main();
