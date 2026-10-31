import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { readStore, saveStore } from './store.js';
export const catalog = JSON.parse(readFileSync(new URL('../data/problems.json', import.meta.url), 'utf8'));
export async function findProblem(id) { return catalog.find(p => p.id === id) || (await readStore('imports'))[id]; }
export async function saveProblem(problem) {
  const id = `import-${createHash('sha256').update(JSON.stringify([problem.sourceUrl, problem.title, problem.description, problem.examples])).digest('hex').slice(0, 20)}`;
  const saved = { ...problem, id, isValidProblem: true };
  (await readStore('imports'))[id] = saved;
  await saveStore('imports');
  return saved;
}
