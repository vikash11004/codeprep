import test from 'node:test';
import assert from 'node:assert/strict';
import { execute, getRuntimes } from '../lib/runner.js';
import { getSuite } from '../lib/test-packs.js';
const suite = getSuite({ id: 'two-sum' });
const solutions = {
  JavaScript: 'function solution(nums,target){for(let i=0;i<nums.length;i++)for(let j=i+1;j<nums.length;j++)if(nums[i]+nums[j]===target)return [j,i];}',
  Python: 'def solution(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1,len(nums)):\n            if nums[i]+nums[j]==target: return [j,i]',
  'C++': '#include <bits/stdc++.h>\nusing namespace std; class Solution{public: vector<int> solution(vector<int> nums,int target){for(int i=0;i<(int)nums.size();i++)for(int j=i+1;j<(int)nums.size();j++)if(nums[i]+nums[j]==target)return {j,i};return {};}};',
  Java: 'class Solution {public int[] solution(int[] nums,int target){for(int i=0;i<nums.length;i++)for(int j=i+1;j<nums.length;j++)if(nums[i]+nums[j]==target)return new int[]{j,i};return new int[]{};}}',
};
test('real installed interpreters and compilers accept a correct solution on the full suite', async t => {
  const runtimes = await getRuntimes();
  for (const [language, code] of Object.entries(solutions)) await t.test(language, async () => {
    assert.ok(runtimes.find(r => r.language === language)?.available, `${language} is missing: run npm run setup:compilers`);
    const result = await execute(code, language, suite);
    assert.equal(result.accepted, true, result.executionError || result.results.find(x => !x.passed)?.error);
    assert.equal(result.summary.passed, suite.testCases.length);
  });
  await t.test('C uses a real compiler and standard input', async () => {
    const raw = { coverage: 'samples', contract: { mode: 'stdin' }, compare: 'exact', testCases: [{ input: '2 3', expectedOutput: '5' }, { input: '-7 12', expectedOutput: '5' }] };
    const result = await execute('#include <stdio.h>\nint main(void){int a,b;scanf("%d %d",&a,&b);printf("%d\\n",a+b);return 0;}', 'C', raw);
    assert.equal(result.allPassed, true, result.executionError); assert.equal(result.accepted, false);
  });
});
test('wrong answer cannot accept itself or replace server comparisons', async () => {
  const result = await execute('function solution(){console.log(JSON.stringify({passed:true})); return [0,1];}', 'JavaScript', suite);
  assert.equal(result.accepted, false); assert.ok(result.summary.failed > 200);
});
test('compilation errors and runtime exceptions are real failures', async () => {
  const compile = await execute('this is not C++', 'C++', suite);
  assert.match(compile.executionError, /Compilation failed/); assert.equal(compile.summary.passed, 0);
  const runtime = await execute('function solution(){ throw new Error("test error"); }', 'JavaScript', suite);
  assert.equal(runtime.summary.passed, 0); assert.match(runtime.results[0].error, /test error/);
});
test('debug printing and JSON strings do not corrupt execution results', async () => {
  const s = { coverage: 'samples', compare: 'exact', contract: { mode: 'function', params: [{ name: 's', type: 'string' }], returns: 'string' }, testCases: [{ args: ['true null'], expected: 'true null', input: 's = "true null"', expectedOutput: '"true null"' }] };
  const result = await execute('def solution(s):\n    print("debug")\n    return s', 'Python', s);
  assert.equal(result.allPassed, true); assert.match(result.logs, /debug/); assert.equal(result.accepted, false);
});
test('infinite loops are terminated', { timeout: 15000 }, async () => {
  const result = await execute('function solution(){while(true){}}', 'JavaScript', suite);
  assert.equal(result.allPassed, false); assert.match(result.executionError, /Time limit/);
});
test('native adapters preserve nested arrays, Unicode, floating-point and null JSON outputs', async () => {
  const suite = { coverage: 'samples', compare: 'exact', contract: { mode: 'function', params: [{ name: 'value', type: 'json' }], returns: 'json' }, testCases: [null, [1, null, '你好', 2.5], { a: [1, 2], b: false }].map(value => ({ args: [value], expected: value, input: JSON.stringify(value), expectedOutput: JSON.stringify(value) })) };
  for (const [language, code] of [
    ['Java', 'class Solution { public com.google.gson.JsonElement solution(com.google.gson.JsonElement value) { return value; } }'],
    ['C++', 'class Solution { public: nlohmann::json solution(nlohmann::json value) { return value; } };'],
  ]) {
    const result = await execute(code, language, suite);
    assert.equal(result.allPassed, true, `${language}: ${result.executionError || JSON.stringify(result.results)}`);
  }
});
