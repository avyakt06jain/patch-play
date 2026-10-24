import { lazy, Suspense, useMemo, useState } from "react";
import GamePanel from "./components/GamePanel";
import { LEVELS } from "./levels/cartridges";
import { useCampaignRuntime } from "./features/useCampaignRuntime";

const CoderPanel = lazy(() => import("./components/CoderPanel"));

function CampaignMenu({ runtime }) {
  const [selected, setSelected] = useState(LEVELS[0].id);
  const selectedLevel = LEVELS.find((level) => level.id === selected);
  return <main className="campaign-screen">
    <header className="campaign-brand"><div className="brand-mark">//</div><div><h1>PATCH<span>//</span>PLAY</h1><p>THE FACILITY SHIPPED BROKEN. FIX IT FROM THE INSIDE.</p></div><aside><span>CAMPAIGN RUNTIME</span><strong>8 LIVE DEFECTS · 4 WINGS</strong></aside></header>
    <section className="campaign-hero"><div><span className="eyebrow">CO-OP DEBUGGING CAMPAIGN</span><h2>Play the consequences.<br /><em>Change the cause.</em></h2><p>PLAYER_01 explores a code-driven simulation. DEV_02 edits the real modules controlling it. Tests build confidence; only the player can prove the world is fixed.</p></div><div className="pipeline-visual">{["PLAY", "CAPTURE", "TRACE", "PATCH", "VERIFY"].map((step, index) => <span key={step}><i>{String(index + 1).padStart(2, "0")}</i>{step}</span>)}</div></section>
    <section className="campaign-grid">{LEVELS.map((level) => <button type="button" className={`level-card wing-${level.wing} ${selected === level.id ? "selected" : ""}`} onClick={() => setSelected(level.id)} key={level.id}><span className="level-number">{level.number}</span><div><small>{level.wing.toUpperCase()} WING</small><strong>{level.title}</strong><p>{level.summary}</p><ul>{level.mechanics.map((item) => <li key={item}>{item}</li>)}</ul></div><em>{runtime.progress.completed.includes(level.id) ? "✓ STABILIZED" : "2 INCIDENTS"}</em></button>)}</section>
    <footer className="campaign-launch"><div><span>DIAGNOSTIC MODE</span><div className="difficulty-toggle"><button className={runtime.difficulty === "guided" ? "active" : ""} type="button" onClick={() => runtime.setDifficulty("guided")}>GUIDED <small>source locations + watches</small></button><button className={runtime.difficulty === "challenge" ? "active" : ""} type="button" onClick={() => runtime.setDifficulty("challenge")}>CHALLENGE <small>trace only</small></button></div></div><div className="campaign-launch-actions"><button className="campaign-reset" type="button" onClick={runtime.resetCampaign}>RESET CAMPAIGN</button><button className="launch-button" type="button" onClick={() => runtime.startLevel(selectedLevel.id)}>ENTER LEVEL_{selectedLevel.number} <span>→</span></button></div></footer>
  </main>;
}

function Progress({ session, level }) {
  return <div className="campaign-progress"><span className="complete">✓ LOAD CARTRIDGE</span>{level.incidents.map((incident, index) => <span className={session.incidents[index].status === "verified" ? "complete" : index === session.activeIncidentIndex ? "active" : ""} key={incident.id}>{session.incidents[index].status === "verified" ? "✓" : index + 1} {incident.id}</span>)}<span className={session.completed ? "complete" : ""}>3 WING VERIFIED</span></div>;
}

function UnderHood({ level, session, onClose }) {
  const incident = level.incidents[session.activeIncidentIndex];
  return <div className="v3-modal" onMouseDown={onClose}><aside onMouseDown={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={onClose}>×</button><span className="eyebrow">JUDGE VIEW · LIVE DATA PATH</span><h2>Under the hood</h2><div className="hood-pipeline">{["PLAYER INTENT", "WORLD EVENT", "QUICKJS SYSTEM", "VALIDATED RESULT", "WORLD REDUCER"].map((step, index) => <div key={step}><i>{index + 1}</i><strong>{step}</strong>{index < 4 && <span>↓</span>}</div>)}</div><dl><div><dt>CARTRIDGE</dt><dd>{level.id}</dd></div><div><dt>ACTIVE EXPORT</dt><dd>{incident.functionName}()</dd></div><div><dt>LIVE BUNDLE</dt><dd>v{session.liveRevision}</dd></div><div><dt>CANDIDATE</dt><dd>v{session.candidateRevision}</dd></div><div><dt>ISOLATION</dt><dd>QUICKJS · 32 MB · 50 ms/hook</dd></div><div><dt>CAPTURED EVENTS</dt><dd>{session.events.length}</dd></div></dl><p>Virtual TypeScript files are bundled by esbuild-wasm. The resulting code runs outside the page in a Worker-hosted QuickJS runtime. Gameplay and regression tests invoke the same exported functions.</p></aside></div>;
}

export default function App() {
  const runtime = useCampaignRuntime();
  const [focus, setFocus] = useState("split");
  const [hood, setHood] = useState(false);
  const actions = useMemo(() => ({ move: runtime.move, interact: runtime.interact, report: runtime.report, editFile: runtime.editFile, runTests: runtime.runTests, deploy: runtime.deploy, rollback: runtime.rollback, resetRoom: runtime.resetRoom, resetLevel: runtime.resetLevel, selectFile: runtime.selectFile, restoreFile: runtime.restoreFile, setScannerHeld: runtime.setScannerHeld, exitLevel: runtime.exitLevel }), [runtime.move, runtime.interact, runtime.report, runtime.editFile, runtime.runTests, runtime.deploy, runtime.rollback, runtime.resetRoom, runtime.resetLevel, runtime.selectFile, runtime.restoreFile, runtime.setScannerHeld, runtime.exitLevel]);
  if (!runtime.session && runtime.detachedRole) return <main className="detached-wait"><span className="brand-mark">//</span><h1>{runtime.connection === "disconnected" ? "HOST DISCONNECTED" : "CONNECTING TO SESSION"}</h1><p>{runtime.connection === "disconnected" ? "Keep the PATCH//PLAY host window open, then reload this role view." : `Requesting the authoritative ${runtime.detachedRole.toUpperCase()} snapshot…`}</p></main>;
  if (!runtime.session) return <CampaignMenu runtime={runtime} />;
  const { session, level } = runtime;
  return <main className={`v3-app ${runtime.detachedRole ? `detached-role detached-${runtime.detachedRole}` : ""}`}>
    <header className="v3-global-header"><div className="brand-lockup"><span className="brand-mark">//</span><div><h1>PATCH<span>//</span>PLAY</h1><p>{runtime.detachedRole ? `${runtime.detachedRole.toUpperCase()} WINDOW · ${runtime.connection.toUpperCase()}` : "CODE-DRIVEN CAMPAIGN"}</p></div></div><div className="level-lockup"><strong>LEVEL_{level.number} / {level.title}</strong><span>{runtime.difficulty.toUpperCase()} MODE · INCIDENT {session.activeIncidentIndex + 1}/2</span></div>{!runtime.detachedRole && <div className="session-actions"><button type="button" className="hood-button" onClick={() => runtime.openRole("gamer")}>OPEN GAMER</button><button type="button" className="hood-button" onClick={() => runtime.openRole("coder")}>OPEN CODER</button><button type="button" className="hood-button" onClick={() => setHood(true)}>UNDER THE HOOD</button><button type="button" className="hood-button" onClick={runtime.resetLevel}>RESET LEVEL</button><button type="button" className="reset-button" onClick={runtime.exitLevel}>EXIT LEVEL</button></div>}</header>
    <div className="v3-toolbar"><Progress session={session} level={level} />{!runtime.detachedRole && <div className="focus-control"><span>ROLE FOCUS</span>{["player", "split", "coder"].map((value) => <button type="button" className={focus === value ? "active" : ""} onClick={() => setFocus(value)} key={value}>{value.toUpperCase()}</button>)}</div>}</div>
    <section className={`v3-workspace focus-${focus}`}>{runtime.detachedRole !== "coder" && <GamePanel level={level} session={session} actions={actions} />}{runtime.detachedRole !== "gamer" && <Suspense fallback={<section className="v3-role coder-panel-v3"><div className="coder-empty"><span>⌁</span><strong>LOADING CODE WORKSPACE</strong><p>Preparing the multi-file TypeScript editor.</p></div></section>}><CoderPanel level={level} session={session} actions={actions} /></Suspense>}</section>
    {hood && <UnderHood level={level} session={session} onClose={() => setHood(false)} />}
  </main>;
}
