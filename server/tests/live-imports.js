// Explicit network smoke check; deliberately excluded from the offline test suite.
import assert from 'node:assert/strict';
import { importUrl, closeBrowser } from '../lib/scraper.js';

const sources = [
  { url: 'https://leetcode.com/problems/two-sum/', title: 'Two Sum', count: 3, input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
  { url: 'https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1', title: "Kadane's Algorithm", count: 3 },
  { url: 'https://cses.fi/problemset/task/1068', title: 'Weird Algorithm', count: 1, input: '3', output: '3 10 5 16 8 4 2 1' },
];

try {
  for (const source of sources) {
    // Force the earlier path to fail so this checks the real Scrapling bridge,
    // shared parser, source label and problem mapping, not just HTTP availability.
    const fallback = await importUrl(source.url, {
      fetchPage: async () => { throw new Error('Simulated ordinary-fetch failure'); },
      render: async () => { throw new Error('Scrapling must succeed in this check'); },
    });
    assert.equal(fallback.source, 'Scrapling browser-profile request');
    assert.equal(fallback.title, source.title);
    assert.equal(fallback.examples.length, source.count);
    if (source.input) assert.equal(fallback.examples[0].input, source.input);
    if (source.output) assert.equal(fallback.examples[0].output.replace(/,\s+/g, ','), source.output);
    const ordinary = await importUrl(source.url);
    assert.equal(ordinary.title, source.title);
    assert.equal(ordinary.examples.length, source.count);
    console.log(`${source.title}: Scrapling and normal import passed (${source.count} clean examples; normal source: ${ordinary.source}).`);
  }
} finally { await closeBrowser(); }
