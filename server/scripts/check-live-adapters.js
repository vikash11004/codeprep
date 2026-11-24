import { randomUUID } from 'node:crypto';
const base=process.env.CODEPREP_CHECK_URL || 'https://codeprep-a1zw.onrender.com';
const session=randomUUID();
async function request(path,body){const response=await fetch(base+'/api'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','x-session-id':session},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(180000)});const data=await response.json();if(!response.ok)throw new Error(`${response.status}: ${data.error}`);return data;}
const health=await request('/health');
console.log(JSON.stringify(health.runtimes));
const cases=[
 ['two-sum','C++','#include <bits/stdc++.h>\nusing namespace std;class Solution{public:vector<int> twoSum(vector<int>& nums,int target){unordered_map<int,int> seen;for(int i=0;i<nums.size();i++){if(seen.count(target-nums[i]))return {seen[target-nums[i]],i};seen[nums[i]]=i;}return {};}};'],
 ['two-sum','Java','class Solution{public int[] twoSum(int[] nums,int target){java.util.HashMap<Integer,Integer> s=new java.util.HashMap<>();for(int i=0;i<nums.length;i++){if(s.containsKey(target-nums[i]))return new int[]{s.get(target-nums[i]),i};s.put(nums[i],i);}return new int[]{};}}'],
 ['reverse-linked-list','Python','class Solution:\n    def reverseList(self,head):\n        prev=None\n        while head:\n            nxt=head.next;head.next=prev;prev=head;head=nxt\n        return prev'],
 ['min-stack','JavaScript','class MinStack{constructor(){this.a=[];}push(v){this.a.push(v);}pop(){this.a.pop();}top(){return this.a.at(-1);}getMin(){return Math.min(...this.a);}}'],
];
for(const [problemId,language,code] of cases){const p=await request('/problems/'+problemId);if(!p.contract.leetcode)throw Error('New source adapters are not deployed yet');const result=await request('/run',{problemId,language,code});if(!result.allPassed)throw Error(`${problemId}/${language}: ${result.executionError || JSON.stringify(result.results.filter(r=>!r.passed))}`);console.log(`${problemId}/${language}: ${result.summary.passed}/${result.summary.total} passed; accepted=${result.accepted}`);}
