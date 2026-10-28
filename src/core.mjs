const ICON_NAME = /^[a-z][a-z0-9-]{0,63}$/;
const HEX_COLOR = /^(?:[a-fA-F0-9]{3}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/;

export function parseIconRequest(urlString) {
  const url = new URL(urlString);
  const match = /^\/([a-z][a-z0-9-]{0,63})\.svg$/.exec(url.pathname);
  if (!match || !ICON_NAME.test(match[1])) return { error: 'Invalid icon path', status: 404 };
  const allowed = new Set(['color', 'size', 'stroke', 'strokeWidth']);
  for (const key of url.searchParams.keys()) {
    if (!allowed.has(key)) return { error: `Unsupported parameter: ${key}`, status: 400 };
    if (url.searchParams.getAll(key).length !== 1) return { error: `Duplicate parameter: ${key}`, status: 400 };
  }
  const rawColor = (url.searchParams.get('color') || '111111').replace(/^#/, '');
  if (!HEX_COLOR.test(rawColor)) return { error: 'color must be 3, 6 or 8 hex digits', status: 400 };
  const sizeStr = url.searchParams.get('size') ?? '24';
  const size = Number(sizeStr);
  if (!/^\d+$/.test(sizeStr) || !Number.isInteger(size) || size < 8 || size > 512) return { error: 'size must be an integer from 8 to 512', status: 400 };
  if (url.searchParams.has('stroke') && url.searchParams.has('strokeWidth')) return { error: 'Use either stroke or strokeWidth', status: 400 };
  const strokeStr = url.searchParams.get('strokeWidth') ?? url.searchParams.get('stroke') ?? '2';
  const stroke = Number(strokeStr);
  if (!/^(?:[0-9]+(?:\.[0-9]+)?)$/.test(strokeStr) || !Number.isFinite(stroke) || stroke < 0.5 || stroke > 4) return { error: 'stroke must be between 0.5 and 4', status: 400 };
  return { name: match[1], color: `#${rawColor.toUpperCase()}`, size, stroke };
}

export function renderSvg(source, options) {
  // Only serve canonical simple VIcons SVGs sourced from the trusted repository.
  if (!/^\s*<svg\s[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]*>/i.test(source) || !/<\/svg>\s*$/.test(source)) throw Error('Not a valid VIcons SVG');
  if (/<(?:script|foreignObject|image|use|style|animate|set)\b|\bon\w+\s*=|<!|<\?|\b(?:href|xlink:href)\s*=|\burl\s*\(/i.test(source)) throw Error('Unsafe SVG');
  if (source.length > 50000) throw Error('SVG too large');
  let result = source.replace(/currentColor/g, options.color);
  result = result.replace(/<svg\b([^>]*)>/i, (_whole, attributes) => {
    const cleaned = attributes
      .replace(/\s(?:width|height|stroke-width)\s*=\s*"[^"]*"/gi, '');
    return `<svg${cleaned} width="${options.size}" height="${options.size}" stroke-width="${options.stroke}">`;
  });
  return result;
}
