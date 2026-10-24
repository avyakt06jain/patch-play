import { getFileRecords } from "../levels/cartridges";

export const LEVEL_PHASES = Object.freeze({
  LOADING: "loading", EXPLORING: "exploring", INCIDENT_DETECTED: "incident_detected", INCIDENT_REPORTED: "incident_reported",
  CANDIDATE_EDITING: "candidate_editing", CANDIDATE_TESTED: "candidate_tested", PATCH_DEPLOYED: "patch_deployed",
  LEVEL_COMPLETE: "level_complete",
});

function recorded(sequence, tick, actor, type, message, payload = {}, tone = "neutral") {
  return { sequence, tick, actor, type, message, payload, tone };
}

function append(state, actor, type, message, payload = {}, tone = "neutral") {
  const next = recorded(state.nextSequence, state.tick, actor, type, message, payload, tone);
  return { events: [...state.events, next].slice(-80), nextSequence: state.nextSequence + 1 };
}

export function createLevelSession(level, difficulty = "guided") {
  const fileRecords = getFileRecords(level);
  const files = Object.fromEntries(fileRecords.map((file) => [file.path, file.content]));
  return {
    levelId: level.id, difficulty, phase: LEVEL_PHASES.LOADING, player: { ...level.spawn }, checkpoint: { ...level.spawn },
    inventory: [], scannerActive: false, scannerHeld: false, tick: 0, nextSequence: 4,
    events: [recorded(1, 0, "SYSTEM", "LEVEL_LOADED", `${level.number} · ${level.title}`), recorded(2, 0, "PLAYER_01", "SPAWN", `Spawned at (${level.spawn.x}, ${level.spawn.y})`), recorded(3, 0, "RUNTIME", "SANDBOX_WARMING", "Compiling live cartridge")],
    incidents: level.incidents.map((incident, index) => ({ id: incident.id, status: index === 0 ? "active" : "latent", evidence: null, trace: [], candidateRevision: null, deployedRevision: null, verifiedAt: null })),
    activeIncidentIndex: 0, files, baselineFiles: { ...files }, selectedFile: level.editableFiles[0], dirtyFiles: [],
    liveBundleId: null, liveRevision: 0, previousBundleId: null, candidateBundleId: null, candidateRevision: 1,
    compile: { status: "warming", durationMs: null, error: null }, tests: { status: "idle", results: [], error: null },
    runtimeLogs: [], notice: "Sandbox warming. World controls will unlock when the live cartridge is ready.", completed: false,
  };
}

export function campaignReducer(state, action) {
  switch (action.type) {
    case "LIVE_READY":
      return { ...state, phase: LEVEL_PHASES.EXPLORING, liveBundleId: action.bundleId, compile: { status: "ready", durationMs: action.durationMs, error: null }, notice: "Live cartridge online. Explore the facility.", ...append(state, "RUNTIME", "LIVE_READY", `Live bundle compiled in ${action.durationMs}ms`, {}, "success") };
    case "MOVE": {
      const moved = { ...state, player: action.point, tick: state.tick + 1 };
      return { ...moved, ...append(moved, "PLAYER_01", "MOVE", `MOVE_${action.direction.toUpperCase()} → (${action.point.x}, ${action.point.y})`, { direction: action.direction, point: action.point }) };
    }
    case "COLLECT_ITEM": {
      if (state.inventory.includes(action.itemId)) return state;
      const next = { ...state, inventory: [...state.inventory, action.itemId], notice: `${action.label} acquired.` };
      return { ...next, ...append(next, "PLAYER_01", "ITEM_COLLECTED", `${action.label} collected`, { itemId: action.itemId }, "success") };
    }
    case "SCANNER_ON": {
      if (state.scannerActive) return state;
      const next = { ...state, scannerActive: true, notice: "Scanner online. Additional runtime evidence will be attached." };
      return { ...next, ...append(next, "PLAYER_01", "SCANNER_ACTIVATED", "Diagnostic scanner activated", {}, "info") };
    }
    case "SET_SCANNER_HELD": return { ...state, scannerHeld: action.value };
    case "INCIDENT_DETECTED": {
      const records = state.incidents.map((incident, index) => index === state.activeIncidentIndex ? { ...incident, status: "detected", evidence: action.evidence, trace: state.events.slice(-15) } : incident);
      const next = { ...state, phase: LEVEL_PHASES.INCIDENT_DETECTED, incidents: records, player: { ...action.checkpoint }, checkpoint: { ...action.checkpoint }, notice: `${action.incident.id} captured from live gameplay.` };
      return { ...next, ...append(next, "WORLD", "INCIDENT_DETECTED", `${action.incident.id} · ${action.incident.title}`, action.evidence, "danger") };
    }
    case "REPORT_INCIDENT": {
      if (state.phase !== LEVEL_PHASES.INCIDENT_DETECTED) return state;
      const incidents = state.incidents.map((incident, index) => index === state.activeIncidentIndex ? { ...incident, status: "reported" } : incident);
      const suspectedFile = incidents[state.activeIncidentIndex].evidence?.source?.file;
      const next = { ...state, phase: LEVEL_PHASES.INCIDENT_REPORTED, incidents, selectedFile: suspectedFile ?? state.selectedFile, notice: "Structured evidence delivered to DEV_02." };
      return { ...next, ...append(next, "PLAYER_01", "INCIDENT_REPORTED", `${incidents[state.activeIncidentIndex].id} sent to DEV_02`, {}, "info") };
    }
    case "SELECT_FILE": return { ...state, selectedFile: action.path };
    case "EDIT_FILE": {
      const dirtyFiles = state.dirtyFiles.includes(action.path) ? state.dirtyFiles : [...state.dirtyFiles, action.path];
      const revision = state.tests.status === "passed" ? state.candidateRevision + 1 : state.candidateRevision;
      return { ...state, phase: LEVEL_PHASES.CANDIDATE_EDITING, files: { ...state.files, [action.path]: action.content }, dirtyFiles, candidateBundleId: null, candidateRevision: revision, tests: { status: "idle", results: [], error: null }, compile: { ...state.compile, error: null } };
    }
    case "RESTORE_FILE": {
      const files = { ...state.files, [action.path]: state.baselineFiles[action.path] };
      return { ...state, files, dirtyFiles: state.dirtyFiles.filter((path) => path !== action.path), candidateBundleId: null, tests: { status: "idle", results: [], error: null } };
    }
    case "TEST_START": return { ...state, tests: { status: "running", results: [], error: null }, compile: { ...state.compile, status: "compiling", error: null }, notice: "Compiling candidate inside the sandbox…" };
    case "TEST_COMPLETE": {
      const passed = action.results.every((result) => result.passed);
      const next = { ...state, phase: passed ? LEVEL_PHASES.CANDIDATE_TESTED : LEVEL_PHASES.CANDIDATE_EDITING, candidateBundleId: action.bundleId, compile: { status: "ready", durationMs: action.durationMs, error: null }, tests: { status: passed ? "passed" : "failed", results: action.results, error: null }, runtimeLogs: action.logs, notice: passed ? `${action.results.length}/${action.results.length} checks passed. Live world unchanged.` : "Candidate failed regression checks." };
      return { ...next, ...append(next, "DEV_02", "TEST_RUN", passed ? `Candidate v${state.candidateRevision} passed` : `Candidate v${state.candidateRevision} failed`, { results: action.results }, passed ? "success" : "danger") };
    }
    case "RUNTIME_ERROR": return { ...state, phase: state.phase === LEVEL_PHASES.LOADING ? LEVEL_PHASES.LOADING : LEVEL_PHASES.CANDIDATE_EDITING, compile: { status: "error", durationMs: null, error: action.error }, tests: { status: "error", results: [], error: action.error }, notice: "Sandbox rejected the candidate. Inspect the diagnostic." };
    case "DEPLOY": {
      if (state.tests.status !== "passed" || !state.candidateBundleId) return state;
      const incidents = state.incidents.map((incident, index) => index === state.activeIncidentIndex ? { ...incident, status: "patched", candidateRevision: state.candidateRevision, deployedRevision: state.candidateRevision } : incident);
      const next = { ...state, phase: LEVEL_PHASES.PATCH_DEPLOYED, incidents, previousBundleId: state.liveBundleId, liveBundleId: state.candidateBundleId, liveRevision: state.candidateRevision, notice: `Candidate v${state.candidateRevision} deployed. PLAYER_01 must reproduce the interaction.` };
      return { ...next, ...append(next, "DEV_02", "PATCH_DEPLOYED", `Candidate v${state.candidateRevision} deployed`, {}, "success") };
    }
    case "ROLLBACK": {
      if (state.phase !== LEVEL_PHASES.PATCH_DEPLOYED || !state.previousBundleId) return state;
      const incidents = state.incidents.map((incident, index) => index === state.activeIncidentIndex ? { ...incident, status: "reported", deployedRevision: null } : incident);
      const next = { ...state, phase: LEVEL_PHASES.CANDIDATE_TESTED, incidents, liveBundleId: state.previousBundleId, previousBundleId: null, liveRevision: Math.max(0, state.liveRevision - 1), notice: "Deployment rolled back. Incident evidence was preserved." };
      return { ...next, ...append(next, "DEV_02", "PATCH_ROLLBACK", "Live cartridge restored to previous revision", {}, "danger") };
    }
    case "INCIDENT_VERIFIED": {
      const finalIncident = state.activeIncidentIndex === state.incidents.length - 1;
      const incidents = state.incidents.map((incident, index) => index === state.activeIncidentIndex ? { ...incident, status: "verified", verifiedAt: state.tick } : index === state.activeIncidentIndex + 1 ? { ...incident, status: "active" } : incident);
      const next = { ...state, incidents, activeIncidentIndex: finalIncident ? state.activeIncidentIndex : state.activeIncidentIndex + 1, phase: finalIncident ? LEVEL_PHASES.LEVEL_COMPLETE : LEVEL_PHASES.EXPLORING, completed: finalIncident, previousBundleId: null, tests: { status: "idle", results: [], error: null }, candidateBundleId: null, candidateRevision: state.candidateRevision + 1, notice: finalIncident ? "Both defects verified. Facility wing stabilized." : "Patch verified. A deeper facility fault is now reachable." };
      return { ...next, ...append(next, "PLAYER_01", "PATCH_VERIFIED", `${action.incident.id} verified in the live world`, {}, "success") };
    }
    case "RESET_ROOM": return { ...state, player: { ...state.checkpoint }, notice: "Room restored to the latest checkpoint.", ...append(state, "PLAYER_01", "ROOM_RESET", "Returned to checkpoint") };
    default: return state;
  }
}
