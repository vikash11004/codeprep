import test from 'node:test';
import assert from 'node:assert/strict';
import { execute, starterCode } from '../lib/runner.js';
import { getSuite } from '../lib/test-packs.js';

test('LeetCode Two Sum signatures execute all verified cases in each language', async () => {
  const suite = getSuite({ id: 'two-sum' });
  const programs = {
    JavaScript: 'var twoSum = function(nums,target){for(let i=0;i<nums.length;i++)for(let j=i+1;j<nums.length;j++)if(nums[i]+nums[j]===target)return [i,j];};',
    Python: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        for i in range(len(nums)):\n            for j in range(i+1,len(nums)):\n                if nums[i]+nums[j]==target: return [i,j]',
    'C++': '#include <bits/stdc++.h>\nusing namespace std; class Solution{public: vector<int> twoSum(vector<int>& nums,int target){for(int i=0;i<nums.size();i++)for(int j=i+1;j<nums.size();j++)if(nums[i]+nums[j]==target)return {i,j};return {};}};',
    Java: 'class Solution{public int[] twoSum(int[] nums,int target){for(int i=0;i<nums.length;i++)for(int j=i+1;j<nums.length;j++)if(nums[i]+nums[j]==target)return new int[]{i,j};return new int[]{};}}',
  };
  for (const [language, code] of Object.entries(programs)) {
    assert.match(starterCode(suite.contract, language), /twoSum/);
    const result = await execute(code, language, suite);
    assert.equal(result.accepted, true, `${language}: ${result.executionError}`);
    assert.equal(result.summary.passed, 256);
  }
});
