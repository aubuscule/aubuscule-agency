import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  deriveSitemapRoutes,
  deriveRouteInputs,
  extractSitemapPaths,
  SHARED_CHROME_EXCLUSIONS,
  sitemapRoutes,
} from '../scripts/sitemap-routes.mjs';
import {
  computeRouteHash,
  explainRoute,
  readDatesFile,
  runSitemapStamp,
  getLatestCommitDate,
} from '../scripts/sitemap-stamp.mjs';

test('sitemapRoutes: all 9 routes are automatically derived with page, files, and namespaces', () => {
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

  const derived = deriveSitemapRoutes();
  assert.equal(derived.warnings.length, 0, 'Derived repository routes must have 0 warnings');
  assert.deepEqual(Object.keys(derived.routes).sort(), expectedPaths.sort());

  for (const [p, route] of Object.entries(derived.routes)) {
    assert.ok(typeof route === 'object' && route !== null, `Route ${p} should be an object`);
    assert.ok(route.page, `Route ${p} should have a page file defined`);
    assert.ok(fs.existsSync(route.page), `Route ${p} page ${route.page} must exist on disk`);
    assert.ok(Array.isArray(route.files), `Route ${p} should have files array`);
    assert.ok(route.files.length > 0, `Route ${p} files array must not be empty`);
    assert.ok(Array.isArray(route.namespaces), `Route ${p} should have namespaces array`);
    assert.ok(route.namespaces.length > 0, `Route ${p} must have at least one namespace`);

    // Verify all files in input list exist on disk
    for (const file of route.files) {
      assert.ok(fs.existsSync(file), `Input file ${file} for route "${p}" must exist on disk`);
    }
  }
});

test('shared chrome exclusion: Footer, Nav, and layouts appear in NO route inputs', () => {
  const derived = deriveSitemapRoutes();

  for (const [routePath, route] of Object.entries(derived.routes)) {
    for (const file of route.files) {
      for (const excluded of SHARED_CHROME_EXCLUSIONS) {
        assert.notEqual(
          path.normalize(file),
          path.normalize(excluded),
          `Route "${routePath}" must not include shared chrome file "${excluded}" in its inputs`
        );
      }
      assert.ok(
        !file.endsWith('/app/layout.tsx'),
        `Route "${routePath}" must not include root layout in its inputs`
      );
      assert.ok(
        !file.endsWith('/app/[locale]/layout.tsx'),
        `Route "${routePath}" must not include locale layout in its inputs`
      );
    }
  }
});

test('migration safety: --rebaseline preserves all original dates while updating hashes', () => {
  const dates = readDatesFile('src/lib/sitemap-dates.json');

  const expectedDates = {
    '': '2026-10-22',
    '/agency': '2026-10-24',
    '/products': '2026-10-24',
    '/products/remplate': '2026-10-21',
    '/products/remplate/templates': '2026-10-21',
    '/products/remplate/faq': '2026-10-21',
    '/products/zones-tonales': '2026-10-21',
    '/dev': '2026-10-24',
    '/epk': '2026-10-24',
  };

  for (const [routePath, expectedDate] of Object.entries(expectedDates)) {
    assert.ok(dates[routePath], `Route "${routePath}" must be present in sitemap-dates.json`);
    assert.equal(
      dates[routePath].date,
      expectedDate,
      `Route "${routePath}" date must match expected migration date ${expectedDate}`
    );
    assert.match(dates[routePath].hash, /^[a-f0-9]{64}$/, 'Hash must be a valid 64-character SHA-256 string');
  }

  // Running check mode right now must succeed
  const checkResult = runSitemapStamp({ checkMode: true });
  assert.equal(checkResult.success, true, 'Check mode must pass against committed sitemap-dates.json');
});

test('synthetic fixture: brand-new component imported by a page changes only that route hash with no list edit', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-derive-newcomp-'));
  try {
    fs.mkdirSync(path.join(tmpDir, 'src', 'app', '[locale]', 'a'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'app', '[locale]', 'b'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'components'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'i18n', 'messages'), { recursive: true });

    fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { paths: { '@/*': ['./src/*'] } }
    }));
    fs.writeFileSync(path.join(tmpDir, 'src', 'i18n', 'messages', 'en.json'), JSON.stringify({ a: {}, b: {} }));

    const pageA = path.join(tmpDir, 'src', 'app', '[locale]', 'a', 'page.tsx');
    const pageB = path.join(tmpDir, 'src', 'app', '[locale]', 'b', 'page.tsx');
    const sitemapTs = path.join(tmpDir, 'src', 'app', 'sitemap.ts');

    fs.writeFileSync(pageA, `import { useTranslations } from 'next-intl';\nexport default function Page() { useTranslations('a'); return <div>A</div>; }\n`);
    fs.writeFileSync(pageB, `import { useTranslations } from 'next-intl';\nexport default function Page() { useTranslations('b'); return <div>B</div>; }\n`);
    fs.writeFileSync(sitemapTs, `export const sitemapPaths = ['/a', '/b'] as const;\n`);

    // 1. Initial derivation and hash
    const initialRoutes = deriveSitemapRoutes({ rootDir: tmpDir }).routes;
    const initialHashA = computeRouteHash('/a', initialRoutes['/a'].files, initialRoutes['/a'].namespaces, tmpDir);
    const initialHashB = computeRouteHash('/b', initialRoutes['/b'].files, initialRoutes['/b'].namespaces, tmpDir);

    // 2. Add brand-new component and import into page A only
    const newComp = path.join(tmpDir, 'src', 'components', 'BrandNewComponent.tsx');
    fs.writeFileSync(newComp, `export function BrandNew() { return <span>Brand New</span>; }\n`);
    fs.writeFileSync(pageA, `import { useTranslations } from 'next-intl';\nimport { BrandNew } from '@/components/BrandNewComponent';\nexport default function Page() { useTranslations('a'); return <BrandNew />; }\n`);

    // 3. Re-derive with NO manual list edits
    const updatedRoutes = deriveSitemapRoutes({ rootDir: tmpDir }).routes;
    const updatedHashA = computeRouteHash('/a', updatedRoutes['/a'].files, updatedRoutes['/a'].namespaces, tmpDir);
    const updatedHashB = computeRouteHash('/b', updatedRoutes['/b'].files, updatedRoutes['/b'].namespaces, tmpDir);

    // Route A must have automatically picked up BrandNewComponent.tsx
    assert.ok(updatedRoutes['/a'].files.some(f => f.includes('BrandNewComponent.tsx')));
    assert.notEqual(updatedHashA, initialHashA, 'Route A hash must change after importing new component');

    // Route B must NOT change
    assert.equal(updatedHashB, initialHashB, 'Route B hash must remain unchanged');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('synthetic fixture: component imported by two routes changes both but leaves third route unchanged', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-derive-sharedcomp-'));
  try {
    fs.mkdirSync(path.join(tmpDir, 'src', 'app', '[locale]', 'r1'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'app', '[locale]', 'r2'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'app', '[locale]', 'r3'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'components'), { recursive: true });

    fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { paths: { '@/*': ['./src/*'] } }
    }));
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', 'sitemap.ts'), `export const sitemapPaths = ['/r1', '/r2', '/r3'] as const;\n`);

    const sharedFile = path.join(tmpDir, 'src', 'components', 'SharedBetweenTwo.tsx');
    const comp3File = path.join(tmpDir, 'src', 'components', 'Comp3.tsx');

    fs.writeFileSync(sharedFile, `export const version = 1;\n`);
    fs.writeFileSync(comp3File, `export const comp3 = true;\n`);

    fs.writeFileSync(
      path.join(tmpDir, 'src', 'app', '[locale]', 'r1', 'page.tsx'),
      `import { version } from '@/components/SharedBetweenTwo';\nexport default function Page() { return <div>{version}</div>; }\n`
    );
    fs.writeFileSync(
      path.join(tmpDir, 'src', 'app', '[locale]', 'r2', 'page.tsx'),
      `import { version } from '@/components/SharedBetweenTwo';\nexport default function Page() { return <div>{version}</div>; }\n`
    );
    fs.writeFileSync(
      path.join(tmpDir, 'src', 'app', '[locale]', 'r3', 'page.tsx'),
      `import { comp3 } from '@/components/Comp3';\nexport default function Page() { return <div>{comp3}</div>; }\n`
    );

    const routes1 = deriveSitemapRoutes({ rootDir: tmpDir }).routes;
    const hash1_r1 = computeRouteHash('/r1', routes1['/r1'].files, routes1['/r1'].namespaces, tmpDir);
    const hash1_r2 = computeRouteHash('/r2', routes1['/r2'].files, routes1['/r2'].namespaces, tmpDir);
    const hash1_r3 = computeRouteHash('/r3', routes1['/r3'].files, routes1['/r3'].namespaces, tmpDir);

    // Modify shared component
    fs.writeFileSync(sharedFile, `export const version = 2; // updated\n`);

    const routes2 = deriveSitemapRoutes({ rootDir: tmpDir }).routes;
    const hash2_r1 = computeRouteHash('/r1', routes2['/r1'].files, routes2['/r1'].namespaces, tmpDir);
    const hash2_r2 = computeRouteHash('/r2', routes2['/r2'].files, routes2['/r2'].namespaces, tmpDir);
    const hash2_r3 = computeRouteHash('/r3', routes2['/r3'].files, routes2['/r3'].namespaces, tmpDir);

    assert.notEqual(hash2_r1, hash1_r1, 'Route 1 hash must change');
    assert.notEqual(hash2_r2, hash1_r2, 'Route 2 hash must change');
    assert.equal(hash2_r3, hash1_r3, 'Route 3 hash must NOT change');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('real map test: editing Footer.tsx alone does not change ANY real route hash', () => {
  const footerPath = 'src/components/shared/Footer.tsx';
  const originalFooter = fs.readFileSync(footerPath, 'utf8');

  const baselineRoutes = deriveSitemapRoutes().routes;
  const baselineHashes = {};
  for (const [routePath, route] of Object.entries(baselineRoutes)) {
    baselineHashes[routePath] = computeRouteHash(routePath, route.files, route.namespaces);
  }

  try {
    fs.writeFileSync(footerPath, originalFooter + '\n// test edit to verify chrome exclusion\n', 'utf8');

    const newRoutes = deriveSitemapRoutes().routes;
    for (const [routePath, route] of Object.entries(newRoutes)) {
      const newHash = computeRouteHash(routePath, route.files, route.namespaces);
      assert.equal(
        newHash,
        baselineHashes[routePath],
        `Real route "${routePath || "''"}" hash changed when Footer.tsx was edited`
      );
    }
  } finally {
    fs.writeFileSync(footerPath, originalFooter, 'utf8');
  }
});

test('real map test: editing unrelated namespace in real en.json does not change /dev hash', () => {
  const enJsonPath = 'src/i18n/messages/en.json';
  const originalJson = fs.readFileSync(enJsonPath, 'utf8');
  const parsed = JSON.parse(originalJson);

  const baselineRoutes = deriveSitemapRoutes().routes;
  const baselineDevHash = computeRouteHash('/dev', baselineRoutes['/dev'].files, baselineRoutes['/dev'].namespaces);
  const baselineAgencyHash = computeRouteHash('/agency', baselineRoutes['/agency'].files, baselineRoutes['/agency'].namespaces);

  try {
    const mutated = {
      ...parsed,
      hero: {
        ...parsed.hero,
        headline: 'Modified headline for agency test',
      },
    };
    fs.writeFileSync(enJsonPath, JSON.stringify(mutated, null, 2) + '\n', 'utf8');

    const newRoutes = deriveSitemapRoutes().routes;
    const newDevHash = computeRouteHash('/dev', newRoutes['/dev'].files, newRoutes['/dev'].namespaces);
    const newAgencyHash = computeRouteHash('/agency', newRoutes['/agency'].files, newRoutes['/agency'].namespaces);

    assert.equal(
      newDevHash,
      baselineDevHash,
      '/dev hash must not change when unrelated "hero" namespace is edited in en.json'
    );
    assert.notEqual(
      newAgencyHash,
      baselineAgencyHash,
      '/agency hash must change when its own "hero" namespace is edited in en.json'
    );
  } finally {
    fs.writeFileSync(enJsonPath, originalJson, 'utf8');
  }
});

test('synthetic fixture: non-literal useTranslations argument produces warning and fails check', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-dyn-warning-'));
  try {
    fs.mkdirSync(path.join(tmpDir, 'src', 'app', '[locale]', 'test'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'i18n', 'messages'), { recursive: true });

    fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { paths: { '@/*': ['./src/*'] } }
    }));
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', 'sitemap.ts'), `export const sitemapPaths = ['/test'] as const;\n`);
    fs.writeFileSync(path.join(tmpDir, 'src', 'i18n', 'messages', 'en.json'), JSON.stringify({}));

    // Dynamic namespace without comment
    const pageCode = `import { useTranslations } from 'next-intl';\nconst key = 'dynamicKey';\nexport default function Page() {\n  const t = useTranslations(key);\n  return <div>Test</div>;\n}\n`;
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', '[locale]', 'test', 'page.tsx'), pageCode);

    const derived = deriveSitemapRoutes({ rootDir: tmpDir });
    assert.equal(derived.warnings.length, 1, 'Expected 1 warning for non-literal namespace');
    assert.equal(derived.warnings[0].line, 4);
    assert.equal(derived.warnings[0].call, 'useTranslations');

    const datesPath = path.join(tmpDir, 'sitemap-dates.json');
    const hash = computeRouteHash('/test', derived.routes['/test'].files, derived.routes['/test'].namespaces, tmpDir);
    fs.writeFileSync(datesPath, JSON.stringify({ '/test': { hash, date: '2026-11-05' } }));

    const checkResult = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      checkMode: true,
      routes: derived.routes,
      warnings: derived.warnings,
    });
    assert.equal(checkResult.success, false, 'Check mode must fail when unresolvable namespace warnings exist');
    assert.equal(checkResult.warnings.length, 1);
    assert.equal(checkResult.stale.length, 0, 'Hashes themselves were matching, check failed on warnings');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('synthetic fixture: adjacent // sitemap-namespace comment resolves non-literal namespace', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-dyn-resolved-'));
  try {
    fs.mkdirSync(path.join(tmpDir, 'src', 'app', '[locale]', 'test'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'i18n', 'messages'), { recursive: true });

    fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { paths: { '@/*': ['./src/*'] } }
    }));
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', 'sitemap.ts'), `export const sitemapPaths = ['/test'] as const;\n`);
    fs.writeFileSync(path.join(tmpDir, 'src', 'i18n', 'messages', 'en.json'), JSON.stringify({ customNs: {} }));

    // Dynamic namespace WITH adjacent comment
    const pageCode = `import { useTranslations } from 'next-intl';\nconst key = 'dynamicKey';\nexport default function Page() {\n  // sitemap-namespace: customNs\n  const t = useTranslations(key);\n  return <div>Test</div>;\n}\n`;
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', '[locale]', 'test', 'page.tsx'), pageCode);

    const derived = deriveSitemapRoutes({ rootDir: tmpDir });
    assert.equal(derived.warnings.length, 0, 'Comment must resolve the dynamic namespace with 0 warnings');
    assert.deepEqual(derived.routes['/test'].namespaces, ['customNs']);
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

    // 1. Check mode must fail on orphaned route
    const checkResult = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      routes: testRoutes,
      checkMode: true,
    });
    assert.equal(checkResult.success, false);
    assert.equal(checkResult.stale.length, 1);
    assert.equal(checkResult.stale[0].path, '/obsolete-route');
    assert.equal(checkResult.stale[0].orphan, true);

    // 2. Stamp mode prunes orphaned route
    const stampResult = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      routes: testRoutes,
      checkMode: false,
    });
    assert.equal(stampResult.success, true);
    assert.ok(stampResult.pruned.includes('/obsolete-route'));

    const savedDates = readDatesFile(datesPath);
    assert.ok(savedDates['/active'], 'Active route should remain');
    assert.equal(savedDates['/obsolete-route'], undefined, 'Obsolete route must be pruned');

    // 3. Check mode now passes
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

test('corrupt dates file: corrupt sitemap-dates.json throws loudly', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-corrupt-test-'));
  try {
    const datesPath = path.join(tmpDir, 'sitemap-dates.json');
    fs.writeFileSync(datesPath, '{ not valid json syntax ...\n', 'utf8');

    assert.throws(
      () => runSitemapStamp({ rootDir: tmpDir, datesPath, routes: {} }),
      /Corrupted sitemap dates file/
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('sitemap route validation: route with missing page.tsx throws loudly', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-missing-page-'));
  try {
    fs.mkdirSync(path.join(tmpDir, 'src', 'app'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify({}));
    fs.writeFileSync(
      path.join(tmpDir, 'src', 'app', 'sitemap.ts'),
      `export const sitemapPaths = ['/non-existent'] as const;\n`
    );

    assert.throws(
      () => deriveSitemapRoutes({ rootDir: tmpDir }),
      /Route "\/non-existent" in sitemap\.ts has no matching page\.tsx/
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('--explain: explainRoute prints route details and returns expected files and namespaces', () => {
  const explained = explainRoute('/dev');
  assert.equal(explained.route, '/dev');
  assert.equal(explained.page, 'src/app/[locale]/dev/page.tsx');
  assert.ok(explained.files.includes('src/components/dev/DevHero.tsx'));
  assert.ok(explained.files.includes('src/components/dev/dev.css'));
  assert.ok(explained.namespaces.includes('dev'));
  assert.equal(explained.warnings.length, 0);
});

test('getLatestCommitDate: uses argv array and resolves git commit dates without shell globbing', () => {
  const files = ['src/app/[locale]/page.tsx'];
  const date = getLatestCommitDate(files);
  assert.match(date, /^\d{4}-\d{2}-\d{2}$/, 'Should return a valid YYYY-MM-DD date from git');

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
