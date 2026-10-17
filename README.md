# PATCH//PLAY

> One plays the problem. The other patches the world.

PATCH//PLAY is a split-screen cooperative debugging game built for a hackathon. `PLAYER_01` explores a deliberately broken simulation and reports what went wrong. `DEV_02` inspects the resulting evidence, edits the real bridge rule, tests the candidate patch, and deploys it. The Gamer must then verify the repaired world by finishing the level.

## Gameplay loop

1. Explore the facility and collect the access key.
2. Optionally activate the diagnostic scanner with `E`.
3. Attempt the three-tile bridge and trigger its boundary-condition bug.
4. Select **REPORT GLITCH** to send the incident to `DEV_02`.
5. Correct the comparison expression in the debug console.
6. Run the four real bridge checks and apply the passing patch.
7. Cross the repaired bridge and press `E` at the exit to win.

The initial rule is intentionally broken:

```js
stepsOnBridge >= maxSafeSteps
```

The bridge must remain stable for steps 1–3 and collapse only after the safe limit.

## Controls

- `WASD` or arrow keys: move `PLAYER_01`
- `E`: interact with the scanner or exit
- **REPORT GLITCH**: send the bridge failure to the Coder
- **TEST PATCH**: run the candidate against all four boundary checks
- **APPLY PATCH**: update the live bridge after all checks pass
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

## Technical approach

- React and Vite
- One `useReducer` state machine shared by the Gamer and Coder panels
- Fixed CSS-grid game world with keyboard movement and collision
- One authoritative `shouldCollapse` function used by gameplay and tests
- Restricted expression parsing with no `eval` or arbitrary JavaScript execution
- CSS/SVG-style visuals with no backend, database, authentication, or networking

Core implementation:

```text
src/
  App.jsx
  game.js
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

This repository contains **v1**, a focused single-level hackathon prototype demonstrating the complete player-failure-to-code-patch-to-player-verification loop.
