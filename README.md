# Bay Area Community Cat Care

A Hugo static site that helps people find TNR (trap-neuter-return) and low-cost spay/neuter programs by Bay Area city or county.

## Add or update a resource

Each listing is a Markdown file under `content/resources/`. Copy an existing file and edit its YAML front matter. The visitor-facing [guide at `/about/`](content/about.md) explains every field, adding a clinic, adding a city or county, and linking a voucher with its clinic. In short: `counties` and `cities` power search, `type` powers service filters, and `booking_url` / `source_url` provide the booking and verification links. The county menu is generated from the content. For a new county, also add its city aliases in `assets/js/site.js`; set `countywide: true` only for providers that accept cats across the whole county. Optional `related: [resource-slug]` links connected records, such as a voucher and participating clinic.

The site is static: content changes are reviewed as ordinary source changes and published with the next Cloudflare Pages build. No visitor submissions or server database are involved.

The search also accepts five-digit ZIP codes. Its bundled `data/zip-counties.json` is generated from the U.S. Census Bureau's ZCTA-to-county relationship data with `python3 scripts/build_zip_counties.py`. ZIP/ZCTA geography is approximate; confirm a provider's service area directly. See `/about/` for adding a county to the ZIP lookup.

## Local preview

Install Hugo, then run `hugo server`. Production output is generated with `hugo` into `public/`.

## Cloudflare Pages

The public source repository is [yuhuishi-convect/bay-area-community-cat-care](https://github.com/yuhuishi-convect/bay-area-community-cat-care). It uses Cloudflare Pages Direct Upload with a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`. Pushes to `master` build with Hugo and deploy the generated `public/` directory to the production Pages project `bay-area-community-cat-care`.

Before Actions can deploy, add these repository secrets under GitHub Settings → Secrets and variables → Actions:

- `CLOUDFLARE_API_TOKEN`: a custom Cloudflare API token with Account → Cloudflare Pages → Edit permission.
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID for the Pages project.

The workflow sets the Direct Upload project's production branch to `master` before deployment. Direct Upload projects cannot be converted to Cloudflare's built-in Git integration later; this workflow is the CI/CD path for this project. For a manual local deploy, authenticate with `npx wrangler login` and run `npm run deploy`.

## Research and accuracy

The directory-wide last research date is recorded in `hugo.toml` (`params.last_resource_research`) and shown on the site footer; update it whenever the research pass is refreshed. Listings were reviewed from program and government sources on September 25–26, 2026. Each listing links to its primary source. Prices, capacity, eligibility, and booking windows can change; the source link is authoritative and visitors should confirm current details before trapping or traveling. `content/resources/` is the maintainable directory source. See [RESEARCH.md](RESEARCH.md) for the source ledger and coverage notes.
