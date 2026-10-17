# PATCH//PLAY

> One plays the problem. The other patches the world.

PATCH//PLAY is a split-screen cooperative debugging game built for a hackathon. `PLAYER_01` explores a deliberately broken simulation and reports what went wrong. `DEV_02` inspects the resulting evidence, edits the real bridge rule, tests the candidate patch, and deploys it. The Gamer must then verify the repaired world by finishing the level.

## Gameplay loop

1. Explore the facility and collect the access key.
2. Optionally activate the diagnostic scanner with `E`.
3. Attempt the three-tile bridge and trigger its boundary-condition bug.
4. Review the captured evidence, add an observation, and send the incident to `DEV_02`.
5. Replay the real traversal, inspect the boundary variables, and correct line 05.
6. Run the four named regression checks and deploy the passing candidate.
7. Cross the repaired bridge and press `E` at the exit to win.

The initial rule is intentionally broken:

```js
stepsOnBridge >= maxSafeSteps
```

The bridge must remain stable for steps 1–3 and collapse only after the safe limit.

## Controls

- `WASD` or arrow keys: move `PLAYER_01`
- `E`: interact with the scanner or exit
- **SEND INCIDENT**: submit the captured evidence to the Coder
- **REPLAY**: step through the captured trace without moving the live player
- **TEST CANDIDATE**: run the candidate against all four boundary checks
- **DEPLOY PATCH**: update the live bridge after all checks pass
- **ROLLBACK**: restore live v0 before final player verification
- **RESET DEMO**: restore the complete initial state

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To create a production build:

```bash
npm run build
```

Run the domain regression suite:

```bash
npm test
```

The browser smoke test covers the complete keyboard-driven demo:

```bash
npm run test:e2e
```

## Technical approach

- React and Vite
- One guarded `useReducer` phase machine shared by the Gamer and Coder panels
- Fixed CSS-grid game world with keyboard movement and collision
- Deterministic player/world event recording and data-driven incident construction
- One authoritative `shouldCollapse` function used by gameplay, replay, and tests
- Restricted expression parsing with no `eval` or arbitrary JavaScript execution
- Live/candidate rule isolation, revision tracking, deployment gating, and rollback
- Vitest coverage for rule behavior, phase guards, replay, deployment, victory, and reset
- Playwright smoke coverage for the complete co-op demo path
- CSS/SVG-style visuals with no backend, database, authentication, or networking

Core implementation:

```text
src/
  App.jsx
  game.js
  game/
    map.js
    rules.js
    reducer.js
    *.test.js
  components/
    GamePanel.jsx
    CoderPanel.jsx
  styles.css
```

## Project documents

- `PATCH_PLAY_AGENT_BRIEF.md` — gameplay and functional specification
- `DESIGN.md` — visual language and interaction guidance
- `reference-images/` — visual references for the major game states

## Version

The working tree contains **v2**, a judge-ready single-level vertical slice. It deepens the same player-failure-to-code-patch-to-player-verification loop with authentic evidence, replay, guarded phases, revisioned deployment, and measured co-op victory. The GitHub `main` branch remains the v1 checkpoint until these changes are explicitly committed and pushed.
