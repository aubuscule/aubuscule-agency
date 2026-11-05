import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
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

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

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

  const derived = deriveSitemapRoutes({ rootDir: REPO_ROOT });
  assert.equal(derived.warnings.length, 0, 'Derived repository routes must have 0 warnings');
  assert.deepEqual(Object.keys(derived.routes).sort(), expectedPaths.sort());

  for (const [p, route] of Object.entries(derived.routes)) {
    assert.ok(typeof route === 'object' && route !== null, `Route ${p} should be an object`);
    assert.ok(route.page, `Route ${p} should have a page file defined`);
    assert.ok(fs.existsSync(path.resolve(REPO_ROOT, route.page)), `Route ${p} page ${route.page} must exist on disk`);
    assert.ok(Array.isArray(route.files), `Route ${p} should have files array`);
    assert.ok(route.files.length > 0, `Route ${p} files array must not be empty`);
    assert.ok(Array.isArray(route.namespaces), `Route ${p} should have namespaces array`);
    assert.ok(route.namespaces.length > 0, `Route ${p} must have at least one namespace`);

    // Verify all files in input list exist on disk
    for (const file of route.files) {
      assert.ok(fs.existsSync(path.resolve(REPO_ROOT, file)), `Input file ${file} for route "${p}" must exist on disk`);
    }
  }
});

test('shared chrome exclusion: Footer, Nav, and layouts appear in NO route inputs', () => {
  const derived = deriveSitemapRoutes({ rootDir: REPO_ROOT });

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

test('migration safety: committed sitemap-dates.json preserves all baseline dates', () => {
  const dates = readDatesFile(path.join(REPO_ROOT, 'src', 'lib', 'sitemap-dates.json'));

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

  // Running check mode against committed dates must succeed
  const checkResult = runSitemapStamp({ rootDir: REPO_ROOT, checkMode: true });
  assert.equal(checkResult.success, true, 'Check mode must pass against committed sitemap-dates.json');
});

test('migration safety: temp-dir test runs runSitemapStamp with rebaselineMode and asserts dates unchanged and hashes updated', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-rebaseline-test-'));
  try {
    const datesPath = path.join(tmpDir, 'sitemap-dates.json');
    const compFile = 'src/components/Comp.tsx';

    fs.mkdirSync(path.join(tmpDir, 'src', 'components'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, compFile), 'export const x = "initial";\n');

    const fakeOldHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const initialDates = {
      '/route1': {
        hash: fakeOldHash,
        date: '2026-05-15',
      },
    };
    fs.writeFileSync(datesPath, JSON.stringify(initialDates, null, 2) + '\n');

    const testRoutes = {
      '/route1': {
        page: compFile,
        files: [compFile],
        namespaces: [],
      },
    };

    const rebaselineResult = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      routes: testRoutes,
      rebaselineMode: true,
    });

    assert.equal(rebaselineResult.success, true);
    assert.equal(rebaselineResult.changed.length, 1);
    assert.equal(rebaselineResult.changed[0].newDate, '2026-05-15', 'Date must be strictly preserved');
    assert.notEqual(rebaselineResult.changed[0].newHash, fakeOldHash, 'Hash must be updated');

    const saved = readDatesFile(datesPath);
    assert.equal(saved['/route1'].date, '2026-05-15');
    assert.notEqual(saved['/route1'].hash, fakeOldHash);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('hermetic test: editing Footer.tsx in temp fixture does not change route hash', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-footer-hermetic-'));
  try {
    fs.mkdirSync(path.join(tmpDir, 'src', 'app', '[locale]', 'page'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'components', 'shared'), { recursive: true });

    fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { paths: { '@/*': ['./src/*'] } }
    }));
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', 'sitemap.ts'), `export const sitemapPaths = ['/page'] as const;\n`);

    const pageFile = path.join(tmpDir, 'src', 'app', '[locale]', 'page', 'page.tsx');
    const footerFile = path.join(tmpDir, 'src', 'components', 'shared', 'Footer.tsx');

    fs.writeFileSync(footerFile, 'export function Footer() { return <footer>Footer v1</footer>; }\n');
    // Page renders content; layout or shared chrome references footer
    fs.writeFileSync(pageFile, 'export default function Page() { return <div>Page Content</div>; }\n');

    const routes1 = deriveSitemapRoutes({ rootDir: tmpDir }).routes;
    const hash1 = computeRouteHash('/page', routes1['/page'].files, routes1['/page'].namespaces, tmpDir);

    // Edit Footer.tsx in the temp dir
    fs.writeFileSync(footerFile, 'export function Footer() { return <footer>Footer v2 modified</footer>; }\n');

    const routes2 = deriveSitemapRoutes({ rootDir: tmpDir }).routes;
    const hash2 = computeRouteHash('/page', routes2['/page'].files, routes2['/page'].namespaces, tmpDir);

    assert.equal(hash1, hash2, 'Route hash must remain identical when Footer.tsx is edited');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('hermetic test: editing unrelated namespace in en.json does not change other route hash', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-ns-hermetic-'));
  try {
    fs.mkdirSync(path.join(tmpDir, 'src', 'app', '[locale]', 'dev'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'app', '[locale]', 'agency'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'i18n', 'messages'), { recursive: true });

    fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { paths: { '@/*': ['./src/*'] } }
    }));
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', 'sitemap.ts'), `export const sitemapPaths = ['/dev', '/agency'] as const;\n`);

    const enJson = path.join(tmpDir, 'src', 'i18n', 'messages', 'en.json');
    fs.writeFileSync(
      enJson,
      JSON.stringify({
        dev: { title: 'Developer' },
        agency: { title: 'Agency Services' },
      })
    );

    fs.writeFileSync(
      path.join(tmpDir, 'src', 'app', '[locale]', 'dev', 'page.tsx'),
      `import { useTranslations } from 'next-intl';\nexport default function DevPage() { useTranslations('dev'); return <div>Dev</div>; }\n`
    );
    fs.writeFileSync(
      path.join(tmpDir, 'src', 'app', '[locale]', 'agency', 'page.tsx'),
      `import { useTranslations } from 'next-intl';\nexport default function AgencyPage() { useTranslations('agency'); return <div>Agency</div>; }\n`
    );

    const routes1 = deriveSitemapRoutes({ rootDir: tmpDir }).routes;
    const devHash1 = computeRouteHash('/dev', routes1['/dev'].files, routes1['/dev'].namespaces, tmpDir);
    const agencyHash1 = computeRouteHash('/agency', routes1['/agency'].files, routes1['/agency'].namespaces, tmpDir);

    // Mutate only agency namespace in en.json
    fs.writeFileSync(
      enJson,
      JSON.stringify({
        dev: { title: 'Developer' },
        agency: { title: 'Agency Services MODIFIED' },
      })
    );

    const routes2 = deriveSitemapRoutes({ rootDir: tmpDir }).routes;
    const devHash2 = computeRouteHash('/dev', routes2['/dev'].files, routes2['/dev'].namespaces, tmpDir);
    const agencyHash2 = computeRouteHash('/agency', routes2['/agency'].files, routes2['/agency'].namespaces, tmpDir);

    assert.equal(devHash2, devHash1, 'Dev hash must NOT change when agency namespace in en.json is mutated');
    assert.notEqual(agencyHash2, agencyHash1, 'Agency hash MUST change when its own namespace is mutated');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('regression test: non-i18n JSON (e.g. data.json) is hashed verbatim, not as empty object', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-json-verbatim-'));
  try {
    fs.mkdirSync(path.join(tmpDir, 'src', 'app', '[locale]', 'data-page'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'app', '[locale]', 'other-page'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'lib'), { recursive: true });

    fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { paths: { '@/*': ['./src/*'] } }
    }));
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', 'sitemap.ts'), `export const sitemapPaths = ['/data-page', '/other-page'] as const;\n`);

    const dataJson = path.join(tmpDir, 'src', 'lib', 'data.json');
    fs.writeFileSync(dataJson, JSON.stringify({ items: [1, 2, 3], version: '1.0' }) + '\n');

    fs.writeFileSync(
      path.join(tmpDir, 'src', 'app', '[locale]', 'data-page', 'page.tsx'),
      `import data from '@/lib/data.json';\nexport default function Page() { return <div>{data.version}</div>; }\n`
    );
    fs.writeFileSync(
      path.join(tmpDir, 'src', 'app', '[locale]', 'other-page', 'page.tsx'),
      `export default function Page() { return <div>Other</div>; }\n`
    );

    const routes1 = deriveSitemapRoutes({ rootDir: tmpDir }).routes;
    assert.ok(routes1['/data-page'].files.some(f => f.includes('data.json')), 'data.json must be in derived files');

    const dataHash1 = computeRouteHash('/data-page', routes1['/data-page'].files, routes1['/data-page'].namespaces, tmpDir);
    const otherHash1 = computeRouteHash('/other-page', routes1['/other-page'].files, routes1['/other-page'].namespaces, tmpDir);

    // Edit data.json
    fs.writeFileSync(dataJson, JSON.stringify({ items: [1, 2, 3, 4], version: '2.0' }) + '\n');

    const routes2 = deriveSitemapRoutes({ rootDir: tmpDir }).routes;
    const dataHash2 = computeRouteHash('/data-page', routes2['/data-page'].files, routes2['/data-page'].namespaces, tmpDir);
    const otherHash2 = computeRouteHash('/other-page', routes2['/other-page'].files, routes2['/other-page'].namespaces, tmpDir);

    assert.notEqual(dataHash2, dataHash1, 'Editing non-i18n data.json must change the route hash');
    assert.equal(otherHash2, otherHash1, 'Other page hash must not change');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
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

    const initialRoutes = deriveSitemapRoutes({ rootDir: tmpDir }).routes;
    const initialHashA = computeRouteHash('/a', initialRoutes['/a'].files, initialRoutes['/a'].namespaces, tmpDir);
    const initialHashB = computeRouteHash('/b', initialRoutes['/b'].files, initialRoutes['/b'].namespaces, tmpDir);

    // Add brand-new component and import into page A only
    const newComp = path.join(tmpDir, 'src', 'components', 'BrandNewComponent.tsx');
    fs.writeFileSync(newComp, `export function BrandNew() { return <span>Brand New</span>; }\n`);
    fs.writeFileSync(pageA, `import { useTranslations } from 'next-intl';\nimport { BrandNew } from '@/components/BrandNewComponent';\nexport default function Page() { useTranslations('a'); return <BrandNew />; }\n`);

    // Re-derive with NO manual list edits
    const updatedRoutes = deriveSitemapRoutes({ rootDir: tmpDir }).routes;
    const updatedHashA = computeRouteHash('/a', updatedRoutes['/a'].files, updatedRoutes['/a'].namespaces, tmpDir);
    const updatedHashB = computeRouteHash('/b', updatedRoutes['/b'].files, updatedRoutes['/b'].namespaces, tmpDir);

    assert.ok(updatedRoutes['/a'].files.some(f => f.includes('BrandNewComponent.tsx')));
    assert.notEqual(updatedHashA, initialHashA, 'Route A hash must change after importing new component');
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

test('synthetic fixture: dynamic import(), barrel export *, CSS import, and type-only import are handled', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-imports-test-'));
  try {
    fs.mkdirSync(path.join(tmpDir, 'src', 'app', '[locale]', 'feature'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'components', 'barrel'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'types'), { recursive: true });

    fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { paths: { '@/*': ['./src/*'] } }
    }));
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', 'sitemap.ts'), `export const sitemapPaths = ['/feature'] as const;\n`);

    // CSS file
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', '[locale]', 'feature', 'style.css'), 'body { color: blue; }\n');

    // Type-only file
    fs.writeFileSync(path.join(tmpDir, 'src', 'types', 'model.ts'), 'export interface MyModel { id: string; }\n');

    // Lazy component
    fs.writeFileSync(path.join(tmpDir, 'src', 'components', 'LazyWidget.tsx'), 'export default function LazyWidget() { return <div>Lazy</div>; }\n');

    // Barrel component
    fs.writeFileSync(path.join(tmpDir, 'src', 'components', 'barrel', 'ActualWidget.tsx'), 'export function ActualWidget() { return <span>Actual</span>; }\n');
    fs.writeFileSync(path.join(tmpDir, 'src', 'components', 'barrel', 'index.ts'), 'export * from "./ActualWidget";\n');

    // Page importing CSS, type, barrel, and dynamic import
    const pageCode = `
import './style.css';
import type { MyModel } from '@/types/model';
import { ActualWidget } from '@/components/barrel';

const LazyComp = dynamic(() => import('@/components/LazyWidget'));

export default function FeaturePage() {
  return <div><ActualWidget /></div>;
}
`;
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', '[locale]', 'feature', 'page.tsx'), pageCode);

    const derived = deriveSitemapRoutes({ rootDir: tmpDir });
    const files = derived.routes['/feature'].files;

    assert.ok(files.some(f => f.includes('style.css')), 'CSS import must be in derived files');
    assert.ok(files.some(f => f.includes('LazyWidget.tsx')), 'Dynamic import must be in derived files');
    assert.ok(files.some(f => f.includes('ActualWidget.tsx')), 'Barrel export * must be in derived files');
    assert.ok(files.some(f => f.includes('model.ts')), 'Type-only import must be in derived files');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('synthetic fixture: next-intl aliased imports and namespace objects are tracked', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-aliased-intl-'));
  try {
    fs.mkdirSync(path.join(tmpDir, 'src', 'app', '[locale]', 'intl-test'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'i18n', 'messages'), { recursive: true });

    fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { paths: { '@/*': ['./src/*'] } }
    }));
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', 'sitemap.ts'), `export const sitemapPaths = ['/intl-test'] as const;\n`);
    fs.writeFileSync(path.join(tmpDir, 'src', 'i18n', 'messages', 'en.json'), JSON.stringify({ hero: {}, meta: {} }));

    const pageCode = `
import { useTranslations as useT } from 'next-intl';
import * as serverIntl from 'next-intl/server';

export default function Page() {
  const t = useT('hero');
  const tMeta = serverIntl.getTranslations({ namespace: 'meta' });
  return <div>Intl</div>;
}
`;
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', '[locale]', 'intl-test', 'page.tsx'), pageCode);

    const derived = deriveSitemapRoutes({ rootDir: tmpDir });
    assert.equal(derived.warnings.length, 0, 'Aliased next-intl calls must be detected with 0 warnings');
    assert.deepEqual(derived.routes['/intl-test'].namespaces, ['hero', 'meta']);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('synthetic fixture: unresolvable next-intl call produces warning and fails check and stamp modes', () => {
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
    const pageCode = `import { useTranslations as useT } from 'next-intl';\nconst key = 'dynamicKey';\nexport default function Page() {\n  const t = useT(key);\n  return <div>Test</div>;\n}\n`;
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', '[locale]', 'test', 'page.tsx'), pageCode);

    const derived = deriveSitemapRoutes({ rootDir: tmpDir });
    assert.equal(derived.warnings.length, 1, 'Expected 1 warning for non-literal namespace');
    assert.equal(derived.warnings[0].line, 4);
    assert.equal(derived.warnings[0].call, 'useT');

    const datesPath = path.join(tmpDir, 'sitemap-dates.json');
    const hash = computeRouteHash('/test', derived.routes['/test'].files, derived.routes['/test'].namespaces, tmpDir);
    fs.writeFileSync(datesPath, JSON.stringify({ '/test': { hash, date: '2026-11-05' } }));

    // 1. checkMode must fail
    const checkResult = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      checkMode: true,
      routes: derived.routes,
      warnings: derived.warnings,
    });
    assert.equal(checkResult.success, false, 'Check mode must fail when unresolvable namespace warnings exist');

    // 2. stampMode must fail and NOT write dates
    const stampResult = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      checkMode: false,
      routes: derived.routes,
      warnings: derived.warnings,
    });
    assert.equal(stampResult.success, false, 'Stamp mode must fail when unresolvable namespace warnings exist');
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

    const pageCode = `import { useTranslations } from 'next-intl';\nconst key = 'dynamicKey';\nexport default function Page() {\n  // sitemap-namespace: customNs\n  const t = useTranslations(key);\n  return <div>Test</div>;\n}\n`;
    fs.writeFileSync(path.join(tmpDir, 'src', 'app', '[locale]', 'test', 'page.tsx'), pageCode);

    const derived = deriveSitemapRoutes({ rootDir: tmpDir });
    assert.equal(derived.warnings.length, 0, 'Comment must resolve the dynamic namespace with 0 warnings');
    assert.deepEqual(derived.routes['/test'].namespaces, ['customNs']);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('missing date entry: check mode flags missing route and sitemap.ts omits lastModified', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-missing-entry-'));
  try {
    const datesPath = path.join(tmpDir, 'sitemap-dates.json');
    const compFile = 'src/components/Comp.tsx';

    fs.mkdirSync(path.join(tmpDir, 'src', 'components'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, compFile), 'export const a = 1;\n');

    // Only route1 is in dates JSON; route2 has no entry
    const initialDates = {
      '/route1': {
        hash: computeRouteHash('/route1', [compFile], [], tmpDir),
        date: '2026-10-01',
      },
    };
    fs.writeFileSync(datesPath, JSON.stringify(initialDates, null, 2) + '\n');

    const testRoutes = {
      '/route1': { page: compFile, files: [compFile], namespaces: [] },
      '/route2': { page: compFile, files: [compFile], namespaces: [] },
    };

    const checkResult = runSitemapStamp({
      rootDir: tmpDir,
      datesPath,
      routes: testRoutes,
      checkMode: true,
    });

    assert.equal(checkResult.success, false, 'Check mode must fail when a route has no entry in dates file');
    const missing = checkResult.stale.find(s => s.path === '/route2');
    assert.ok(missing, 'Missing route must be in stale list');
    assert.equal(missing.missing, true);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('binary file hashing: reads non-text files as Buffer for hashing', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-binary-hash-'));
  try {
    const imgPath = path.join(tmpDir, 'image.png');
    // Buffer with binary bytes
    const buf1 = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    fs.writeFileSync(imgPath, buf1);

    const hash1 = computeRouteHash('/img', ['image.png'], [], tmpDir);
    assert.match(hash1, /^[a-f0-9]{64}$/);

    const buf2 = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x01]);
    fs.writeFileSync(imgPath, buf2);

    const hash2 = computeRouteHash('/img', ['image.png'], [], tmpDir);
    assert.notEqual(hash1, hash2, 'Changing binary file byte must change hash');
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
  const explained = explainRoute('/dev', { rootDir: REPO_ROOT });
  assert.equal(explained.route, '/dev');
  assert.equal(explained.page, 'src/app/[locale]/dev/page.tsx');
  assert.ok(explained.files.includes('src/components/dev/DevHero.tsx'));
  assert.ok(explained.files.includes('src/components/dev/dev.css'));
  assert.ok(explained.namespaces.includes('dev'));
  assert.equal(explained.warnings.length, 0);
});

test('--explain: CLI path runs cleanly and prints route audit', () => {
  const stdout = execFileSync(
    process.execPath,
    ['scripts/sitemap-stamp.mjs', '--explain', '/dev'],
    { cwd: REPO_ROOT, encoding: 'utf8' }
  );
  assert.match(stdout, /Sitemap Route Audit: "\/dev"/);
  assert.match(stdout, /Derived files/);
  assert.match(stdout, /Derived i18n namespaces/);
  assert.match(stdout, /src\/components\/dev\/DevHero\.tsx/);
});

test('getLatestCommitDate: uses argv array and resolves git commit dates without shell globbing', (t) => {
  try {
    const files = ['src/app/[locale]/page.tsx'];
    const date = getLatestCommitDate(files, REPO_ROOT);
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/, 'Should return a valid YYYY-MM-DD date from git');
  } catch (err) {
    if (
      err.message.includes('No git commit found') ||
      err.message.includes('Failed to determine latest commit date')
    ) {
      t.skip('Skipping git-date test: git history is unavailable or shallow in this environment');
      return;
    }
    throw err;
  }

  assert.throws(
    () => getLatestCommitDate(['non_existent_file_xyz_123.ts'], REPO_ROOT),
    /Failed to determine latest commit date|No git commit found/
  );
});

test('CLI: node scripts/sitemap-stamp.mjs --check exits with code 0 when clean', () => {
  const stdout = execFileSync(
    process.execPath,
    ['scripts/sitemap-stamp.mjs', '--check'],
    { cwd: REPO_ROOT, encoding: 'utf8' }
  );
  assert.match(stdout, /All 9 sitemap paths are up to date/);
});

test('simplicity: sitemap-routes.mjs does not import typescript compiler API', () => {
  const code = fs.readFileSync(path.join(REPO_ROOT, 'scripts', 'sitemap-routes.mjs'), 'utf8');
  assert.ok(!code.includes("from 'typescript'"), 'sitemap-routes.mjs must not import typescript');
  assert.ok(!code.includes('require("typescript")') && !code.includes("require('typescript')"), 'sitemap-routes.mjs must not require typescript');
});

