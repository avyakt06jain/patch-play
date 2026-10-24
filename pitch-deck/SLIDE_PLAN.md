# Ten-slide pitch plan

## Global setup

- Canvas: 16:9 widescreen, 13.333 × 7.5 inches.
- Safe area: 0.55 inches from each edge.
- Keep the dark navy interface identity. Use cyan for the Gamer, amber for the Coder, red for failure, and green only for tested or verified states.
- Treat screenshots as evidence. Keep interface text legible and avoid placing labels over important UI.
- Add the team name and event name only where placeholders are marked.

## Slide 1 — PATCH//PLAY

**Purpose:** Establish the product and the central interaction in one sentence.

**Title:** PATCH//PLAY

**Subtitle:** A cooperative debugging game where code patches change the world

**Footer copy:** `[TEAM NAME] · [HACKATHON NAME] · 2026`

**Visual:** `assets/screenshots/01-campaign-menu.png`

**Placement:** Use the screenshot full bleed at x 0, y 0, w 13.333, h 7.5. Add a transparent navy overlay at 25% opacity. Place the title at x 0.75, y 0.78, w 5.2, h 0.7. Put the subtitle directly below at y 1.62. Put the footer at x 0.78, y 6.88.

**Crop:** Preserve the full 16:9 image. The four campaign cards should remain visible behind the title.

**Speaker intent:** Introduce PATCH//PLAY as a debugging game where the player experiences a bug and the programmer changes the code that caused it.

---

## Slide 2 — Debugging education lacks visible consequences

**Purpose:** State the learning problem before discussing features.

**On-slide copy:**

- Learners often experience bugs as abstract console output.
- Tutorials can reveal the answer before the learner diagnoses the cause.
- Automated tests rarely require someone to verify the repaired behavior.

**Callout:** The bridge collapses because `>=` fires at the exact safe boundary.

**Visual:** `assets/screenshots/04-live-incident.png`

**Placement:** Put the title at x 0.65, y 0.55. Use a text column at x 0.7, y 1.55, w 4.15, h 3.45. Place the screenshot at x 5.1, y 1.15, w 7.65, h 4.3. Crop evenly from the top and bottom if needed, keeping the red incident overlay and both role panels visible. Place the callout beneath the screenshot at x 5.15, y 5.72, w 7.55, h 0.65.

**Speaker intent:** Explain that the prototype starts with an observable failure, not a detached exercise or a prewritten answer.

---

## Slide 3 — Two roles share one real failure

**Purpose:** Explain the core idea and the responsibility of each role.

**On-slide copy:**

**PLAYER_01** explores the facility, triggers failures, and reports what happened.

**DEV_02** receives the trace, edits the responsible module, tests a candidate, and deploys it.

**Shared rule:** The same compiled code controls gameplay and regression tests.

**Closing line:** Tests build confidence. The player proves the repair.

**Visual:** `assets/screenshots/02-level1-split-start.png`

**Placement:** Put the screenshot at x 0.55, y 1.35, w 7.25, h 5.55. Place the copy at x 8.2, y 1.55, w 4.45, h 4.7. Use cyan for PLAYER_01, amber for DEV_02, and green for the closing line.

**Crop:** Keep the vertical split between the game world and editor. The image may crop a small amount from both outer edges, but retain both role headers.

**Speaker intent:** Make the cooperation explicit. Neither role can complete a level alone.

---

## Slide 4 — Gameplay becomes a debugging pipeline

**Purpose:** Show how a player action becomes useful engineering evidence.

**Process labels:**

1. Trigger a failure through gameplay.
2. Capture the event sequence and world state.
3. Inspect the suspected file, variables, and boundary clue.
4. Edit, test, and deploy a candidate revision.
5. Repeat the interaction in the repaired world.

**Visual:** `assets/screenshots/05-coder-diagnosis.png`

**Placement:** Put the five steps in a narrow numbered column at x 0.72, y 1.4, w 3.55, h 5.1. Place the screenshot at x 4.55, y 1.25, w 8.2, h 5.85. Keep the amber hint, highlighted source line, replay, and test explorer visible.

**Speaker intent:** Point to the actual trace and explain that the report comes from the player’s real movement history.

---

## Slide 5 — Candidate code runs outside the React page

**Purpose:** Prove technical depth and distinguish the prototype from a hardcoded quiz.

**On-slide copy:**

- CodeMirror manages editable TypeScript files and read-only tests.
- esbuild-wasm bundles the virtual project in a Worker.
- QuickJS executes the candidate with no DOM, storage, or network access.
- Active checks and previous regressions must pass before deployment.

**Technical proof line:** 32 MB runtime limit · 512 KB stack · 50 ms hook budget · bounded console output

**Visual:** `assets/screenshots/07-tests-passed.png`

**Placement:** Put the screenshot at x 4.6, y 1.2, w 8.15, h 5.7. Place the copy at x 0.68, y 1.45, w 3.6, h 4.5. Put the technical proof line at x 0.7, y 6.25, w 12.0, h 0.42 in a monospace font.

**Crop:** Preserve the green `4/4 PASSED` result and the live-versus-candidate revision strip.

**Speaker intent:** State clearly that the Coder edits functioning TypeScript, not a predefined comparison field.

---

## Slide 6 — A passing test does not finish the level

**Purpose:** Explain the deployment and human verification gate.

**On-slide copy:**

1. The Coder deploys the tested candidate as the new live bundle.
2. The Gamer repeats the failed interaction in the world.
3. The level completes only after the repaired behavior succeeds.

**Visuals:**

- `assets/screenshots/08-patch-deployed.png`
- `assets/screenshots/10-wing-stabilized.png`

**Placement:** Place the deployment screenshot at x 0.7, y 1.45, w 5.9, h 3.32. Place the verified screenshot at x 6.75, y 1.45, w 5.9, h 3.32. Add short labels above them: `DEPLOYED` in amber and `PLAYER VERIFIED` in green. Place the three numbered statements in one row beneath the images at y 5.32, using three equal columns.

**Crop:** Use the upper 80% of each image. Keep the live revision indicator in the first image and the green victory overlay in the second.

**Speaker intent:** Emphasize that automated tests cannot complete the game. The human player supplies the final proof.

---

## Slide 7 — Four wings turn software defects into game mechanics

**Purpose:** Show campaign breadth without overexplaining every level.

**On-slide copy:**

**Transit:** Boundary conditions and transaction ordering

**Signal:** Sequence validation and time-unit mismatch

**Cargo:** Stale occupancy and rectangular map indexing

**Reactor:** State transitions and event priority

**Visuals:**

- `assets/screenshots/12-signal-wing.png`
- `assets/screenshots/13-cargo-wing.png`
- `assets/screenshots/14-reactor-wing.png`

**Placement:** Put three screenshots across the upper half at x 0.55, 4.55, and 8.55, each w 3.7, h 2.55. Crop to prioritize the themed map and keep a narrow portion of the source editor. Put the four defect descriptions below at x 0.72, y 4.65, w 11.9, h 1.7. Use a thin cyan, violet, amber, or red rule beside each wing name.

**Speaker intent:** Explain that each level teaches a different debugging pattern while preserving the same report, test, deploy, and verify loop.

---

## Slide 8 — Local architecture keeps the demo fast and safe

**Purpose:** Present the runtime boundary in a form judges can understand quickly.

**On-slide copy:**

- The host owns the authoritative world state.
- Candidate files compile inside a dedicated Worker.
- QuickJS receives serialized inputs and exposes no browser APIs.
- Zod validates runtime messages and world commands.
- Live and candidate bundles remain separate until tests pass.

**Closing line:** No backend and no arbitrary execution in the page.

**Visual:** `assets/screenshots/03-under-the-hood.png`

**Placement:** Put the screenshot at x 5.05, y 0.8, w 7.75, h 6.1. Crop from the left so the Under the Hood drawer fills most of the image. Place the title and bullets at x 0.72, y 0.72, w 4.05, h 5.6.

**Speaker intent:** Walk through the five stages shown in the drawer: player intent, world event, QuickJS system, validated result, and world reducer.

---

## Slide 9 — One host supports split screen or two role windows

**Purpose:** Show that the concept works for a reliable judge demo and a more theatrical two-screen setup.

**On-slide copy:**

- Split screen remains the default and needs no setup.
- Optional Gamer and Coder windows synchronize through BroadcastChannel.
- The main window validates actions and broadcasts versioned snapshots.
- Heartbeats expose a disconnected host instead of allowing divergent state.

**Visual:** `assets/screenshots/06-detached-coder.png`

**Placement:** Place the screenshot at x 0.55, y 1.25, w 8.1, h 5.75. Place the copy at x 8.95, y 1.6, w 3.7, h 4.7. Highlight `CODER WINDOW · CONNECTED` with a small amber callout line.

**Speaker intent:** Position detached windows as an optional collaboration mode, not a dependency for the live pitch.

---

## Slide 10 — Debugging becomes something teams can play

**Purpose:** Close with intended users, learning value, delivered proof, and the next product step.

**On-slide copy:**

**Who it can serve**

Computer-science students, coding clubs, classroom pairs, and engineering onboarding workshops.

**Learning behavior**

Reproduce first. Diagnose from evidence. Protect earlier fixes. Verify the live result.

**Prototype delivered**

4 wings · 8 defects · 22 domain tests · 5 browser workflows

**Next milestone**

Deepen the puzzle mechanics, then add a level-authoring kit and classroom scoring.

**Closing line:** PLAYER_01 discovers the failure. DEV_02 changes the cause. Both prove the fix.

**Visual:** `assets/screenshots/11-campaign-progress.png`

**Placement:** Use the screenshot as a full-slide background with a 55% navy overlay. Place the title at x 0.72, y 0.62. Use two text columns at x 0.82 and 6.85, both starting at y 1.65. Put the closing line across the bottom at x 0.82, y 6.55, w 11.7, h 0.45 in cyan and amber.

**Speaker intent:** Close on the learning outcome and invite judges to try the bridge incident themselves.

## Backup slides

Keep these outside the main ten-slide sequence:

- **Second defect proof:** Use `assets/screenshots/09-second-incident.png` to show that a level contains sequential failures and earlier fixes remain in the regression suite.
- **Campaign completion:** Use `assets/screenshots/10-wing-stabilized.png` at full size if judges ask what successful verification looks like.
- **Technical Q&A:** Duplicate slide 8 and add the dependency versions from `SUBMISSION_COPY.md` in speaker notes rather than crowding the main slide.

