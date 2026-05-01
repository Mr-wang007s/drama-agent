/**
 * drama-world/scripts/build-scene.js — 场景构建器
 *
 * 根据世界状态和 carry-over 生成场景初始提示。
 */

import path from 'node:path';
import {
  getPaths, readJson, readText, parseArgs
} from './lib.js';

export function buildScenePrompt(episodeId, options = {}) {
  const paths = getPaths({ story: options.story });
  const state = readJson(path.join(paths.worldDir, 'state.json'), {});
  const bible = readText(path.join(paths.worldDir, 'bible.md'));
  const carryOvers = state.carryOvers || [];

  const title = options.title || episodeId;
  const logline = options.logline || '';
  const agentIds = options.agents || [];

  const carryOverBlock = carryOvers.length
    ? carryOvers.map((c) => `- [${c.id}] ${c.description} (来自 ${c.fromEpisode})`).join('\n')
    : '- 无待兑现悬念';

  const locationBlock = state.locations
    ? Object.entries(state.locations)
        .map(([loc, info]) => `- **${loc}**: ${info.status} — ${info.note || ''}`)
        .join('\n')
    : '- 未定义地点';

  return `# 场景初始化 · ${episodeId}

## 本集信息
- **标题**：${title}
- **Logline**：${logline}
- **参与 Agent**：${agentIds.join(', ')}

## 世界时间
- **日期**：${state.worldTime?.currentDate || '未知'}
- **时段**：${state.worldTime?.timeOfDay || '未知'}
- **距系列开始**：${state.worldTime?.daysSinceStart || '?'} 天

## 待兑现悬念（必须在本集推进）

${carryOverBlock}

## 可用地点

${locationBlock}

## 世界观约束

${bible}

---

你作为**世界管理者**，需要：
1. 确定本集的起始场景（地点 + 时间 + 在场人物）
2. 确定哪些 carry-over 必须在本集兑现
3. 准备至少一个可在模拟中途注入的外部事件
4. 在 Agent 交互停滞时通过 send_message 施加压力或推进时间
`;
}

export async function main(argv) {
  const parsed = parseArgs(argv);
  const episodeId = parsed._[0];
  if (!episodeId) {
    throw new Error('build-scene 需要提供 episode-id');
  }
  console.log(buildScenePrompt(episodeId, { story: parsed.story }));
}
