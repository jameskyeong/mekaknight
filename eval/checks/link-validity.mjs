import fs from 'node:fs/promises';
import path from 'node:path';

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

export const id = 'link-validity';

export const description =
  'Markdown links to local paths must resolve to an existing file or directory.';

export async function checkFile(filePath, content) {
  const findings = [];
  const dir = path.dirname(filePath);
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const m of line.matchAll(LINK_RE)) {
      let target = m[2].trim();
      if (
        target.startsWith('http://') ||
        target.startsWith('https://') ||
        target.startsWith('mailto:') ||
        target.startsWith('#')
      )
        continue;

      // Strip fragment, query
      target = target.split('#')[0].split('?')[0];
      if (!target) continue;

      const resolved = path.resolve(dir, target);
      try {
        await fs.stat(resolved);
      } catch {
        findings.push({
          severity: 'fail',
          line: i + 1,
          message: `broken link "${m[2]}" -> ${path.relative(process.cwd(), resolved)}`,
        });
      }
    }
  }

  return { ok: findings.length === 0, findings };
}
