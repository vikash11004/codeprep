# Source-style solution compatibility

The catalogue now includes public metadata and language starters for 372 LeetCode problems. `node server/scripts/refresh-signatures.js` refreshes missing signatures. URL imports also preserve source metadata when the public structured endpoint is available.

JavaScript, Python, C++, and Java use source method names and convert JSON examples into native arrays, characters, lists, trees, and nested collections. The runner reconstructs node objects, serializes returned nodes, captures in-place outputs, checks returned prefixes, and replays design-class constructors and method calls. Cyclic-list inputs and lowest-common-ancestor references are explicitly wired to preserve node identity. Source examples remain sample checks, not the source site's hidden suite.

This does **not** mean arbitrary LeetCode code is universally interchangeable. C still uses the stdin/stdout contract. Problems requiring custom hidden APIs/judges (such as `guess`, `isBadVersion`, graph cloning, random pointers, intersection identity, and codec round trips) need dedicated adapters and currently retain the generic contract. Missing/premium source metadata likewise falls back to the documented generic contract. Extra imports, unsupported languages, and source-specific library versions can require adjustments.

Regression checks: `node --test server/tests/adapters.test.js server/tests/leetcode.test.js server/tests/runner.test.js`. The adapter tests execute published cases in all four languages; Two Sum also runs all 256 verified cases in each language. No AI is used for signatures, conversion, execution, or grading.
