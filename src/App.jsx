import { useReducer, useState } from "react";
import { PHASES, PROGRESS_STAGES, createInitialState, getPhaseProgress, getVerificationDuration, reducer } from "./game";
import GamePanel from "./components/GamePanel";
import CoderPanel from "./components/CoderPanel";

function ProgressRail({ phase }) {
  const progress = getPhaseProgress(phase);
  return <ol className="progress-rail" aria-label="Session progress">{PROGRESS_STAGES.map((stage, index) => (
    <li key={stage} className={`${index < progress ? "complete" : ""} ${index === progress ? "current" : ""}`}>
      <i>{index < progress ? "✓" : index + 1}</i><span>{stage}</span>
    </li>
  ))}</ol>;
}

function UnderTheHood({ state, onClose }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <aside className="hood-drawer" role="dialog" aria-modal="true" aria-labelledby="hood-title" onMouseDown={(event) => event.stopPropagation()}>
      <button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button>
      <span className="eyebrow">JUDGE VIEW · SYSTEM PROOF</span>
      <h2 id="hood-title">Under the hood</h2>
      <p className="hood-intro">This is a controlled deployment pipeline, not a scripted animation.</p>
      <div className="hood-grid">
        <article><b>01</b><strong>ONE SHARED RULE</strong><p>Gameplay, replay, and checks call <code>shouldCollapse(step, operator)</code>.</p></article>
        <article><b>02</b><strong>RUNTIME EVIDENCE</strong><p>The incident is assembled from {state.incident?.reproduction.length ?? 0} captured player and world events.</p></article>
        <article><b>03</b><strong>SAFE CANDIDATE</strong><p>Only two comparison operators are accepted. No <code>eval</code> or arbitrary execution.</p></article>
        <article><b>04</b><strong>DEPLOYMENT GATE</strong><p>The exact candidate must pass 4/4 checks before it changes the live world.</p></article>
      </div>
      <div className="hood-state"><span>SESSION PHASE</span><strong>{state.phase.replaceAll("_", " ")}</strong><span>LIVE RULE</span><code>stepsOnBridge {state.rule.liveOperator} maxSafeSteps</code></div>
    </aside>
  </div>;
}

function VictorySummary({ state, onReset }) {
  const moves = state.events.filter((entry) => entry.type === "MOVE").length;
  const duration = getVerificationDuration(state);
  return <div className="victory-backdrop"><section className="victory-summary" role="dialog" aria-modal="true" aria-labelledby="victory-title">
    <span className="victory-seal">✓</span><span className="eyebrow">PATCH VERIFIED · SESSION COMPLETE</span>
    <h2 id="victory-title">The world changed because<br />both roles did their part.</h2>
    <div className="contribution-grid">
      <article><span>PLAYER_01</span><strong>Discovered + verified</strong><p>Collected the key, produced real evidence, and crossed the repaired bridge.</p></article>
      <article><span>DEV_02</span><strong>Diagnosed + deployed</strong><p>Corrected the boundary rule and gated deployment behind four checks.</p></article>
    </div>
    <div className="session-metrics"><div><strong>{moves}</strong><span>PLAYER MOVES</span></div><div><strong>{state.events.length}</strong><span>CAPTURED EVENTS</span></div><div><strong>{duration ?? 0}</strong><span>EVENTS TO VERIFY</span></div><div><strong>4/4</strong><span>REGRESSION CHECKS</span></div></div>
    <button type="button" className="reset-button victory-reset" onClick={onReset}>↻ RESET DEMO</button>
  </section></div>;
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [focus, setFocus] = useState("balanced");
  const [showHood, setShowHood] = useState(false);
  const reset = () => dispatch({ type: "RESET" });
  return <main className="app-shell">
    <header className="global-header">
      <div className="brand-lockup"><span className="brand-mark">//</span><div><h1>PATCH<span>//</span>PLAY</h1><p>CO-OP DEBUGGING EXPERIENCE</p></div></div>
      <div className="level-lockup"><strong>LEVEL_01&nbsp; / &nbsp;THE BROKEN CROSSING</strong><span>Player evidence becomes a tested world patch.</span></div>
      <div className="session-actions"><button className="hood-button" type="button" onClick={() => setShowHood(true)}>UNDER THE HOOD</button><button className="reset-button" type="button" onClick={reset}>↻ RESET DEMO</button></div>
    </header>
    <div className="sub-header"><ProgressRail phase={state.phase} /><div className="focus-control" aria-label="Role focus"><span>ROLE FOCUS</span>{[["world", "PLAYER"], ["balanced", "SPLIT"], ["code", "CODER"]].map(([value, label]) => <button type="button" className={focus === value ? "active" : ""} onClick={() => setFocus(value)} key={value}>{label}</button>)}</div></div>
    <section className={`workspace focus-${focus}`} aria-label="PATCH PLAY cooperative workspace"><GamePanel state={state} dispatch={dispatch} /><CoderPanel state={state} dispatch={dispatch} /></section>
    <p className="sr-status" aria-live="polite">{state.notice}</p>
    {showHood && <UnderTheHood state={state} onClose={() => setShowHood(false)} />}
    {state.phase === PHASES.VERIFIED && <VictorySummary state={state} onReset={reset} />}
  </main>;
}
