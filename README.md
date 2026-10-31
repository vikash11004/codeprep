# CodePrep

A local coding-practice workspace with a dark glass interface, public problem importing, real code execution, and help that stays hidden until you ask after a failed attempt.

## Start

Requirements: Node.js 22.12+ (Node 24 recommended), npm, and Python 3. On this Windows workspace, Chromium, GCC, and Java have already been installed under `server/.tools`.

```sh
npm run setup
# Windows: install portable C/C++ and Java compilers without changing PATH
npm run setup:compilers
npm run dev
```

Open http://127.0.0.1:5173. The API listens on 127.0.0.1:3001. `npm run build` followed by `npm start` serves the built app at http://127.0.0.1:3001.

On macOS/Linux, install Python 3, g++, gcc, and JDK 21 with your system package manager. Set `CODEPREP_PYTHON_BIN`, `CODEPREP_CPP_BIN`, `CODEPREP_C_BIN`, `CODEPREP_JAVA_BIN`, and `CODEPREP_JAVAC_BIN` in `server/.env` if necessary. `npm run setup` installs Chromium and the JSON adapters on all platforms. Compiler availability is detected; unavailable languages are disabled with a reason.

No MongoDB or AI key is required to import, edit, run, grade, save progress, or use the offline guides.

## Practice flow

1. Browse 390 problems or import a public URL/pasted statement.
2. Review the extracted statement, examples, source, and test coverage before entering the workspace.
3. Write code using the starter and the **I/O & tests** contract. Drafts are saved separately by problem and language.
4. Run with **Run tests** or **Ctrl+Enter**. Results come from actual processes, never simulated AI execution.
5. Inspect failed cases, edit, and try again. After a failure, optionally request a hint or explicitly confirm **Reveal & explain**.

The learning panel explains the approach, why it works, a walkthrough, code, complexity, and practical tips. Editing code or changing problems locks help again until that version has been run. The server independently enforces the failed-attempt, problem, code, language, and consent checks.

## Execution and test coverage

- JavaScript: Node.js; Python: Python 3; C/C++: GCC; Java: javac + JVM.
- 74 problems have **18,733 distinct reference-checked cases** in total. Most have 256 cases; Climbing Stairs covers all 45 valid inputs. Cases include source examples, regressions, edge cases, and seeded generated inputs.
- Expected values come from deterministic reference algorithms. Tests are selected by the server; requests cannot replace the official suite.
- Special comparisons handle Two Sum index order, unordered answers, and nested anagram/subset groups. Numeric outputs have a small tolerance.
- Other problems use their published examples and are explicitly marked **sample checks**. Passing samples never marks a problem fully accepted or solved.
- Add up to 50 trusted custom input/output cases per run. These supplement the suite; they cannot weaken it or upgrade sample coverage.
- The practice suites are not the source websites' hidden tests and do not prove optimal asymptotic complexity. Offline references favor readability in some cases and explain faster alternatives.

For JavaScript/Python, implement `solution(...)`. C++/Java use `class Solution` with a `solution(...)` method; the harness supplies main, JSON arguments, and output serialization. Read the starter signature: this app uses serialized arrays/JSON rather than automatically instantiating LeetCode ListNode/TreeNode or design-problem classes. For operation sequences, implement a function that processes the operations and returns their results. Heterogeneous/null-bearing values use JSON types where needed.

C uses a full stdin/stdout program. For structured function problems, each argument is JSON on its own line and the answer must be JSON. Raw competitive-programming statements use their literal stdin/stdout format in every language. The **I/O & tests** tab shows the actual first input.

Compilation, runtime exceptions, process exits, timeouts, and excessive output are reported. There are two concurrent execution slots, an 8-second function-suite deadline, a 30-second compile deadline, and bounded output. Raw stdin programs have a 2-second per-case deadline and a 45-second overall deadline. Java and Node have heap limits; native/Python execution is not OS-memory-sandboxed.

**This is a trusted, single-user local runner. Submitted programs execute with your OS permissions in temporary directories. It is deliberately bound to loopback and must not be exposed as an untrusted public execution service. Public hosting requires an isolated worker/container judge with filesystem, network, CPU, and memory restrictions.** Child processes receive a reduced environment without API keys, but that is not a security sandbox.

## Importing

The importer tries structured LeetCode data, static HTML/Next.js hydration (including GFG fields), and then Playwright Chromium for JavaScript-rendered pages. It also handles generic articles/main content, standard and sample Input/Output sections, and Codeforces-style sample blocks.

All network hops are checked for public HTTP(S) targets. Direct requests pin checked DNS addresses; redirects and browser requests are revalidated. Browser service workers and WebSockets are blocked. Imports have size, request-count, and concurrency limits. There is no AI parsing and no third-party reader service.

372 existing library entries were refreshed from public source statements. Some premium, unavailable, or legacy entries have no public examples; these show a paste/add-tests path instead of fabricated test answers. When live LeetCode access fails, an exact bundled source-link match may be used and is visibly labeled as a bundled fallback.

No importer can guarantee access to every page: login walls, CAPTCHA, paywalls, unavailable pages, and unfamiliar formats can require pasted text. Private hidden test suites cannot be scraped from a public statement. Always review an import, especially its examples and I/O contract.

## Optional AI coaching

Copy `server/.env.example` to `server/.env` if needed and set a valid `GROQ_API_KEY`. The default model is `llama-3.3-70b-versatile`, configurable with `LLM_MODEL`.

Only an explicitly requested hint or confirmed solution after a matching failed execution contacts Groq. Importing, starter code, test generation, and grading never contact AI. A coaching request sends the problem, attempted code, language, and up to five failed cases to the provider.

All 74 verified problems have authored offline hints and JavaScript reference explanations, used when the key is absent/rejected or the provider is unavailable. Each offline reference is executed against its full suite during tests. For arbitrary imported problems, optional AI coaching requires a working key. The current workspace's existing key was rejected during validation; replace it locally to enable live AI explanations. Do not commit keys.

## Persistence

Sessions, progress, and imported problems are written atomically to `server/data/local/` (Git-ignored). Override the directory with `CODEPREP_DATA_DIR`. These files use local single-process storage, not a distributed database. Existing MongoDB history is not migrated automatically. Browser drafts and the session identifier are in localStorage; use the same browser profile to retain access to your progress.

## Verification

```sh
npm test          # parser, SSRF guards, source-example agreement, API gates,
                  # all native languages, timeouts, browser rendering,
                  # and all 74 offline references against their full suites
npm run lint
npm run build
# Start npm run dev before this command:
npm run test:e2e   # desktop/mobile navigation, import preview, grading,
                  # language switching, drafts, consent, accessible dialog close
```

E2E screenshots are saved in `test-results/`. The UI explanation response is mocked for repeatable E2E testing; server tests independently verify consent and offline fallback. Live source import checks were also performed against LeetCode, GeeksforGeeks, and CSES.

Maintenance: `node server/scripts/refresh-catalog.js --missing-only` refreshes missing public statements; omit the flag to refresh the whole catalog. This is a manual maintenance task, not something triggered on every page load.
