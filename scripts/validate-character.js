/**
 * scripts/validate-character.js — 角色校验器入口（兼容层）
 *
 * 此文件为兼容旧版调用，实际逻辑已迁移到 drama-harness/scripts/validate-character.js
 */

import { main } from '../.codebuddy/skills/drama-harness/scripts/validate-character.js';

// CLI 入口
main(process.argv.slice(2)).catch(console.error);
