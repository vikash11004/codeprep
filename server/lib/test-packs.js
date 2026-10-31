import { formatInput, parseArgs, parseValue, parameterNames, typeOf, mergeTypes } from './input.js';
import { catalog } from './problems.js';

function rng(seed = 0xC0DE) { return (min, max) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return min + Math.floor(seed / 4294967296 * (max - min + 1)); }; }
const sorted = a => [...a].sort((a, b) => a - b);
const sum = a => a.reduce((s, n) => s + n, 0);
const array = (r, min = -100, max = 100, size = r(1, 80)) => Array.from({ length: size }, () => r(min, max));
const word = (r, size = r(1, 80)) => Array.from({ length: size }, () => 'abcdefgh'[r(0, 7)]).join('');
const packs = new Map();
function pack(id, params, returns, oracle, generate, edges = [], compare = 'exact') {
  packs.set(id, { id, params: params.split(',').map(p => { const [name, type] = p.split(':'); return { name, type }; }), returns, oracle, generate, edges, compare });
}
pack('two-sum', 'nums:int[],target:int', 'int[]', (a, t) => { for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] + a[j] === t) return [i, j]; }, r => {
  const n = r(2, 100), a = array(r, 100, 10000, n); a[0] = r(-10000, -1); a[n - 1] = r(-10000, -1); return [a, a[0] + a[n - 1]];
}, [[[3, 3], 6], [[0, 4, 3, 0], 0], [[-3, 4, 3, 90], 0], [[1000000000, -1000000000], 0]], 'two-sum');
pack('contains-duplicate', 'nums:int[]', 'bool', a => new Set(a).size !== a.length, r => [array(r)], [[[1]], [[1, 1]], [[-1, 0, 1]]]);
pack('valid-anagram', 's:string,t:string', 'bool', (s, t) => [...s].sort().join('') === [...t].sort().join(''), r => { const s = word(r); return [s, r(0, 1) ? [...s].reverse().join('') : word(r)]; }, [['a', 'a'], ['ab', 'a'], ['rat', 'car']]);
pack('group-anagrams', 'strs:string[]', 'string[][]', words => { const groups = new Map(); for (const s of words) { const k = [...s].sort().join(''); groups.set(k, [...(groups.get(k) || []), s]); } return [...groups.values()]; }, r => { const words = Array.from({ length: r(1, 30) }, () => word(r, r(0, 10))); return [[...words, ...words.slice(0, 4).map(s => [...s].reverse().join(''))]]; }, [[['']], [['a']]], 'groups');
pack('product-of-array-except-self', 'nums:int[]', 'int[]', a => a.map((_, i) => a.reduce((p, n, j) => j === i ? p : p * n, 1)), r => [array(r, -2, 2, r(2, 15))], [[[0, 0]], [[0, 1]], [[-1, 1, 0, -3, 3]]]);
pack('longest-consecutive-sequence', 'nums:int[]', 'int', a => { const s = new Set(a); let best = 0; for (const n of s) if (!s.has(n - 1)) { let k = n; while (s.has(k)) k++; best = Math.max(best, k - n); } return best; }, r => [array(r, -40, 40)], [[[]], [[1, 1, 1]], [[100, 4, 200, 1, 3, 2]]]);
pack('valid-palindrome', 's:string', 'bool', s => { const a = s.toLowerCase().replace(/[^a-z0-9]/g, ''); return a === [...a].reverse().join(''); }, r => { const s = word(r); return [r(0, 1) ? `${s} ,${[...s].reverse().join('')}` : s]; }, [[' '], ['0P'], ['A man, a plan, a canal: Panama']]);
pack('best-time-to-buy-and-sell-stock', 'prices:int[]', 'int', a => { let best = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) best = Math.max(best, a[j] - a[i]); return best; }, r => [array(r, 0, 10000)], [[[7]], [[7, 6, 4, 3, 1]], [[0, 0]]]);
pack('best-time-to-buy-and-sell-stock-ii', 'prices:int[]', 'int', a => a.reduce((s, n, i) => s + (i ? Math.max(0, n - a[i - 1]) : 0), 0), r => [array(r, 0, 10000)]);
pack('maximum-subarray', 'nums:int[]', 'int', a => { let best = -Infinity; for (let i = 0; i < a.length; i++) { let s = 0; for (let j = i; j < a.length; j++) { s += a[j]; best = Math.max(best, s); } } return best; }, r => [array(r)], [[[-1]], [[-3, -2, -7]], [[0]]]);
pack('container-with-most-water', 'height:int[]', 'int', a => { let best = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) best = Math.max(best, Math.min(a[i], a[j]) * (j - i)); return best; }, r => [array(r, 0, 1000, r(2, 80))], [[[0, 0]], [[1, 1]]]);
pack('trapping-rain-water', 'height:int[]', 'int', a => sum(a.map((n, i) => Math.max(0, Math.min(Math.max(...a.slice(0, i + 1)), Math.max(...a.slice(i))) - n))), r => [array(r, 0, 100)], [[[0]], [[3, 0, 3]], [[4, 2, 0, 3, 2, 5]]]);
pack('binary-search', 'nums:int[],target:int', 'int', (a, t) => a.indexOf(t), r => { const a = sorted(new Set(array(r, -1000, 1000))); return [a, r(0, 1) ? a[r(0, a.length - 1)] : r(-1100, 1100)]; }, [[[1], 1], [[1], 2]]);
pack('search-insert-position', 'nums:int[],target:int', 'int', (a, t) => { const i = a.findIndex(n => n >= t); return i < 0 ? a.length : i; }, r => [sorted(new Set(array(r))), r(-120, 120)]);
pack('search-in-rotated-sorted-array', 'nums:int[],target:int', 'int', (a, t) => a.indexOf(t), r => { const a = sorted(new Set(array(r))), k = r(0, a.length - 1); return [[...a.slice(k), ...a.slice(0, k)], r(-100, 100)]; });
pack('find-minimum-in-rotated-sorted-array', 'nums:int[]', 'int', a => Math.min(...a), r => { const a = sorted(new Set(array(r))), k = r(0, a.length - 1); return [[...a.slice(k), ...a.slice(0, k)]]; });
pack('search-a-2d-matrix', 'matrix:int[][],target:int', 'bool', (a, t) => a.flat().includes(t), r => { const rows = r(1, 10), cols = r(1, 10), start = r(-100, 0); return [Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => start + 2 * (i * cols + j))), r(-100, 100)]; });
pack('missing-number', 'nums:int[]', 'int', a => a.length * (a.length + 1) / 2 - sum(a), r => { const n = r(1, 200), missing = r(0, n); return [Array.from({ length: n + 1 }, (_, i) => i).filter(n => n !== missing).reverse()]; }, [[[0]], [[1]]]);
pack('single-number', 'nums:int[]', 'int', a => a.reduce((x, n) => x ^ n, 0), r => { const unique = r(-100, -1), a = [...new Set(array(r, 0, 100))]; return [[...a, unique, ...a.reverse()]]; });
pack('squares-of-a-sorted-array', 'nums:int[]', 'int[]', a => sorted(a.map(n => n * n)), r => [sorted(array(r))]);
pack('intersection-of-two-arrays', 'nums1:int[],nums2:int[]', 'int[]', (a, b) => [...new Set(a.filter(n => b.includes(n)))], r => [array(r, 0, 30), array(r, 0, 30)], [], 'unordered');
pack('intersection-of-two-arrays-ii', 'nums1:int[],nums2:int[]', 'int[]', (a, b) => { const copy = [...b]; return a.filter(n => { const i = copy.indexOf(n); if (i < 0) return false; copy.splice(i, 1); return true; }); }, r => [array(r, 0, 30), array(r, 0, 30)], [], 'unordered');
pack('find-pivot-index', 'nums:int[]', 'int', a => a.findIndex((_, i) => sum(a.slice(0, i)) === sum(a.slice(i + 1))), r => [array(r, -10, 10)], [[[1]], [[0, 0, 0]]]);
pack('subarray-sum-equals-k', 'nums:int[],k:int', 'int', (a, k) => { let count = 0; for (let i = 0; i < a.length; i++) { let s = 0; for (let j = i; j < a.length; j++) { s += a[j]; if (s === k) count++; } } return count; }, r => [array(r, -5, 5), r(-15, 15)], [[[0, 0, 0], 0]]);
pack('max-consecutive-ones', 'nums:int[]', 'int', a => { let n = 0, best = 0; for (const x of a) { n = x ? n + 1 : 0; best = Math.max(best, n); } return best; }, r => [array(r, 0, 1)]);
pack('find-the-highest-altitude', 'gain:int[]', 'int', a => { let n = 0, best = 0; for (const x of a) { n += x; best = Math.max(best, n); } return best; }, r => [array(r)]);
pack('longest-substring-without-repeating-characters', 's:string', 'int', s => { let best = 0; for (let i = 0; i < s.length; i++) { const seen = new Set(); for (let j = i; j < s.length && !seen.has(s[j]); j++) { seen.add(s[j]); best = Math.max(best, seen.size); } } return best; }, r => [word(r)], [[''], [' '], ['abba'], ['abcabcbb']]);
pack('is-subsequence', 's:string,t:string', 'bool', (s, t) => { let i = 0; for (const c of t) if (c === s[i]) i++; return i === s.length; }, r => { const t = word(r); return [r(0, 1) ? [...t].filter((_, i) => i % 2).join('') : word(r), t]; }, [['', ''], ['', 'abc']]);
pack('merge-strings-alternately', 'word1:string,word2:string', 'string', (a, b) => Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] || '') + (b[i] || '')).join(''), r => [word(r), word(r)]);
pack('find-the-index-of-the-first-occurrence-in-a-string', 'haystack:string,needle:string', 'int', (s, t) => s.indexOf(t), r => { const s = word(r); return [s, r(0, 1) ? s.slice(r(0, s.length - 1)) : word(r)]; });
pack('daily-temperatures', 'temperatures:int[]', 'int[]', a => a.map((n, i) => { const k = a.slice(i + 1).findIndex(t => t > n); return k < 0 ? 0 : k + 1; }), r => [array(r, 30, 100)]);
pack('valid-parentheses', 's:string', 'bool', s => { const st = []; for (const c of s) { if ('([{'.includes(c)) st.push(c); else if (st.pop() !== { ')': '(', ']': '[', '}': '{' }[c]) return false; } return !st.length; }, r => [r(0, 1) ? '('.repeat(r(1, 30)) + ')'.repeat(r(1, 30)) : Array.from({ length: r(1, 60) }, () => '()[]{}'[r(0, 5)]).join('')], [['()[]{}'], ['([)]'], ['('], ['((()))']]);
pack('climbing-stairs', 'n:int', 'int', n => { let a = 1, b = 1; for (let i = 1; i <= n; i++) [a, b] = [b, a + b]; return a; }, r => [r(1, 45)], Array.from({ length: 45 }, (_, i) => [i + 1]));
pack('house-robber', 'nums:int[]', 'int', a => { let skip = 0, take = 0; for (const n of a) [skip, take] = [Math.max(skip, take), skip + n]; return Math.max(skip, take); }, r => [array(r, 0, 400)], [[[0]], [[2, 7, 9, 3, 1]]]);
pack('min-cost-climbing-stairs', 'cost:int[]', 'int', a => { const dp = [0, 0]; for (let i = 2; i <= a.length; i++) dp[i] = Math.min(dp[i - 1] + a[i - 1], dp[i - 2] + a[i - 2]); return dp[a.length]; }, r => [array(r, 0, 999, r(2, 80))]);
pack('coin-change', 'coins:int[],amount:int', 'int', (coins, amount) => { const dp = Array(amount + 1).fill(Infinity); dp[0] = 0; for (let i = 1; i <= amount; i++) for (const c of coins) if (c <= i) dp[i] = Math.min(dp[i], dp[i - c] + 1); return Number.isFinite(dp[amount]) ? dp[amount] : -1; }, r => [[...new Set(array(r, 1, 30, r(1, 10)))], r(0, 400)], [[[2], 3], [[1], 0]]);
pack('jump-game', 'nums:int[]', 'bool', a => { const reachable = new Set([0]); for (let i = 0; i < a.length; i++) if (reachable.has(i)) for (let j = 1; j <= a[i] && i + j < a.length; j++) reachable.add(i + j); return reachable.has(a.length - 1); }, r => [array(r, 0, 5)], [[[0]], [[3, 2, 1, 0, 4]]]);
pack('merge-intervals', 'intervals:int[][]', 'int[][]', a => { const out = []; for (const p of [...a].sort((x, y) => x[0] - y[0])) { if (out.length && out.at(-1)[1] >= p[0]) out.at(-1)[1] = Math.max(out.at(-1)[1], p[1]); else out.push([...p]); } return out; }, r => [Array.from({ length: r(1, 40) }, () => sorted([r(0, 100), r(0, 100)]))], [[[[1, 4], [4, 5]]]], 'unordered');
pack('plus-one', 'digits:int[]', 'int[]', a => [...(BigInt(a.join('')) + 1n).toString()].map(Number), r => [[r(1, 9), ...array(r, 0, 9, r(0, 80))]], [[[0]], [[9, 9, 9]]]);
pack('palindrome-number', 'x:int', 'bool', n => String(n) === [...String(n)].reverse().join(''), r => [r(-100000, 100000)], [[0], [121], [-121], [10], [2147447412]]);
pack('power-of-two', 'n:int', 'bool', n => n > 0 && Number.isInteger(Math.log2(n)), r => [r(-1000000, 1000000)], Array.from({ length: 31 }, (_, i) => [2 ** i]));
pack('number-of-1-bits', 'n:int', 'int', n => [...n.toString(2)].filter(n => n === '1').length, r => [r(0, 2147483647)], [[0], [1], [2147483647]]);
pack('counting-bits', 'n:int', 'int[]', n => Array.from({ length: n + 1 }, (_, i) => [...i.toString(2)].filter(c => c === '1').length), r => [r(0, 1000)], [[0], [1]]);
pack('hamming-distance', 'x:int,y:int', 'int', (a, b) => [...(a ^ b).toString(2)].filter(c => c === '1').length, r => [r(0, 2147483647), r(0, 2147483647)]);
pack('sqrt-x', 'x:int', 'int', n => Math.floor(Math.sqrt(n)), r => [r(0, 2147483647)], [[0], [1], [4], [2147483647]]);
pack('valid-perfect-square', 'num:int', 'bool', n => Number.isInteger(Math.sqrt(n)), r => { const n = r(1, 46340); return [r(0, 1) ? n * n : r(1, 2147483647)]; });

pack('top-k-frequent-elements', 'nums:int[],k:int', 'int[]', (a, k) => { const counts = new Map(); for (const n of a) counts.set(n, (counts.get(n) || 0) + 1); return [...counts].sort((a, b) => b[1] - a[1]).slice(0, k).map(x => x[0]); }, r => { const values = [...new Set(array(r, -100, 100, r(1, 20)))]; return [values.flatMap((v, i) => Array(i + 1).fill(v)), r(1, values.length)]; }, [[[1], 1]], 'unordered');
pack('3sum', 'nums:int[]', 'int[][]', a => { const out = new Map(); for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) for (let k = j + 1; k < a.length; k++) if (a[i] + a[j] + a[k] === 0) { const t = sorted([a[i], a[j], a[k]]); out.set(JSON.stringify(t), t); } return [...out.values()]; }, r => [array(r, -12, 12, r(3, 24))], [[[0, 0, 0]], [[-1, 0, 1, 2, -1, -4]]], 'groups');
pack('longest-repeating-character-replacement', 's:string,k:int', 'int', (s, k) => { let best = 0; for (let i = 0; i < s.length; i++) { const counts = {}; let max = 0; for (let j = i; j < s.length; j++) { counts[s[j]] = (counts[s[j]] || 0) + 1; max = Math.max(max, counts[s[j]]); if (j - i + 1 - max <= k) best = Math.max(best, j - i + 1); } } return best; }, r => { const s = word(r).toUpperCase(); return [s, r(0, s.length)]; });
pack('permutation-in-string', 's1:string,s2:string', 'bool', (a, b) => { const target = [...a].sort().join(''); for (let i = 0; i + a.length <= b.length; i++) if ([...b.slice(i, i + a.length)].sort().join('') === target) return true; return false; }, r => { const a = word(r, r(1, 10)); return [a, r(0, 1) ? word(r) + [...a].reverse().join('') : word(r)]; });
pack('find-all-anagrams-in-a-string', 's:string,p:string', 'int[]', (s, p) => { const out = [], key = [...p].sort().join(''); for (let i = 0; i + p.length <= s.length; i++) if ([...s.slice(i, i + p.length)].sort().join('') === key) out.push(i); return out; }, r => { const s = word(r); return [s, r(0, 1) ? s.slice(0, r(1, s.length)) : word(r, r(1, 10))]; });
pack('sliding-window-maximum', 'nums:int[],k:int', 'int[]', (a, k) => a.slice(k - 1).map((_, i) => Math.max(...a.slice(i, i + k))), r => { const a = array(r); return [a, r(1, a.length)]; }, [[[1], 1], [[1, 3, -1, -3, 5, 3, 6, 7], 3]]);
pack('maximum-average-subarray-i', 'nums:int[],k:int', 'double', (a, k) => Math.max(...a.slice(k - 1).map((_, i) => sum(a.slice(i, i + k)) / k)), r => { const a = array(r); return [a, r(1, a.length)]; });
pack('max-consecutive-ones-iii', 'nums:int[],k:int', 'int', (a, k) => { let best = 0; for (let i = 0; i < a.length; i++) { let zero = 0; for (let j = i; j < a.length; j++) { if (!a[j]) zero++; if (zero <= k) best = Math.max(best, j - i + 1); } } return best; }, r => { const a = array(r, 0, 1); return [a, r(0, a.length)]; });
pack('largest-rectangle-in-histogram', 'heights:int[]', 'int', a => { let best = 0; for (let i = 0; i < a.length; i++) { let height = Infinity; for (let j = i; j < a.length; j++) { height = Math.min(height, a[j]); best = Math.max(best, height * (j - i + 1)); } } return best; }, r => [array(r, 0, 100)], [[[2, 1, 5, 6, 2, 3]], [[0]]]);
pack('last-stone-weight', 'stones:int[]', 'int', stones => { const a = [...stones]; while (a.length > 1) { a.sort((a, b) => a - b); const x = a.pop(), y = a.pop(); if (x !== y) a.push(x - y); } return a[0] || 0; }, r => [array(r, 1, 1000, r(1, 30))]);
pack('kth-largest-element-in-an-array', 'nums:int[],k:int', 'int', (a, k) => sorted(a)[a.length - k], r => { const a = array(r); return [a, r(1, a.length)]; });
pack('k-closest-points-to-origin', 'points:int[][],k:int', 'int[][]', (a, k) => [...a].sort((x, y) => x[0] ** 2 + x[1] ** 2 - y[0] ** 2 - y[1] ** 2).slice(0, k), r => { const n = r(1, 40), y = r(-100, 100); return [Array.from({ length: n }, (_, i) => [(i + 1) * (r(0, 1) ? 1 : -1), y]).reverse(), r(1, n)]; }, [], 'unordered');
pack('subsets', 'nums:int[]', 'int[][]', a => { let out = [[]]; for (const n of a) out = [...out, ...out.map(s => [...s, n])]; return out; }, r => [[...new Set(array(r, -10, 10, r(1, 8)))]], [[[0]], [[1, 2, 3]]], 'groups');
function permutations(a) { if (!a.length) return [[]]; return a.flatMap((n, i) => permutations(a.filter((_, j) => j !== i)).map(p => [n, ...p])); }
pack('permutations', 'nums:int[]', 'int[][]', permutations, r => [[...new Set(array(r, -10, 10, r(1, 5)))]], [[[1]], [[1, 2, 3]]], 'unordered');
pack('combination-sum', 'candidates:int[],target:int', 'int[][]', (a, target) => { const out = []; function dfs(i, remain, path) { if (!remain) { out.push([...path]); return; } if (i === a.length || remain < 0) return; dfs(i + 1, remain, path); dfs(i, remain - a[i], [...path, a[i]]); } dfs(0, target, []); return out; }, r => [[...new Set(array(r, 2, 12, r(1, 6)))], r(1, 25)], [[[2, 3, 6, 7], 7]], 'groups');
pack('longest-increasing-subsequence', 'nums:int[]', 'int', a => { const dp = a.map(() => 1); for (let i = 0; i < a.length; i++) for (let j = 0; j < i; j++) if (a[j] < a[i]) dp[i] = Math.max(dp[i], dp[j] + 1); return Math.max(...dp); }, r => [array(r)], [[[7, 7, 7]], [[10, 9, 2, 5, 3, 7, 101, 18]]]);
pack('coin-change-ii', 'amount:int,coins:int[]', 'int', (amount, coins) => { const dp = Array(amount + 1).fill(0); dp[0] = 1; for (const coin of coins) for (let i = coin; i <= amount; i++) dp[i] += dp[i - coin]; return dp[amount]; }, r => [r(0, 100), [...new Set(array(r, 1, 20, r(1, 6)))]], [[0, [1]], [5, [1, 2, 5]]]);
pack('word-break', 's:string,wordDict:string[]', 'bool', (s, words) => { const dp = Array(s.length + 1).fill(false); dp[0] = true; for (let i = 1; i <= s.length; i++) for (const w of words) if (i >= w.length && dp[i - w.length] && s.slice(i - w.length, i) === w) dp[i] = true; return dp[s.length]; }, r => { const words = [...new Set(Array.from({ length: r(1, 10) }, () => word(r, r(1, 4))))]; return [r(0, 1) ? Array.from({ length: r(1, 10) }, () => words[r(0, words.length - 1)]).join('') : word(r), words]; });
pack('longest-common-subsequence', 'text1:string,text2:string', 'int', (a, b) => { const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0)); for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]); return dp[a.length][b.length]; }, r => [word(r), word(r)]);
pack('edit-distance', 'word1:string,word2:string', 'int', (a, b) => { const dp = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => i ? (j ? 0 : i) : j)); for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]); return dp[a.length][b.length]; }, r => [word(r, r(0, 30)), word(r, r(0, 30))], [['', ''], ['horse', 'ros']]);
pack('number-of-islands', 'grid:string[][]', 'int', grid => { let count = 0; function flood(i, j) { if (grid[i]?.[j] !== '1') return; grid[i][j] = '0'; for (const [di, dj] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) flood(i + di, j + dj); } for (let i = 0; i < grid.length; i++) for (let j = 0; j < grid[0].length; j++) if (grid[i][j] === '1') { count++; flood(i, j); } return count; }, r => { const rows = r(1, 15), cols = r(1, 15); return [Array.from({ length: rows }, () => array(r, 0, 1, cols).map(String))]; }, [[[['0']]], [[['1']]]]);
pack('max-area-of-island', 'grid:int[][]', 'int', grid => { let best = 0; function flood(i, j) { if (grid[i]?.[j] !== 1) return 0; grid[i][j] = 0; return 1 + flood(i + 1, j) + flood(i - 1, j) + flood(i, j + 1) + flood(i, j - 1); } for (let i = 0; i < grid.length; i++) for (let j = 0; j < grid[0].length; j++) best = Math.max(best, flood(i, j)); return best; }, r => { const rows = r(1, 15), cols = r(1, 15); return [Array.from({ length: rows }, () => array(r, 0, 1, cols))]; });
pack('course-schedule', 'numCourses:int,prerequisites:int[][]', 'bool', (n, edges) => { const adj = Array.from({ length: n }, () => []), state = Array(n).fill(0); for (const [a, b] of edges) adj[b].push(a); function visit(i) { if (state[i] === 1) return false; if (state[i] === 2) return true; state[i] = 1; for (const j of adj[i]) if (!visit(j)) return false; state[i] = 2; return true; } return adj.every((_, i) => visit(i)); }, r => { const n = r(2, 25), edges = new Map(); for (let i = 0; i < r(0, n * 2); i++) { const a = r(0, n - 1), b = r(0, n - 1); if (a !== b) edges.set(`${a},${b}`, [a, b]); } return [n, [...edges.values()]]; }, [[1, []], [2, [[1, 0], [0, 1]]]]);
pack('non-overlapping-intervals', 'intervals:int[][]', 'int', a => { let count = 0, end = -Infinity; for (const [start, finish] of [...a].sort((a, b) => a[1] - b[1])) if (start >= end) { count++; end = finish; } return a.length - count; }, r => [Array.from({ length: r(1, 60) }, () => { const start = r(-100, 100); return [start, start + r(1, 20)]; })]);
pack('happy-number', 'n:int', 'bool', n => { const seen = new Set(); while (n !== 1 && !seen.has(n)) { seen.add(n); n = sum([...String(n)].map(c => Number(c) ** 2)); } return n === 1; }, r => [r(1, 2147483647)], [[1], [19], [2]]);
pack('find-all-numbers-disappeared-in-an-array', 'nums:int[]', 'int[]', a => Array.from({ length: a.length }, (_, i) => i + 1).filter(n => !a.includes(n)), r => { const n = r(1, 100); return [array(r, 1, n, n)]; }, [], 'unordered');
pack('remove-all-adjacent-duplicates-in-string', 's:string', 'string', s => { let next = s.replace(/(.)\1/g, ''); while (next !== s) { s = next; next = s.replace(/(.)\1/g, ''); } return s; }, r => [word(r)], [['abbaca'], ['a']]);
pack('backspace-string-compare', 's:string,t:string', 'bool', (s, t) => { function reduced(s) { const a = []; for (const c of s) c === '#' ? a.pop() : a.push(c); return a.join(''); } return reduced(s) === reduced(t); }, r => { const s = word(r); return [s + '#'.repeat(r(0, s.length)), r(0, 1) ? s : word(r)]; }, [['ab#c', 'ad#c'], ['a##c', '#a#c']]);

export function getPack(problem) { return packs.get(problem.judgeId || problem.id); }
export const packIds = [...packs.keys()];
const cache = new Map();
export function getSuite(problem) {
  const p = getPack(problem);
  if (p) {
    if (cache.has(p.id)) return cache.get(p.id);
    const r = rng(); const values = new Map();
    const add = args => values.set(JSON.stringify(args), args);
    p.edges.forEach(add);
    for (const ex of catalog.find(problem => problem.id === p.id)?.examples || []) {
      try {
        const args = parseArgs(ex.input);
        if (compareOutput(p.oracle(...structuredClone(args)), parseValue(ex.output), p.compare, args)) add(args);
      } catch { /* Legacy placeholder examples are not judge data. */ }
    }
    for (let i = 0; values.size < 256 && i < 2500; i++) add(p.generate(r));
    const testCases = [...values.values()].map((args, i) => ({ args, expected: p.oracle(structuredClone(args[0]), ...structuredClone(args.slice(1))), input: formatInput(p.params.map(x => x.name), args), description: i < p.edges.length ? 'Boundary / regression' : 'Deterministic generated case', isEdgeCase: i < p.edges.length }));
    for (const t of testCases) t.expectedOutput = JSON.stringify(t.expected);
    const suite = { testCases, coverage: 'verified', judgeId: p.id, compare: p.compare, contract: { mode: 'function', params: p.params, returns: p.returns }, note: `${testCases.length} distinct cases with reference-code answers. Includes regression cases and seeded inputs; not the source site's private judge.` };
    cache.set(p.id, suite); return suite;
  }
  const examples = (problem.examples || []).filter(ex => !/^Example (?:Input|Output)$/i.test(ex.input?.trim()) && !/^Example (?:Input|Output)$/i.test(ex.output?.trim()));
  let typed = true;
  const testCases = examples.map(ex => {
    try { return { args: parseArgs(ex.input), expected: parseValue(ex.output), input: ex.input, expectedOutput: ex.output, description: 'Published example' }; }
    catch { typed = false; return { input: ex.input, expectedOutput: ex.output, description: 'Published example' }; }
  });
  if (typed && testCases.some(t => t.args.length !== testCases[0].args.length)) typed = false;
  const params = typed && testCases.length ? parameterNames(testCases[0].input).map((name, i) => ({ name, type: testCases.map(t => typeOf(t.args[i])).reduce(mergeTypes) })) : [];
  return { testCases, coverage: 'samples', compare: 'exact', contract: { mode: typed && testCases.length ? 'function' : 'stdin', params, returns: typed && testCases.length ? testCases.map(t => typeOf(t.expected)).reduce(mergeTypes) : 'string' }, note: 'Published examples only. Passing samples is not full acceptance. Add trusted input/output cases or verify with the source judge.' };
}

function canonical(v) { if (Array.isArray(v)) return v.map(canonical); if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])); return v; }
export function compareOutput(actual, expected, mode = 'exact', args = []) {
  if (mode === 'two-sum') return Array.isArray(actual) && actual.length === 2 && actual.every(i => Number.isInteger(i) && i >= 0 && i < args[0].length) && actual[0] !== actual[1] && args[0][actual[0]] + args[0][actual[1]] === args[1];
  const unordered = a => a.map(x => JSON.stringify(canonical(x))).sort();
  if (mode === 'unordered') return Array.isArray(actual) && JSON.stringify(unordered(actual)) === JSON.stringify(unordered(expected));
  if (mode === 'groups') return Array.isArray(actual) && actual.every(Array.isArray) && JSON.stringify(unordered(actual.map(unordered))) === JSON.stringify(unordered(expected.map(unordered)));
  if (typeof actual === 'number' && typeof expected === 'number') return Number.isFinite(actual) && Math.abs(actual - expected) <= 1e-7 * Math.max(1, Math.abs(expected));
  return JSON.stringify(canonical(actual)) === JSON.stringify(canonical(expected));
}
