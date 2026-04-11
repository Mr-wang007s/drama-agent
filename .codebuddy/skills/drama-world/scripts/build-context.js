/**
 * drama-world/scripts/build-context.js
 *
 * Context assembler: read world/ + agents/*/ to build Agent prompt context.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  getPaths, exists, readText, readJson
} from '../../drama-harness/scripts/lib.js';

/**
 * Load all Agent identities
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
 * Build standardized context object
 */
export function buildContext(episodeId, agentIds = null) {
  const paths = getPaths();

  const bible = readText(path.join(paths.worldDir, 'bible.md'));
  const worldState = readJson(path.join(paths.worldDir, 'state.json'), {});
  const timeline = readText(path.join(paths.worldDir, 'timeline.md'));
  const agents = loadAgents(paths.agentsDir, agentIds);

  // Read episode metadata if exists
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
 * Build complete prompt for a single Agent
 */
export function buildAgentPrompt(context, agentId) {
  const agent = context.agents.find((a) => a.id === agentId);
  if (!agent) throw new Error(`Agent ${agentId} not in current context`);

  // Extract key fields from SOUL.yaml
  const name = agent.soul.match(/^name:\s*(.+)$/m)?.[1] || agentId;
  const desire = agent.soul.match(/^desire:\s*(.+)$/m)?.[1] || '';
  const fear = agent.soul.match(/^fear:\s*(.+)$/m)?.[1] || '';
  const secret = agent.soul.match(/^secret:\s*(.+)$/m)?.[1] || '';
  const voice = agent.soul.match(/^voice:\s*(.+)$/m)?.[1] || '';
  const emotion = agent.soul.match(/^emotion_state:\s*(.+)$/m)?.[1] || '';

  // Build carry-over summary
  const carryOverBlock = context.world.carryOvers.length
    ? context.world.carryOvers.map((c) => `- ${c.description}`).join('\n')
    : '- No pending carry-overs';

  // Build other Agents' public info (no secrets)
  const otherAgents = context.agents
    .filter((a) => a.id !== agentId)
    .map((a) => {
      const n = a.soul.match(/^name:\s*(.+)$/m)?.[1] || a.id;
      const arch = a.soul.match(/^archetype:\s*(.+)$/m)?.[1] || '';
      return `- **${n}** (${arch})`;
    })
    .join('\n');

  return `You are **${name}**.

## Your Identity

${agent.soul}

## Your Memory

${agent.memory || '(No memory yet)'}

## Current World

${context.world.bible}

## Pending Carry-overs

${carryOverBlock}

## Others Present

${otherAgents}

## Your Behavioral Constraints

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
    console.log(`Context built: ${context.agents.length} Agents`);
    console.log(`World state: ${context.world.carryOvers.length} carry-overs`);
  }
}
