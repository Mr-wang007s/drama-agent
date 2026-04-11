import fs from 'node:fs';
import path from 'node:path';

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
const runtimeDir = path.join(process.cwd(), 'dramaspec', 'runtime');
fs.mkdirSync(runtimeDir, { recursive: true });

if (raw.trim()) {
  let line = raw.trim();
  try {
    const payload = JSON.parse(raw);
    line = JSON.stringify({
      at: new Date().toISOString(),
      tool: payload?.tool || payload?.tool_name || 'unknown',
      file: payload?.tool_input?.file_path || payload?.tool_input?.filePath || null
    });
  } catch {
    line = JSON.stringify({ at: new Date().toISOString(), tool: 'unknown', file: null });
  }
  fs.appendFileSync(path.join(runtimeDir, 'tool-events.jsonl'), `${line}\n`, 'utf8');
  process.stdout.write(raw);
}
