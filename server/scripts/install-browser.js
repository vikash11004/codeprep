import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const child = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/playwright/cli.js', import.meta.url)), 'install', 'chromium'], { cwd: root, stdio: 'inherit', windowsHide: true, env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: fileURLToPath(new URL('../.tools/browsers/', import.meta.url)) } });
child.on('exit', code => process.exit(code || 0));
child.on('error', error => { console.error(error.message); process.exit(1); });
