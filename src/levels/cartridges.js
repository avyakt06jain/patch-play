const apiTypes = `export interface Point { x: number; y: number }
export interface RuleContext { tick: number; inventory: string[]; flags: Record<string, boolean> }
export type WorldCommand =
  | { type: "SET_ENTITY_STATE"; entityId: string; state: string }
  | { type: "SET_COMPONENT"; entityId: string; component: string; value: unknown }
  | { type: "MOVE_ENTITY"; entityId: string; target: Point }
  | { type: "GRANT_ITEM"; playerId: string; itemId: string }
  | { type: "CONSUME_ITEM"; playerId: string; itemId: string }
  | { type: "SET_OBJECTIVE"; objectiveId: string; status: "locked" | "active" | "complete" }
  | { type: "EMIT_EVENT"; eventType: string; payload: unknown }
  | { type: "CREATE_CHECKPOINT"; checkpointId: string };
export interface LevelSystem { id: string; onEvent?: (context: RuleContext, event: unknown) => WorldCommand[] };
`;

const makeFiles = (source, tests, mission) => ({
  ...source,
  ...tests,
  "/docs/mission.md": mission,
  "/types/patchplay-api.d.ts": apiTypes,
});

const commonCapabilities = {
  maxCommandsPerHook: 64,
  allowedCommands: ["SET_ENTITY_STATE", "SET_COMPONENT", "MOVE_ENTITY", "GRANT_ITEM", "CONSUME_ITEM", "SET_OBJECTIVE", "EMIT_EVENT", "CREATE_CHECKPOINT"],
};

export const LEVELS = [
  {
    id: "transit-wing",
    number: "01",
    title: "THE BROKEN CROSSING",
    wing: "transit",
    accent: "#52dfe1",
    summary: "Recover a transit key, cross an unstable bridge, and restore the exit gate.",
    entryFile: "/src/index.ts",
    spawn: { x: 2, y: 7 },
    scanner: { x: 4, y: 6 },
    map: [
      "#####################",
      "#......~~~~~~.......#",
      "#..K...~~~~~~....2E.#",
      "#......~~~~~~.......#",
      "#.....1BBB..........#",
      "#......~~~~~~.......#",
      "#...S..~~~~~~.......#",
      "#.@....~~~~~~.......#",
      "#......~~~~~~.......#",
      "#####################",
    ],
    mechanics: ["ACCESS KEY", "SCANNER", "COLLAPSIBLE BRIDGE", "POWERED GATE"],
    capabilities: commonCapabilities,
    editableFiles: ["/src/bridge.controller.ts", "/src/access-gate.ts", "/src/telemetry.ts"],
    readOnlyFiles: ["/src/index.ts", "/tests/bridge.spec.ts", "/tests/gate.spec.ts", "/docs/mission.md", "/types/patchplay-api.d.ts"],
    files: makeFiles({
      "/src/index.ts": `export { shouldCollapse } from "./bridge.controller";\nexport { authorizeGate } from "./access-gate";\nexport { formatTelemetry } from "./telemetry";`,
      "/src/bridge.controller.ts": `export function shouldCollapse(stepsOnBridge: number, maxSafeSteps: number) {\n  // The bridge should support every safe step.\n  return stepsOnBridge >= maxSafeSteps;\n}\n`,
      "/src/access-gate.ts": `export function authorizeGate(hasKey: boolean, powerOnline: boolean) {\n  let keyAvailable = hasKey;\n  keyAvailable = false; // consume key\n  const opened = powerOnline && keyAvailable;\n  return { opened, keyRetained: !opened && keyAvailable };\n}\n`,
      "/src/telemetry.ts": `export function formatTelemetry(system: string, value: unknown) {\n  return \`[\${system}] \${String(value)}\`;\n}\n`,
    }, {
      "/tests/bridge.spec.ts": `expect(shouldCollapse(1, 3)).toBe(false);\nexpect(shouldCollapse(2, 3)).toBe(false);\nexpect(shouldCollapse(3, 3)).toBe(false);\nexpect(shouldCollapse(4, 3)).toBe(true);`,
      "/tests/gate.spec.ts": `expect(authorizeGate(true, true)).toEqual({ opened: true, keyRetained: false });\nexpect(authorizeGate(true, false)).toEqual({ opened: false, keyRetained: true });`,
    }, `# Transit Wing\nThe transit bridge supports exactly three tiles. Restore the crossing, then repair the powered access gate without losing the only key.`),
    incidents: [
      { id: "BRG-101", title: "Bridge boundary collapse", file: "/src/bridge.controller.ts", line: 3, trigger: { x: 9, y: 4 }, mode: "enter", functionName: "shouldCollapse", liveArgs: [3, 3], successValue: false, checkpoint: { x: 6, y: 4 }, hint: "Three steps are permitted. Inspect what happens exactly at the limit.", scannerHint: "stepsOnBridge and maxSafeSteps are both 3 when collapse returns true.", tests: [
        { name: "Entry remains stable", args: [1, 3], expected: false }, { name: "Midpoint remains stable", args: [2, 3], expected: false }, { name: "Boundary remains stable", args: [3, 3], expected: false }, { name: "Overflow collapses", args: [4, 3], expected: true },
      ] },
      { id: "GATE-102", title: "Access token lost before authorization", file: "/src/access-gate.ts", line: 3, trigger: { x: 17, y: 2 }, mode: "interact", functionName: "authorizeGate", liveArgs: [true, true], successValue: { opened: true, keyRetained: false }, checkpoint: { x: 15, y: 2 }, hint: "Validate every precondition before committing an inventory transaction.", scannerHint: "The key changes state before the gate evaluates its authorization condition.", tests: [
        { name: "Powered gate opens", args: [true, true], expected: { opened: true, keyRetained: false } }, { name: "Denied attempt preserves key", args: [true, false], expected: { opened: false, keyRetained: true } }, { name: "Missing key stays denied", args: [false, true], expected: { opened: false, keyRetained: false } },
      ] },
    ],
  },
  {
    id: "signal-wing", number: "02", title: "SEQUENCE BREACH", wing: "signal", accent: "#b78cff",
    summary: "Decode four relay chambers and survive a containment alarm.", entryFile: "/src/index.ts", spawn: { x: 2, y: 7 }, scanner: { x: 3, y: 2 }, capabilities: commonCapabilities,
    map: ["#####################", "#....#......#.......#", "#..S.#.A..B.#.......#", "#....#......#.......#", "#....####.###..1....#", "#..........#........#", "#..C..D....#....2E..#", "#.@........#........#", "#...................#", "#####################"],
    mechanics: ["SIGNAL RELAYS", "GLYPH ORDER", "ALARM SWEEP", "SAFE ZONES"],
    editableFiles: ["/src/sequence-validator.ts", "/src/alarm-controller.ts", "/src/signal-map.ts"],
    readOnlyFiles: ["/src/index.ts", "/tests/sequence.spec.ts", "/tests/alarm.spec.ts", "/docs/mission.md", "/types/patchplay-api.d.ts"],
    files: makeFiles({
      "/src/index.ts": `export { validateSequence } from "./sequence-validator";\nexport { alarmCanReset } from "./alarm-controller";\nexport { relayNames } from "./signal-map";`,
      "/src/sequence-validator.ts": `export function validateSequence(entered: string[], expected: string[]) {\n  return entered.length === expected.length &&\n    entered.some((signal, index) => signal === expected[index]);\n}\n`,
      "/src/alarm-controller.ts": `export function alarmCanReset(elapsedSeconds: number, resetAfterSeconds: number) {\n  const elapsedMs = elapsedSeconds * 1000;\n  return elapsedMs >= resetAfterSeconds;\n}\n`,
      "/src/signal-map.ts": `export const relayNames = ["AMBER", "CYAN", "VIOLET", "WHITE"];\n`,
    }, {
      "/tests/sequence.spec.ts": `expect(validateSequence(["A","C","B","D"], ["A","C","B","D"])).toBe(true);\nexpect(validateSequence(["A","X","X","X"], ["A","C","B","D"])).toBe(false);`,
      "/tests/alarm.spec.ts": `expect(alarmCanReset(4, 5)).toBe(false);\nexpect(alarmCanReset(5, 5)).toBe(true);`,
    }, `# Signal Wing\nRead the relay glyphs across four chambers. A partial match is not a valid sequence, and containment must hold for exactly five seconds.`),
    incidents: [
      { id: "SIG-201", title: "Partial sequence accepted", file: "/src/sequence-validator.ts", line: 3, trigger: { x: 15, y: 4 }, mode: "enter", functionName: "validateSequence", liveArgs: [["A", "X", "X", "X"], ["A", "C", "B", "D"]], successValue: false, checkpoint: { x: 13, y: 4 }, hint: "One correct relay does not make the entire sequence correct.", scannerHint: "Only index 0 matches, yet validation returns true.", tests: [
        { name: "Exact sequence accepted", args: [["A", "C", "B", "D"], ["A", "C", "B", "D"]], expected: true }, { name: "Partial match rejected", args: [["A", "X", "X", "X"], ["A", "C", "B", "D"]], expected: false }, { name: "Wrong order rejected", args: [["D", "B", "C", "A"], ["A", "C", "B", "D"]], expected: false },
      ] },
      { id: "ALM-202", title: "Containment timer resets early", file: "/src/alarm-controller.ts", line: 3, trigger: { x: 16, y: 6 }, mode: "interact", functionName: "alarmCanReset", liveArgs: [1, 5], successValue: false, checkpoint: { x: 14, y: 6 }, hint: "The values share a label, but do they share a unit?", scannerHint: "elapsedMs is 1000 while resetAfterSeconds is 5.", tests: [
        { name: "One second remains active", args: [1, 5], expected: false }, { name: "Four seconds remains active", args: [4, 5], expected: false }, { name: "Five seconds resets", args: [5, 5], expected: true },
      ] },
    ],
  },
  {
    id: "cargo-wing", number: "03", title: "GHOST CARGO", wing: "cargo", accent: "#ffc078",
    summary: "Move crates through a broken occupancy and conveyor system.", entryFile: "/src/index.ts", spawn: { x: 2, y: 7 }, scanner: { x: 4, y: 2 }, capabilities: commonCapabilities,
    map: ["#####################", "#...................#", "#...S...C..P........#", "#..####......####...#", "#......1...........##", "#..C..>>>>>>........#", "#.....P.......2.E...#", "#.@.................#", "#...................#", "#####################"],
    mechanics: ["PUSHABLE CRATES", "PRESSURE PLATES", "CONVEYORS", "POWER CELL"],
    editableFiles: ["/src/occupancy.ts", "/src/conveyor-router.ts", "/src/cargo-types.ts"],
    readOnlyFiles: ["/src/index.ts", "/tests/occupancy.spec.ts", "/tests/conveyor.spec.ts", "/docs/mission.md", "/types/patchplay-api.d.ts"],
    files: makeFiles({
      "/src/index.ts": `export { removeOccupant } from "./occupancy";\nexport { tileIndex } from "./conveyor-router";\nexport type { CargoEvent } from "./cargo-types";`,
      "/src/occupancy.ts": `export function removeOccupant(occupiedIds: string[], entityId: string, plateId: string) {\n  return occupiedIds.filter((id) => id !== plateId);\n}\n`,
      "/src/conveyor-router.ts": `export function tileIndex(x: number, y: number, width: number, height: number) {\n  return y * height + x;\n}\n`,
      "/src/cargo-types.ts": `export interface CargoEvent { entityId: string; plateId: string; direction: "N"|"E"|"S"|"W" }\n`,
    }, {
      "/tests/occupancy.spec.ts": `expect(removeOccupant(["crate-a","crate-b"], "crate-a", "plate-1")).toEqual(["crate-b"]);`,
      "/tests/conveyor.spec.ts": `expect(tileIndex(3, 2, 12, 8)).toBe(27);`,
    }, `# Cargo Wing\nPressure plates must track entities, not themselves. Conveyor coordinates use the width of the rectangular factory floor.`),
    incidents: [
      { id: "PLT-301", title: "Ghost crate remains on plate", file: "/src/occupancy.ts", line: 2, trigger: { x: 7, y: 4 }, mode: "enter", functionName: "removeOccupant", liveArgs: [["crate-a", "crate-b"], "crate-a", "plate-1"], successValue: ["crate-b"], checkpoint: { x: 5, y: 4 }, hint: "The leave event identifies both the moving entity and its plate.", scannerHint: "occupiedIds contains entity IDs; the filter compares against a plate ID.", tests: [
        { name: "Leaving crate removed", args: [["crate-a", "crate-b"], "crate-a", "plate-1"], expected: ["crate-b"] }, { name: "Other crate preserved", args: [["crate-a", "crate-b"], "crate-b", "plate-1"], expected: ["crate-a"] },
      ] },
      { id: "CVR-302", title: "Conveyor routes into service pit", file: "/src/conveyor-router.ts", line: 2, trigger: { x: 14, y: 6 }, mode: "enter", functionName: "tileIndex", liveArgs: [3, 2, 12, 8], successValue: 27, checkpoint: { x: 12, y: 6 }, hint: "Flattening a row advances by the row's horizontal span.", scannerHint: "The floor is 12 tiles wide and 8 tiles high.", tests: [
        { name: "Origin index", args: [0, 0, 12, 8], expected: 0 }, { name: "Second row starts at width", args: [0, 1, 12, 8], expected: 12 }, { name: "Rectangular route index", args: [3, 2, 12, 8], expected: 27 },
      ] },
    ],
  },
  {
    id: "reactor-wing", number: "04", title: "PRIORITY ZERO", wing: "reactor", accent: "#fa7285",
    summary: "Stabilize the core while lasers and a patrol system cycle around you.", entryFile: "/src/index.ts", spawn: { x: 2, y: 7 }, scanner: { x: 3, y: 2 }, capabilities: commonCapabilities,
    map: ["#####################", "#......#...........##", "#..S.V.#..L..D......#", "#......#............#", "#......1....V.......#", "#..L.............L..#", "#.........V....2.E..#", "#.@.................#", "#...................#", "#####################"],
    mechanics: ["COOLANT VALVES", "LASER CYCLES", "PATROL DRONE", "PRIORITY QUEUE"],
    editableFiles: ["/src/reactor-state.ts", "/src/event-queue.ts", "/src/reactor-config.ts"],
    readOnlyFiles: ["/src/index.ts", "/tests/reactor.spec.ts", "/tests/events.spec.ts", "/docs/mission.md", "/types/patchplay-api.d.ts"],
    files: makeFiles({
      "/src/index.ts": `export { nextReactorState } from "./reactor-state";\nexport { orderEvents } from "./event-queue";\nexport { safeTemperature } from "./reactor-config";`,
      "/src/reactor-state.ts": `const transitions: Record<string, Record<string, string>> = {\n  OFFLINE: { POWER_RESTORED: "COOLING" },\n  COOLING: { COOLANT_READY: "OVERHEAT" },\n  STABLE: { FAULT: "OVERHEAT" },\n};\nexport function nextReactorState(state: string, event: string) {\n  return transitions[state]?.[event] ?? state;\n}\n`,
      "/src/event-queue.ts": `export function orderEvents(events: { id: string; priority: number }[]) {\n  return [...events].sort((a, b) => a.priority - b.priority).map((event) => event.id);\n}\n`,
      "/src/reactor-config.ts": `export const safeTemperature = 320;\n`,
    }, {
      "/tests/reactor.spec.ts": `expect(nextReactorState("COOLING", "COOLANT_READY")).toBe("STABLE");`,
      "/tests/events.spec.ts": `expect(orderEvents([{id:"UNLOCK",priority:10},{id:"POWER",priority:100}])).toEqual(["POWER","UNLOCK"]);`,
    }, `# Reactor Wing\nComplete the cooling transition, then process the power event before the elevator unlock request.`),
    incidents: [
      { id: "RCT-401", title: "Reactor cannot enter stable state", file: "/src/reactor-state.ts", line: 3, trigger: { x: 7, y: 4 }, mode: "enter", functionName: "nextReactorState", liveArgs: ["COOLING", "COOLANT_READY"], successValue: "STABLE", checkpoint: { x: 5, y: 4 }, hint: "The coolant event is valid; inspect its state transition target.", scannerHint: "COOLING + COOLANT_READY currently resolves to OVERHEAT.", tests: [
        { name: "Power begins cooling", args: ["OFFLINE", "POWER_RESTORED"], expected: "COOLING" }, { name: "Coolant stabilizes core", args: ["COOLING", "COOLANT_READY"], expected: "STABLE" }, { name: "Unknown event preserves state", args: ["STABLE", "UNKNOWN"], expected: "STABLE" },
      ] },
      { id: "EVT-402", title: "Elevator unlock loses race", file: "/src/event-queue.ts", line: 2, trigger: { x: 15, y: 6 }, mode: "enter", functionName: "orderEvents", liveArgs: [[{ id: "ELEVATOR_UNLOCK", priority: 10 }, { id: "POWER_STABLE", priority: 100 }]], successValue: ["POWER_STABLE", "ELEVATOR_UNLOCK"], checkpoint: { x: 13, y: 6 }, hint: "Higher priority work must leave the queue first.", scannerHint: "The queue currently begins with priority 10 instead of priority 100.", tests: [
        { name: "Critical event first", args: [[{ id: "LOW", priority: 1 }, { id: "HIGH", priority: 9 }]], expected: ["HIGH", "LOW"] }, { name: "Power precedes unlock", args: [[{ id: "ELEVATOR_UNLOCK", priority: 10 }, { id: "POWER_STABLE", priority: 100 }]], expected: ["POWER_STABLE", "ELEVATOR_UNLOCK"] },
      ] },
    ],
  },
];

export const getLevel = (id) => LEVELS.find((level) => level.id === id) ?? LEVELS[0];

export function getFileRecords(level) {
  return Object.entries(level.files).map(([path, content]) => ({
    path,
    content,
    language: path.endsWith(".md") ? "markdown" : path.endsWith(".json") ? "json" : "typescript",
    readOnly: level.readOnlyFiles.includes(path),
  }));
}
