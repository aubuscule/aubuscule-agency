import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { sitemapRoutes } from '../scripts/sitemap-routes.mjs';
import {
  computeRouteHash,
  checkRouteImports,
  runSitemapStamp,
  getLatestCommitDate,
} from '../scripts/sitemap-stamp.mjs';

test('sitemapRoutes: all 9 routes are defined with page, files, and namespaces', () => {
  const expectedPaths = [
    '',
    '/agency',
    '/products',
    '/products/remplate',
    '/products/remplate/templates',
    '/products/remplate/faq',
    '/products/zones-tonales',
    '/dev',
    '/epk',
  ];

  assert.deepEqual(Object.keys(sitemapRoutes).sort(), expectedPaths.sort());

  for (const [p, route] of Object.entries(sitemapRoutes)) {
    assert.ok(typeof route === 'object' && route !== null, `Route ${p} should be an object`);
    assert.ok(route.page, `Route ${p} should have a page file defined`);
    assert.ok(fs.existsSync(route.page), `Route ${p} page ${route.page} must exist on disk`);
    assert.ok(Array.isArray(route.files), `Route ${p} should have files array`);
    assert.ok(Array.isArray(route.namespaces), `Route ${p} should have namespaces array`);
    assert.ok(route.namespaces.length > 0, `Route ${p} must have at least one namespace`);

    // Verify all files in input list exist
    for (const file of route.files) {
      assert.ok(fs.existsSync(file), `Input file ${file} for route ${p} must exist on disk`);
    }
  }
});

test('shared chrome exclusion: Footer, Nav, and layouts appear in NO route inputs', () => {
  const forbiddenSubstrings = [
    'src/components/shared/Footer.tsx',
    'src/components/shared/Nav.tsx',
    'src/app/layout.tsx',
    'src/app/[locale]/layout.tsx',
    '/layout.tsx',
  ];

  for (const [routePath, route] of Object.entries(sitemapRoutes)) {
    for (const file of route.files) {
      for (const forbidden of forbiddenSubstrings) {
        if (forbidden === '/layout.tsx') {
          assert.ok(
            !file.endsWith('/layout.tsx'),
            `Route "${routePath}" must not include layout file "${file}" in its inputs`
          );
        } else {
          assert.notEqual(
            file,
            forbidden,
            `Route "${routePath}" must not include shared chrome file "${forbidden}" in its inputs`
          );
        }
      }
    }
  }
});

test('uncovered imports: repository routes have 0 uncovered imports', () => {
  for (const [routePath, route] of Object.entries(sitemapRoutes)) {
    const warnings = checkRouteImports(routePath, route.page, route.files);
    assert.equal(
      warnings.length,
      0,
      `Expected 0 uncovered import warnings for ${routePath}, got: ${JSON.stringify(warnings)}`
    );
  }
});

test('uncovered imports: warns when a page imports a file not in its input list', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-import-test-'));
  try {
    fs.mkdirSync(path.join(tmpDir, 'src', 'components'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'app'), { recursive: true });

    const pageFile = 'src/app/page.tsx';
    const componentFile = 'src/components/Unlisted.tsx';

    fs.writeFileSync(
      path.join(tmpDir, pageFile),
      `import { Unlisted } from '@/components/Unlisted';\nexport default function Page() { return <Unlisted />; }\n`
    );
    fs.writeFileSync(
      path.join(tmpDir, componentFile),
      `export function Unlisted() { return <div>Hi</div>; }\n`
    );

    // Provide an input list that forgets to include Unlisted.tsx
    const inputFiles = [pageFile];
    const warnings = checkRouteImports('/test', pageFile, inputFiles, tmpDir);

    assert.equal(warnings.length, 1);
    assert.equal(warnings[0].route, '/test');
    assert.equal(warnings[0].importedFile, componentFile);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('unchanged: hashing is deterministic and check mode passes when up to date', () => {
  const hash1 = computeRouteHash('/dev', sitemapRoutes['/dev'].files, sitemapRoutes['/dev'].namespaces);
  const hash2 = computeRouteHash('/dev', sitemapRoutes['/dev'].files, sitemapRoutes['/dev'].namespaces);
  assert.equal(hash1, hash2, 'Hash must be identical across multiple runs');

  // Check committed sitemap-dates.json
  const result = runSitemapStamp({ checkMode: true });
  assert.equal(result.success, true, 'Check mode should succeed on current committed dates');
  assert.equal(result.stale.length, 0, 'No stale paths expected');
  assert.equal(result.upToDate.length, 9, 'All 9 routes should be up to date');

  // Stamp mode without changes should write nothing
  const stampResult = runSitemapStamp({ checkMode: false });
  assert.equal(stampResult.success, true);
  assert.equal(stampResult.changed.length, 0, 'No paths should be changed');
});

test('real map test: editing Footer.tsx alone does not change ANY real route hash', () => {
  const footerPath = 'src/components/shared/Footer.tsx';
  const originalFooter = fs.readFileSync(footerPath, 'utf8');

  // Capture baseline hashes for all 9 real routes
  const baselineHashes = {};
  for (const [routePath, route] of Object.entries(sitemapRoutes)) {
    baselineHashes[routePath] = computeRouteHash(routePath, route.files, route.namespaces);
  }

  try {
    // Append a comment to the real Footer.tsx
    fs.writeFileSync(footerPath, originalFooter + '\n// test edit to verify chrome exclusion\n', 'utf8');

    // Recompute hashes for all 9 real routes
    for (const [routePath, route] of Object.entries(sitemapRoutes)) {
      const newHash = computeRouteHash(routePath, route.files, route.namespaces);
      assert.equal(
        newHash,
        baselineHashes[routePath],
        `Real route "${routePath || "''"}" hash changed when Footer.tsx was edited`
      );
    }
  } finally {
    // Always restore original file
    fs.writeFileSync(footerPath, originalFooter, 'utf8');
  }
});

test('real map test: editing unrelated namespace in real en.json does not change /dev hash', () => {
  const enJsonPath = 'src/i18n/messages/en.json';
  const originalJson = fs.readFileSync(enJsonPath, 'utf8');
  const parsed = JSON.parse(originalJson);

  const baselineDevHash = computeRouteHash('/dev', sitemapRoutes['/dev'].files, sitemapRoutes['/dev'].namespaces);
  const baselineAgencyHash = computeRouteHash('/agency', sitemapRoutes['/agency'].files, sitemapRoutes['/agency'].namespaces);

  try {
    // Mutate an unrelated namespace (e.g. hero under agency) in en.json
    const mutated = {
      ...parsed,
      hero: {
        ...parsed.hero,
        headline: 'Modified headline for agency test',
      },
    };
    fs.writeFileSync(enJsonPath, JSON.stringify(mutated, null, 2) + '\n', 'utf8');

    const newDevHash = computeRouteHash('/dev', sitemapRoutes['/dev'].files, sitemapRoutes['/dev'].namespaces);
    const newAgencyHash = computeRouteHash('/agency', sitemapRoutes['/agency'].files, sitemapRoutes['/agency'].namespaces);

    // /dev hash must NOT change because 'hero' is not in /dev's namespaces
    assert.equal(
      newDevHash,
      baselineDevHash,
      '/dev hash must not change when unrelated "hero" namespace is edited in en.json'
    );

    // /agency hash MUST change because 'hero' is in /agency's namespaces
    assert.notEqual(
      newAgencyHash,
      baselineAgencyHash,
      '/agency hash must change when its own "hero" namespace is edited in en.json'
    );
  } finally {
    fs.writeFileSync(enJsonPath, originalJson, 'utf8');
  }
});

test('changed: component modification changes route hash and updates date on stamp', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-change-test-'));
  try {
    const datesPath = path.join(tmpDir, 'sitemap-dates.json');
    const compFile = 'src/components/MyComp.tsx';
    const jsonFile = 'src/i18n/messages/en.json';

    fs.mkdirSync(path.join(tmpDir, 'src', 'components'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'i18n', 'messages'), { recursive: true });

    fs.writeFileSync(path.join(tmpDir, compFile), 'export const v = 1;\n');
    fs.writeFileSync(
      path.join(tmpDir, jsonFile),
      JSON.stringify({ myRoute: { title: 'Initial' }, other: { value: 123 } })
    );

    const testRoutes = {
      '/my-route': {
        page: compFile,
        files: [compFile, jsonFile],
        namespaces: ['myRoute'],
      },
    };

    // 1. Initial stamp
    const stamp1 = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      routes: testRoutes,
      customDate: '2026-10-24',
    });
    assert.equal(stamp1.changed.length, 1);
    assert.equal(stamp1.changed[0].newDate, '2026-10-24');
    const initialHash = stamp1.changed[0].newHash;

    // 2. Check mode should pass
    const check1 = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      routes: testRoutes,
      checkMode: true,
    });
    assert.equal(check1.success, true);

    // 3. Modify component content
    fs.writeFileSync(path.join(tmpDir, compFile), 'export const v = 2; // modified\n');

    // 4. Check mode must now fail
    const checkAfterEdit = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      routes: testRoutes,
      checkMode: true,
    });
    assert.equal(checkAfterEdit.success, false);
    assert.equal(checkAfterEdit.stale.length, 1);
    assert.equal(checkAfterEdit.stale[0].path, '/my-route');

    // 5. Stamp mode updates date to today
    const stamp2 = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      routes: testRoutes,
      customDate: '2026-11-05',
    });
    assert.equal(stamp2.changed.length, 1);
    assert.equal(stamp2.changed[0].newDate, '2026-11-05');
    assert.notEqual(stamp2.changed[0].newHash, initialHash);

    // 6. Check mode passes again
    const checkAfterStamp = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      routes: testRoutes,
      checkMode: true,
    });
    assert.equal(checkAfterStamp.success, true);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('pruning: stamp mode drops removed routes and check mode flags orphans as stale', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-prune-test-'));
  try {
    const datesPath = path.join(tmpDir, 'sitemap-dates.json');
    const compFile = 'src/components/MyComp.tsx';

    fs.mkdirSync(path.join(tmpDir, 'src', 'components'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, compFile), 'export const v = 1;\n');

    // Seed dates with active route and an obsolete/removed route
    const initialDates = {
      '/active': {
        hash: computeRouteHash('/active', [compFile], [], tmpDir),
        date: '2026-10-20',
      },
      '/obsolete-route': {
        hash: 'deadbeef12345678',
        date: '2026-01-01',
      },
    };
    fs.writeFileSync(datesPath, JSON.stringify(initialDates, null, 2) + '\n');

    const testRoutes = {
      '/active': {
        page: compFile,
        files: [compFile],
        namespaces: [],
      },
    };

    // 1. In check mode, orphan route must be detected and cause check mode to fail
    const checkResult = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      routes: testRoutes,
      checkMode: true,
    });
    assert.equal(checkResult.success, false, 'Check mode must fail when orphaned routes exist');
    assert.equal(checkResult.stale.length, 1);
    assert.equal(checkResult.stale[0].path, '/obsolete-route');
    assert.equal(checkResult.stale[0].orphan, true);

    // 2. In stamp mode, obsolete route must be pruned from saved dates
    const stampResult = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      routes: testRoutes,
      checkMode: false,
    });
    assert.equal(stampResult.success, true);
    assert.ok(stampResult.pruned.includes('/obsolete-route'));

    const savedDates = JSON.parse(fs.readFileSync(datesPath, 'utf8'));
    assert.ok(savedDates['/active'], 'Active route should remain');
    assert.equal(savedDates['/obsolete-route'], undefined, 'Obsolete route must be pruned');

    // 3. Check mode now passes cleanly
    const checkAfterPrune = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      routes: testRoutes,
      checkMode: true,
    });
    assert.equal(checkAfterPrune.success, true);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('getLatestCommitDate: uses argv array and resolves git commit dates without shell globbing', () => {
  // Test with files having [locale] in the path
  const files = ['src/app/[locale]/page.tsx'];
  const date = getLatestCommitDate(files);
  assert.match(date, /^\d{4}-\d{2}-\d{2}$/, 'Should return a valid YYYY-MM-DD date from git');

  // Test that invalid / non-existent file throws loudly
  assert.throws(
    () => getLatestCommitDate(['non_existent_file_xyz_123.ts']),
    /Failed to determine latest commit date|No git commit found/
  );
});

test('CLI: node scripts/sitemap-stamp.mjs --check exits with code 0 when clean', async () => {
  const { exec } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const execAsync = promisify(exec);

  const { stdout, stderr } = await execAsync('node scripts/sitemap-stamp.mjs --check');
  assert.match(stdout, /All 9 sitemap paths are up to date/);
  assert.equal(stderr, '');
});
