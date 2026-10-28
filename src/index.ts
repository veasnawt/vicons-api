import { parseIconRequest, renderSvg } from './core.mjs';
import iconPaths from './icon-paths.json';

interface Env { SOURCE_REF: string }
const paths: Record<string, string> = iconPaths;
const headers = {
  'content-type': 'image/svg+xml; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  'access-control-allow-origin': '*',
  'cache-control': 'public, max-age=3600, s-maxage=86400',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'HEAD')
      return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
    const url = new URL(request.url);
    if (url.pathname === '/health')
      return new Response('ok', { headers: { 'content-type': 'text/plain' } });
    const parsed = parseIconRequest(request.url);
    if ('error' in parsed)
      return new Response(parsed.error, { status: parsed.status, headers: { 'cache-control': 'no-store' } });
    // The catalog is generated from the trusted repository at build time.
    // Never accept or fetch arbitrary user-provided URLs.
    const path = paths[parsed.name];
    if (!path) return new Response('Icon not found', { status: 404, headers: { 'cache-control': 'public, max-age=60' } });
    const ref = /^[a-zA-Z0-9._-]{1,64}$/.test(env.SOURCE_REF || '') ? env.SOURCE_REF : 'main';
    const sourceUrl = `https://raw.githubusercontent.com/veasnawt/vicons/${ref}/${path}`;
    let upstream: Response;
    try {
      upstream = await fetch(sourceUrl, { cf: { cacheTtl: 86400, cacheEverything: true } });
    } catch {
      return new Response('Icon source unavailable', { status: 502 });
    }
    if (upstream.status === 404) return new Response('Icon source missing at pinned ref', { status: 502 });
    if (!upstream.ok) return new Response('Icon source unavailable', { status: 502 });
    let svg: string;
    try { svg = renderSvg(await upstream.text(), parsed); }
    catch { return new Response('Unsupported SVG source', { status: 422 }); }
    return new Response(request.method === 'HEAD' ? null : svg, { status: 200, headers });
  },
};
