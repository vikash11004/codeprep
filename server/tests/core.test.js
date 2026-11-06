import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs, parseValue } from '../lib/input.js';
import { catalog } from '../lib/problems.js';
import { compareOutput, getPack, getSuite, packIds } from '../lib/test-packs.js';
import { extractPage, parseStatement, publicAddress, validateUrl } from '../lib/scraper.js';

test('input parser preserves nested arrays, quoted commas, booleans and null without eval', () => {
  assert.deepEqual(parseArgs(`nums = [[1,2],[3,4]], s = 'a, b = c', ok = true, node = null`), [[[1, 2], [3, 4]], 'a, b = c', true, null]);
  assert.throws(() => parseValue('process.exit(0)'));
  assert.throws(() => parseArgs('x = (() => 42)()'));
  assert.deepEqual(parseArgs('"true and null"'), ['true and null']);
  assert.deepEqual(parseArgs('arr[] = [1,2], k = 3'), [[1, 2], 3]);
});
test('LeetCode/GFG examples do not swallow constraints or explanations', () => {
  const p = extractPage(`<html><title>Pair Sum | GeeksforGeeks</title><nav>Login Menu</nav><main><h1>Pair Sum</h1><p>Given an array of integers, return indices whose sum matches target.</p><pre><b>Input:</b> nums = [2,7], target = 9\n<b>Output:</b> [0,1]\n<b>Explanation:</b> 2 + 7 = 9</pre><h3>Constraints:</h3><p>2 &lt;= n &lt;= 10<sup>4</sup></p></main></html>`);
  assert.equal(p.title, 'Pair Sum'); assert.equal(p.examples[0].output, '[0,1]'); assert.equal(p.examples[0].explanation, '2 + 7 = 9'); assert.deepEqual(p.constraints, ['2 <= n <= 10^4']); assert.ok(!p.description.includes('Menu'));
});
test('GFG hydration and competitive programming samples are extracted', () => {
  const p = extractPage(`<title>Maximum Sum</title><script type="application/json">${JSON.stringify({ props: { problem: '<p>Given two integers, calculate their sum and print it.</p><pre>Input: a = 1, b = 2\nOutput: 3</pre>' } })}</script>`);
  assert.equal(p.examples[0].output, '3');
  const sample = parseStatement('Add numbers\nGiven two integers, calculate and print their sum.\nSample Input 1\n2 3\nSample Output 1\n5\nExplanation\nThe sum is five.');
  assert.equal(sample.examples[0].input, '2 3'); assert.equal(sample.examples[0].output, '5');
  assert.equal(parseStatement('Just a moment\nVerify you are human to continue.').isValidProblem, false);
});
test('SSRF guards block loopback, private, mapped IPv6 and DNS resolutions', async () => {
  for (const ip of ['127.0.0.1', '10.0.0.1', '172.16.0.1', '192.168.1.1', '169.254.169.254', '::1', '::ffff:127.0.0.1', 'fc00::1', '0.0.0.0', '100.64.0.1']) assert.equal(publicAddress(ip), false, ip);
  assert.equal(publicAddress('8.8.8.8'), true);
  for (const url of ['file:///etc/passwd', 'http://localhost', 'http://2130706433', 'http://[::1]', 'http://example.com:3001', 'http://user:pass@example.com']) await assert.rejects(validateUrl(url));
  await assert.rejects(validateUrl('https://example.com', async () => [{ address: '10.0.0.1', family: 4 }]));
});

test('competitive-programming samples exclude I/O specifications and sidebar navigation', () => {
  const p = extractPage(`<h1>Count Down</h1><div class="content"><div class="md"><p>Given a positive integer n, print all integers from n down to one.</p><h1>Input</h1><p>The only input line contains an integer n.</p><h1>Output</h1><p>Print the numbers in descending order.</p><h1>Constraints</h1><p>1 &lt;= n &lt;= 100</p><h1>Example</h1><p>Input:</p><pre>3\n</pre><p>Output:</p><pre>3 2 1\n</pre></div></div><div class="nav sidebar">Other tasks and submissions</div>`);
  assert.deepEqual(p.examples, [{ input: '3', output: '3 2 1', explanation: '' }]);
  assert.ok(!p.description.includes('Other tasks'));
  assert.deepEqual(p.constraints, ['1 <= n <= 100']);
});
test('comparators respect answer semantics and reject malformed results', () => {
  assert.ok(compareOutput([1, 0], [0, 1], 'two-sum', [[3, 3], 6]));
  for (const bad of [[0, 0], [0, 2], ['0', '1'], null]) assert.equal(compareOutput(bad, [0, 1], 'two-sum', [[3, 3], 6]), false);
  assert.ok(compareOutput([['tea', 'eat'], ['bat']], [['bat'], ['eat', 'tea']], 'groups'));
  assert.equal(compareOutput([1, 1], [1], 'unordered'), false);
  assert.equal(compareOutput(true, 1), false);
});
test('every catalog problem has an explicit contract and coverage; verified cases are distinct and reproducible', () => {
  let count = 0;
  for (const p of catalog) {
    const suite = getSuite(p); assert.ok(['function', 'stdin'].includes(suite.contract.mode));
    if (suite.coverage !== 'verified') continue;
    count += suite.testCases.length;
    assert.ok(packIds.includes(p.id));
    assert.equal(new Set(suite.testCases.map(t => JSON.stringify(t.args))).size, suite.testCases.length, p.id);
    assert.ok(suite.testCases.length >= 40, `${p.id}: ${suite.testCases.length}`);
    for (const t of suite.testCases) { assert.notEqual(t.expected, undefined, p.id); assert.ok(compareOutput(t.expected, t.expected, suite.compare, t.args), p.id); }
    assert.deepEqual(getSuite(p), suite);
  }
  assert.ok(count > 9000);
});
test('independent reference algorithms agree with published source examples', () => {
  let checked = 0;
  for (const p of catalog) {
    const pack = getPack(p); if (!pack || !p.refreshedAt) continue;
    for (const ex of p.examples) {
      const args = parseArgs(ex.input), expected = parseValue(ex.output);
      assert.ok(compareOutput(pack.oracle(...structuredClone(args)), expected, pack.compare, args), `${p.id}: ${ex.input}`);
      checked++;
    }
  }
  assert.ok(checked > 170);
});
