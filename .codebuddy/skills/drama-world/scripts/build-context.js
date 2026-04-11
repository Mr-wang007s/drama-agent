/**
 * drama-world/scripts/build-context.js — 上下文组装器
 *
 * 读取 world/ + agents/*/ 构建每个 Agent 的完整 prompt context。
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  getPaths, exists, readText, readJson
} from '../../drama-harness/scripts/lib.js';

/**
 * 加载所有 Agent 的身份信息
 */
function loadAgents(agentsDir, agentIds = null) {
  if (!exists(agentsDir)) return [];

  const dirs = fs.readdirSync(agentsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory());

  return dirs
    .filter((e) => !agentIds || agentIds.includes(e.name))
    .map((e) => {
      const agentDir = path.join(agentsDir, e.name);
      return {
        id: e.name,
        soul: readText(path.join(agentDir, 'SOUL.yaml')),
        memory: readText(path.join(agentDir, 'MEMORY.md')),
        rules: readText(path.join(agentDir, 'RULES.md')),
      };
    });
}

/**
 * 构建标准化 context 对象
 */
export function buildContext(episodeId, agentIds = null) {
  const paths = getPaths();

  const bible = readText(path.join(paths.worldDir, 'bible.md'));
  const worldState = readJson(path.join(paths.worldDir, 'state.json'), {});
  const timeline = readText(path.join(paths.worldDir, 'timeline.md'));
  const agents = loadAgents(paths.agentsDir, agentIds);

  // 读取 episode 元数据（如果存在）
  let episodeMeta = null;
  if (episodeId) {
    const metaFile = path.join(paths.episodesDir, episodeId, '.session.json');
    episodeMeta = readJson(metaFile);
  }

  return {
    world: {
      bible,
      state: worldState,
      timeline,
      carryOvers: worldState.carryOvers || [],
    },
    agents,
    episode: episodeMeta,
  };
}

/**
 * 为单个 Agent 构建完整 prompt
 */
export function buildAgentPrompt(context, agentId) {
  const agent = context.agents.find((a) => a.id === agentId);
  if (!agent) throw new Error(`Agent ${agentId} 不在当前上下文中`);

  // 从 SOUL.yaml 提取关键字段
  const name = agent.soul.match(/^name:\s*(.+)$/m)?.[1] || agentId;
  const desire = agent.soul.match(/^desire:\s*(.+)$/m)?.[1] || '';
  const fear = agent.soul.match(/^fear:\s*(.+)$/m)?.[1] || '';
  const secret = agent.soul.match(/^secret:\s*(.+)$/m)?.[1] || '';
  const voice = agent.soul.match(/^voice:\s*(.+)$/m)?.[1] || '';
  const emotion = agent.soul.match(/^emotion_state:\s*(.+)$/m)?.[1] || '';

  // 构建 carry-over 摘要
  const carryOverBlock = context.world.carryOvers.length
    ? context.world.carryOvers.map((c) => `- ${c.description}`).join('\n')
    : '- 无待兑现悬念';

  // 构建其他 Agent 的公开信息（不含 secret）
  const otherAgents = context.agents
    .filter((a) => a.id !== agentId)
    .map((a) => {
      const n = a.soul.match(/^name:\s*(.+)$/m)?.[1] || a.id;
      const arch = a.soul.match(/^archetype:\s*(.+)$/m)?.[1] || '';
      return `- **${n}**（${arch}）`;
    })
    .join('\n');

  return `你是 **${name}**。

## 你的身份

${agent.soul}

## 你的记忆

${agent.memory || '（尚无记忆）'}

## 当前世界

${context.world.bible}

## 待兑现的悬念

${carryOverBlock}

## 在场的其他人

${otherAgents}

## 你的行为约束

${agent.rules}
`;
}

export async function main(argv) {
  const episodeId = argv[0];
  const agentId = argv[1];
  const context = buildContext(episodeId);

  if (agentId) {
    console.log(buildAgentPrompt(context, agentId));
  } else {
    console.log(`Context 已构建：${context.agents.length} 个 Agent`);
    console.log(`世界状态：${context.world.carryOvers.length} 个 carry-over`);
  }
}
