import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { importUrl } from '../lib/scraper.js';
import { scraplingFetch, scraplingAvailable } from '../lib/scrapling.js';
import { validateUrl } from '../lib/public-url.js';

const url = 'https://8.8.8.8/problem';
const html = '<title>Add Values</title><main><h1>Add Values</h1><p>Given two integer values, compute and return their sum.</p><pre>Input: a = 2, b = 3\nOutput: 5</pre></main>';
const page = { ok: true, text: html };
const unexpected = async () => { assert.fail('A later fallback must not run after success'); };

test('ordinary HTML imports do not start Scrapling or Playwright', async () => {
  const p = await importUrl(url, { fetchPage: async () => page, fetchProfile: unexpected, render: unexpected });
  assert.equal(p.source, 'Public page');
});

test('Scrapling recovers blocked static HTML and labels the source', async () => {
  const p = await importUrl(url, { fetchPage: async () => ({ ok: false, text: 'Forbidden' }), fetchProfile: async () => page, render: unexpected });
  assert.equal(p.source, 'Scrapling browser-profile request');
  assert.equal(p.sourceUrl, url);
  assert.equal(p.examples[0].output, '5');
});

test('missing Scrapling and incomplete/challenge pages continue to Playwright', async () => {
  for (const fetchProfile of [async () => { throw new Error('Not installed'); }, async () => ({ ok: true, text: '<title>Just a moment</title><main>Verify you are human to continue</main>' }), async () => ({ ok: true, text: '<main>Given two integers, compute and print their sum.</main>' })]) {
    const p = await importUrl(url, { fetchPage: async () => ({ ok: false }), fetchProfile, render: async () => ({ isValidProblem: true, title: 'Rendered problem' }) });
    assert.equal(p.source, 'Browser-rendered page');
  }
});

test('failure of every importer gives the paste-statement recovery path', async () => {
  await assert.rejects(importUrl(url, { fetchPage: async () => ({ ok: false }), fetchProfile: async () => ({ ok: false }), render: async () => null }), /Paste the statement/);
});

test('Scrapling validates initial URLs and private redirects before starting requests', async () => {
  let count = 0;
  const request = async () => { count++; return { status: 302, location: 'http://169.254.169.254/latest/meta-data' }; };
  await assert.rejects(scraplingFetch('http://127.0.0.1', { request }), /Private/);
  assert.equal(count, 0);
  await assert.rejects(scraplingFetch(url, { request }), /Private/);
  assert.equal(count, 1);
});

test('Scrapling rechecks DNS on same-host redirects and prevents rebinding', async () => {
  let lookups = 0, requests = 0;
  await assert.rejects(scraplingFetch('https://problem.example/start', {
    validate: value => validateUrl(value, async () => [{ address: ++lookups === 1 ? '8.8.8.8' : '127.0.0.1', family: 4 }]),
    request: async payload => { requests++; assert.deepEqual(payload.addresses, ['8.8.8.8']); return { status: 302, location: '/next' }; },
  }), /Private/);
  assert.equal(requests, 1);
  assert.equal(lookups, 2);
});

test('Scrapling follows bounded public redirects and decodes response bytes', async () => {
  let count = 0;
  const response = await scraplingFetch(url, { request: async () => ++count === 1 ? { status: 302, location: '/next' } : { status: 200, body: Buffer.from('caf\xe9', 'latin1').toString('base64'), encoding: 'windows-1252' } });
  assert.equal(response.text, 'café'); assert.equal(response.url, 'https://8.8.8.8/next');
  count = 0;
  await assert.rejects(scraplingFetch(url, { request: async () => { count++; return { status: 302, location: '/loop' }; } }), /too many/);
  assert.equal(count, 5);
  await assert.rejects(scraplingFetch(url, { request: async () => ({ status: 200, body: Buffer.alloc(3_000_001).toString('base64') }) }), /3 MB/);
});

test('installed Python adapter enforces connection options and streaming bounds', { skip: !scraplingAvailable() }, async () => {
  const python = process.env.CODEPREP_SCRAPLING_PYTHON || fileURLToPath(new URL(`../.tools/scrapling-venv/${process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python'}`, import.meta.url));
  const script = fileURLToPath(new URL('./scrapling_worker_test.py', import.meta.url));
  const result = await new Promise((resolve, reject) => {
    const child = spawn(python, ['-I', script], { windowsHide: true });
    let output = '';
    child.stdout.on('data', data => { output += data; }); child.stderr.on('data', data => { output += data; });
    child.on('error', reject); child.on('close', code => resolve({ code, output }));
  });
  assert.equal(result.code, 0, result.output);
});
