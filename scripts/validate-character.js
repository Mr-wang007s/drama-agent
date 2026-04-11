import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const charactersDir = path.join(root, 'dramaspec', 'characters');
const requiredKeys = ['id:', 'name:', 'archetype:', 'desire:', 'fear:', 'secret:', 'voice:', 'relationships:'];

if (!fs.existsSync(charactersDir)) {
  console.error('未找到 dramaspec/characters 目录。');
  process.exit(1);
}

const files = fs.readdirSync(charactersDir).filter((file) => /\.ya?ml$/i.test(file));
if (files.length === 0) {
  console.error('未找到任何角色 YAML。');
  process.exit(1);
}

const issues = [];

for (const file of files) {
  const fullPath = path.join(charactersDir, file);
  const content = fs.readFileSync(fullPath, 'utf8');

  for (const key of requiredKeys) {
    if (!content.includes(key)) {
      issues.push(`${file} 缺少字段 ${key}`);
    }
  }

  if (!/status:\s+(active|inactive|retired)/.test(content)) {
    issues.push(`${file} 的 status 不合法，应为 active/inactive/retired`);
  }
}

if (issues.length > 0) {
  console.error('角色卡校验失败：');
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log(`角色卡校验通过：${files.length} 个文件。`);
