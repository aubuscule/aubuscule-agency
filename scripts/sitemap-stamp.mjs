/**
 * Sitemap Hash Stamper, Checker, and Rebaseliner
 *
 * Automatically hashes each route's derived input files and i18n namespaces.
 * For JSON translation files (en/fr/nl), hashes only that route's derived
 * top-level namespace keys so unrelated translation edits don't bump lastmod dates.
 *
 * Shared chrome (Footer, Nav, Layouts, global CSS) is deliberately excluded.
 *
 * Usage:
 *   npm run sitemap:stamp                Recomputes hashes and stamps today's date if changed (prunes removed routes)
 *   npm run sitemap:check                Verifies hashes match committed dates; exits non-zero if stale, orphaned, or warning
 *   node scripts/sitemap-stamp.mjs --rebaseline  Migration mode: rewrites hashes WITHOUT changing existing dates
 *   node scripts/sitemap-stamp.mjs --explain <path>  Audits derived files and namespaces for a route
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  deriveSitemapRoutes,
  deriveRouteInputs,
  findRouteLayouts,
  DEFAULT_ROOT,
  I18N_MESSAGES,
} from './sitemap-routes.mjs';

const DEFAULT_DATES_FILE = path.join(DEFAULT_ROOT, 'src', 'lib', 'sitemap-dates.json');

const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.css', '.json', '.svg', '.html', '.md', '.txt'
]);

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

function isI18nMessageFile(relFile) {
  const norm = relFile.replace(/\\/g, '/');
  return norm.startsWith('src/i18n/messages/') && norm.endsWith('.json');
}

/**
 * Computes a deterministic SHA-256 hash for a given route.
 * For i18n JSON files, only hashes the specified top-level namespaces.
 * Other JSON and text files are hashed verbatim.
 * Non-text / binary files are hashed as Buffer.
 */
export function computeRouteHash(routePath, inputFiles, namespaces = [], rootDir = DEFAULT_ROOT) {
  const hash = crypto.createHash('sha256');
  const sortedFiles = [...inputFiles].sort();

  for (const relFile of sortedFiles) {
    const fullPath = path.resolve(rootDir, relFile);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Input file not found for route "${routePath}": ${relFile}`);
    }

    if (isI18nMessageFile(relFile)) {
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
    } else if (isTextFile(fullPath)) {
      const raw = fs.readFileSync(fullPath, 'utf8');
      // Normalize line endings for cross-platform stability
      const normalized = raw.replace(/\r\n/g, '\n');
      hash.update(`${relFile}:${normalized}\n`);
    } else {
      // Non-text / binary files (images etc.) read as Buffer
      const buf = fs.readFileSync(fullPath);
      hash.update(`${relFile}:`);
      hash.update(buf);
      hash.update('\n');
    }
  }

  return hash.digest('hex');
}

/**
 * Gets the latest git commit date touching any of the provided input files.
 * Uses execFileSync with an argument array and '--' to prevent shell globbing
 * of Next.js [locale] path segments, and fails loudly on git error.
 */
export function getLatestCommitDate(inputFiles, rootDir = DEFAULT_ROOT) {
  try {
    const args = ['log', '-1', '--format=%cs', '--', ...inputFiles];
    const output = execFileSync('git', args, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();

    if (output && /^\d{4}-\d{2}-\d{2}$/.test(output)) {
      return output;
    }
  } catch (err) {
    throw new Error(
      `Failed to determine latest commit date for input files via git: ${err.message}`
    );
  }
  throw new Error(
    `No git commit found touching any of the specified input files: ${inputFiles.join(', ')}`
  );
}

/**
 * Explains and prints a route's derived files and namespaces.
 */
export function explainRoute(routePath, options = {}) {
  const rootDir = options.rootDir || DEFAULT_ROOT;
  const entry = deriveRouteInputs(routePath, { rootDir });
  const layouts = findRouteLayouts(routePath, rootDir);

  console.log(`\n======================================================`);
  console.log(`Sitemap Route Audit: "${routePath || "''"}"`);
  console.log(`======================================================`);
  console.log(`Page: ${entry.page}`);
  if (layouts.length > 0) {
    console.log(`Route-specific layouts (${layouts.length}):`);
    for (const l of layouts) {
      console.log(`  - ${l}`);
    }
  } else {
    console.log(`Route-specific layouts: none (locale/root layouts excluded by policy)`);
  }
  console.log(`\nDerived files (${entry.files.length}):`);
  for (const f of entry.files) {
    console.log(`  - ${f}`);
  }
  console.log(`\nDerived i18n namespaces (${entry.namespaces.length}):`);
  for (const ns of entry.namespaces) {
    console.log(`  - ${ns}`);
  }
  if (entry.warnings.length > 0) {
    console.log(`\nWarnings (${entry.warnings.length}):`);
    for (const w of entry.warnings) {
      console.log(`  - [WARN] ${w.file}:${w.line} (${w.call})`);
    }
  }
  console.log(`======================================================\n`);

  return entry;
}

/**
 * Reads and validates sitemap-dates.json.
 * Fails loudly on corrupt JSON or invalid structure.
 */
export function readDatesFile(datesPath) {
  if (!fs.existsSync(datesPath)) {
    return {};
  }

  const raw = fs.readFileSync(datesPath, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('Dates JSON root must be an object');
    }
    return parsed;
  } catch (err) {
    throw new Error(`Corrupted sitemap dates file at "${datesPath}": ${err.message}`);
  }
}

/**
 * Main execution function for stamping, checking, or rebaselining sitemap dates.
 */
export function runSitemapStamp(options = {}) {
  const rootDir = options.rootDir || DEFAULT_ROOT;
  const datesPath = options.datesPath || DEFAULT_DATES_FILE;
  const checkMode = Boolean(options.checkMode);
  const rebaselineMode = Boolean(options.rebaselineMode);
  const today = options.customDate || new Date().toISOString().split('T')[0];

  // 1. Read dates file (throws on corrupt JSON)
  const currentDates = readDatesFile(datesPath);

  // 2. Derive route definitions from sitemap.ts
  let routes = options.routes;
  let allWarnings = options.warnings || [];

  if (!routes) {
    const derived = deriveSitemapRoutes({
      rootDir,
      sitemapFile: options.sitemapFile,
      paths: options.paths,
    });
    routes = derived.routes;
    allWarnings = derived.warnings;
  }

  // If stamping (not rebaselining) and there are unresolved namespace warnings: fail loudly
  if (!checkMode && !rebaselineMode && allWarnings.length > 0) {
    console.error(`[sitemap:error] Cannot stamp dates: ${allWarnings.length} unresolved namespace warning(s) found:`);
    for (const w of allWarnings) {
      console.error(`  - ${w.file}:${w.line} (${w.call})`);
    }
    return { success: false, stale: [], upToDate: [], warnings: allWarnings, changed: [], pruned: [] };
  }

  const stale = [];
  const upToDate = [];
  const changed = [];
  const newDates = {};

  const routeKeys = new Set(Object.keys(routes));
  const orphanKeys = Object.keys(currentDates).filter((k) => !routeKeys.has(k));

  if (checkMode && orphanKeys.length > 0) {
    for (const orphan of orphanKeys) {
      stale.push({
        path: orphan,
        orphan: true,
        missing: false,
        expectedHash: null,
        storedHash: currentDates[orphan]?.hash || null,
        storedDate: currentDates[orphan]?.date || null,
      });
    }
  }

  for (const [routePath, routeEntry] of Object.entries(routes)) {
    const files = Array.isArray(routeEntry) ? routeEntry : (routeEntry.files || []);
    const namespaces = routeEntry.namespaces || [];

    // Compute hash
    const computedHash = computeRouteHash(routePath, files, namespaces, rootDir);
    const existingEntry = currentDates[routePath];

    if (rebaselineMode) {
      // Rebaseline mode: rewrite hash, keep existing date intact!
      const existingDate = existingEntry?.date || today;
      newDates[routePath] = {
        hash: computedHash,
        date: existingDate,
      };
      changed.push({
        path: routePath,
        oldHash: existingEntry ? existingEntry.hash : null,
        newHash: computedHash,
        oldDate: existingEntry ? existingEntry.date : null,
        newDate: existingDate,
      });
    } else if (!existingEntry || existingEntry.hash !== computedHash) {
      if (checkMode) {
        stale.push({
          path: routePath,
          orphan: false,
          missing: !existingEntry,
          expectedHash: computedHash,
          storedHash: existingEntry ? existingEntry.hash : null,
          storedDate: existingEntry ? existingEntry.date : null,
        });
      } else {
        const dateToSet = today;
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

  // Check mode validation
  if (checkMode) {
    const hasWarnings = allWarnings.length > 0;
    if (stale.length > 0 || hasWarnings) {
      if (stale.length > 0) {
        console.error('[sitemap] Stale sitemap paths found:');
        for (const item of stale) {
          if (item.orphan) {
            console.error(
              `  - "${item.path || "''"}": orphaned route present in dates JSON but removed from sitemap`
            );
          } else if (item.missing) {
            console.error(
              `  - "${item.path || "''"}": missing entry in sitemap-dates.json (expected hash ${item.expectedHash})`
            );
          } else {
            console.error(
              `  - "${item.path || "''"}": current hash ${item.expectedHash} != stored ${item.storedHash || '(none)'}`
            );
          }
        }
      }
      if (hasWarnings) {
        console.error(`[sitemap] ${allWarnings.length} unresolvable namespace warning(s) found:`);
        for (const w of allWarnings) {
          console.error(`  - ${w.file}:${w.line} (${w.call})`);
        }
      }
      return { success: false, stale, upToDate, warnings: allWarnings, orphanKeys };
    }
    console.log(`[sitemap] All ${upToDate.length} sitemap paths are up to date.`);
    return { success: true, stale: [], upToDate, warnings: allWarnings, orphanKeys: [] };
  }

  // Stamp or Rebaseline mode: write back to dates JSON file
  fs.mkdirSync(path.dirname(datesPath), { recursive: true });
  fs.writeFileSync(datesPath, JSON.stringify(newDates, null, 2) + '\n', 'utf8');

  if (orphanKeys.length > 0) {
    console.log(`[sitemap] Pruned ${orphanKeys.length} removed route(s): ${orphanKeys.join(', ')}`);
  }

  if (rebaselineMode) {
    console.log(`[sitemap:rebaseline] Rebaselined ${changed.length} path(s) preserving existing dates:`);
    for (const item of changed) {
      console.log(`  - "${item.path || "''"}": ${item.newDate} (hash: ${item.newHash.slice(0, 10)}...)`);
    }
    return { success: true, changed, upToDate: [], warnings: allWarnings, dates: newDates, pruned: orphanKeys };
  }

  if (changed.length > 0) {
    console.log(`[sitemap] Updated ${changed.length} path(s) in ${path.relative(rootDir, datesPath)}:`);
    for (const item of changed) {
      console.log(
        `  - "${item.path || "''"}": ${item.oldDate || '(new)'} -> ${item.newDate} (hash: ${item.newHash.slice(0, 10)}...)`
      );
    }
  } else if (orphanKeys.length === 0) {
    console.log(`[sitemap] All ${upToDate.length} paths up to date; no changes written.`);
  }

  return { success: true, changed, upToDate, warnings: allWarnings, dates: newDates, pruned: orphanKeys };
}

// CLI entry point
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMainModule) {
  const args = process.argv.slice(2);
  const checkMode = args.includes('--check');
  const rebaselineMode = args.includes('--rebaseline');
  const explainIdx = args.indexOf('--explain');

  if (explainIdx !== -1) {
    const routeToExplain = args[explainIdx + 1] !== undefined ? args[explainIdx + 1] : '';
    explainRoute(routeToExplain);
    process.exit(0);
  }

  try {
    const result = runSitemapStamp({ checkMode, rebaselineMode });
    if (!result.success) {
      process.exit(1);
    }
  } catch (err) {
    console.error(`[sitemap:error] ${err.message}`);
    process.exit(1);
  }
}
