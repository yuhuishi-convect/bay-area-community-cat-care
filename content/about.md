---
title: "About this guide"
layout: "about"
---

This directory is maintained as a Hugo site. Each clinic, voucher, or assistance program has its own Markdown file in `content/resources/`. Structured front matter makes each record searchable and keeps the cards, detail pages, and source links consistent. You can suggest updates by [opening an issue or pull request in the public GitHub repository](https://github.com/yuhuishi-convect/bay-area-community-cat-care).

The interface is available in English, Spanish, and Simplified Chinese. UI translations live in `assets/js/i18n.js`; add a message key there for each language when introducing new interface text, and add `data-i18n="keyName"` to static template text. Provider names, costs, eligibility, and booking information stay in the verified source language unless a reviewed translation is added, so the directory clearly notes that some provider details remain in English.

## Add a clinic or program

Copy a similar file from `content/resources/`, use a short unique filename such as `city-clinic-tnr.md`, and fill in the YAML fields at the top:

- `title`: public name shown on the listing.
- `county`: primary county, for display and fallback.
- `counties`: every county where cats can qualify. These values automatically populate the county selector.
- `cities`: cities or named areas served. Exact city searches match these names.
- `countywide`: set to `true` only when the program serves all cities in one of its listed counties. This lets nearby-city searches include it even when that city is not named in `cities`.
- `type`: `TNR`, `Voucher`, or `Owned-cat clinic`. This controls the service filter; TNR and voucher records appear under “Community cats”.
- `cost`, `booking`, `eligibility`, `details`: concise, verified visitor-facing facts. Use “Contact to confirm” when the provider does not publish a fee or current availability.
- `booking_url`, `website`, `source_url`: direct links to booking instructions, the provider, and the page that supports the listing. These can point to the same page when appropriate.
- `verified`: date checked, for example `Sep 26, 2026`.
- `featured`: optional `true` to raise a listing when nearby options have equal match strength.
- `status`: optional `paused` when the provider explicitly reports that a service is temporarily unavailable.
- `related`: optional list of resource filenames (without `.md`) for associated vouchers, partner clinics, or alternate programs. This adds links on the detail page.

For example, a voucher that can be used at a clinic should have its own resource record. Add the clinic record's filename under `related` on the voucher record, and add the voucher filename under `related` on the clinic record. Their `counties` and `cities` still determine which searches show each listing; related links give people a direct path between the assistance and the place where they book.

## Add a city, area, or county

For an existing region, add the city to `cities` on each resource that serves it. Search ignores capitalization and accents, so `San José` and `San Jose` are equivalent. Include common short forms or alternate names if people may type them differently.

For a new county, add a resource record with the county name in both `county` and `counties`; the county selector will include it automatically. Add its major cities to `cities` on the relevant records. Then add the new county key and city-name aliases to the `aliases` object near the top of `assets/js/site.js`. This helps searches for cities that are not yet named by a provider match the countywide programs without showing city-restricted clinics in the wrong place. Leave out `countywide: true` for clinics that only accept cats from certain cities.

ZIP-code search uses the generated `data/zip-counties.json` lookup. To include another county in ZIP searches, add its five-digit Census county FIPS code and display name to `COUNTIES` in `scripts/build_zip_counties.py`, then run `python3 scripts/build_zip_counties.py`. The lookup is based on Census ZIP Code Tabulation Areas (ZCTAs), which approximate USPS ZIP-code geography and can overlap or differ from ZIP delivery areas; providers' stated service boundaries always take precedence.

## Connect the record to the directory

No registration step is needed: Hugo includes every Markdown file under `content/resources/` in the home page data. The directory filters use `counties`, `cities`, `countywide`, and `type`; the booking and source links are rendered from their URL fields. If two services should point to each other, use matching `related` slug values. Rebuild with `hugo` and preview with `hugo server`.

This is a referral guide, not a booking service. The clinic or government program remains the authority for current eligibility, prices, and appointment availability. The research source ledger is maintained in `RESEARCH.md` in the project repository.
