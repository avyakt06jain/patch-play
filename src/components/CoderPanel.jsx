import { useEffect } from "react";
import { PHASES, canApplyPatch, parseExpression } from "../game";

function IncidentPanel({ state }) {
  if (!state.incident || state.phase === PHASES.FAILURE_DETECTED) return <div className={`incident-placeholder ${state.incident ? "failure-detected" : ""}`}><span>{state.incident ? "!" : "‹/›"}</span><div><strong>{state.incident ? "FAILURE DETECTED · AWAITING REPORT" : "AWAITING PLAYER INCIDENT"}</strong><p>{state.incident ? "The world captured a fault. PLAYER_01 must submit their observation." : "Live gameplay evidence will appear here when the world behaves unexpectedly."}</p></div></div>;
  const { incident } = state;
  return <div className="incident-card"><div className="incident-title"><span>!</span><strong>{incident.id} · BOUNDARY FAILURE</strong><em>CAPTURED</em></div><p>{incident.observation}</p><dl><div><dt>expected:</dt><dd>{incident.snapshot.expected}</dd></div><div><dt>observed:</dt><dd className="danger-text">{incident.snapshot.observed}</dd></div><div><dt>suspected:</dt><dd className="danger-text">{incident.source.file}:{String(incident.source.line).padStart(2, "0")}</dd></div><div><dt>evidence:</dt><dd>{incident.scannerAttached ? "runtime + scanner" : "runtime trace"}</dd></div></dl></div>;
}

function EvidenceWorkspace({ state, dispatch }) {
  if (!state.incident || state.phase === PHASES.FAILURE_DETECTED) return null;
  const trace = state.incident.reproduction;
  const replayEvent = state.replay.active ? trace[state.replay.index] : null;
  const replaySteps = replayEvent?.payload?.stepsOnBridge ?? "—";
  return <div className="evidence-workspace">
    <section className="trace-panel"><div className="section-heading"><strong>REPRODUCTION TRACE</strong><button className="replay-button" type="button" onClick={() => dispatch({ type: state.replay.active ? "STOP_REPLAY" : "START_REPLAY" })}>{state.replay.active ? "■ STOP" : "▷ REPLAY"}</button></div><div className="trace-list">{trace.slice(-7).map((entry, index) => <p className={state.replay.active && Math.max(0, trace.length - 7) + index === state.replay.index ? "active" : ""} key={entry.sequence}><span>{String(entry.sequence).padStart(2, "0")}</span><code>{entry.type === "MOVE" ? entry.message.split(" →")[0] : entry.message}</code></p>)}</div><small>Replay is read-only. The live player never moves.</small></section>
    <section className="variable-panel"><div className="section-heading"><strong>VARIABLE INSPECTOR</strong><span>{state.replay.active ? `FRAME ${state.replay.index + 1}/${trace.length}` : "FAILURE SNAPSHOT"}</span></div><dl><div><dt>stepsOnBridge</dt><dd>{state.replay.active ? replaySteps : state.incident.snapshot.stepsOnBridge}</dd></div><div><dt>maxSafeSteps</dt><dd>{state.incident.snapshot.maxSafeSteps}</dd></div><div><dt>comparison</dt><dd className="danger-text">{state.incident.snapshot.liveOperator}</dd></div><div><dt>result</dt><dd className="danger-text">{replayEvent?.type === "COLLAPSE" || !state.replay.active ? "collapse" : "stable"}</dd></div></dl></section>
  </div>;
}

function CodeEditor({ state, dispatch }) {
  const editable = [PHASES.INCIDENT_REPORTED, PHASES.CANDIDATE_EDITING, PHASES.CANDIDATE_TESTED].includes(state.phase);
  const parsed = parseExpression(state.rule.draftExpression);
  return <><div className="revision-rail"><span className={state.rule.deployedRevision === 0 ? "live" : ""}>LIVE v{state.rule.deployedRevision}</span><i>→</i><span className={editable ? "candidate" : ""}>CANDIDATE v{state.rule.candidateRevision}</span><i>→</i><span className={state.phase === PHASES.PATCH_DEPLOYED ? "deployed" : ""}>DEPLOYED v{state.rule.deployedRevision || "—"}</span></div>
    <div className="editor-shell"><div className="editor-tab"><span className="file-dot" /> bridge.rules.js <i>×</i></div><div className="code-editor" aria-label="Bridge rule source editor">
      <div className="code-line"><span>1</span><code><b>const</b> maxSafeSteps = <strong>3</strong>;</code></div><div className="code-line"><span>2</span><code>&nbsp;</code></div><div className="code-line"><span>3</span><code><b>function</b> shouldCollapse(stepsOnBridge) {'{'}</code></div><div className="code-line"><span>4</span><code className="comment">// Collapse only after the safe limit.</code></div>
      <div className={`code-line editable-line ${state.incident && state.phase !== PHASES.FAILURE_DETECTED ? "suspect-line" : ""}`}><span>5</span><label><i>return</i><input aria-label="Bridge comparison expression" value={state.rule.draftExpression} disabled={!editable} spellCheck="false" onChange={(event) => dispatch({ type: "EDIT_DRAFT", value: event.target.value })} /><i>;</i></label></div><div className="code-line"><span>6</span><code>{'}'}</code></div>
    </div></div>
    {state.incident && state.phase !== PHASES.FAILURE_DETECTED && <div className="rule-diff"><div><span>LIVE</span><code>stepsOnBridge <b>{state.rule.liveOperator}</b> maxSafeSteps</code></div><div><span>CANDIDATE</span><code className={parsed.valid ? "candidate-code" : "danger-text"}>{parsed.valid ? parsed.normalized : "INVALID EXPRESSION"}</code></div></div>}
  </>;
}

function TestPanel({ state }) {
  const results = state.rule.testResults;
  const passing = results?.every((test) => test.passed);
  return <div className="test-panel"><div className="test-heading"><strong>BOUNDARY REGRESSION SUITE</strong><span className={passing ? "pass-text" : ""}>{results ? `${results.filter((test) => test.passed).length}/4 PASSED` : "NOT RUN"}</span></div>
    {state.rule.testError && <div className="parser-error">! {state.rule.testError}</div>}
    {!results ? <div className="test-empty">{["Entry", "Midpoint", "Boundary", "Overflow"].map((name, index) => <span key={name}><i>{index + 1}</i> {name} —</span>)}</div> : <div className="test-rows">{results.map((test) => <div className={`named-test ${test.passed ? "test-pass" : "test-fail"}`} key={test.id}><span>{test.passed ? "✓" : "×"}</span><div><strong>{test.name}</strong><small>Step {test.step}: expected {test.expected}, observed {test.observed}</small>{!test.passed && <em>{test.reason}</em>}</div></div>)}</div>}
  </div>;
}

export default function CoderPanel({ state, dispatch }) {
  useEffect(() => {
    if (!state.replay.active) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE_REPLAY" }), 650);
    return () => window.clearTimeout(timer);
  }, [state.replay.active, state.replay.index, dispatch]);
  const testsPassing = state.rule.testResults?.every((test) => test.passed);
  const patchLive = state.phase === PHASES.PATCH_DEPLOYED;
  return <section className="role-panel coder-panel" aria-labelledby="coder-title">
    <div className="role-header coder-header"><div><span className="role-icon coder-icon">⬡</span><h2 id="coder-title">DEV_02 <em>/</em> DEBUG WORKSPACE</h2><span className="live-pill coder-live">RULESET LIVE</span></div></div>
    <div className="coder-scroll">
      <IncidentPanel state={state} />
      <EvidenceWorkspace state={state} dispatch={dispatch} />
      {state.incident && ![PHASES.FAILURE_DETECTED, PHASES.PATCH_DEPLOYED, PHASES.VERIFIED].includes(state.phase) && <div className="hint-card"><span>◉</span><div><strong>BOUNDARY HINT · LINE 05</strong><p>The third tile is permitted by the contract. Compare the exact-limit behavior with the step after it.</p>{state.incident.scannerAttached && <small>SCAN ATTACHMENT: at equality, the live rule returns collapse.</small>}</div></div>}
      <CodeEditor state={state} dispatch={dispatch} />
      {patchLive && <div className="deployed-card"><span>✓</span><div><strong>AWAITING PLAYER VERIFICATION</strong><p>Candidate v{state.rule.deployedRevision} is live. Automated checks cannot finish the mission.</p></div></div>}
      <TestPanel state={state} />
      <div className="event-log"><h3>DETERMINISTIC EVENT STREAM</h3><div>{state.events.slice(-6).map((entry) => <p className={`log-${entry.tone}`} key={entry.sequence}><span>&gt;</span> [{String(entry.sequence).padStart(2, "0")}] {entry.actor} · {entry.message}</p>)}</div></div>
    </div>
    <div className="coder-actions"><button className="test-button" type="button" disabled={![PHASES.INCIDENT_REPORTED, PHASES.CANDIDATE_EDITING, PHASES.CANDIDATE_TESTED].includes(state.phase)} onClick={() => dispatch({ type: "TEST_PATCH" })}>▷ TEST CANDIDATE</button><button className="apply-button" type="button" disabled={!canApplyPatch(state)} onClick={() => dispatch({ type: "APPLY_PATCH" })}>⇧ DEPLOY PATCH</button>{patchLive && <button className="rollback-button" type="button" onClick={() => dispatch({ type: "ROLLBACK_PATCH" })}>↶ ROLLBACK</button>}</div>
    <p className="action-help">{state.phase === PHASES.VERIFIED ? "Live v1 · deployment verified by PLAYER_01." : patchLive ? "Live v1 · rollback remains available until player victory." : testsPassing ? "4/4 passed · candidate is eligible for deployment." : "Testing is isolated from the live world."}</p>
  </section>;
}
