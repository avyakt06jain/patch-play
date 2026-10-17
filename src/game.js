export const MAX_SAFE_STEPS = 3;
export const GRID_WIDTH = 15;
export const GRID_HEIGHT = 9;

export const START = { x: 2, y: 6 };
export const BRIDGE_APPROACH = { x: 5, y: 4 };
export const KEY_POSITION = { x: 3, y: 2 };
export const SCANNER_POSITION = { x: 4, y: 5 };
export const EXIT_POSITION = { x: 12, y: 2 };
export const BRIDGE_TILES = [
  { x: 6, y: 4 },
  { x: 7, y: 4 },
  { x: 8, y: 4 },
];

const WALLS = new Set(["3,3", "4,3", "10,5", "11,5", "12,5"]);
const MOVE_DELTAS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const pointKey = ({ x, y }) => `${x},${y}`;
export const samePoint = (a, b) => a.x === b.x && a.y === b.y;

export function getTileType(x, y) {
  const point = { x, y };
  if (BRIDGE_TILES.some((tile) => samePoint(tile, point))) return "bridge";
  const onLeftIsland = x >= 1 && x <= 5 && y >= 1 && y <= 7;
  const onRightIsland = x >= 9 && x <= 13 && y >= 1 && y <= 7;
  if (!onLeftIsland && !onRightIsland) return "void";
  if (WALLS.has(`${x},${y}`)) return "wall";
  return "floor";
}

export function shouldCollapse(step, operator) {
  if (operator === ">=") return step >= MAX_SAFE_STEPS;
  if (operator === ">") return step > MAX_SAFE_STEPS;
  throw new Error("Unsupported comparison operator");
}

export function parseExpression(expression) {
  const match = expression.match(
    /^\s*(?:return\s+)?(?:stepsOnBridge\s*)?(>=|>)(?:\s*maxSafeSteps)?\s*;?\s*$/,
  );
  if (!match) {
    return {
      valid: false,
      error: "Enter >, or: stepsOnBridge > maxSafeSteps",
    };
  }
  return {
    valid: true,
    operator: match[1],
    normalized: `stepsOnBridge ${match[1]} maxSafeSteps`,
  };
}

function createLog(id, text, tone = "neutral") {
  return { id, text, tone };
}

export function createInitialState() {
  return {
    player: { ...START },
    hasKey: false,
    scannerActive: false,
    bridgeSteps: 0,
    bridgeBroken: false,
    liveOperator: ">=",
    draftExpression: "stepsOnBridge >= maxSafeSteps",
    testedExpression: null,
    testedOperator: null,
    testResults: null,
    testError: null,
    patchApplied: false,
    incident: null,
    reportSent: false,
    won: false,
    notice: "Find the key. Reach the exit. Something here is broken.",
    logs: [
      createLog(1, "Session started"),
      createLog(2, `Player spawned at (${START.x}, ${START.y})`),
      createLog(3, "World initialized with ruleset v0.1"),
    ],
    nextLogId: 4,
  };
}

function appendLog(state, text, tone = "neutral") {
  const logs = [...state.logs, createLog(state.nextLogId, text, tone)].slice(-6);
  return { logs, nextLogId: state.nextLogId + 1 };
}

function isWalkable(point) {
  const tile = getTileType(point.x, point.y);
  return tile === "floor" || tile === "bridge";
}

function movePlayer(state, direction) {
  if (state.won) return state;
  const delta = MOVE_DELTAS[direction];
  if (!delta) return state;

  const target = {
    x: state.player.x + delta.x,
    y: state.player.y + delta.y,
  };
  if (!isWalkable(target)) return state;

  const bridgeIndex = BRIDGE_TILES.findIndex((tile) => samePoint(tile, target));
  const enteringBridge = bridgeIndex !== -1;
  const bridgeSteps = enteringBridge ? bridgeIndex + 1 : 0;

  if (enteringBridge && shouldCollapse(bridgeSteps, state.liveOperator)) {
    const incident = {
      id: "BUG-001",
      type: "BRIDGE_COLLAPSE",
      bridge: "BRIDGE_01",
      tile: bridgeSteps,
      totalTiles: BRIDGE_TILES.length,
      stepsOnBridge: bridgeSteps,
      maxSafeSteps: MAX_SAFE_STEPS,
      expected: "stable",
      observed: "collapsed",
      source: "bridge.rules.js",
      line: 5,
    };
    return {
      ...state,
      player: { ...BRIDGE_APPROACH },
      bridgeSteps: 0,
      bridgeBroken: true,
      incident,
      notice: "That wasn’t supposed to happen.",
      ...appendLog(state, "BRIDGE_01 collapsed at tile 3/3", "danger"),
    };
  }

  let nextState = {
    ...state,
    player: target,
    bridgeSteps,
    notice: state.patchApplied
      ? "Patch received. Cross the bridge and verify the exit."
      : state.notice,
  };

  if (!state.hasKey && samePoint(target, KEY_POSITION)) {
    nextState = {
      ...nextState,
      hasKey: true,
      notice: "Access key acquired. Investigate the bridge.",
      ...appendLog(nextState, "Access key collected", "success"),
    };
  }

  if (state.patchApplied && enteringBridge && bridgeSteps === 3) {
    nextState = {
      ...nextState,
      notice: "Crossing verified. Reach the exit and press E.",
      ...appendLog(nextState, "Player crossed repaired bridge", "success"),
    };
  }

  return nextState;
}

function interact(state) {
  if (state.won) return state;
  const scannerDistance =
    Math.abs(state.player.x - SCANNER_POSITION.x) +
    Math.abs(state.player.y - SCANNER_POSITION.y);
  const exitDistance =
    Math.abs(state.player.x - EXIT_POSITION.x) +
    Math.abs(state.player.y - EXIT_POSITION.y);

  if (scannerDistance <= 1 && !state.scannerActive) {
    return {
      ...state,
      scannerActive: true,
      notice: "Diagnostic scan complete. The boundary looks unstable.",
      ...appendLog(state, "Diagnostic scanner activated", "info"),
    };
  }

  if (exitDistance <= 1) {
    if (!state.hasKey) {
      return {
        ...state,
        notice: "Exit locked. Access key required.",
        ...appendLog(state, "Exit access denied — key missing", "danger"),
      };
    }
    if (!state.patchApplied) return state;
    return {
      ...state,
      won: true,
      notice: "Patch verified by player.",
      ...appendLog(state, "Exit reached — world stable", "success"),
    };
  }

  return state;
}

function runTests(state) {
  const parsed = parseExpression(state.draftExpression);
  if (!parsed.valid) {
    return {
      ...state,
      testResults: null,
      testedExpression: null,
      testedOperator: null,
      testError: parsed.error,
      ...appendLog(state, "Candidate rule rejected by parser", "danger"),
    };
  }

  const expectations = [false, false, false, true];
  const testResults = expectations.map((expectedCollapse, index) => {
    const step = index + 1;
    const observedCollapse = shouldCollapse(step, parsed.operator);
    return {
      step,
      expected: expectedCollapse ? "collapse" : "stable",
      observed: observedCollapse ? "collapse" : "stable",
      passed: observedCollapse === expectedCollapse,
    };
  });
  const passed = testResults.every((test) => test.passed);

  return {
    ...state,
    testResults,
    testedExpression: parsed.normalized,
    testedOperator: parsed.operator,
    testError: null,
    notice: passed
      ? "Candidate passed. The live world has not changed yet."
      : "Candidate failed. Inspect the boundary behavior.",
    ...appendLog(
      state,
      passed ? "Candidate rule passed 4/4 checks" : "Candidate rule failed checks",
      passed ? "success" : "danger",
    ),
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case "MOVE":
      return movePlayer(state, action.direction);
    case "INTERACT":
      return interact(state);
    case "REPORT_GLITCH":
      if (!state.incident || state.reportSent) return state;
      return {
        ...state,
        reportSent: true,
        notice: "Report sent. DEV_02 is investigating.",
        ...appendLog(state, "BUG-001 reported to DEV_02", "info"),
      };
    case "EDIT_DRAFT":
      return {
        ...state,
        draftExpression: action.value,
        testedExpression: null,
        testedOperator: null,
        testResults: null,
        testError: null,
      };
    case "TEST_PATCH":
      return state.reportSent ? runTests(state) : state;
    case "APPLY_PATCH": {
      const parsed = parseExpression(state.draftExpression);
      const testsPassed = state.testResults?.every((test) => test.passed);
      const sameTestedDraft = parsed.valid && parsed.normalized === state.testedExpression;
      if (!testsPassed || !sameTestedDraft || parsed.operator !== state.testedOperator) {
        return state;
      }
      return {
        ...state,
        liveOperator: state.testedOperator,
        patchApplied: true,
        bridgeBroken: false,
        notice: "Same world. Different rules. Try the bridge again.",
        ...appendLog(state, "Patch deployed to BRIDGE_01", "success"),
      };
    }
    case "RESET":
      return createInitialState();
    default:
      return state;
  }
}

export function canApplyPatch(state) {
  const parsed = parseExpression(state.draftExpression);
  return Boolean(
    parsed.valid &&
      state.testResults?.every((test) => test.passed) &&
      parsed.normalized === state.testedExpression &&
      parsed.operator === state.testedOperator &&
      !state.patchApplied,
  );
}
