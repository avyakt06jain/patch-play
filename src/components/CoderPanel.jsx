import { canApplyPatch, parseExpression } from "../game";

function IncidentPanel({ state }) {
  if (!state.reportSent) {
    return (
      <div className={`incident-placeholder ${state.incident ? "failure-detected" : ""}`}>
        <span aria-hidden="true">{state.incident ? "!" : "‹/›"}</span>
        <div>
          <strong>{state.incident ? "UNREPORTED FAILURE DETECTED" : "AWAITING PLAYER INCIDENT"}</strong>
          <p>{state.incident ? "A player action caused an unexpected outcome." : "Explore the world. When something breaks, the incident will appear here."}</p>
        </div>
      </div>
    );
  }

  const incident = state.incident;
  return (
    <div className="incident-card">
      <div className="incident-title"><span>!</span><strong>{incident.id} · {incident.bridge} COLLAPSE</strong><em>JUST NOW</em></div>
      <p>Observed: bridge failed on tile {incident.tile} of {incident.totalTiles}</p>
      <dl>
        <div><dt>stepsOnBridge:</dt><dd>{incident.stepsOnBridge}</dd></div>
        <div><dt>maxSafeSteps:</dt><dd>{incident.maxSafeSteps}</dd></div>
        <div><dt>expected:</dt><dd>{incident.expected}</dd></div>
        <div><dt>observed:</dt><dd className="danger-text">{incident.observed}</dd></div>
        <div><dt>suspected:</dt><dd className="danger-text">{incident.source}:{String(incident.line).padStart(2, "0")}</dd></div>
      </dl>
    </div>
  );
}

function CodeEditor({ state, dispatch }) {
  return (
    <div className="editor-shell">
      <div className="editor-tab"><span className="file-dot" /> bridge.rules.js <i>×</i></div>
      <div className="code-editor" aria-label="Bridge rule source editor">
        <div className="code-line"><span>1</span><code><b>const</b> maxSafeSteps = <strong>3</strong>;</code></div>
        <div className="code-line"><span>2</span><code>&nbsp;</code></div>
        <div className="code-line"><span>3</span><code><b>function</b> shouldCollapse(stepsOnBridge) {'{'}</code></div>
        <div className="code-line"><span>4</span><code className="comment">// Collapse only after the safe limit.</code></div>
        <div className={`code-line editable-line ${state.reportSent ? "suspect-line" : ""}`}>
          <span>5</span>
          <label>
            <i>return</i>
            <input
              aria-label="Bridge comparison expression"
              title="Edit the comparison expression. You can enter > or the complete expression."
              value={state.draftExpression}
              disabled={!state.reportSent || state.patchApplied}
              spellCheck="false"
              onChange={(event) => dispatch({ type: "EDIT_DRAFT", value: event.target.value })}
            />
            <i>;</i>
          </label>
        </div>
        <div className="code-line"><span>6</span><code>{'}'}</code></div>
      </div>
    </div>
  );
}

function TestPanel({ state }) {
  const parsed = parseExpression(state.draftExpression);
  const passing = state.testResults?.every((test) => test.passed);
  return (
    <div className="test-panel">
      <div className="test-heading">
        <strong>BRIDGE RULE CHECKS</strong>
        <span className={passing ? "pass-text" : ""}>{state.testResults ? `${state.testResults.filter((test) => test.passed).length}/4 PASSED` : "NOT RUN"}</span>
      </div>
      {state.testError && <div className="parser-error">! {state.testError}</div>}
      {!state.testResults ? (
        <div className="test-empty">
          {[1, 2, 3, 4].map((step) => <span key={step}><i>{step}</i> —</span>)}
        </div>
      ) : (
        <div className="test-rows">
          <div className="test-row test-labels"><span>STEP</span><span>EXPECTED</span><span>OBSERVED</span><span>RESULT</span></div>
          {state.testResults.map((test) => (
            <div className={`test-row ${test.passed ? "test-pass" : "test-fail"}`} key={test.step}>
              <span>{test.step}</span><span>{test.expected}</span><span>{test.observed}</span><strong>{test.passed ? "✓ PASS" : "× FAIL"}</strong>
            </div>
          ))}
        </div>
      )}
      {state.reportSent && !parsed.valid && !state.testError && <small className="editor-help">Edit the comparison expression, then test the candidate.</small>}
      {state.reportSent && parsed.valid && !state.testResults && !state.patchApplied && (
        <small className="editor-help">Accepted input: <code>&gt;</code> or <code>stepsOnBridge &gt; maxSafeSteps</code></small>
      )}
    </div>
  );
}

export default function CoderPanel({ state, dispatch }) {
  const applyEnabled = canApplyPatch(state);
  const testsPassing = state.testResults?.every((test) => test.passed);

  return (
    <section className="role-panel coder-panel" aria-labelledby="coder-title">
      <div className="role-header coder-header">
        <div>
          <span className="role-icon coder-icon" aria-hidden="true">⬡</span>
          <h2 id="coder-title">DEV_02 <em>/</em> DEBUG CONSOLE</h2>
          <span className="live-pill coder-live">RULESET LIVE</span>
        </div>
      </div>

      {state.won && (
        <div className="level-complete-banner"><span>✓</span><div><strong>LEVEL COMPLETE</strong><p>Escape verified. Both players win.</p></div></div>
      )}

      <IncidentPanel state={state} />

      {state.reportSent && !state.patchApplied && (
        <div className="hint-card">
          <span aria-hidden="true">◉</span>
          <div><strong>BOUNDARY HINT</strong><p>The bridge should support three steps. Inspect what happens at the exact boundary.</p>{state.scannerActive && <small>SCAN: At the safe limit, collapse currently evaluates true.</small>}</div>
        </div>
      )}

      <CodeEditor state={state} dispatch={dispatch} />

      {state.patchApplied && (
        <div className="deployed-card">
          <span>✓</span><div><strong>PATCH DEPLOYED</strong><p>World rules updated. Awaiting player verification.</p></div>
        </div>
      )}

      <TestPanel state={state} />

      <div className="event-log">
        <h3>RECENT EVENTS</h3>
        <div>
          {state.logs.map((entry) => (
            <p className={`log-${entry.tone}`} key={entry.id}><span>&gt;</span> [{String(entry.id).padStart(2, "0")}] {entry.text}</p>
          ))}
        </div>
      </div>

      <div className="coder-actions">
        <button
          className="test-button"
          type="button"
          disabled={!state.reportSent || state.patchApplied}
          onClick={() => dispatch({ type: "TEST_PATCH" })}
        >
          <span aria-hidden="true">▷</span> TEST PATCH
        </button>
        <button
          className="apply-button"
          type="button"
          disabled={!applyEnabled}
          onClick={() => dispatch({ type: "APPLY_PATCH" })}
        >
          <span aria-hidden="true">⇧</span> APPLY PATCH
        </button>
      </div>
      <p className="action-help">
        {state.patchApplied
          ? "Patch live. PLAYER_01 must verify the crossing."
          : testsPassing
            ? "4/4 checks passed. Apply to update the live world."
            : "Tests validate the candidate without changing the live bridge."}
      </p>
    </section>
  );
}
