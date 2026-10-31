import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(process.env.CODEPREP_DATA_DIR || fileURLToPath(new URL('../data/local/', import.meta.url)));
const stores = new Map();
const loading = new Map();
const queues = new Map();
export async function readStore(name) {
  if (!stores.has(name) && !loading.has(name)) loading.set(name, (async () => {
    try { stores.set(name, JSON.parse(await readFile(join(root, `${name}.json`), 'utf8'))); }
    catch (error) { if (error.code !== 'ENOENT') throw error; stores.set(name, {}); }
    finally { loading.delete(name); }
  })());
  if (loading.has(name)) await loading.get(name);
  return stores.get(name);
}
export async function saveStore(name) {
  const json = JSON.stringify(await readStore(name), null, 2);
  const pending = (queues.get(name) || Promise.resolve()).catch(() => {}).then(async () => {
    await mkdir(root, { recursive: true });
    const file = join(root, `${name}.json`);
    await writeFile(`${file}.tmp`, json);
    await rename(`${file}.tmp`, file);
  });
  queues.set(name, pending);
  await pending;
}
