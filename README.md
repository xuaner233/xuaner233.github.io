# Xiaoxuan's World

A personal space for notes and discoveries, built with [Docusaurus](https://docusaurus.io/).

## Development

Requires Node.js 20 or newer.

```sh
npm ci
npm start
```

Run `npm run build` to generate the production site in `build/`, and `npm run serve` to preview it.

## Deployment

The GitHub Actions workflow builds and deploys the site when changes are pushed to `master`. In the repository's Pages settings, select **GitHub Actions** as the source.

Posts are stored in `blog/`, docs in `docs/`, and static assets in `static/`. The English and Chinese About pages are in `src/pages/about.md` and `src/pages/about/zh.md`.

The homepage background uses [NASA's M33 image](https://science.nasa.gov/image-detail/amf-cf66fd65-22d4-4502-bd82-bd9d15feb7d2/) from the Chandra galaxy gallery. Credit: X-ray: NASA/CXC/SAO; Optical: ESO/VLT; UV: NASA/Swift; Image Processing: NASA/CXC/SAO/L. Frattare. The image is cropped and darkened by the page layout. ESO material is generally available under [CC BY 4.0](https://www.eso.org/public/outreach/copyright/); see also [NASA's media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).

The Docs section can link to external resources or embed pages that allow framing. External sites may block embedding with `X-Frame-Options` or Content Security Policy, so provide a direct link as a fallback. Blog URLs from before the homepage was added redirect to their new `/blog/` paths.
