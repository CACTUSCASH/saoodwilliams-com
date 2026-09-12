export const githubBase = "https://github.com/CACTUSCASH/";
export const projects = [
  {
    id: "canvas",
    name: "Canvas Rooms",
    category: "fullstack",
    type: "COLLABORATION / DIAGRAM EDITOR",
    repo: "canvas-rooms",
    demo: "labs/canvas/",
    tags: ["Convergent operations", "SVG", "SQLite / SSE"],
    wash: "#8399b6",
    screen: "#111923",
    summary:
      "Draw a system together across browser tabs. Move a shape in one view, edit its text in another, and watch the changes meet.",
    detail: "Open a second tab. Change different fields at the same time.",
    challenge:
      "Shared editing needs a consistent answer when changes arrive out of order. Canvas Rooms combines field-level operations so independent edits survive, while explicit tie-breaking and deletion rules keep each tab in agreement.",
    features: [
      "Build diagrams with boxes, ellipses, notes, and connectors, then edit text, size, color, and position.",
      "Share a room across same-origin tabs with real presence and live updates.",
      "Move shapes with the keyboard, undo local actions, import JSON, and export JSON or SVG.",
    ],
    architecture:
      "An SVG editor applies per-field operations ordered by Lamport counters and client IDs. Permanent deletion tombstones prevent late updates from reviving removed shapes. The hosted demo uses BroadcastChannel and browser storage; an optional local Node.js server persists operations in SQLite and streams updates over SSE.",
    diagram: [
      "Canvas operations",
      "Deterministic merge",
      "Tabs / SQLite + SSE",
    ],
    validation:
      "Tests verify convergence across delivery orders, tied clocks, deletion safety, replay idempotence, rejected imports, and safe SVG output. Server checks cover atomic validation, SQLite persistence after restart, and SSE replay.",
    limits:
      "The hosted demo collaborates across same-origin tabs in one browser profile, with no cloud service. Rooms support 5,000 operations and the editor allows 128 shapes. Concurrent changes to the same field choose one value; text does not merge character by character. The optional local server has no account authentication.",
  },
  {
    id: "quorum",
    name: "Quorum Lab",
    category: "algorithms",
    type: "DISTRIBUTED SYSTEMS / CONSENSUS",
    repo: "quorum-lab",
    demo: "labs/quorum/",
    tags: ["Raft rules", "Deterministic simulation", "Fault injection"],
    wash: "#859879",
    screen: "#0e151d",
    summary:
      "Split a network and challenge its agreement. Follow elections, competing writes, and the log entries that survive recovery.",
    detail: "Isolate the leader. See why two votes cannot commit a write.",
    challenge:
      "A successful write means more than reaching one server. Quorum makes the majority rule visible, showing how a minority leader can accept a pending write while a new leader commits a different history.",
    features: [
      "Step through seeded elections, votes, and actual scheduled messages across five nodes.",
      "Partition links, crash or restart processes, and send writes to a selected leader.",
      "Inspect each log, distinguish pending and committed entries, and export the event history and majority acknowledgements.",
    ],
    architecture:
      "A deterministic JavaScript scheduler implements core Raft election, log freshness, prefix repair, and current-term majority commit rules. SVG renders the model's actual node states and queued messages. Simulated restarts retain each node's term, vote, and log.",
    diagram: ["Seeded messages", "Votes + replication", "Committed prefix"],
    validation:
      "Tests exercise 60 seeded fault schedules, majority loss, stale candidates, retained votes, competing writes, and recovery. Committed prefixes, election safety, and log matching are checked throughout.",
    limits:
      "Educational simulation in one browser, with five fixed voters, 96 log entries per node, and 5,000 ticks per run. No networked backend, persistent disk, membership changes, or linearizable read API. Runs do not survive a page reload.",
  },
  {
    id: "relay",
    name: "Relay Workflows",
    category: "fullstack",
    type: "WORKFLOW ENGINE",
    repo: "relay-workflows",
    demo: "labs/relay/",
    tags: ["Node.js", "SQLite", "Execution engine"],
    wash: "#b38350",
    screen: "#161718",
    summary:
      "Build a workflow you can follow. Connect nodes, choose a branch, and inspect what happened at every step.",
    detail: "Try the retry fixture. Watch the failure recover.",
    challenge:
      "A workflow should be easy to inspect when something goes wrong. Relay pairs an editable node graph with a trace that records inputs, outputs, branches, and retry attempts.",
    features: [
      "Edit transforms, conditions, delays, and connections in a visual workflow.",
      "Execute the same deterministic engine in the browser or through the Node API.",
      "Inspect run history and a simulated HTTP failure that recovers on retry.",
    ],
    architecture:
      "A shared JavaScript engine validates a directed graph before running it. Typed operations avoid evaluating user code. The local Node.js API stores workflows and execution history in SQLite; the hosted demo runs the engine in the browser.",
    diagram: ["Workflow graph", "Validated engine", "Run history"],
    validation:
      "Tests cover branching, retry recovery, graph cycles, invalid payloads, and SQLite persistence after the server restarts.",
    limits:
      "Single-user project. HTTP nodes use labelled fixtures, so no external services are contacted. The hosted demo saves to browser storage. The local backend binds to localhost and does not include authentication.",
  },
  {
    id: "spectra",
    name: "Spectra Studio",
    category: "graphics",
    type: "CREATIVE CODE / WEBGL2",
    repo: "spectra-studio",
    demo: "labs/spectra/",
    tags: ["WebGL2", "GLSL", "GPU rendering"],
    wash: "#51444e",
    screen: "#101016",
    summary:
      "A live studio for fragment shaders. Edit the source, move through the canvas, and see the pixels respond.",
    detail: "Break a shader. The last valid program keeps running.",
    challenge:
      "Experimenting with graphics should leave room for mistakes. Spectra makes the compiler part of the workflow while keeping a valid image on screen.",
    features: [
      "Explore five original GLSL studies with live time, pointer, scale, and intensity controls.",
      "Compile your edits, inspect shader errors, and keep the last working program.",
      "Save named patches locally, import portable JSON, and export a real PNG.",
    ],
    architecture:
      "A fullscreen triangle runs fragment programs in WebGL2. A small renderer owns shader compilation, program linking, cached uniforms, and resource cleanup. Failed programs never replace the current one. Animation stops when the canvas is hidden or paused.",
    diagram: ["GLSL source", "Compile + link", "GPU canvas"],
    validation:
      "Tests cover shader validation, failed resource cleanup, keeping the prior program, and avoiding new allocations across repeated frames. All five presets were checked in a browser.",
    limits:
      "Requires WebGL2. Performance depends on the device GPU. Patches are saved only in the current browser. No account or server is needed.",
  },
  {
    id: "atlas",
    name: "Atlas Pathfinder",
    category: "algorithms",
    type: "ALGORITHMS / INTERACTIVE MAP",
    repo: "atlas-pathfinder",
    demo: "labs/atlas/",
    tags: ["A* / Dijkstra / BFS", "Web Worker", "Seeded maps"],
    wash: "#93aaa0",
    screen: "#f4f7f2",
    summary:
      "Paint a map and watch a search unfold. Compare three strategies on the same walls, weights, and endpoints.",
    detail: "Add expensive terrain. See which route each search takes.",
    challenge:
      "The final route only tells part of the story. Atlas exposes the cells each algorithm explores, then lets you change the map and compare the result.",
    features: [
      "Paint walls and weighted terrain with pointer or keyboard controls.",
      "Run A*, Dijkstra, or BFS in a worker with pause, step, and speed controls.",
      "Compare search cost and expanded cells, generate reproducible mazes, and import or export maps.",
    ],
    architecture:
      "A validated map model and stable binary heap support a module Web Worker. Search runs away from the UI thread, then the browser animates the actual visited order. BFS optimizes steps; A* and Dijkstra account for terrain cost.",
    diagram: ["Editable grid", "Search worker", "Animated route"],
    validation:
      "Tests compare A* and Dijkstra against an independent shortest-path implementation across 120 seeded maps. Other checks cover maze connectivity, invalid imports, worker execution, and the static server.",
    limits:
      "Four-direction grids up to 64 by 48 cells. Maps stay in browser storage. Random terrain can be unreachable; generated mazes are connected. This is an algorithm lab, not a geographic routing service.",
  },
  {
    id: "orbit",
    name: "Orbit Workspace",
    category: "fullstack",
    type: "PRODUCTIVITY / TASK WORKSPACE",
    repo: "orbit-workspace",
    demo: "labs/orbit/",
    tags: ["JavaScript", "Node.js", "SQLite"],
    wash: "#9995ae",
    screen: "#16151c",
    summary:
      "A focused workspace for moving tasks forward. Edit the details, drag between columns, and pick up where you left off.",
    detail: "Create a task, move it, then reload the board.",
    challenge:
      "Keep task management useful without burying the board in settings. Orbit gives each task a clear status, priority, and editable context.",
    features: [
      "Create, edit, and delete tasks with descriptions, labels, and priorities.",
      "Move work with drag-and-drop or a keyboard-accessible status control.",
      "Search, filter, and export the board as JSON.",
    ],
    architecture:
      "Native JavaScript modules handle the interface. A local Node.js HTTP API validates complete board snapshots and persists them using prepared SQLite statements. The hosted demo uses browser storage.",
    diagram: ["Task board", "Validated API", "SQLite state"],
    validation:
      "Model and HTTP tests check valid tasks, rejected writes, combined filters, and persistence after restarting the server.",
    limits:
      "Single-user workspace with fictional sample tasks. The public demo saves in the browser. The local API is bound to localhost and has no authentication.",
  },
  {
    id: "prism",
    name: "Prism Analytics",
    category: "fullstack",
    type: "DATA / CSV ANALYTICS",
    repo: "prism-analytics",
    demo: "labs/prism/",
    tags: ["CSV parsing", "SVG charts", "Node.js / SQLite"],
    wash: "#b1bbaa",
    screen: "#fff",
    summary:
      "Bring a CSV into focus. Filter a dataset, explore its revenue, and take the useful rows back out.",
    detail: "Import the sample CSV and compare its categories.",
    challenge:
      "Explore a small sales dataset without uploading it to a third-party dashboard. Prism keeps parsing and aggregation local to the browser.",
    features: [
      "Import and validate quoted CSV fields, dates, amounts, and order counts.",
      "Filter categories and dates, switch between area and bar charts, and sort records.",
      "Export the current selection with spreadsheet formula protection.",
    ],
    architecture:
      "A pure JavaScript parser and aggregation model feed SVG charts and a paginated table. The optional local Node.js API stores validated datasets in SQLite.",
    diagram: ["CSV input", "Validated aggregates", "Charts + export"],
    validation:
      "Tests cover CSV quoting, malformed rows, real calendar dates, currency arithmetic, safe exports, and database persistence after a restart.",
    limits:
      "Up to 10,000 rows or 2 MB. Revenue is displayed in USD and the sample data is fictional. The hosted demo stores its dataset in the browser.",
  },
  {
    id: "ledger",
    name: "Freelance Ledger",
    category: "fullstack",
    type: "FINANCE / SOURCE PROJECT",
    repo: "freelance-ledger",
    tags: ["Next.js", "Supabase"],
    summary:
      "Multi-currency invoicing with email sign-in and account-scoped data.",
    challenge:
      "Keep invoices, paid totals, and outstanding balances separated by account and currency.",
    features: [
      "Email-link sign-in and per-account access rules.",
      "Invoice line items calculated in integer minor units.",
      "Currency summaries and exchange-rate conversion with a fallback.",
    ],
    architecture:
      "Next.js 14, TypeScript Server Actions, Supabase Auth, and PostgreSQL Row Level Security. Docker and GitHub Actions are included.",
    diagram: ["Next.js UI", "Server Actions", "Supabase / RLS"],
    validation:
      "The repository includes tests for monetary calculations and exchange-rate handling.",
    limits:
      "Source project. Authenticated features require your own Supabase configuration.",
  },
  {
    id: "headers",
    name: "Headerwatch",
    category: "fullstack",
    type: "SECURITY / SOURCE PROJECT",
    repo: "headerwatch",
    tags: ["TypeScript", "PostgreSQL"],
    summary:
      "HTTP header reports with weighted scoring and saved scan history.",
    challenge:
      "Make missing or weak HTTP security headers easier to understand and revisit.",
    features: [
      "Six weighted header checks with pass, warn, or fail results.",
      "An overall score and letter grade.",
      "Authenticated saved sites and scan history.",
    ],
    architecture:
      "Next.js 14, TypeScript, a pure grading module, injectable fetch, and Supabase Auth/PostgreSQL.",
    diagram: ["Site URL", "Header grading", "Saved report"],
    validation:
      "Unit tests and a GitHub Actions workflow are included in the source.",
    limits:
      "Saved scans require Supabase configuration. A header score is a focused configuration check, not a complete security audit.",
  },
  {
    id: "shader",
    name: "Shader Play",
    category: "graphics",
    type: "PARTICLES / SOURCE PROJECT",
    repo: "shader-play",
    tags: ["React Three Fiber", "GLSL"],
    summary: "A GPU particle playground with custom shaders and live controls.",
    challenge:
      "Move particle evolution onto the GPU so the CPU does not recalculate every particle on each frame.",
    features: [
      "A 50,000-point particle scene.",
      "Controls for size, gravity, spread, palette, and count.",
      "Custom vertex and fragment shaders.",
    ],
    architecture:
      "Next.js 15, TypeScript, React Three Fiber, and GLSL. Time and particle seeds drive positions on the GPU; controls update uniforms.",
    diagram: ["React controls", "Shader uniforms", "GPU particles"],
    validation: "The source documents the shader model and exposed controls.",
    limits:
      "Source project. Rendering performance depends on WebGL support and the device GPU.",
  },
];
