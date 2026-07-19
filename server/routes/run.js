import { Router } from 'express';
import Groq from 'groq-sdk';
import { execFileSync } from 'child_process';
import { writeFileSync, mkdtempSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir, homedir } from 'os';

const router = Router();
const TIMEOUT_MS = 4000;
const PISTON_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston/execute';
const REMOTE_LANGUAGES = {
  java: { language: 'java', version: '15.0.2', filename: 'Main.java' },
  'c++': { language: 'c++', version: '10.2.0', filename: 'main.cpp' },
  c: { language: 'c', version: '10.2.0', filename: 'main.c' },
};

function pythonExecutable() {
  const bundled = join(homedir(), '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'python', 'python.exe');
  return process.env.CODEPREP_PYTHON_BIN || (existsSync(bundled) ? bundled : 'python');
}

// Problem examples use friendly notation (nums = [1,2], target = 3). Convert that
// notation to positional arguments without asking an LLM to write a new program.
function makeJavaScriptRunner(source, cases) {
  return `${source}\n\nconst __cases = ${JSON.stringify(cases)};
function parseArgs(input) {
  const parts = String(input).split(/,(?=\\s*[A-Za-z_]\\w*\\s*=)/);
  if (!parts.some(part => /^[A-Za-z_]\\w*\\s*=/.test(part.trim()))) return [Function('return (' + String(input) + ')')()];
  return parts.map(part => Function('return (' + part.replace(/^[^=]*=/, '').trim().replace(/\\btrue\\b/g, 'true').replace(/\\bfalse\\b/g, 'false').replace(/\\bnull\\b/g, 'null') + ')')());
}
function normalise(value) { return JSON.stringify(value); }
const __fn = typeof solution === 'function' ? solution : Object.values(globalThis).find(v => typeof v === 'function' && !['parseArgs','normalise'].includes(v.name));
if (!__fn) throw new Error('Create a named solution function (for example: function solution(nums, target) { ... }).');
const __results = __cases.map(test => {
  try {
    const actual = __fn(...parseArgs(test.input));
    const expected = Function('return (' + String(test.expectedOutput).replace(/\\btrue\\b/g, 'true').replace(/\\bfalse\\b/g, 'false').replace(/\\bnull\\b/g, 'null') + ')')();
    return { input: test.input, expectedOutput: test.expectedOutput, actualOutput: normalise(actual), passed: normalise(actual) === normalise(expected) };
  } catch (error) { return { input: test.input, expectedOutput: test.expectedOutput, actualOutput: 'Error', error: error.message, passed: false }; }
});
console.log(JSON.stringify(__results));`;
}

function makePythonRunner(source, cases) {
  return `${source}\n\nimport ast, inspect, json, re\n_cases = json.loads(${JSON.stringify(JSON.stringify(cases))})\ndef _args(text):\n    values = re.findall(r'(?:^|,\\s*)[A-Za-z_]\\w*\\s*=\\s*(.+?)(?=,\\s*[A-Za-z_]\\w*\\s*=|$)', str(text))\n    if not values: values = [text]\n    return [ast.literal_eval(v.replace('true','True').replace('false','False').replace('null','None')) for v in values]\n_funcs = [v for k, v in globals().items() if inspect.isfunction(v) and not k.startswith('_')]\nif not _funcs: raise RuntimeError('Create a named solution function.')\n_fn = globals().get('solution', _funcs[-1])\n_results = []\nfor test in _cases:\n    try:\n        actual = _fn(*_args(test['input']))\n        expected = ast.literal_eval(str(test['expectedOutput']).replace('true','True').replace('false','False').replace('null','None'))\n        _results.append({'input': test['input'], 'expectedOutput': test['expectedOutput'], 'actualOutput': json.dumps(actual), 'passed': actual == expected})\n    except Exception as error:\n        _results.append({'input': test['input'], 'expectedOutput': test['expectedOutput'], 'actualOutput': 'Error', 'error': str(error), 'passed': False})\nprint(json.dumps(_results))`;
}

async function runRemotely(code, language, testCases) {
  if (!process.env.GROQ_API_KEY) throw new Error('Remote runners need GROQ_API_KEY to simulate execution. JavaScript and Python run locally.');
  
  const prompt = `You are a deterministic ${language} execution engine.
I will provide a user's ${language} solution and a list of test cases.
Your task is to mentally execute the user's code against each test case and output EXACTLY a JSON object with a single key "results" containing an array of the results. No markdown, no explanations.
If the code has syntax errors or would fail to compile, you must still return the JSON array but with "passed": false and an "error" string for each case.

The JSON object must have exactly this structure:
{
  "results": [
    {
      "input": "...",
      "expectedOutput": "...",
      "actualOutput": "...",
      "passed": true|false,
      "error": "Compiler or runtime error message if applicable"
    }
  ]
}

USER SOLUTION:
${code}

TEST CASES:
${JSON.stringify(testCases)}`;

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are a JSON-only code execution engine. Output only valid JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0,
    response_format: { type: 'json_object' } // We can wrap the array in an object to ensure strict JSON if needed, but let's just parse the array
  });

  let output = completion.choices[0]?.message?.content?.trim() || '{}';
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');
  if (start >= 0 && end > start) {
    output = output.slice(start, end + 1);
  }
  
  const parsed = JSON.parse(output);
  if (!parsed.results) throw new Error('The simulated runner produced no test results.');
  
  return parsed.results;
}

function formatResponse(results, runner) {
  const normalized = results.map(result => ({ ...result, passed: result.passed === true || result.passed === 'true' }));
  return { results: normalized, allPassed: normalized.every(result => result.passed), runner, summary: { total: normalized.length, passed: normalized.filter(result => result.passed).length, failed: normalized.filter(result => !result.passed).length } };
}

router.post('/run', async (req, res) => {
  const { code, language, testCases } = req.body;
  if (!code || !language || !Array.isArray(testCases) || !testCases.length) {
    return res.status(400).json({ error: 'Code, language, and at least one test case are required.' });
  }
  const normalisedLanguage = language.toLowerCase();
  if (!['javascript', 'js', 'python', 'python3', ...Object.keys(REMOTE_LANGUAGES)].includes(normalisedLanguage)) {
    return res.status(400).json({ error: `Unsupported language: ${language}` });
  }

  if (REMOTE_LANGUAGES[normalisedLanguage]) {
    try {
      return res.json(formatResponse(await runRemotely(code, normalisedLanguage, testCases), 'remote'));
    } catch (error) {
      const results = testCases.map(test => ({ input: test.input, expectedOutput: test.expectedOutput, actualOutput: 'Error', error: error.message, passed: false }));
      return res.json(formatResponse(results, 'remote'));
    }
  }

  const dir = mkdtempSync(join(tmpdir(), 'codeprep-'));
  try {
    const isPython = normalisedLanguage.startsWith('python');
    const file = join(dir, isPython ? 'solution.py' : 'solution.js');
    writeFileSync(file, isPython ? makePythonRunner(code, testCases) : makeJavaScriptRunner(code, testCases));
    const output = execFileSync(isPython ? pythonExecutable() : 'node', [file], { timeout: TIMEOUT_MS, encoding: 'utf8', windowsHide: true, maxBuffer: 1024 * 1024 });
    const results = JSON.parse(output.trim());
    return res.json(formatResponse(results, 'local'));
  } catch (error) {
    const message = error.killed ? `Time limit exceeded (${TIMEOUT_MS}ms)` : (error.stderr || error.message);
    const results = testCases.map(test => ({ input: test.input, expectedOutput: test.expectedOutput, actualOutput: 'Error', error: String(message).trim(), passed: false }));
    return res.json(formatResponse(results, 'local'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

export default router;
