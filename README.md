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

Posts are stored in `blog/` and static assets in `static/`.
