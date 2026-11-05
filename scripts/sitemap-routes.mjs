/**
 * Sitemap Routes and Input Graph Derivation
 *
 * Automatically builds each route's input file set and next-intl namespaces
 * by transitively scanning imports starting from each route's page.tsx and
 * route-specific layout.tsx under src/app/[locale]/<route>/.
 *
 * ============================================================================
 * EXCLUSION POLICY
 * ============================================================================
 * The following shared chrome files are deliberately EXCLUDED from all route graphs:
 *   - src/components/shared/Footer.tsx   (Sitewide footer)
 *   - src/components/shared/Nav.tsx      (Sitewide sticky navigation)
 *   - src/app/layout.tsx                 (Root application layout)
 *   - src/app/[locale]/layout.tsx        (Locale-level layout)
 *   - src/app/globals.css                (Global CSS tokens and reset)
 *
 * Rationale:
 * Modifying global chrome represents a chrome/theming update rather than a
 * content change to specific pages. Including shared chrome would artificially bump
 * lastmod dates across the entire site whenever any global component is touched.
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_ROOT = fileURLToPath(new URL('..', import.meta.url));

export const SHARED_CHROME_EXCLUSIONS = [
  'src/components/shared/Footer.tsx',
  'src/components/shared/Nav.tsx',
  'src/app/layout.tsx',
  'src/app/[locale]/layout.tsx',
  'src/app/globals.css',
];

export const I18N_MESSAGES = [
  'src/i18n/messages/en.json',
  'src/i18n/messages/fr.json',
  'src/i18n/messages/nl.json',
];

/**
 * Resolves a module specifier to a relative file path in the workspace.
 */
export function resolveModule(specifier, containingFile, rootDir = DEFAULT_ROOT) {
  let targetPath;
  if (specifier.startsWith('@/')) {
    targetPath = path.join(rootDir, 'src', specifier.slice(2));
  } else if (specifier.startsWith('.')) {
    const containingFull = path.resolve(rootDir, containingFile);
    targetPath = path.resolve(path.dirname(containingFull), specifier);
  } else {
    return null;
  }

  const candidates = [
    targetPath,
    targetPath + '.tsx',
    targetPath + '.ts',
    targetPath + '.jsx',
    targetPath + '.js',
    targetPath + '.css',
    targetPath + '.json',
    path.join(targetPath, 'index.tsx'),
    path.join(targetPath, 'index.ts'),
    path.join(targetPath, 'index.js'),
  ];

  for (const cand of candidates) {
    if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
      const rel = path.relative(rootDir, cand).replace(/\\/g, '/');
      if (!rel.startsWith('node_modules') && !rel.includes('/node_modules/')) {
        return rel;
      }
    }
  }

  return null;
}

/**
 * Extracts route paths from src/app/sitemap.ts.
 */
export function extractSitemapPaths(sitemapFile = 'src/app/sitemap.ts', rootDir = DEFAULT_ROOT) {
  const fullPath = path.resolve(rootDir, sitemapFile);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Sitemap file not found: ${fullPath}`);
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const match = content.match(/(?:sitemapPaths|paths)\s*=\s*\[([\s\S]*?)\]/);
  if (!match) {
    throw new Error(`Could not find "sitemapPaths" or "paths" array in ${fullPath}`);
  }

  const paths = [];
  const strMatches = match[1].matchAll(/['"`](.*?)['"`]/g);
  for (const m of strMatches) {
    paths.push(m[1]);
  }
  return paths;
}

/**
 * Finds all route-specific layout files along the route hierarchy
 * under src/app/[locale]/<route>/, strictly excluding root and [locale] layouts.
 */
export function findRouteLayouts(routePath, rootDir = DEFAULT_ROOT) {
  const layouts = [];
  if (!routePath) return layouts;

  const segments = routePath.split('/').filter(Boolean);
  let currentPath = '';

  for (const seg of segments) {
    currentPath += '/' + seg;
    const layoutRel = path.posix.join('src/app/[locale]', currentPath.slice(1), 'layout.tsx');
    const layoutFull = path.resolve(rootDir, layoutRel);
    if (fs.existsSync(layoutFull)) {
      layouts.push(layoutRel);
    }
  }

  return layouts;
}

function handleIntlCall(fn, arg, lineIndex, lineText, lines, file, routePath, namespaces, warnings) {
  // Case 1: String literal 'namespace'
  const strMatch = arg.match(/^['"]([^'"]+)['"]/);
  if (strMatch) {
    namespaces.add(strMatch[1].split('.')[0]);
    return;
  }

  // Case 2: Object { namespace: 'namespace' }
  const objMatch = arg.match(/namespace\s*:\s*['"]([^'"]+)['"]/);
  if (objMatch) {
    namespaces.add(objMatch[1].split('.')[0]);
    return;
  }

  // Case 3: Check adjacent comment // sitemap-namespace: customNs
  const checkLines = [lineText];
  if (lineIndex > 0) checkLines.unshift(lines[lineIndex - 1]);
  for (const cl of checkLines) {
    const commentMatch = cl.match(/(?:\/\/|\/\*)\s*sitemap-namespace:\s*([^\r\n*]+)/);
    if (commentMatch) {
      const declared = commentMatch[1].split(',').map((s) => s.trim().split('.')[0]).filter(Boolean);
      for (const ns of declared) namespaces.add(ns);
      return;
    }
  }

  // Unresolvable: record warning
  const warning = {
    file,
    line: lineIndex + 1,
    call: fn,
    route: routePath,
    message: `Non-literal or unresolvable namespace in ${fn}() at ${file}:${lineIndex + 1}`,
  };
  warnings.push(warning);
  console.warn(
    `[sitemap:warn] ${file}:${lineIndex + 1} - Dynamic/non-literal namespace in ${fn}() call for route "${routePath}". Declare with comment: // sitemap-namespace: <namespaces>`
  );
}

/**
 * Derives the complete input file set and i18n namespaces for a single route.
 */
export function deriveRouteInputs(routePath, options = {}) {
  const rootDir = options.rootDir || DEFAULT_ROOT;
  const exclusions = new Set((options.exclusions || SHARED_CHROME_EXCLUSIONS).map((f) => path.normalize(f)));

  const pageRel = routePath === ''
    ? 'src/app/[locale]/page.tsx'
    : path.posix.join('src/app/[locale]', routePath.slice(1), 'page.tsx');
  const pageFull = path.resolve(rootDir, pageRel);

  if (!fs.existsSync(pageFull)) {
    throw new Error(`Route "${routePath}" in sitemap.ts has no matching page.tsx at ${pageRel}`);
  }

  const startFiles = [pageRel];
  const routeLayouts = findRouteLayouts(routePath, rootDir);
  for (const layout of routeLayouts) {
    if (!exclusions.has(path.normalize(layout))) {
      startFiles.push(layout);
    }
  }

  const visited = new Set();
  const queue = [...startFiles];
  const graphFiles = [];
  const namespaces = new Set();
  const warnings = [];

  while (queue.length > 0) {
    const cur = queue.shift();
    const curNorm = path.normalize(cur);
    if (visited.has(curNorm)) continue;
    visited.add(curNorm);

    if (exclusions.has(curNorm)) continue;

    graphFiles.push(cur);

    if (cur.endsWith('.css') || cur.endsWith('.json')) {
      continue;
    }

    const fullPath = path.resolve(rootDir, cur);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');

    // 1. Scan for next-intl translation function names and aliases
    const intlFns = new Set(['useTranslations', 'getTranslations']);
    const intlNamespaces = new Set();

    const namedIntlRegex = /import\s*\{([^}]+)\}\s*from\s*['"]next-intl(?:\/[^'"]+)?['"]/g;
    for (const match of content.matchAll(namedIntlRegex)) {
      for (const part of match[1].split(',')) {
        const trimmed = part.trim();
        const aliasMatch = trimmed.match(/^(\w+)\s+as\s+(\w+)$/);
        if (aliasMatch) {
          if (aliasMatch[1] === 'useTranslations' || aliasMatch[1] === 'getTranslations') {
            intlFns.add(aliasMatch[2]);
          }
        } else if (trimmed === 'useTranslations' || trimmed === 'getTranslations') {
          intlFns.add(trimmed);
        }
      }
    }

    const nsIntlRegex = /import\s*\*\s*as\s+(\w+)\s+from\s*['"]next-intl(?:\/[^'"]+)?['"]/g;
    for (const match of content.matchAll(nsIntlRegex)) {
      intlNamespaces.add(match[1]);
    }

    // 2. Scan lines for next-intl calls & namespaces
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const fn of intlFns) {
        const callRegex = new RegExp(`\\b${fn}\\s*\\(([^)]*)\\)`, 'g');
        for (const callMatch of line.matchAll(callRegex)) {
          const arg = callMatch[1].trim();
          handleIntlCall(fn, arg, i, line, lines, cur, routePath, namespaces, warnings);
        }
      }
      for (const ns of intlNamespaces) {
        const callRegex = new RegExp(`\\b${ns}\\.(useTranslations|getTranslations)\\s*\\(([^)]*)\\)`, 'g');
        for (const callMatch of line.matchAll(callRegex)) {
          const fn = `${ns}.${callMatch[1]}`;
          const arg = callMatch[2].trim();
          handleIntlCall(fn, arg, i, line, lines, cur, routePath, namespaces, warnings);
        }
      }
    }

    // 3. Scan for imported and exported module paths
    const importRegexes = [
      /import\s+['"]([^'"]+)['"]/g,
      /import\s+(?:type\s+)?[\w*\s{},]+\s+from\s+['"]([^'"]+)['"]/g,
      /export\s+(?:type\s+)?[\w*\s{},]+\s+from\s+['"]([^'"]+)['"]/g,
      /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    ];
    for (const re of importRegexes) {
      for (const match of content.matchAll(re)) {
        const spec = match[1];
        if (spec) {
          const resolved = resolveModule(spec, cur, rootDir);
          if (resolved) {
            const resolvedNorm = path.normalize(resolved);
            if (!exclusions.has(resolvedNorm) && !visited.has(resolvedNorm)) {
              queue.push(resolved);
            }
          }
        }
      }
    }
  }

  const existingI18n = I18N_MESSAGES.filter((f) => fs.existsSync(path.resolve(rootDir, f)));
  const allFiles = Array.from(new Set([...graphFiles, ...existingI18n])).sort();
  const sortedNamespaces = Array.from(namespaces).sort();

  return {
    route: routePath,
    page: pageRel,
    files: allFiles,
    namespaces: sortedNamespaces,
    warnings,
  };
}

/**
 * Derives the sitemapRoutes dictionary for all routes defined in sitemap.ts.
 */
export function deriveSitemapRoutes(options = {}) {
  const rootDir = options.rootDir || DEFAULT_ROOT;
  const sitemapFile = options.sitemapFile || 'src/app/sitemap.ts';
  const paths = options.paths || extractSitemapPaths(sitemapFile, rootDir);

  const routes = {};
  const allWarnings = [];

  for (const routePath of paths) {
    const entry = deriveRouteInputs(routePath, {
      ...options,
      rootDir,
    });
    routes[routePath] = {
      page: entry.page,
      files: entry.files,
      namespaces: entry.namespaces,
    };
    allWarnings.push(...entry.warnings);
  }

  return { routes, warnings: allWarnings };
}

let _defaultRoutes = null;
export function getSitemapRoutes() {
  if (!_defaultRoutes) {
    _defaultRoutes = deriveSitemapRoutes().routes;
  }
  return _defaultRoutes;
}

export const sitemapRoutes = getSitemapRoutes();
export const routes = sitemapRoutes;
export default sitemapRoutes;
