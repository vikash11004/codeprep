import { readFileSync } from 'node:fs';
const template = name => readFileSync(new URL(`../adapters/${name}`, import.meta.url), 'utf8');
const type = t => {
  if(t.endsWith('[]')) return `vector<${type(t.slice(0,-2))}>`;
  return {integer:'int', boolean:'bool', character:'char', ListNode:'ListNode*', TreeNode:'TreeNode*', long:'long long'}[t] || t;
};
export function usesSourceAdapter(code, language, contract) {
  if (!contract.leetcode || language === 'C') return false;
  // Existing generic drafts and offline reference guides retain their contract.
  if (/\bsolution\s*(?:\(|=)/.test(code) && !contract.leetcode.systemdesign) return false;
  return true;
}
export function sourceHarness(code, language, contract, marker) {
  const m = contract.leetcode;
  if(language === 'JavaScript' || language === 'Python') {
    const config = JSON.stringify({ ...m, marker });
    return template(language === 'Python' ? 'python.py' : 'javascript.cjs')
      .replace('/*CONFIG*/', language === 'Python' ? `json.loads(${JSON.stringify(config)})` : config)
      .replace('/*USER_CODE*/', code)
      .replace('/*CLASS*/', m.systemdesign ? m.classname : 'Solution')
      .replace('/*METHOD*/', m.name || 'solution');
  }
  if(language === 'Java') return template('java.txt').replace('/*USER_CODE*/',code).replace('/*CONFIG*/',JSON.stringify(JSON.stringify({...m,marker}))).replace('/*CLASS*/',m.systemdesign ? m.classname : 'Solution');
  const args = (params, input) => params.map((p,i)=>`${type(p.type)} a${i}=decode<${type(p.type)}>(${input}.at(${i}));`).join('\n');
  const names = params => params.map((_,i)=>`a${i}`).join(',');
  let invoke;
  if(m.systemdesign) {
    invoke = `${args(m.constructor.params,'args.at(1).at(0)')} ${m.classname} instance(${names(m.constructor.params)}); json value=json::array({nullptr});\n`;
    if (!m.constructor.params.length) invoke = `${m.classname} instance; json value=json::array({nullptr});\n`;
    invoke += `if(args.at(0).empty()||args.at(0).size()!=args.at(1).size()||args.at(0).at(0)!=${JSON.stringify(m.classname)})throw runtime_error("Invalid design operation sequence");\n`;
    invoke += 'for(size_t op=1;op<args.at(0).size();++op){string name=args.at(0).at(op);\n';
    m.methods.forEach((method,i)=>{invoke+=`${i?'else ':''}if(name==${JSON.stringify(method.name)}){${args(method.params,'args.at(1).at(op)')} ${method.return.type==='void'?`instance.${method.name}(${names(method.params)});value.push_back(nullptr);`:`value.push_back(encode(instance.${method.name}(${names(method.params)})));`}}\n`;});
    invoke += 'else throw runtime_error("Unknown design operation");}';
  } else {
    invoke = args(m.params,'args') + `\nSolution instance; `;
    invoke += m.return.type==='void' ? `instance.${m.name}(${names(m.params)});json value=encode(a${m.output?.paramindex ?? 0});` : `auto ret=instance.${m.name}(${names(m.params)});json value=encode(ret);`;
    if(m.output && m.return.type!=='void') invoke += `value=encode(a${m.output.paramindex});${m.output.size==='ret'?'if(ret<0||ret>value.size())throw runtime_error("Invalid returned prefix length");value=json(value.begin(),value.begin()+ret);':''}`;
    if(m.adapterStyle==='cycle') invoke=`auto head=decode<ListNode*>(args[0]);vector<ListNode*> nodes;for(auto n=head;n;n=n->next)nodes.push_back(n);int pos=args[1];if(pos>=0){if(pos>=nodes.size())throw runtime_error("Invalid cycle position");nodes.back()->next=nodes[pos];}json value=Solution().${m.name}(head);`;
    if(m.adapterStyle==='ancestor') invoke=`auto root=decode<TreeNode*>(args[0]);auto p=findNode(root,args[1].get<int>());auto q=findNode(root,args[2].get<int>());auto ret=Solution().${m.name}(root,p,q);json value=ret?json(ret->val):json(nullptr);`;
  }
  return template('cpp.txt').replace('/*USER_CODE*/',code).replace('/*INVOKE*/',invoke).replaceAll('/*MARKER*/',JSON.stringify(marker));
}
