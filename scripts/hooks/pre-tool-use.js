import fs from 'node:fs';

function readStdin() {
  return new Promise((resolve) => {
    let buffer = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      buffer += chunk;
    });
    process.stdin.on('end', () => resolve(buffer));
  });
}

const raw = await readStdin();
if (!raw.trim()) {
  process.exit(0);
}

let payload;
try {
  payload = JSON.parse(raw);
} catch {
  process.stdout.write(raw);
  process.exit(0);
}

const filePath = payload?.tool_input?.file_path || payload?.tool_input?.filePath || '';
const isCanon = /dramaspec[\\/](series-bible\.md|characters[\\/].+\.ya?ml)$/i.test(filePath);

if (isCanon && process.env.DRAMA_AGENT_ALLOW_CANON_EDIT !== '1') {
  console.error('[DramaAgent Hook] BLOCKED: 你正在修改 canon 文件。');
  console.error('[DramaAgent Hook] 如确认要修改，请显式设置 DRAMA_AGENT_ALLOW_CANON_EDIT=1。');
  process.exit(1);
}

process.stdout.write(raw);
