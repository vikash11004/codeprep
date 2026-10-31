import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm, readFile, access } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, delimiter, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { compareOutput } from './test-packs.js';

const root = fileURLToPath(new URL('../', import.meta.url));
let configured = {};
try { configured = JSON.parse(readFileSync(join(root, '.tools/runtimes.json'), 'utf8')); } catch { /* Use system runtimes. */ }
const binaries = { JavaScript: process.execPath, Python: process.env.CODEPREP_PYTHON_BIN || configured.python || 'python', 'C++': process.env.CODEPREP_CPP_BIN || configured.cpp || 'g++', C: process.env.CODEPREP_C_BIN || configured.c || 'gcc', Java: process.env.CODEPREP_JAVA_BIN || configured.java || 'java' };
const javac = process.env.CODEPREP_JAVAC_BIN || configured.javac || 'javac';
const assets = join(root, 'vendor');
export const languages = Object.keys(binaries);
let active = 0;

function cleanEnvironment() {
  const env = Object.fromEntries(['PATH', 'SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'PATHEXT', 'LD_LIBRARY_PATH'].filter(k => process.env[k]).map(k => [k, process.env[k]]));
  const extra = configured.cpp ? dirname(configured.cpp) : process.env.CODEPREP_CPP_BIN ? dirname(process.env.CODEPREP_CPP_BIN) : '';
  env.PATH = [extra, process.env.PATH || process.env.Path].filter(Boolean).join(delimiter);
  return env;
}
export function processRun(command, args, { cwd, input = '', timeout = 8000, limit = 2_000_000 } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd, env: cleanEnvironment(), windowsHide: true, detached: process.platform !== 'win32', stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', size = 0, failure;
    const stop = message => {
      if (failure) return;
      failure = new Error(message);
      if (process.platform === 'win32') {
        const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
        killer.on('error', () => {});
        // taskkill may be unavailable under a restricted Windows token.
        child.kill('SIGKILL');
      }
      else { try { process.kill(-child.pid, 'SIGKILL'); } catch { child.kill('SIGKILL'); } }
    };
    const timer = setTimeout(() => stop(`Time limit exceeded (${timeout} ms for this suite).`), timeout);
    child.on('error', err => { clearTimeout(timer); reject(err); });
    child.stdout.on('data', data => { size += data.length; if (size > limit) stop('Output limit exceeded. Remove excessive printing.'); else stdout += data; });
    child.stderr.on('data', data => { size += data.length; if (size > limit) stop('Output limit exceeded.'); else stderr += data; });
    child.on('close', code => { clearTimeout(timer); if (failure) reject(failure); else resolvePromise({ stdout, stderr, code }); });
    child.stdin.on('error', () => {}); child.stdin.end(input);
  });
}
let capabilities;
export async function getRuntimes(refresh = false) {
  if (capabilities && !refresh) return capabilities;
  capabilities = await Promise.all(languages.map(async language => {
    try {
      const p = await processRun(binaries[language], [language === 'Java' ? '-version' : '--version'], { timeout: 5000 });
      if (p.code !== 0) throw new Error('Not available');
      if (language === 'Java') { const c = await processRun(javac, ['-version']); if (c.code !== 0) throw new Error('JDK compiler missing'); await access(join(assets, 'gson.jar')); }
      if (language === 'C++') await access(join(assets, 'json.hpp'));
      return { language, available: true, version: (p.stdout || p.stderr).split('\n')[0].trim() };
    } catch { return { language, available: false, reason: `Install ${language === 'Java' ? 'a JDK and Gson' : language === 'C++' ? 'g++ and the JSON header' : binaries[language]} with npm run setup, or configure its binary path.` }; }
  }));
  return capabilities;
}
function nativeType(type, language) {
  if (type.endsWith('[]')) return language === 'Java' ? `${nativeType(type.slice(0, -2), language)}[]` : `std::vector<${nativeType(type.slice(0, -2), language)}>`;
  return { string: language === 'Java' ? 'String' : 'std::string', bool: language === 'Java' ? 'boolean' : 'bool', int: 'int', double: 'double', json: language === 'Java' ? 'com.google.gson.JsonElement' : 'nlohmann::json' }[type] || 'int';
}
export function starterCode(contract, language) {
  const params = contract.params || [];
  if (contract.mode === 'stdin' || language === 'C') {
    const note = 'Read one test from standard input; print only the answer. See the I/O contract for exact input.';
    return { JavaScript: `// ${note}\nconst fs = require('node:fs');\nconst input = fs.readFileSync(0, 'utf8');\n// Write your solution.\n`, Python: `# ${note}\nimport sys\ndata = sys.stdin.read()\n# Write your solution.\n`, 'C++': `// ${note}\n#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    // Read input and print your answer.\n    return 0;\n}\n`, Java: `// ${note}\nimport java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        // Read input and print your answer.\n    }\n}\n`, C: `/* ${note} */\n#include <stdio.h>\n#include <stdlib.h>\nint main(void) {\n    /* Read input and print your answer. */\n    return 0;\n}\n` }[language];
  }
  const names = params.map(p => p.name).join(', ');
  if (language === 'JavaScript') return `// Return the result. The runner calls solution for every test.\nfunction solution(${names}) {\n  // Your approach here\n}\n`;
  if (language === 'Python') return `# Return the result. The runner calls solution for every test.\ndef solution(${names}):\n    # Your approach here\n    pass\n`;
  const typed = params.map(p => `${nativeType(p.type, language)} ${p.name}`).join(', ');
  const ret = nativeType(contract.returns, language);
  if (language === 'Java') return `import java.util.*;\nclass Solution {\n    public ${ret} solution(${typed}) {\n        // Your approach here\n        throw new UnsupportedOperationException("Implement solution");\n    }\n}\n`;
  return `#include <bits/stdc++.h>\nusing namespace std;\nclass Solution {\npublic:\n    ${ret} solution(${typed}) {\n        // Your approach here\n        throw runtime_error("Implement solution");\n    }\n};\n`;
}
async function prepare(dir, code, language, contract, marker, stdinMode) {
  if (language === 'JavaScript') {
    await writeFile(join(dir, 'solution.cjs'), code + (stdinMode ? '' : `\n;const __fs = require('node:fs');\n(async()=>{const cases=JSON.parse(__fs.readFileSync(0,'utf8'));for(const args of cases){try{let value=await solution(...args);process.stdout.write(${JSON.stringify(marker)}+JSON.stringify({value:value===undefined?null:value})+'\\n');}catch(e){process.stdout.write(${JSON.stringify(marker)}+JSON.stringify({error:String(e.message)})+'\\n');}}})();`));
    return [binaries[language], ['--max-old-space-size=256', join(dir, 'solution.cjs')]];
  }
  if (language === 'Python') {
    await writeFile(join(dir, 'solution.py'), stdinMode ? code : `import json as _json, sys as _sys, contextlib as _contextlib\n${code}\n\n_cases = _json.loads(_sys.stdin.read())\nfor _args in _cases:\n    try:\n        with _contextlib.redirect_stdout(_sys.stderr):\n            _value = solution(*_args)\n        print(${JSON.stringify(marker)} + _json.dumps({'value': _value}, allow_nan=False))\n    except Exception as _error:\n        print(${JSON.stringify(marker)} + _json.dumps({'error': str(_error)}))\n`);
    return [binaries[language], ['-I', '-B', '-X', 'utf8', join(dir, 'solution.py')]];
  }
  if (language === 'C++' || language === 'C') {
    let source = code;
    if (!stdinMode) {
      await writeFile(join(dir, 'json.hpp'), await readFile(join(assets, 'json.hpp')));
      const declarations = contract.params.map((p, i) => `auto a${i} = args.at(${i}).get<${nativeType(p.type, 'C++')}>();`).join('\n');
      source = `#include <iostream>\n#include "json.hpp"\n${code}\nint main(){nlohmann::json cases; std::cin>>cases; for(auto& args:cases){try{${declarations}\nauto value=Solution().solution(${contract.params.map((_, i) => `a${i}`).join(',')});std::cout<<${JSON.stringify(marker)}<<nlohmann::json({{"value",value}}).dump()<<std::endl;}catch(const std::exception& e){std::cout<<${JSON.stringify(marker)}<<nlohmann::json({{"error",e.what()}}).dump()<<std::endl;}}}`;
    }
    const file = join(dir, language === 'C' ? 'main.c' : 'main.cpp'); const exe = join(dir, process.platform === 'win32' ? 'main.exe' : 'main');
    await writeFile(file, source);
    const compile = await processRun(binaries[language], [file, language === 'C' ? '-std=c17' : '-std=c++17', '-O2', '-o', exe], { cwd: dir, timeout: 30000 });
    if (compile.code) throw new Error(`Compilation failed:\n${compile.stderr.slice(0, 12000)}`);
    return [exe, []];
  }
  await writeFile(join(dir, 'gson.jar'), await readFile(join(assets, 'gson.jar')));
  let source = code;
  if (!stdinMode) source += `\nclass Main {public static void main(String[] ignored) throws Exception {com.google.gson.Gson gson=new com.google.gson.GsonBuilder().serializeNulls().create(); com.google.gson.JsonArray cases=com.google.gson.JsonParser.parseReader(new java.io.InputStreamReader(System.in)).getAsJsonArray(); for(com.google.gson.JsonElement element:cases){try{com.google.gson.JsonArray args=element.getAsJsonArray(); Object value=new Solution().solution(${contract.params.map((p, i) => `gson.fromJson(args.get(${i}),${nativeType(p.type, 'Java')}.class)`).join(',')}); java.util.Map<String,Object> out=new java.util.HashMap<>();out.put("value",value); System.out.println(${JSON.stringify(marker)}+gson.toJson(out));}catch(Throwable e){System.out.println(${JSON.stringify(marker)}+gson.toJson(java.util.Map.of("error",e.toString())));}}}}`;
  await writeFile(join(dir, 'Main.java'), source);
  const compile = await processRun(javac, ['-encoding', 'UTF-8', '-cp', join(dir, 'gson.jar'), join(dir, 'Main.java')], { cwd: dir, timeout: 30000 });
  if (compile.code) throw new Error(`Compilation failed:\n${compile.stderr.slice(0, 12000)}`);
  return [binaries.Java, ['-Xmx256m', '-Dfile.encoding=UTF-8', '-Dstdout.encoding=UTF-8', '-Dstderr.encoding=UTF-8', '-cp', `${dir}${delimiter}${join(dir, 'gson.jar')}`, 'Main']];
}
export function stdinFor(test, contract) { return contract.mode === 'function' ? test.args.map(x => JSON.stringify(x)).join('\n') + '\n' : test.input + '\n'; }
export async function execute(code, language, suite) {
  if (!languages.includes(language)) throw Object.assign(new Error('Unsupported language.'), { status: 400 });
  if (typeof code !== 'string' || !code.trim() || code.length > 100000) throw Object.assign(new Error('Enter code (maximum 100 KB).'), { status: 400 });
  if (active >= 2) throw Object.assign(new Error('Two runs are already active. Try again in a moment.'), { status: 429 });
  const runtime = (await getRuntimes()).find(x => x.language === language);
  if (!runtime.available) throw Object.assign(new Error(runtime.reason), { status: 503 });
  active++;
  const dir = await mkdtemp(join(tmpdir(), 'codeprep-'));
  const start = performance.now(); const marker = `__CODEPREP_${randomBytes(8).toString('hex')}__`;
  const stdinMode = suite.contract.mode === 'stdin' || language === 'C';
  let outputs = [], executionError = '', logs = '';
  try {
    const [command, args] = await prepare(dir, code, language, suite.contract, marker, stdinMode);
    if (stdinMode) {
      for (const test of suite.testCases) {
        if (performance.now() - start > 45000) throw new Error('Suite time limit exceeded (45 seconds).');
        const out = await processRun(command, args, { cwd: dir, input: stdinFor(test, suite.contract), timeout: 2000 });
        if (out.code) outputs.push({ error: out.stderr || `Process exited with code ${out.code}` });
        else if (suite.contract.mode === 'function') { try { outputs.push({ value: JSON.parse(out.stdout.trim()) }); } catch { outputs.push({ error: 'Print a JSON value as the answer.', raw: out.stdout }); } }
        else outputs.push({ value: out.stdout.trim().replace(/\r\n/g, '\n') });
      }
    } else {
      const out = await processRun(command, args, { cwd: dir, input: JSON.stringify(suite.testCases.map(t => t.args)) });
      logs = out.stderr.slice(0, 8000);
      outputs = out.stdout.split(marker).slice(1).map(line => { try { return JSON.parse(line.split('\n')[0]); } catch { return { error: 'Invalid result output.' }; } });
      if (out.code) executionError = out.stderr.slice(0, 12000) || `Process exited with code ${out.code}`;
      if (outputs.length !== suite.testCases.length && !executionError) executionError = 'The program exited before completing every test.';
    }
  } catch (error) { executionError = error.message; }
  finally { active--; await rm(dir, { recursive: true, force: true }); }
  const results = suite.testCases.map((t, i) => {
    const output = outputs[i]; const error = output?.error || (!output ? executionError || 'No result returned.' : '');
    const expected = suite.contract.mode === 'stdin' ? t.expectedOutput.trim().replace(/\r\n/g, '\n') : t.expected;
    return { input: t.input, expectedOutput: t.expectedOutput, description: t.description, actualOutput: output && 'value' in output ? (typeof output.value === 'string' && suite.contract.mode === 'stdin' ? output.value : JSON.stringify(output.value)) : '', passed: !error && compareOutput(output?.value, expected, suite.compare, t.args), ...(error ? { error } : {}) };
  });
  const passed = results.filter(t => t.passed).length; const allPassed = passed === results.length && results.length > 0 && !executionError;
  return { results, allPassed, accepted: allPassed && suite.coverage === 'verified', coverage: suite.coverage, runner: `${language} · native ${language === 'C' || language === 'C++' || language === 'Java' ? 'compiler' : 'runtime'}`, durationMs: Math.round(performance.now() - start), summary: { total: results.length, passed, failed: results.length - passed }, logs, executionError, note: suite.note };
}


