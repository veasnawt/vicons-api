# VIcons API catalog fix

This patch fixes the current API's hardcoded `assets/source/symbols/` lookup. The main VIcons repository organizes source SVGs in **many** category directories, including `media`, `navigation`, and `programming`.

## Install

From your local `vicons-api-starter` working copy:

1. Copy `src/index.ts` to `src/index.ts` (replace existing).
2. Copy `src/icon-paths.json` to `src/icon-paths.json`.
3. Copy `scripts/sync-icons.mjs` to `scripts/sync-icons.mjs`.
4. Copy `test/catalog.test.mjs` to `test/catalog.test.mjs`.
5. In `package.json`, set `scripts.sync:icons` to `node scripts/sync-icons.mjs`, `scripts.test` to `node --test test/*.test.mjs` (npm running on Windows CMD should use `node --test test/core.test.mjs test/catalog.test.mjs` instead).
6. Run `npm run sync:icons`. This **must** succeed before deploying or the API will continue to recognize only the nine seeded icons.
7. Run `npm test`, `npm run typecheck`, `npm run dev`. Check icon URLs such as `/video.svg`, `/location.svg`, `/code.svg`, `/desktop.svg` (names confirmed through the VIcons component exports, but whether the SVG filenames match should be checked in the generated catalog).
8. Commit all changes, including `src/icon-paths.json`, and deploy only after local 200 responses.

## Consistency note

`SOURCE_REF` in `wrangler.toml` currently points to `main`; the generated catalog also scans `main`. Ideally pin **both** to the same immutable VIcons commit SHA or tag to prevent them drifting. For now, run sync just before deployment. `VICONS_REF` can specify a ref during sync; change `SOURCE_REF` accordingly.

## Note on testing

The seeded catalog intentionally includes only the nine previously available icons. It is not the final generated catalog. `npm run sync:icons` must fetch the full set from GitHub before release.
