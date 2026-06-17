import fs from 'node:fs/promises';
import path from 'node:path';

export const id = 'cross-cutting-gates-present';

export const description =
  'Each user-facing skill must reference powertasking cross-cutting gates: Forbidden language (powertasking) and inline-gloss / communication-style (all user-facing skills).';

const FORGE_REQUIRED = [
  { needle: 'Forbidden language', name: '"Forbidden language" section' },
  { needle: 'user-facing communication style', name: '"user-facing communication style" gate' },
];

const SUPPLEMENTARY = ['security-check', 'ship-check', 'resolve-issue', 'report-issue'];
const SUPP_REQUIRED = [
  { needle: 'inline-gloss', name: 'inline-gloss mention' },
  { needle: 'communication-style.md', name: 'communication-style.md link' },
];

export async function checkRepo(rootDir) {
  const findings = [];

  // powertasking
  const forgePath = path.join(rootDir, 'skills', 'powertasking', 'SKILL.md');
  const forgeContent = await fs.readFile(forgePath, 'utf8');
  for (const req of FORGE_REQUIRED) {
    if (!forgeContent.includes(req.needle)) {
      findings.push({
        severity: 'fail',
        message: `skills/powertasking/SKILL.md missing ${req.name} (needle: "${req.needle}")`,
      });
    }
  }

  // supplementary
  for (const skill of SUPPLEMENTARY) {
    const skillPath = path.join(rootDir, 'skills', skill, 'SKILL.md');
    let content;
    try {
      content = await fs.readFile(skillPath, 'utf8');
    } catch {
      findings.push({
        severity: 'fail',
        message: `skills/${skill}/SKILL.md not found`,
      });
      continue;
    }
    const missing = SUPP_REQUIRED.filter((req) => !content.includes(req.needle));
    if (missing.length === SUPP_REQUIRED.length) {
      findings.push({
        severity: 'fail',
        message: `skills/${skill}/SKILL.md has no inline-gloss reference (need at least one of: ${SUPP_REQUIRED.map((r) => r.needle).join(', ')})`,
      });
    }
  }

  return { ok: findings.length === 0, findings };
}
