# Five-minute talk track

## Slide 1 — 20 seconds

“PATCH//PLAY is a cooperative debugging game. One player explores a broken facility. The other edits the TypeScript modules controlling it. The team wins only when the changed code fixes the live world and the player verifies the repair.”

## Slide 2 — 30 seconds

“Most debugging lessons begin after the interesting part has already happened. Learners receive a failing test or an error message, but they do not experience the consequence. The answer may also be reduced to a syntax correction. Our first level makes the boundary failure visible: the bridge collapses on the third safe tile because the rule uses greater-than-or-equal.”

## Slide 3 — 30 seconds

“The Gamer produces the incident through ordinary play. The Coder receives the real event trace, world position, observed value, expected value, and suspected source. Both roles remain necessary. The Coder cannot invent an incident, and passing tests cannot finish the level without the Gamer.”

## Slide 4 — 35 seconds

“Every failure follows the same engineering loop. Gameplay produces an event. The host captures the relevant state and recent actions. The Coder replays the incident without moving the live player, inspects the highlighted source, and creates a candidate revision. Deployment remains locked until the active checks and every earlier regression pass.”

## Slide 5 — 40 seconds

“This is real editable TypeScript. CodeMirror manages a virtual project with source, tests, documentation, and API types. esbuild-wasm bundles it in a Worker. QuickJS executes the result outside the React page with memory, stack, CPU, and output limits. Candidate code receives serialized inputs and has no DOM, storage, or network access.”

## Slide 6 — 30 seconds

“A green test result does not end the interaction. It only permits deployment. The live bundle changes, the Gamer crosses the same bridge, and the game verifies the corrected behavior. Level 1 then reveals a second bug in the gate transaction, and its test run includes the repaired bridge as a regression.”

## Slide 7 — 35 seconds

“The campaign contains four themed wings and eight handcrafted defects. Transit covers boundaries and transaction ordering. Signal focuses on sequence validation and time units. Cargo uses occupancy and indexing errors. Reactor covers state transitions and priority ordering. The same cooperative loop supports each debugging pattern.”

## Slide 8 — 35 seconds

“The main window owns the world. Player input becomes a world event, the active QuickJS export returns a result, the host validates it, and the reducer applies the consequence. The live and candidate bundles stay separate. This keeps the demo local, deterministic, and safe without requiring a backend.”

## Slide 9 — 25 seconds

“For judges, the dependable mode is one split screen. We also support detached Gamer and Coder windows over BroadcastChannel. The main window remains authoritative, validates incoming actions, and sends snapshots. If the host disappears, the role windows show a disconnected state instead of creating their own world.”

## Slide 10 — 30 seconds

“PATCH//PLAY targets students and teams learning practical debugging habits. The prototype already includes four wings, eight defects, 22 domain checks, and five browser workflows. The next step is deeper world mechanics and a level-authoring kit. The central idea stays simple: the Gamer discovers the failure, the Coder changes the cause, and both prove the fix.”

## Handoff to demo

“Let me show the complete loop in the first level. Watch the bridge, the incident evidence, the candidate test gate, and the final player verification.”

