import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const episodesDir = path.join(root, 'dramaspec', 'episodes');

if (!fs.existsSync(episodesDir)) {
  console.log('未发现 episodes 目录，跳过卡滞检测。');
  process.exit(0);
}

const episodes = fs.readdirSync(episodesDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
const severe = [];
const warnings = [];

for (const entry of episodes) {
  const episodeId = entry.name;
  const episodeRoot = path.join(episodesDir, episodeId);
  const metaFile = path.join(episodeRoot, '.dramaspec.json');
  const sceneFile = path.join(episodeRoot, 'scene-manifest.json');
  const tasksFile = path.join(episodeRoot, 'tasks.md');

  const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : { status: 'unknown' };
  const scenes = fs.existsSync(sceneFile) ? JSON.parse(fs.readFileSync(sceneFile, 'utf8')) : [];
  const tasksText = fs.existsSync(tasksFile) ? fs.readFileSync(tasksFile, 'utf8') : '';
  const openTasks = (tasksText.match(/^- \[ \]/gm) || []).length;
  const doneTasks = (tasksText.match(/^- \[[xX]\]/gm) || []).length;
  const queuedScenes = scenes.filter((scene) => scene.status === 'queued').length;
  const reviewScenes = scenes.filter((scene) => scene.status === 'needs_review').length;

  if (meta.status === 'running' && queuedScenes === scenes.length && scenes.length > 0) {
    severe.push(`${episodeId}: 已标记 running，但所有 scene 仍为 queued。`);
  }

  if (meta.status === 'briefed' && doneTasks === 0 && openTasks > 0) {
    warnings.push(`${episodeId}: 已 brief，但任务尚未开始推进。`);
  }

  if (reviewScenes >= 2) {
    warnings.push(`${episodeId}: 有 ${reviewScenes} 个 scene 卡在 needs_review。`);
  }
}

if (warnings.length > 0) {
  console.log('卡滞提醒：');
  for (const item of warnings) {
    console.log(`- ${item}`);
  }
}

if (severe.length > 0) {
  console.error('严重卡滞：');
  for (const item of severe) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log('卡滞检测通过。');
