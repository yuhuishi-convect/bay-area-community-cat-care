# Bay Area Community Cat Care

A Hugo static site that helps people find TNR (trap-neuter-return) and low-cost spay/neuter programs by Bay Area city or county.

## Add or update a resource

Each listing is a Markdown file under `content/resources/`. Copy an existing file and edit its YAML front matter. The visitor-facing [guide at `/about/`](content/about.md) explains every field, adding a clinic, adding a city or county, and linking a voucher with its clinic. In short: `counties` and `cities` power search, `type` powers service filters, and `booking_url` / `source_url` provide the booking and verification links. The county menu is generated from the content. For a new county, also add its city aliases in `assets/js/site.js`; set `countywide: true` only for providers that accept cats across the whole county. Optional `related: [resource-slug]` links connected records, such as a voucher and participating clinic.

The site is static: content changes are reviewed as ordinary source changes and published with the next Cloudflare Pages build. No visitor submissions or server database are involved.

## Local preview

Install Hugo, then run `hugo server`. Production output is generated with `hugo` into `public/`.

## Cloudflare Pages

The public source repository is [yuhuishi-convect/bay-area-community-cat-care](https://github.com/yuhuishi-convect/bay-area-community-cat-care). The current deployment uses Cloudflare Pages Direct Upload: authenticate with `npx wrangler login`, then run `npm run deploy`. The Pages project name is `bay-area-community-cat-care` and the generated site is in `public/`. Direct Upload does not automatically rebuild on file changes; run the deploy command again after editing. If automatic Git-based deployments are wanted later, create a Git-integrated Pages project connected to the repository.

## Research and accuracy

The directory-wide last research date is recorded in `hugo.toml` (`params.last_resource_research`) and shown on the site footer; update it whenever the research pass is refreshed. Listings were reviewed from program and government sources on September 25–26, 2026. Each listing links to its primary source. Prices, capacity, eligibility, and booking windows can change; the source link is authoritative and visitors should confirm current details before trapping or traveling. `content/resources/` is the maintainable directory source. See [RESEARCH.md](RESEARCH.md) for the source ledger and coverage notes.
