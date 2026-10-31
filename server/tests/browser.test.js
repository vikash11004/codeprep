import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, closeBrowser } from '../lib/scraper.js';
after(closeBrowser);
test('Playwright extracts a statement inserted by JavaScript after page load', async () => {
  const html = `<html><title>Dynamic Sum</title><body><main id="app">Loading…</main><script>setTimeout(() => { document.getElementById('app').innerHTML = '<h1>Dynamic Sum</h1><p>Given two integers a and b, compute and return their sum.</p><pre>Input: a = 3, b = 4\\nOutput: 7</pre>'; }, 80);</script></body></html>`;
  const result = await renderPage('https://8.8.8.8/problem', async () => ({ status: 200, contentType: 'text/html', text: html }));
  assert.equal(result.title, 'Dynamic Sum'); assert.equal(result.examples[0].output, '7');
});
