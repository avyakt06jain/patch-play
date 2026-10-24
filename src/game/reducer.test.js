import { describe, expect, it } from "vitest";
import { PHASES, canApplyPatch, createInitialState, reducer } from "./reducer";

const dispatch = (state, action) => reducer(state, action);
const move = (state, direction, times = 1) => {
  let next = state;
  for (let index = 0; index < times; index += 1) next = dispatch(next, { type: "MOVE", direction });
  return next;
};

function reachIncident() {
  let state = createInitialState();
  state = move(state, "up", 4);
  state = move(state, "right");
  state = move(state, "left");
  state = move(state, "down", 3);
  state = move(state, "right");
  state = dispatch(state, { type: "INTERACT" });
  state = move(state, "up");
  state = move(state, "right", 5);
  return state;
}

function reportAndTest() {
  let state = reachIncident();
  state = dispatch(state, { type: "TOGGLE_SCANNER_ATTACHMENT" });
  state = dispatch(state, { type: "REPORT_GLITCH" });
  state = dispatch(state, { type: "EDIT_DRAFT", value: "stepsOnBridge > maxSafeSteps" });
  state = dispatch(state, { type: "TEST_PATCH" });
  return state;
}

describe("session reducer", () => {
  it("captures a data-driven incident and authentic reproduction trace", () => {
    const state = reachIncident();
    expect(state.phase).toBe(PHASES.FAILURE_DETECTED);
    expect(state.hasKey).toBe(true);
    expect(state.scannerActive).toBe(true);
    expect(state.incident.snapshot).toMatchObject({ stepsOnBridge: 3, maxSafeSteps: 3, observed: "collapsed" });
    expect(state.incident.reproduction.at(-1).type).toBe("COLLAPSE");
  });

  it("guards editing and deployment until the proper phases", () => {
    const initial = createInitialState();
    expect(dispatch(initial, { type: "EDIT_DRAFT", value: ">" })).toBe(initial);
    expect(dispatch(initial, { type: "APPLY_PATCH" })).toBe(initial);
  });

  it("invalidates stale test results and deploys only the exact passing candidate", () => {
    let state = reportAndTest();
    expect(state.phase).toBe(PHASES.CANDIDATE_TESTED);
    expect(canApplyPatch(state)).toBe(true);
    state = dispatch(state, { type: "EDIT_DRAFT", value: ">=" });
    expect(state.rule.testResults).toBeNull();
    expect(canApplyPatch(state)).toBe(false);
  });

  it("replays captured evidence without moving the live player", () => {
    let state = reachIncident();
    state = dispatch(state, { type: "REPORT_GLITCH" });
    const player = state.player;
    state = dispatch(state, { type: "START_REPLAY" });
    state = dispatch(state, { type: "ADVANCE_REPLAY" });
    expect(state.player).toEqual(player);
    expect(state.replay.index).toBe(1);
  });

  it("allows rollback before victory while preserving the incident", () => {
    let state = reportAndTest();
    state = dispatch(state, { type: "APPLY_PATCH" });
    const incident = state.incident;
    state = dispatch(state, { type: "ROLLBACK_PATCH" });
    expect(state.phase).toBe(PHASES.CANDIDATE_TESTED);
    expect(state.rule.liveOperator).toBe(">=");
    expect(state.incident).toBe(incident);
  });

  it("requires live crossing and keyed exit interaction to verify", () => {
    let state = reportAndTest();
    state = dispatch(state, { type: "APPLY_PATCH" });
    expect(state.phase).toBe(PHASES.PATCH_DEPLOYED);
    state = move(state, "right", 4);
    state = move(state, "up", 2);
    state = move(state, "right", 2);
    expect(state.crossingVerified).toBe(true);
    state = dispatch(state, { type: "INTERACT" });
    expect(state.phase).toBe(PHASES.VERIFIED);
  });

  it("reset restores the entire initial session", () => {
    const changed = reportAndTest();
    expect(dispatch(changed, { type: "RESET" })).toEqual(createInitialState());
  });
});
