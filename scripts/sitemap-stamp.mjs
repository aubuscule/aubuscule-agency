/**
 * Sitemap Hash Stamper and Checker
 *
 * Computes deterministic SHA-256 hashes of each sitemap route's input files.
 * For JSON translation files (en/fr/nl), hashes only that route's top-level
 * namespace keys so unrelated translation edits don't bump lastmod dates.
 *
 * Usage:
 *   npm run sitemap:stamp   Recomputes hashes and stamps today's date if changed
 *   npm run sitemap:check   Verifies hashes match committed dates; exits non-zero if stale
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sitemapRoutes } from './sitemap-routes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_DATES_FILE = path.join(DEFAULT_ROOT, 'src', 'lib', 'sitemap-dates.json');

/**
 * Resolves a module specifier from an importing file.
 * Handles `@/` (mapped to `src/`) and relative `./` or `../`.
 */
export function resolveImport(importingFile, specifier, rootDir = DEFAULT_ROOT) {
  let targetPath;
  if (specifier.startsWith('@/')) {
    targetPath = path.join(rootDir, 'src', specifier.slice(2));
  } else if (specifier.startsWith('.')) {
    targetPath = path.resolve(path.dirname(path.resolve(rootDir, importingFile)), specifier);
  } else {
    return null; // External package (e.g. react, next)
  }

  const extensions = ['', '.tsx', '.ts', '.jsx', '.js', '.css', '.json', '/index.tsx', '/index.ts'];
  for (const ext of extensions) {
    const candidate = targetPath + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return path.relative(rootDir, candidate);
    }
  }
  return null;
}

/**
 * Extracts all local imported file paths from a source file.
 */
export function findLocalImports(filePath, rootDir = DEFAULT_ROOT) {
  const fullPath = path.resolve(rootDir, filePath);
  if (!fs.existsSync(fullPath)) return [];
  const content = fs.readFileSync(fullPath, 'utf8');

  // Match: import ... from '...' or export ... from '...' or import '...'
  const importRegex = /(?:import|export)\s+(?:(?:(?:\w+|\{[^}]*\}|\*\s+as\s+\w+)\s+from\s+)?['"]([^'"]+)['"]|\s*['"]([^'"]+)['"])/g;
  const imports = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const spec = match[1] || match[2];
    const resolved = resolveImport(filePath, spec, rootDir);
    if (resolved) {
      imports.push(resolved);
    }
  }
  return imports;
}

/**
 * Recursively inspects a route's page and warns if any imported local file
 * is not covered in the route's input list.
 */
export function checkRouteImports(routePath, pageFile, inputFiles, rootDir = DEFAULT_ROOT) {
  const warnings = [];
  const inputSet = new Set(inputFiles);
  const visited = new Set();
  const queue = [pageFile];

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    const directImports = findLocalImports(current, rootDir);
    for (const importedFile of directImports) {
      if (!inputSet.has(importedFile)) {
        const warning = {
          route: routePath,
          importedFile,
          importedBy: current,
        };
        warnings.push(warning);
        console.warn(
          `[sitemap:warn] Route "${routePath || "''"}" page imports "${importedFile}" (via "${current}") which is not covered in its input list.`
        );
      }
      if (!visited.has(importedFile)) {
        queue.push(importedFile);
      }
    }
  }

  return warnings;
}

/**
 * Computes a deterministic SHA-256 hash for a given route.
 * For JSON files, only hashes the specified top-level namespaces.
 */
export function computeRouteHash(routePath, inputFiles, namespaces = [], rootDir = DEFAULT_ROOT) {
  const hash = crypto.createHash('sha256');
  const sortedFiles = [...inputFiles].sort();

  for (const relFile of sortedFiles) {
    const fullPath = path.resolve(rootDir, relFile);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Input file not found for route "${routePath}": ${relFile}`);
    }

    if (relFile.endsWith('.json')) {
      const raw = fs.readFileSync(fullPath, 'utf8');
      const data = JSON.parse(raw);
      // Extract only the namespaces relevant to this route
      const filtered = {};
      const sortedNamespaces = [...namespaces].sort();
      for (const ns of sortedNamespaces) {
        if (ns in data) {
          filtered[ns] = data[ns];
        }
      }
      hash.update(`${relFile}:${JSON.stringify(filtered)}\n`);
    } else {
      const raw = fs.readFileSync(fullPath, 'utf8');
      // Normalize line endings for cross-platform stability
      const normalized = raw.replace(/\r\n/g, '\n');
      hash.update(`${relFile}:${normalized}\n`);
    }
  }

  return hash.digest('hex');
}

/**
 * Gets the latest git commit date touching any of the provided input files.
 */
export function getLatestCommitDate(inputFiles, rootDir = DEFAULT_ROOT) {
  try {
    const output = execSync(
      `git log -1 --format=%cs -- ${inputFiles.join(' ')}`,
      { cwd: rootDir, stdio: ['ignore', 'pipe', 'ignore'] }
    ).toString().trim();
    if (output && /^\d{4}-\d{2}-\d{2}$/.test(output)) {
      return output;
    }
  } catch {
    // Git command failed or not in repo
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * Main execution function for stamping or checking sitemap dates.
 */
export function runSitemapStamp(options = {}) {
  const rootDir = options.rootDir || DEFAULT_ROOT;
  const datesPath = options.datesPath || DEFAULT_DATES_FILE;
  const checkMode = Boolean(options.checkMode);
  const seedMode = Boolean(options.seedMode);
  const routes = options.routes || sitemapRoutes;
  const today = options.customDate || new Date().toISOString().split('T')[0];

  let currentDates = {};
  if (fs.existsSync(datesPath)) {
    try {
      currentDates = JSON.parse(fs.readFileSync(datesPath, 'utf8'));
    } catch (err) {
      console.warn(`[sitemap:warn] Failed to parse existing ${datesPath}: ${err.message}`);
    }
  }

  const allWarnings = [];
  const stale = [];
  const upToDate = [];
  const changed = [];
  const newDates = { ...currentDates };

  for (const [routePath, routeEntry] of Object.entries(routes)) {
    const files = routeEntry.files || routeEntry;
    const namespaces = routeEntry.namespaces || [];
    const page = routeEntry.page || files[0];

    // Check for uncovered imports
    const warnings = checkRouteImports(routePath, page, files, rootDir);
    allWarnings.push(...warnings);

    // Compute hash
    const computedHash = computeRouteHash(routePath, files, namespaces, rootDir);
    const existingEntry = currentDates[routePath];

    if (!existingEntry || existingEntry.hash !== computedHash) {
      if (checkMode) {
        stale.push({
          path: routePath,
          expectedHash: computedHash,
          storedHash: existingEntry ? existingEntry.hash : null,
          storedDate: existingEntry ? existingEntry.date : null,
        });
      } else {
        let dateToSet = today;
        if (seedMode) {
          dateToSet = options.customDate || getLatestCommitDate(files, rootDir);
        }
        newDates[routePath] = {
          hash: computedHash,
          date: dateToSet,
        };
        changed.push({
          path: routePath,
          oldHash: existingEntry ? existingEntry.hash : null,
          newHash: computedHash,
          oldDate: existingEntry ? existingEntry.date : null,
          newDate: dateToSet,
        });
      }
    } else {
      upToDate.push(routePath);
      newDates[routePath] = existingEntry;
    }
  }

  if (checkMode) {
    if (stale.length > 0) {
      console.error('[sitemap] Stale sitemap paths found:');
      for (const item of stale) {
        console.error(
          `  - "${item.path || "''"}": current hash ${item.expectedHash} != stored ${item.storedHash || '(none)'}`
        );
      }
      return { success: false, stale, upToDate, warnings: allWarnings };
    }
    console.log(`[sitemap] All ${upToDate.length} sitemap paths are up to date.`);
    return { success: true, stale: [], upToDate, warnings: allWarnings };
  }

  // Stamp mode: write back file
  fs.mkdirSync(path.dirname(datesPath), { recursive: true });
  fs.writeFileSync(datesPath, JSON.stringify(newDates, null, 2) + '\n', 'utf8');

  if (changed.length > 0) {
    console.log(`[sitemap] Updated ${changed.length} path(s) in ${path.relative(rootDir, datesPath)}:`);
    for (const item of changed) {
      console.log(`  - "${item.path || "''"}": ${item.oldDate || '(new)'} -> ${item.newDate} (hash: ${item.newHash.slice(0, 10)}...)`);
    }
  } else {
    console.log(`[sitemap] All ${upToDate.length} paths up to date; no changes written.`);
  }

  return { success: true, changed, upToDate, warnings: allWarnings, dates: newDates };
}

// CLI entry point
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMainModule) {
  const args = process.argv.slice(2);
  const checkMode = args.includes('--check');
  const seedMode = args.includes('--seed');

  const result = runSitemapStamp({ checkMode, seedMode });
  if (checkMode && !result.success) {
    process.exit(1);
  }
}
