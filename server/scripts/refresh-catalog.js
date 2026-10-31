import { readFile, writeFile } from 'node:fs/promises';
import { safeFetch, htmlText, parseStatement } from '../lib/scraper.js';
const file = new URL('../data/problems.json', import.meta.url);
const problems = JSON.parse(await readFile(file, 'utf8'));
const queue = problems.filter(p => !process.argv.includes('--missing-only') || !p.refreshedAt); let done = 0, updated = 0; const failed = [];
async function worker() {
  while (queue.length) {
    const p = queue.shift();
    try {
      const u = new URL(p.sourceUrl);
      const slug = u.pathname.match(/\/problems\/([^/]+)/)?.[1];
      if (!slug || !/(^|\.)leetcode\.com$/.test(u.hostname)) throw new Error('No supported source');
      const response = await safeFetch('https://leetcode.com/graphql/', { method: 'POST', headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com/' }, body: JSON.stringify({ query: 'query q($titleSlug: String!) { question(titleSlug: $titleSlug) { title content difficulty } }', variables: { titleSlug: slug } }) });
      const q = JSON.parse(response.text)?.data?.question;
      if (!q?.content) throw new Error('Statement unavailable or premium');
      const parsed = parseStatement(htmlText(q.content), q.title);
      if (!parsed.isValidProblem || !parsed.examples.length) throw new Error('No usable examples');
      Object.assign(p, { title: q.title, description: parsed.description, examples: parsed.examples, constraints: parsed.constraints, difficulty: q.difficulty, refreshedAt: new Date().toISOString() });
      updated++;
    } catch (e) { failed.push({ id: p.id, reason: e.message }); }
    done++; if (done % 25 === 0) { await writeFile(file, JSON.stringify(problems, null, 2) + '\n'); console.log(`Checked ${done}/${problems.length}; updated ${updated}`); }
  }
}
await Promise.all([worker(), worker(), worker()]);
await writeFile(file, JSON.stringify(problems, null, 2) + '\n');
console.log(JSON.stringify({ updated, checked: problems.length, failed }, null, 2));
