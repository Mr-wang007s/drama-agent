// 临时修复脚本：清理被 PowerShell 破坏的入口 + 追加正确的 ESM 独立入口
import fs from 'node:fs';

const DIR = '.codebuddy/skills/drama-harness/scripts';
const TARGETS = ['story-init.js', 'init.js', 'wrap.js', 'status.js', 'snapshot.js', 'memory.js', 'validate.js'];

const ENTRY = [
  '',
  '// ─── 独立入口：允许 `node <script>.js` 直接运行，也可被其他模块 import { main } ───',
  'if (import.meta.url === `file://${process.argv[1].replace(/\\\\/g, \'/\')}`) {',
  '  const res = main(process.argv.slice(2));',
  '  if (res && typeof res.then === \'function\') res.catch((e) => { console.error(e); process.exit(1); });',
  '}',
  '',
].join('\n');

for (const f of TARGETS) {
  const p = `${DIR}/${f}`;
  let c = fs.readFileSync(p, 'utf8');

  // 清理旧的被破坏入口
  const lines = c.split('\n');
  const cleaned = [];
  for (const line of lines) {
    // 跳过所有包含 "Skill 独立入口" 或 "独立入口" 注释的坏行
    if (line.startsWith('\\n,//') || line.includes('独立入口') || line.startsWith(',')) continue;
    cleaned.push(line);
  }
  c = cleaned.join('\n').replace(/\s+$/, '');

  // 追加正确入口
  c += '\n' + ENTRY;
  fs.writeFileSync(p, c, 'utf8');
  console.log('fixed', f);
}
