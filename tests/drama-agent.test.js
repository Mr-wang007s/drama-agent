import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const cliPath = path.join(repoRoot, 'bin', 'drama-agent.js');


function run(args, cwd) {
  // 保持 argv 数组调用，避免 Windows 下 shell 路径解析和转义问题。
  return execFileSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: 'utf8'
  });
}


test('new 命令会创建单集四件套', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'drama-agent-'));

  run(['new', 'ep02-shadow-price', '--title', '影价'], cwd);

  assert.equal(fs.existsSync(path.join(cwd, 'dramaspec', 'episodes', 'ep02-shadow-price', 'episode-brief.md')), true);
  assert.equal(fs.existsSync(path.join(cwd, 'dramaspec', 'episodes', 'ep02-shadow-price', 'beat-sheet.md')), true);
  assert.equal(fs.existsSync(path.join(cwd, 'dramaspec', 'episodes', 'ep02-shadow-price', 'tasks.md')), true);
  assert.equal(fs.existsSync(path.join(cwd, 'dramaspec', 'episodes', 'ep02-shadow-price', 'specs', 'story-contract', 'spec.md')), true);
});

test('check 命令会生成检查报告', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'drama-agent-'));

  run(['new', 'ep03-echo-room', '--title', '回声室', '--logline', '录音棚回放把每个人都逼到必须表态的角落。', '--premise', '一次重启录音让旧合约和旧伤口同时回声返场。'], cwd);

  run(['check', 'ep03-echo-room'], cwd);

  const report = fs.readFileSync(path.join(cwd, 'dramaspec', 'episodes', 'ep03-echo-room', 'check-report.md'), 'utf8');
  assert.match(report, /### 单集验收报告/);
  assert.match(report, /PASS/);
});

test('check 会拦截占位文本', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'drama-agent-'));

  run(['new', 'ep04-placeholder-case', '--title', '占位测试'], cwd);
  run(['check', 'ep04-placeholder-case'], cwd);

  const report = fs.readFileSync(path.join(cwd, 'dramaspec', 'episodes', 'ep04-placeholder-case', 'check-report.md'), 'utf8');
  assert.match(report, /FAIL/);
  assert.match(report, /单集元数据 premise 仍包含占位文本/);
});

test('new 会拒绝非法 episode-id', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'drama-agent-'));

  assert.throws(() => run(['new', '../evil-episode'], cwd), /非法 episode-id/);
});

test('roll 会拒绝非法 snapshot 名称', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'drama-agent-'));

  run(['new', 'ep05-safe-roll', '--title', '回滚测试'], cwd);
  run(['brief', 'ep05-safe-roll'], cwd);

  assert.throws(() => run(['roll', 'ep05-safe-roll', '--to', '../escape'], cwd), /非法快照|路径越界/);
  assert.throws(() => run(['roll', 'ep05-safe-roll', '--to', '..\\escape'], cwd), /非法快照|路径越界/);
  assert.throws(() => run(['roll', 'ep05-safe-roll', '--to', 'C:\\temp\\escape'], cwd), /非法快照|路径越界/);
});




