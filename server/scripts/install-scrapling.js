import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const venv = fileURLToPath(new URL('../.tools/scrapling-venv', import.meta.url));
const python = `${venv}/${process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python'}`;
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || `${command} exited with ${result.status}`);
}
try {
  if (!existsSync(python)) {
    const executable = process.env.CODEPREP_PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');
    run(executable, ['-m', 'venv', venv]);
  }
  run(python, ['-m', 'pip', 'install', '--disable-pip-version-check', '-r', 'requirements-scraping.txt']);
  run(python, ['-c', 'import scrapling, curl_cffi; from scrapling.fetchers import FetcherSession; print("Scrapling", scrapling.__version__, "ready")']);
} catch (error) {
  console.error(`Scrapling setup failed: ${error.message}. Install Python 3.10+ with venv/pip and retry npm run setup:scrapling.`);
  process.exitCode = 1;
}
