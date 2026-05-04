/**
 * drama-director/scripts/compile-novel.js — 小说编译器
 *
 * 从 Agent 交互记录改写为第三人称叙事文本。
 * 注意：真正的叙事改写由 LLM Agent 执行，此脚本生成用于 Agent 的 prompt。
 */

import path from 'node:path';
import {
  getPaths, exists, readText, readJson, writeText, ensureDir
} from '../../drama-world/scripts/lib.js';

export function buildNovelPrompt(episodeId) {
  const paths = getPaths();
  const episodeDir = path.join(paths.episodesDir, episodeId);
  const meta = readJson(path.join(episodeDir, '.session.json'));

  if (!meta) throw new Error(`Episode ${episodeId} 不存在`);

  const interactionsFile = path.join(episodeDir, 'runtime', 'interactions.jsonl');
  const rawInteractions = readText(interactionsFile, '');

  if (!rawInteractions.trim()) {
    return `# ${meta.id.toUpperCase()} — ${meta.title}\n\n*（交互记录为空）*\n`;
  }

  return `你是一位小说改编者。请把以下 Agent 交互记录改写为第三人称叙事文本。

## 本集信息
- **标题**：${meta.title}
- **Episode**：${meta.id}

## 交互记录

${rawInteractions}

## 改写要求

1. 使用第三人称叙事
2. 增加环境描写（灯光、声音、温度）
3. 将对话整合进叙事节奏
4. 内心独白融入叙事
5. 场景之间加过渡段落
6. 结尾加余韵段落
7. 不新增交互记录中没有的关键事件

输出写入 episodes/${episodeId}/output/novel.md。
`;
}

export async function main(argv) {
  const episodeId = argv[0];
  if (!episodeId) throw new Error('compile 需要提供 episode-id');
  const prompt = buildNovelPrompt(episodeId);
  const outputDir = path.join(getPaths().episodesDir, episodeId, 'output');
  ensureDir(outputDir);
  writeText(path.join(outputDir, 'novel-prompt.md'), prompt);
  console.log(`小说 prompt 已生成 → episodes/${episodeId}/output/novel-prompt.md`);
}
