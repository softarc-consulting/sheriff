import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { assertLocalPackages } from './assert-local-packages.mjs';

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'sheriff-package-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const archives = join(dir, 'archives');
  mkdirSync(archives);
  writeFileSync(join(archives, 'core.tgz'), '');
  writeFileSync(join(archives, 'eslint-plugin.tgz'), '');
  const manifest = {
    devDependencies: {
      '@softarc/sheriff-core': 'file:archives/core.tgz',
      '@softarc/eslint-plugin-sheriff': 'file:archives/eslint-plugin.tgz',
    },
  };
  writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest));
  const install = (name, base = join(dir, 'node_modules')) => {
    const target = join(base, name);
    mkdirSync(target, { recursive: true });
    writeFileSync(
      join(target, 'package.json'),
      JSON.stringify({ name, version: '1.0.0' }),
    );
    return target;
  };
  const core = install('@softarc/sheriff-core');
  const plugin = install('@softarc/eslint-plugin-sheriff');
  const utils = install('@typescript-eslint/utils');
  install('typescript');
  install('eslint');
  return { dir, archives, manifest, install, core, plugin, utils };
}

test('accepts packed dependencies with consumer-local peers', (t) => {
  const f = fixture(t);
  assert.deepEqual(assertLocalPackages(f.dir, f.archives), {
    typescript: '1.0.0',
    eslint: '1.0.0',
  });
});

test('rejects a registry dependency instead of the local archive', (t) => {
  const f = fixture(t);
  f.manifest.devDependencies['@softarc/sheriff-core'] = '^1.0.0';
  writeFileSync(join(f.dir, 'package.json'), JSON.stringify(f.manifest));
  assert.throws(
    () => assertLocalPackages(f.dir, f.archives),
    /must use a local archive/,
  );
});

test('rejects an archive from a different build directory', (t) => {
  const f = fixture(t);
  assert.throws(() => assertLocalPackages(f.dir, join(f.dir, 'other-build')));
});

test('rejects a package symlinked outside the consumer', (t) => {
  const f = fixture(t);
  const external = f.install('@softarc/sheriff-core', join(f.dir, 'outside'));
  rmSync(f.core, { recursive: true });
  symlinkSync(external, f.core, 'dir');
  assert.throws(
    () => assertLocalPackages(f.dir, f.archives),
    /must be installed inside the consumer/,
  );
});

test('rejects a different core resolved by the plugin', (t) => {
  const f = fixture(t);
  f.install('@softarc/sheriff-core', join(f.plugin, 'node_modules'));
  assert.throws(
    () => assertLocalPackages(f.dir, f.archives),
    /same local core/,
  );
});

for (const [owner, peer, message] of [
  ['core', 'typescript', /consumer TypeScript/],
  ['plugin', 'eslint', /consumer ESLint/],
  ['utils', 'eslint', /consumer ESLint/],
]) {
  test(`rejects ${owner} resolving a separate ${peer} peer`, (t) => {
    const f = fixture(t);
    f.install(peer, join(f[owner], 'node_modules'));
    assert.throws(() => assertLocalPackages(f.dir, f.archives), message);
  });
}

test('accepts archives declared as regular dependencies', (t) => {
  const f = fixture(t);
  f.manifest.dependencies = f.manifest.devDependencies;
  delete f.manifest.devDependencies;
  writeFileSync(join(f.dir, 'package.json'), JSON.stringify(f.manifest));
  assert.deepEqual(assertLocalPackages(f.dir, f.archives), {
    typescript: '1.0.0',
    eslint: '1.0.0',
  });
});

test('rejects a missing local package declaration', (t) => {
  const f = fixture(t);
  delete f.manifest.devDependencies['@softarc/sheriff-core'];
  writeFileSync(join(f.dir, 'package.json'), JSON.stringify(f.manifest));
  assert.throws(
    () => assertLocalPackages(f.dir, f.archives),
    /must use a local archive/,
  );
});

test('the CLI verifies a consumer and reports its tool versions', (t) => {
  const f = fixture(t);
  const result = spawnSync(
    process.execPath,
    [fileURLToPath(new URL('./assert-local-packages.mjs', import.meta.url))],
    {
      cwd: f.dir,
      env: { ...process.env, SHERIFF_PACKAGES_DIR: f.archives },
      encoding: 'utf8',
    },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stdout,
    /Local Sheriff archives verified \(TypeScript 1.0.0, ESLint 1.0.0\)/,
  );
});

test('the CLI fails when the runner has not supplied the archives directory', (t) => {
  const f = fixture(t);
  const env = { ...process.env };
  delete env.SHERIFF_PACKAGES_DIR;
  const result = spawnSync(
    process.execPath,
    [fileURLToPath(new URL('./assert-local-packages.mjs', import.meta.url))],
    {
      cwd: f.dir,
      env,
      encoding: 'utf8',
    },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /SHERIFF_PACKAGES_DIR is required/);
});
