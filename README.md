# Sa’ood Williams — Portfolio

A responsive, hand-built portfolio with a graduation portrait, dark/light themes, live project previews, project case studies and a searchable public GitHub archive.

**Live:** https://cactuscash.github.io/saoodwilliams-com/

## Featured projects

- [Orbit Workspace](https://github.com/CACTUSCASH/orbit-workspace) — persistent kanban board, task editing, filtering, keyboard-accessible status controls, drag-and-drop and JSON export.
- [Prism Analytics](https://github.com/CACTUSCASH/prism-analytics) — validated CSV import, real aggregations, SVG charts, date/category filters, sorted pagination and CSV export.

Both have zero-dependency Node.js / SQLite backends in their own repositories. The hosted portfolio demos intentionally use browser-local storage and fictional sample data; they do not expose unauthenticated backend APIs.

## Local preview

```sh
python3 -m http.server 4180
# open http://localhost:4180
```

The portfolio has no build step. Deploy the repository root with GitHub Pages. Paths are relative so the site also works beneath `/saoodwilliams-com/`. The `labs/` directories are distributable copies of the new projects’ `public/` frontends.

GitHub metadata refreshes from the public GitHub API. A curated fallback remains usable when the request fails or is rate-limited. Only public, non-fork repositories are displayed.

## Validation

Both project repositories include model and HTTP API integration tests using Node’s built-in test runner, including SQLite persistence across server restarts. Desktop and 390px mobile layouts were checked in a browser along with theme switching, repository filtering, case studies, task creation/movement/reload and analytics category/chart controls.

## Design and content

Inspired by the personal, project-focused structure of renlenon.vercel.app, with an original visual design. Built with AI assistance. Existing project descriptions were checked against their source READMEs. The portrait belongs to Sa’ood Williams and is not included in the source-code license.
