import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { resolveRuntimePaths } from '../lib/runtime-config.js';

test('bundled compiler paths follow the deployment directory while system commands and absolute overrides remain intact', () => {
  const build = resolve('build/server'), runtime = resolve('runtime/server');
  const config = { java: '.tools/jdk-21/bin/java', javac: '.tools/jdk-21/bin/javac', cpp: 'g++', c: resolve('system/gcc'), invalid: null };
  const before = resolveRuntimePaths(config, build), after = resolveRuntimePaths(config, runtime);
  assert.notEqual(before.java, after.java);
  assert.equal(after.java, resolve(runtime, config.java));
  assert.equal(after.javac, resolve(runtime, config.javac));
  assert.equal(after.cpp, 'g++'); assert.equal(after.c, config.c);
  assert.equal('invalid' in after, false);
});
