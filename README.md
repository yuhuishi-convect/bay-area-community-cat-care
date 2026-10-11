# Bay Area TNR Resource

A Hugo static site that helps people find TNR (trap-neuter-return) and low-cost spay/neuter programs by Bay Area city or county.

## Add or update a resource

Each listing is a Markdown file under `content/resources/`. Copy an existing file and edit its YAML front matter. The visitor-facing [guide at `/about/`](content/about.md) explains every field, adding a clinic, adding a city or county, and linking a voucher with its clinic. In short: `counties` and `cities` power search, `services` powers help/clinic filters and `type` identifies community- versus owned-cat options, and `booking_url` / `source_url` provide the booking and verification links. The county menu is generated from the content. For a new county, also add its city aliases in `assets/js/site.js`; set `countywide: true` only for providers that accept cats across the whole county. Optional `related: [resource-slug]` links connected records, such as a voucher and participating clinic.

The site is static: content changes are reviewed as ordinary source changes and published with the next GitHub Pages build. No visitor submissions or server database are involved.

## Languages

The interface supports English, Spanish, and Simplified Chinese with a browser-persisted language selector; no visitor language choice is sent to a server. Add or revise UI strings in `assets/js/i18n.js` and mark template strings with `data-i18n` (or `data-i18n-placeholder`). Verified provider listing text remains in its source language unless a translation is separately reviewed; booking instructions, prices, and eligibility should never be machine-translated without review.

The search also accepts five-digit ZIP codes. Its bundled `data/zip-counties.json` is generated from the U.S. Census Bureau's ZCTA-to-county relationship data with `python3 scripts/build_zip_counties.py`. ZIP/ZCTA geography is approximate; confirm a provider's service area directly. See `/about/` for adding a county to the ZIP lookup.

## Local preview

Install Hugo, then run `hugo server`. Production output is generated with `hugo` into `public/`.

## GitHub Pages

The public source repository is [yuhuishi-convect/bay-area-community-cat-care](https://github.com/yuhuishi-convect/bay-area-community-cat-care). The site is published at [yuhuishi-convect.github.io/bay-area-community-cat-care/](https://yuhuishi-convect.github.io/bay-area-community-cat-care/).

In repository Settings → Pages → Build and deployment, select **GitHub Actions** as the source. The workflow at `.github/workflows/deploy-pages.yml` builds with Hugo and publishes `public/` on every push to `master`. You can also run it manually from the Actions tab using **Run workflow**. It uses GitHub's built-in token; no Cloudflare account or deployment secrets are required.

The production `baseURL` in `hugo.toml` includes the repository path. Internal navigation and static assets use Hugo-generated URLs so they work under that path as well as in the local preview. The workflow takes the deployment URL from GitHub Pages settings, so a future custom domain will also use the correct base URL.

## Research and accuracy

The directory-wide coverage-review date is recorded in `hugo.toml` (`params.last_resource_research`) and shown on the site footer; update it whenever the research pass is refreshed. The initial listings were reviewed September 25–26, 2026. An October 11, 2026 coverage pass added 23 listings and rechecked selected fees and availability. The directory now has 56 listings across nine counties. Each record retains its own source-check date. Each listing links to its primary source. Prices, capacity, eligibility, and booking windows can change; the source link is authoritative and visitors should confirm current details before trapping or traveling. `content/resources/` is the maintainable directory source. See [RESEARCH.md](RESEARCH.md) for the source ledger and coverage notes.

## Visitor paths

The site centers on Learn TNR (`/learn-tnr/`), Get local help, and Find surgery clinics. Location and `services` determine the finder results; owned-cat records are optional. Supported service values are `surgery`, `tnr-help`, `trap-loans`, and `vouchers`. The county directory (`/resources/`) renders real HTML links to every listing, independent of JavaScript. Google verification is in the shared head template, with canonical URLs and descriptive titles on detail pages.
