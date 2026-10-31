import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../lib/problems.js';
import { getSuite, packIds } from '../lib/test-packs.js';
import { offlineGuide } from '../lib/guides.js';
import { execute } from '../lib/runner.js';
test('every offline reference compiles and passes its entire native JavaScript suite', { timeout: 90000 }, async () => {
  for (const id of packIds) {
    const problem = catalog.find(p => p.id === id), suite = getSuite(problem);
    const guide = offlineGuide(problem, 'solution');
    assert.ok(guide?.whyThisApproach, id); assert.ok(guide?.walkthrough, id); assert.ok(guide?.tricks.length, id);
    const result = await execute(guide.solutionCode, 'JavaScript', suite);
    assert.equal(result.accepted, true, `${id}: ${result.executionError || result.results.find(t => !t.passed)?.error}`);
  }
});
