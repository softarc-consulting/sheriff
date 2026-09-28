import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Verify that a consumer uses the packed Sheriff builds and its own peers. */
export function assertLocalPackages(projectDir, packagesDir) {
  const consumer = createRequire(join(projectDir, 'package.json'));
  const manifest = consumer('./package.json');
  const nodeModules = realpathSync(join(projectDir, 'node_modules'));
  const installed = {};

  for (const [name, archive] of [
    ['@softarc/sheriff-core', 'core.tgz'],
    ['@softarc/eslint-plugin-sheriff', 'eslint-plugin.tgz'],
  ]) {
    const specifier =
      manifest.devDependencies?.[name] ?? manifest.dependencies?.[name];
    assert.ok(
      specifier?.startsWith('file:'),
      `${name} must use a local archive`,
    );
    assert.equal(
      realpathSync(resolve(projectDir, specifier.slice(5))),
      realpathSync(resolve(packagesDir, archive)),
    );
    const packagePath = realpathSync(consumer.resolve(`${name}/package.json`));
    const location = relative(nodeModules, packagePath);
    assert.ok(
      location !== '..' && !location.startsWith(`..${sep}`),
      `${name} must be installed inside the consumer`,
    );
    installed[name] = createRequire(packagePath);
  }

  const core = installed['@softarc/sheriff-core'];
  const plugin = installed['@softarc/eslint-plugin-sheriff'];
  assert.equal(
    plugin.resolve('@softarc/sheriff-core/package.json'),
    consumer.resolve('@softarc/sheriff-core/package.json'),
    'The plugin must use the same local core as the consumer',
  );
  assert.equal(
    core.resolve('typescript/package.json'),
    consumer.resolve('typescript/package.json'),
    'Core must use the consumer TypeScript',
  );
  assert.equal(
    plugin.resolve('eslint/package.json'),
    consumer.resolve('eslint/package.json'),
    'The plugin must use the consumer ESLint',
  );
  const utils = createRequire(
    plugin.resolve('@typescript-eslint/utils/package.json'),
  );
  assert.equal(
    utils.resolve('eslint/package.json'),
    consumer.resolve('eslint/package.json'),
    'The utils peer must use the consumer ESLint',
  );

  const version = (name) =>
    JSON.parse(readFileSync(consumer.resolve(`${name}/package.json`), 'utf8'))
      .version;
  return { typescript: version('typescript'), eslint: version('eslint') };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  assert.ok(
    process.env.SHERIFF_PACKAGES_DIR,
    'SHERIFF_PACKAGES_DIR is required',
  );
  const versions = assertLocalPackages(
    process.cwd(),
    process.env.SHERIFF_PACKAGES_DIR,
  );
  console.log(
    `Local Sheriff archives verified (TypeScript ${versions.typescript}, ESLint ${versions.eslint})`,
  );
}
