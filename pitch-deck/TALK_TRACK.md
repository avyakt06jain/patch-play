# Four-minute talk track

## Slide 1: 20 seconds

“PATCH//PLAY is a cooperative debugging game. One player explores a broken facility. Another edits the TypeScript modules controlling it. The team succeeds only when the changed code repairs the live world and the player verifies the result.”

## Slide 2: 35 seconds

“Debugging lessons often begin with an abstract error message or a failing test. The learner never experiences what the bug does. Our first level makes the failure visible. The bridge supports three tiles, but the live rule uses greater-than-or-equal, so it collapses exactly at the safe boundary. The player caused the incident and understands its consequence before opening the code.”

## Slide 3: 35 seconds

“The Gamer and Coder have different responsibilities. PLAYER_01 explores and reports what happened. DEV_02 receives the recent event trace, observed value, expected value, and suspected source. The Coder creates a candidate patch, but the game stays unchanged until the candidate passes its tests and gets deployed.”

## Slide 4: 45 seconds

“The editor contains real TypeScript files. CodeMirror manages the virtual project, esbuild-wasm bundles it inside a Worker, and QuickJS executes it outside the React page. The runtime limits memory, stack usage, CPU time, and log output. Candidate code has no access to the DOM, storage, or network. Deployment also includes regression checks for every previously verified incident.”

## Slide 5: 35 seconds

“A green test result only unlocks deployment. It does not complete the level. The tested candidate becomes the live bundle, and the Gamer repeats the same interaction. The level completes only after the repaired world behaves correctly. This keeps human verification inside the engineering loop.”

## Slide 6: 35 seconds

“The campaign contains four wings and eight sequential defects. Transit covers boundary conditions and transaction ordering. Signal introduces sequence validation and time units. Cargo focuses on occupancy and indexing. Reactor covers state transitions and event priority. The current prototype has 22 domain tests and five browser workflows protecting the core system.”

## Slide 7: 30 seconds

“PATCH//PLAY can support students, coding clubs, classroom pairs, and engineering onboarding. The learning behavior matters more than memorizing one fix: reproduce before editing, diagnose from evidence, protect earlier patches, and verify the live result. Our next milestone is deeper puzzle mechanics followed by a level-authoring kit. The Gamer discovers the failure, the Coder changes the cause, and both prove the fix.”

## Handoff to demo

“I’ll now show the complete bridge incident, patch, test, deployment, and player verification.”

