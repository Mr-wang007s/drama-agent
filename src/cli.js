import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const WORKSPACE_ROOT = process.cwd();
const DRAMASPEC_DIR = path.join(WORKSPACE_ROOT, 'dramaspec');
const EPISODES_DIR = path.join(DRAMASPEC_DIR, 'episodes');
const CHARACTERS_DIR = path.join(DRAMASPEC_DIR, 'characters');
const SNAPSHOT_ROOT = path.join(DRAMASPEC_DIR, '.snapshots');
const SERIES_STATE_FILE = path.join(DRAMASPEC_DIR, 'series-state.json');

function nowIso() {
  return new Date().toISOString();
}

function stamp() {
  return nowIso().replace(/[:.]/g, '-');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function readText(filePath, fallback = '') {
  if (!exists(filePath)) {
    return fallback;
  }

  return fs.readFileSync(filePath, 'utf8');
}

function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

function readJson(filePath, fallback = null) {
  if (!exists(filePath)) {
    return fallback;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function renderTemplate(templateName, vars) {
  const templatePath = path.join(PACKAGE_ROOT, 'templates', templateName);
  const template = readText(templatePath);

  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => `${vars[key] ?? ''}`);
}

function parseArgs(argv) {
  const parsed = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      parsed._.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith('--')) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function resolveWithin(root, ...parts) {
  const absoluteRoot = path.resolve(root);
  const target = path.resolve(absoluteRoot, ...parts);
  const relative = path.relative(absoluteRoot, target);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('路径越界');
  }

  return target;
}

function assertEpisodeId(episodeId) {
  if (!/^ep\d{2}(?:[-_][a-z0-9]+(?:[-_][a-z0-9]+)*)?$/i.test(episodeId)) {
    throw new Error(`非法 episode-id：${episodeId}`);
  }
}

function assertSceneId(sceneId) {
  if (!/^S\d{2}$/i.test(sceneId)) {
    throw new Error(`非法 scene-id：${sceneId}`);
  }
}

function episodeDir(episodeId) {
  assertEpisodeId(episodeId);
  return resolveWithin(EPISODES_DIR, episodeId);
}

function episodeMetaFile(episodeId) {
  return resolveWithin(episodeDir(episodeId), '.dramaspec.json');
}


function readEpisodeMeta(episodeId) {
  const meta = readJson(episodeMetaFile(episodeId));

  if (!meta) {
    throw new Error(`未找到单集 ${episodeId}，请先执行 new`);
  }

  return meta;
}

function writeEpisodeMeta(meta) {
  meta.updatedAt = nowIso();
  writeJson(episodeMetaFile(meta.id), meta);
}

function titleFromEpisodeId(episodeId) {
  return episodeId
    .replace(/^ep\d+[-_]?/i, '')
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
    || episodeId;
}

function episodeNumber(episodeId) {
  const match = episodeId.match(/ep(\d+)/i);
  return match ? match[1].padStart(2, '0') : '00';
}

const PLACEHOLDER_TOKENS = ['请补充本集 logline。', '请补充本集 premise。'];


function countMarkdownTasks(content) {
  const open = (content.match(/^- \[ \]/gm) || []).length;
  const done = (content.match(/^- \[[xX]\]/gm) || []).length;
  return { open, done, total: open + done };
}

function containsPlaceholderText(value = '') {
  return PLACEHOLDER_TOKENS.some((token) => value.includes(token));
}

function safeWrite(filePath, content, force = false) {

  if (!force && exists(filePath)) {
    return false;
  }

  writeText(filePath, content);
  return true;
}

function ensureSeriesState() {
  const current = readJson(SERIES_STATE_FILE);

  if (current) {
    return current;
  }

  const initial = {
    title: '未命名系列',
    logline: '',
    currentEpisode: null,
    updatedAt: nowIso(),
    wrappedEpisodes: [],
    carryOvers: []
  };

  writeJson(SERIES_STATE_FILE, initial);
  return initial;
}

function buildDefaultSceneManifest(meta) {
  return [
    {
      id: 'S01',
      title: '冷开场钩子',
      goal: '用异常事件或冲突画面建立本集悬念。',
      conflict: '角色尚未理解局势，但观众已经察觉风险。',
      status: 'queued',
      acceptance: ['给出本集主悬念', '主角做出一个会引发后果的动作']
    },
    {
      id: 'S02',
      title: '关系施压',
      goal: '通过人物互动把角色关系推向更紧状态。',
      conflict: '公开目标与隐藏动机开始出现偏差。',
      status: 'queued',
      acceptance: ['至少一组关系发生变化', '埋入下一场的选择压力']
    },
    {
      id: 'S03',
      title: '代价升级',
      goal: '让本集核心冲突真正升级，逼出选择。',
      conflict: '角色必须在损失与信念之间做取舍。',
      status: 'queued',
      acceptance: ['冲突代价被明确量化', '角色秘密或计划至少暴露一部分']
    },
    {
      id: 'S04',
      title: '悬念收束',
      goal: '阶段性收束本集，但保留跨集张力。',
      conflict: '表面结束与真实危机之间形成反差。',
      status: 'queued',
      acceptance: ['本集主问题获得阶段答案', '留下一个跨集追问']
    }
  ].map((scene, index) => ({
    ...scene,
    order: index + 1,
    owner: index === 0 ? 'director' : 'ensemble',
    episodeId: meta.id
  }));
}

function buildDefaultFeatureList(meta) {
  return [
    {
      id: 'F-01',
      type: 'plot-hook',
      description: `围绕《${meta.title}》建立本集独立钩子。`,
      resolved: false
    },
    {
      id: 'F-02',
      type: 'character-pressure',
      description: '让主角与关键配角关系发生可追踪变化。',
      resolved: false
    },
    {
      id: 'F-03',
      type: 'carry-over',
      description: '为下一集保留一个必须兑现的悬念。',
      resolved: false
    }
  ];
}

function createEpisodeArtifacts(meta, options = {}) {
  const { force = false } = options;
  const dir = episodeDir(meta.id);
  const specsDir = path.join(dir, 'specs', 'story-contract');
  const runtimeDir = path.join(dir, 'runtime');
  const archiveDir = path.join(dir, 'archive');
  const vars = {
    episodeId: meta.id,
    episodeNo: episodeNumber(meta.id),
    title: meta.title,
    arc: meta.arc,
    logline: meta.logline,
    theme: meta.theme,
    premise: meta.premise,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt
  };

  ensureDir(specsDir);
  ensureDir(runtimeDir);
  ensureDir(archiveDir);

  safeWrite(path.join(dir, 'episode-brief.md'), renderTemplate('episode-brief.md', vars), force);
  safeWrite(path.join(dir, 'beat-sheet.md'), renderTemplate('beat-sheet.md', vars), force);
  safeWrite(path.join(specsDir, 'spec.md'), renderTemplate('spec.md', vars), force);
  safeWrite(path.join(dir, 'tasks.md'), renderTemplate('tasks.md', vars), force);

  const featureListFile = path.join(dir, 'feature_list.json');
  if (force || !exists(featureListFile)) {
    writeJson(featureListFile, buildDefaultFeatureList(meta));
  }

  const sceneManifestFile = path.join(dir, 'scene-manifest.json');
  if (force || !exists(sceneManifestFile)) {
    writeJson(sceneManifestFile, buildDefaultSceneManifest(meta));
  }
}

function snapshotEpisode(episodeId) {
  const sourceDir = episodeDir(episodeId);

  if (!exists(sourceDir)) {
    return null;
  }

  const targetDir = path.join(SNAPSHOT_ROOT, episodeId, stamp());
  ensureDir(path.dirname(targetDir));
  fs.cpSync(sourceDir, targetDir, { recursive: true });
  return targetDir;
}

function listEpisodes() {
  ensureDir(EPISODES_DIR);
  return fs.readdirSync(EPISODES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function checkEpisode(episodeId) {
  const meta = readEpisodeMeta(episodeId);
  const dir = episodeDir(episodeId);
  const tasksFile = path.join(dir, 'tasks.md');
  const sceneManifestFile = path.join(dir, 'scene-manifest.json');
  const featureListFile = path.join(dir, 'feature_list.json');
  const requiredFiles = [
    'episode-brief.md',
    'beat-sheet.md',
    'tasks.md',
    path.join('specs', 'story-contract', 'spec.md'),
    'feature_list.json',
    'scene-manifest.json'
  ];

  const blockers = [];
  const warnings = [];

  for (const relative of requiredFiles) {
    if (!exists(path.join(dir, relative))) {
      blockers.push(`缺少必要文件：${relative}`);
    }
  }

  for (const [field, value] of Object.entries({
    logline: meta.logline ?? '',
    premise: meta.premise ?? '',
    theme: meta.theme ?? ''
  })) {
    if (containsPlaceholderText(String(value))) {
      blockers.push(`单集元数据 ${field} 仍包含占位文本。`);
    }
  }

  for (const relative of ['episode-brief.md', 'beat-sheet.md', path.join('specs', 'story-contract', 'spec.md')]) {
    const content = readText(path.join(dir, relative));
    if (containsPlaceholderText(content)) {
      blockers.push(`${relative} 仍包含占位文本。`);
    }
  }

  const tasksStats = countMarkdownTasks(readText(tasksFile));

  if (tasksStats.open > 0) {
    warnings.push(`仍有 ${tasksStats.open} 个未完成任务。`);
  }

  const scenes = readJson(sceneManifestFile, []);
  if (scenes.length === 0) {
    blockers.push('scene-manifest.json 为空，无法运行单集。');
  }

  for (const scene of scenes) {
    if (!scene.goal || !scene.conflict) {
      blockers.push(`场景 ${scene.id ?? 'unknown'} 缺少 goal 或 conflict。`);
    }

    if (!Array.isArray(scene.acceptance) || scene.acceptance.length === 0) {
      warnings.push(`场景 ${scene.id ?? 'unknown'} 没有验收条件。`);
    }
  }

  const featureList = readJson(featureListFile, []);
  const unresolvedFeatures = featureList.filter((item) => !item.resolved);

  if (unresolvedFeatures.length === featureList.length && featureList.length > 0) {
    warnings.push('所有剧情 feature 仍处于未兑现状态。');
  }

  const characterFiles = fs.readdirSync(CHARACTERS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.ya?ml$/i.test(entry.name));

  if (characterFiles.length === 0) {
    warnings.push('未找到角色 YAML，当前项目仍缺少完整角色 canon。');
  }

  return {
    meta,
    blockers,
    warnings,
    tasksStats,
    scenes,
    unresolvedFeatures,
    passed: blockers.length === 0,
    generatedAt: nowIso()
  };
}

function renderCheckReport(report) {
  const blockerLines = report.blockers.length
    ? report.blockers.map((item) => `- [阻断] ${item}`).join('\n')
    : '- 无阻断问题';
  const warningLines = report.warnings.length
    ? report.warnings.map((item) => `- [提醒] ${item}`).join('\n')
    : '- 无额外提醒';
  const sceneLines = report.scenes.map((scene) => `- ${scene.id} | ${scene.title} | ${scene.status}`).join('\n');

  return `### 单集验收报告\n\n- **单集**：${report.meta.id}\n- **标题**：${report.meta.title}\n- **生成时间**：${report.generatedAt}\n- **结果**：${report.passed ? 'PASS' : 'FAIL'}\n\n### 任务统计\n\n- **已完成**：${report.tasksStats.done}\n- **未完成**：${report.tasksStats.open}\n- **总数**：${report.tasksStats.total}\n\n### 阻断项\n\n${blockerLines}\n\n### 提醒项\n\n${warningLines}\n\n### Scene 清单\n\n${sceneLines || '- 暂无场景'}\n\n### 未兑现 Feature\n\n${report.unresolvedFeatures.length ? report.unresolvedFeatures.map((item) => `- ${item.id}: ${item.description}`).join('\n') : '- 无'}\n`;
}

function printHelp() {
  console.log(`\nDrama Agent CLI\n\n用法：\n  drama-agent <command> [options]\n\n命令：\n  new <episode-id> [--title 标题] [--arc 篇章] [--logline 简述] [--premise 前提] [--theme 主题]\n  brief <episode-id> [--force]\n  run <episode-id> [--scene S02]\n  scene <episode-id> <scene-id>\n  check <episode-id>\n  wrap <episode-id>\n  status [episode-id]\n  roll <episode-id> [--to latest|时间戳]\n`);
}


function commandNew(args) {
  const episodeId = args._[1];

  if (!episodeId) {
    throw new Error('new 需要提供 episode-id，例如 ep02-shadow-price');
  }

  const dir = episodeDir(episodeId);
  if (exists(dir)) {
    throw new Error(`单集 ${episodeId} 已存在`);
  }

  ensureDir(dir);
  ensureSeriesState();

  const meta = {
    id: episodeId,
    title: args.title || titleFromEpisodeId(episodeId),
    arc: args.arc || 'Season 1 / Pilot Arc',
    logline: args.logline || '请补充本集 logline。',
    premise: args.premise || '请补充本集 premise。',
    theme: args.theme || '身份、选择与代价',
    status: 'draft',
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  writeEpisodeMeta(meta);
  createEpisodeArtifacts(meta);

  console.log(`已创建单集 ${episodeId}`);
  console.log(`- 标题：${meta.title}`);
  console.log(`- 下一步：drama-agent brief ${episodeId}`);
}

function commandBrief(args) {
  const episodeId = args._[1];
  if (!episodeId) {
    throw new Error('brief 需要提供 episode-id');
  }

  const snapshotPath = snapshotEpisode(episodeId);
  const meta = readEpisodeMeta(episodeId);
  meta.status = 'briefed';
  writeEpisodeMeta(meta);
  createEpisodeArtifacts(meta, { force: Boolean(args.force) });

  const reportPath = path.join(episodeDir(episodeId), 'runtime', 'brief-build.md');
  writeText(reportPath, `### Brief Build\n\n- **episode**: ${episodeId}\n- **force**: ${Boolean(args.force)}\n- **snapshot**: ${snapshotPath ?? 'none'}\n- **updatedAt**: ${meta.updatedAt}\n`);

  console.log(`已补齐 ${episodeId} 的四件套与运行目录。`);
}

function commandStatus(args) {
  const episodeId = args._[1];

  if (!episodeId) {
    const episodes = listEpisodes();
    if (episodes.length === 0) {
      console.log('当前还没有单集。');
      return;
    }

    for (const item of episodes) {
      const meta = readEpisodeMeta(item);
      const tasks = countMarkdownTasks(readText(path.join(episodeDir(item), 'tasks.md')));
      console.log(`- ${item} | ${meta.status} | ${tasks.done}/${tasks.total} tasks done`);
    }
    return;
  }

  const meta = readEpisodeMeta(episodeId);
  const tasks = countMarkdownTasks(readText(path.join(episodeDir(episodeId), 'tasks.md')));
  const scenes = readJson(path.join(episodeDir(episodeId), 'scene-manifest.json'), []);
  const queued = scenes.filter((scene) => scene.status === 'queued').length;
  const done = scenes.filter((scene) => scene.status === 'done').length;

  console.log(`单集：${episodeId}`);
  console.log(`标题：${meta.title}`);
  console.log(`状态：${meta.status}`);
  console.log(`任务：${tasks.done}/${tasks.total}`);
  console.log(`场景：${done} done / ${queued} queued / ${scenes.length} total`);
  if (meta.lastRunAt) {
    console.log(`最近运行：${meta.lastRunAt}`);
  }
  if (meta.wrappedAt) {
    console.log(`已归档：${meta.wrappedAt}`);
  }
}

function writeRunPack(meta, scenes, mode) {
  const runId = stamp();
  const runDir = path.join(episodeDir(meta.id), 'runtime', 'runs', runId);
  ensureDir(runDir);

  const directorBrief = `### Director Run Pack\n\n- **episode**: ${meta.id}\n- **title**: ${meta.title}\n- **mode**: ${mode}\n- **goal**: ${meta.logline}\n\n### Scene Queue\n\n${scenes.map((scene) => `- ${scene.id} ${scene.title} :: ${scene.goal}`).join('\n')}\n\n### Team Roles\n\n- **director**：控制节拍、冲突和终局约束\n- **character ensemble**：从角色动机与关系出发演绎冲突\n- **narrator**：把事件流改写成可发布文本\n- **quality**：对照 spec、scene acceptance 和 continuity 检查\n`;

  writeText(path.join(runDir, 'director-brief.md'), directorBrief);
  writeJson(path.join(runDir, 'scene-queue.json'), scenes);
  writeJson(path.join(runDir, 'team-plan.json'), {
    director: 'drama-director',
    ensemble: 'drama-character',
    narrator: 'drama-narrator',
    quality: 'drama-quality',
    mode,
    runId,
    createdAt: nowIso()
  });

  return { runId, runDir };
}

function commandRun(args) {
  const episodeId = args._[1];
  if (!episodeId) {
    throw new Error('run 需要提供 episode-id');
  }

  snapshotEpisode(episodeId);
  const meta = readEpisodeMeta(episodeId);
  const scenes = readJson(path.join(episodeDir(episodeId), 'scene-manifest.json'), []);
  const selectedScenes = args.scene
    ? scenes.filter((scene) => scene.id === args.scene)
    : scenes;

  if (selectedScenes.length === 0) {
    throw new Error(`未找到要运行的 scene：${args.scene}`);
  }

  const { runId, runDir } = writeRunPack(meta, selectedScenes, args.scene ? 'single-scene' : 'episode');
  meta.status = 'running';
  meta.lastRunAt = nowIso();
  meta.lastRunId = runId;
  writeEpisodeMeta(meta);

  console.log(`已生成运行包：${runDir}`);
}

function commandScene(args) {
  const episodeId = args._[1];
  const sceneId = args._[2];

  if (!episodeId || !sceneId) {
    throw new Error('scene 需要 episode-id 和 scene-id');
  }

  assertSceneId(sceneId);
  commandRun({ _: ['run', episodeId], scene: sceneId });
  const sceneDir = resolveWithin(episodeDir(episodeId), 'runtime', 'scenes', sceneId);

  ensureDir(sceneDir);
  writeText(path.join(sceneDir, 'replay-plan.md'), `### Scene Replay Plan\n\n- **episode**: ${episodeId}\n- **scene**: ${sceneId}\n- **intent**: 单场景重演与回放\n- **notes**: 在此记录 Git 分支、替代台词、冲突升级方案。\n`);
  console.log(`已生成场景 ${sceneId} 的重演计划。`);
}

function commandCheck(args) {
  const episodeId = args._[1];
  if (!episodeId) {
    throw new Error('check 需要提供 episode-id');
  }

  const report = checkEpisode(episodeId);
  const reportPath = path.join(episodeDir(episodeId), 'check-report.md');
  writeText(reportPath, renderCheckReport(report));

  const meta = report.meta;
  meta.lastCheckAt = report.generatedAt;
  meta.lastCheckPassed = report.passed;
  writeEpisodeMeta(meta);

  console.log(`${report.passed ? 'PASS' : 'FAIL'}: ${reportPath}`);
}

function upsertWrappedEpisode(seriesState, episodeSummary) {
  const index = seriesState.wrappedEpisodes.findIndex((item) => item.id === episodeSummary.id);

  if (index === -1) {
    seriesState.wrappedEpisodes.push(episodeSummary);
    return;
  }

  seriesState.wrappedEpisodes[index] = episodeSummary;
}

function commandWrap(args) {
  const episodeId = args._[1];
  if (!episodeId) {
    throw new Error('wrap 需要提供 episode-id');
  }

  snapshotEpisode(episodeId);
  const report = checkEpisode(episodeId);
  const reportPath = path.join(episodeDir(episodeId), 'check-report.md');
  writeText(reportPath, renderCheckReport(report));

  if (!report.passed) {
    throw new Error(`当前单集存在阻断项，已重新生成检查报告：${reportPath}`);
  }

  const meta = report.meta;
  meta.status = 'wrapped';
  meta.wrappedAt = nowIso();
  writeEpisodeMeta(meta);

  const seriesState = ensureSeriesState();
  const featureList = readJson(path.join(episodeDir(episodeId), 'feature_list.json'), []);
  const carryOvers = featureList
    .filter((item) => !item.resolved)
    .map((item) => ({ fromEpisode: episodeId, id: item.id, description: item.description }));

  seriesState.currentEpisode = episodeId;
  seriesState.updatedAt = nowIso();
  seriesState.carryOvers = carryOvers;
  upsertWrappedEpisode(seriesState, {
    id: episodeId,
    title: meta.title,
    wrappedAt: meta.wrappedAt,
    unresolvedFeatures: carryOvers.length
  });
  writeJson(SERIES_STATE_FILE, seriesState);

  const wrapReport = `### Wrap Report\n\n- **episode**: ${episodeId}\n- **title**: ${meta.title}\n- **wrappedAt**: ${meta.wrappedAt}\n- **unresolved carry-overs**: ${carryOvers.length}\n\n### Carry Overs\n\n${carryOvers.length ? carryOvers.map((item) => `- ${item.id}: ${item.description}`).join('\n') : '- 无'}\n`;
  writeText(path.join(episodeDir(episodeId), 'wrap-report.md'), wrapReport);

  console.log(`已归档 ${episodeId}，系列状态已更新。`);
}

function listSnapshots(episodeId) {
  const snapshotDir = resolveWithin(SNAPSHOT_ROOT, episodeId);
  if (!exists(snapshotDir)) {
    return [];
  }

  return fs.readdirSync(snapshotDir, { withFileTypes: true })

    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function commandRoll(args) {
  const episodeId = args._[1];
  if (!episodeId) {
    throw new Error('roll 需要提供 episode-id');
  }

  const snapshots = listSnapshots(episodeId);
  if (snapshots.length === 0) {
    throw new Error(`单集 ${episodeId} 没有可用快照。`);
  }

  const selected = !args.to || args.to === 'latest'
    ? snapshots[snapshots.length - 1]
    : args.to;

  if (!snapshots.includes(selected)) {
    throw new Error(`非法快照：${selected}`);
  }

  const source = resolveWithin(SNAPSHOT_ROOT, episodeId, selected);

  if (!exists(source)) {
    throw new Error(`未找到快照 ${selected}`);
  }


  snapshotEpisode(episodeId);
  const target = episodeDir(episodeId);
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(source, target, { recursive: true });

  console.log(`已将 ${episodeId} 回滚到快照 ${selected}`);
}

const commandMap = {
  new: commandNew,
  brief: commandBrief,
  run: commandRun,
  scene: commandScene,
  check: commandCheck,
  wrap: commandWrap,
  status: commandStatus,
  roll: commandRoll
};

export async function main(argv = process.argv.slice(2)) {
  try {
    ensureDir(EPISODES_DIR);
    ensureDir(CHARACTERS_DIR);

    const parsed = parseArgs(argv);
    const command = parsed._[0];

    if (!command || command === 'help' || command === '--help') {
      printHelp();
      return;
    }

    const handler = commandMap[command];
    if (!handler) {
      throw new Error(`未知命令：${command}`);
    }

    handler(parsed);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
