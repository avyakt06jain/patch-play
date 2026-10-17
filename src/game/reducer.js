import {
  BRIDGE_APPROACH,
  BRIDGE_TILES,
  EXIT_POSITION,
  KEY_POSITION,
  MOVE_DELTAS,
  SCANNER_POSITION,
  getBridgeStep,
  isWalkable,
  samePoint,
} from "./map";
import {
  MAX_SAFE_STEPS,
  createBridgeRule,
  parseExpression,
  runBridgeTests,
  shouldCollapse,
} from "./rules";

export const PHASES = Object.freeze({
  EXPLORE: "explore",
  FAILURE_DETECTED: "failure_detected",
  INCIDENT_REPORTED: "incident_reported",
  CANDIDATE_EDITING: "candidate_editing",
  CANDIDATE_TESTED: "candidate_tested",
  PATCH_DEPLOYED: "patch_deployed",
  VERIFIED: "verified",
});

export const REPORT_OBSERVATIONS = [
  "Collapsed before I reached the far bank.",
  "The final bridge tile should have remained stable.",
  "The failure happened at the exact safety limit.",
];

const INITIAL_NOTICE = "Find the key, inspect the crossing, and reach the exit.";

function event(sequence, actor, type, payload, message, tone = "neutral") {
  return { sequence, actor, type, payload, message, tone, at: sequence };
}

function appendEvent(state, actor, type, payload, message, tone = "neutral") {
  const next = event(state.nextSequence, actor, type, payload, message, tone);
  return {
    events: [...state.events, next].slice(-40),
    nextSequence: state.nextSequence + 1,
  };
}

export function createInitialState() {
  const events = [
    event(1, "SYSTEM", "SESSION_STARTED", {}, "Local session started"),
    event(2, "PLAYER_01", "SPAWN", { x: 2, y: 6 }, "Spawned at safe checkpoint"),
    event(3, "SYSTEM", "RULESET_LOADED", { revision: 0 }, "Ruleset v0 loaded"),
  ];

  return {
    phase: PHASES.EXPLORE,
    player: { x: 2, y: 6 },
    hasKey: false,
    scannerActive: false,
    bridgeSteps: 0,
    bridgeBroken: false,
    crossingVerified: false,
    rule: createBridgeRule(),
    incident: null,
    reportDraft: {
      observation: REPORT_OBSERVATIONS[0],
      attachScanner: false,
    },
    replay: { active: false, index: 0 },
    notice: INITIAL_NOTICE,
    startedAt: 0,
    incidentAt: null,
    verifiedAt: null,
    events,
    nextSequence: 4,
  };
}

function createIncident(state, failureEvent) {
  const reproduction = [...state.events, failureEvent]
    .filter((entry) => ["MOVE", "KEY_COLLECTED", "SCANNER_ACTIVATED", "BRIDGE_STEP", "COLLAPSE"].includes(entry.type))
    .slice(-12);

  return {
    id: "BUG-001",
    title: "BRIDGE_01 collapsed at the safe boundary",
    source: state.rule.source,
    snapshot: {
      location: `BRIDGE_01 · TILE ${failureEvent.payload.tile}/${BRIDGE_TILES.length}`,
      stepsOnBridge: failureEvent.payload.stepsOnBridge,
      maxSafeSteps: MAX_SAFE_STEPS,
      liveOperator: state.rule.liveOperator,
      inventory: state.hasKey ? ["ACCESS_KEY"] : [],
      scanner: state.scannerActive ? "ONLINE" : "NOT USED",
      expected: "stable",
      observed: "collapsed",
    },
    reproduction,
    observation: null,
    scannerAttached: false,
  };
}

function movePlayer(state, direction) {
  if (state.phase === PHASES.VERIFIED || state.replay.active || state.bridgeBroken) return state;
  const delta = MOVE_DELTAS[direction];
  if (!delta) return state;

  const target = { x: state.player.x + delta.x, y: state.player.y + delta.y };
  if (!isWalkable(target)) return state;

  let next = {
    ...state,
    player: target,
    bridgeSteps: getBridgeStep(target),
    ...appendEvent(
      state,
      "PLAYER_01",
      "MOVE",
      { direction, from: state.player, to: target },
      `MOVE_${direction.toUpperCase()} → (${target.x}, ${target.y})`,
    ),
  };

  if (!state.hasKey && samePoint(target, KEY_POSITION)) {
    next = {
      ...next,
      hasKey: true,
      notice: "Access key acquired. The bridge route is now open.",
      ...appendEvent(next, "PLAYER_01", "KEY_COLLECTED", { item: "ACCESS_KEY" }, "Access key collected", "success"),
    };
  }

  const step = getBridgeStep(target);
  if (step > 0) {
    next = {
      ...next,
      ...appendEvent(next, "WORLD", "BRIDGE_STEP", { tile: step, stepsOnBridge: step }, `BRIDGE_STEP_${step}`, "info"),
    };

    if (shouldCollapse(step, state.rule.liveOperator)) {
      const collapseEvent = event(
        next.nextSequence,
        "WORLD",
        "COLLAPSE",
        { tile: step, stepsOnBridge: step, maxSafeSteps: MAX_SAFE_STEPS, operator: state.rule.liveOperator },
        `BRIDGE_01 collapsed at tile ${step}/${BRIDGE_TILES.length}`,
        "danger",
      );
      return {
        ...next,
        phase: PHASES.FAILURE_DETECTED,
        player: { ...BRIDGE_APPROACH },
        bridgeSteps: 0,
        bridgeBroken: true,
        incidentAt: collapseEvent.at,
        incident: createIncident(next, collapseEvent),
        notice: "Failure captured. Review the evidence and report the glitch.",
        events: [...next.events, collapseEvent],
        nextSequence: next.nextSequence + 1,
      };
    }

    if (state.phase === PHASES.PATCH_DEPLOYED && step === BRIDGE_TILES.length) {
      next = {
        ...next,
        crossingVerified: true,
        notice: "The repaired crossing held. Reach the exit and press E.",
        ...appendEvent(next, "PLAYER_01", "CROSSING_VERIFIED", { bridge: "BRIDGE_01" }, "Player crossed the repaired bridge", "success"),
      };
    }
  }

  return next;
}

function interact(state) {
  if (state.phase === PHASES.VERIFIED || state.replay.active) return state;
  const scannerDistance = Math.abs(state.player.x - SCANNER_POSITION.x) + Math.abs(state.player.y - SCANNER_POSITION.y);
  const exitDistance = Math.abs(state.player.x - EXIT_POSITION.x) + Math.abs(state.player.y - EXIT_POSITION.y);

  if (scannerDistance <= 1 && !state.scannerActive) {
    return {
      ...state,
      scannerActive: true,
      notice: "Diagnostic scanner online. Boundary telemetry is available.",
      ...appendEvent(state, "PLAYER_01", "SCANNER_ACTIVATED", { scanner: "SCAN_NODE_A" }, "Diagnostic scanner activated", "info"),
    };
  }

  if (exitDistance <= 1) {
    if (!state.hasKey) {
      return {
        ...state,
        notice: "Exit locked. Access key required.",
        ...appendEvent(state, "WORLD", "EXIT_DENIED", { reason: "MISSING_KEY" }, "Exit denied — key missing", "danger"),
      };
    }
    if (state.phase !== PHASES.PATCH_DEPLOYED || !state.crossingVerified) {
      return { ...state, notice: "Exit verification blocked until the repaired bridge is crossed." };
    }
    const verifiedEvent = event(state.nextSequence, "PLAYER_01", "EXIT_UNLOCKED", { key: "ACCESS_KEY" }, "Exit unlocked — patch verified", "success");
    return {
      ...state,
      phase: PHASES.VERIFIED,
      verifiedAt: verifiedEvent.at,
      notice: "Patch verified by the player. Session complete.",
      events: [...state.events, verifiedEvent],
      nextSequence: state.nextSequence + 1,
    };
  }

  return state;
}

function testCandidate(state) {
  if (![PHASES.INCIDENT_REPORTED, PHASES.CANDIDATE_EDITING, PHASES.CANDIDATE_TESTED].includes(state.phase)) return state;
  const parsed = parseExpression(state.rule.draftExpression);
  if (!parsed.valid) {
    return {
      ...state,
      phase: PHASES.CANDIDATE_EDITING,
      rule: { ...state.rule, testResults: null, testedExpression: null, testedOperator: null, testError: parsed.error },
      ...appendEvent(state, "DEV_02", "CANDIDATE_REJECTED", {}, "Candidate rejected by safe parser", "danger"),
    };
  }
  const results = runBridgeTests(parsed.operator);
  const passed = results.every((test) => test.passed);
  const revision = state.rule.candidateRevision;
  return {
    ...state,
    phase: passed ? PHASES.CANDIDATE_TESTED : PHASES.CANDIDATE_EDITING,
    notice: passed ? "Candidate passed 4/4 checks. Live rules are unchanged." : "Candidate failed the boundary regression.",
    rule: {
      ...state.rule,
      testResults: results,
      testedExpression: parsed.normalized,
      testedOperator: parsed.operator,
      testError: null,
      candidateRevision: revision,
      testedRevision: passed ? revision : null,
    },
    ...appendEvent(state, "DEV_02", "TEST_RUN", { revision, passed, results }, passed ? "Candidate passed 4/4 checks" : "Candidate failed checks", passed ? "success" : "danger"),
  };
}

export function canApplyPatch(state) {
  const parsed = parseExpression(state.rule.draftExpression);
  return Boolean(
    state.phase === PHASES.CANDIDATE_TESTED &&
      parsed.valid &&
      state.rule.testResults?.every((test) => test.passed) &&
      parsed.normalized === state.rule.testedExpression &&
      parsed.operator === state.rule.testedOperator &&
      state.rule.testedRevision === state.rule.candidateRevision,
  );
}

export function reducer(state, action) {
  switch (action.type) {
    case "MOVE":
      return movePlayer(state, action.direction);
    case "INTERACT":
      return interact(state);
    case "SET_REPORT_OBSERVATION":
      return state.phase === PHASES.FAILURE_DETECTED
        ? { ...state, reportDraft: { ...state.reportDraft, observation: action.value } }
        : state;
    case "TOGGLE_SCANNER_ATTACHMENT":
      return state.phase === PHASES.FAILURE_DETECTED && state.scannerActive
        ? { ...state, reportDraft: { ...state.reportDraft, attachScanner: !state.reportDraft.attachScanner } }
        : state;
    case "REPORT_GLITCH":
      if (state.phase !== PHASES.FAILURE_DETECTED || !state.incident) return state;
      return {
        ...state,
        phase: PHASES.INCIDENT_REPORTED,
        incident: {
          ...state.incident,
          observation: state.reportDraft.observation,
          scannerAttached: state.reportDraft.attachScanner,
        },
        notice: "Structured incident delivered to DEV_02.",
        ...appendEvent(state, "PLAYER_01", "INCIDENT_REPORTED", { id: state.incident.id }, "BUG-001 reported to DEV_02", "info"),
      };
    case "EDIT_DRAFT":
      if (![PHASES.INCIDENT_REPORTED, PHASES.CANDIDATE_EDITING, PHASES.CANDIDATE_TESTED].includes(state.phase)) return state;
      {
        const nextRevision = state.rule.testedRevision === state.rule.candidateRevision
          ? state.rule.candidateRevision + 1
          : state.rule.candidateRevision;
      return {
        ...state,
        phase: PHASES.CANDIDATE_EDITING,
        rule: {
          ...state.rule,
          draftExpression: action.value,
          testedExpression: null,
          testedOperator: null,
          testResults: null,
          testError: null,
          testedRevision: null,
          candidateRevision: nextRevision,
        },
      };
      }
    case "TEST_PATCH":
      return testCandidate(state);
    case "APPLY_PATCH":
      if (!canApplyPatch(state)) return state;
      return {
        ...state,
        phase: PHASES.PATCH_DEPLOYED,
        bridgeBroken: false,
        crossingVerified: false,
        notice: "Candidate v1 deployed. PLAYER_01 must verify it in the live world.",
        rule: { ...state.rule, liveOperator: state.rule.testedOperator, deployedRevision: state.rule.testedRevision },
        ...appendEvent(state, "DEV_02", "PATCH_DEPLOYED", { revision: state.rule.testedRevision }, "Candidate deployed to BRIDGE_01", "success"),
      };
    case "ROLLBACK_PATCH":
      if (state.phase !== PHASES.PATCH_DEPLOYED) return state;
      return {
        ...state,
        phase: PHASES.CANDIDATE_TESTED,
        player: { ...BRIDGE_APPROACH },
        bridgeSteps: 0,
        bridgeBroken: true,
        crossingVerified: false,
        notice: "Deployment rolled back. Incident history was preserved.",
        rule: { ...state.rule, liveOperator: ">=", deployedRevision: 0 },
        ...appendEvent(state, "DEV_02", "PATCH_ROLLED_BACK", { revision: 0 }, "Live rules rolled back to v0", "danger"),
      };
    case "START_REPLAY":
      return state.incident && state.phase !== PHASES.FAILURE_DETECTED
        ? { ...state, replay: { active: true, index: 0 } }
        : state;
    case "ADVANCE_REPLAY": {
      if (!state.replay.active || !state.incident) return state;
      const lastIndex = state.incident.reproduction.length - 1;
      return state.replay.index >= lastIndex
        ? { ...state, replay: { active: false, index: lastIndex } }
        : { ...state, replay: { active: true, index: state.replay.index + 1 } };
    }
    case "STOP_REPLAY":
      return { ...state, replay: { active: false, index: 0 } };
    case "RESET":
      return createInitialState();
    default:
      return state;
  }
}

export const PROGRESS_STAGES = ["EXPLORE", "INCIDENT", "TESTING", "PATCHED", "VERIFIED"];

export function getPhaseProgress(phase) {
  if (phase === PHASES.EXPLORE) return 0;
  if ([PHASES.FAILURE_DETECTED, PHASES.INCIDENT_REPORTED, PHASES.CANDIDATE_EDITING].includes(phase)) return 1;
  if (phase === PHASES.CANDIDATE_TESTED) return 2;
  if (phase === PHASES.PATCH_DEPLOYED) return 3;
  return 4;
}

export function getVerificationDuration(state) {
  if (state.incidentAt == null || state.verifiedAt == null) return null;
  return Math.max(0, state.verifiedAt - state.incidentAt);
}
