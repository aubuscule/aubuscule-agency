import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { sitemapRoutes, routeNamespaces, SHARED_FILES } from '../scripts/sitemap-routes.mjs';
import {
  computeRouteHash,
  checkRouteImports,
  runSitemapStamp,
  resolveImport,
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
    assert.ok(Array.isArray(route), `Route ${p} should be an array`);
    assert.ok(route.page, `Route ${p} should have a page file defined`);
    assert.ok(fs.existsSync(route.page), `Route ${p} page ${route.page} must exist on disk`);
    assert.ok(Array.isArray(route.namespaces), `Route ${p} should have namespaces array`);
    assert.ok(route.namespaces.length > 0, `Route ${p} must have at least one namespace`);

    // Verify all files in input list exist
    for (const file of route) {
      assert.ok(fs.existsSync(file), `Input file ${file} for route ${p} must exist on disk`);
    }
  }
});

test('uncovered imports: repository routes have 0 uncovered imports', () => {
  for (const [routePath, route] of Object.entries(sitemapRoutes)) {
    const warnings = checkRouteImports(routePath, route.page, route);
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
  const hash1 = computeRouteHash('/dev', sitemapRoutes['/dev'], sitemapRoutes['/dev'].namespaces);
  const hash2 = computeRouteHash('/dev', sitemapRoutes['/dev'], sitemapRoutes['/dev'].namespaces);
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

test('shared chrome exclusion: editing Footer.tsx alone does not change any route hash', () => {
  const footerPath = 'src/components/shared/Footer.tsx';
  const originalFooter = fs.readFileSync(footerPath, 'utf8');

  // Capture baseline hashes for all 9 routes
  const baselineHashes = {};
  for (const [routePath, route] of Object.entries(sitemapRoutes)) {
    baselineHashes[routePath] = computeRouteHash(routePath, route.files, route.namespaces);
  }

  try {
    // Mutate Footer.tsx
    fs.writeFileSync(footerPath, originalFooter + '\n// temporary test edit to footer\n', 'utf8');

    // Recompute hashes for all 9 routes
    for (const [routePath, route] of Object.entries(sitemapRoutes)) {
      const newHash = computeRouteHash(routePath, route.files, route.namespaces);
      assert.equal(
        newHash,
        baselineHashes[routePath],
        `Route ${routePath || "''"} hash must not change when Footer.tsx is edited`
      );
    }
  } finally {
    // Restore Footer.tsx
    fs.writeFileSync(footerPath, originalFooter, 'utf8');
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

test('changed: editing unrelated i18n namespace does NOT change route hash', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-i18n-test-'));
  try {
    const datesPath = path.join(tmpDir, 'sitemap-dates.json');
    const jsonFile = 'src/i18n/messages/en.json';

    fs.mkdirSync(path.join(tmpDir, 'src', 'i18n', 'messages'), { recursive: true });

    const initialData = {
      agency: { headline: 'Creative Agency' },
      dev: { title: 'Custom Software' },
    };
    fs.writeFileSync(path.join(tmpDir, jsonFile), JSON.stringify(initialData));

    const testRoutes = {
      '/agency': {
        page: jsonFile,
        files: [jsonFile],
        namespaces: ['agency'],
      },
      '/dev': {
        page: jsonFile,
        files: [jsonFile],
        namespaces: ['dev'],
      },
    };

    // Initial stamp
    runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      routes: testRoutes,
      customDate: '2026-10-24',
    });

    const devHashBefore = computeRouteHash('/dev', [jsonFile], ['dev'], tmpDir);

    // Modify ONLY the 'agency' key in en.json
    fs.writeFileSync(
      path.join(tmpDir, jsonFile),
      JSON.stringify({
        agency: { headline: 'Creative Agency EDITED' },
        dev: { title: 'Custom Software' },
      })
    );

    const devHashAfter = computeRouteHash('/dev', [jsonFile], ['dev'], tmpDir);
    const agencyHashAfter = computeRouteHash('/agency', [jsonFile], ['agency'], tmpDir);

    // Dev hash MUST be identical because its top-level key did not change!
    assert.equal(
      devHashBefore,
      devHashAfter,
      'Unrelated namespace change must not alter dev route hash'
    );

    // In check mode: only /agency is stale, /dev is up to date!
    const check = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      routes: testRoutes,
      checkMode: true,
    });
    assert.equal(check.success, false);
    assert.equal(check.stale.length, 1);
    assert.equal(check.stale[0].path, '/agency');
    assert.ok(check.upToDate.includes('/dev'));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('check-mode failures: exits non-zero and reports missing route in dates file', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-missing-test-'));
  try {
    const datesPath = path.join(tmpDir, 'sitemap-dates.json');
    const compFile = 'src/components/MyComp.tsx';

    fs.mkdirSync(path.join(tmpDir, 'src', 'components'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, compFile), 'export const x = 1;\n');

    // Create an empty dates file
    fs.writeFileSync(datesPath, '{}');

    const testRoutes = {
      '/missing': {
        page: compFile,
        files: [compFile],
        namespaces: [],
      },
    };

    const check = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      routes: testRoutes,
      checkMode: true,
    });

    assert.equal(check.success, false);
    assert.equal(check.stale.length, 1);
    assert.equal(check.stale[0].path, '/missing');
    assert.equal(check.stale[0].storedHash, null);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('CLI: node scripts/sitemap-stamp.mjs --check exits with code 0 when clean', async () => {
  const { exec } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const execAsync = promisify(exec);

  const { stdout, stderr } = await execAsync('node scripts/sitemap-stamp.mjs --check');
  assert.match(stdout, /All 9 sitemap paths are up to date/);
  assert.equal(stderr, '');
});

