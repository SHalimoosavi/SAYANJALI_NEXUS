# SAYANJALI NEXUS company website

A multi-page static company and software catalogue for SAYANJALI NEXUS PRIVATE LIMITED, published with GitHub Pages.

## Build requirements

- Node.js 18 or newer.
- No npm packages are required for the build or static validation scripts.
- Generated HTML is committed so GitHub Pages can serve it directly.

## Build and validate

```sh
node scripts/build.mjs
node scripts/validate.mjs
node scripts/validate.mjs --external
```

Optional browser layout check (requires Playwright installed locally):

```sh
npm install --no-save playwright
node scripts/browser-check.mjs
```

## Add a product

1. Review the product repository README, releases, licence file, latest default-branch workflow run and test documentation.
2. Add an entry to `data/products.json` with a clear purpose, stack, features, architecture, limitations, repository, evidence source and verification date.
3. Use a maturity label supported by repository evidence. Production-used requires owner confirmation.
4. Set last push, release, licence and CI fields only when verified. Include a licence only when a licence file exists and GitHub detects it.
5. Add a product-specific meta description between 140 and 160 characters and a title no longer than 60 characters.
6. Add related products only where repository documentation establishes the relationship.
7. Run the build and validator, then inspect the generated page.

## Change the site URL

Change the single `siteUrl` value in `data/site.json`. The builder uses it for canonicals, sitemap URLs, JSON-LD IDs, Open Graph URLs, breadcrumbs and LLM reference files. Rebuild and validate after changing it.

## Structure

- `data/`: company facts, verticals, products, FAQs and repository catalogue.
- `templates/`: shared page template source.
- `scripts/build.mjs`: zero-dependency Node.js static-site generator.
- `scripts/validate.mjs`: offline metadata, links, schema and size checks.
- `assets/`: one stylesheet, one deferred script and brand assets.
- Generated directory-style pages: one `index.html` per route.
- `robots.txt`, `sitemap.xml`, `llms.txt` and `llms-full.txt`: generated from the same data.

## Hosting and limitations

GitHub Pages serves static files only. Contact and demo links compose an email in the visitor's email application; the website does not submit to a server or store form data. The site has no analytics, tracking scripts or cookies.

GitHub Pages does not provide a server-side application backend or configurable HTTP security headers. Open-source software remains governed by the licence in each repository. Repository test figures are labelled as README-reported unless independently rerun.
