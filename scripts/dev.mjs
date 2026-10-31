import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const children = [
  spawn(process.execPath, ['--watch', 'index.js'], { cwd: join(root, 'server'), stdio: 'inherit', windowsHide: true }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1'], { cwd: join(root, 'client'), stdio: 'inherit', windowsHide: true }),
];
function stop() { children.forEach(p => p.kill()); }
process.on('SIGINT', stop); process.on('SIGTERM', stop);
children.forEach(p => { p.on('error', e => { console.error(e.message); stop(); process.exitCode = 1; }); p.on('exit', code => { if (code) { stop(); process.exitCode = code; } }); });
