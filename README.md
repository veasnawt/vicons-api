# VIcons API

A standalone Cloudflare Worker that makes the existing monochrome [VIcons](https://github.com/veasnawt/vicons) SVG symbols customizable in Markdown image URLs. It is **not deployed** and the illustrative domain below does not work yet.

## Run locally

```bash
npm install
npm test
npm run typecheck
npm run dev
```

Local example: `http://localhost:8787/desktop.svg?color=01AEF0&size=48&stroke=1.5`.

## Deploy (after review)

```bash
npx wrangler login
npm run deploy
```

Cloudflare prints a real `*.workers.dev` URL. Try that URL before configuring a custom domain. Add `icons.vicons.dev` only if you own/control that domain; otherwise select an owned subdomain.

## API

`GET /:name.svg?color=01AEF0&size=48&stroke=1.5`

- `name`: lowercase VIcons symbol basename, e.g. `desktop`.
- `color`: 3, 6 or 8 hex digits, optional leading `#` (URL-encode as `%23`); defaults to `111111`.
- `size`: integer 8–512, default 24; sets SVG intrinsic width and height.
- `stroke`/`strokeWidth`: 0.5–4, default 2.
- Unknown parameters and malformed values return 400.
- Missing names return 404.
- Image sources are fetched only from the hardcoded VIcons repo, never user-controlled URLs.

Once deployed, this works in GitHub Markdown:

```markdown
![Veasna OS](https://YOUR-WORKER-URL/desktop.svg?color=01AEF0&size=48)
```

For dark/light themes use two URLs with GitHub's `#gh-light-mode-only` / `#gh-dark-mode-only` fragments, or HTML `<picture>` with the Worker URLs as the `srcset`.

**Note:** SVG `size` controls the intrinsic rendered dimensions; some Markdown hosts can override displayed dimensions through CSS.

## Production checklist

- Verify sample icons and run tests and typecheck.
- Pin `SOURCE_REF` to an immutable release tag for predictable caching before production (rather than tracking `main`).
- Add rate limiting and monitor abuse/egress if publicly exposed at scale.
- Audit SVG sources and monitor requests returning 422 (unsupported/suspicious SVG).
- Configure custom domain and CDN caching only after the endpoint is verified.
- Keep API separate from React package `@veasnawt/vicons` for backward compatibility.

## Integration

This is a separate repository, intended to live at `veasnawt/vicons-api`. It consumes immutable, versioned SVG sources from [`veasnawt/vicons`](https://github.com/veasnawt/vicons), without modifying or requiring React. Once deployed, add API examples and a Markdown generator to the original VIcons documentation.
