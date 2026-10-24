# PATCH//PLAY v3

> Play the consequences. Change the cause.

PATCH//PLAY is a local cooperative debugging campaign. `PLAYER_01` explores a facility whose systems are controlled by deliberately broken TypeScript modules. A gameplay failure becomes structured evidence for `DEV_02`, who edits the actual module, runs regression checks in an isolated runtime, deploys a candidate, and hands control back to the player for physical verification.

The default experience is a judge-friendly 57/43 split screen. Gamer and Coder roles can also be opened in synchronized local windows while the main window remains authoritative.

## Campaign

| Wing | Gameplay | Incident 1 | Incident 2 |
| --- | --- | --- | --- |
| Transit | key, scanner, bridge, access gate | boundary collapse | destructive gate authorization |
| Signal | relays, glyph order, alarm sweep | partial sequence acceptance | seconds/milliseconds mismatch |
| Cargo | crates, plates, conveyors | ghost occupancy | rectangular map indexing |
| Reactor | valves, lasers, event queue | missing stable transition | reversed event priority |

Each incident must be produced in the world. Incident 2 stays latent until Incident 1 is patched and verified. Later test runs include the earlier incident as a regression.

## Technical pipeline

```text
keyboard intent
  → deterministic world event
  → live compiled cartridge export
  → QuickJS result
  → incident evidence + replay trace
  → CodeMirror candidate edit
  → esbuild-wasm compile
  → active + prior regression tests
  → guarded deployment
  → player verification
```

- **React 19 + Vite 8** render the campaign shell and role workspaces.
- **Canvas 2D** renders the tile world, entities, scanner overlay, lighting, and role-colored facility themes.
- **CodeMirror 6** supplies a real multi-file TypeScript editing surface with read-only project files, history, search, syntax highlighting, and suspect-line decoration.
- **esbuild-wasm** bundles only virtual relative imports from the active cartridge. URL, Node, data, and external package imports are rejected.
- **QuickJS via `quickjs-emscripten`** executes bundles in a Web Worker, separate from the page and React state.
- **Zod** validates cartridge and worker-message contracts.
- **BroadcastChannel** synchronizes optional Gamer/Coder windows with the authoritative host snapshot and heartbeat.
- **Vitest + Playwright** protect reducer gates, cartridges, regression behavior, Guided/Challenge presentation, and the full two-incident Level 1 path.

Candidate code has no DOM, storage, browser global, or network access. The worker applies a 32 MB memory limit, 512 KB stack limit, 50 ms per-call CPU budget, one-second suite ceiling, two-second compilation ceiling, and bounded console output. Candidate and live bundle IDs remain separate; tests never mutate the live world.

## Project structure

```text
src/
  engine/
    campaignReducer.js     guarded phases, incidents, revisions, events
    world.js               movement, collision, tile helpers
  runtime/
    sandbox.worker.js      esbuild + QuickJS isolation
    SandboxClient.js       typed request/response bridge
    contracts.js           Zod cartridge/runtime contracts
  levels/
    cartridges.js          four levels, eight defects, virtual projects
  features/
    useCampaignRuntime.js  live/candidate orchestration and synchronization
  components/
    WorldCanvas.jsx        Canvas facility renderer
    GamePanel.jsx          Gamer controls, HUD, evidence and verification
    CodeWorkspace.jsx      CodeMirror editor
    CoderPanel.jsx         files, incident replay, diff, tests and deployment
  App.jsx                  menu, role focus, progress and judge view
```

The legacy v2 domain remains under `src/game/` for checkpoint compatibility. New campaign work lives on the `v3-runtime-campaign` branch; the saved `v2-judge-ready` branch points to the last v2 commit, and GitHub `main` is not overwritten.

## Run locally

Node.js 20+ is recommended.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm test
npm run test:e2e
npm run build
```

## Deploy to GitHub Pages

The production build uses repository-relative asset URLs, so it works when served from a project path such as `/patch-play/`.

1. Open **Settings → Pages** in the GitHub repository and choose **GitHub Actions** as the source.
2. Push the `v3-runtime-campaign` branch or rerun its latest **Deploy PATCH//PLAY to GitHub Pages** workflow.
3. GitHub will publish the verified `dist/` artifact without changing the v1 `main` branch.

The workflow installs the locked dependencies, runs the domain test suite, builds the release bundle, and publishes only `dist/`. Local browser verification is available with `npm run test:e2e`.

## Controls

- `WASD` / arrow keys — move
- `E` — interact
- Hold `Q` — scanner overlay
- `R` — restore the current checkpoint
- **REPORT TO DEV_02** — hand the captured runtime evidence to the Coder
- **TEST CANDIDATE** — compile in the Worker and run active plus previous regression tests
- **DEPLOY** — replace the live bundle only after a passing run
- **ROLLBACK** — restore the previous live bundle before verification

Guided mode reveals a suspected file and line plus a contextual clue. Challenge mode keeps the same code and tests but removes the source-location assistance. Drafts and campaign completion persist locally; active synchronized state remains in memory.
