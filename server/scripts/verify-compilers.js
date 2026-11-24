import { execute, getRuntimes } from '../lib/runner.js';

const suite = {
  coverage: 'samples', compare: 'exact',
  contract: { mode: 'function', params: [{ name: 'nums', type: 'int[]' }], returns: 'int' },
  testCases: [[], [2, 7, -3], [-8, -4], [1000000, -999999]].map(nums => ({ args: [nums], input: JSON.stringify(nums), expected: nums.reduce((a, b) => a + b, 0), expectedOutput: String(nums.reduce((a, b) => a + b, 0)) })),
};
const programs = {
  'C++': '#include <vector>\nclass Solution { public: int solution(std::vector<int> nums) { int sum=0; for(int n:nums) sum+=n; return sum; } };',
  Java: 'class Solution { public int solution(int[] nums) { int sum=0; for(int n:nums) sum+=n; return sum; } }',
};
for (const [language, code] of Object.entries(programs)) {
  const runtime = (await getRuntimes()).find(item => item.language === language);
  if (!runtime.available) throw new Error(runtime.reason);
  const result = await execute(code, language, suite);
  if (!result.allPassed) throw new Error(`${language} compile/run check failed: ${result.executionError || JSON.stringify(result.results.filter(test => !test.passed))}`);
  console.log(`${language}: ${runtime.version}; compiled and passed ${result.summary.passed}/${result.summary.total} cases with the app's native judge.`);
}
