import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const paths = JSON.parse(readFileSync(new URL('../src/icon-paths.json', import.meta.url), 'utf8'));
test('generated catalog includes original desktop icon', () => assert.equal(paths.desktop, 'assets/source/symbols/desktop.svg'));
test('catalog paths remain within the trusted VIcons SVG source directory', () => {
  for (const [name, path] of Object.entries(paths)) {
    assert.match(name, /^[a-z][a-z0-9-]{0,63}$/);
    assert.match(path, /^assets\/source\/(?:[a-z0-9-]+\/)+[a-z0-9-]+\.svg$/);
  }
});
