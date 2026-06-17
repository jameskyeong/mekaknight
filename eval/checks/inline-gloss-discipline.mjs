const ALLOWLIST = new Set([
  'test', 'tests', 'import', 'export', 'commit', 'branch', 'main', 'null',
  'true', 'false', 'undefined', 'fetch', 'console.log', 'useState', 'useEffect',
  'package.json', 'README.md', 'CONTEXT.md', 'SKILL.md', 'CLAUDE.md',
  'powertasking', 'security-check', 'ship-check', 'resolve-issue', 'report-issue', 'tracker-setup',
  'RED', 'GREEN', 'REFACTOR', 'TDD', 'PR', 'ADR', 'CI',
  'npm', 'git', 'bash', 'jq', 'curl', 'grep', 'sed', 'awk',
]);

const IDENTIFIER_RE = /`([^`\n]+)`/g;

export const id = 'inline-gloss-discipline';

export const description =
  'Backticked identifiers should be glossed on first mention. 3+ unglossed identifiers on one line is soup (fail). Sparse missing-first-mention is warn.';

function hasGlossAfter(line, endIdx) {
  // Look at the next ~40 chars after the closing backtick for a parenthetical.
  const tail = line.slice(endIdx, endIdx + 40);
  return /^\s*\(/.test(tail);
}

export function check(content) {
  const findings = [];
  const lines = content.split('\n');
  const seenFirstMention = new Set();

  let inCodeBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    if (line.trim().startsWith('|')) continue; // markdown tables often define terms
    if (line.trim().startsWith('#')) continue; // headers

    const matches = [...line.matchAll(IDENTIFIER_RE)].filter(
      (m) => !ALLOWLIST.has(m[1])
    );
    if (matches.length === 0) continue;

    // Per-line classification: which identifiers on THIS line lack an inline gloss?
    const unglossedOnLine = matches.filter(
      (m) => !hasGlossAfter(line, m.index + m[0].length)
    );

    // Soup: 3+ unglossed identifiers on a single line → FAIL
    if (unglossedOnLine.length >= 3) {
      findings.push({
        severity: 'fail',
        line: i + 1,
        message: `identifier soup: ${unglossedOnLine.length} unglossed backticked terms on one line (${unglossedOnLine
          .map((m) => '`' + m[1] + '`')
          .join(', ')})`,
      });
      // Mark these as seen so we don't double-flag as missing-first-mention
      for (const m of matches) seenFirstMention.add(m[1]);
      continue;
    }

    // Missing first-mention gloss: WARN only (heuristic; subsequent mentions skip)
    for (const m of matches) {
      const term = m[1];
      if (seenFirstMention.has(term)) continue;
      seenFirstMention.add(term);
      if (!hasGlossAfter(line, m.index + m[0].length)) {
        findings.push({
          severity: 'warn',
          line: i + 1,
          message: `first mention of \`${term}\` lacks inline gloss "(...)"`,
        });
      }
    }
  }

  return { ok: !findings.some((f) => f.severity === 'fail'), findings };
}
