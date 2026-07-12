# SAYANJALI NEXUS PRIVATE LIMITED — Corporate Website

Official corporate website for SAYANJALI NEXUS PRIVATE LIMITED, founded and led by Syed Ali Hasan Moosavi. A single-file static site — no build step, no framework — deployed on GitHub Pages and maintained entirely from Android via Termux.

**Live site:** `https://shalimoosavi.github.io/<REPO-NAME>/`
**GitHub:** `https://github.com/SHalimoosavi/<REPO-NAME>`

---

## Overview

This site presents SAYANJALI NEXUS as a technology-driven enterprise across AI, Blockchain, Enterprise SaaS, Cybersecurity/OSINT, Corporate Compliance, Developer Tools, and Education Technology — with additional verticals (agriculture, logistics, real estate, e-commerce, cloud kitchen, consulting, community development) clearly labeled as **planned / future roadmap**, not active operations. Keeping that distinction visible is intentional: it's what lets the site survive real diligence from investors, partners, and clients.

---

## Folder Structure

```
/
├── index.html        ← the entire site (HTML + CSS + JS, single file)
├── robots.txt         ← crawler rules + sitemap pointer
└── sitemap.xml         ← tells search engines what to index
```

Everything — layout, styling, animations, and interactivity — lives inside `index.html`. There is no `/src`, no `node_modules`, no build pipeline. This is deliberate: it keeps the project editable from a phone with nothing but `nano` and `git`.

---

## Termux Setup

```bash
pkg install git -y
git clone https://github.com/SHalimoosavi/<REPO-NAME>.git
cd <REPO-NAME>
```

To preview locally before pushing (optional):
```bash
pkg install python -y
python -m http.server 8000
# then open http://localhost:8000 in a browser
```

---

## Editing Content

Everything is inside `index.html`, organized by `<section id="...">` blocks in this order:

| Section ID | What it holds |
|---|---|
| `hero` | Headline, tagline, CTA buttons |
| `about` | Company story, stat counters |
| `vision` | Vision & mission statement |
| `verticals` | The 14 business vertical cards |
| `blockchain-corp` | SAYANJALI BLOCKCHAIN section |
| `syj-token` | SYJ Token section |
| `opensource-corp` | GitHub / open-source project cards |
| `leadership` | Founder / leadership content |
| `technology` | Tech stack + dashboard widget |
| `impact` | Engineering philosophy cards |
| `stats` | Numbers strip |
| `faq` | FAQ accordion (also feeds SEO/AEO schema) |
| `contact` | Contact form + details |

Search for the section ID with `nano`'s search (`Ctrl+W`) or:
```bash
grep -n 'id="verticals"' index.html
```

### Adding a new vertical card
Copy an existing `.vertical-card` block inside `#verticals`, update the icon, name, description, and tag, and set the number/status (`LIVE` or `PLANNED`) accordingly. Update the `01/14`-style numbering across cards if you insert one in the middle.

### Adding a new open-source project
Copy a card block inside `#opensource-corp` and point the `href` at the GitHub repo or live URL.

### Changing colors
All colors are CSS variables at the top of the `<style>` block:
```css
:root{
  --navy:#062B5B;
  --gold:#D4A12A;
  --green:#3FA535;
  --white:#F7F8FA;
  --black:#111111;
}
```
Change these once and the whole site updates.

### Adding a new FAQ item
Duplicate a `.faq-item` block inside `#faq`, **and** add a matching entry in the `FAQPage` JSON-LD block in `<head>` — the visible accordion and the structured data must stay in sync for AEO to work correctly.

---

## Deploying to GitHub Pages

```bash
cd <REPO-NAME>
git add index.html robots.txt sitemap.xml
git commit -m "Update site content"
git push origin main
```

GitHub Pages rebuilds automatically, usually within 1–2 minutes. Verify at your live URL.

**First-time setup**, if Pages isn't enabled yet: repo → Settings → Pages → Source → `main` branch, root folder.

---

## SEO / AEO / GEO Configuration

- **`robots.txt`** and **`sitemap.xml`** must sit in the repo root, next to `index.html`. Verify both load directly in a browser (not a 404) before submitting anything.
- **Structured data** lives in the `<script type="application/ld+json">` block in `<head>`: `Organization`, `LocalBusiness`, `BreadcrumbList`, and `FAQPage`. Update the `@id` and breadcrumb URLs to match your actual repo name — they currently use a placeholder.
- **Submit to Google:** Search Console → Sitemaps → add `sitemap.xml` → Submit. Then URL Inspection → paste homepage URL → Request Indexing for a faster first crawl.
- **AEO** (how AI assistants answer questions about the company) is driven almost entirely by the FAQ section + its schema — keep both current as the company evolves.

---

## Troubleshooting

**Stat counters show "NaN":** the counter script reads either `data-target` or `data-count` on `.counter-num` / `.about-stat-num` elements. If you add a new counter, make sure it has one of those two attributes set to a plain integer.

**Sitemap shows "Couldn't fetch" in Search Console:** almost always means the file wasn't actually pushed/deployed yet, or GitHub Pages hasn't finished rebuilding. Load the sitemap URL directly in a browser first — if it 404s, `git push` again and wait a minute.

**Layout looks broken after an edit:** you likely have an unmatched `<div>`. Check with:
```bash
python3 -c "
c=open('index.html').read()
print('div open', c.count('<div'))
print('div close', c.count('</div>'))
print('section open', c.count('<section'))
print('section close', c.count('</section>'))
"
```
Both pairs of numbers must match exactly.

---

## Roadmap

- Move Cloud Kitchen, Logistics, Agriculture, Real Estate, E-Commerce, Consulting, and Community Development verticals from **PLANNED** to **LIVE** as each ships real products — update both the vertical card status and the FAQ answer listing live verticals when that happens.
- Add a dedicated landing page per vertical (currently all verticals link to in-page anchors).
- Wire up the contact form to an actual backend or form service (currently front-end only).
