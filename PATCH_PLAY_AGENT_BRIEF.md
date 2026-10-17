# PATCH//PLAY — Agent-Ready Project Brief

> **One plays the problem. The other patches the world.**  
> **Break it. Trace it. Patch it. Play it.**

**Document type:** Hackathon problem statement, creative direction, and implementation specification  
**Target:** A genuinely working, visually polished **2–3-hour prototype**, not a finished platformer or full game engine  
**Core stack:** React + Vite + JavaScript/TypeScript + CSS; no LLM required  
**Non-negotiable:** Both roles must be necessary, the gamer must have meaningful gameplay, and the coder must modify a *real rule* that changes the game.

---

## 1. The project in plain English

### One-sentence central idea

**PATCH//PLAY is a two-player cooperative puzzle game in which one player navigates a deliberately broken game world, discovers and documents its failures, while another player debugs the underlying game logic to make progress possible.**

### Thirty-second pitch

Most games give both players the same interface. PATCH//PLAY gives them **two different ways to experience the same world**: the **Gamer** explores, avoids hazards, finds clues and reports what goes wrong; the **Coder** sees logs, state and editable rules, and repairs the world while the Gamer is still trying to escape it. When a bridge collapses, the Gamer can identify *where and under what conditions* it failed. The game translates that experience into an error trace and highlights a **suspected line of code** for the Coder. The Coder must reason about the condition, apply a safe patch and run a test. The Gamer must then **actually play through the corrected level** to win. Neither can complete the game alone.

### The problem statement / bridge

**Two disconnected sides:**
- **Game players and playtesters** understand the visible experience: timing, location, movement, difficulty, and the moment something feels wrong.
- **Programmers and game developers** understand the invisible implementation: variables, boundary conditions, event triggers, and state changes.

**The gap:** A player's experience often reaches a programmer as a vague message: “The bridge broke too early.” The programmer sees the code but may not know precisely how to reproduce what happened. Their expertise doesn't naturally translate in either direction.

**What bridges the gap:** A **live feedback loop** between gameplay and debugging:

`PLAYER ACTIONS → FAILED WORLD EVENT → STRUCTURED REPORT + SUSPECTED CODE LINE → CODE PATCH → REAL RULE TEST → PLAYER RETRY`

The bridge is not an AI explanation, an ordinary chat, or a game where one person watches someone else code. It is **a shared interactive system in which the same failure has two useful representations**.

### Who gains value?

| Audience | Benefit |
|---|---|
| Gamers and friends | An asymmetric co-op puzzle where communication and different skills are the mechanics |
| Game playtesters and developers | A tangible demonstration of transforming observed failures into actionable debug evidence |
| Programming students | Immediate visual feedback showing how conditionals and off-by-one errors alter gameplay |
| Game-development workshops | A short, collaborative debugging exercise where both participants are essential |

**Positioning for judges:** Lead with the **asymmetric cooperative game**. Present playtesting/debugging education as a credible use case and future direction. Do not claim this tiny prototype replaces production bug trackers.

---

## 2. The creative idea: two realities, one world

**Creative hook:** *The game is broken on purpose. Repairing it is how you play it.*

Two people have different power and different information:

| GAMER — `PLAYER_01` | CODER — `DEV_02` |
|---|---|
| Sees the map, hazards, bridge, controls, collectibles and goal | Sees source-like rules, values, state traces, errors and tests |
| Can move, explore, retry, collect an access key, activate sensors and flag problems | Can inspect the failure, edit a small part of a rule, validate and apply a patch |
| **Cannot edit code or repair a broken rule** | **Cannot move the Gamer, collect a key or reach the exit** |
| Has a real gaming challenge, not merely up/down movement | Gets a plausible clue and the **suspected faulty line**, not the correct solution |

**The central design principle:** The Coder should not play the game on behalf of the Gamer, and the Gamer should not be reduced to a cursor generating error logs. Both must have an actual job.

### What makes this different?

This is **not** a new claim that games can be programmed; programmable games already exist. The distinctive concept is **turning live player experience into an actionable, located debugging event—and testing the fix inside the same shared game**.

Conventional coding tutorials ask one person to type code and watch an animation. PATCH//PLAY makes **another real human's gameplay** the source of the problem and the validation of its solution.

### Most memorable features

1. **Two interfaces, one shared reality:** The world view and the code view reflect the same underlying state.
2. **Player-generated evidence:** Falling on tile three creates a report with tile and step information, not a generic “Game Over.”
3. **Guided debugging, not auto-solving:** The game highlights the **likely offending line** and explains observed behavior; it does not tell the Coder which operator to type.
4. **Actual rule changes:** Modifying `>=` to `>` changes the real bridge behavior, not merely a decorative animation.
5. **Cooperative win condition:** The Coder can make the bridge viable, but **only the Gamer** can fetch the access key and reach the exit.

---

## 3. Make the Gamer genuinely engaged (important improvement)

**Likely judge objection:** “Isn't the Gamer just moving left/right while the Coder does all the thinking?”

**Answer in design, not marketing:** Give the Gamer a short but recognizable puzzle/adventure loop involving **exploration, evidence collection, risk and execution**. The Gamer should have something to do before, during and after the code repair.

### Game objective: Escape the broken simulation

In a small tile-based testing facility, `PLAYER_01` must **collect an access key, unlock the final gate and escape**. The only direct crossing is a three-tile bridge that crashes on the last tile due to an off-by-one bug. A nearby diagnostic sensor can provide additional evidence. A Coder on a separate panel can repair the bridge rule but cannot collect the key or navigate.

**Gamer activities:**

1. **Explore a small map:** Move through a start zone, side alcove and approach to the bridge. The intended map has at least one branch, not a single straight line.
2. **Collect a real objective:** Pick up an **access key** from the side alcove; it is necessary to open the exit. Collecting it should change game state and render visually.
3. **Investigate the broken bridge:** Try crossing; the bridge fails *at step three*, even if the player's route and timing are otherwise correct.
4. **Send a useful bug report:** A collapse generates a visible incident card. The Gamer clicks **REPORT GLITCH** to send the failure context to the Coder (or it auto-sends with a visible button to inspect details).
5. **Gather better evidence:** Optionally, find/activate a **diagnostic beacon** near the start side to reveal “bridge allows three tiles / collapse happens at tile three.” This updates the coder's hint with more precise context. This is a single `E` interaction, not an elaborate quest.
6. **Retry the repaired level:** Only after the Coder's real patch is applied does the Gamer reattempt crossing, navigate to the exit and use the collected key.

**Recommended gameplay enhancement only after core completion:** Add **one blinking laser tile** in the side route that forces the Gamer to time movement. This is a tiny, demonstrable skill mechanic; it is **optional**, not a dependency of the MVP.

**Crucial pacing rule:** While the Coder examines the failure, the Gamer should be able to explore, fetch the key if not yet collected, or activate the sensor. Avoid a modal “WAIT FOR DEVELOPER” screen. If the Gamer has already collected everything, they can scout the approaches or try again; no manufactured busywork is necessary.

**Don't overclaim:** A branching map plus key plus diagnostic sensor gives the Gamer agency, but it is not equivalent in difficulty to a polished platformer. For a 2–3-hour proof of concept, it is enough to make the shared loop legible and fun.

---

## 4. The Coder's challenge must feel like debugging, not a settings slider

**Likely judge objection:** “Coding is much harder than movement. Isn't this one person typing while the other waits?”

**Improvement:** The Coder sees **the exact likely line of code** once the Gamer reports the failure. Their job is to diagnose a simple boundary condition, not build an algorithm from scratch. The assistance narrows the search space **without revealing the final fix**.

### Actual bug: off-by-one error

The bridge consists of **three tiles**. `stepsOnBridge` increments each time the player *enters* a new bridge tile. `maxSafeSteps = 3`.

**Buggy rule shown in the Coder's editor:**

```js
// bridge.rules.js
01  const maxSafeSteps = 3;
02
03  function shouldCollapse(stepsOnBridge) {
04    // Collapse when the player exceeds the safe limit.
05    return stepsOnBridge >= maxSafeSteps; // suspect
06  }
```

With `>=`, the bridge collapses **on the third tile**, even though all three tiles should be safe. The patch is changing that single comparison to `>`.

**Do not directly tell the Coder the correct operator in the live UI.** This specification reveals the solution so the building agent can implement/test it; players should get hints rather than the solution.

### Suggested on-screen error panel

```text
BUG-001  BRIDGE_01 COLLAPSE
Location: Bridge tile 3 / 3
Observed: bridge collapsed when stepsOnBridge = 3
Expected: player should reach the far bank

LIKELY SOURCE
bridge.rules.js  ·  line 05  [HIGHLIGHTED]

HINT
The bridge is meant to support three steps.
Inspect what happens exactly at the boundary.

[VIEW TRACE]  [TEST PATCH]  [APPLY PATCH]
```

**What “line hint” means technically:** On `REPORT GLITCH`, use the **known failure event type `BRIDGE_COLLAPSE`** to highlight the stored source location, e.g. `bridge.rules.js:5`, with an amber indicator. This is honest, deterministic mapping—not pretending an AI diagnosed arbitrary source code.

**Optional second hint:** If the Gamer activates the diagnostic sensor, show: “At `stepsOnBridge = maxSafeSteps`, collapse evaluates to true.” **Still do not write `change >= to >` on-screen.**

### Real edit, real test, real outcome

For the timeboxed prototype, don't execute arbitrary user JavaScript. Show an editable **code-like source snippet** and safely parse exactly one supported comparison operator (`>=` or `>`). The displayed code and the actual game logic must be driven by the *same operator state*. Reject unsupported edits with a clear message.

An alternative, if raw text parsing is unreliable, is to use a styled monospaced editable line with a focused operator control. This is less impressive than free text, so prefer editing a constrained source snippet when possible.

**Behavior:**
- Before patch: `shouldCollapse(3)` is `true` → the player falls on tile three.
- After patch: `shouldCollapse(3)` is `false` → the player can cross tile three.
- A **TEST PATCH** button runs the real function using steps `[1, 2, 3]` and reports the first failing step (or all passed).
- **APPLY PATCH** commits a valid tested operator and tells the Gamer that the world is updated.
- The Coder cannot press a fake green “SUCCESS” button; the Gamer must actually traverse the bridge and reach the exit.

**Scope truthfulness:** This is a **deterministic rule regression test**, not a recording-and-replay engine of arbitrary player inputs. Full movement replay is future scope.

---

## 5. One complete level (MVP game design)

**Level name:** `LEVEL_01: THE BROKEN CROSSING`  
**Theme:** An experimental simulation/facility where the world was shipped with a bug.  
**Camera:** Top-down, tile-based; no physics engine required.  
**Movement:** Arrow keys or WASD; optional `E` near the diagnostic sensor.  
**Win condition:** Access key collected **AND** bridge traversed under patched rule **AND** Gamer reaches the exit tile.

### Suggested map elements

- **Start:** Player spawns in the left area.
- **Small branching approach:** One direct route to the bridge, one side alcove containing the key.
- **Access key:** Cannot be acquired by the Coder. Retained after a bridge-failure respawn.
- **Diagnostic beacon:** A nearby interactable object the Gamer can activate for an enhanced report.
- **Three consecutive bridge tiles:** `B1, B2, B3`, forming the only path to the exit; entering `B3` triggers the original bug.
- **Exit door:** On the far side, visibly locked until the key is collected.

**Rules to keep implementation simple:**
- Movement is grid-based, one tile per key press, with collision against walls.
- Entering each new bridge tile increments the bridge step count to 1, 2, then 3.
- The buggy rule collapses the bridge on step 3 and respawns the Gamer to the start side.
- The key, sensor activation and bug reports **persist** across respawn.
- A successful patch means stepping onto bridge tile 3 no longer collapses it.
- At level completion, show **“PATCH VERIFIED BY PLAYER”** and celebratory animation.

### Demonstration story

1. Gamer explores and collects the key.
2. Gamer steps onto bridge tiles 1, 2, 3; the third step collapses it.
3. Gamer reports the incident; Coder sees source line 05 highlighted.
4. Gamer activates a diagnostic beacon to strengthen the evidence (if implemented).
5. Coder notices an off-by-one boundary error, edits the conditional and runs the test.
6. The game announces a patch is ready; Gamer retries and crosses.
7. Gamer uses the key at the exit. **Both roles contributed to winning.**

---

## 6. UI and visual direction

**Name:** `PATCH//PLAY`  
**Primary tagline:** *One plays the problem. The other patches the world.*  
**Secondary tagline:** *Break it. Trace it. Patch it. Play it.*  
**Genre:** Asymmetric cooperative puzzle / playful debugging experience.  
**Mood:** Slightly glitchy testing facility meets clean arcade game and developer console.

### Screen layout — recommended MVP

Use a **single-page split-screen first**, because it is fast and reliable:

```text
┌─────────────────────────────────────┬────────────────────────────────────┐
│  PLAYER_01 / WORLD VIEW             │  DEV_02 / DEBUG VIEW               │
│                                     │                                    │
│  [map, walls, key, bridge, exit]     │  BUG-001  collapse on step 3       │
│                                     │  bridge.rules.js : line 05  <<<    │
│  WASD move   E inspect              │  [editable rule snippet]           │
│  Objective: obtain key / escape     │  [trace] [test] [apply patch]      │
│                                     │                                    │
│  REPORT GLITCH  /  RETRY            │  World status: UNPATCHED           │
└─────────────────────────────────────┴────────────────────────────────────┘
```

- **Player side:** Cyan/teal accents, bold tiles and visible animations. Prioritise moving, exploring, collapsing, collecting and escaping.
- **Coder side:** Amber/orange accents, readable monospaced syntax, highlighted suspect line, compact trace and clear test result.
- **Failure:** Red pulse + bridge tile collapse, short audio optional.
- **Success:** Green patch status + bridge stabilisation + exit unlock animation.
- **Accessibility basics:** Don't rely on color alone: pair every status with text and an icon.

**Narrative references (mood, not copying assets):** *Portal* (experimental test environment), *Keep Talking and Nobody Explodes* (separated knowledge and communication), and the familiar look of an IDE debug console. Do not use game art or copyrighted assets from them.

**Avoid:** Excessive cyberpunk neon, fake AI chat bubbles, huge animations hiding a weak core interaction, and layouts where the Coder's UI dominates everything.

---

## 7. Tone of voice

**Personality:** A mildly sarcastic, technically precise, slightly broken game engine. Never condescending to the Gamer or Coder.

| Use | Avoid |
|---|---|
| `patch`, `trace`, `glitch`, `retry`, `world`, `rule`, `checkpoint`, `sync`, `unstable` | `revolutionary`, `seamless`, `AI-powered ecosystem`, `cutting-edge`, `game-changing solution` |
| Brief, active instructions | Long, vague technical lectures |
| Dry humor in optional messages | Constant memes and cringey gamer slang |
| Concrete diagnostics: “collapsed on step 3” | “Something went wrong somewhere” |

**Sentence style:** Short notification → precise evidence or action. Average 2–10 words per status line. Error messages must name the event and its impact.

### Copy examples

**Title screen**
> Welcome to a world that shipped broken.  
> Player, find a way through. Developer, make one.

**Gamer objective**
> Find the access key. Reach the exit. The bridge looks suspicious.

**Gamer collapse**
> That wasn't supposed to happen.  
> Bridge collapsed on tile 3. Report this glitch?

**Coder event**
> Your player found a problem.  
> `BRIDGE_01` failed at the boundary. Suspected code: line 05.

**Coder hint**
> The bridge supports three steps. Why does the third step trigger collapse?

**Patch pending**
> New rule compiled. Awaiting player verification.

**Player win**
> Patch verified by player. You escaped the broken world.

**One-line pitch**
> They play the consequences. You change the cause.

---

## 8. Technical architecture — deliberately small

**Recommended tools:** Vite + React, CSS Grid or canvas, React state (`useReducer` or a small Zustand store), browser keyboard listeners. Use no external AI, no database, no authentication, no complex engine unless already installed.

### Shared source of truth

Represent both views through one underlying state model:

```js
const initialState = {
  player: { x: 1, y: 5 },
  inventory: { accessKey: false },
  bridge: {
    maxSafeSteps: 3,
    comparisonOperator: ">=", // BUGGY; coder can change to ">"
    stepsOnBridge: 0,
    patched: false
  },
  report: null,
  diagnosticsActivated: false,
  status: "playing", // playing | fell | won
};
```

**Actual behavior function:**

```js
function shouldCollapse(steps, maxSafeSteps, comparisonOperator) {
  if (comparisonOperator === ">=") return steps >= maxSafeSteps;
  if (comparisonOperator === ">") return steps > maxSafeSteps;
  throw new Error("Unsupported comparison operator");
}
```

Do **not** use `eval` or `new Function`. The editor text should safely parse to `comparisonOperator` and only then update the shared state. For instance, accept only an edit of the expression `stepsOnBridge >= maxSafeSteps` to `stepsOnBridge > maxSafeSteps` (spacing can be flexible). Malformed edits produce a syntax warning without breaking the game.

### Report schema

```js
{
  id: "BUG-001",
  type: "BRIDGE_COLLAPSE",
  level: "LEVEL_01",
  tile: 3,
  totalBridgeTiles: 3,
  stepsOnBridge: 3,
  maxSafeSteps: 3,
  suspectedLocation: { file: "bridge.rules.js", line: 5 },
  hint: "Check the comparison at the safe-step boundary."
}
```

### Ownership of actions

- Gamer input dispatches `MOVE`, `COLLECT_KEY`, `ACTIVATE_DIAGNOSTIC`, `REPORT_GLITCH`, `RETRY`.
- Coder input dispatches `EDIT_RULE`, `TEST_PATCH`, `APPLY_PATCH`.
- Both use the same `shouldCollapse` function. **Never maintain two conflicting copies of bridge logic.**
- Only Gamer movement can trigger `WIN`.

### Test behavior

`TEST_PATCH` runs the shared rule on bridge steps 1, 2 and 3. A test passes **only if none collapses**. If the edit is invalid, show a parser error. If it passes, the Coder may apply the patch. The bridge visibly changes state only when the patch is applied.

### Two screens versus one

- **MVP:** Split-screen in a single tab. Two people can control their respective panes side-by-side. This is safest for the demo.
- **Stretch:** Two same-origin tabs using `BroadcastChannel` to synchronize patch status and player events on the same browser profile/computer; define a single authority for game state to avoid loops.
- **Not in this sprint:** Two separate computers over a network. That would require sockets/relay service and is unnecessary for the proof of concept.

### Suggested source organization

```text
src/
  App.jsx                   # shared session and layout
  game/map.js               # tiles + player start + objectives
  game/rules.js             # one authoritative collapse rule
  game/reducer.js           # movement, collision, failure, success
  components/GameView.jsx   # actual playable map
  components/CoderView.jsx  # code, trace, line hint, tests
  components/StatusBar.jsx  # shared messages
  styles.css
```

---

## 9. Work plan: 2–3 hours (timeboxed)

**Guiding rule:** A complete one-bug loop is better than half of an elaborate two-screen game.

| Time | Phase | Tasks | Required deliverable |
|---|---|---|---|
| **0–15 min** | Skeleton | Vite React; split-screen app; single store/state | Both panes show and update without errors |
| **15–45 min** | Playable world | Small branched grid; WASD/arrows; collision; key; bridge; exit | Gamer can explore, collect a key and fall on bridge tile 3 |
| **45–70 min** | Real programmable rule | One shared `shouldCollapse`; constrained editable snippet/operator | Changing comparison actually changes bridge behavior |
| **70–95 min** | Failure-to-code connection | Structured report; suspect line highlight; error trace; gamer report interaction | Gamer-generated failure becomes useful programmer evidence |
| **95–120 min** | Test and apply loop | Deterministic test on steps 1–3; syntax validation; apply and retry | Real patch works, Gamer can cross and exit |
| **120–150 min** | Improve agency and presentation | Diagnostic beacon; optional two-tab same-browser mode; game feedback and sound | Gamer has more than a single corridor; both roles feel distinct |
| **150–180 min** | Reliability and demo polish | Small animations, reset button, mobile/desktop sizing, rehearsal | One clean 60–90-second live demo |

**Priority rule:** If any milestone runs late, **skip two-tab sync first**, then skip the diagnostic beacon and sound. Do **not** skip working rule application, a playable objective, or evidence arriving in the Coder's panel.

### Optional stretch work (only after complete MVP)

- One pulsing hazard/timed laser tile in the key's alcove.
- A second rule-controlled door that creates a small regression trade-off.
- Actual replay of recorded player input events with a fixed timestep.
- Networked multiplayer across separate devices.
- More than one code defect and richer source mapping.

---

## 10. Roadblocks and fallbacks

| Roadblock | Keep it reliable |
|---|---|
| Building platformer physics would eat the whole sprint | Use top-down grid; no jump/collision physics engine |
| Gamer experience feels shallow | Add the key detour and optional diagnostic beacon, not a giant map |
| Coder experience feels unfairly hard | Highlight suspected line, show failed tile/step, and offer a boundary-condition hint |
| Coder experience feels like merely changing a number | Use an actual **off-by-one comparison bug** (`>=` vs `>`), not an exposed “bridge health” slider |
| Arbitrary code causes crashes/security problems | Validate constrained expression; no eval, no remote code execution |
| Test button fakes success | Run real `shouldCollapse` for 1, 2, 3; show truthful output |
| Live synchronization is unreliable | Use single-tab split-screen as guaranteed baseline |
| Gamer waits during patching | Let the gamer explore, retrieve the key or activate the beacon |
| UI hints give away the whole answer | Highlight likely line and observed boundary, never say “replace `>=` with `>`” in product copy |
| Scope slips | One level, one real bug, one patch, one win screen; cut everything else |

---

## 11. Acceptance criteria (must actually work)

- [ ] Gamer can navigate the map using keyboard input.
- [ ] Map has a small branch and a meaningful access-key objective.
- [ ] Gamer genuinely cannot finish with the initial buggy bridge rule.
- [ ] Entering the third bridge tile triggers the actual collapse function.
- [ ] A failure creates a structured report with **step/tile number and suspect line**.
- [ ] The Coder panel highlights the relevant line **only after a report exists**.
- [ ] Coder receives a useful hint but **not the solution**.
- [ ] Coder can edit the supported rule without unsafe JavaScript evaluation.
- [ ] Invalid edits are rejected gracefully.
- [ ] `TEST PATCH` executes the real rule, not a fake green status.
- [ ] Applying a valid patch changes the Gamer's world.
- [ ] Gamer must still navigate across the bridge and reach the exit using the key.
- [ ] The final win state is reached by actual player action, not by pressing `APPLY PATCH`.
- [ ] A RESET DEMO button restores the original bug, the player position and level objectives.
- [ ] Entire failure → report → hint → edit → test → apply → retry → win loop can be shown within 90 seconds.

### Explicit non-goals / truth in the demo

- Not an open-ended software repair agent.
- Not full natural-language-to-code, and no LLM dependency.
- Not a production-grade game engine, bug tracker or online multiplayer platform.
- Not arbitrary source execution or a general-purpose code debugger.
- The source-line hint is **event-to-known-rule mapping**, not AI guessing about complex code.
- The regression test is **real and deterministic**, but not a complete gameplay replay system.

---

## 12. Judge questions and precise answers

**Q: Isn't the Gamer just walking around while the Coder solves everything?**  
**A:** No. The Gamer explores for the access key, investigates the failed bridge, can activate a diagnostic sensor to provide additional evidence, and has to traverse the final route personally. The Coder can't win alone. The Gamer's *observations* are a necessary input to solving the bug. A simple timed hazard can be added if extra polish time remains.

**Q: Isn't coding disproportionately difficult?**  
**A:** This is a deliberately scoped debugging challenge, not a blank-page programming exam. Reports identify the failing condition and highlight a likely line. The Coder still interprets the boundary and fixes the logic, but does not waste time locating a defect in hundreds of lines.

**Q: Doesn't the app basically give away the answer?**  
**A:** It identifies the likely location and supplies observations, not the correct operator. The reasoning and change remain the Coder's responsibility.

**Q: Couldn't you just make the bridge longer?**  
**A:** The intended defect is an **off-by-one conditional**: the bridge allows three steps but collapses on the third. The supported patch edits the conditional. We aren't merely increasing health or toggling a door open.

**Q: Is this a real code editor or just a mockup?**  
**A:** The editor is intentionally restricted to a real, parseable rule; it controls the actual game logic used by gameplay and tests. It isn't a full IDE and doesn't execute arbitrary code.

**Q: Do the players really need each other?**  
**A:** The Gamer cannot edit rules, and the Coder cannot move the character, collect the access key, trigger the observations or reach the exit. The win condition requires both forms of interaction.

**Q: What is new about coding inside a game?**  
**A:** The novelty isn't writing code in a game; it's the **two-person, live translation of experienced failure into located debugging evidence and back into changed gameplay**, with both participants having different agency.

**Q: Where is AI?**  
**A:** It doesn't need AI. The strongest part is a deterministic interaction and a well-structured feedback loop. AI-assisted bug triage could be added later, but it would not be central.

**Q: What would a real product become?**  
**A:** A collaboration/learning system connecting playtesting evidence, reproduceable bugs and developer patches, or a family of cooperative programming puzzles. The current prototype validates the interaction, not the production platform.

---

## 13. Live demo script (60–90 seconds)

**0–10 seconds — set the premise**  
> “We built a co-op game that's impossible to finish alone. One person plays the world. The other edits its rules.”

**10–30 seconds — let the Gamer play**  
Show moving, collecting the access key and attempting the crossing. The bridge collapses on tile three. Click **REPORT GLITCH**.

**30–45 seconds — show the translation**  
The Coder sees `BUG-001`, `tile 3/3`, `stepsOnBridge = 3`, and `bridge.rules.js:05` highlighted. Show the diagnostic hint. The Gamer may activate the beacon for added information.

**45–65 seconds — let the Coder fix the cause**  
Coder changes the comparison, clicks **TEST PATCH**, sees an actual passing test for steps 1–3 and applies the patch.

**65–85 seconds — verify through play**  
Gamer retries, successfully crosses and reaches the locked exit with the access key. Win screen says **PATCH VERIFIED BY PLAYER**.

**Final sentence**  
> “They play the consequences. You change the cause. Together, you fix the world.”

---

## 14. Instructions for the implementation agent

**Treat this document as a prioritized build specification, not a suggestion to write more planning documents.**

1. **Implement the smallest complete playable demo first.** Use React + Vite with real keyboard-driven movement, a visible map and two panels.
2. Build one **authoritative state machine and one real bridge-collapse function** reused by gameplay and test code. Don't use hardcoded “success” overlays.
3. Implement the off-by-one error as specified: three bridge tiles, buggy `>=`, valid fix `>`.
4. Make player actions generate the issue report, and **highlight `bridge.rules.js:05` after the issue arrives**, with observed failure evidence and a partial reasoning hint.
5. Let the Coder change the restricted expression in the actual rule, run a genuine test and apply the patch. **No `eval`, no arbitrary uploaded code, no fake tool output.**
6. Ensure the Gamer must do real work: navigate a branched map, retrieve an access key, experience/report the failure and physically reach the exit after the fix.
7. Prefer polished, functional split-screen over flaky remote multiplayer. Add same-browser two-tab mode only if time remains.
8. Create a **RESET DEMO** action so hackathon judging can repeat the entire sequence reliably.
9. If blocked by complexity, cut optional sensors, timers, sounds or networking before cutting the actual player–code–player loop.
10. At completion, report precisely what was built, how to run it, what remains unimplemented and the shortest steps for demonstrating the success path. **Never claim a feature works unless it genuinely works.**

### Definition of done

**Two people can independently interact with two different panels; the Gamer encounters a genuine rule-driven failure and reports it; the Coder sees the suspected source line, changes a real bounded expression and runs a truthful test; the Gamer then completes a real objective in the changed world.**

Anything beyond that is extra.
