const BANNED = [
  'should work',
  'seems to pass',
  'probably fixed',
  'I think it passes',
  'looks correct',
  'this should be fine',
  'likely works',
];

export const id = 'no-banned-phrases';

export const description =
  'Output must not contain forge-verification banned soft-language phrases.';

export function check(content) {
  const findings = [];
  const lines = content.split('\n');

  let inCodeBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    for (const phrase of BANNED) {
      const idx = line.toLowerCase().indexOf(phrase.toLowerCase());
      if (idx !== -1) {
        findings.push({
          severity: 'fail',
          line: i + 1,
          message: `banned phrase "${phrase}" at col ${idx + 1}`,
        });
      }
    }
  }

  return { ok: findings.length === 0, findings };
}
