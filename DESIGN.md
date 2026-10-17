# PATCH//PLAY — DESIGN.md

## Product identity
- **Product:** PATCH//PLAY
- **Tagline:** One plays the problem. The other patches the world.
- **Secondary:** Break it. Trace it. Patch it. Play it.
- **Category:** Experimental asymmetric co-op game / collaborative debugging simulation
- **Primary design target:** A functioning, single-page desktop split-screen React application, not a marketing landing page
- **Canvas:** 1440 × 900 desktop first; responsive to 1280 × 720; laptop-friendly
- **Primary user journeys:** Explore → collect access key → break bridge → report issue → inspect suspected code line → edit constrained code rule → test patch → apply patch → retry crossing → unlock exit

## North-star design sentence
**A beautiful indie puzzle-game world on the left; a believable professional debug console on the right; one shared system between them.** The product is a game, not an enterprise dashboard. Give both participants meaningful visual weight and unmistakable cause-and-effect.

## Mood and references
The feeling should be **“experimental game-testing facility meets premium indie arcade meets minimal VS Code-like IDE.”** Mood references only: Portal's testing environment, Keep Talking and Nobody Explodes' asymmetric information, Hyper Light Drifter's tightly art-directed glowing world, and an authentic debugging editor. Do not imitate their copyrighted art, logos or character designs. No hacker-movie green rain, exaggerated sci-fi chrome, AI avatar, floating chatbots or overly decorative circuit patterns.

Design attributes: **tactile, precise, playful, slightly mysterious, dark, high-contrast, cohesive, purposeful**. The Gamer side should invite play; the Coder side should invite investigation. Refined glowing accents and subtle grid patterns are acceptable. Avoid generic 3D AI-game illustration or a cheap neon esports look.

## Color design tokens
Use a near-black navy system, not pure black. These are **specific CSS color values**, not approximate vibes.

| Token | Value | Usage |
|---|---|---|
| `--bg-app` | `#090E17` | Main full-viewport background |
| `--bg-header` | `#0E1521` | Navigation / chrome |
| `--bg-panel` | `#101B2A` | Gamer shell and cards |
| `--bg-editor` | `#0C1420` | Code editor |
| `--bg-elevated` | `#182639` | Nested cards, incident details |
| `--stroke` | `#26364B` | All dividers and panel borders |
| `--text-primary` | `#EDF4F8` | Main text |
| `--text-secondary` | `#9EAFBF` | Supporting text / hints |
| `--text-muted` | `#657A90` | Metadata, line numbers |
| `--gamer-cyan` | `#52DFE1` | Gamer identity, interactive objects |
| `--gamer-cyan-dim` | `#143E4B` | Gamer surfaces / background |
| `--coder-amber` | `#FFC078` | Coder identity and suspect lines |
| `--coder-amber-dim` | `#49311F` | Issue highlights / status |
| `--danger` | `#FA7285` | Collapse, error report, failing tests |
| `--success` | `#72E5A0` | Actual passing tests and verified patch |
| `--warning` | `#FFD08A` | Suspicion / in-progress state |

Color has semantic meaning. Cyan = player/world; amber = developer/debug; red = broken; green = genuinely tested/verified. Never communicate status through color alone: always include text and a small icon or label. Use dark backgrounds on 90%+ of the interface; bright accents should be rare and meaningful.

## Type system
- **Display / headers:** `Space Grotesk` or `Sora`, 600–700 weight, crisp letter spacing. Logo `PATCH//PLAY` uppercase, 23–26 px; screen headings 20–26 px, panel headings 14–16 px.
- **UI text:** `Inter` or `Manrope`, 12–14 px regular/medium; minimum 12 px for functional labels; line height ~1.45.
- **Code, telemetry, labels:** `JetBrains Mono` or `IBM Plex Mono`, 12–13 px. Uppercase monospace for state IDs and short eyebrow labels; don't put entire paragraphs in monospace.
- **Status numbers:** tabular numeral styling, not oversized metrics dashboards.
- The product should be legible without zooming; no micro-font wallpaper.

## Layout and sizing
App fills desktop viewport with one integrated shell. Priority is to show real work, **not a giant marketing hero**.

### Top global bar (~58–64 px)
- Left: compact angular double-slash emblem `//`, wordmark **PATCH//PLAY**, tiny descriptor `CO-OP DEBUGGING EXPERIENCE`.
- Center: `LEVEL_01 / THE BROKEN CROSSING` and small progress indicator `01 / 01`.
- Right: connection indicator `LOCAL SESSION` or `SYNCED`, a muted `HOW TO PLAY` info affordance, and `RESET DEMO` secondary button.
- Slim 1px divider beneath header. No sidebar navigation, breadcrumbs into nonexistent pages, account avatar, subscription CTA, notifications or search bar.

### Workspace beneath (~remaining height)
- Two columns with a visible but restrained central seam: **Gamer ~57%, Coder ~43%** on a 1440px canvas; 12–16 px internal gaps and 18–24 px outer padding.
- Each side has a compact section header, a unique role icon and role-colored 2px accent, with consistent aligned baseline.
- No independently scrolling long dashboards at first load. Fit the main game, key objectives, Coder's incident area and editor on screen at 1440×900.
- Gamer panel: game viewport ~16:10, objectives under or beside it, small input/interaction strip, contextual glitch report card at bottom.
- Coder panel: status/incident card at top, editable code area center (~220–280px), compact trace/test area and two buttons at bottom.
- Gamer canvas must be at least slightly larger than the coder editor. Don't let a huge terminal swallow the game.

## Core Gamer panel (`PLAYER_01`)
This panel should look **playable**, never like a stock photograph. Build an original, controlled top-down grid/tileset aesthetic: 2D isometric *not required*; top-down tiles are preferred for prototype feasibility.

### Visual world
- Small square tiles, clean dark steel floor, faint floor seams, a few environmental markings.
- Left-hand start area with tiny cyan player marker/avatar. Branching walkway into a side alcove containing one luminous **ACCESS KEY**.
- A three-tile bridge `B1`, `B2`, `B3` spanning a dark void toward a locked door and exit flag.
- Optional violet/teal diagnostic beacon near bridge approach, visibly interactable.
- A clear navigable route. Avoid a game screenshot so busy that nobody can identify the avatar, bridge or key.
- Movement is grid-by-grid using WASD/arrow keys; optional `E` interaction. Don't suggest a mouse-controlled platformer, 3D physics, elaborate particle combat, enemies or boss battles.
- Render world states visibly: bridge intact (cyan), failure at tile three (red fractured segments), patch applied (stable teal segments), final gate unlock (green).
- Use minimal subtle animation suggestions: player bob, key breathing glow, impact pulse, line-of-code highlight, bridge reconstruction. Respect reduced-motion preferences.

### Gamer subcomponents
- Header: `PLAYER_01` + `WORLD VIEW` with cyan dot and `LIVE` tag.
- Level context: `LEVEL_01 · THE BROKEN CROSSING` in small type.
- Objective checklist: `GET ACCESS KEY`, `INVESTIGATE BRIDGE`, `ESCAPE`, with clear completed/active/locked states.
- Input legend: `W A S D` or arrows = `MOVE`; `E` = `INTERACT`.
- Inventory: one access-key icon, `KEY ACQUIRED` when collected.
- Under failure: an anchored inline incident toast/card: `BRIDGE_01 COLLAPSED AT TILE 3/3`, supporting line `That wasn't supposed to happen.`, primary action `REPORT GLITCH`, secondary `RETRY`.
- After report: change action to `REPORT SENT TO DEV_02`, preserve Gamer's control.
- After patch: small `WORLD PATCHED — TRY AGAIN` toast; Gamer must physically cross and unlock exit.

## Core Coder panel (`DEV_02`)
Coder panel looks like an actual debugging workspace, **not an AI assistant chat UI**. Code must be visually readable and make sense.

### Coder structure
1. Header: `DEV_02` with amber dot; subheading `DEBUG CONSOLE`, live ruleset indicator `bridge.rules.js`.
2. Compact issue/telemetry card. BEFORE report: `AWAITING PLAYER INCIDENT` and small neutral world events, no auto-revealed suspect. AFTER report: `BUG-001`, `BRIDGE_01 / COLLAPSE`, `tile 3/3`, `stepsOnBridge: 3`, `maxSafeSteps: 3`, and `SUSPECTED · bridge.rules.js:05`.
3. Source editor with line numbers 01–06 and subtle IDE syntax highlighting. Use warm amber to highlight **line 05 only after Gamer reports**. There should be an editable expression, not a prominent number slider.
4. Diagnostic hint card under the code, with lightbulb icon, explaining the failed boundary but not giving the fix: `The bridge should support three steps. Check what happens at the exact boundary.`
5. Bottom action area: `VIEW TRACE` secondary, `TEST PATCH` primary amber, `APPLY PATCH` secondary/primary only after a passing test; disable or show blocked state before valid patch.
6. Real-looking test output: `step 1 / PASS`, `step 2 / PASS`, `step 3 / FAIL` before fix; after fix all pass and `3/3 TESTS PASSED`. A successful automated test is not the final win—the player must play the route.

### Exact in-world source snippet
```js
01  const maxSafeSteps = 3;
02
03  function shouldCollapse(stepsOnBridge) {
04    // Collapse only after the safe limit.
05    return stepsOnBridge >= maxSafeSteps;
06  }
```
The intended fix is `>=` to `>` but **NEVER display that solution in an in-game hint, instructional tooltip, auto-suggest popup or initial UI state**. Developers implementing the prototype can know the solution; the Coder player must infer it. No LLM input box, AI-generated code button or arbitrary code execution promise.

## Design the same application in four coherent states
These are variants of the same desktop composition, not four unrelated full marketing pages. Keep logo, sizing, map and color tokens consistent.

### SCREEN / STATE 01 — `EXPLORE` (default)
- Game intact and playable, player near spawn, cyan-world calm.
- Key visibly available; objective `Find the access key. Reach the exit.`
- Debug console neutral, `AWAITING PLAYER INCIDENT`, code visible but **no line highlighted**.
- Emphasize actionable first moves, not a wall of instructions.

### SCREEN / STATE 02 — `INCIDENT_REPORTED` (hero design frame; most important)
- World shows the bridge cracking red; player safely reset to start side.
- Gamer has report confirmation and can continue exploring.
- Coder sees compact `BUG-001` diagnostics, **amber-highlighted line 05**, target boundary hint and `TEST PATCH` action.
- This screen should communicate the entire concept at a glance. Treat it as the showcase artboard.

### SCREEN / STATE 03 — `PATCH_READY`
- Coder's edited line is validated and test output indicates `3/3 TESTS PASSED` in green.
- `APPLY PATCH` is available or just completed; message `WORLD RULES UPDATED`.
- Gamer's bridge changes from broken to stable; prompt `RETRY CROSSING`.
- Avoid indicating the game is won merely because tests passed.

### SCREEN / STATE 04 — `ESCAPE_VERIFIED`
- The key and repaired bridge were both used; Gamer reaches the exit.
- Cinematic but small in-app overlay, not a separate marketing page: `PATCH VERIFIED BY PLAYER` and `WORLD STABILIZED`.
- Show both role contributions: `PLAYER_01 · COLLECTED KEY / VERIFIED CROSSING` and `DEV_02 · FIXED RULE / PASSED REGRESSION TEST`.
- CTA `REPLAY LEVEL` or `RESET DEMO` for judges.

## Components and interaction states
Build component variants for: top header, role header, role-status dot, 2D map tile, player token, key item, diagnostic beacon, bridge tile (intact/broken/fixed), door (locked/open), objective row, keyboard keycap, glitch report card, issue metadata, file tab, line numbers, suspect-line highlight, code editor shell, code caret, diagnostic hint, trace list, test status rows, primary/secondary/disabled buttons, toast, compact win overlay.

Button hierarchy:
- Cyan primary for Gamer actions like `REPORT GLITCH`.
- Amber primary for Coder actions like `TEST PATCH`.
- Green is reserved for real successful outcomes, not default button paint.
- Secondary actions ghost/outline; hover border brightens; keyboard focus has a visible ring.
- `APPLY PATCH` visually locked until test passes, with concise reason.

Microinteraction suggestions (do not depend on complex animation libraries): 120–180ms hover/focus transitions; one subtle red pulse on collapse; 200–350ms amber blink of the suspect line; a brief green propagation across the three bridge tiles on patch. Avoid shake-heavy motion, auto-running hero videos or loading skeletons on the primary screen.

## Copywriting system
**Voice:** a slightly sarcastic, technically precise test-facility computer. Short, active, specific. 2–10 words for alerts; longer text only to explain the reason/next action. Clever without exhausting gamer slang.

### Approved UI copy
- Brand promise: `One plays the problem. The other patches the world.`
- Initial Gamer objective: `Find the key. Reach the exit. Something here is broken.`
- First collapse: `That wasn't supposed to happen.`
- Specific event: `BRIDGE_01 collapsed at tile 3/3.`
- Report: `Report glitch to DEV_02`
- Coder incoming: `Your player found a problem.`
- Suspect: `Likely source: bridge.rules.js · line 05`
- Hint: `The bridge should support three steps. Inspect the boundary.`
- Pre-test: `World changes are pending verification.`
- Passed test: `3/3 tests passed. Ready to apply.`
- Patch applied: `Same world. Different rules.`
- Gamer retry: `Patch received. Try the bridge again.`
- Win: `PATCH VERIFIED BY PLAYER`
- Celebration: `One found the failure. One fixed the cause.`

### Words to avoid
`AI-powered`, `revolutionary`, `seamless solution`, `intelligent agents`, `enterprise-grade`, `gamified learning platform`, `algorithmic collaboration engine`, `unlock your potential`, `synergy`, `supercharge`. Avoid undefined jargon in Gamer UI and avoid jokey inaccurate error messages in Coder UI.

## Responsive behavior
Desktop at 1440×900 is the priority. At ≥1100px keep two real side-by-side workspaces. On smaller devices, stack modules with a sticky two-tab switcher `WORLD / CODE` while preserving synchronized state. Never horizontally squash the code until unreadable; allow code pane's own horizontal scrolling if unavoidable. No mobile-only redesign is needed for the hackathon. Prefer stable game dimensions to overly responsive animated grids.

## Accessibility and practical quality
Minimum touch target 40px, visible focus, functional labels >=12px, sufficient text contrast, clear distinction among failing/pending/passing beyond color, optional reduced motion. Do not use font files or imagery that require licensed downloads; generated visual directions must be implementable with simple React components and CSS. Prefer SVG/icons, flat tiles and CSS effects rather than detailed bespoke illustrations.

## Strict scope constraints
This is a 2–3-hour **working prototype**. The design MUST NOT depend on: backend, network matchmaking, accounts, onboarding flow, AI assistant/chat, video call, user profiles, realtime multiplayer servers, physics engine, 3D game world, complex inventory, multiple levels, scripted cutscenes, full IDE, file tree with unrelated files, or fake multi-page analytics. Same-page split-screen is the reliable MVP.

## What the design output should include
1. One high-fidelity desktop `INCIDENT_REPORTED` main interface first (showcase frame).
2. Closely matched `EXPLORE`, `PATCH_READY`, and `ESCAPE_VERIFIED` variants of that SAME UI.
3. A cohesive token/component treatment so React implementation can mirror the output.
4. Legible authentic sample content: the map, report, source code, line highlight and test trace. No lorem ipsum.
5. Clear visual cues for both player agency and developer agency; don't turn the Gamer into a passive spectator or the Coder into a magic “fix” button.

**Final quality test:** A judge should understand in under five seconds which side plays, which side codes, what broke, where the evidence appears, and how fixing the source changes the playable world. If the image looks like a SaaS dashboard with a decorative game thumbnail, redesign it.
