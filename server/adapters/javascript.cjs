const __config=/*CONFIG*/;
class ListNode {constructor(val=0,next=null){this.val=val;this.next=next;}}
class TreeNode {constructor(val=0,left=null,right=null){this.val=val;this.left=left;this.right=right;}}
function __decode(value,type){
  if(type.endsWith('[]'))return value.map(v=>__decode(v,type.slice(0,-2)));
  if(type==='ListNode'){let head=null;for(let i=(value||[]).length-1;i>=0;i--)head=new ListNode(value[i],head);return head;}
  if(type==='TreeNode'){if(!value?.length||value[0]===null)return null;const root=new TreeNode(value[0]),q=[root];let i=1;for(let j=0;j<q.length&&i<value.length;j++){for(const key of ['left','right']){if(i<value.length&&value[i]!==null){q[j][key]=new TreeNode(value[i]);q.push(q[j][key]);}i++;}}return root;}
  return value;
}
function __encode(value,type){
  if(type?.endsWith('[]'))return value.map(v=>__encode(v,type.slice(0,-2)));
  if(type==='ListNode'){const out=[],seen=new Set();while(value){if(seen.has(value)||seen.size>100000)throw Error('Cyclic or oversized list output');seen.add(value);out.push(value.val);value=value.next;}return out;}
  if(type==='TreeNode'){const out=[],q=[value],seen=new Set();for(let i=0;i<q.length;i++){const n=q[i];if(!n){out.push(null);continue;}if(seen.has(n)||seen.size>100000)throw Error('Cyclic or oversized tree output');seen.add(n);out.push(n.val);q.push(n.left,n.right);}while(out.at(-1)===null)out.pop();return out;}
  return value===undefined?null:value;
}
/*USER_CODE*/
function __sourceArgs(raw){
 if(__config.adapterStyle==='ancestor'){const root=__decode(raw[0],'TreeNode');const find=(n,v)=>!n||n.val===v?n:find(n.left,v)||find(n.right,v);return [root,find(root,raw[1]),find(root,raw[2])];}
 const args=__config.params.map((p,i)=>__decode(raw[i],p.type));
 if(__config.adapterStyle==='cycle'){const nodes=[];for(let n=args[0];n;n=n.next)nodes.push(n);if(raw[1]>=0){if(!nodes[raw[1]])throw Error('Invalid cycle position');nodes.at(-1).next=nodes[raw[1]];}return [args[0]];}
 return args;
}
(async()=>{for(const raw of JSON.parse(require('fs').readFileSync(0,'utf8'))){try{
  let value;
  if(__config.systemdesign){const ops=raw[0],params=raw[1];if(ops[0]!==__config.classname||ops.length!==params.length)throw Error('Invalid design operation sequence');const instance=new /*CLASS*/(...__config.constructor.params.map((p,i)=>__decode(params[0][i],p.type)));value=[null];for(let i=1;i<ops.length;i++){const method=__config.methods.find(m=>m.name===ops[i]);if(!method)throw Error('Unknown design operation');value.push(__encode(await instance[method.name](...method.params.map((p,j)=>__decode(params[i][j],p.type))),method.return.type));}}
  else{const args=__sourceArgs(raw);const ret=await /*METHOD*/(...args);value=__config.output?__encode(args[__config.output.paramindex],__config.params[__config.output.paramindex].type):__encode(ret,__config.return.type);if(__config.output?.size==='ret'){if(!Number.isInteger(ret)||ret<0||ret>value.length)throw Error("Invalid returned prefix length");value=value.slice(0,ret);}if(__config.adapterStyle==='ancestor')value=ret?.val??null;}
  console.log(__config.marker+JSON.stringify({value}));
}catch(e){console.log(__config.marker+JSON.stringify({error:e.message}));}}})();
