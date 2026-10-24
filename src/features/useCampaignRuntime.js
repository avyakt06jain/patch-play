import { useCallback, useEffect, useRef, useState } from "react";
import { LEVELS, getLevel } from "../levels/cartridges";
import { SandboxClient } from "../runtime/SandboxClient";
import { deepEqual, validateLevels } from "../runtime/contracts";
import { looksLikeWorldCommands, validateWorldCommands } from "../runtime/commandValidator";
import { LEVEL_PHASES, campaignReducer, createLevelSession } from "../engine/campaignReducer";
import { canWalk, isNear, nextPoint, samePoint, tileAt } from "../engine/world";

validateLevels(LEVELS);
const PROGRESS_KEY = "patchplay.v3.progress";

function savedProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) ?? { completed: [] }; } catch { return { completed: [] }; }
}

function hydrateDraft(level, fresh) {
  try {
    const saved = JSON.parse(localStorage.getItem(`patchplay.v3.draft.${level.id}`));
    if (!saved || typeof saved !== "object") return fresh;
    const files = { ...fresh.files };
    const dirtyFiles = [];
    for (const path of level.editableFiles) {
      if (typeof saved[path] !== "string") continue;
      files[path] = saved[path];
      if (saved[path] !== fresh.baselineFiles[path]) dirtyFiles.push(path);
    }
    return { ...fresh, files, dirtyFiles, notice: dirtyFiles.length ? "Saved candidate restored. Live cartridge is still baseline v0." : fresh.notice };
  } catch {
    return fresh;
  }
}

export function useCampaignRuntime() {
  const query = new URLSearchParams(window.location.search);
  const requestedRole = query.get("role");
  const detachedRole = ["gamer", "coder"].includes(requestedRole) ? requestedRole : null;
  const sessionIdRef = useRef(query.get("session") || crypto.randomUUID());
  const channelRef = useRef(null);
  const [session, setSession] = useState(null);
  const [difficulty, setDifficulty] = useState("guided");
  const [progress, setProgress] = useState(savedProgress);
  const [connection, setConnection] = useState(detachedRole ? "connecting" : "host");
  const sessionRef = useRef(session);
  const syncRef = useRef({ difficulty, progress });
  const handlersRef = useRef({});
  const clientRef = useRef(null);
  const evaluatingRef = useRef(false);
  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { syncRef.current = { difficulty, progress }; }, [difficulty, progress]);
  useEffect(() => () => clientRef.current?.terminate(), []);

  const dispatch = useCallback((action) => setSession((current) => {
    const next = current ? campaignReducer(current, action) : current;
    sessionRef.current = next;
    return next;
  }), []);

  const startLevel = useCallback(async (levelId, selectedDifficulty = difficulty) => {
    clientRef.current?.terminate();
    clientRef.current = new SandboxClient();
    const level = getLevel(levelId);
    const fresh = hydrateDraft(level, createLevelSession(level, selectedDifficulty));
    sessionRef.current = fresh;
    setSession(fresh);
    try {
      const compiled = await clientRef.current.compile(fresh.baselineFiles, level.entryFile);
      dispatch({ type: "LIVE_READY", bundleId: compiled.bundleId, durationMs: compiled.durationMs });
    } catch (error) {
      dispatch({ type: "RUNTIME_ERROR", error: error.message });
    }
  }, [difficulty, dispatch]);

  const evaluateTrigger = useCallback(async (incident, state) => {
    if (!state.liveBundleId) return;
    try {
      const level = getLevel(state.levelId);
      const execution = await clientRef.current.run(state.liveBundleId, [{ functionName: incident.functionName, args: incident.liveArgs }]);
      const result = execution.values[0];
      if (looksLikeWorldCommands(result)) validateWorldCommands(result, level.capabilities);
      if (deepEqual(result, incident.successValue)) {
        dispatch({ type: "INCIDENT_VERIFIED", incident });
        if (state.activeIncidentIndex === state.incidents.length - 1) {
          const completed = [...new Set([...progress.completed, state.levelId])];
          const nextProgress = { completed };
          setProgress(nextProgress);
          localStorage.setItem(PROGRESS_KEY, JSON.stringify(nextProgress));
        }
      } else if (state.incidents[state.activeIncidentIndex].status === "active") {
        dispatch({
          type: "INCIDENT_DETECTED", incident, checkpoint: incident.checkpoint,
          evidence: { tick: state.tick, position: incident.trigger, functionName: incident.functionName, arguments: incident.liveArgs, expected: incident.successValue, observed: result, inventory: state.inventory, scanner: state.scannerActive ? "ONLINE" : "NOT USED", source: { file: incident.file, line: incident.line } },
        });
      }
    } catch (error) { dispatch({ type: "RUNTIME_ERROR", error: error.message }); }
  }, [dispatch, progress.completed]);

  const move = useCallback(async (direction) => {
    if (detachedRole) { channelRef.current?.postMessage({ type: "ACTION", action: "MOVE", payload: direction }); return; }
    if (evaluatingRef.current) return;
    const state = sessionRef.current;
    if (!state || state.phase === LEVEL_PHASES.LOADING || state.phase === LEVEL_PHASES.INCIDENT_DETECTED || state.phase === LEVEL_PHASES.LEVEL_COMPLETE) return;
    const level = getLevel(state.levelId);
    const target = nextPoint(state.player, direction);
    if (!canWalk(level, target)) return;
    dispatch({ type: "MOVE", direction, point: target });
    if (tileAt(level, target) === "K") dispatch({ type: "COLLECT_ITEM", itemId: `${level.id}-key`, label: "ACCESS TOKEN" });
    const incident = level.incidents[state.activeIncidentIndex];
    const incidentState = state.incidents[state.activeIncidentIndex];
    if (incident?.mode === "enter" && samePoint(target, incident.trigger) && ["active", "patched"].includes(incidentState.status)) {
      evaluatingRef.current = true;
      try {
        await evaluateTrigger(incident, { ...state, player: target, tick: state.tick + 1 });
      } finally {
        evaluatingRef.current = false;
      }
    }
  }, [detachedRole, dispatch, evaluateTrigger]);

  const interact = useCallback(async () => {
    if (detachedRole) { channelRef.current?.postMessage({ type: "ACTION", action: "INTERACT" }); return; }
    if (evaluatingRef.current) return;
    const state = sessionRef.current;
    if (!state) return;
    const level = getLevel(state.levelId);
    if (isNear(state.player, level.scanner) && !state.scannerActive) { dispatch({ type: "SCANNER_ON" }); return; }
    const incident = level.incidents[state.activeIncidentIndex];
    const incidentState = state.incidents[state.activeIncidentIndex];
    if (incident?.mode === "interact" && isNear(state.player, incident.trigger) && ["active", "patched"].includes(incidentState.status)) {
      evaluatingRef.current = true;
      try {
        await evaluateTrigger(incident, state);
      } finally {
        evaluatingRef.current = false;
      }
    }
  }, [detachedRole, dispatch, evaluateTrigger]);

  const editFile = useCallback((path, content) => {
    if (detachedRole) { channelRef.current?.postMessage({ type: "ACTION", action: "EDIT_FILE", payload: { path, content } }); return; }
    dispatch({ type: "EDIT_FILE", path, content });
    const state = sessionRef.current;
    if (state) localStorage.setItem(`patchplay.v3.draft.${state.levelId}`, JSON.stringify({ ...state.files, [path]: content }));
  }, [detachedRole, dispatch]);

  const runTests = useCallback(async () => {
    if (detachedRole) { channelRef.current?.postMessage({ type: "ACTION", action: "RUN_TESTS" }); return; }
    const state = sessionRef.current;
    if (!state || state.phase === LEVEL_PHASES.LOADING) return;
    const level = getLevel(state.levelId);
    dispatch({ type: "TEST_START" });
    try {
      const compiled = await clientRef.current.compile(state.files, level.entryFile);
      const includedIncidents = level.incidents.slice(0, state.activeIncidentIndex + 1);
      const testPlan = includedIncidents.flatMap((incident) => incident.tests.map((test) => ({ incidentId: incident.id, functionName: incident.functionName, ...test })));
      const execution = await clientRef.current.run(compiled.bundleId, testPlan.map((test) => ({ functionName: test.functionName, args: test.args })));
      const results = testPlan.map((test, index) => ({ ...test, observed: execution.values[index], passed: deepEqual(execution.values[index], test.expected) }));
      dispatch({ type: "TEST_COMPLETE", bundleId: compiled.bundleId, durationMs: compiled.durationMs, results, logs: execution.logs });
    } catch (error) { dispatch({ type: "RUNTIME_ERROR", error: error.message }); }
  }, [detachedRole, dispatch]);

  const deploy = useCallback(() => detachedRole ? channelRef.current?.postMessage({ type: "ACTION", action: "DEPLOY" }) : dispatch({ type: "DEPLOY" }), [detachedRole, dispatch]);
  const report = useCallback(() => detachedRole ? channelRef.current?.postMessage({ type: "ACTION", action: "REPORT" }) : dispatch({ type: "REPORT_INCIDENT" }), [detachedRole, dispatch]);
  const rollback = useCallback(() => detachedRole ? channelRef.current?.postMessage({ type: "ACTION", action: "ROLLBACK" }) : dispatch({ type: "ROLLBACK" }), [detachedRole, dispatch]);
  const resetRoom = useCallback(() => detachedRole ? channelRef.current?.postMessage({ type: "ACTION", action: "RESET_ROOM" }) : dispatch({ type: "RESET_ROOM" }), [detachedRole, dispatch]);
  const resetLevel = useCallback(() => {
    const state = sessionRef.current;
    if (state) startLevel(state.levelId, state.difficulty);
  }, [startLevel]);
  const resetCampaign = useCallback(() => {
    const nextProgress = { completed: [] };
    setProgress(nextProgress);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(nextProgress));
    for (const level of LEVELS) localStorage.removeItem(`patchplay.v3.draft.${level.id}`);
  }, []);
  const selectFile = useCallback((path) => detachedRole ? channelRef.current?.postMessage({ type: "ACTION", action: "SELECT_FILE", payload: path }) : dispatch({ type: "SELECT_FILE", path }), [detachedRole, dispatch]);
  const restoreFile = useCallback((path) => detachedRole ? channelRef.current?.postMessage({ type: "ACTION", action: "RESTORE_FILE", payload: path }) : dispatch({ type: "RESTORE_FILE", path }), [detachedRole, dispatch]);
  const setScannerHeld = useCallback((value) => detachedRole ? channelRef.current?.postMessage({ type: "ACTION", action: "SCANNER_HELD", payload: value }) : dispatch({ type: "SET_SCANNER_HELD", value }), [detachedRole, dispatch]);
  const exitLevel = useCallback(() => { clientRef.current?.terminate(); clientRef.current = null; setSession(null); }, []);

  handlersRef.current = { move, interact, report, editFile, runTests, deploy, rollback, resetRoom, selectFile, restoreFile, setScannerHeld };

  useEffect(() => {
    if (!window.BroadcastChannel) return undefined;
    const channel = new BroadcastChannel(`patch-play:${sessionIdRef.current}`);
    channelRef.current = channel;
    let lastPulse = Date.now();
    channel.onmessage = ({ data }) => {
      if (!data || typeof data !== "object") return;
      if (detachedRole) {
        if (data.type === "SNAPSHOT") {
          lastPulse = Date.now(); setConnection("connected"); setSession(data.session); setDifficulty(data.difficulty); setProgress(data.progress);
        } else if (data.type === "PULSE") { lastPulse = Date.now(); setConnection("connected"); }
        else if (data.type === "HOST_CLOSED") setConnection("disconnected");
        return;
      }
      if (data.type === "HELLO") channel.postMessage({ type: "SNAPSHOT", session: sessionRef.current, ...syncRef.current });
      if (data.type !== "ACTION") return;
      const payload = data.payload;
      const current = handlersRef.current;
      const handlers = {
        MOVE: () => current.move(payload), INTERACT: current.interact, REPORT: current.report, EDIT_FILE: () => current.editFile(payload.path, payload.content),
        RUN_TESTS: current.runTests, DEPLOY: current.deploy, ROLLBACK: current.rollback, RESET_ROOM: current.resetRoom, SELECT_FILE: () => current.selectFile(payload),
        RESTORE_FILE: () => current.restoreFile(payload), SCANNER_HELD: () => current.setScannerHeld(payload),
      };
      handlers[data.action]?.();
    };
    if (detachedRole) channel.postMessage({ type: "HELLO", role: detachedRole });
    const timer = window.setInterval(() => {
      if (detachedRole) {
        if (Date.now() - lastPulse > 4500) setConnection("disconnected");
      } else channel.postMessage({ type: "PULSE" });
    }, 1500);
    const closing = () => { if (!detachedRole) channel.postMessage({ type: "HOST_CLOSED" }); };
    window.addEventListener("beforeunload", closing);
    return () => { window.clearInterval(timer); window.removeEventListener("beforeunload", closing); channel.close(); if (channelRef.current === channel) channelRef.current = null; };
  }, [detachedRole]);

  useEffect(() => {
    if (!detachedRole && session && channelRef.current) channelRef.current.postMessage({ type: "SNAPSHOT", session, difficulty, progress });
  }, [detachedRole, session, difficulty, progress]);

  const openRole = useCallback((role) => {
    const url = new URL(window.location.href);
    url.search = `?session=${encodeURIComponent(sessionIdRef.current)}&role=${role}`;
    window.open(url, `patchplay-${role}-${sessionIdRef.current}`, "noopener");
  }, []);

  return { session, level: session ? getLevel(session.levelId) : null, difficulty, setDifficulty, progress, startLevel, exitLevel, move, interact, report, editFile, runTests, deploy, rollback, resetRoom, resetLevel, resetCampaign, selectFile, restoreFile, setScannerHeld, detachedRole, connection, sessionId: sessionIdRef.current, openRole };
}
