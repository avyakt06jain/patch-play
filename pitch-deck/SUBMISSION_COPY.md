# Submission copy

## Project title

PATCH//PLAY — The Cooperative Debugging Game

## Track

EdTech under FinTech / EdTech / HealthTech

Open Innovation is the alternative if the event treats educational games as a separate category.

## Short abstract

Learning to debug is often disconnected from understanding how code affects real systems. PATCH//PLAY turns debugging into a cooperative puzzle adventure where one player experiences failures caused by genuine software defects, while another investigates captured runtime evidence, edits the responsible TypeScript modules, runs regression tests, and deploys a patch. The changed code controls the live game world, but the fix only counts after the Gamer reproduces the scenario and verifies the repaired behavior. Across four facility wings, players diagnose boundary conditions, validation logic, state transitions, event ordering, and indexing errors. PATCH//PLAY makes software engineering concepts visible and collaborative while demonstrating secure browser-side compilation, sandboxed execution, incident replay, regression testing, deployment, and human verification.

## One-line pitch

A cooperative debugging game where one player experiences the bug, another patches the real code, and both verify the repaired world.

## Tech stack

- React 19 and Vite 8
- JavaScript and editable TypeScript cartridges
- HTML5 Canvas and CSS
- CodeMirror 6
- esbuild-wasm
- QuickJS through quickjs-emscripten
- Web Workers
- Zod
- BroadcastChannel and LocalStorage
- Vitest and Playwright
- Git and GitHub

## Technical proof available in the prototype

- Four campaign levels with eight sequential defects
- Real virtual source files, tests, documentation, and API types
- Separate live and candidate bundles
- Active incident tests plus previous regression tests
- QuickJS memory, stack, CPU, and console-output limits
- Worker-only compilation and execution
- Optional synchronized Gamer and Coder windows
- 22 passing domain tests and five passing browser workflows at the time of capture

## Recommended judge takeaway

PATCH//PLAY connects a human-visible failure to real source code, gates deployment with regression tests, and still requires a human to verify the repaired behavior.

