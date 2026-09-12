# Sa'ood Williams | Portfolio

A portfolio for a full-stack developer in Cape Town. Explore seven working demos, read the engineering decisions behind them, and browse public GitHub projects.

[Open the portfolio](https://cactuscash.github.io/saoodwilliams-com/)

## Working demos

| Project                                                            | Try it                                                                       | What it does                                                                                                                        |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [Canvas Rooms](https://github.com/CACTUSCASH/canvas-rooms)         | [Open Canvas](https://cactuscash.github.io/saoodwilliams-com/labs/canvas/)   | Edit an SVG diagram, merge changes between browser tabs, inspect actual tab presence, and export JSON or SVG.                       |
| [Quorum Lab](https://github.com/CACTUSCASH/quorum-lab)             | [Open Quorum](https://cactuscash.github.io/saoodwilliams-com/labs/quorum/)   | Partition a five-node consensus simulation, crash a leader, submit writes, and inspect elections, log repair, and majority commits. |
| [Relay Workflows](https://github.com/CACTUSCASH/relay-workflows)   | [Open Relay](https://cactuscash.github.io/saoodwilliams-com/labs/relay/)     | Edit a workflow graph, transform a payload, choose a condition branch, test simulated HTTP retries, and inspect execution history.  |
| [Spectra Studio](https://github.com/CACTUSCASH/spectra-studio)     | [Open Spectra](https://cactuscash.github.io/saoodwilliams-com/labs/spectra/) | Edit GLSL fragment shaders, compile changes, keep the last working program after errors, save patches, and export a PNG.            |
| [Atlas Pathfinder](https://github.com/CACTUSCASH/atlas-pathfinder) | [Open Atlas](https://cactuscash.github.io/saoodwilliams-com/labs/atlas/)     | Paint walls and weighted terrain, compare A*, Dijkstra, and BFS, and inspect the actual search order on reproducible maps.          |
| [Orbit Workspace](https://github.com/CACTUSCASH/orbit-workspace)   | [Open Orbit](https://cactuscash.github.io/saoodwilliams-com/labs/orbit/)     | Create and edit tasks, move them between columns, filter the board, and export its state.                                           |
| [Prism Analytics](https://github.com/CACTUSCASH/prism-analytics)   | [Open Prism](https://cactuscash.github.io/saoodwilliams-com/labs/prism/)     | Import validated CSV data, filter dates and categories, explore SVG charts, sort records, and export a selection.                   |

The portfolio also includes source-focused case studies for Freelance Ledger, Headerwatch, and Shader Play. Their setup requirements are described separately from the seven hosted demos.

## Browser and server scope

GitHub Pages serves static files. All seven hosted demos execute in the visitor's browser. Where a demo supports saving, data stays in browser storage; clearing site data removes those local saves. Sample tasks and sales records are fictional. Canvas Rooms shows actual connected browser tabs, while Quorum's five nodes are simulated processes.

Relay, Orbit, and Prism each have an optional Node.js 24 backend in their own repository. Those backends use SQLite and Node's built-in APIs, require no npm dependencies, and bind to localhost. They are single-user applications without authentication. The hosted portfolio does not run or connect to those servers.

Canvas Rooms synchronizes operations between same-origin tabs in the same browser through BroadcastChannel, with deterministic per-field merging and deletion tombstones. Its optional Node.js 24 backend persists operations in SQLite and delivers room updates through Server-Sent Events with replay on reconnection. That service is intended for trusted local use, binds to localhost, and has no authentication. The hosted demo uses browser storage and tab synchronization. It does not provide internet-wide collaboration or accounts.

Quorum Lab is a deterministic educational model of core Raft rules. Its five JavaScript nodes run in one browser process, with seeded message scheduling, simulated stable state across node restarts, and inspectable pending and committed log entries. It has no external cluster, persistent disk, or network RPC. Runs are bounded to 5,000 logical ticks and 96 log entries per node; JSON export supports inspection, while page reload starts a fresh run.

Relay's HTTP nodes use deterministic fixtures. They simulate responses and retries without calling external services. Spectra renders with WebGL2 and requires compatible browser graphics support. Atlas performs searches in a Web Worker; BFS minimizes steps while A* and Dijkstra account for terrain costs.

## Run this site locally

Use a current Node.js installation. The static-site scripts use built-in Node modules, so installing the legacy frontend dependencies is unnecessary for this workflow.

```sh
npm run dev
```

Open `http://127.0.0.1:4180`. To choose a different port:

```sh
PORT=4181 npm run dev
```

`npm start` runs the same static server. Validate local references with:

```sh
npm run build
```

Despite its conventional name, `build` is a static-site check. It verifies local asset and module references in the portfolio and labs, then reports the result. It does not compile Next.js or produce a `dist` directory. It also does not replace browser testing or the individual projects' test suites.

The published site is served from the repository root. Relative paths support the `/saoodwilliams-com/` GitHub Pages prefix. Each `labs/` folder contains the corresponding project's distributable browser files. Update those copies from the project repository when changing a demo.

## Interactions and accessibility

- The opening section introduces Sa'ood by name and portrait. Hover or keyboard focus transforms the photograph into 57,600 image-sampled particles rendered with WebGL2. Pointer movement changes their depth and pushes nearby particles away. Click, Enter, Space, or tap keeps the effect open; activating the control again reassembles the portrait. The original image file is unchanged.
- Project filters separate application, graphics, and algorithm work. Embedded previews lead to a full interactive demo or a case study.
- Case studies include overview and engineering tabs, with an interactive demo tab where available. Tabs support arrow keys, Home, and End; native dialogs support keyboard focus and Escape.
- Quick navigation opens with Ctrl/Cmd K and searches sections and demos. Theme and motion preferences persist in browser storage when available.
- The page includes a skip link, labeled controls, visible focus indicators, a quick introduction, CV downloads in [PDF](Saood-Williams-CV.pdf) and [DOCX](Saood-Williams-CV.docx), and email links.
- Reduced-motion preferences and the page motion control stop the portrait effect and restore the original photo. The photo also remains available while the texture loads, when WebGL2 is unavailable, or after a graphics-context failure. Its canvas is decorative and hidden from assistive technology.
- The motion control also informs compatible embedded previews when to pause. Preview frames are excluded from keyboard navigation; the interactive version is available through a separate control.

## Rendering and data

The portfolio uses HTML, CSS, and native JavaScript modules. A neutral palette, consistent typography, and a featured project followed by a two-column gallery establish the page hierarchy. The portrait renderer is in `portrait.js`; Spectra is the separate shader-editing project.

Preview frames load near the viewport and receive visibility and motion state from the parent page. Compatible previews animate when their card is hovered or contains keyboard focus. Visitors can disable motion; reduced-motion preferences are respected. Quorum's preview runs a bounded sequence of example writes and then stops.

The portrait uploads one image texture, caches shader uniforms and GPU resources, and derives particle positions from vertex IDs. A spring transition opens and reassembles the image. The rendering loop stops when the effect is idle, the portrait leaves the viewport, the document is hidden, or motion is disabled. The original photo is restored whenever rendering pauses. Canvas resolution and pixel density are capped. The page uses the normal cursor, native scrolling, and immediately visible content.

The GitHub archive requests public repository metadata from GitHub's API, filters out forks and private entries, and supports search and incremental display. A curated project list remains available if the API request fails or is rate-limited. No GitHub token is included in the client. Fonts are loaded from Google Fonts with system fallbacks.

## Repository layout

```text
index.html          Published page structure and metadata
styles.css          Responsive layout, themes, and motion styles
app.js              Project rendering, dialogs, filters, and GitHub archive
portrait.js         GPU particle portrait and static-image fallback
projects.js         Project descriptions and engineering notes
assets/             Portrait and site icon
labs/               Seven static browser demos
Saood-Williams-CV.pdf  Two-page CV for viewing and downloading
Saood-Williams-CV.docx Editable version of the same CV
tools/serve.mjs      Local static server
tools/check-site.mjs Local reference checker
```

The earlier Next.js implementation remains in `app/`, `components/`, and its associated configuration files. It is preserved as source and is not built or executed as the route for the published portfolio. `npm run legacy:dev` retains the original Next.js development entry point and requires its dependencies. The package manifest still lists those legacy dependencies.

Project-specific tests and backend instructions belong to the individual project repositories. Their suites cover the relevant execution engines, graphics resource handling, pathfinding behavior, operation convergence, event replay, consensus safety, data validation, and persistence. This repository's static check focuses on the assembled portfolio.

Run `npm test` for portrait renderer resource tests. They check texture upload and reuse, shader and allocation failure cleanup, context loss, and bounded particle counts. Browser checks cover the visible effect, tap controls, motion preferences, and the 390-pixel layout.

## Content and license

Project notes describe implemented behavior and state the limits of each demo. Update profile and contact details in `index.html`, and maintain project descriptions in `projects.js`.

The source-code license is in [LICENSE](LICENSE). The personal portrait and CV are not included in that source-code license.
