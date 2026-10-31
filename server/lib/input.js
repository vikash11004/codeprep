import JSON5 from 'json5';

// Parse data, never JavaScript. Commas/newlines inside strings and arrays are preserved.
export function splitArguments(input) {
  const parts = []; let start = 0; let depth = 0; let quote = ''; let escaped = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quote) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === quote) quote = ''; continue; }
    if (c === '"' || c === "'") quote = c;
    else if ('[{('.includes(c)) depth++;
    else if (']})'.includes(c)) depth--;
    else if ((c === ',' || c === '\n') && depth === 0) { parts.push(input.slice(start, i).trim()); start = i + 1; }
  }
  parts.push(input.slice(start).trim());
  return parts.filter(Boolean);
}
export function parseValue(value) {
  if (typeof value !== 'string') return value;
  return JSON5.parse(value.trim());
}
export function parseArgs(input) {
  if (Array.isArray(input)) return input;
  return splitArguments(String(input)).map(part => parseValue(part.replace(/^[A-Za-z_]\w*(?:\[\])*\s*=\s*/, '')));
}
export function parameterNames(input) {
  const reserved = new Set('class return function import export new default var let const delete in instanceof this super def pass for while if else try catch public private protected static int double bool float char String void package throws throw switch case null true false from lambda global nonlocal None True False is and or not yield await async'.split(' '));
  return splitArguments(String(input)).map((part, i) => { const name = part.match(/^([A-Za-z_]\w*)(?:\[\])*\s*=/)?.[1]; return name && !reserved.has(name) ? name : `arg${i + 1}`; });
}
export function mergeTypes(a, b) {
  if (a === b) return a;
  if (a.endsWith('[]') && b.endsWith('[]')) return `${mergeTypes(a.slice(0, -2), b.slice(0, -2))}[]`;
  if (['int', 'double'].includes(a) && ['int', 'double'].includes(b)) return 'double';
  return 'json';
}
export function formatInput(names, args) { return args.map((arg, i) => `${names[i] || `arg${i + 1}`} = ${JSON.stringify(arg)}`).join(', '); }
export function typeOf(value) {
  if (value === null || (typeof value === 'object' && !Array.isArray(value))) return 'json';
  if (Array.isArray(value)) {
    const types = [...new Set(value.map(typeOf))];
    return `${types.length > 1 ? (types.every(t => ['int', 'double'].includes(t)) ? 'double' : 'json') : types[0] || 'json'}[]`;
  }
  if (typeof value === 'string') return 'string';
  if (typeof value === 'boolean') return 'bool';
  return Number.isInteger(value) ? 'int' : 'double';
}
