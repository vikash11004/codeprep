import { readFile, writeFile } from 'node:fs/promises';
import { safeFetch } from '../lib/scraper.js';
const catalog = JSON.parse(await readFile(new URL('../data/problems.json', import.meta.url), 'utf8'));
const file = new URL('../data/leetcode-signatures.json', import.meta.url);
let signatures = {}; try { signatures = JSON.parse(await readFile(file, 'utf8')); } catch {}
const queue = catalog.filter(p => !signatures[p.id]); let completed = 0;
async function worker() {
  while(queue.length) {
    const p = queue.shift();
    try {
      const slug = new URL(p.sourceUrl).pathname.match(/\/problems\/([^/]+)/)?.[1];
      const response = await safeFetch('https://leetcode.com/graphql/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'query q($titleSlug:String!){question(titleSlug:$titleSlug){metaData codeSnippets{langSlug code}}}', variables: { titleSlug: slug } }) });
      const q = JSON.parse(response.text)?.data?.question;
      if(q?.metaData) signatures[p.id] = { metadata: JSON.parse(q.metaData), snippets: q.codeSnippets || [] };
    } catch(e) { console.log(`${p.id}: ${e.message}`); }
    if (++completed % 25 === 0) { await writeFile(file, JSON.stringify(signatures, null, 2)); console.log(`${completed} checked; ${Object.keys(signatures).length} signatures`); }
  }
}
await Promise.all([worker(),worker()]);
await writeFile(file, JSON.stringify(signatures, null, 2));
console.log(`Saved ${Object.keys(signatures).length} source signatures`);
