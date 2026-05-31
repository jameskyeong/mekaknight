import fs from 'node:fs/promises';
import path from 'node:path';

export const id = 'version-sync';

export const description =
  'package.json version must match .claude-plugin/marketplace.json metadata.version and the named plugin entry.';

export async function checkRepo(rootDir) {
  const findings = [];

  const pkgPath = path.join(rootDir, 'package.json');
  const manifestPath = path.join(rootDir, '.claude-plugin', 'marketplace.json');

  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

  if (manifest.metadata?.version !== pkg.version) {
    findings.push({
      severity: 'fail',
      message: `marketplace.json metadata.version (${manifest.metadata?.version}) != package.json version (${pkg.version})`,
    });
  }

  const pluginEntry = manifest.plugins?.find((p) => p.name === pkg.name);
  if (!pluginEntry) {
    findings.push({
      severity: 'fail',
      message: `marketplace.json has no plugin entry named "${pkg.name}"`,
    });
  } else if (pluginEntry.version !== pkg.version) {
    findings.push({
      severity: 'fail',
      message: `marketplace.json plugins[${pkg.name}].version (${pluginEntry.version}) != package.json version (${pkg.version})`,
    });
  }

  return { ok: findings.length === 0, findings };
}
