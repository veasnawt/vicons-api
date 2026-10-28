import test from 'node:test';
import assert from 'node:assert/strict';
import { parseIconRequest, renderSvg } from '../src/core.mjs';
const base = 'https://icons.example.com/desktop.svg';
const src = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h10"/></svg>';
test('default options', () => assert.deepEqual(parseIconRequest(base), { name: 'desktop', color: '#111111', size: 24, stroke: 2 }));
test('customization', () => assert.deepEqual(parseIconRequest(base + '?color=01aef0&size=48&stroke=1.5'), { name: 'desktop', color: '#01AEF0', size: 48, stroke: 1.5 }));
test('SVG output', () => {
 const out = renderSvg(src, parseIconRequest(base + '?color=01aef0&size=48&stroke=1.5'));
 assert.match(out, /stroke="#01AEF0"/);
 assert.match(out, /width="48" height="48" stroke-width="1.5"/);
 assert.equal((out.match(/stroke-width=/g) ?? []).length, 1);
});
for (const bad of ['/Desktop.svg', '/desktop.png', '/folder/name.svg', '/desktop.svg?size=10000', '/desktop.svg?color=red', '/desktop.svg?stroke=0', '/desktop.svg?size=24&size=36', '/desktop.svg?url=evil']) {
 test('reject ' + bad, () => assert.ok('error' in parseIconRequest('https://icons.example.com' + bad)));
}
test('reject active SVG content', () => assert.throws(() => renderSvg(src.replace('<path', '<script>alert(1)</script><path'), parseIconRequest(base))));
