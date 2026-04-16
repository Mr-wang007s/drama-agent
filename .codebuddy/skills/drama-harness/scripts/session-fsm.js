/**
 * drama-harness/scripts/session-fsm.js — 会话状态机
 *
 * 强制执行模拟生命周期：
 *   idle → initializing → context-ready → simulating → wrapping → wrapped
 *
 * 每个状态转换有明确的前置条件检查。
 * 任何不合法的状态跳转都会被拒绝。
 */

import path from 'node:path';
import {
  getPaths, nowIso, exists, readJson, writeJson
} from './lib.js';

// ─── 状态定义 ───

export const STATES = {
  IDLE: 'idle',
  INITIALIZING: 'initializing',
  CONTEXT_READY: 'context-ready',
  SIMULATING: 'simulating',
  WRAPPING: 'wrapping',
  WRAPPED: 'wrapped',
  FAILED: 'failed',
};

// ─── 合法状态转换表 ───

const TRANSITIONS = {
  [STATES.IDLE]:          [STATES.INITIALIZING],
  [STATES.INITIALIZING]:  [STATES.CONTEXT_READY, STATES.FAILED],
  [STATES.CONTEXT_READY]: [STATES.SIMULATING, STATES.FAILED],
  [STATES.SIMULATING]:    [STATES.WRAPPING, STATES.FAILED],
  [STATES.WRAPPING]:      [STATES.WRAPPED, STATES.FAILED],
  [STATES.WRAPPED]:       [STATES.IDLE],
  [STATES.FAILED]:        [STATES.IDLE],
};

// ─── 前置条件检查器 ───

const PRECONDITIONS = {
  [STATES.INITIALIZING]: (ctx) => {
    if (!ctx.episodeId) return 'Missing episodeId';
    if (!ctx.storyName) return 'Missing storyName';
    return null;
  },

  [STATES.CONTEXT_READY]: (ctx) => {
    const paths = getPaths({ story: ctx.storyName });
    if (!exists(path.join(paths.worldDir, 'bible.md')))
      return 'world/bible.md not found';
    if (!exists(path.join(paths.worldDir, 'state.json')))
      return 'world/state.json not found';
    if (!exists(paths.agentsDir))
      return 'agents/ directory not found';
    return null;
  },

  [STATES.SIMULATING]: (ctx) => {
    if (!ctx.agents || ctx.agents.length === 0)
      return 'No agents specified for simulation';
    if (!ctx.episodeDir)
      return 'Episode directory not initialized';
    return null;
  },

  [STATES.WRAPPING]: (ctx) => {
    if (!ctx.episodeDir)
      return 'Episode directory not available';
    return null;
  },

  [STATES.WRAPPED]: () => null,
  [STATES.IDLE]: () => null,
  [STATES.FAILED]: () => null,
};

// ─── 状态机类 ───

export class SessionFSM {
  /**
   * @param {string} episodeId
   * @param {string} storyName
   * @param {object} [options]
   * @param {number} [options.maxTurns=50] - Maximum interaction turns before forced wrap
   * @param {number} [options.maxDurationMs=1800000] - Maximum duration in ms (default 30min)
   */
  constructor(episodeId, storyName, options = {}) {
    this.episodeId = episodeId;
    this.storyName = storyName;
    this.state = STATES.IDLE;
    this.history = [];
    this.agents = [];
    this.episodeDir = null;
    this.startedAt = null;
    this.turnCount = 0;

    // Limits
    this.maxTurns = options.maxTurns ?? 50;
    this.maxDurationMs = options.maxDurationMs ?? 30 * 60 * 1000;

    this._log('created', { episodeId, storyName, maxTurns: this.maxTurns, maxDurationMs: this.maxDurationMs });
  }

  // ─── 状态转换 ───

  /**
   * Attempt a state transition.
   * @param {string} targetState - Target state from STATES
   * @param {object} [payload] - Additional data for the transition
   * @returns {{ ok: boolean, error?: string }}
   */
  transition(targetState, payload = {}) {
    // Check if transition is legal
    const allowed = TRANSITIONS[this.state];
    if (!allowed || !allowed.includes(targetState)) {
      const error = `Illegal transition: ${this.state} → ${targetState}. Allowed: [${(allowed || []).join(', ')}]`;
      this._log('transition-rejected', { from: this.state, to: targetState, error });
      return { ok: false, error };
    }

    // Merge payload into context
    if (payload.agents) this.agents = payload.agents;
    if (payload.episodeDir) this.episodeDir = payload.episodeDir;

    // Check preconditions
    const checker = PRECONDITIONS[targetState];
    if (checker) {
      const precondError = checker(this);
      if (precondError) {
        const error = `Precondition failed for ${targetState}: ${precondError}`;
        this._log('precondition-failed', { from: this.state, to: targetState, error: precondError });
        return { ok: false, error };
      }
    }

    // Execute transition
    const from = this.state;
    this.state = targetState;

    if (targetState === STATES.SIMULATING) {
      this.startedAt = Date.now();
      this.turnCount = 0;
    }

    this._log('transition', { from, to: targetState, payload: Object.keys(payload) });
    return { ok: true };
  }

  // ─── 防死循环：Turn 计数 ───

  /**
   * Record an interaction turn. Returns limit status.
   * @returns {{ ok: boolean, turnsUsed: number, turnsRemaining: number, timeUsedMs: number, timeRemainingMs: number, shouldWrap: boolean, reason?: string }}
   */
  tick() {
    if (this.state !== STATES.SIMULATING) {
      return { ok: false, shouldWrap: false, reason: `Not simulating (state=${this.state})` };
    }

    this.turnCount++;
    const elapsed = Date.now() - this.startedAt;
    const turnsRemaining = this.maxTurns - this.turnCount;
    const timeRemainingMs = this.maxDurationMs - elapsed;

    let shouldWrap = false;
    let reason = null;

    if (this.turnCount >= this.maxTurns) {
      shouldWrap = true;
      reason = `Turn limit reached (${this.turnCount}/${this.maxTurns})`;
    } else if (elapsed >= this.maxDurationMs) {
      shouldWrap = true;
      reason = `Duration limit reached (${Math.round(elapsed / 1000)}s / ${Math.round(this.maxDurationMs / 1000)}s)`;
    }

    if (shouldWrap) {
      this._log('limit-reached', { reason, turnCount: this.turnCount, elapsedMs: elapsed });
    }

    return {
      ok: true,
      turnsUsed: this.turnCount,
      turnsRemaining: Math.max(0, turnsRemaining),
      timeUsedMs: elapsed,
      timeRemainingMs: Math.max(0, timeRemainingMs),
      shouldWrap,
      reason,
    };
  }

  // ─── 持久化 ───

  /**
   * Save FSM state to episode directory.
   */
  save() {
    if (!this.episodeDir) return;
    const stateFile = path.join(this.episodeDir, '.fsm-state.json');
    writeJson(stateFile, {
      state: this.state,
      episodeId: this.episodeId,
      storyName: this.storyName,
      agents: this.agents,
      turnCount: this.turnCount,
      maxTurns: this.maxTurns,
      maxDurationMs: this.maxDurationMs,
      startedAt: this.startedAt,
      history: this.history,
      savedAt: nowIso(),
    });
  }

  /**
   * Restore FSM from saved state.
   * @param {string} episodeDir
   * @returns {SessionFSM|null}
   */
  static restore(episodeDir, storyName) {
    const stateFile = path.join(episodeDir, '.fsm-state.json');
    if (!exists(stateFile)) return null;

    const data = readJson(stateFile);
    const fsm = new SessionFSM(data.episodeId, storyName, {
      maxTurns: data.maxTurns,
      maxDurationMs: data.maxDurationMs,
    });
    fsm.state = data.state;
    fsm.agents = data.agents || [];
    fsm.episodeDir = episodeDir;
    fsm.turnCount = data.turnCount || 0;
    fsm.startedAt = data.startedAt;
    fsm.history = data.history || [];
    return fsm;
  }

  // ─── 查询 ───

  getStatus() {
    const elapsed = this.startedAt ? Date.now() - this.startedAt : 0;
    return {
      state: this.state,
      episodeId: this.episodeId,
      storyName: this.storyName,
      agents: this.agents,
      turnCount: this.turnCount,
      maxTurns: this.maxTurns,
      elapsedMs: elapsed,
      maxDurationMs: this.maxDurationMs,
      turnsRemaining: Math.max(0, this.maxTurns - this.turnCount),
      timeRemainingMs: Math.max(0, this.maxDurationMs - elapsed),
      historyLength: this.history.length,
    };
  }

  // ─── 内部日志 ───

  _log(event, data = {}) {
    this.history.push({
      event,
      timestamp: nowIso(),
      state: this.state,
      ...data,
    });
  }
}
