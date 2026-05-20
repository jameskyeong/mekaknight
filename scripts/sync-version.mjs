import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const manifestPath = '.claude-plugin/marketplace.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

manifest.metadata ??= {};
manifest.metadata.version = pkg.version;
for (const plugin of manifest.plugins) {
  if (plugin.name === pkg.name) plugin.version = pkg.version;
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Synced ${manifestPath} → ${pkg.version}`);
