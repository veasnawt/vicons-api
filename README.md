# VIcons API

Dynamic, customizable SVG icons for Markdown, GitHub READMEs, and websites. Built on the [VIcons](https://github.com/veasnawt/vicons) icon set and deployed as a lightweight Cloudflare Worker. No React installation is required.

## Live endpoint

**Current deployment:** https://vicons-svg-api.veasnawt.workers.dev

```markdown
![Veasna OS](https://vicons-svg-api.veasnawt.workers.dev/desktop.svg?color=01AEF0&size=48)
```

A custom hostname such as `icons.veasnawt.com` is planned but **not configured or verified yet**. Do not change README examples to it until its HTTPS endpoint works.

## URL format

`GET /:name.svg?color=01AEF0&size=48&stroke=1.5`

| Parameter | Default | Accepted values | Example |
| --- | --- | --- | --- |
| `name` | Required | Existing lowercase VIcons symbol name | `desktop.svg` |
| `color` | `111111` | 3, 6, or 8 hex digits; optionally prefix with URL-encoded `%23` | `01AEF0` |
| `size` | `24` | Integer from 8 to 512 | `48` |
| `stroke` | `2` | Number from 0.5 to 4 | `1.5` |
| `strokeWidth` | `2` | Alias for `stroke`; do not use both | `1.5` |

Unknown or duplicated query parameters return HTTP 400; invalid icon paths return 404; unknown icons return 404.

### Color and size

```markdown
![Blue desktop](https://vicons-svg-api.veasnawt.workers.dev/desktop.svg?color=01AEF0&size=48)
![Purple desktop](https://vicons-svg-api.veasnawt.workers.dev/desktop.svg?color=8B5CF6&size=64&stroke=1.5)
```

### GitHub light/dark theme

The theme fragment belongs **after** the query string:

```markdown
![Desktop](https://vicons-svg-api.veasnawt.workers.dev/desktop.svg?color=111111&size=48#gh-light-mode-only)
![Desktop](https://vicons-svg-api.veasnawt.workers.dev/desktop.svg?color=FFFFFF&size=48#gh-dark-mode-only)
```

Or use GitHub's HTML `<picture>` markup:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://vicons-svg-api.veasnawt.workers.dev/desktop.svg?color=FFFFFF&amp;size=48">
  <img src="https://vicons-svg-api.veasnawt.workers.dev/desktop.svg?color=111111&amp;size=48" width="48" alt="Desktop icon">
</picture>
```

The `size` parameter sets the SVG's intrinsic dimensions. A Markdown renderer may still impose its own display sizing.

## Develop locally

Requirements: Node.js 22+ and npm. Node.js 24 LTS is a suitable choice.

```bash
npm ci
npm test
npm run typecheck
npm run dev
```

Try `http://127.0.0.1:8787/desktop.svg?color=01AEF0&size=48` while the dev server is running. All 12 core unit tests were previously reported passing; verify your checkout independently.

## Deploy

```bash
npx wrangler login
npm run deploy
```

The Worker name is `vicons-svg-api`, and `SOURCE_REF` currently points to `main` in the upstream VIcons repository. Consider pinning a verified immutable commit or release for reproducible production output, with a documented icon-update process.

### Connect a branded custom domain

**Recommended hostname:** `icons.veasnawt.com`. This keeps the API separate from the main `veasnawt.com` website, while permitting `veasnawt.com/vicons/` to be a documentation or landing page.

Prerequisites: `veasnawt.com` must be an active zone in your Cloudflare account, and the `icons` hostname must not conflict with an existing record. Verify current DNS/hosting before making changes.

In Cloudflare Dashboard: **Workers & Pages → vicons-svg-api → Settings → Domains & Routes → Add → Custom Domain**, then enter `icons.veasnawt.com`. Cloudflare manages the required DNS record and TLS certificate for a supported custom domain.

Once configured, check `https://icons.veasnawt.com/health` and test the SVG before advertising the new address. Keep the `workers.dev` hostname available as a fallback.

**Alternatively, when domain prerequisites are verified**, declare the custom domain in `wrangler.toml`:

```toml
workers_dev = true

[[routes]]
pattern = "icons.veasnawt.com"
custom_domain = true
```

Do **not** attach a custom domain directly to the apex `veasnawt.com`, because that would send all of the main site's traffic to the SVG Worker.

To host the API at `veasnawt.com/vicons/` instead, you need a path-specific Worker route plus an explicit `/vicons/` rewrite in the application. That is a separate routing change, not equivalent to a custom domain.

## Security and operations

- Icon sources are restricted to the trusted [VIcons repository](https://github.com/veasnawt/vicons), not caller-provided URLs.
- Request parameters are validated, and source SVGs pass safety checks before being returned.
- Use release-pinned source assets for predictable behavior as the icon library evolves.
- Monitor rate limits, cache behavior, errors, and abuse before recommending the service for high-traffic sites.
- The upstream React package `@veasnawt/vicons` remains independent of the API.

## Related projects

- [VIcons core library](https://github.com/veasnawt/vicons)
- [VIcons icon browser](https://veasnawt.github.io/vicons)
- [Cloudflare Workers custom domains documentation](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
