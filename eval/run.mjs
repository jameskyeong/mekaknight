#!/usr/bin/env node
// mekaknight eval runner — v1 (static checks + golden fixtures)
//
// See eval/README.md for what each check does and how to extend.

import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ---------- frontmatter parsing (minimal) ----------

function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) return { data: {}, body: content };
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) return { data: {}, body: content };
  const yaml = content.slice(4, end);
  const body = content.slice(end + 5);

  const data = {};
  let currentKey = null;
  let currentList = null;
  for (const rawLine of yaml.split('\n')) {
    const line = rawLine.replace(/\s+$/, '');
    if (!line) continue;
    const listMatch = line.match(/^\s+-\s+(.+)$/);
    if (listMatch && currentList) {
      currentList.push(listMatch[1].trim());
      continue;
    }
    const kv = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      const value = kv[2].trim();
      if (value === '') {
        data[currentKey] = currentList = [];
      } else {
        data[currentKey] = value;
        currentList = null;
      }
    }
  }
  return { data, body };
}

// ---------- file walking ----------

async function walkMarkdown(dir, predicate = () => true) {
  const out = [];
  async function recurse(d) {
    let entries;
    try {
      entries = await fs.readdir(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
        await recurse(full);
      } else if (e.isFile() && e.name.endsWith('.md') && predicate(full)) {
        out.push(full);
      }
    }
  }
  await recurse(dir);
  return out;
}

// ---------- check loading ----------

async function loadChecks() {
  const checksDir = path.join(__dirname, 'checks');
  const entries = await fs.readdir(checksDir);
  const checks = {};
  for (const file of entries) {
    if (!file.endsWith('.mjs')) continue;
    const mod = await import(url.pathToFileURL(path.join(checksDir, file)).href);
    if (!mod.id) throw new Error(`check ${file} missing exported id`);
    checks[mod.id] = mod;
  }
  return checks;
}

// ---------- result accumulator ----------

class Results {
  constructor() {
    this.rows = [];
  }
  record(target, checkId, ok, findings, note) {
    this.rows.push({ target, checkId, ok, findings, note });
  }
  print() {
    const W1 = Math.max(8, ...this.rows.map((r) => r.target.length));
    const W2 = Math.max(8, ...this.rows.map((r) => r.checkId.length));
    console.log('');
    console.log(
      'target'.padEnd(W1) + '  ' + 'check'.padEnd(W2) + '  ' + 'result'
    );
    console.log('-'.repeat(W1 + W2 + 16));
    for (const r of this.rows) {
      const mark = r.ok ? '\x1b[32m✓ pass\x1b[0m' : '\x1b[31m✗ FAIL\x1b[0m';
      const note = r.note ? `  ${r.note}` : '';
      console.log(r.target.padEnd(W1) + '  ' + r.checkId.padEnd(W2) + '  ' + mark + note);
      if (!r.ok && r.findings) {
        for (const f of r.findings) {
          const loc = f.line ? `:${f.line}` : '';
          console.log(`    ${f.severity.toUpperCase()}${loc}  ${f.message}`);
        }
      }
    }
    const failed = this.rows.filter((r) => !r.ok).length;
    console.log('');
    if (failed === 0) {
      console.log(`\x1b[32m${this.rows.length}/${this.rows.length} passed\x1b[0m`);
    } else {
      console.log(`\x1b[31m${failed}/${this.rows.length} FAILED\x1b[0m`);
    }
  }
  exitCode() {
    return this.rows.some((r) => !r.ok) ? 1 : 0;
  }
}

// ---------- runners ----------

async function runFixtures(checks, results) {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const files = await walkMarkdown(fixturesDir);
  for (const file of files) {
    const relName = path.relative(__dirname, file);
    const content = await fs.readFile(file, 'utf8');
    const { data, body } = parseFrontmatter(content);
    const type = data.type;

    if (type === 'positive') {
      const checkIds = Array.isArray(data.checks) ? data.checks : [];
      if (checkIds.length === 0) {
        results.record(relName, 'manifest', false, [
          { severity: 'fail', message: 'positive fixture must declare `checks: [...]` in frontmatter' },
        ]);
        continue;
      }
      for (const id of checkIds) {
        const check = checks[id];
        if (!check?.check) {
          results.record(relName, id, false, [
            { severity: 'fail', message: `unknown or non-content check "${id}"` },
          ]);
          continue;
        }
        const res = check.check(body);
        results.record(relName, id, res.ok, res.findings);
      }
    } else if (type === 'negative') {
      const id = data.expectFail;
      if (!id) {
        results.record(relName, 'manifest', false, [
          { severity: 'fail', message: 'negative fixture must declare `expectFail: <check-id>` in frontmatter' },
        ]);
        continue;
      }
      const check = checks[id];
      if (!check?.check) {
        results.record(relName, id, false, [
          { severity: 'fail', message: `unknown or non-content check "${id}"` },
        ]);
        continue;
      }
      const res = check.check(body);
      // Negative fixture passes IF the check fails on it.
      results.record(
        relName,
        id,
        !res.ok,
        res.ok ? [{ severity: 'fail', message: 'expected check to FAIL on this fixture but it passed' }] : [],
        res.ok ? '(expectFail not triggered)' : '(expected FAIL — counted as pass)'
      );
    } else {
      results.record(relName, 'manifest', false, [
        { severity: 'fail', message: 'fixture must declare `type: positive` or `type: negative` in frontmatter' },
      ]);
    }
  }
}

async function runLinkValidity(checks, results) {
  const check = checks['link-validity'];
  if (!check?.checkFile) return;

  const targets = [
    ...(await walkMarkdown(path.join(ROOT, 'skills'))),
    ...(await walkMarkdown(path.join(ROOT, 'docs'))),
    path.join(ROOT, 'README.md'),
    path.join(ROOT, 'CONTEXT.md'),
    path.join(ROOT, 'CLAUDE.md'),
  ];

  for (const file of targets) {
    let content;
    try {
      content = await fs.readFile(file, 'utf8');
    } catch {
      continue;
    }
    const res = await check.checkFile(file, content);
    const relName = path.relative(ROOT, file);
    results.record(relName, 'link-validity', res.ok, res.findings);
  }
}

async function runRepoChecks(checks, results) {
  for (const id of ['version-sync', 'cross-cutting-gates-present']) {
    const check = checks[id];
    if (!check?.checkRepo) continue;
    const res = await check.checkRepo(ROOT);
    results.record('<repo>', id, res.ok, res.findings);
  }
}

// ---------- main ----------

const checks = await loadChecks();
const results = new Results();

await runFixtures(checks, results);
await runLinkValidity(checks, results);
await runRepoChecks(checks, results);

results.print();
process.exit(results.exitCode());
