import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../lib/problems.js';
import { getSuite } from '../lib/test-packs.js';
import { execute } from '../lib/runner.js';
const solutions={
 'linked-list-cycle':{
 JavaScript:'var hasCycle=function(head){const s=new Set();while(head){if(s.has(head))return true;s.add(head);head=head.next;}return false;};',
 Python:'class Solution:\n    def hasCycle(self,head):\n        s=set()\n        while head:\n            if head in s: return True\n            s.add(head);head=head.next\n        return False',
 'C++':'class Solution{public:bool hasCycle(ListNode* head){unordered_set<ListNode*> s;while(head){if(!s.insert(head).second)return true;head=head->next;}return false;}};',
 Java:'class Solution{public boolean hasCycle(ListNode head){Set<ListNode>s=new HashSet<>();while(head!=null){if(!s.add(head))return true;head=head.next;}return false;}}'},
 'lowest-common-ancestor-of-a-binary-tree':{
 JavaScript:'var lowestCommonAncestor=function(root,p,q){if(!root||root===p||root===q)return root;const a=lowestCommonAncestor(root.left,p,q),b=lowestCommonAncestor(root.right,p,q);return a&&b?root:a||b;};',
 Python:'class Solution:\n    def lowestCommonAncestor(self,root,p,q):\n        if not root or root is p or root is q: return root\n        a=self.lowestCommonAncestor(root.left,p,q);b=self.lowestCommonAncestor(root.right,p,q)\n        return root if a and b else a or b',
 'C++':'class Solution{public:TreeNode* lowestCommonAncestor(TreeNode* root,TreeNode* p,TreeNode* q){if(!root||root==p||root==q)return root;auto a=lowestCommonAncestor(root->left,p,q),b=lowestCommonAncestor(root->right,p,q);return a&&b?root:a?a:b;}};',
 Java:'class Solution{public TreeNode lowestCommonAncestor(TreeNode root,TreeNode p,TreeNode q){if(root==null||root==p||root==q)return root;TreeNode a=lowestCommonAncestor(root.left,p,q),b=lowestCommonAncestor(root.right,p,q);return a!=null&&b!=null?root:a!=null?a:b;}}'},
 'reverse-linked-list':{
 JavaScript:'var reverseList=function(head){let prev=null;while(head){let n=head.next;head.next=prev;prev=head;head=n;}return prev;};',
 Python:'class Solution:\n    def reverseList(self,head):\n        prev=None\n        while head:\n            nxt=head.next; head.next=prev; prev=head; head=nxt\n        return prev',
 'C++':'class Solution{public:ListNode* reverseList(ListNode* head){ListNode* prev=nullptr;while(head){auto n=head->next;head->next=prev;prev=head;head=n;}return prev;}};',
 Java:'class Solution{public ListNode reverseList(ListNode head){ListNode prev=null;while(head!=null){ListNode n=head.next;head.next=prev;prev=head;head=n;}return prev;}}'},
 'invert-binary-tree':{
 JavaScript:'var invertTree=function(root){if(root){[root.left,root.right]=[invertTree(root.right),invertTree(root.left)];}return root;};',
 Python:'class Solution:\n    def invertTree(self,root):\n        if root: root.left,root.right=self.invertTree(root.right),self.invertTree(root.left)\n        return root',
 'C++':'class Solution{public:TreeNode* invertTree(TreeNode* root){if(root){auto left=invertTree(root->left);root->left=invertTree(root->right);root->right=left;}return root;}};',
 Java:'class Solution{public TreeNode invertTree(TreeNode root){if(root!=null){TreeNode l=invertTree(root.left);root.left=invertTree(root.right);root.right=l;}return root;}}'},
 'move-zeroes':{
 JavaScript:'var moveZeroes=function(nums){let k=0;for(const n of nums)if(n)nums[k++]=n;while(k<nums.length)nums[k++]=0;};',
 Python:'class Solution:\n    def moveZeroes(self,nums):\n        a=[x for x in nums if x]; nums[:]=a+[0]*(len(nums)-len(a))',
 'C++':'class Solution{public:void moveZeroes(vector<int>& nums){int k=0;for(int n:nums)if(n)nums[k++]=n;while(k<nums.size())nums[k++]=0;}};',
 Java:'class Solution{public void moveZeroes(int[] nums){int k=0;for(int n:nums)if(n!=0)nums[k++]=n;while(k<nums.length)nums[k++]=0;}}'},
 'remove-duplicates-from-sorted-array':{
 JavaScript:'var removeDuplicates=function(nums){let k=0;for(const n of nums)if(!k||nums[k-1]!==n)nums[k++]=n;return k;};',
 Python:'class Solution:\n    def removeDuplicates(self,nums):\n        a=sorted(set(nums)); nums[:len(a)]=a; return len(a)',
 'C++':'class Solution{public:int removeDuplicates(vector<int>& nums){int k=0;for(int n:nums)if(!k||nums[k-1]!=n)nums[k++]=n;return k;}};',
 Java:'class Solution{public int removeDuplicates(int[] nums){int k=0;for(int n:nums)if(k==0||nums[k-1]!=n)nums[k++]=n;return k;}}'},
 'min-stack':{
 JavaScript:'class MinStack{constructor(){this.a=[];}push(v){this.a.push(v);}pop(){this.a.pop();}top(){return this.a.at(-1);}getMin(){return Math.min(...this.a);}}',
 Python:'class MinStack:\n    def __init__(self): self.a=[]\n    def push(self,v): self.a.append(v)\n    def pop(self): self.a.pop()\n    def top(self): return self.a[-1]\n    def getMin(self): return min(self.a)',
 'C++':'class MinStack{vector<int>a;public:MinStack(){}void push(int v){a.push_back(v);}void pop(){a.pop_back();}int top(){return a.back();}int getMin(){return *min_element(a.begin(),a.end());}};',
 Java:'class MinStack{java.util.ArrayList<Integer>a=new java.util.ArrayList<>();public void push(int v){a.add(v);}public void pop(){a.remove(a.size()-1);}public int top(){return a.get(a.size()-1);}public int getMin(){return java.util.Collections.min(a);}}'}
};
for(const [id,programs] of Object.entries(solutions))test(`${id}: source-style adapter passes published cases in four languages`,async()=>{
 const suite=getSuite(catalog.find(p=>p.id===id));
 assert.ok(suite.contract.leetcode); assert.equal(suite.contract.mode,'function');
 for(const [language,code]of Object.entries(programs)){
  const result=await execute(code,language,suite);
  assert.equal(result.allPassed,true,`${language}: ${result.executionError || JSON.stringify(result.results.filter(r=>!r.passed))}`);
 }
});
