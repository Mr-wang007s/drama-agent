/**
 * drama-harness/scripts/memory.js — Agent 记忆工具
 *
 * add / replace / remove 操作，容量检查，满载归档。
 * 参考 Hermes Agent 的 memory tool 设计。
 */

import fs from 'node:fs';
import path from 'node:path';
import { getPaths, exists, readText, writeText, ensureDir } from './lib.js';

function getMemoryPath(agentId) {
  return path.join(getPaths().agentsDir, agentId, 'MEMORY.md');
}

function getCapacity(agentId) {
  const soulFile = path.join(getPaths().agentsDir, agentId, 'SOUL.yaml');
  const soul = readText(soulFile);
  return parseInt(soul.match(/^memory_capacity:\s*(\d+)$/m)?.[1] || '2000', 10);
}

export function readMemory(agentId) {
  return readText(getMemoryPath(agentId), '');
}

export function addMemory(agentId, entry) {
  const memPath = getMemoryPath(agentId);
  const current = readText(memPath, '');
  const capacity = getCapacity(agentId);
  const newContent = current + '\n' + entry;

  if (newContent.length > capacity) {
    throw new Error(
      `记忆超出容量 (${newContent.length}/${capacity})。` +
      `请先 replace 合并旧条目或 remove 不重要的条目。`
    );
  }

  writeText(memPath, newContent);
  return newContent.length;
}

export function replaceMemory(agentId, oldText, newText) {
  const memPath = getMemoryPath(agentId);
  const current = readText(memPath, '');

  if (!current.includes(oldText)) {
    throw new Error(`未找到匹配文本：${oldText.slice(0, 50)}...`);
  }

  const updated = current.replace(oldText, newText);
  const capacity = getCapacity(agentId);

  if (updated.length > capacity) {
    throw new Error(`替换后超出容量 (${updated.length}/${capacity})`);
  }

  writeText(memPath, updated);
  return updated.length;
}

export function removeMemory(agentId, textToRemove) {
  const memPath = getMemoryPath(agentId);
  const current = readText(memPath, '');

  if (!current.includes(textToRemove)) {
    throw new Error(`未找到匹配文本：${textToRemove.slice(0, 50)}...`);
  }

  const updated = current.replace(textToRemove, '').replace(/\n{3,}/g, '\n\n');
  writeText(memPath, updated);
  return updated.length;
}

export function archiveMemory(agentId, episodeId, content) {
  const archiveDir = path.join(getPaths().agentsDir, agentId, 'memory-archive');
  ensureDir(archiveDir);
  const archiveFile = path.join(archiveDir, `${episodeId}.md`);
  writeText(archiveFile, content);
}

export function searchMemory(agentId, query) {
  const paths = getPaths();
  const results = [];

  // 搜索活跃记忆
  const active = readMemory(agentId);
  if (active.toLowerCase().includes(query.toLowerCase())) {
    results.push({ source: 'active', content: active });
  }

  // 搜索归档
  const archiveDir = path.join(paths.agentsDir, agentId, 'memory-archive');
  if (exists(archiveDir)) {
    const files = fs.readdirSync(archiveDir).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const content = readText(path.join(archiveDir, file));
      if (content.toLowerCase().includes(query.toLowerCase())) {
        results.push({ source: `archive/${file}`, content });
      }
    }
  }

  return results;
}

export async function main(argv) {
  const agentId = argv[0];
  if (!agentId) {
    throw new Error('recall 需要提供 agent-id');
  }

  const searchIdx = argv.indexOf('--search');
  if (searchIdx !== -1) {
    const query = argv[searchIdx + 1];
    const results = searchMemory(agentId, query);
    console.log(`搜索 "${query}" 在 ${agentId} 的记忆中：${results.length} 条结果`);
    for (const r of results) {
      console.log(`\n--- ${r.source} ---\n${r.content}`);
    }
    return;
  }

  // 默认显示活跃记忆
  const memory = readMemory(agentId);
  const capacity = getCapacity(agentId);
  console.log(`${agentId} 的记忆 (${memory.length}/${capacity} 字符)：\n`);
  console.log(memory || '（空）');
}
