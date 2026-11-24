import { readFileSync } from 'node:fs';
let signatures = {};
try { signatures = JSON.parse(readFileSync(new URL('../data/leetcode-signatures.json', import.meta.url), 'utf8')); } catch {}
const identifier = value => typeof value === 'string' && /^[A-Za-z_][A-Za-z0-9_]*$/.test(value);
export function sourceContract(problem) {
  const source = problem.leetcode || signatures[problem.judgeId || problem.id];
  const m = source?.metadata && structuredClone(source.metadata);
  if (!m || !identifier(m.systemdesign ? m.classname : m.name)) return null;
  if(m.manual && !['numIslands','hasCycle','lowestCommonAncestor'].includes(m.name)) return null;
  if(m.name==='hasCycle') m.adapterStyle='cycle';
  if(m.name==='lowestCommonAncestor') m.adapterStyle='ancestor';
  const methods = m.systemdesign ? [m.constructor, ...m.methods] : [m];
  const normalize = t => t?.startsWith('list<') ? normalize(t.slice(5,-1))+'[]' : t === 'String' ? 'string' : t;
  for(const method of methods){for(const p of method?.params || [])p.type=normalize(p.type);if(method?.return)method.return.type=normalize(method.return.type);}
  const supported = type => /^(integer|int|long|long long|double|float|boolean|bool|character|char|string|ListNode|TreeNode|void)(\[\])*$/.test(type || '');
  if (methods.some(method => !method || (method.name && !identifier(method.name)) || (method.params || []).some(p => !identifier(p.name) || !supported(p.type)) || (method.return && !supported(method.return.type)))) return null;
  if(m.output && (!Number.isInteger(m.output.paramindex) || m.output.paramindex<0 || m.output.paramindex>=m.params.length || (m.output.size && m.output.size!=='ret'))) return null;
  return { mode: 'function', methodName: m.name, params: m.systemdesign ? [{name:'operations',type:'string[]'},{name:'arguments',type:'json[]'}] : m.params || [], returns: m.return?.type || 'void', leetcode: m, snippets: source.snippets || [] };
}
export function sourceStarter(contract, language) {
  const lang = { JavaScript: 'javascript', Python: 'python3', 'C++': 'cpp', Java: 'java', C: 'c' }[language];
  return contract.snippets?.find(s => s.langSlug === lang)?.code;
}
