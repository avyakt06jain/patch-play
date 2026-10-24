# Seven-slide pitch plan

The deck uses four screenshots in total. Slides 1, 6, and 7 rely on strong typography and simple editable shapes rather than additional product captures.

## Global setup

- Canvas: 16:9 widescreen, 13.333 × 7.5 inches.
- Safe area: 0.55 inches from each edge.
- Dark navy background with cyan Gamer accents and amber Coder accents.
- Red appears only for real failures. Green appears only for tested or verified states.
- Use no more than the four screenshots named below.

## Slide 1: PATCH//PLAY

**Purpose:** Introduce the product in one sentence.

**Title:** PATCH//PLAY

**Subtitle:** A cooperative debugging game where code patches change the world

**Supporting line:** One player experiences the failure. Another changes the code that caused it.

**Footer:** `[TEAM NAME] / [HACKATHON NAME] / 2026`

**Visual:** No screenshot. Use the `//` brand mark as oversized cyan text in the upper-left background. Add one thin amber line behind the subtitle to suggest the Gamer/Coder split.

**Placement:** Put the title at x 0.85, y 1.25, w 7.2, h 0.85. Put the subtitle at y 2.25 and the supporting line at y 3.15. Keep the right third mostly empty. Put the footer at x 0.85, y 6.75.

**Speaker intent:** Define the product and establish that the world reacts to real code changes.

---

## Slide 2: Debugging lacks visible consequences

**Purpose:** Explain the problem through the bridge failure.

**On-slide copy:**

- Learners often encounter bugs as abstract console output.
- Tutorials can reveal the correction before the learner understands the cause.
- Automated tests rarely require someone to verify the repaired behavior.

**Callout:** The bridge collapses because `>=` fires at the exact safe boundary.

**Screenshot 1 of 4:** `assets/screenshots/04-live-incident.png`

**Placement:** Put the title at x 0.65, y 0.55. Use a text column at x 0.72, y 1.55, w 3.75, h 3.7. Place the screenshot at x 4.75, y 1.15, w 7.95, h 4.48. Place the callout beneath the screenshot at x 4.8, y 5.9, w 7.75, h 0.58.

**Crop:** Keep the red failure overlay, broken bridge state, and both role panels visible.

**Speaker intent:** Show that PATCH//PLAY begins with a consequence the learner caused and observed.

---

## Slide 3: The cooperative debugging loop

**Purpose:** Explain the roles and the complete interaction.

**On-slide copy:**

**PLAYER_01** explores the simulation and reports a failure.

**DEV_02** receives the evidence, edits the responsible module, and tests a candidate.

**Shared outcome** The deployed patch changes the live world. The player must verify it.

**Process labels:** Present the following as a numbered sequence: Play, Capture, Diagnose, Patch, Verify.

**Screenshot 2 of 4:** `assets/screenshots/02-level1-split-start.png`

**Placement:** Put the screenshot at x 0.55, y 1.35, w 7.35, h 5.55. Place the role descriptions at x 8.25, y 1.5, w 4.35, h 3.6. Put the five process labels in one vertical list below at y 4.95. Color PLAYER_01 cyan and DEV_02 amber.

**Crop:** Preserve the central split and both role headers. Small outer-edge cropping is acceptable.

**Speaker intent:** Make clear that tests alone cannot win and the two roles contribute different evidence.

---

## Slide 4: Real code and isolated execution

**Purpose:** Prove that the prototype contains a genuine debugging runtime.

**On-slide copy:**

- CodeMirror manages editable TypeScript files and read-only tests.
- esbuild-wasm bundles the virtual project inside a Worker.
- QuickJS runs the candidate without DOM, storage, or network access.
- Active checks and earlier regressions must pass before deployment.

**Technical proof:** Runtime limits include 32 MB memory, a 512 KB stack, 50 ms per hook, and bounded logs.

**Screenshot 3 of 4:** `assets/screenshots/07-tests-passed.png`

**Placement:** Put the title at x 0.65, y 0.55. Place the copy at x 0.7, y 1.45, w 3.65, h 4.55. Place the screenshot at x 4.6, y 1.15, w 8.1, h 5.65. Put the technical proof across the bottom of the text column in a monospace font.

**Crop:** Keep the changed source, `4/4 PASSED`, candidate revision, and enabled deployment action visible.

**Speaker intent:** State that the Coder edits functioning TypeScript rather than selecting a predefined answer.

---

## Slide 5: Deployment and player verification

**Purpose:** Present the project’s strongest differentiator.

**On-slide copy:**

1. Passing tests permit deployment but leave the level unfinished.
2. The live bundle changes to the tested candidate.
3. The Gamer repeats the failed interaction and verifies the repair.

**Key line:** Automated checks establish confidence. Human verification completes the level.

**Screenshot 4 of 4:** `assets/screenshots/10-wing-stabilized.png`

**Placement:** Use the screenshot at x 0.55, y 1.2, w 8.15, h 5.75. Put the numbered copy at x 9.0, y 1.5, w 3.65, h 3.8. Put the key line beneath at y 5.35 in green.

**Crop:** Keep the green victory overlay, verified incident markers, live revision, and corrected source visible.

**Speaker intent:** Emphasize that the player verifies the repaired behavior in the same world where the failure occurred.

---

## Slide 6: Campaign and learning coverage

**Purpose:** Show scope without adding more screenshots.

**On-slide copy:**

**Transit Wing**
Boundary conditions and transaction ordering

**Signal Wing**
Sequence validation and time-unit mismatch

**Cargo Wing**
Stale occupancy and rectangular map indexing

**Reactor Wing**
State transitions and event priority

**Proof delivered:** Four wings contain eight sequential defects. The current implementation passes 22 domain tests and five browser workflows.

**Visual:** No screenshot. Use four horizontal color bands with large wing numbers `01` to `04`. Use cyan, violet, amber, and red as thin edge colors. Keep the composition flat and editable.

**Placement:** Put the title at x 0.65, y 0.55. Stack the four bands from y 1.45 to y 5.75 with 0.95-inch height each. Put the proof line at x 0.72, y 6.55.

**Speaker intent:** Demonstrate that one reusable runtime supports several real software failure patterns.

---

## Slide 7: Learning impact and next step

**Purpose:** Close with users, learning value, and the development direction.

**On-slide copy:**

**Potential users**

Computer-science students, coding clubs, classroom pairs, and engineering onboarding workshops.

**Learning behavior**

Reproduce before editing. Diagnose from evidence. Protect earlier fixes. Verify the live result.

**Next milestone**

Deepen the world mechanics, then add a level-authoring kit and classroom scoring.

**Closing line:** PLAYER_01 discovers the failure. DEV_02 changes the cause. Both prove the fix.

**Visual:** No screenshot. Use a large cyan `P1` on the left and amber `D2` on the right. Join them with a thin green line labelled `VERIFIED`.

**Placement:** Put the title at x 0.65, y 0.55. Use two main text columns at x 0.8 and x 6.85, both starting at y 1.55. Place the next milestone across the center-bottom at y 4.95. Put the closing line at x 0.8, y 6.4, w 11.75, h 0.5.

**Speaker intent:** End on the educational behavior rather than a feature list, then invite judges to try the bridge demo.

## Optional backup material

Do not include backup screenshots in the main seven slides. If judges ask about campaign variety, detached roles, or the runtime path, open the corresponding prototype screen live or use the remaining images in `assets/screenshots/` after the main presentation.

