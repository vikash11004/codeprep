import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateUrl } from './public-url.js';

const worker = fileURLToPath(new URL('../scripts/scrapling-worker.py', import.meta.url));
const localPython = fileURLToPath(new URL(`../.tools/scrapling-venv/${process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python'}`, import.meta.url));

export function scraplingAvailable() {
  return process.env.CODEPREP_SCRAPLING_ENABLED !== 'false' && existsSync(process.env.CODEPREP_SCRAPLING_PYTHON || localPython);
}

export function runScraplingWorker(payload, timeoutMs = 14000) {
  if (!scraplingAvailable()) return Promise.reject(new Error('Scrapling is not installed or is disabled. Run npm run setup:scrapling.'));
  return new Promise((resolve, reject) => {
    // Never inherit AI credentials, proxy settings, or Python import overrides.
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => /^(path|systemroot|windir|temp|tmp|lang|lc_all)$/i.test(key)));
    const child = spawn(process.env.CODEPREP_SCRAPLING_PYTHON || localPython, ['-I', worker], { env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let output = '', length = 0, settled = false;
    const finish = (error, result) => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      if (error) { child.kill(); reject(error); } else resolve(result);
    };
    const timer = setTimeout(() => finish(new Error('Scrapling request timed out.')), timeoutMs);
    child.on('error', () => finish(new Error('Scrapling could not start. Run npm run setup:scrapling.')));
    child.stdout.on('data', chunk => {
      length += chunk.length;
      if (length > 4_100_000) return finish(new Error('Scrapling response exceeded the import limit.'));
      output += chunk.toString('utf8');
    });
    child.stderr.resume();
    child.stdin.on('error', () => {}); // A failed startup can close stdin early.
    child.on('close', code => {
      if (settled) return;
      try {
        const result = JSON.parse(output);
        if (code !== 0 || result.error) throw new Error(result.error || 'Scrapling request failed.');
        if (!Number.isInteger(result.status) || result.status < 100 || result.status > 599 || typeof result.body !== 'string') throw new Error('Invalid Scrapling response.');
        finish(null, result);
      } catch { finish(new Error('Scrapling could not retrieve the page.')); }
    });
    child.stdin.end(JSON.stringify(payload));
  });
}

export async function scraplingFetch(value, { request = runScraplingWorker, validate = validateUrl } = {}) {
  const deadline = Date.now() + 25000;
  let target = value;
  for (let hop = 0; hop <= 4; hop++) {
    const { url, addresses } = await validate(target);
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error('Scrapling request timed out.');
    const response = await request({ url: url.href, addresses: addresses.map(x => x.address), timeout: Math.min(10, remaining / 1000) }, Math.min(14000, remaining));
    if ([301, 302, 303, 307, 308].includes(response.status) && response.location) {
      target = new URL(response.location, url).href;
      continue; // Revalidate and pin DNS on every redirect, including same-host redirects.
    }
    const body = Buffer.from(response.body, 'base64');
    if (body.length > 3_000_000) throw new Error('Page exceeds the 3 MB import limit.');
    let text;
    try { text = new TextDecoder(response.encoding || 'utf-8').decode(body); } catch { text = body.toString('utf8'); }
    return { ok: response.status >= 200 && response.status < 300, status: response.status, text, contentType: response.contentType || 'text/html', url: url.href };
  }
  throw new Error('The page redirected too many times.');
}
