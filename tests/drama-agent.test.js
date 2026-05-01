import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');

// 直接测试 lib.js 的核心函数
const libPath = pathToFileURL(path.join(repoRoot, '.codebuddy', 'skills', 'drama-world', 'scripts', 'lib.js')).href;

test('getPaths() 无参数返回合法路径对象', async () => {
  const { getPaths } = await import(libPath);
  const paths = getPaths();
  assert.ok(paths.packageRoot, 'packageRoot should exist');
  assert.ok(paths.storiesDir, 'storiesDir should exist');
  assert.ok(paths.templatesDir, 'templatesDir should exist');
  assert.ok(paths.storiesDir.endsWith('stories'));
});

test('getPaths({ story }) 正确指向 stories/<name>/', async () => {
  const { getPaths } = await import(libPath);
  const paths = getPaths({ story: 'fog-manor' });
  assert.equal(paths.storyName, 'fog-manor');
  assert.ok(paths.storyRoot.includes('stories'));
  assert.ok(paths.storyRoot.endsWith('fog-manor'));
  assert.ok(paths.worldDir.includes('fog-manor'));
  assert.ok(paths.agentsDir.includes('fog-manor'));
  assert.ok(paths.episodesDir.includes('fog-manor'));
});

test('getPaths(string) 向后兼容旧版字符串参数', async () => {
  const { getPaths } = await import(libPath);
  const paths = getPaths('/tmp/test-workspace');
  assert.equal(paths.storyName, null);
  assert.ok(paths.worldDir.includes('test-workspace'));
});

test('detectStory() 从 cwd 自动检测故事名', async () => {
  const { detectStory } = await import(libPath);
  const storiesDir = path.join(repoRoot, 'stories');

  // cwd 在 stories/fog-manor/ 下时应检测到
  const result = detectStory(path.join(storiesDir, 'fog-manor', 'agents'), repoRoot);
  assert.equal(result, 'fog-manor');

  // cwd 不在 stories/ 下时返回 null
  const noResult = detectStory(repoRoot, repoRoot);
  assert.equal(noResult, null);
});

test('listStories() 列出所有故事', async () => {
  const { listStories } = await import(libPath);
  const stories = listStories(repoRoot);
  assert.ok(stories.length >= 1, 'should have at least 1 story');
  const names = stories.map(s => s.name);
  assert.ok(names.includes('fog-manor'), 'should include fog-manor');
});

test('assertStoryName() 校验故事名称', async () => {
  const { assertStoryName } = await import(libPath);
  // 合法名称
  assertStoryName('fog-manor');
  assertStoryName('red-curtain');
  assertStoryName('story1');

  // 非法名称
  assert.throws(() => assertStoryName('Fog Manor'), /非法故事名称/);
  assert.throws(() => assertStoryName('../escape'), /非法故事名称/);
  assert.throws(() => assertStoryName(''), /非法故事名称/);
});

test('parseArgs() 正确解析命令行参数', async () => {
  const { parseArgs } = await import(libPath);
  const result = parseArgs(['ep01', '--story', 'fog-manor', '--title', '第一集', '--force']);
  assert.deepEqual(result._, ['ep01']);
  assert.equal(result.story, 'fog-manor');
  assert.equal(result.title, '第一集');
  assert.equal(result.force, true);
});

test('fog-manor 故事目录结构完整', () => {
  const storyRoot = path.join(repoRoot, 'stories', 'fog-manor');
  assert.ok(fs.existsSync(path.join(storyRoot, '.story.json')), '.story.json exists');
  assert.ok(fs.existsSync(path.join(storyRoot, 'agents')), 'agents/ exists');
  assert.ok(fs.existsSync(path.join(storyRoot, 'world')), 'world/ exists');
  assert.ok(fs.existsSync(path.join(storyRoot, 'world', 'bible.md')), 'bible.md exists');
  assert.ok(fs.existsSync(path.join(storyRoot, 'world', 'state.json')), 'state.json exists');

  const meta = JSON.parse(fs.readFileSync(path.join(storyRoot, '.story.json'), 'utf8'));
  assert.equal(meta.genre, 'mystery');
  assert.ok(meta.title);
});

test('resolveWithin() 防止路径越界', async () => {
  const { resolveWithin } = await import(libPath);
  // 正常路径
  const result = resolveWithin('/tmp/stories', 'fog-manor');
  assert.ok(result.includes('fog-manor'));

  // 越界路径
  assert.throws(() => resolveWithin('/tmp/stories', '../escape'), /路径越界/);
});
