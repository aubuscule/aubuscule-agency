/**
 * Sitemap Routes and Input Graph Derivation
 *
 * Automatically builds each route's input file set and next-intl namespaces
 * by transitively traversing TypeScript and CSS imports starting from each route's
 * page.tsx and route-specific layout.tsx under src/app/[locale]/<route>/.
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
 * Modifying global chrome (e.g. copyright year in footer, sitewide navigation
 * links, or global CSS reset) represents a chrome/theming update rather than a
 * content change to specific pages. Including shared chrome would artificially bump
 * lastmod dates across the entire site whenever any global component is touched.
 *
 * Note on src/lib/site.ts:
 * src/lib/site.ts is NOT in this exclusion list; it is included only for routes
 * whose own import graph transitively references it.
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const DEFAULT_ROOT = path.resolve(__dirname, '..');

/**
 * The single policy exclusion list for shared chrome.
 */
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
 * Creates or retrieves TypeScript compiler options and host for resolving modules.
 */
export function createTsResolver(rootDir = DEFAULT_ROOT) {
  const tsconfigPath = path.join(rootDir, 'tsconfig.json');
  let compilerOptions = {
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2017,
    paths: {
      '@/*': ['./src/*'],
    },
  };

  if (fs.existsSync(tsconfigPath)) {
    try {
      const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
      const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, rootDir);
      compilerOptions = parsed.options;
    } catch {
      // Fallback to defaults if tsconfig cannot be parsed
    }
  }

  const host = ts.createCompilerHost(compilerOptions);
  return { compilerOptions, host };
}

/**
 * Resolves a module specifier to a relative file path in the workspace.
 * Uses the TypeScript compiler API for TS/JS/paths resolution,
 * and falls back to path candidate lookup for CSS/JSON/asset imports.
 */
export function resolveModule(specifier, containingFile, rootDir = DEFAULT_ROOT, resolver = null) {
  const { compilerOptions, host } = resolver || createTsResolver(rootDir);
  const containingFullPath = path.resolve(rootDir, containingFile);

  // 1. Try TypeScript compiler resolution
  const tsResolved = ts.resolveModuleName(specifier, containingFullPath, compilerOptions, host);
  if (tsResolved && tsResolved.resolvedModule) {
    if (tsResolved.resolvedModule.isExternalLibraryImport) {
      return null;
    }
    const resolvedFullPath = path.resolve(tsResolved.resolvedModule.resolvedFileName);
    const rel = path.relative(rootDir, resolvedFullPath);
    if (rel.startsWith('node_modules') || resolvedFullPath.includes(`${path.sep}node_modules${path.sep}`)) {
      return null;
    }
    return rel;
  }

  // 2. Fallback for CSS, JSON, or non-TS files
  let targetPath;
  if (specifier.startsWith('@/')) {
    targetPath = path.join(rootDir, 'src', specifier.slice(2));
  } else if (specifier.startsWith('.')) {
    targetPath = path.resolve(path.dirname(containingFullPath), specifier);
  } else {
    // External node_modules package
    return null;
  }

  const candidates = [
    targetPath,
    targetPath + '.css',
    targetPath + '.json',
    targetPath + '.tsx',
    targetPath + '.ts',
    targetPath + '.jsx',
    targetPath + '.js',
    path.join(targetPath, 'index.tsx'),
    path.join(targetPath, 'index.ts'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      const rel = path.relative(rootDir, candidate);
      if (!rel.startsWith('node_modules') && !candidate.includes(`${path.sep}node_modules${path.sep}`)) {
        return rel;
      }
    }
  }

  return null;
}

/**
 * Extracts next-intl namespace(s) from a call expression (useTranslations / getTranslations).
 * Handles string literal argument: useTranslations('x')
 * Handles object argument: getTranslations({ locale, namespace: 'x' })
 * Returns an array of top-level namespace string(s) or null if dynamic / non-literal.
 */
export function extractNamespaceFromCall(callExpr) {
  const arg0 = callExpr.arguments[0];
  if (!arg0) return null;

  // Case 1: useTranslations('namespace') or getTranslations('namespace')
  if (ts.isStringLiteral(arg0)) {
    return [arg0.text.split('.')[0]];
  }

  // Case 2: getTranslations({ locale, namespace: 'namespace' })
  if (ts.isObjectLiteralExpression(arg0)) {
    for (const prop of arg0.properties) {
      if (
        prop.name &&
        (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) &&
        prop.name.text === 'namespace'
      ) {
        if (prop.initializer && ts.isStringLiteral(prop.initializer)) {
          return [prop.initializer.text.split('.')[0]];
        }
      }
    }
  }

  return null;
}

/**
 * Checks for an adjacent comment declaring sitemap namespaces:
 * // sitemap-namespace: a, b
 * or
 * /* sitemap-namespace: a, b * /
 */
export function findAdjacentNamespaceComment(node, sourceFile) {
  const text = sourceFile.getFullText();
  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const lines = text.split('\n');

  // Check previous line
  if (line > 0) {
    const prevLine = lines[line - 1];
    const match = prevLine.match(/(?:\/\/|\/\*)\s*sitemap-namespace:\s*([^\r\n*]+)/);
    if (match) {
      return match[1].split(',').map((s) => s.trim().split('.')[0]).filter(Boolean);
    }
  }

  // Check current line
  const curLine = lines[line];
  const matchCur = curLine.match(/(?:\/\/|\/\*)\s*sitemap-namespace:\s*([^\r\n*]+)/);
  if (matchCur) {
    return matchCur[1].split(',').map((s) => s.trim().split('.')[0]).filter(Boolean);
  }

  // Check leading comment ranges
  const commentRanges = ts.getLeadingCommentRanges(text, node.getFullStart()) || [];
  for (const r of commentRanges) {
    const comment = text.slice(r.pos, r.end);
    const m = comment.match(/sitemap-namespace:\s*([^\r\n*]+)/);
    if (m) {
      return m[1].split(',').map((s) => s.trim().split('.')[0]).filter(Boolean);
    }
  }

  return null;
}

/**
 * Extracts route paths from src/app/sitemap.ts using the TypeScript AST.
 */
export function extractSitemapPaths(sitemapFile, rootDir = DEFAULT_ROOT) {
  const fullPath = path.resolve(rootDir, sitemapFile);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Sitemap file not found: ${fullPath}`);
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const sf = ts.createSourceFile(fullPath, content, ts.ScriptTarget.Latest, true);

  let extractedPaths = null;

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      (node.name.getText(sf) === 'sitemapPaths' || node.name.getText(sf) === 'paths')
    ) {
      let init = node.initializer;
      if (init && ts.isAsExpression(init)) {
        init = init.expression;
      }
      if (init && ts.isArrayLiteralExpression(init)) {
        extractedPaths = [];
        for (const el of init.elements) {
          if (ts.isStringLiteral(el)) {
            extractedPaths.push(el.text);
          } else if (
            ts.isArrayLiteralExpression(el) &&
            el.elements[0] &&
            ts.isStringLiteral(el.elements[0])
          ) {
            extractedPaths.push(el.elements[0].text);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);

  if (!extractedPaths) {
    throw new Error(`Could not find "sitemapPaths" or "paths" array in ${fullPath}`);
  }

  return extractedPaths;
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

/**
 * Derives the complete input file set and i18n namespaces for a single route.
 */
export function deriveRouteInputs(routePath, options = {}) {
  const rootDir = options.rootDir || DEFAULT_ROOT;
  const resolver = options.resolver || createTsResolver(rootDir);
  const exclusions = new Set((options.exclusions || SHARED_CHROME_EXCLUSIONS).map((f) => path.normalize(f)));

  // 1. Determine page file
  const pageRel = routePath === ''
    ? 'src/app/[locale]/page.tsx'
    : path.posix.join('src/app/[locale]', routePath.slice(1), 'page.tsx');
  const pageFull = path.resolve(rootDir, pageRel);

  if (!fs.existsSync(pageFull)) {
    throw new Error(
      `Route "${routePath}" in sitemap.ts has no matching page.tsx at ${pageRel}`
    );
  }

  // 2. Identify start files (page.tsx + route-specific layout.tsx)
  const startFiles = [pageRel];
  const routeLayouts = findRouteLayouts(routePath, rootDir);
  for (const layout of routeLayouts) {
    if (!exclusions.has(path.normalize(layout))) {
      startFiles.push(layout);
    }
  }

  // 3. Transitive graph traversal
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

    if (exclusions.has(curNorm)) {
      continue;
    }

    graphFiles.push(cur);

    // CSS and JSON files don't export/import further local TS files
    if (cur.endsWith('.css') || cur.endsWith('.json')) {
      continue;
    }

    const fullPath = path.resolve(rootDir, cur);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');
    const sf = ts.createSourceFile(cur, content, ts.ScriptTarget.Latest, true);

    function visit(node) {
      // Detect next-intl calls
      if (ts.isCallExpression(node)) {
        const fnText = node.expression.getText(sf);
        if (fnText === 'useTranslations' || fnText === 'getTranslations') {
          const extracted = extractNamespaceFromCall(node);
          if (extracted) {
            for (const ns of extracted) namespaces.add(ns);
          } else {
            const override = findAdjacentNamespaceComment(node, sf);
            if (override) {
              for (const ns of override) namespaces.add(ns);
            } else {
              const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
              const warning = {
                file: cur,
                line: line + 1,
                call: fnText,
                route: routePath,
                message: `Non-literal or unresolvable namespace in ${fnText}() at ${cur}:${line + 1}`,
              };
              warnings.push(warning);
              console.warn(
                `[sitemap:warn] ${cur}:${line + 1} - Dynamic/non-literal namespace in ${fnText}() call for route "${routePath}". Declare with comment: // sitemap-namespace: <namespaces>`
              );
            }
          }
        }
      }

      // Collect imports & dynamic imports
      let spec = null;
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        spec = node.moduleSpecifier.text;
      } else if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        spec = node.moduleSpecifier.text;
      } else if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments[0] &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        spec = node.arguments[0].text;
      }

      if (spec) {
        const resolved = resolveModule(spec, cur, rootDir, resolver);
        if (resolved) {
          const resolvedNorm = path.normalize(resolved);
          if (!exclusions.has(resolvedNorm) && !visited.has(resolvedNorm)) {
            queue.push(resolved);
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sf);
  }

  // Add i18n message files to input files
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
  const resolver = createTsResolver(rootDir);

  const routes = {};
  const allWarnings = [];

  for (const routePath of paths) {
    const entry = deriveRouteInputs(routePath, {
      ...options,
      rootDir,
      resolver,
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

// Default export / cached instance
export const sitemapRoutes = new Proxy({}, {
  get(target, prop) {
    if (typeof prop === 'string') {
      const { routes } = deriveSitemapRoutes();
      return routes[prop];
    }
    return Reflect.get(target, prop);
  },
  ownKeys() {
    const { routes } = deriveSitemapRoutes();
    return Reflect.ownKeys(routes);
  },
  getOwnPropertyDescriptor(target, prop) {
    const { routes } = deriveSitemapRoutes();
    if (prop in routes) {
      return {
        value: routes[prop],
        writable: true,
        enumerable: true,
        configurable: true,
      };
    }
    return undefined;
  },
});

export const routes = sitemapRoutes;
export default sitemapRoutes;
