import fs from 'node:fs';
import path from 'node:path';

const runtimeDir = path.join(process.cwd(), 'dramaspec', 'runtime');
fs.mkdirSync(runtimeDir, { recursive: true });
fs.appendFileSync(path.join(runtimeDir, 'compaction.log'), `${new Date().toISOString()} pre-compact\n`, 'utf8');
