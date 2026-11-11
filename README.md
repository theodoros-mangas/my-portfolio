# Theodoros Mangas - Software Engineering Portfolio

Source for my personal portfolio site. I'm a software engineer (Python · Django), backend-focused and comfortable across the full stack, who builds, ships and runs Django applications end to end, with a surveying and geoinformatics background.

## Focus

- Backend Python/Django: data modelling, REST APIs (DRF), Celery background jobs, ORM performance
- Testing and delivery: Django tests in CI with ruff and mypy, Docker Compose deployments on Linux
- Full-stack platforms with custom CMS/admin tooling, in Greek and English
- Geospatial pipelines (DXF/KML/KMZ/GeoJSON) and coordinate transformations, validation-first

## Tech Stack (Website)

- HTML5
- CSS3 (one hand-written stylesheet, including a small base layer and utilities; no CSS framework or CDN)
- JavaScript (Vanilla)

No build step and no runtime dependencies.

## Structure

```
index.html                      Home page: projects, about, experience, skills, contact
case-studies/
  handytools/index.html         Case study pages (one article each, with inline SVG diagrams)
  iasmos-museum/index.html
  citycare/index.html
404.html                        Not-found page (uses absolute /my-portfolio/ paths, see below)
sitemap.xml, robots.txt         Crawl files (absolute URLs)
assets/
  style.css                     All styles, shared by every page
  app.js                        Terminal, galleries, lightbox, sticky header, back-to-top
  files/                        CV (PDF)
  img/                          Favicons, social card, screenshots/
```

Old `#case-handytools`, `#case-iasmos` and `#case-citycare` links on the home page redirect to the matching case study page.

## Run Locally

Serve the repository root with a static server, for example:

```
python -m http.server 8000
```

Then open http://localhost:8000/. Pages use relative URLs so they work both locally and under the `/my-portfolio/` subpath on GitHub Pages. The exception is `404.html`: GitHub Pages serves it for missing paths at any depth, so it uses absolute `/my-portfolio/...` URLs and will only look right when served from that subpath.

## Update Content

- Home page: `index.html`
- Case studies: `case-studies/<name>/index.html`
- Styles: `assets/style.css`
- Interactions: `assets/app.js`
- Project screenshots: `assets/img/screenshots/` (WebP, 1600px wide; keep each `<img>` `width`/`height` equal to the file's real size)
- Social preview card: `assets/img/og-card.svg` (edit, then re-export to `og-card.png` at 1200×630)
- New pages: add them to `sitemap.xml`

## Live Portfolio

https://theodoros-mangas.github.io/my-portfolio/

## License

Released under the MIT License; see [LICENSE](LICENSE).
