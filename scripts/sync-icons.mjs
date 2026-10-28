import { writeFile, mkdir } from 'node:fs/promises';

// Resolve actual paths for the VIcons SVG sources from GitHub's repository tree.
// This runs before deployment, never on a user-facing image request.
const repo = 'veasnawt/vicons';
const ref = process.env.VICONS_REF || 'main';
const url = `https://api.github.com/repos/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`;
const response = await fetch(url, { headers: { 'accept': 'application/vnd.github+json', 'user-agent': 'vicons-api-sync' } });
if (!response.ok) throw new Error(`GitHub catalog request failed: HTTP ${response.status}`);
const data = await response.json();
if (data.truncated || !Array.isArray(data.tree)) throw new Error('Incomplete GitHub tree; refusing to publish partial catalog');
const files = data.tree.filter(item => item.type === 'blob' && /^assets\/source\/(?:[^/]+\/)*[a-z0-9-]+\.svg$/.test(item.path));
if (files.length < 9) throw new Error(`Unexpectedly small SVG catalog: ${files.length}`);
const catalog = {};
for (const { path } of files) {
  const name = path.split('/').at(-1).slice(0, -4);
  if (catalog[name]) throw new Error(`Icon name collision for ${name}: ${catalog[name]} and ${path}`);
  catalog[name] = path;
}
const result = Object.fromEntries(Object.entries(catalog).sort(([a], [b]) => a.localeCompare(b)));
await mkdir('src', { recursive: true });
await writeFile('src/icon-paths.json', JSON.stringify(result, null, 2) + '\n');
console.log(`Synchronized ${Object.keys(result).length} VIcons SVG paths from ${repo}@${ref}`);
