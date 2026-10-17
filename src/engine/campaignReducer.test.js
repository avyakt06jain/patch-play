import { describe, expect, it } from "vitest";
import { LEVELS } from "../levels/cartridges";
import { LEVEL_PHASES, campaignReducer, createLevelSession } from "./campaignReducer";

const level = LEVELS[0];
const ready = () => campaignReducer(createLevelSession(level), { type: "LIVE_READY", bundleId: "live-0", durationMs: 4 });
const evidence = { observed: true, expected: false, source: { file: "/src/bridge.controller.ts", line: 3 } };

function reported() {
  const detected = campaignReducer(ready(), { type: "INCIDENT_DETECTED", incident: level.incidents[0], checkpoint: level.incidents[0].checkpoint, evidence });
  return campaignReducer(detected, { type: "REPORT_INCIDENT" });
}

describe("v3 campaign reducer", () => {
  it("opens the real suspected file when the player reports an incident", () => {
    const state = reported();
    expect(state.phase).toBe(LEVEL_PHASES.INCIDENT_REPORTED);
    expect(state.selectedFile).toBe("/src/bridge.controller.ts");
    expect(state.incidents[0].status).toBe("reported");
  });

  it("invalidates a passing candidate when source changes", () => {
    const tested = campaignReducer(reported(), { type: "TEST_COMPLETE", bundleId: "candidate-1", durationMs: 8, logs: [], results: [{ passed: true }] });
    const edited = campaignReducer(tested, { type: "EDIT_FILE", path: "/src/bridge.controller.ts", content: "changed" });
    expect(edited.tests.status).toBe("idle");
    expect(edited.candidateBundleId).toBeNull();
    expect(edited.candidateRevision).toBe(2);
  });

  it("refuses deployment until the exact candidate passed", () => {
    expect(campaignReducer(reported(), { type: "DEPLOY" }).liveBundleId).toBe("live-0");
    const tested = campaignReducer(reported(), { type: "TEST_COMPLETE", bundleId: "candidate-1", durationMs: 8, logs: [], results: [{ passed: true }] });
    const deployed = campaignReducer(tested, { type: "DEPLOY" });
    expect(deployed.liveBundleId).toBe("candidate-1");
    expect(deployed.phase).toBe(LEVEL_PHASES.PATCH_DEPLOYED);
  });

  it("rollback restores the previous live bundle without deleting evidence", () => {
    const tested = campaignReducer(reported(), { type: "TEST_COMPLETE", bundleId: "candidate-1", durationMs: 8, logs: [], results: [{ passed: true }] });
    const deployed = campaignReducer(tested, { type: "DEPLOY" });
    const rolledBack = campaignReducer(deployed, { type: "ROLLBACK" });
    expect(rolledBack.liveBundleId).toBe("live-0");
    expect(rolledBack.incidents[0].evidence).toEqual(evidence);
    expect(rolledBack.incidents[0].status).toBe("reported");
  });

  it("unlocks the second incident only after player verification", () => {
    const tested = campaignReducer(reported(), { type: "TEST_COMPLETE", bundleId: "candidate-1", durationMs: 8, logs: [], results: [{ passed: true }] });
    const deployed = campaignReducer(tested, { type: "DEPLOY" });
    const verified = campaignReducer(deployed, { type: "INCIDENT_VERIFIED", incident: level.incidents[0] });
    expect(verified.incidents[0].status).toBe("verified");
    expect(verified.incidents[1].status).toBe("active");
    expect(verified.activeIncidentIndex).toBe(1);
  });
});
