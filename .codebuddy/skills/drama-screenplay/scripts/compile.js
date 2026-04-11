/**
 * drama-screenplay/scripts/compile.js — 剧本编译器
 *
 * 从 Agent 交互记录编译为标准剧本格式。
 */

import path from 'node:path';
import {
  getPaths, exists, readText, readJson, writeText, ensureDir
} from '../../drama-harness/scripts/lib.js';

export function compileScreenplay(episodeId) {
  const paths = getPaths();
  const episodeDir = path.join(paths.episodesDir, episodeId);
  const meta = readJson(path.join(episodeDir, '.session.json'));

  if (!meta) throw new Error(`Episode ${episodeId} 不存在`);

  // 读取交互记录
  const interactionsFile = path.join(episodeDir, 'runtime', 'interactions.jsonl');
  const rawInteractions = readText(interactionsFile, '');

  // 如果交互记录为空，生成占位
  if (!rawInteractions.trim()) {
    const placeholder = `# ${meta.id.toUpperCase()} — ${meta.title}\n\n` +
      `*（交互记录为空——模拟尚未产出内容）*\n`;
    const outputDir = path.join(episodeDir, 'output');
    ensureDir(outputDir);
    writeText(path.join(outputDir, 'screenplay.md'), placeholder);
    return placeholder;
  }

  // 解析 JSONL
  const interactions = rawInteractions
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean);

  // 编译为剧本格式
  const lines = [`# ${meta.id.toUpperCase()} — ${meta.title}`, ''];
  let currentScene = null;

  for (const msg of interactions) {
    // 场景标记
    if (msg.type === 'scene_context' || msg.type === 'time_skip') {
      currentScene = msg.content || msg.summary || '新场景';
      lines.push(`---`, '', `## ${currentScene}`, '');
      continue;
    }

    // 角色对话
    if (msg.type === 'dialogue') {
      const speaker = msg.sender || 'unknown';
      lines.push(`**${speaker}**："${msg.content}"`);
      lines.push('');
      continue;
    }

    // 角色行动
    if (msg.type === 'action') {
      lines.push(`*（${msg.sender}：${msg.content}）*`);
      lines.push('');
      continue;
    }

    // 内心独白
    if (msg.type === 'inner') {
      lines.push(`*${msg.sender}心想：${msg.content}*`);
      lines.push('');
      continue;
    }

    // 世界事件
    if (msg.type === 'event' || msg.type === 'pressure') {
      lines.push(`*（${msg.content}）*`);
      lines.push('');
    }
  }

  lines.push('---', '', '*剧本由 drama-screenplay 自动编译*');

  const screenplay = lines.join('\n');
  const outputDir = path.join(episodeDir, 'output');
  ensureDir(outputDir);
  writeText(path.join(outputDir, 'screenplay.md'), screenplay);

  return screenplay;
}

export async function main(argv) {
  const episodeId = argv[0];
  if (!episodeId) throw new Error('compile 需要提供 episode-id');
  compileScreenplay(episodeId);
  console.log(`剧本已编译 → episodes/${episodeId}/output/screenplay.md`);
}
